const VOYAGE_URL = "https://api.voyageai.com/v1/embeddings";

export type VoyageModel =
  | "voyage-4-lite"
  | "voyage-4"
  | "voyage-4-large"
  | "voyage-3"
  | "voyage-3-lite";

export type VoyageInputType = "document" | "query";

export interface EmbedOptions {
  apiKey: string;
  model?: VoyageModel;
  inputType?: VoyageInputType;
  fetchImpl?: typeof fetch;
}

interface VoyageResponse {
  data: Array<{ embedding: number[]; index: number }>;
  model: string;
  usage: { total_tokens: number };
}

/**
 * Embed one or more strings using Voyage AI. Returns one vector per input,
 * in the same order as the input array.
 *
 * Use `inputType: "document"` when embedding corpus text (handbook sections),
 * and `inputType: "query"` when embedding a user's question — Voyage applies
 * a slight prefix on each side to improve retrieval asymmetry.
 */
export async function embed(
  inputs: string | string[],
  opts: EmbedOptions,
): Promise<number[][]> {
  if (!opts.apiKey) {
    throw new Error("embed: apiKey is required");
  }
  const f = opts.fetchImpl ?? fetch;
  const payload = {
    input: inputs,
    model: opts.model ?? "voyage-4-lite",
    input_type: opts.inputType ?? "document",
  };
  const res = await f(VOYAGE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${opts.apiKey}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `embed: Voyage responded ${res.status} ${res.statusText}${text ? ` — ${text}` : ""}`,
    );
  }
  const body = (await res.json()) as VoyageResponse;
  return body.data
    .slice()
    .sort((a, b) => a.index - b.index)
    .map((d) => d.embedding);
}
