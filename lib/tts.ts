"use client";

import { useSyncExternalStore } from "react";
import { FEMALE_VOICE_HINTS, MALE_VOICE_HINTS } from "@/lib/tutors";

type Listener = () => void;

let speakingState = false;
const listeners = new Set<Listener>();

function setSpeaking(value: boolean) {
  if (speakingState === value) return;
  speakingState = value;
  listeners.forEach((l) => l());
}

export function useIsSpeaking(): boolean {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => speakingState,
    () => false
  );
}

// Heuristic gender detection for voices whose name doesn't include "Male"/"Female".
// Common voice names by gender across Chrome/Edge/Safari/Android.
const KNOWN_MALE = new Set(
  [
    "david",
    "mark",
    "guy",
    "brian",
    "eric",
    "davis",
    "christopher",
    "tony",
    "ryan",
    "andrew",
    "daniel",
    "fred",
    "aaron",
    "tom",
    "reed",
    "matthew",
    "joey",
    "justin",
    "alex", // Apple Alex voice is male
    "ravi",
    "prabhat",
    "madhur",
    "liang",
    "yunjian",
  ].map((s) => s.toLowerCase())
);

const KNOWN_FEMALE = new Set(
  [
    "zira",
    "aria",
    "jenny",
    "sonia",
    "libby",
    "catherine",
    "hazel",
    "samantha",
    "karen",
    "tessa",
    "moira",
    "victoria",
    "susan",
    "joanna",
    "salli",
    "ivy",
    "kendra",
    "kimberly",
    "olivia",
    "emma",
    "ava",
    "neerja",
    "heera",
    "raveena",
    "aditi",
  ].map((s) => s.toLowerCase())
);

function voiceGender(v: SpeechSynthesisVoice): "male" | "female" | "unknown" {
  const lower = v.name.toLowerCase();
  if (lower.includes("male") && !lower.includes("female")) return "male";
  if (lower.includes("female")) return "female";
  for (const m of KNOWN_MALE) {
    if (lower.includes(m)) return "male";
  }
  for (const f of KNOWN_FEMALE) {
    if (lower.includes(f)) return "female";
  }
  return "unknown";
}

export function speak(
  text: string,
  opts?: {
    voiceName?: string;
    voiceHints?: string[];
    gender?: "male" | "female";
    rate?: number;
  }
) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = opts?.rate ?? 1;
  const voices = window.speechSynthesis.getVoices();
  const en = voices.filter((v) => v.lang.startsWith("en"));
  let voice: SpeechSynthesisVoice | undefined;

  // 1) Exact user-chosen voice
  if (opts?.voiceName) {
    voice = voices.find((v) => v.name === opts.voiceName);
  }

  // 2) First matching hint
  if (!voice && opts?.voiceHints) {
    for (const hint of opts.voiceHints) {
      const found = en.find((v) => v.name.toLowerCase().includes(hint.toLowerCase()));
      if (found) {
        voice = found;
        break;
      }
    }
  }

  // 3) Any English voice of the requested gender (so a "male" tutor never sounds female)
  if (!voice && opts?.gender) {
    voice = en.find((v) => voiceGender(v) === opts.gender);
  }

  // 4) Last resort — any English voice
  if (!voice) {
    voice = en[0] ?? voices[0];
  }
  if (voice) utterance.voice = voice;

  utterance.onstart = () => setSpeaking(true);
  utterance.onend = () => setSpeaking(false);
  utterance.onerror = () => setSpeaking(false);
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  setSpeaking(false);
}

// Public helper so UI can show which voice will be used + warn if no
// gender-appropriate voice exists on the user's device.
export function previewVoiceForTutor(opts: {
  voiceHints: string[];
  gender: "male" | "female";
}): { voice: SpeechSynthesisVoice | null; reason: "hint" | "gender" | "fallback" | "missing" } {
  if (typeof window === "undefined" || !("speechSynthesis" in window))
    return { voice: null, reason: "missing" };
  const voices = window.speechSynthesis.getVoices();
  const en = voices.filter((v) => v.lang.startsWith("en"));
  for (const hint of opts.voiceHints) {
    const found = en.find((v) => v.name.toLowerCase().includes(hint.toLowerCase()));
    if (found) return { voice: found, reason: "hint" };
  }
  const byGender = en.find((v) => voiceGender(v) === opts.gender);
  if (byGender) return { voice: byGender, reason: "gender" };
  const any = en[0];
  return { voice: any ?? null, reason: any ? "fallback" : "missing" };
}

// Suppress unused-import warning while keeping the constants available for
// callers who import them through this module.
export const _voiceHints = { MALE_VOICE_HINTS, FEMALE_VOICE_HINTS };
