"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type AvatarState = "idle" | "listening" | "thinking" | "speaking";
export type AvatarMood = "neutral" | "happy" | "concerned";

export function TutorAvatar({
  state = "idle",
  mood = "neutral",
  size = 120,
  name,
  trackCursor = true,
}: {
  state?: AvatarState;
  mood?: AvatarMood;
  size?: number;
  name?: string;
  trackCursor?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!trackCursor || state !== "idle") {
      setPupilOffset({ x: 0, y: 0 });
      return;
    }
    function onMove(e: MouseEvent) {
      const el = containerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const max = 2.2;
      const dist = Math.hypot(dx, dy) || 1;
      const norm = Math.min(1, dist / 300);
      setPupilOffset({
        x: (dx / dist) * max * norm,
        y: (dy / dist) * max * norm,
      });
    }
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [trackCursor, state]);

  return (
    <div className="flex flex-col items-center gap-2 select-none">
      <div
        ref={containerRef}
        className="relative transition-transform duration-300"
        style={{ width: size, height: size }}
        aria-label={`Tutor — ${state}`}
        role="img"
      >
        {/* Soft glow ring while listening */}
        {state === "listening" && (
          <>
            <span className="absolute inset-0 rounded-full bg-rose-300/50 animate-tutorPing" />
            <span className="absolute inset-0 rounded-full bg-rose-300/40 animate-tutorPing [animation-delay:0.6s]" />
          </>
        )}
        {state === "speaking" && (
          <span className="absolute inset-0 rounded-full bg-brand-300/40 animate-tutorPing" />
        )}

        {/* Face */}
        <div
          className={cn(
            "relative h-full w-full overflow-hidden rounded-full shadow-lg ring-4 ring-white",
            "bg-gradient-to-b from-amber-100 to-amber-200",
            "transition-all duration-300",
            state === "idle" && "animate-tutorBreathe",
            state === "thinking" && "rotate-[-3deg]"
          )}
        >
          {/* Hair */}
          <div className="absolute -top-1 left-1/2 h-[42%] w-[88%] -translate-x-1/2 rounded-[50%] bg-gradient-to-b from-slate-800 to-slate-700" />
          {/* Bangs */}
          <div className="absolute top-[14%] left-1/2 h-[18%] w-[70%] -translate-x-1/2 rounded-[40%_40%_60%_60%] bg-slate-800" />

          {/* Eyebrows */}
          <Eyebrow side="left" mood={mood} state={state} />
          <Eyebrow side="right" mood={mood} state={state} />

          {/* Eyes */}
          <Eye side="left" state={state} pupilOffset={pupilOffset} />
          <Eye side="right" state={state} pupilOffset={pupilOffset} />

          {/* Cheeks */}
          <span
            className={cn(
              "absolute left-[18%] top-[60%] h-[10%] w-[14%] rounded-full bg-rose-300/70 blur-[2px] transition-opacity duration-300",
              mood === "happy" ? "opacity-100" : "opacity-70"
            )}
          />
          <span
            className={cn(
              "absolute right-[18%] top-[60%] h-[10%] w-[14%] rounded-full bg-rose-300/70 blur-[2px] transition-opacity duration-300",
              mood === "happy" ? "opacity-100" : "opacity-70"
            )}
          />

          {/* Mouth */}
          <Mouth state={state} mood={mood} />

          {/* Thinking dots near head */}
          {state === "thinking" && (
            <div className="absolute -top-3 right-2 flex gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-600 animate-tutorBob" />
              <span className="h-1.5 w-1.5 rounded-full bg-slate-600 animate-tutorBob [animation-delay:0.15s]" />
              <span className="h-1.5 w-1.5 rounded-full bg-slate-600 animate-tutorBob [animation-delay:0.3s]" />
            </div>
          )}
        </div>
      </div>
      {name && (
        <div className="text-center">
          <div className="text-sm font-semibold text-slate-900">{name}</div>
          <div className="text-[11px] uppercase tracking-wide text-slate-500 transition-all duration-300">
            {labelFor(state)}
          </div>
        </div>
      )}
    </div>
  );
}

function Eyebrow({
  side,
  mood,
  state,
}: {
  side: "left" | "right";
  mood: AvatarMood;
  state: AvatarState;
}) {
  const positionClass = side === "left" ? "left-[24%]" : "right-[24%]";
  const moodTransform =
    mood === "happy"
      ? side === "left"
        ? "rotate-[-12deg] -translate-y-1"
        : "rotate-[12deg] -translate-y-1"
      : mood === "concerned"
      ? side === "left"
        ? "rotate-[10deg] translate-y-0.5"
        : "rotate-[-10deg] translate-y-0.5"
      : "rotate-0";
  return (
    <span
      className={cn(
        "absolute top-[38%] h-[3.5%] w-[14%] rounded-full bg-slate-900 transition-all duration-300",
        positionClass,
        moodTransform,
        state === "thinking" && "opacity-80"
      )}
    />
  );
}

function Eye({
  side,
  state,
  pupilOffset,
}: {
  side: "left" | "right";
  state: AvatarState;
  pupilOffset: { x: number; y: number };
}) {
  const positionClass = side === "left" ? "left-[26%]" : "right-[26%]";
  const blinking = state === "idle" || state === "thinking";
  const focused = state === "listening";

  return (
    <div className={cn("absolute top-[46%]", positionClass)}>
      <div
        className={cn(
          "relative h-3.5 w-3.5 rounded-full bg-slate-900 transition-transform duration-200",
          blinking && "animate-tutorBlink",
          focused && "scale-110"
        )}
        style={{
          transform: `translate(${pupilOffset.x}px, ${pupilOffset.y}px)`,
        }}
      >
        <span className="absolute right-0.5 top-0.5 h-1 w-1 rounded-full bg-white/90" />
      </div>
    </div>
  );
}

function Mouth({ state, mood }: { state: AvatarState; mood: AvatarMood }) {
  if (state === "speaking") {
    return (
      <div className="absolute left-1/2 top-[72%] h-[14%] w-[28%] -translate-x-1/2 rounded-[40%] bg-slate-900 animate-tutorTalk" />
    );
  }
  if (state === "listening") {
    return (
      <div className="absolute left-1/2 top-[76%] h-[6%] w-[26%] -translate-x-1/2 rounded-full bg-slate-900" />
    );
  }
  // Smile / neutral / concerned
  const isHappy = mood === "happy";
  const isConcerned = mood === "concerned";
  return (
    <div className="absolute left-1/2 top-[74%] h-[12%] w-[30%] -translate-x-1/2 overflow-hidden">
      <div
        className={cn(
          "absolute inset-x-0 h-[200%] rounded-[50%] transition-all duration-300",
          isConcerned
            ? "top-1 border-t-[3px] border-slate-900" // frown
            : isHappy
            ? "-top-1.5 border-b-[3px] border-slate-900" // bigger smile
            : "-top-1 border-b-[3px] border-slate-900" // gentle smile
        )}
      />
    </div>
  );
}

function labelFor(state: AvatarState): string {
  switch (state) {
    case "listening":
      return "Listening…";
    case "thinking":
      return "Thinking…";
    case "speaking":
      return "Speaking…";
    default:
      return "Ready to chat";
  }
}
