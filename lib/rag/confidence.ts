export type Confidence = "high" | "medium" | "low";

/**
 * Map the top retrieved-section cosine similarity to a categorical
 * confidence label used by the question log and the gap detector.
 *
 * Thresholds are tuned empirically against Voyage `voyage-4-lite` on the
 * Slow Cooker handbook (~300-word H2 sections). voyage-4-lite's similarity
 * distribution on short parent questions is compressed — even clear matches
 * rarely exceed 0.65:
 *   - 0.55+ is a confident topical match (clearly the right section)
 *   - 0.40–0.55 is a plausible but partial match (right area, maybe wrong angle)
 *   - below 0.40 means retrieval probably missed
 *
 * Re-run `just seed-questions` if you change these — it will reclassify
 * the existing seed rows.
 */
export function computeConfidence(
  topSimilarity: number | null | undefined,
): Confidence {
  if (typeof topSimilarity !== "number" || Number.isNaN(topSimilarity)) {
    return "low";
  }
  if (topSimilarity >= 0.55) return "high";
  if (topSimilarity >= 0.4) return "medium";
  return "low";
}
