/**
 * Extract a single JSON object from text that may include prose surrounding
 * it (common with LLM outputs). Returns null on any failure.
 */
export function extractJsonObject(
  text: string,
): Record<string, unknown> | null {
  const trimmed = text.trim();
  try {
    const direct = JSON.parse(trimmed);
    return isPlainObject(direct) ? direct : null;
  } catch {}
  const match = trimmed.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[0]);
    return isPlainObject(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}
