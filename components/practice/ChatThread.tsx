"use client";

import { useEffect, useRef } from "react";
import { useSessionStore, useSettings, type Message } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  User,
  CheckCircle2,
  AlertCircle,
  Volume2,
  BookOpen,
  Lightbulb,
  Play,
} from "lucide-react";
import { speak } from "@/lib/tts";

export function ChatThread() {
  const messages = useSessionStore((s) => s.messages);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex h-full min-h-[40vh] items-center justify-center text-center text-slate-400">
        <p>Press the mic and say something to start.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-2 pb-4">
      {messages.map((m) => (
        <MessageBubble key={m.id} message={m} />
      ))}
      <div ref={endRef} />
    </div>
  );
}

function MessageBubble({ message: m }: { message: Message }) {
  const voiceName = useSettings((s) => s.voiceName);
  if (m.role === "assistant") {
    return (
      <div className="flex gap-3 justify-start">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="max-w-[75%] rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm leading-relaxed text-slate-800 shadow-sm">
          {m.content}
          {m.streaming && <span className="ml-1 inline-block animate-pulse">▍</span>}
        </div>
      </div>
    );
  }

  const weak = new Set((m.weakWords ?? []).map((w) => w.toLowerCase()));
  const speakWord = (w: string) => speak(w, { voiceName: voiceName ?? undefined, rate: 0.85 });

  return (
    <div className="flex gap-3 justify-end">
      <div className="flex w-full max-w-[85%] flex-col items-end gap-2">
        <div className="rounded-2xl bg-brand-600 px-4 py-2.5 text-sm leading-relaxed text-white shadow-sm">
          {m.pending ? (
            <span className="italic opacity-80">Transcribing…</span>
          ) : (
            <span>
              {m.content.split(/(\s+)/).map((token, i) => {
                if (/^\s+$/.test(token)) return token;
                const isWeak = weak.has(token.replace(/[.,!?;:"]/g, "").toLowerCase());
                if (!isWeak) return <span key={i}>{token}</span>;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => speakWord(token.replace(/[.,!?;:"]/g, ""))}
                    className="underline decoration-rose-200 decoration-2 underline-offset-4 hover:decoration-rose-50"
                    aria-label={`Hear correct pronunciation of ${token}`}
                  >
                    {token}
                  </button>
                );
              })}
            </span>
          )}
          {!m.pending && typeof m.pronunciationScore === "number" && (
            <div className="mt-1.5 flex items-center gap-1 text-[11px] opacity-90">
              <Volume2 className="h-3 w-3" />
              <span>
                Pronunciation: <span className="font-semibold">{m.pronunciationScore}/100</span>
              </span>
            </div>
          )}
        </div>
        {!m.pending && m.grammar && (
          <TutorCard grammar={m.grammar} original={m.content} voiceName={voiceName} />
        )}
      </div>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600">
        <User className="h-4 w-4" />
      </div>
    </div>
  );
}

function TutorCard({
  grammar,
  original,
  voiceName,
}: {
  grammar: NonNullable<Message["grammar"]>;
  original: string;
  voiceName: string | null;
}) {
  if (grammar.isCorrect) {
    return (
      <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[12px] font-medium text-emerald-700">
        <CheckCircle2 className="h-3.5 w-3.5" />
        {grammar.encouragement || "Perfect grammar!"}
      </div>
    );
  }

  const playCorrected = () =>
    speak(grammar.corrected, { voiceName: voiceName ?? undefined, rate: 0.9 });

  return (
    <div className="w-full rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-[13px] text-amber-950 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="inline-flex items-center gap-1.5 font-semibold text-amber-900">
          <AlertCircle className="h-4 w-4" />
          Tutor feedback
        </div>
        {grammar.errorType && grammar.errorType !== "None" && (
          <span className="rounded-full bg-amber-200/70 px-2.5 py-0.5 text-[11px] font-medium text-amber-900">
            {grammar.errorType}
          </span>
        )}
      </div>

      <div className="mb-3 rounded-lg bg-white/70 p-3">
        <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-amber-700">
          You said
        </div>
        <div className="mb-2 text-amber-700 line-through opacity-80">{original}</div>
        <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-emerald-700">
          Better
        </div>
        <div className="flex items-start justify-between gap-2">
          <span className="font-medium text-emerald-900">{grammar.corrected}</span>
          <button
            type="button"
            onClick={playCorrected}
            aria-label="Hear the corrected sentence"
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow hover:bg-emerald-700"
          >
            <Play className="h-3 w-3" />
          </button>
        </div>
      </div>

      {grammar.rule && (
        <div className="mb-3 flex gap-2">
          <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-amber-700">
              The rule
            </div>
            <div className="text-amber-950">{grammar.rule}</div>
          </div>
        </div>
      )}

      {grammar.explanation && (
        <div className="mb-3 flex gap-2">
          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
          <div className="text-amber-950">{grammar.explanation}</div>
        </div>
      )}

      {grammar.examples.length > 0 && (
        <div>
          <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-amber-700">
            Try these
          </div>
          <ul className="space-y-1.5">
            {grammar.examples.map((ex, i) => (
              <li key={i} className="flex items-center justify-between gap-2 rounded-md bg-white/70 px-3 py-1.5">
                <span>{ex}</span>
                <button
                  type="button"
                  onClick={() => speak(ex, { voiceName: voiceName ?? undefined, rate: 0.9 })}
                  aria-label={`Hear: ${ex}`}
                  className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-amber-700 hover:bg-amber-100"
                >
                  <Volume2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {grammar.encouragement && (
        <div className="mt-3 text-[12px] italic text-amber-700">{grammar.encouragement}</div>
      )}
    </div>
  );
}
