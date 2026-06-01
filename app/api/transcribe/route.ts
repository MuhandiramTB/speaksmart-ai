import { NextRequest, NextResponse } from "next/server";
import { getGroq, MODEL_STT } from "@/lib/groq";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type WhisperSegment = {
  text?: string;
  avg_logprob?: number;
  no_speech_prob?: number;
  compression_ratio?: number;
};

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    const result = (await getGroq().audio.transcriptions.create({
      file,
      model: MODEL_STT,
      response_format: "verbose_json",
      language: "en",
      temperature: 0,
    })) as unknown as { text: string; segments?: WhisperSegment[] };

    const transcript = (result.text ?? "").trim();
    const segments = result.segments ?? [];

    const score = scoreFromSegments(segments);
    const weakWords = pickWeakWords(transcript, segments);

    return NextResponse.json({
      transcript,
      pronunciationScore: score,
      weakWords,
    });
  } catch (err) {
    console.error("[/api/transcribe] error", err);
    const message = err instanceof Error ? err.message : "Transcription failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function scoreFromSegments(segments: WhisperSegment[]): number {
  if (segments.length === 0) return 75;
  const avgLogprob =
    segments.reduce((s, x) => s + (x.avg_logprob ?? 0), 0) / segments.length;
  const speechPenalty =
    segments.reduce((s, x) => s + (x.no_speech_prob ?? 0), 0) / segments.length;
  const raw = 100 + avgLogprob * 50 - speechPenalty * 30;
  return Math.max(0, Math.min(100, Math.round(raw)));
}

function pickWeakWords(transcript: string, segments: WhisperSegment[]): string[] {
  const weak = new Set<string>();
  const threshold = -0.6;
  for (const seg of segments) {
    if ((seg.avg_logprob ?? 0) < threshold && seg.text) {
      seg.text
        .replace(/[.,!?;:"]/g, "")
        .split(/\s+/)
        .filter((w) => w.length > 2)
        .slice(0, 3)
        .forEach((w) => weak.add(w.toLowerCase()));
    }
  }
  if (weak.size === 0) {
    const words = transcript.replace(/[.,!?;:"]/g, "").split(/\s+/).filter((w) => w.length > 4);
    if (words.length > 6) weak.add(words[Math.floor(words.length / 2)].toLowerCase());
  }
  return Array.from(weak).slice(0, 5);
}
