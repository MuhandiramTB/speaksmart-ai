"use client";

export function speak(text: string, opts?: { voiceName?: string; rate?: number }) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = opts?.rate ?? 1;
  if (opts?.voiceName) {
    const voice = window.speechSynthesis.getVoices().find((v) => v.name === opts.voiceName);
    if (voice) utterance.voice = voice;
  } else {
    const enVoice = window.speechSynthesis.getVoices().find((v) => v.lang.startsWith("en"));
    if (enVoice) utterance.voice = enVoice;
  }
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
}
