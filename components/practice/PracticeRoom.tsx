"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Settings as SettingsIcon, Volume2, VolumeX, Target, ChevronDown, ChevronUp } from "lucide-react";
import { MicButton } from "./MicButton";
import { ChatThread } from "./ChatThread";
import {
  useSessionStore,
  useSettings,
  useHistory,
  useTrackProgress,
  useLevel,
  type GrammarResult,
} from "@/lib/store";
import { utteranceMastery, sessionMastery } from "@/lib/level";
import { speak, stopSpeaking, useIsSpeaking } from "@/lib/tts";
import { TutorAvatar, type AvatarState } from "./TutorAvatar";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function PracticeRoom() {
  const scenario = useSessionStore((s) => s.scenario)!;
  const activeLesson = useSessionStore((s) => s.activeLesson);
  const messages = useSessionStore((s) => s.messages);
  const sessionStartedAt = useSessionStore((s) => s.sessionStartedAt);
  const addMessage = useSessionStore((s) => s.addMessage);
  const patchMessage = useSessionStore((s) => s.patchMessage);
  const removeMessage = useSessionStore((s) => s.removeMessage);
  const startSession = useSessionStore((s) => s.startSession);
  const endSession = useSessionStore((s) => s.endSession);
  const setScenario = useSessionStore((s) => s.setScenario);

  const { level, accent, voiceName, ttsMuted, toggleTtsMute } = useSettings();
  const addPastSession = useHistory((s) => s.addSession);
  const markLessonComplete = useTrackProgress((s) => s.markLessonComplete);
  const updateLevelFromSession = useLevel((s) => s.updateFromSession);

  const starterSeededRef = useRef(false);
  const [micStatus, setMicStatus] = useState<"idle" | "requesting" | "recording" | "processing" | "error">("idle");
  const isSpeaking = useIsSpeaking();

  const lastMessage = messages[messages.length - 1];
  const isReplyStreaming = lastMessage?.role === "assistant" && lastMessage?.streaming;
  const isTranscribing = micStatus === "processing";

  let avatarState: AvatarState = "idle";
  if (micStatus === "recording") avatarState = "listening";
  else if (isTranscribing || isReplyStreaming) avatarState = "thinking";
  else if (isSpeaking) avatarState = "speaking";

  useEffect(() => {
    if (!sessionStartedAt) startSession();
  }, [sessionStartedAt, startSession]);

  useEffect(() => {
    if (!activeLesson || starterSeededRef.current) return;
    if (messages.length > 0) return;
    starterSeededRef.current = true;
    addMessage({
      id: uid(),
      role: "assistant",
      content: activeLesson.starterLine,
      createdAt: Date.now(),
    });
    if (!ttsMuted) speak(activeLesson.starterLine, { voiceName: voiceName ?? undefined });
  }, [activeLesson, messages.length, addMessage, ttsMuted, voiceName]);

  const finishAndExit = useCallback(() => {
    stopSpeaking();
    const userMsgs = messages.filter((m) => m.role === "user" && !m.pending);
    if (userMsgs.length > 0 && sessionStartedAt) {
      const scores = userMsgs.map((m) => m.pronunciationScore ?? 0).filter((s) => s > 0);
      const grammarErrors = userMsgs.filter((m) => m.grammar && !m.grammar.isCorrect).length;
      const mistakeTypes = userMsgs
        .map((m) => m.grammar?.errorType)
        .filter((t): t is string => !!t && t !== "None");
      const now = Date.now();
      addPastSession({
        id: uid(),
        scenarioId: scenario.id,
        scenarioTitle: `${scenario.emoji} ${scenario.title}`,
        startedAt: sessionStartedAt,
        endedAt: now,
        durationSeconds: Math.round((now - sessionStartedAt) / 1000),
        avgPronunciationScore: scores.length
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          : 0,
        grammarErrorsCount: grammarErrors,
        messageCount: messages.length,
        mistakeTypes,
      });
      if (activeLesson && userMsgs.length >= 3) {
        markLessonComplete(activeLesson.trackId, activeLesson.lessonId);
      }
      const utteranceScores = userMsgs.map((m) =>
        utteranceMastery({
          pronunciation: m.pronunciationScore ?? 0,
          grammarCorrect: m.grammar?.isCorrect ?? true,
        })
      );
      const sessionScore = sessionMastery(utteranceScores);
      if (sessionScore > 0) updateLevelFromSession(sessionScore);
    }
    endSession();
  }, [
    messages,
    sessionStartedAt,
    scenario,
    addPastSession,
    endSession,
    activeLesson,
    markLessonComplete,
    updateLevelFromSession,
  ]);

  const handleAudio = useCallback(
    async (blob: Blob, mimeType: string) => {
      const pendingId = uid();
      addMessage({
        id: pendingId,
        role: "user",
        content: "",
        pending: true,
        createdAt: Date.now(),
      });

      let transcript = "";
      let pronunciationScore: number | undefined;
      let weakWords: string[] = [];
      try {
        const fd = new FormData();
        fd.append("file", blob, mimeType.includes("mp4") ? "audio.mp4" : "audio.webm");
        const res = await fetch("/api/transcribe", { method: "POST", body: fd });
        if (!res.ok) throw new Error("Transcription failed");
        const json = (await res.json()) as {
          transcript: string;
          pronunciationScore: number;
          weakWords: string[];
        };
        transcript = json.transcript.trim();
        pronunciationScore = json.pronunciationScore;
        weakWords = json.weakWords ?? [];
      } catch (err) {
        removeMessage(pendingId);
        throw err;
      }

      if (!transcript) {
        removeMessage(pendingId);
        return;
      }

      patchMessage(pendingId, {
        content: transcript,
        pending: false,
        pronunciationScore,
        weakWords,
      });

      const history = [
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        { role: "user" as const, content: transcript },
      ].filter((m) => m.content);

      const assistantId = uid();
      addMessage({
        id: assistantId,
        role: "assistant",
        content: "",
        streaming: true,
        createdAt: Date.now(),
      });

      const chatPromise = (async () => {
        const chatRes = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scenarioId: scenario.id,
            messages: history,
            level,
            accent,
          }),
        });
        if (!chatRes.ok || !chatRes.body) {
          patchMessage(assistantId, {
            content: "Sorry, I couldn't reply just now. Please try again.",
            streaming: false,
          });
          return null;
        }
        const reader = chatRes.body.getReader();
        const decoder = new TextDecoder();
        let acc = "";
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          patchMessage(assistantId, { content: acc });
        }
        patchMessage(assistantId, { streaming: false });
        return acc;
      })();

      const grammarPromise = (async () => {
        try {
          const res = await fetch("/api/grammar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: transcript }),
          });
          if (!res.ok) return;
          const result = (await res.json()) as GrammarResult;
          patchMessage(pendingId, { grammar: result });
        } catch {
          /* non-blocking */
        }
      })();

      const [acc] = await Promise.all([chatPromise, grammarPromise]);
      if (!ttsMuted && acc) speak(acc, { voiceName: voiceName ?? undefined });
    },
    [
      scenario,
      messages,
      addMessage,
      patchMessage,
      removeMessage,
      ttsMuted,
      voiceName,
      level,
      accent,
    ]
  );

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={finishAndExit}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
            aria-label="End session and go home"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-500">Scenario</div>
            <div className="text-sm font-semibold text-slate-900">
              {scenario.emoji} {scenario.title}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (!ttsMuted) stopSpeaking();
              toggleTtsMute();
            }}
            aria-label={ttsMuted ? "Unmute voice" : "Mute voice"}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
          >
            {ttsMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
          <Link
            href="/settings"
            aria-label="Settings"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
          >
            <SettingsIcon className="h-5 w-5" />
          </Link>
          <button
            type="button"
            onClick={() => {
              stopSpeaking();
              setScenario(null);
            }}
            className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
          >
            Change scenario
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto bg-slate-50">
        <div className="mx-auto max-w-3xl py-6">
          {activeLesson && <LessonBanner lesson={activeLesson} />}
          <ChatThread />
        </div>
      </div>

      <div className="border-t border-slate-200 bg-white px-4 py-5">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4">
          <TutorAvatar state={avatarState} size={96} name="Maya — your tutor" />
          <MicButton onAudioReady={handleAudio} onStatusChange={setMicStatus} />
        </div>
      </div>
    </div>
  );
}

function LessonBanner({
  lesson,
}: {
  lesson: { goal: string; examples: string[] };
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="mx-2 mb-4 rounded-2xl border border-brand-200 bg-brand-50/60 p-4 text-sm text-brand-900">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-left"
        aria-expanded={open}
      >
        <span className="inline-flex items-center gap-2 font-semibold">
          <Target className="h-4 w-4" />
          Lesson goal
        </span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-brand-700" />
        ) : (
          <ChevronDown className="h-4 w-4 text-brand-700" />
        )}
      </button>
      {open && (
        <>
          <p className="mt-2">{lesson.goal}</p>
          {lesson.examples.length > 0 && (
            <div className="mt-3">
              <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-brand-700">
                Try saying
              </div>
              <ul className="flex flex-wrap gap-1.5">
                {lesson.examples.map((ex, i) => (
                  <li
                    key={i}
                    className="rounded-full bg-white px-3 py-1 text-[12px] text-brand-900 shadow-sm"
                  >
                    {ex}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
