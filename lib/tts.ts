"use client";

import { useSyncExternalStore } from "react";

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

export function speak(
  text: string,
  opts?: { voiceName?: string; voiceHints?: string[]; rate?: number }
) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = opts?.rate ?? 1;
  const voices = window.speechSynthesis.getVoices();
  let voice: SpeechSynthesisVoice | undefined;
  if (opts?.voiceName) {
    voice = voices.find((v) => v.name === opts.voiceName);
  }
  if (!voice && opts?.voiceHints) {
    const en = voices.filter((v) => v.lang.startsWith("en"));
    for (const hint of opts.voiceHints) {
      const found = en.find((v) => v.name.toLowerCase().includes(hint.toLowerCase()));
      if (found) {
        voice = found;
        break;
      }
    }
  }
  if (!voice) {
    voice = voices.find((v) => v.lang.startsWith("en"));
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
