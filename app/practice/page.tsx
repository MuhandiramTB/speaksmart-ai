"use client";

import { useSessionStore } from "@/lib/store";
import { ScenarioPicker } from "@/components/practice/ScenarioPicker";
import { PracticeRoom } from "@/components/practice/PracticeRoom";

export default function PracticePage() {
  const scenario = useSessionStore((s) => s.scenario);
  return scenario ? <PracticeRoom /> : <ScenarioPicker />;
}
