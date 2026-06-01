"use client";

import Link from "next/link";
import { SCENARIOS } from "@/lib/scenarios";
import { useSessionStore } from "@/lib/store";
import { ArrowLeft, Settings as SettingsIcon } from "lucide-react";
import { OnboardingOverlay } from "@/components/OnboardingOverlay";

export function ScenarioPicker() {
  const setScenario = useSessionStore((s) => s.setScenario);

  return (
    <div className="min-h-screen bg-slate-50">
      <OnboardingOverlay />
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <Link
          href="/"
          aria-label="Back to home"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Home
        </Link>
        <Link
          href="/settings"
          aria-label="Settings"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
        >
          <SettingsIcon className="h-5 w-5" />
        </Link>
      </header>
      <div className="mx-auto max-w-3xl px-6 py-10">
        <h2 className="mb-2 text-2xl font-bold text-slate-900">Pick a scenario</h2>
        <p className="mb-6 text-slate-600">Choose what you want to practice today.</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => setScenario(s)}
              className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md"
            >
              <div className="mb-2 text-3xl">{s.emoji}</div>
              <h3 className="text-base font-semibold text-slate-900 group-hover:text-brand-700">
                {s.title}
              </h3>
              <p className="mt-1 text-sm text-slate-600">{s.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
