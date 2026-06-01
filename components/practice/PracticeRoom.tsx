"use client";

import { useCallback, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Settings as SettingsIcon, Volume2, VolumeX } from "lucide-react";
import { MicButton } from "./MicButton";
import { ChatThread } from "./ChatThread";
import {
  useSessionStore,
  useSettings,
  useHistory,
  type GrammarResult,
} from "@/lib/store";
import { speak, stopSpeaking } from "@/lib/tts";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function PracticeRoom() {
  const scenario = useSessionStore((s) => s.scenario)!;
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

  useEffect(() => {
    if (!sessionStartedAt) startSession();
  }, [sessionStartedAt, startSession]);

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
    }
    endSession();
  }, [messages, sessionStartedAt, scenario, addPastSession, endSession]);

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
          <ChatThread />
        </div>
      </div>

      <div className="border-t border-slate-200 bg-white px-4 py-6">
        <MicButton onAudioReady={handleAudio} />
      </div>
    </div>
  );
}
