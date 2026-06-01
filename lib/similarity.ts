function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[.,!?;:"'()]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(s: string): string[] {
  return normalize(s).split(" ").filter(Boolean);
}

// Levenshtein distance — small word edits like "im" vs "I'm" count as one.
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const prev: number[] = Array(n + 1)
    .fill(0)
    .map((_, i) => i);
  for (let i = 1; i <= m; i++) {
    const curr: number[] = [i];
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr.push(Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost));
    }
    for (let j = 0; j <= n; j++) prev[j] = curr[j];
  }
  return prev[n];
}

// 0-100 similarity score combining word overlap + char edit distance.
export function similarityScore(attempt: string, target: string): number {
  const a = tokens(attempt);
  const t = tokens(target);
  if (t.length === 0) return 0;

  // Word overlap (token recall on the target side).
  const tBag = new Map<string, number>();
  for (const w of t) tBag.set(w, (tBag.get(w) ?? 0) + 1);
  let matched = 0;
  for (const w of a) {
    const c = tBag.get(w);
    if (c && c > 0) {
      matched += 1;
      tBag.set(w, c - 1);
    }
  }
  const recall = matched / t.length;

  // Character-level closeness (catches transpositions, single missing words).
  const aJoined = a.join(" ");
  const tJoined = t.join(" ");
  const dist = levenshtein(aJoined, tJoined);
  const maxLen = Math.max(aJoined.length, tJoined.length, 1);
  const charSim = 1 - dist / maxLen;

  // Weighted blend favoring word recall (meaning) over exact characters.
  const blended = recall * 0.7 + Math.max(0, charSim) * 0.3;
  return Math.round(Math.max(0, Math.min(1, blended)) * 100);
}

export const PASS_THRESHOLD = 80;
