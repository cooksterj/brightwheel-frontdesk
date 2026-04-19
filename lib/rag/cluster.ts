export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(
      `cosineSimilarity: dim mismatch (${a.length} vs ${b.length})`,
    );
  }
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  if (denom === 0) return 0;
  return dot / denom;
}

export interface Clusterable {
  id: string;
  embedding: number[];
}

export interface Cluster<T extends Clusterable> {
  id: number;
  members: T[];
  size: number;
}

/**
 * Connected-components clustering by cosine similarity.
 *
 * Two items are grouped if their similarity is ≥ threshold. Transitive:
 * A-B edge + B-C edge puts A, B, C in one cluster even without an A-C edge.
 *
 * O(N²) — fine for up to a few hundred items (our use case is tens of
 * unresolved questions per admin visit). Swap for approximate-NN at scale.
 */
export function clusterBySimilarity<T extends Clusterable>(
  items: T[],
  threshold = 0.7,
): Cluster<T>[] {
  const n = items.length;
  const clusterId = new Array<number>(n).fill(-1);
  let nextId = 0;

  for (let i = 0; i < n; i++) {
    if (clusterId[i] !== -1) continue;
    clusterId[i] = nextId;
    const queue: number[] = [i];
    while (queue.length > 0) {
      const k = queue.shift()!;
      for (let j = 0; j < n; j++) {
        if (clusterId[j] !== -1) continue;
        const sim = cosineSimilarity(items[k].embedding, items[j].embedding);
        if (sim >= threshold) {
          clusterId[j] = nextId;
          queue.push(j);
        }
      }
    }
    nextId++;
  }

  const groups: T[][] = Array.from({ length: nextId }, () => []);
  for (let i = 0; i < n; i++) groups[clusterId[i]].push(items[i]);
  return groups.map((members, id) => ({ id, members, size: members.length }));
}

/**
 * Turn a pgvector value into a plain number[]. Supabase's JS client returns
 * the column as either an array or a '[0.1,0.2,…]' string depending on
 * version — accept both.
 */
export function parseVector(raw: unknown): number[] | null {
  if (Array.isArray(raw) && raw.every((x) => typeof x === "number")) {
    return raw as number[];
  }
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.every((x) => typeof x === "number")
        ? (parsed as number[])
        : null;
    } catch {
      return null;
    }
  }
  return null;
}
