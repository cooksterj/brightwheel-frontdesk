import { embed } from "@/lib/voyage/embed";

export interface ReembedOptions {
  apiKey: string;
  fetchImpl?: typeof fetch;
}

/**
 * Embed a handbook section for storage. Uses `input_type: "document"` to
 * match the asymmetric pair used by the chat endpoint's query embeddings.
 */
export async function reembedSection(
  title: string,
  body: string,
  opts: ReembedOptions,
): Promise<number[]> {
  const [vector] = await embed([`${title}\n\n${body}`], {
    apiKey: opts.apiKey,
    model: "voyage-4-lite",
    inputType: "document",
    fetchImpl: opts.fetchImpl,
  });
  return vector;
}
