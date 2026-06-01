"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useSettings } from "@/lib/store";
import { TutorPicker } from "./TutorPicker";

export function FirstTimeTutorPrompt() {
  const hasPicked = useSettings((s) => s.hasPickedTutor);
  const setTutor = useSettings((s) => s.setTutor);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || hasPicked) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/60 px-4 py-10 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl">
        <button
          type="button"
          onClick={() => setTutor("maya")}
          aria-label="Skip — use default tutor"
          className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100"
        >
          <X className="h-4 w-4" />
        </button>
        <h2 className="text-xl font-bold text-slate-900">Pick your tutor</h2>
        <p className="mt-1 mb-5 text-sm text-slate-600">
          Each tutor has a different personality and voice. You can change anytime in Settings.
        </p>
        <TutorPicker showHeader={false} onChange={() => {}} />
      </div>
    </div>
  );
}
