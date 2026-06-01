"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Volume2 } from "lucide-react";
import { useSettings, type Accent, type Level } from "@/lib/store";
import { speak } from "@/lib/tts";

const LEVELS: { id: Level; label: string; description: string }[] = [
  { id: "beginner", label: "Beginner", description: "Simple words, slow replies." },
  { id: "intermediate", label: "Intermediate", description: "Everyday conversation." },
  { id: "advanced", label: "Advanced", description: "Full speed, idioms, nuance." },
];

const ACCENTS: { id: Accent; label: string }[] = [
  { id: "US", label: "🇺🇸 American" },
  { id: "UK", label: "🇬🇧 British" },
  { id: "AU", label: "🇦🇺 Australian" },
];

export default function SettingsPage() {
  const { level, accent, voiceName, setLevel, setAccent, setVoiceName } = useSettings();
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const load = () => {
      const all = window.speechSynthesis.getVoices().filter((v) => v.lang.startsWith("en"));
      setVoices(all);
    };
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3">
        <Link
          href="/practice"
          aria-label="Back"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-base font-semibold">Settings</h1>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-8">
        <Section title="Your level" subtitle="The AI adjusts vocabulary and speed.">
          <div className="grid gap-3 sm:grid-cols-3">
            {LEVELS.map((l) => (
              <button
                key={l.id}
                onClick={() => setLevel(l.id)}
                className={cardClass(level === l.id)}
              >
                <div className="font-semibold">{l.label}</div>
                <div className="mt-1 text-xs text-slate-600">{l.description}</div>
              </button>
            ))}
          </div>
        </Section>

        <Section title="Target accent" subtitle="The tutor uses this accent in conversation.">
          <div className="flex flex-wrap gap-3">
            {ACCENTS.map((a) => (
              <button
                key={a.id}
                onClick={() => setAccent(a.id)}
                className={cardClass(accent === a.id, "px-5 py-2")}
              >
                {a.label}
              </button>
            ))}
          </div>
        </Section>

        <Section
          title="Voice"
          subtitle={
            voices.length === 0
              ? "No English voices available in this browser."
              : "The voice used to speak AI replies."
          }
        >
          {voices.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <select
                  value={voiceName ?? ""}
                  onChange={(e) => setVoiceName(e.target.value || null)}
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                >
                  <option value="">System default</option>
                  {voices.map((v) => (
                    <option key={v.name} value={v.name}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() =>
                    speak("Hello! I am SpeakSmart. Let's practice English together.", {
                      voiceName: voiceName ?? undefined,
                    })
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-100"
                >
                  <Volume2 className="h-4 w-4" />
                  Test
                </button>
              </div>
            </div>
          )}
        </Section>

        <div className="mt-10 flex justify-end">
          <Link
            href="/practice"
            className="rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-brand-700"
          >
            Back to practice
          </Link>
        </div>
      </main>
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      {subtitle && <p className="mb-4 mt-1 text-sm text-slate-600">{subtitle}</p>}
      <div className="mt-3">{children}</div>
    </section>
  );
}

function cardClass(active: boolean, extra = "") {
  return [
    "rounded-xl border px-4 py-3 text-left text-sm transition",
    active
      ? "border-brand-500 bg-brand-50 text-brand-900 ring-2 ring-brand-500/20"
      : "border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50",
    extra,
  ].join(" ");
}
