"use client";

import { useEffect, useRef } from "react";
import { useSessionStore, useSettings, type Message } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Sparkles, User, CheckCircle2, AlertCircle, Volume2 } from "lucide-react";
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
      <div className="flex max-w-[75%] flex-col items-end gap-1.5">
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
              <span>Pronunciation: <span className="font-semibold">{m.pronunciationScore}/100</span></span>
            </div>
          )}
        </div>
        {!m.pending && m.grammar && <GrammarBadge grammar={m.grammar} original={m.content} />}
      </div>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600">
        <User className="h-4 w-4" />
      </div>
    </div>
  );
}

function GrammarBadge({
  grammar,
  original,
}: {
  grammar: NonNullable<Message["grammar"]>;
  original: string;
}) {
  if (grammar.isCorrect) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">
        <CheckCircle2 className="h-3 w-3" />
        Good grammar
      </span>
    );
  }
  return (
    <div className="w-full max-w-md rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-900">
      <div className="mb-1 flex items-center gap-1 font-medium">
        <AlertCircle className="h-3.5 w-3.5" />
        Suggested phrasing
      </div>
      <div className="mb-1">
        <span className="text-amber-700 line-through opacity-70">{original}</span>
      </div>
      <div className="mb-1 font-medium text-emerald-800">{grammar.corrected}</div>
      {grammar.explanation && <div className="text-amber-800/80">{grammar.explanation}</div>}
    </div>
  );
}
