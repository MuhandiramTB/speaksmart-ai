"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, RotateCcw, CheckCircle2 } from "lucide-react";
import { MicButton } from "@/components/practice/MicButton";
import { TutorAvatar, type AvatarState } from "@/components/practice/TutorAvatar";
import { speak, stopSpeaking, useIsSpeaking } from "@/lib/tts";
import { useLevel, useSettings } from "@/lib/store";
import { ASSESSMENT_QUESTIONS, levelFromScore } from "@/lib/level";

type Score = {
  vocabulary: number;
  grammar: number;
  fluency: number;
  complexity: number;
  overall: number;
  feedback: string;
};

export default function AssessmentPage() {
  const [step, setStep] = useState(0);
  const [transcripts, setTranscripts] = useState<string[]>([]);
  const [scores, setScores] = useState<Score[]>([]);
  const [phase, setPhase] = useState<"intro" | "ask" | "transcribing" | "scoring" | "review" | "done">("intro");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [micStatus, setMicStatus] = useState<"idle" | "requesting" | "recording" | "processing" | "error">("idle");

  const isSpeaking = useIsSpeaking();
  const voiceName = useSettings((s) => s.voiceName);
  const ttsMuted = useSettings((s) => s.ttsMuted);
  const setFromAssessment = useLevel((s) => s.setFromAssessment);
  const resetLevel = useLevel((s) => s.reset);

  const q = ASSESSMENT_QUESTIONS[step];
  const isLast = step === ASSESSMENT_QUESTIONS.length - 1;

  const speakQuestion = useCallback(
    (text: string) => {
      if (ttsMuted) return;
      speak(text, { voiceName: voiceName ?? undefined });
    },
    [ttsMuted, voiceName]
  );

  useEffect(() => {
    if (phase === "ask" && q) speakQuestion(q.prompt);
  }, [phase, q, speakQuestion]);

  let avatarState: AvatarState = "idle";
  if (micStatus === "recording") avatarState = "listening";
  else if (phase === "transcribing" || phase === "scoring") avatarState = "thinking";
  else if (isSpeaking) avatarState = "speaking";

  async function handleAudio(blob: Blob, mimeType: string) {
    setPhase("transcribing");
    setErrorMsg(null);
    const fd = new FormData();
    fd.append("file", blob, mimeType.includes("mp4") ? "audio.mp4" : "audio.webm");
    let transcript = "";
    try {
      const res = await fetch("/api/transcribe", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Could not transcribe — try again.");
      const json = (await res.json()) as { transcript: string };
      transcript = json.transcript.trim();
    } catch (err) {
      setPhase("ask");
      setErrorMsg(err instanceof Error ? err.message : "Transcription failed");
      return;
    }

    if (!transcript) {
      setPhase("ask");
      setErrorMsg("I couldn't hear you. Please try once more.");
      return;
    }

    setPhase("scoring");
    let score: Score;
    try {
      const res = await fetch("/api/assess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q.prompt,
          expectedLevel: q.level,
          transcript,
        }),
      });
      score = (await res.json()) as Score;
    } catch {
      setPhase("ask");
      setErrorMsg("Could not score — try again.");
      return;
    }

    setTranscripts((t) => [...t, transcript]);
    setScores((s) => [...s, score]);
    setPhase("review");
  }

  function nextQuestion() {
    if (isLast) {
      finish([...scores]);
    } else {
      setStep((s) => s + 1);
      setPhase("ask");
    }
  }

  function finish(allScores: Score[]) {
    const overallAvg = Math.round(
      allScores.reduce((sum, s) => sum + s.overall, 0) / Math.max(1, allScores.length)
    );
    setFromAssessment(overallAvg);
    setPhase("done");
  }

  function restart() {
    stopSpeaking();
    resetLevel();
    setStep(0);
    setTranscripts([]);
    setScores([]);
    setPhase("intro");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <Link
          href="/"
          aria-label="Back to home"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Home
        </Link>
        <span className="text-xs font-medium text-slate-500">
          Question {Math.min(step + 1, ASSESSMENT_QUESTIONS.length)} of {ASSESSMENT_QUESTIONS.length}
        </span>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-10">
        {phase === "intro" && <Intro onStart={() => setPhase("ask")} />}

        {phase !== "intro" && phase !== "done" && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex flex-col items-center gap-2">
              <TutorAvatar state={avatarState} size={80} />
            </div>

            {phase === "ask" && (
              <div className="text-center">
                <span className="mb-2 inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
                  Target level: {q.level}
                </span>
                <h2 className="mb-2 text-xl font-semibold text-slate-900">{q.prompt}</h2>
                <p className="mb-4 text-sm text-slate-500">{q.hint}</p>
                {errorMsg && <p className="mb-3 text-sm text-rose-600">{errorMsg}</p>}
                <div className="flex justify-center">
                  <MicButton onAudioReady={handleAudio} onStatusChange={setMicStatus} />
                </div>
              </div>
            )}

            {phase === "transcribing" && <CenteredStatus text="Transcribing your answer…" />}
            {phase === "scoring" && <CenteredStatus text="Maya is scoring your answer…" />}

            {phase === "review" && scores[step] && (
              <div>
                <div className="mb-4 rounded-xl bg-slate-50 p-4">
                  <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    You said
                  </div>
                  <div className="text-sm text-slate-900">{transcripts[step]}</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <ScoreCell label="Vocabulary" value={scores[step].vocabulary} />
                  <ScoreCell label="Grammar" value={scores[step].grammar} />
                  <ScoreCell label="Fluency" value={scores[step].fluency} />
                  <ScoreCell label="Complexity" value={scores[step].complexity} />
                </div>
                <div className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900">
                  {scores[step].feedback}
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={nextQuestion}
                    className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-brand-700"
                  >
                    {isLast ? "See my level" : "Next question"}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {phase === "done" && <Result scores={scores} onRestart={restart} />}
      </main>
    </div>
  );
}

function Intro({ onStart }: { onStart: () => void }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <div className="mb-4 flex justify-center">
        <TutorAvatar state="idle" size={96} />
      </div>
      <h1 className="mb-2 text-2xl font-bold">Find your English level</h1>
      <p className="mb-6 text-slate-600">
        Maya will ask you 6 short spoken questions. It takes about 5 minutes. At the end you&apos;ll get your
        CEFR level (A1 to C1) and a personal practice plan.
      </p>
      <button
        type="button"
        onClick={onStart}
        className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-8 py-3 text-base font-semibold text-white shadow hover:bg-brand-700"
      >
        Start assessment
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function CenteredStatus({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-slate-500">
      <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full w-1/3 animate-pulse rounded-full bg-brand-500" />
      </div>
      <p className="text-sm">{text}</p>
    </div>
  );
}

function ScoreCell({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-xl font-bold text-slate-900">{value}/100</div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function Result({ scores, onRestart }: { scores: Score[]; onRestart: () => void }) {
  const overall = Math.round(scores.reduce((s, x) => s + x.overall, 0) / Math.max(1, scores.length));
  const level = levelFromScore(overall);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <div className="mb-3 flex justify-center">
        <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">
          {level.emoji}
        </span>
      </div>
      <h2 className="text-3xl font-bold text-slate-900">{level.code}</h2>
      <p className="mt-1 text-base font-medium text-slate-700">{level.label}</p>
      <p className="mt-3 text-slate-600">{level.longDescription}</p>

      <div className="mt-6 rounded-2xl bg-slate-50 p-5 text-left">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-slate-700">Your overall score</span>
          <span className="text-2xl font-bold text-brand-700">{overall}/100</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Summary scores={scores} key_="vocabulary" label="Vocabulary" />
          <Summary scores={scores} key_="grammar" label="Grammar" />
          <Summary scores={scores} key_="fluency" label="Fluency" />
          <Summary scores={scores} key_="complexity" label="Complexity" />
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/practice"
          className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-brand-700"
        >
          <CheckCircle2 className="h-4 w-4" />
          Start daily practice
        </Link>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          See progress
        </Link>
        <button
          type="button"
          onClick={onRestart}
          className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm text-slate-500 hover:text-slate-700"
        >
          <RotateCcw className="h-4 w-4" />
          Retake
        </button>
      </div>
    </div>
  );
}

function Summary({ scores, key_, label }: { scores: Score[]; key_: keyof Score; label: string }) {
  const values = scores
    .map((s) => s[key_])
    .filter((v): v is number => typeof v === "number");
  const avg = values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-lg font-bold text-slate-900">{avg}</div>
    </div>
  );
}
