"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Flame, Clock, MessageCircleHeart, Trophy, Trash2, BookOpen, Target } from "lucide-react";
import { useHistory, useCorrections, type PastSession } from "@/lib/store";
import { LevelCard } from "@/components/LevelCard";

export default function DashboardPage() {
  const sessions = useHistory((s) => s.sessions);
  const clearHistory = useHistory((s) => s.clearHistory);
  const correctionsMastered = useCorrections((s) => s.mastered);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="min-h-screen bg-slate-50" />;
  }

  if (sessions.length < 3) {
    return <EmptyState count={sessions.length} />;
  }

  const totalMinutes = Math.round(sessions.reduce((s, x) => s + x.durationSeconds, 0) / 60);
  const last7 = sessions.filter((s) => Date.now() - s.startedAt < 7 * 24 * 3600 * 1000);
  const avg7 = last7.length
    ? Math.round(last7.reduce((s, x) => s + x.avgPronunciationScore, 0) / last7.length)
    : 0;
  const totalWords = sessions.reduce((s, x) => s + x.messageCount * 8, 0);
  const totalGrammarErrors = sessions.reduce((s, x) => s + x.grammarErrorsCount, 0);
  const grammarPer100 = totalWords ? Math.round((totalGrammarErrors / totalWords) * 100) : 0;
  const streak = computeStreak(sessions);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <Link
          href="/"
          aria-label="Back to home"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Home
        </Link>
        <button
          type="button"
          onClick={() => {
            if (confirm("Clear all session history? This cannot be undone.")) clearHistory();
          }}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
        >
          <Trash2 className="h-3.5 w-3.5" /> Clear history
        </button>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        <h1 className="mb-1 text-2xl font-bold">Your progress</h1>
        <p className="mb-6 text-sm text-slate-600">Stored privately on this device.</p>

        <div className="mb-8">
          <LevelCard />
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            icon={<Clock className="h-5 w-5" />}
            label="Total practice"
            value={`${totalMinutes} min`}
          />
          <StatCard
            icon={<Trophy className="h-5 w-5" />}
            label="Pronunciation (7d)"
            value={`${avg7}/100`}
          />
          <StatCard
            icon={<MessageCircleHeart className="h-5 w-5" />}
            label="Grammar / 100 words"
            value={`${grammarPer100}`}
          />
          <StatCard
            icon={<Flame className="h-5 w-5" />}
            label="Streak"
            value={`${streak} day${streak === 1 ? "" : "s"}`}
          />
          <StatCard
            icon={<Target className="h-5 w-5" />}
            label="Mistakes mastered"
            value={`${correctionsMastered}`}
          />
        </div>

        <Chart sessions={sessions.slice(0, 14).reverse()} />

        <MistakePatterns sessions={sessions} />

        <h2 className="mt-10 mb-3 text-lg font-semibold">Recent sessions</h2>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-2 text-left font-medium">When</th>
                <th className="px-4 py-2 text-left font-medium">Scenario</th>
                <th className="px-4 py-2 text-right font-medium">Duration</th>
                <th className="px-4 py-2 text-right font-medium">Score</th>
                <th className="px-4 py-2 text-right font-medium">Grammar errors</th>
              </tr>
            </thead>
            <tbody>
              {sessions.slice(0, 20).map((s) => (
                <tr key={s.id} className="border-t border-slate-100">
                  <td className="px-4 py-2 text-slate-700">{relativeTime(s.startedAt)}</td>
                  <td className="px-4 py-2">{s.scenarioTitle}</td>
                  <td className="px-4 py-2 text-right">{Math.round(s.durationSeconds / 60)} min</td>
                  <td className="px-4 py-2 text-right font-semibold">{s.avgPronunciationScore}</td>
                  <td className="px-4 py-2 text-right">{s.grammarErrorsCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-700">
        {icon}
      </div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      <div className="mt-1 text-xs text-slate-500">{label}</div>
    </div>
  );
}

function Chart({ sessions }: { sessions: PastSession[] }) {
  if (sessions.length === 0) return null;
  const max = 100;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-1 text-base font-semibold">Pronunciation over time</h2>
      <p className="mb-4 text-xs text-slate-500">Score per session — most recent on the right.</p>
      <div className="flex h-40 items-end gap-1.5">
        {sessions.map((s) => {
          const h = Math.max(4, (s.avgPronunciationScore / max) * 100);
          return (
            <div key={s.id} className="group flex flex-1 flex-col items-center">
              <div
                title={`${s.avgPronunciationScore}/100 — ${s.scenarioTitle}`}
                className="w-full rounded-t bg-gradient-to-t from-brand-500 to-brand-400 transition group-hover:from-brand-600"
                style={{ height: `${h}%` }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MistakePatterns({ sessions }: { sessions: PastSession[] }) {
  const tally = new Map<string, number>();
  for (const s of sessions) {
    for (const t of s.mistakeTypes ?? []) {
      tally.set(t, (tally.get(t) ?? 0) + 1);
    }
  }
  const sorted = Array.from(tally.entries()).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const total = sorted.reduce((acc, [, n]) => acc + n, 0);

  if (sorted.length === 0) {
    return (
      <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
        <div className="flex items-center gap-2 text-emerald-800">
          <BookOpen className="h-5 w-5" />
          <h2 className="text-base font-semibold">No grammar mistakes tracked yet</h2>
        </div>
        <p className="mt-2 text-sm text-emerald-700">
          Great job — keep practicing and we&apos;ll show patterns here as they appear.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-1 flex items-center gap-2">
        <BookOpen className="h-5 w-5 text-amber-700" />
        <h2 className="text-base font-semibold">What to work on</h2>
      </div>
      <p className="mb-4 text-xs text-slate-500">
        Your most common mistake types — focus practice here to improve fastest.
      </p>
      <ul className="space-y-3">
        {sorted.map(([type, count]) => {
          const pct = Math.round((count / total) * 100);
          return (
            <li key={type}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-900">{type}</span>
                <span className="text-slate-500">
                  {count} time{count === 1 ? "" : "s"} · {pct}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-600"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function EmptyState({ count }: { count: number }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-600">
          <ArrowLeft className="h-4 w-4" /> Home
        </Link>
      </header>
      <main className="mx-auto max-w-2xl px-6 py-12">
        <div className="mb-8">
          <LevelCard />
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-brand-700">
            <BookOpen className="h-7 w-7" />
          </div>
          <h1 className="mb-2 text-2xl font-bold">Keep going!</h1>
          <p className="mb-6 text-slate-600">
            {count === 0
              ? "Finish your first practice session to start seeing progress charts."
              : `You've completed ${count} session${count === 1 ? "" : "s"}. Complete ${
                  3 - count
                } more to unlock progress charts.`}
          </p>
          <Link
            href="/practice"
            className="inline-flex rounded-full bg-brand-600 px-6 py-3 font-semibold text-white shadow hover:bg-brand-700"
          >
            Start practicing
          </Link>
        </div>
      </main>
    </div>
  );
}

function computeStreak(sessions: PastSession[]): number {
  if (sessions.length === 0) return 0;
  const days = new Set(sessions.map((s) => new Date(s.startedAt).toDateString()));
  let streak = 0;
  const d = new Date();
  while (days.has(d.toDateString())) {
    streak += 1;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.round(diff / 60_000);
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Date(ts).toLocaleDateString();
}
