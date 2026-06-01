import { NextRequest, NextResponse } from "next/server";
import { getGroq, MODEL_CHAT } from "@/lib/groq";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYSTEM = `You are an English grammar checker. The user gives you one sentence or short utterance from a spoken-English learner. Reply ONLY with strict JSON in this exact shape:

{"isCorrect": boolean, "corrected": string, "explanation": string}

- If the input is already correct, isCorrect=true, corrected equals input, explanation is empty.
- If incorrect, isCorrect=false, corrected is the polished version, explanation is one short sentence aimed at a learner.
- Never include any prose outside the JSON.`;

export async function POST(req: NextRequest) {
  try {
    const { text } = (await req.json()) as { text: string };
    if (!text?.trim()) {
      return NextResponse.json({ isCorrect: true, corrected: "", explanation: "" });
    }

    const result = await getGroq().chat.completions.create({
      model: MODEL_CHAT,
      temperature: 0,
      max_tokens: 200,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: text },
      ],
    });

    const raw = result.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw);
    return NextResponse.json({
      isCorrect: !!parsed.isCorrect,
      corrected: parsed.corrected ?? text,
      explanation: parsed.explanation ?? "",
    });
  } catch (err) {
    console.error("[/api/grammar] error", err);
    return NextResponse.json({ isCorrect: true, corrected: "", explanation: "" });
  }
}
