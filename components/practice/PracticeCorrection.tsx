"use client";

import { useState } from "react";
import { Mic, Square, Play, CheckCircle2, XCircle, SkipForward, Sparkles } from "lucide-react";
import { getMicStream, pickMimeType } from "@/lib/audio";
import { speak, useIsSpeaking } from "@/lib/tts";
import { similarityScore, PASS_THRESHOLD } from "@/lib/similarity";
import { useSettings, useCorrections } from "@/lib/store";
import { getTutor } from "@/lib/tutors";
import { cn } from "@/lib/utils";

const MAX_ATTEMPTS = 3;

type Attempt = { transcript: string; score: number };

type Phase = "idle" | "recording" | "processing" | "result";

export function PracticeCorrection({ target }: { target: string }) {
  const voiceName = useSettings((s) => s.voiceName);
  const ttsMuted = useSettings((s) => s.ttsMuted);
  const tutorId = useSettings((s) => s.tutorId);
  const tutor = getTutor(tutorId);
  const isSpeaking = useIsSpeaking();
  const recordMastered = useCorrections((s) => s.recordMastered);
  const recordSkipped = useCorrections((s) => s.recordSkipped);

  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [completed, setCompleted] = useState<"mastered" | "skipped" | null>(null);

  const recorderRef = useState<{
    recorder: MediaRecorder | null;
    stream: MediaStream | null;
    chunks: Blob[];
    mime: string;
  }>(() => ({ recorder: null, stream: null, chunks: [], mime: "" }))[0];

  const passed = attempts.some((a) => a.score >= PASS_THRESHOLD);
  const failedTries = attempts.filter((a) => a.score < PASS_THRESHOLD).length;
  const exhausted = failedTries >= MAX_ATTEMPTS && !passed;

  function playTarget() {
    if (!ttsMuted)
      speak(target, {
        voiceName: voiceName ?? undefined,
        voiceHints: tutor.voiceHints,
        rate: 0.9,
      });
  }

  async function startRecording() {
    setErrorMsg(null);
    try {
      const stream = await getMicStream();
      const mime = pickMimeType();
      const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      recorderRef.recorder = recorder;
      recorderRef.stream = stream;
      recorderRef.chunks = [];
      recorderRef.mime = mime || "audio/webm";
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recorderRef.chunks.push(e.data);
      };
      recorder.onstop = async () => {
        recorderRef.stream?.getTracks().forEach((t) => t.stop());
        recorderRef.stream = null;
        const blob = new Blob(recorderRef.chunks, { type: recorderRef.mime });
        await transcribeAndScore(blob, recorderRef.mime);
      };
      recorder.start();
      setPhase("recording");
    } catch (err) {
      setErrorMsg(
        err instanceof DOMException && err.name === "NotAllowedError"
          ? "Microphone is blocked. Enable it in your browser settings."
          : "Couldn't access the microphone."
      );
      setPhase("idle");
    }
  }

  function stopRecording() {
    recorderRef.recorder?.stop();
    recorderRef.recorder = null;
    setPhase("processing");
  }

  async function transcribeAndScore(blob: Blob, mime: string) {
    try {
      const fd = new FormData();
      fd.append("file", blob, mime.includes("mp4") ? "audio.mp4" : "audio.webm");
      const res = await fetch("/api/transcribe", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Transcription failed");
      const json = (await res.json()) as { transcript: string };
      const transcript = (json.transcript ?? "").trim();
      const score = transcript ? similarityScore(transcript, target) : 0;
      const next: Attempt[] = [...attempts, { transcript, score }];
      setAttempts(next);
      setPhase("result");
      if (score >= PASS_THRESHOLD && completed === null) {
        recordMastered();
        setCompleted("mastered");
      }
    } catch {
      setErrorMsg("Couldn't process audio. Try again.");
      setPhase("idle");
    }
  }

  function tryAgain() {
    setPhase("idle");
    setErrorMsg(null);
  }

  function skip() {
    if (completed === null) {
      recordSkipped();
      setCompleted("skipped");
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          playTarget();
        }}
        className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
      >
        <Sparkles className="h-4 w-4" />
        Now you try!
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
          Repeat after {tutor.name}
        </div>
        <button
          type="button"
          onClick={playTarget}
          aria-label="Hear it again"
          className={cn(
            "inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white hover:bg-emerald-700",
            isSpeaking && "animate-pulse"
          )}
        >
          <Play className="h-3 w-3" />
        </button>
      </div>

      <div className="mb-3 rounded-lg bg-emerald-50 p-3 text-center text-sm font-medium text-emerald-900">
        “{target}”
      </div>

      {errorMsg && <div className="mb-3 text-xs text-rose-600">{errorMsg}</div>}

      {completed === "mastered" ? (
        <div className="flex items-center justify-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">
          <CheckCircle2 className="h-5 w-5" />
          Great job! You got it.
        </div>
      ) : completed === "skipped" ? (
        <div className="flex items-center justify-center gap-2 rounded-lg bg-slate-50 p-3 text-sm font-medium text-slate-700">
          We&apos;ll come back to this one. Keep going!
        </div>
      ) : (
        <>
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={phase === "recording" ? stopRecording : startRecording}
              disabled={phase === "processing"}
              aria-label={phase === "recording" ? "Stop recording" : "Record your attempt"}
              className={cn(
                "relative inline-flex h-14 w-14 items-center justify-center rounded-full text-white shadow",
                phase === "recording"
                  ? "bg-rose-500 hover:bg-rose-600"
                  : "bg-emerald-600 hover:bg-emerald-700",
                phase === "processing" && "opacity-60 cursor-not-allowed"
              )}
            >
              {phase === "recording" && (
                <span className="absolute inset-0 animate-pulseRing rounded-full bg-rose-500" />
              )}
              {phase === "recording" ? (
                <Square className="relative h-5 w-5" />
              ) : (
                <Mic className="relative h-6 w-6" />
              )}
            </button>
            <div className="text-xs text-slate-500">
              {phase === "idle" && "Tap to say it"}
              {phase === "recording" && "Listening… tap to stop"}
              {phase === "processing" && "Checking…"}
              {phase === "result" && lastAttempt(attempts)?.score !== undefined &&
                (lastAttempt(attempts)!.score >= PASS_THRESHOLD
                  ? "Nice! That sounded great."
                  : `${lastAttempt(attempts)!.score}% match — try once more.`)}
            </div>
          </div>

          {attempts.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {attempts.map((a, i) => (
                <AttemptRow key={i} attempt={a} index={i + 1} />
              ))}
            </div>
          )}

          {phase === "result" && !passed && !exhausted && (
            <div className="mt-3 flex justify-center gap-2">
              <button
                type="button"
                onClick={tryAgain}
                className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Try again
              </button>
              <button
                type="button"
                onClick={skip}
                className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                <SkipForward className="h-3.5 w-3.5" />
                Skip for now
              </button>
            </div>
          )}

          {exhausted && (
            <div className="mt-3">
              <div className="mb-2 text-center text-xs text-slate-600">
                That was a tough one — you can always come back to it.
              </div>
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={skip}
                  className="inline-flex items-center gap-1 rounded-full bg-slate-700 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  <SkipForward className="h-3.5 w-3.5" />
                  Skip for now
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function lastAttempt(attempts: Attempt[]): Attempt | undefined {
  return attempts[attempts.length - 1];
}

function AttemptRow({ attempt, index }: { attempt: Attempt; index: number }) {
  const pass = attempt.score >= PASS_THRESHOLD;
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border px-3 py-2 text-xs",
        pass ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"
      )}
    >
      {pass ? (
        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
      ) : (
        <XCircle className="h-4 w-4 shrink-0 text-rose-600" />
      )}
      <span className="text-slate-500">#{index}</span>
      <span className="flex-1 truncate text-slate-900">
        {attempt.transcript || <em className="text-slate-400">no speech detected</em>}
      </span>
      <span className={cn("font-semibold", pass ? "text-emerald-700" : "text-rose-700")}>
        {attempt.score}%
      </span>
    </div>
  );
}
