import fs from 'fs';
import path from 'path';

export interface GuideMetadata {
  title: string;
  description: string;
  date: string;
  category: string;
  tags: string[];
  slug: string;
  image?: string;
}

export interface Guide {
  metadata: GuideMetadata;
  content: string;
  htmlContent: string;
}

const guidesDirectory = path.join(process.cwd(), 'public/content/guides');

function parseFrontmatter(fileContent: string): Omit<Guide, 'htmlContent'> {
  const match = fileContent.match(/^---\r?\n([\s\S]+?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    return {
      metadata: {
        title: "",
        description: "",
        date: "",
        category: "Local Guide",
        tags: [],
        slug: ""
      },
      content: fileContent
    };
  }

  const yamlBlock = match[1];
  const content = match[2];
  const metadata: Record<string, unknown> = {
    title: "",
    description: "",
    date: "",
    category: "Local Guide",
    tags: [],
    slug: ""
  };

  yamlBlock.split(/\r?\n/).forEach(line => {
    const parts = line.split(':');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      let val = parts.slice(1).join(':').trim();
      
      // strip quotes
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1);
      } else if (val.startsWith("'") && val.endsWith("'")) {
        val = val.slice(1, -1);
      }
      
      if (key === 'tags') {
        try {
          metadata[key] = JSON.parse(val.replace(/'/g, '"'));
        } catch {
          metadata[key] = val.split(',').map(t => t.trim().replace(/"/g, ''));
        }
      } else {
        metadata[key] = val;
      }
    }
  });

  return {
    metadata: metadata as unknown as GuideMetadata,
    content
  };
}

export function markdownToHtml(markdown: string): string {
  let html = markdown;

  // Escaping basic XML characters (excluding tags to allow markdown conversions)
  // We'll replace them line by line to prevent breaking heading tags.
  const lines = html.split(/\r?\n/);
  const processedLines: string[] = [];
  let inList = false;

  for (const line of lines) {
    const l = line.trim();
    if (!l) {
      if (inList) {
        processedLines.push('</ul>');
        inList = false;
      }
      processedLines.push('');
      continue;
    }

    // Process lists
    const listMatch = l.match(/^-\s+(.*)$/);
    if (listMatch) {
      if (!inList) {
        processedLines.push('<ul class="list-disc pl-6 my-4 space-y-2 text-zinc-300 font-sans">');
        inList = true;
      }
      // Process bold/italics inside list items
      let itemContent = listMatch[1];
      itemContent = processInlineFormatting(itemContent);
      processedLines.push(`  <li class="text-zinc-300 leading-relaxed text-lg">${itemContent}</li>`);
      continue;
    } else {
      if (inList) {
        processedLines.push('</ul>');
        inList = false;
      }
    }

    // Headings
    if (l.startsWith('### ')) {
      processedLines.push(`<h3 class="text-xl font-bold text-emerald-400 mt-6 mb-3 font-mono tracking-wide glow-text-sm">${processInlineFormatting(l.slice(4))}</h3>`);
    } else if (l.startsWith('## ')) {
      processedLines.push(`<h2 class="text-2xl font-extrabold text-emerald-400 mt-8 mb-4 border-b border-emerald-500/20 pb-2 font-mono tracking-wide glow-text-sm">${processInlineFormatting(l.slice(3))}</h2>`);
    } else if (l.startsWith('# ')) {
      processedLines.push(`<h1 class="text-3xl font-black text-emerald-300 mt-10 mb-6 font-mono tracking-wider glow-text">${processInlineFormatting(l.slice(2))}</h1>`);
    } else {
      // Standard line, just inline formatting
      processedLines.push(processInlineFormatting(line));
    }
  }

  if (inList) {
    processedLines.push('</ul>');
  }

  // Paragraph grouping
  html = processedLines.join('\n');
  const blocks = html.split(/\n\n+/);
  
  return blocks.map(block => {
    const trimmed = block.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('<h') || trimmed.startsWith('<ul') || trimmed.startsWith('<li')) {
      return trimmed;
    }
    return `<p class="my-4 text-zinc-300 leading-relaxed text-lg font-sans">${trimmed}</p>`;
  }).join('\n');
}

function processInlineFormatting(text: string): string {
  let res = text;
  
  // Escape HTML tags to protect layout
  res = res.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  // Restore common harmless html wraps if needed, but since we generate markdown, we don't need to.
  
  // Bold **
  res = res.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-emerald-200">$1</strong>');
  
  // Italics *
  res = res.replace(/\*(.*?)\*/g, '<em class="italic text-zinc-300">$1</em>');
  
  // Code block `
  res = res.replace(/`(.*?)`/g, '<code class="bg-zinc-900 border border-zinc-800 text-emerald-300 px-1.5 py-0.5 rounded font-mono text-base">$1</code>');
  
  // Links [text](url)
  res = res.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-emerald-400 hover:text-emerald-300 hover:underline underline-offset-4 decoration-emerald-500/30 transition-colors">$1</a>');

  return res;
}

export function getAllGuides(): GuideMetadata[] {
  if (!fs.existsSync(guidesDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(guidesDirectory);
  const allGuides = fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => {
      const fullPath = path.join(guidesDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { metadata } = parseFrontmatter(fileContents);
      return metadata;
    });

  // Sort guides by date descending
  return allGuides.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getGuideBySlug(slug: string): Guide | null {
  const fullPath = path.join(guidesDirectory, `${slug}.md`);
  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { metadata, content } = parseFrontmatter(fileContents);
  const htmlContent = markdownToHtml(content);

  return {
    metadata,
    content,
    htmlContent
  };
}
