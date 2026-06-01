"use client";

import { useEffect, useState } from "react";
import { Mic, Lightbulb, BarChart3, X } from "lucide-react";
import { useSettings } from "@/lib/store";

const STEPS = [
  {
    icon: <Mic className="h-6 w-6" />,
    title: "Tap the mic and speak",
    body: "Hold a real conversation in English — the AI listens patiently and replies.",
  },
  {
    icon: <Lightbulb className="h-6 w-6" />,
    title: "Get instant feedback",
    body: "See your pronunciation score per utterance and gentle grammar fixes.",
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: "Track your progress",
    body: "Build a daily streak. Your stats live privately on this device.",
  },
];

export function OnboardingOverlay() {
  const hasSeen = useSettings((s) => s.hasSeenOnboarding);
  const markSeen = useSettings((s) => s.markOnboardingSeen);
  const [step, setStep] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted || hasSeen) return null;

  const s = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 backdrop-blur-sm">
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <button
          type="button"
          onClick={markSeen}
          aria-label="Close"
          className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-700">
          {s.icon}
        </div>
        <h2 className="text-lg font-semibold text-slate-900">{s.title}</h2>
        <p className="mt-2 text-sm text-slate-600">{s.body}</p>

        <div className="mt-6 flex items-center justify-between">
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? "w-6 bg-brand-600" : "w-1.5 bg-slate-200"
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => (isLast ? markSeen() : setStep(step + 1))}
            className="rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            {isLast ? "Got it" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
