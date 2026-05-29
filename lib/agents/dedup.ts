/**
 * Cheap title-similarity utilities for topic-repetition prevention.
 * Jaccard overlap over normalised word sets — good enough to catch
 * "Best AI Note Apps" vs "The Best AI Note-Taking Apps".
 */

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "for", "to", "of", "in", "on", "with", "your",
  "you", "is", "are", "best", "top", "how", "what", "why", "guide", "ways",
  "things", "that", "this", "from", "vs", "2024", "2025", "2026",
]);

export function tokenizeTitle(title: string): string[] {
  return Array.from(
    new Set(
      title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length > 2 && !STOPWORDS.has(w))
    )
  );
}

export function jaccard(a: string[], b: string[]): number {
  if (!a.length || !b.length) return 0;
  const sa = new Set(a);
  const sb = new Set(b);
  let inter = 0;
  for (const x of sa) if (sb.has(x)) inter++;
  return inter / (sa.size + sb.size - inter);
}

/** True if `tokens` overlaps any prior token set above the threshold. */
export function isDuplicate(
  tokens: string[],
  history: string[][],
  threshold: number
): boolean {
  return history.some((h) => jaccard(tokens, h) >= threshold);
}
