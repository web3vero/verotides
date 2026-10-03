#!/usr/bin/env python3
"""
VeroTides Autonomous Social Publisher & Queue Manager
Integrates with the dedicated Interceptor 'verotides' context to safely dispatch
scheduled coastal telemetry posts to @Vero_Tides on X.
"""

import sys
import json
import argparse
from pathlib import Path

# Local import of validation & interceptor mechanics
from native_publisher import (
    INTERCEPTOR,
    validate_publish_payload,
    read_state,
    type_caption,
    assert_composer_contains,
    assert_published_readback,
)

QUEUE_FILE = Path(__file__).parent / "campaign_queue.json"


def load_queue():
    if not QUEUE_FILE.exists():
        raise FileNotFoundError(f"Campaign queue file missing: {QUEUE_FILE}")
    with open(QUEUE_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def save_queue(data):
    with open(QUEUE_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def list_posts():
    data = load_queue()
    posts = data.get("queued_posts", [])
    print(f"\n=======================================================")
    print(f"  VeroTides Social Campaign Queue: {data.get('target_account')}")
    print(f"  Total Queued Posts: {len(posts)} | Website: {data.get('website')}")
    print(f"=======================================================\n")

    for p in posts:
        media_exists = Path(p.get("media", "")).exists()
        media_status = "✓ READY" if media_exists else "✗ MISSING"
        media_name = Path(p.get("media", "")).name if p.get("media") else "No media"
        first_line = p.get("text", "").splitlines()[0] if p.get("text") else ""

        print(f"[{p.get('id')}] State: {p.get('state', 'staged')} | Pillar: {p.get('pillar')}")
        print(f"       Media: {media_name} ({media_status})")
        print(f"       Copy:  {first_line[:75]}...\n")


def show_post(post_id: str):
    data = load_queue()
    posts = [p for p in data.get("queued_posts", []) if p.get("id") == post_id]
    if not posts:
        print(f"Error: Post ID '{post_id}' not found.")
        sys.exit(1)

    p = posts[0]
    media_path = Path(p.get("media", ""))

    print(f"\n--- Post Details: {p.get('id')} ---")
    print(f"Pillar: {p.get('pillar')}")
    print(f"Type:   {p.get('type')}")
    print(f"State:  {p.get('state')}")
    print(f"Media:  {media_path} ({'EXISTS' if media_path.exists() else 'MISSING'})")
    print(f"Length: {len(p.get('text', ''))} characters")
    print(f"\n[POST CONTENT]:\n{p.get('text')}\n")


def validate_all():
    data = load_queue()
    posts = data.get("queued_posts", [])
    errors = 0

    print(f"\nValidating {len(posts)} queued posts...")
    for p in posts:
        pid = p.get("id")
        text = p.get("text", "")
        media = p.get("media", "")

        try:
            validate_publish_payload(text, media, approved_domain="verotides.com")
            print(f"  ✓ {pid}: PASS (Copy, Link, and Media verified)")
        except Exception as e:
            print(f"  ✗ {pid}: FAIL -> {e}")
            errors += 1

    if errors == 0:
        print("\nAll queued posts passed fail-closed validation!\n")
    else:
        print(f"\nValidation failed with {errors} error(s).\n")
        sys.exit(1)


def publish_post(post_id: str, dry_run: bool = False):
    import subprocess
    import time

    data = load_queue()
    posts = [p for p in data.get("queued_posts", []) if p.get("id") == post_id]
    if not posts:
        print(f"Error: Post ID '{post_id}' not found.")
        sys.exit(1)

    p = posts[0]
    text = p.get("text", "")
    media_path = Path(p.get("media", "")).resolve()

    # Pre-flight validation
    validate_publish_payload(text, str(media_path), approved_domain="verotides.com")
    print(f"\n🚀 Ready to publish {post_id} to @Vero_Tides...")

    if dry_run:
        print("Dry run mode: validated payload, skipping browser injection.")
        return

    # 1. Open X Composer in verotides Interceptor context
    print("Navigating to X composer via Interceptor...")
    subprocess.run([INTERCEPTOR, "--context", "verotides", "open", "https://x.com/compose/post"], check=True)
    time.sleep(3)

    # 2. Locate Textbox Ref
    res_state = subprocess.run([INTERCEPTOR, "--context", "verotides", "state"], capture_output=True, text=True, check=True)
    textbox_ref = None
    for line in res_state.stdout.splitlines():
        if 'textbox "Post text"' in line or 'role="textbox"' in line:
            parts = line.strip().split()
            if parts and parts[0].startswith("[e"):
                textbox_ref = parts[0].strip("[]")
                break

    if not textbox_ref:
        raise RuntimeError("Publish blocked: X composer textbox was not found")

    print(f"Writing caption into ref [{textbox_ref}]...")
    type_caption("verotides", textbox_ref, text)
    time.sleep(2)
    assert_composer_contains(read_state("verotides"), text, "before-media-upload")

    # 3. Attach Media
    res_verify = subprocess.run([INTERCEPTOR, "--context", "verotides", "state"], capture_output=True, text=True, check=True)
    file_input_ref = None
    for line in res_verify.stdout.splitlines():
        if 'type="file"' in line and '[e' in line:
            parts = line.strip().split()
            if parts and parts[0].startswith("[e"):
                file_input_ref = parts[0].strip("[]")
                break

    if not file_input_ref:
        raise RuntimeError("Publish blocked: X file input element was not found")

    print(f"Uploading media: {media_path.name} via [{file_input_ref}]...")
    upload = subprocess.run(
        [INTERCEPTOR, "--context", "verotides", "upload", file_input_ref, str(media_path)],
        capture_output=True,
        text=True,
    )
    if upload.returncode != 0:
        raise RuntimeError(f"Publish blocked: media upload failed: {upload.stderr}")
    time.sleep(4)
    assert_composer_contains(read_state("verotides"), text, "after-media-upload")

    # 4. Submit
    res_final = subprocess.run([INTERCEPTOR, "--context", "verotides", "state"], capture_output=True, text=True, check=True)
    post_button_ref = None
    for line in res_final.stdout.splitlines():
        if 'button "Post"' in line or ('button' in line and 'Post' in line and 'role="button"' in line):
            parts = line.strip().split()
            if parts and parts[0].startswith("[e"):
                post_button_ref = parts[0].strip("[]")
                break

    if not post_button_ref:
        raise RuntimeError("Publish blocked: active X Post button was not found")

    print(f"Submitting post via [{post_button_ref}]...")
    subprocess.run([INTERCEPTOR, "--context", "verotides", "click", post_button_ref], check=True)
    time.sleep(5)
    assert_published_readback(read_state("verotides"), text)

    # 5. Update queue state
    p["state"] = "published"
    p["published_at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    save_queue(data)
    print(f"✅ {post_id} published successfully and marked in queue.")


def main():
    parser = argparse.ArgumentParser(description="VeroTides Social Media Publisher")
    parser.add_argument("--list", action="store_true", help="List all queued posts")
    parser.add_argument("--show", type=str, help="Show details for a specific post ID")
    parser.add_argument("--validate", action="store_true", help="Validate all queued posts")
    parser.add_argument("--publish", type=str, help="Publish a specific post ID")
    parser.add_argument("--dry-run", action="store_true", help="Dry-run validation without sending")

    args = parser.parse_args()

    if args.list:
        list_posts()
    elif args.show:
        show_post(args.show)
    elif args.validate:
        validate_all()
    elif args.publish:
        publish_post(args.publish, dry_run=args.dry_run)
    else:
        list_posts()


if __name__ == "__main__":
    main()
