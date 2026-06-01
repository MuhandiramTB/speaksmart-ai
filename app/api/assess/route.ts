import { NextRequest, NextResponse } from "next/server";
import { getGroq, MODEL_CHAT } from "@/lib/groq";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYSTEM = `You are an English assessor scoring a learner's spoken response to a placement-test question.

Reply with ONLY strict JSON in this exact shape:

{
  "vocabulary": number,      // 0-100
  "grammar": number,         // 0-100
  "fluency": number,         // 0-100
  "complexity": number,      // 0-100 (sentence variety, connectors, ideas)
  "overall": number,         // 0-100 weighted overall
  "feedback": string         // one sentence of encouraging feedback
}

Guidance:
- A1 learner: very simple short sentences. Reasonable overall is 30-50.
- A2 learner: short connected sentences. Reasonable overall is 45-60.
- B1 learner: 2-3 connected sentences with some past tense. Reasonable overall is 55-70.
- B2 learner: well-structured opinions with mostly correct grammar. Reasonable overall is 65-80.
- C1 learner: fluent, complex ideas, idiomatic. Reasonable overall is 80-95.
- Be FAIR not harsh. Reward effort. Short answers can still score well if they are correct and clear.
- Never reply with prose outside the JSON.`;

export async function POST(req: NextRequest) {
  try {
    const { question, expectedLevel, transcript } = (await req.json()) as {
      question: string;
      expectedLevel: string;
      transcript: string;
    };
    if (!transcript?.trim()) {
      return NextResponse.json({
        vocabulary: 0,
        grammar: 0,
        fluency: 0,
        complexity: 0,
        overall: 0,
        feedback: "No answer detected.",
      });
    }

    const userMsg = `Question (target level ${expectedLevel}): "${question}"

Learner's spoken answer: "${transcript}"

Score the answer.`;

    const result = await getGroq().chat.completions.create({
      model: MODEL_CHAT,
      temperature: 0.2,
      max_tokens: 250,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: userMsg },
      ],
    });

    const raw = result.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw);
    return NextResponse.json({
      vocabulary: clamp(parsed.vocabulary),
      grammar: clamp(parsed.grammar),
      fluency: clamp(parsed.fluency),
      complexity: clamp(parsed.complexity),
      overall: clamp(parsed.overall),
      feedback: typeof parsed.feedback === "string" ? parsed.feedback : "Nice effort!",
    });
  } catch (err) {
    console.error("[/api/assess] error", err);
    return NextResponse.json({
      vocabulary: 0,
      grammar: 0,
      fluency: 0,
      complexity: 0,
      overall: 0,
      feedback: "Assessment failed — please try again.",
    });
  }
}

function clamp(n: unknown): number {
  const x = typeof n === "number" ? n : Number(n);
  if (Number.isNaN(x)) return 0;
  return Math.max(0, Math.min(100, Math.round(x)));
}
