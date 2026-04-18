export interface HandbookChunk {
  slug: string;
  title: string;
  body: string;
}

const FRONTMATTER = /^---\n[\s\S]*?\n---\n?/;
const H2 = /^##\s+(.+?)\s*$/;

/** Kebab-case a heading. Preserves letters, numbers, hyphens. */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Split a handbook markdown document into H2-delimited chunks. YAML
 * frontmatter and any preamble before the first H2 are discarded. Trailing
 * horizontal rules and whitespace inside a body are trimmed.
 */
export function chunkHandbook(markdown: string): HandbookChunk[] {
  const stripped = markdown.replace(FRONTMATTER, "");
  const lines = stripped.split("\n");

  const chunks: HandbookChunk[] = [];
  let currentTitle: string | null = null;
  let currentBody: string[] = [];

  const flush = () => {
    if (currentTitle === null) return;
    const body = currentBody.join("\n").replace(/\s+$/g, "").trim();
    if (body.length > 0) {
      chunks.push({
        slug: slugify(currentTitle),
        title: currentTitle,
        body,
      });
    }
  };

  for (const line of lines) {
    const match = line.match(H2);
    if (match) {
      flush();
      currentTitle = match[1].trim();
      currentBody = [];
    } else if (currentTitle !== null) {
      currentBody.push(line);
    }
  }
  flush();

  return chunks;
}
