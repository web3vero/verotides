#!/usr/bin/env python3
"""
Universal Interceptor Native Media Publisher & Visual QA Validator
Line-Break Safe Version: Uses line-by-line typing or Shift+Enter injection to preserve exact newlines.
"""

import os
import sys
import json
import time
import subprocess
import html
import re
from pathlib import Path

INTERCEPTOR = "/home/mike/.local/bin/interceptor"


def validate_publish_payload(text: str, media_path: str | None = None, *,
                             no_link_required: bool = False,
                             approved_domain: str | None = None) -> None:
    """Fail closed before X can accept a media-only or self-link post."""
    if not isinstance(text, str) or not text.strip():
        raise ValueError("publish blocked: caption is empty")
    if text.lstrip().startswith("post-"):
        raise ValueError("publish blocked: queue id was supplied as caption")
    if media_path and not Path(media_path).exists():
        raise ValueError(f"publish blocked: media file does not exist: {media_path}")
    if not no_link_required and approved_domain:
        urls = re.findall(r"https?://[^\s]+", text)
        if not any(approved_domain.lower() in url.lower() for url in urls):
            raise ValueError(f"publish blocked: caption must contain an approved {approved_domain} destination URL")
    if re.search(r"https?://(?:t\.co|x\.com|twitter\.com)/", text, re.I):
        raise ValueError("publish blocked: X/media permalink cannot be used as caption")


def read_state(context: str) -> str:
    result = subprocess.run(
        [INTERCEPTOR, "--context", context, "state"],
        capture_output=True, text=True, check=True,
    )
    return result.stdout


def assert_composer_contains(state_output: str, text: str, phase: str) -> None:
    """Require the live DOM snapshot to contain the intended caption."""
    observed = re.sub(r"\s+", "", html.unescape(state_output)).lower()
    expected_lines = [line.strip() for line in text.splitlines() if line.strip()]
    if not expected_lines:
        raise ValueError(f"publish blocked at {phase}: empty caption")
    # A DOM snapshot may truncate long values; require the first meaningful line
    # and the destination URL, which catches cleared/rerendered composers.
    anchor = re.sub(r"\s+", "", html.unescape(expected_lines[0])).lower()
    url_match = re.search(r"https?://[^\s]+", text)
    if anchor not in observed:
        raise ValueError(f"publish blocked at {phase}: live composer lost the caption")
    if url_match:
        url = re.sub(r"\s+", "", url_match.group(0)).lower()
        if url not in observed:
            raise ValueError(f"publish blocked at {phase}: live composer lost the destination URL")


def assert_published_readback(state_output: str, text: str) -> None:
    """Require the rendered X result to contain copy, destination, and media."""
    assert_composer_contains(state_output, text, "post-readback")
    observed = re.sub(r"\s+", "", html.unescape(state_output)).lower()
    if not re.search(r"image|media|photo|attachment", observed):
        raise ValueError("publish blocked at post-readback: expected media attachment was not visible")


def type_caption(context: str, textbox_ref: str, text: str) -> None:
    """Type line-by-line so X's rich composer does not drop the payload on rerender."""
    lines = text.split("\n")
    for i, line in enumerate(lines):
        if line:
            subprocess.run(
                [INTERCEPTOR, "--context", context, "act", textbox_ref, line],
                check=True,
            )
            time.sleep(0.5)
        if i < len(lines) - 1:
            newline = subprocess.run(
                [INTERCEPTOR, "--context", context, "act", textbox_ref, "\n"],
                capture_output=True, text=True,
            )
            if newline.returncode != 0:
                raise RuntimeError(f"publish blocked: newline injection failed: {newline.stderr}")
            time.sleep(0.3)

def parse_args():
    if len(sys.argv) < 3:
        print("Usage: native_publisher.py <context_id> <queue_json_or_text> <post_id_or_media_path>", file=sys.stderr)
        sys.exit(1)

    context = sys.argv[1]
    arg2 = sys.argv[2]
    arg3 = sys.argv[3] if len(sys.argv) > 3 else None

    if arg2.endswith(".json") and Path(arg2).exists():
        queue_path = Path(arg2)
        post_id = arg3
        
        with open(queue_path, "r", encoding="utf-8") as f:
            queue_data = json.load(f)
            
        posts = queue_data.get("queued_posts", [])
        target_post = None
        for p in posts:
            if p.get("id") == post_id:
                target_post = p
                break
                
        if not target_post:
            print(f"❌ Error: Post ID '{post_id}' not found in {queue_path}!", file=sys.stderr)
            sys.exit(1)
            
        text = target_post.get("text")
        media_path = target_post.get("media")
        
        if not text:
            print(f"❌ Error: Post '{post_id}' has no text field!", file=sys.stderr)
            sys.exit(1)
            
        return context, text, media_path

    text = arg2
    media_path = arg3
    return context, text, media_path

