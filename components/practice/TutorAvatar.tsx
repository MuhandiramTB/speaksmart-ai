"use client";

import { cn } from "@/lib/utils";

export type AvatarState = "idle" | "listening" | "thinking" | "speaking";

export function TutorAvatar({
  state = "idle",
  size = 120,
  name,
}: {
  state?: AvatarState;
  size?: number;
  name?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 select-none">
      <div
        className="relative"
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
            state === "idle" && "animate-tutorBreathe"
          )}
        >
          {/* Hair */}
          <div className="absolute -top-1 left-1/2 h-[42%] w-[88%] -translate-x-1/2 rounded-[50%] bg-gradient-to-b from-slate-800 to-slate-700" />
          {/* Bangs */}
          <div className="absolute top-[14%] left-1/2 h-[18%] w-[70%] -translate-x-1/2 rounded-[40%_40%_60%_60%] bg-slate-800" />

          {/* Eyes */}
          <Eye side="left" state={state} />
          <Eye side="right" state={state} />

          {/* Cheeks */}
          <span className="absolute left-[18%] top-[60%] h-[10%] w-[14%] rounded-full bg-rose-300/70 blur-[2px]" />
          <span className="absolute right-[18%] top-[60%] h-[10%] w-[14%] rounded-full bg-rose-300/70 blur-[2px]" />

          {/* Mouth */}
          <Mouth state={state} />

          {/* Thinking dots near head */}
          {state === "thinking" && (
            <div className="absolute -top-3 right-2 flex gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-600 animate-tutorBob [animation-delay:0s]" />
              <span className="h-1.5 w-1.5 rounded-full bg-slate-600 animate-tutorBob [animation-delay:0.15s]" />
              <span className="h-1.5 w-1.5 rounded-full bg-slate-600 animate-tutorBob [animation-delay:0.3s]" />
            </div>
          )}
        </div>
      </div>
      {name && (
        <div className="text-center">
          <div className="text-sm font-semibold text-slate-900">{name}</div>
          <div className="text-[11px] uppercase tracking-wide text-slate-500">
            {labelFor(state)}
          </div>
        </div>
      )}
    </div>
  );
}

function Eye({ side, state }: { side: "left" | "right"; state: AvatarState }) {
  const positionClass = side === "left" ? "left-[26%]" : "right-[26%]";
  const blinking = state === "idle" || state === "thinking";
  const focused = state === "listening";

  return (
    <div className={cn("absolute top-[44%]", positionClass)}>
      <div
        className={cn(
          "relative h-3.5 w-3.5 rounded-full bg-slate-900",
          blinking && "animate-tutorBlink",
          focused && "scale-110"
        )}
      >
        <span className="absolute right-0.5 top-0.5 h-1 w-1 rounded-full bg-white/90" />
      </div>
    </div>
  );
}

function Mouth({ state }: { state: AvatarState }) {
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
  // idle + thinking: gentle smile
  return (
    <div className="absolute left-1/2 top-[74%] h-[12%] w-[30%] -translate-x-1/2 overflow-hidden">
      <div className="absolute inset-x-0 -top-1 h-[200%] rounded-[50%] border-b-[3px] border-slate-900" />
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
