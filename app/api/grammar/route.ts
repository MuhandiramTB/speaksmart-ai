import { NextRequest, NextResponse } from "next/server";
import { getGroq, MODEL_CHAT } from "@/lib/groq";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYSTEM = `You are SpeakSmart, a warm and encouraging English-language tutor reviewing one short utterance from a spoken-English learner.

Reply with ONLY strict JSON in this exact shape — no prose outside the JSON:

{
  "isCorrect": boolean,
  "corrected": string,
  "errorType": string,
  "rule": string,
  "explanation": string,
  "examples": [string, string, string],
  "encouragement": string
}

Field meanings:
- "isCorrect": true if the utterance is already grammatically natural English, false otherwise. Be lenient with casual/spoken English — only mark false for clear mistakes a tutor would correct.
- "corrected": the polished, natural version. If isCorrect=true, copy the input exactly.
- "errorType": short label for the mistake category. Pick from: "Preposition", "Verb tense", "Subject-verb agreement", "Article", "Word order", "Pronoun", "Plural/singular", "Word choice", "Spelling", "Punctuation", "Capitalization", "None". Use "None" if isCorrect=true.
- "rule": one short sentence stating the grammar rule in learner-friendly language. Empty string if isCorrect=true.
- "explanation": one warm, encouraging sentence explaining the specific fix for THIS utterance. Empty string if isCorrect=true.
- "examples": exactly 3 short example sentences (3-8 words each) showing the correct pattern. Empty array if isCorrect=true.
- "encouragement": a brief, warm one-line message (e.g. "Great effort!" or "Almost perfect!"). Always include this.

Tone: warm, patient, celebrating effort. Never make the learner feel bad. Examples should be natural everyday English.`;

const FEW_SHOT = [
  {
    input: "Hi, can you support me for my spoken English knowledge?",
    output: {
      isCorrect: false,
      corrected: "Hi, can you help me with my spoken English?",
      errorType: "Word choice",
      rule: "In everyday English we use 'help me with' rather than 'support me for' when asking for assistance.",
      explanation: "'Support' sounds formal here — 'help me with' is the natural way to ask for assistance with a skill.",
      examples: [
        "Can you help me with my homework?",
        "Could you help me with this problem?",
        "I'd like help with my pronunciation.",
      ],
      encouragement: "Great question — and you'll sound very natural with this small change!",
    },
  },
  {
    input: "Yesterday I go to the market.",
    output: {
      isCorrect: false,
      corrected: "Yesterday I went to the market.",
      errorType: "Verb tense",
      rule: "Use the past tense (went) when the action happened in the past.",
      explanation: "Because you said 'yesterday', the verb must be in past tense — 'go' becomes 'went'.",
      examples: [
        "Yesterday I went home early.",
        "Last week she went to Paris.",
        "We went shopping this morning.",
      ],
      encouragement: "Nice — you got the time word right, just a tiny verb tweak!",
    },
  },
  {
    input: "I am very happy to meet you.",
    output: {
      isCorrect: true,
      corrected: "I am very happy to meet you.",
      errorType: "None",
      rule: "",
      explanation: "",
      examples: [],
      encouragement: "Perfect — that sounds completely natural!",
    },
  },
];

export async function POST(req: NextRequest) {
  try {
    const { text } = (await req.json()) as { text: string };
    if (!text?.trim()) {
      return NextResponse.json(emptyResult(""));
    }

    const messages = [
      { role: "system" as const, content: SYSTEM },
      ...FEW_SHOT.flatMap((ex) => [
        { role: "user" as const, content: ex.input },
        { role: "assistant" as const, content: JSON.stringify(ex.output) },
      ]),
      { role: "user" as const, content: text },
    ];

    const result = await getGroq().chat.completions.create({
      model: MODEL_CHAT,
      temperature: 0.2,
      max_tokens: 500,
      response_format: { type: "json_object" },
      messages,
    });

    const raw = result.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw);

    return NextResponse.json({
      isCorrect: !!parsed.isCorrect,
      corrected: typeof parsed.corrected === "string" ? parsed.corrected : text,
      errorType: typeof parsed.errorType === "string" ? parsed.errorType : "None",
      rule: typeof parsed.rule === "string" ? parsed.rule : "",
      explanation: typeof parsed.explanation === "string" ? parsed.explanation : "",
      examples: Array.isArray(parsed.examples) ? parsed.examples.slice(0, 3) : [],
      encouragement:
        typeof parsed.encouragement === "string" && parsed.encouragement
          ? parsed.encouragement
          : "Keep going!",
    });
  } catch (err) {
    console.error("[/api/grammar] error", err);
    return NextResponse.json(emptyResult(""));
  }
}

function emptyResult(text: string) {
  return {
    isCorrect: true,
    corrected: text,
    errorType: "None",
    rule: "",
    explanation: "",
    examples: [] as string[],
    encouragement: "Keep going!",
  };
}