def publish_native_post(context: str, text: str, media_path: str = None):
    print(f"🚀 [INTERCEPTOR NATIVE PUBLISHER & QA] Target Context: {context}")
    print(f"📝 Intended Copy ({len(text)} chars):\n{text}\n")
    
    try:
        validate_publish_payload(
            text,
            media_path,
            approved_domain="verotides.com" if context == "verotides" else None,
        )
    except ValueError as exc:
        print(f"❌ {exc}", file=sys.stderr)
        sys.exit(1)

    if media_path:
        m_path = Path(media_path)
        print(f"🖼️ Native Media File: {m_path.name} ({m_path.stat().st_size} bytes)")

    # Step 1: Open X post composer
    cmd_open = [INTERCEPTOR, "--context", context, "open", "https://x.com/compose/post"]
    print("Executing composer navigation...")
    res = subprocess.run(cmd_open, capture_output=True, text=True)
    if res.returncode != 0:
        print(f"❌ Failed to open composer tab: {res.stderr}", file=sys.stderr)
        sys.exit(1)

    time.sleep(3)

    # Step 2: Get state & locate textbox
    res_state = subprocess.run([INTERCEPTOR, "--context", context, "state"], capture_output=True, text=True)
    state_out = res_state.stdout

    textbox_ref = None
    for line in state_out.splitlines():
        if 'textbox "Post text"' in line or 'role="textbox"' in line:
            parts = line.strip().split()
            if parts and parts[0].startswith("[e"):
                textbox_ref = parts[0].strip("[]")
                break

    if not textbox_ref:
        print("❌ CRITICAL: Could not locate X post textbox element!", file=sys.stderr)
        sys.exit(1)

    print(f"🎯 Target Textbox Element: [{textbox_ref}]")

    # Step 3: Line-by-Line multiline safe typing
    type_caption(context, textbox_ref, text)

    time.sleep(2)
    try:
        assert_composer_contains(read_state(context), text, "before-media-upload")
    except ValueError as exc:
        print(f"❌ {exc}", file=sys.stderr)
        sys.exit(1)

    # Step 4: Native Media Handling
    res_verify = subprocess.run([INTERCEPTOR, "--context", context, "state"], capture_output=True, text=True)
    if media_path:
        file_input_ref = None
        for line in res_verify.stdout.splitlines():
            if 'type="file"' in line and '[e' in line:
                parts = line.strip().split()
                if parts and parts[0].startswith("[e"):
                    file_input_ref = parts[0].strip("[]")

        print(f"🖼️ Uploading native file via element [{file_input_ref or 'file input'}]...")
        if not file_input_ref:
            print("❌ publish blocked: X file input was not found", file=sys.stderr)
            sys.exit(1)
        upload = subprocess.run(
            [INTERCEPTOR, "--context", context, "upload", file_input_ref, str(Path(media_path).absolute())],
            capture_output=True, text=True,
        )
        if upload.returncode != 0:
            print(f"❌ publish blocked: media upload failed: {upload.stderr}", file=sys.stderr)
            sys.exit(1)
        time.sleep(4)

    try:
        assert_composer_contains(read_state(context), text, "after-media-upload")
    except ValueError as exc:
        print(f"❌ {exc}", file=sys.stderr)
        sys.exit(1)

    # Step 5: Post Submission
    res_final_state = subprocess.run([INTERCEPTOR, "--context", context, "state"], capture_output=True, text=True)
    post_button_ref = None
    for line in res_final_state.stdout.splitlines():
        if 'button "Post"' in line or ('button' in line and 'Post' in line and 'role="button"' in line):
            parts = line.strip().split()
            if parts and parts[0].startswith("[e"):
                post_button_ref = parts[0].strip("[]")

    if not post_button_ref:
        print("❌ CRITICAL: Could not locate active Post button!", file=sys.stderr)
        sys.exit(1)

    print(f"🚀 Final Submission via Post button [{post_button_ref}]...")
    subprocess.run([INTERCEPTOR, "--context", context, "click", post_button_ref], check=True)
    time.sleep(5)
    try:
        assert_published_readback(read_state(context), text)
    except ValueError as exc:
        print(f"❌ {exc}", file=sys.stderr)
        sys.exit(1)
    print("✅ X submission passed independent text, URL, and media read-back.")

if __name__ == "__main__":
    ctx, txt, med = parse_args()
    publish_native_post(ctx, txt, med)
