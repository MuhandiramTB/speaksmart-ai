"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Volume2, Check, AlertCircle } from "lucide-react";
import { TutorAvatar } from "@/components/practice/TutorAvatar";
import { TUTORS, type TutorPreset } from "@/lib/tutors";
import { useSettings } from "@/lib/store";
import { speak, stopSpeaking, previewVoiceForTutor } from "@/lib/tts";
import { cn } from "@/lib/utils";

export function TutorPicker({
  onChange,
  showHeader = true,
}: {
  onChange?: (id: string) => void;
  showHeader?: boolean;
}) {
  const selectedId = useSettings((s) => s.tutorId);
  const setTutor = useSettings((s) => s.setTutor);

  function choose(t: TutorPreset) {
    stopSpeaking();
    setTutor(t.id);
    onChange?.(t.id);
  }

  function preview(t: TutorPreset) {
    speak(`Hi there! I'm ${t.name}. Let's practice English together.`, {
      voiceHints: t.voiceHints,
      gender: t.gender,
      rate: 0.95,
    });
  }

  return (
    <div>
      {showHeader && (
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-900">Choose your tutor</h2>
          <p className="text-sm text-slate-600">Pick the personality that suits you best.</p>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TUTORS.map((t, i) => (
          <TutorCard
            key={t.id}
            tutor={t}
            index={i}
            selected={t.id === selectedId}
            onChoose={() => choose(t)}
            onPreview={() => preview(t)}
          />
        ))}
      </div>
    </div>
  );
}

function TutorCard({
  tutor,
  index,
  selected,
  onChoose,
  onPreview,
}: {
  tutor: TutorPreset;
  index: number;
  selected: boolean;
  onChoose: () => void;
  onPreview: () => void;
}) {
  const voiceInfo = useVoiceInfo(tutor);
  const mismatched = voiceInfo.reason === "fallback" || voiceInfo.reason === "missing";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.04 * index, type: "spring", stiffness: 200, damping: 18 }}
      className={cn(
        "rounded-2xl border bg-white p-5 shadow-sm transition",
        selected ? "border-brand-500 ring-2 ring-brand-500/20" : "border-slate-200"
      )}
    >
      <div className="flex items-center justify-center">
        <TutorAvatar tutor={tutor} state="idle" size={84} trackCursor={false} />
      </div>
      <div className="mt-3 text-center">
        <div className="flex items-center justify-center gap-1.5">
          <h3 className="text-base font-semibold text-slate-900">{tutor.name}</h3>
          {selected && <Check className="h-4 w-4 text-brand-600" />}
        </div>
        {tutor.career && (
          <div className="mt-1 inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
            {tutor.career}
          </div>
        )}
        <p className="mt-1 text-xs text-slate-600">{tutor.tagline}</p>
        {voiceInfo.voice && (
          <p
            className={cn(
              "mt-1.5 text-[10px] tracking-wide",
              mismatched ? "text-amber-700" : "text-slate-400"
            )}
            title={voiceInfo.voice.name}
          >
            {mismatched && <AlertCircle className="mr-1 inline h-3 w-3" />}
            Voice: {shortVoiceName(voiceInfo.voice.name)}
            {mismatched && " (no matching voice on this device)"}
          </p>
        )}
      </div>
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={onPreview}
          aria-label={`Hear ${tutor.name}'s voice`}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          <Volume2 className="h-3.5 w-3.5" />
          Hear
        </button>
        <button
          type="button"
          onClick={onChoose}
          disabled={selected}
          className={cn(
            "flex-1 rounded-full px-3 py-2 text-xs font-semibold text-white shadow",
            selected ? "bg-brand-500 opacity-90" : "bg-brand-600 hover:bg-brand-700"
          )}
        >
          {selected ? "Selected" : "Choose"}
        </button>
      </div>
    </motion.div>
  );
}

function useVoiceInfo(tutor: TutorPreset) {
  const [info, setInfo] = useState<{
    voice: SpeechSynthesisVoice | null;
    reason: "hint" | "gender" | "fallback" | "missing";
  }>({ voice: null, reason: "missing" });

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const compute = () =>
      setInfo(previewVoiceForTutor({ voiceHints: tutor.voiceHints, gender: tutor.gender }));
    compute();
    window.speechSynthesis.onvoiceschanged = compute;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [tutor]);

  return info;
}

function shortVoiceName(name: string): string {
  // Trim long prefixes like "Microsoft Aria Online (Natural) - English (United States)"
  return name
    .replace(/^Microsoft\s+/i, "")
    .replace(/^Google\s+/i, "")
    .replace(/\s*\(.*\)$/, "")
    .replace(/\s*-\s*English.*$/i, "")
    .trim();
}
