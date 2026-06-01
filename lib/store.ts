"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Scenario } from "@/lib/scenarios";

export type GrammarResult = {
  isCorrect: boolean;
  corrected: string;
  errorType: string;
  rule: string;
  explanation: string;
  examples: string[];
  encouragement: string;
};

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  pronunciationScore?: number;
  weakWords?: string[];
  grammar?: GrammarResult;
  streaming?: boolean;
  pending?: boolean;
  createdAt: number;
};

export type Level = "beginner" | "intermediate" | "advanced";
export type Accent = "US" | "UK" | "AU";

export type ActiveLesson = {
  trackId: string;
  lessonId: string;
  goal: string;
  starterLine: string;
  examples: string[];
};

type SessionState = {
  scenario: Scenario | null;
  activeLesson: ActiveLesson | null;
  messages: Message[];
  sessionStartedAt: number | null;
  isRecording: boolean;
  setScenario: (s: Scenario | null, lesson?: ActiveLesson | null) => void;
  addMessage: (m: Message) => void;
  patchMessage: (id: string, patch: Partial<Message>) => void;
  removeMessage: (id: string) => void;
  setRecording: (v: boolean) => void;
  startSession: () => void;
  endSession: () => void;
};

export const useSessionStore = create<SessionState>((set) => ({
  scenario: null,
  activeLesson: null,
  messages: [],
  sessionStartedAt: null,
  isRecording: false,
  setScenario: (scenario, lesson = null) => set({ scenario, activeLesson: lesson }),
  addMessage: (m) => set((s) => ({ messages: [...s.messages, m] })),
  patchMessage: (id, patch) =>
    set((s) => ({
      messages: s.messages.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    })),
  removeMessage: (id) =>
    set((s) => ({ messages: s.messages.filter((m) => m.id !== id) })),
  setRecording: (isRecording) => set({ isRecording }),
  startSession: () => set({ sessionStartedAt: Date.now() }),
  endSession: () =>
    set({ messages: [], scenario: null, activeLesson: null, sessionStartedAt: null }),
}));

type Settings = {
  level: Level;
  accent: Accent;
  voiceName: string | null;
  ttsMuted: boolean;
  hasSeenOnboarding: boolean;
  setLevel: (v: Level) => void;
  setAccent: (v: Accent) => void;
  setVoiceName: (v: string | null) => void;
  toggleTtsMute: () => void;
  markOnboardingSeen: () => void;
};

export const useSettings = create<Settings>()(
  persist(
    (set) => ({
      level: "intermediate",
      accent: "US",
      voiceName: null,
      ttsMuted: false,
      hasSeenOnboarding: false,
      setLevel: (level) => set({ level }),
      setAccent: (accent) => set({ accent }),
      setVoiceName: (voiceName) => set({ voiceName }),
      toggleTtsMute: () => set((s) => ({ ttsMuted: !s.ttsMuted })),
      markOnboardingSeen: () => set({ hasSeenOnboarding: true }),
    }),
    { name: "speaksmart-settings" }
  )
);

export type PastSession = {
  id: string;
  scenarioId: string;
  scenarioTitle: string;
  startedAt: number;
  endedAt: number;
  durationSeconds: number;
  avgPronunciationScore: number;
  grammarErrorsCount: number;
  messageCount: number;
  mistakeTypes?: string[];
};

type HistoryState = {
  sessions: PastSession[];
  addSession: (s: PastSession) => void;
  clearHistory: () => void;
};

export const useHistory = create<HistoryState>()(
  persist(
    (set) => ({
      sessions: [],
      addSession: (s) => set((state) => ({ sessions: [s, ...state.sessions].slice(0, 200) })),
      clearHistory: () => set({ sessions: [] }),
    }),
    { name: "speaksmart-history" }
  )
);

export type TrackProgress = {
  completedLessons: Record<string, string>; // trackId+lessonId -> ISO date completed
};

type TrackState = TrackProgress & {
  markLessonComplete: (trackId: string, lessonId: string) => void;
  isLessonComplete: (trackId: string, lessonId: string) => boolean;
  resetTrack: (trackId: string) => void;
};

export const useTrackProgress = create<TrackState>()(
  persist(
    (set, get) => ({
      completedLessons: {},
      markLessonComplete: (trackId, lessonId) =>
        set((state) => ({
          completedLessons: {
            ...state.completedLessons,
            [`${trackId}:${lessonId}`]: new Date().toISOString(),
          },
        })),
      isLessonComplete: (trackId, lessonId) =>
        !!get().completedLessons[`${trackId}:${lessonId}`],
      resetTrack: (trackId) =>
        set((state) => {
          const filtered = Object.fromEntries(
            Object.entries(state.completedLessons).filter(([k]) => !k.startsWith(`${trackId}:`))
          );
          return { completedLessons: filtered };
        }),
    }),
    { name: "speaksmart-tracks" }
  )
);
