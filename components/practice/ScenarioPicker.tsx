"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { SCENARIOS } from "@/lib/scenarios";
import { useSessionStore } from "@/lib/store";
import { ArrowLeft, Settings as SettingsIcon, BarChart3 } from "lucide-react";
import { OnboardingOverlay } from "@/components/OnboardingOverlay";
import { TrackPicker } from "./TrackPicker";
import { ScenarioIcon } from "./ScenarioIcon";
import { LevelCard } from "@/components/LevelCard";

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
        <div className="flex items-center gap-1">
          <Link
            href="/dashboard"
            aria-label="Dashboard"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
          >
            <BarChart3 className="h-5 w-5" />
          </Link>
          <Link
            href="/settings"
            aria-label="Settings"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
          >
            <SettingsIcon className="h-5 w-5" />
          </Link>
        </div>
      </header>
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-8">
          <LevelCard />
        </div>
        <TrackPicker />

        <section>
          <h2 className="mb-1 text-2xl font-bold text-slate-900">Free practice</h2>
          <p className="mb-5 text-slate-600">Pick a scenario and chat freely — no daily plan.</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SCENARIOS.map((s, i) => (
              <motion.button
                key={s.id}
                onClick={() => setScenario(s)}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 * i, type: "spring", stiffness: 200, damping: 18 }}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.97 }}
                className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm hover:border-brand-300 hover:shadow-md"
              >
                <div className="mb-3">
                  <ScenarioIcon id={s.id} className="h-14 w-14" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 group-hover:text-brand-700">
                  {s.title}
                </h3>
                <p className="mt-1 text-sm text-slate-600">{s.description}</p>
              </motion.button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
