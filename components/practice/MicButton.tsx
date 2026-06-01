"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Square, AlertCircle } from "lucide-react";
import { getMicStream, pickMimeType } from "@/lib/audio";
import { cn } from "@/lib/utils";

type Status = "idle" | "requesting" | "recording" | "processing" | "error";

export function MicButton({
  onAudioReady,
  disabled,
  onStatusChange,
}: {
  onAudioReady: (blob: Blob, mimeType: string) => void | Promise<void>;
  disabled?: boolean;
  onStatusChange?: (status: Status) => void;
}) {
  const [status, setStatusInternal] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const setStatus = (s: Status) => {
    setStatusInternal(s);
    onStatusChange?.(s);
  };

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  async function start() {
    setErrorMsg(null);
    setStatus("requesting");
    try {
      const stream = await getMicStream();
      streamRef.current = stream;
      const mimeType = pickMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, {
          type: mimeType || "audio/webm",
        });
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        setStatus("processing");
        try {
          await onAudioReady(blob, mimeType || "audio/webm");
          setStatus("idle");
        } catch (err) {
          setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
          setStatus("error");
        }
      };
      recorder.start();
      recorderRef.current = recorder;
      setStatus("recording");
    } catch (err) {
      const message =
        err instanceof DOMException && err.name === "NotAllowedError"
          ? "Microphone access was denied. Enable it in your browser settings to practice speaking."
          : err instanceof Error
          ? err.message
          : "Could not access microphone";
      setErrorMsg(message);
      setStatus("error");
    }
  }

  function stop() {
    recorderRef.current?.stop();
    recorderRef.current = null;
  }

  const isRecording = status === "recording";
  const isBusy = status === "requesting" || status === "processing";

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={isRecording ? stop : start}
        disabled={disabled || isBusy}
        aria-label={isRecording ? "Stop recording" : "Start recording"}
        className={cn(
          "relative inline-flex h-20 w-20 items-center justify-center rounded-full text-white shadow-lg transition",
          isRecording
            ? "bg-rose-500 hover:bg-rose-600"
            : "bg-brand-600 hover:bg-brand-700 shadow-brand-600/30",
          (disabled || isBusy) && "opacity-60 cursor-not-allowed"
        )}
      >
        {isRecording && (
          <>
            <span className="absolute inset-0 animate-pulseRing rounded-full bg-rose-500" />
            <span className="absolute inset-0 animate-pulseRing rounded-full bg-rose-500 [animation-delay:0.7s]" />
          </>
        )}
        {isRecording ? <Square className="relative h-8 w-8" /> : <Mic className="relative h-8 w-8" />}
      </button>
      <p className="text-sm text-slate-600">
        {status === "idle" && "Tap to speak"}
        {status === "requesting" && "Requesting mic…"}
        {status === "recording" && "Listening… tap to stop"}
        {status === "processing" && "Transcribing…"}
        {status === "error" && (
          <span className="inline-flex items-center gap-1 text-rose-600">
            <AlertCircle className="h-4 w-4" />
            {errorMsg}
          </span>
        )}
      </p>
    </div>
  );
}
