"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useLevel } from "@/lib/store";
import { progressWithinLevel, LEVELS, levelFromScore } from "@/lib/level";
import { TrendingUp, Sparkles, RotateCcw, PartyPopper } from "lucide-react";
import { Confetti } from "@/components/Confetti";

export function LevelCard({ compact = false }: { compact?: boolean }) {
  const mastery = useLevel((s) => s.mastery);
  const hasTaken = useLevel((s) => s.hasTakenAssessment);
  const history = useLevel((s) => s.history);
  const [mounted, setMounted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const lastLevelRef = useRef<string | null>(null);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || !hasTaken) return;
    const currentCode = levelFromScore(mastery).code;
    if (lastLevelRef.current && lastLevelRef.current !== currentCode) {
      const wasIdx = LEVELS.findIndex((l) => l.code === lastLevelRef.current);
      const nowIdx = LEVELS.findIndex((l) => l.code === currentCode);
      if (nowIdx > wasIdx) setShowConfetti(true);
    }
    lastLevelRef.current = currentCode;
  }, [mastery, mounted, hasTaken]);

  if (!mounted) return <div className="h-32 animate-pulse rounded-2xl bg-slate-100" />;

  if (!hasTaken) {
    return (
      <div className="rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 to-white p-5 shadow-sm">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-brand-700">
          <Sparkles className="h-3 w-3" />
          New
        </div>
        <h3 className="text-lg font-bold text-slate-900">Find your level</h3>
        <p className="mt-1 text-sm text-slate-600">
          Take a 5-minute spoken assessment to discover your CEFR level (A1–C1) and get a personal plan.
        </p>
        <Link
          href="/assessment"
          className="mt-4 inline-flex rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-brand-700"
        >
          Start assessment
        </Link>
      </div>
    );
  }

  const { current, next, pct } = progressWithinLevel(mastery);
  const recentTrend = computeTrend(history);

  if (compact) {
    return (
      <Link
        href="/dashboard"
        className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm hover:border-brand-300"
      >
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-xl">
          {current.emoji}
        </span>
        <div className="flex-1">
          <div className="text-xs uppercase tracking-wide text-slate-500">Your level</div>
          <div className="text-sm font-semibold text-slate-900">
            {current.code} · {current.label}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-brand-700">{mastery}</div>
          <div className="text-[10px] uppercase tracking-wide text-slate-400">/100</div>
        </div>
      </Link>
    );
  }

  return (
    <div className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <Confetti show={showConfetti} />
      {showConfetti && (
        <div className="absolute -top-3 right-4 inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 shadow">
          <PartyPopper className="h-3.5 w-3.5" />
          Level up!
        </div>
      )}
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-3xl">
            {current.emoji}
          </span>
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-500">Your level</div>
            <h3 className="text-2xl font-bold text-slate-900">
              {current.code}{" "}
              <span className="text-base font-medium text-slate-500">· {current.label}</span>
            </h3>
            <p className="mt-1 text-sm text-slate-600">{current.shortDescription}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-brand-700">{mastery}</div>
          <div className="text-[10px] uppercase tracking-wide text-slate-400">mastery / 100</div>
          {recentTrend !== null && (
            <div
              className={
                "mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium " +
                (recentTrend > 0
                  ? "bg-emerald-100 text-emerald-700"
                  : recentTrend < 0
                  ? "bg-rose-100 text-rose-700"
                  : "bg-slate-100 text-slate-600")
              }
            >
              <TrendingUp className="h-3 w-3" />
              {recentTrend > 0 ? `+${recentTrend}` : recentTrend} recent
            </div>
          )}
        </div>
      </div>

      {next && (
        <>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="font-medium text-slate-600">
              {pct}% toward {next.code} · {next.label}
            </span>
            <span className="text-slate-500">
              {next.minScore - mastery} pts to go
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {LEVELS.map((l) => (
          <span
            key={l.code}
            className={
              "rounded-full px-2.5 py-0.5 text-[11px] font-semibold " +
              (l.code === current.code
                ? "bg-brand-600 text-white"
                : "bg-slate-100 text-slate-500")
            }
          >
            {l.code}
          </span>
        ))}
        <Link
          href="/assessment"
          className="ml-auto inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium text-slate-500 hover:text-slate-800"
        >
          <RotateCcw className="h-3 w-3" />
          Retake assessment
        </Link>
      </div>
    </div>
  );
}

function computeTrend(history: { ts: number; mastery: number }[]): number | null {
  if (history.length < 2) return null;
  const recent = history.slice(-5);
  const first = recent[0].mastery;
  const last = recent[recent.length - 1].mastery;
  return last - first;
}
