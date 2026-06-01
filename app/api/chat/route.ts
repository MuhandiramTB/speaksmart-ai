import { NextRequest } from "next/server";
import { getGroq, MODEL_CHAT } from "@/lib/groq";
import { buildTutorSystemPrompt } from "@/lib/prompts/tutor";
import { getScenarioById } from "@/lib/scenarios";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ChatBody = {
  scenarioId: string;
  level?: "beginner" | "intermediate" | "advanced";
  accent?: "US" | "UK" | "AU";
  tutorId?: string;
  messages: { role: "user" | "assistant"; content: string }[];
};

export async function POST(req: NextRequest) {
  const body = (await req.json()) as ChatBody;
  const scenario = getScenarioById(body.scenarioId);
  const systemPrompt = buildTutorSystemPrompt({
    scenario,
    level: body.level,
    accent: body.accent,
    tutorId: body.tutorId,
  });

  const stream = await getGroq().chat.completions.create({
    model: MODEL_CHAT,
    stream: true,
    temperature: 0.7,
    max_tokens: 200,
    messages: [
      { role: "system", content: systemPrompt },
      ...body.messages,
    ],
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const token = chunk.choices[0]?.delta?.content;
          if (token) controller.enqueue(encoder.encode(token));
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
