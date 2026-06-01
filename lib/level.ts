export type CEFR = "A1" | "A2" | "B1" | "B2" | "C1";

export type LevelInfo = {
  code: CEFR;
  label: string;
  shortDescription: string;
  longDescription: string;
  color: string; // tailwind color token
  emoji: string;
  minScore: number; // inclusive lower bound on the 0-100 mastery scale
};

// Mastery is a continuous 0-100 number. CEFR is derived from it.
export const LEVELS: LevelInfo[] = [
  {
    code: "A1",
    label: "Starter",
    shortDescription: "Basic words and phrases.",
    longDescription:
      "You can greet, introduce yourself, and use everyday phrases. Speaking is slow and short.",
    color: "rose",
    emoji: "🌱",
    minScore: 0,
  },
  {
    code: "A2",
    label: "Elementary",
    shortDescription: "Simple everyday topics.",
    longDescription:
      "You can talk about routines, family, shopping, and basic needs in short sentences.",
    color: "orange",
    emoji: "🌿",
    minScore: 25,
  },
  {
    code: "B1",
    label: "Intermediate",
    shortDescription: "Hold a real conversation.",
    longDescription:
      "You can describe experiences, give opinions, and handle most travel/work situations.",
    color: "amber",
    emoji: "🌳",
    minScore: 45,
  },
  {
    code: "B2",
    label: "Upper-Intermediate",
    shortDescription: "Confident in most situations.",
    longDescription:
      "You can join professional meetings, argue a viewpoint, and speak with mostly correct grammar.",
    color: "brand",
    emoji: "🚀",
    minScore: 65,
  },
  {
    code: "C1",
    label: "Advanced",
    shortDescription: "Fluent and precise.",
    longDescription:
      "You speak fluently with natural rhythm, idiomatic expressions, and complex ideas.",
    color: "indigo",
    emoji: "⭐",
    minScore: 82,
  },
];

export function levelFromScore(score: number): LevelInfo {
  let current = LEVELS[0];
  for (const l of LEVELS) {
    if (score >= l.minScore) current = l;
  }
  return current;
}

export function nextLevel(current: CEFR): LevelInfo | null {
  const idx = LEVELS.findIndex((l) => l.code === current);
  if (idx === -1 || idx === LEVELS.length - 1) return null;
  return LEVELS[idx + 1];
}

export function progressWithinLevel(score: number): { current: LevelInfo; next: LevelInfo | null; pct: number } {
  const current = levelFromScore(score);
  const next = nextLevel(current.code);
  if (!next) return { current, next: null, pct: 100 };
  const span = next.minScore - current.minScore;
  const into = score - current.minScore;
  return { current, next, pct: Math.max(0, Math.min(100, Math.round((into / span) * 100))) };
}

// Combine pronunciation (0-100) and grammar accuracy (0-100) from a single utterance.
export function utteranceMastery(opts: {
  pronunciation: number;
  grammarCorrect: boolean;
}): number {
  const grammar = opts.grammarCorrect ? 100 : 55;
  return Math.round(opts.pronunciation * 0.6 + grammar * 0.4);
}

// Aggregate session mastery from utterance masteries (simple average, clipped).
export function sessionMastery(utterances: number[]): number {
  if (utterances.length === 0) return 0;
  const sum = utterances.reduce((a, b) => a + b, 0);
  return Math.max(0, Math.min(100, Math.round(sum / utterances.length)));
}

// Exponentially-weighted update so a single bad session doesn't tank the level.
export function updateMastery(prev: number, sessionScore: number, weight = 0.2): number {
  return Math.round(prev * (1 - weight) + sessionScore * weight);
}

// CEFR placement-test questions of increasing difficulty.
export type AssessmentQuestion = {
  id: string;
  level: CEFR;
  prompt: string;
  hint: string;
};

export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  {
    id: "q1",
    level: "A1",
    prompt: "Hi! Can you tell me your name and where you are from?",
    hint: "A simple introduction. 1–2 sentences is enough.",
  },
  {
    id: "q2",
    level: "A2",
    prompt: "What do you usually do on a normal weekday?",
    hint: "Describe your routine. Try to use words like 'usually', 'every', 'after'.",
  },
  {
    id: "q3",
    level: "B1",
    prompt: "Tell me about something you did last weekend that you enjoyed.",
    hint: "Use the past tense. Aim for 2–4 sentences with some detail.",
  },
  {
    id: "q4",
    level: "B1",
    prompt: "What kind of work do you do, and what is your favorite part of the job?",
    hint: "Talk about your role, your tasks, and what you like most.",
  },
  {
    id: "q5",
    level: "B2",
    prompt:
      "Imagine your manager asks you to take on extra work but your plate is full. How would you respond professionally?",
    hint: "Try polite phrases like 'I'd love to help, however…' or 'Could we prioritize…'",
  },
  {
    id: "q6",
    level: "C1",
    prompt:
      "Some companies are moving fully remote. What are the strongest arguments for and against this trend?",
    hint: "Compare both sides. Try to use linking words like 'however', 'on the other hand', 'in addition'.",
  },
];
