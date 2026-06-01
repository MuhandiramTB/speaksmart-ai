"use client";

import { useEffect, useState } from "react";
import { TRACKS, type TrackLesson, type LearningTrack } from "@/lib/tracks";
import { useSessionStore, useSettings, useTrackProgress, type ActiveLesson } from "@/lib/store";
import { CheckCircle2, Flame, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function TrackPicker() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <section className="mb-10">
      <h2 className="mb-1 text-2xl font-bold text-slate-900">Learning tracks</h2>
      <p className="mb-5 text-slate-600">
        Daily guided lessons. Your progress is saved on this device.
      </p>
      <div className="grid gap-5 lg:grid-cols-2">
        {TRACKS.map((t) => (
          <TrackCard key={t.id} track={t} mounted={mounted} />
        ))}
      </div>
    </section>
  );
}

function TrackCard({ track, mounted }: { track: LearningTrack; mounted: boolean }) {
  const completedLessons = useTrackProgress((s) => s.completedLessons);
  const completedInTrack = mounted
    ? track.lessons.filter((l) => completedLessons[`${track.id}:${l.id}`]).length
    : 0;
  const total = track.lessons.length;
  const pct = total ? Math.round((completedInTrack / total) * 100) : 0;
  const streak = mounted ? computeStreak(track, completedLessons) : 0;

  const accent =
    track.id === "beginner"
      ? { ring: "border-emerald-200", chip: "bg-emerald-100 text-emerald-700", bar: "from-emerald-400 to-emerald-600" }
      : { ring: "border-indigo-200", chip: "bg-indigo-100 text-indigo-700", bar: "from-indigo-400 to-indigo-600" };

  return (
    <div className={cn("rounded-2xl border bg-white p-6 shadow-sm", accent.ring)}>
      <div className="mb-4 flex items-start justify-between">
        <div>
          <div className="mb-1 text-3xl">{track.emoji}</div>
          <h3 className="text-lg font-bold text-slate-900">{track.title}</h3>
          <p className="text-sm text-slate-600">{track.subtitle}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-medium", accent.chip)}>
            {completedInTrack}/{total} done
          </span>
          {streak > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-medium text-amber-700">
              <Flame className="h-3 w-3" />
              {streak} day streak
            </span>
          )}
        </div>
      </div>

      <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn("h-full rounded-full bg-gradient-to-r", accent.bar)}
          style={{ width: `${pct}%` }}
        />
      </div>

      <ul className="space-y-2">
        {track.lessons.map((lesson) => (
          <LessonRow
            key={lesson.id}
            track={track}
            lesson={lesson}
            done={mounted && !!completedLessons[`${track.id}:${lesson.id}`]}
          />
        ))}
      </ul>
    </div>
  );
}

function LessonRow({
  track,
  lesson,
  done,
}: {
  track: LearningTrack;
  lesson: TrackLesson;
  done: boolean;
}) {
  const setScenario = useSessionStore((s) => s.setScenario);
  const setLevel = useSettings((s) => s.setLevel);

  function startLesson() {
    setLevel(track.level);
    const active: ActiveLesson = {
      trackId: track.id,
      lessonId: lesson.id,
      goal: lesson.goal,
      starterLine: lesson.starterLine,
      examples: lesson.examples,
    };
    setScenario(
      {
        id: `${track.id}:${lesson.id}`,
        title: lesson.title,
        emoji: lesson.emoji,
        description: lesson.description,
        rolePrompt: lesson.rolePrompt,
      },
      active
    );
  }

  return (
    <li>
      <button
        type="button"
        onClick={startLesson}
        className={cn(
          "group flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left transition",
          done
            ? "border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50"
            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
        )}
      >
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
              done ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"
            )}
          >
            {done ? <CheckCircle2 className="h-4 w-4" /> : `D${lesson.day}`}
          </span>
          <div>
            <div className="text-sm font-semibold text-slate-900">
              {lesson.emoji} {lesson.title}
            </div>
            <div className="text-xs text-slate-500">{lesson.description}</div>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-slate-400 transition group-hover:text-brand-600" />
      </button>
    </li>
  );
}

function computeStreak(track: LearningTrack, completed: Record<string, string>): number {
  const trackKey = `${track.id}:`;
  const dates = Object.entries(completed)
    .filter(([k]) => k.startsWith(trackKey))
    .map(([, iso]) => new Date(iso).toDateString());
  if (dates.length === 0) return 0;
  const unique = new Set(dates);
  let streak = 0;
  const cursor = new Date();
  while (unique.has(cursor.toDateString())) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

