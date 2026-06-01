"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

export function ShareButton() {
  const [shared, setShared] = useState(false);

  async function handleShare() {
    const url = typeof window !== "undefined" ? window.location.origin : "";
    const data = {
      title: "SpeakSmart — Free AI English Tutor",
      text: "I'm practicing spoken English with this free AI tutor. Try it!",
      url,
    };
    try {
      if (navigator.share) {
        await navigator.share(data);
      } else {
        await navigator.clipboard.writeText(url);
      }
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch {
      /* user dismissed */
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
    >
      {shared ? <Check className="h-4 w-4 text-emerald-600" /> : <Share2 className="h-4 w-4" />}
      {shared ? "Copied!" : "Share with a friend"}
    </button>
  );
}
