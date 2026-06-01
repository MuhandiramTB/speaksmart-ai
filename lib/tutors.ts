export type SkinTone = "light" | "tan" | "medium" | "deep";
export type HairStyle = "long" | "short" | "bun" | "curly" | "buzz" | "wavy";
export type HairColor = "black" | "brown" | "blonde" | "auburn" | "gray";
export type Accessory = "none" | "glasses" | "earrings";

export type TeachingStyle = "warm" | "direct" | "encouraging" | "playful";

export type TutorPreset = {
  id: string;
  name: string;
  tagline: string;
  personality: string; // injected into system prompt
  teachingStyle: TeachingStyle;
  appearance: {
    skin: SkinTone;
    hairStyle: HairStyle;
    hairColor: HairColor;
    accessory: Accessory;
    accent: "brand" | "indigo" | "rose" | "amber" | "emerald" | "violet";
  };
  voiceHints: string[]; // partial matches against browser voice names, in priority order
};

export const TUTORS: TutorPreset[] = [
  {
    id: "maya",
    name: "Maya",
    tagline: "Warm and patient. Great for beginners.",
    personality:
      "warm, patient, and encouraging. You celebrate every effort, never make the learner feel bad, and use simple natural language",
    teachingStyle: "warm",
    appearance: {
      skin: "tan",
      hairStyle: "long",
      hairColor: "black",
      accessory: "none",
      accent: "amber",
    },
    voiceHints: ["Samantha", "Jenny", "Aria", "Joanna", "Female"],
  },
  {
    id: "alex",
    name: "Alex",
    tagline: "Direct and efficient. Best for professionals.",
    personality:
      "direct, efficient, and professional. You give crisp feedback and stay focused on practical improvement. You skip filler and get to the point",
    teachingStyle: "direct",
    appearance: {
      skin: "light",
      hairStyle: "short",
      hairColor: "brown",
      accessory: "glasses",
      accent: "brand",
    },
    voiceHints: ["Guy", "Daniel", "Matthew", "Brian", "Male"],
  },
  {
    id: "priya",
    name: "Priya",
    tagline: "Encouraging and detailed. Great teacher.",
    personality:
      "encouraging, thoughtful, and detail-oriented. You praise specific things the learner did well before suggesting improvements. You explain rules clearly",
    teachingStyle: "encouraging",
    appearance: {
      skin: "medium",
      hairStyle: "bun",
      hairColor: "black",
      accessory: "earrings",
      accent: "rose",
    },
    voiceHints: ["Neerja", "Heera", "Raveena", "Aditi", "Female"],
  },
  {
    id: "sam",
    name: "Sam",
    tagline: "Playful and fun. Keeps practice light.",
    personality:
      "playful, friendly, and conversational. You use light humor, casual phrases, and make practice feel like chatting with a friend",
    teachingStyle: "playful",
    appearance: {
      skin: "tan",
      hairStyle: "curly",
      hairColor: "auburn",
      accessory: "none",
      accent: "emerald",
    },
    voiceHints: ["Karen", "Olivia", "Tessa", "Libby", "Female"],
  },
  {
    id: "marcus",
    name: "Marcus",
    tagline: "Calm and steady. Great for nervous learners.",
    personality:
      "calm, steady, and reassuring. You speak slowly and clearly, and you never rush the learner. Your tone is grounded and confidence-building",
    teachingStyle: "warm",
    appearance: {
      skin: "deep",
      hairStyle: "buzz",
      hairColor: "black",
      accessory: "glasses",
      accent: "indigo",
    },
    voiceHints: ["Brian", "Eric", "Davis", "Ryan", "Male"],
  },
  {
    id: "luna",
    name: "Luna",
    tagline: "Modern and witty. For confident learners.",
    personality:
      "witty, modern, and sharp. You use contemporary expressions and challenge the learner to push their range. You expect a bit more and reward effort with sharper feedback",
    teachingStyle: "direct",
    appearance: {
      skin: "light",
      hairStyle: "wavy",
      hairColor: "blonde",
      accessory: "earrings",
      accent: "violet",
    },
    voiceHints: ["Aria", "Jenny", "Sonia", "Emma", "Female"],
  },
];

export const DEFAULT_TUTOR_ID = "maya";

export function getTutor(id: string | null | undefined): TutorPreset {
  return TUTORS.find((t) => t.id === id) ?? TUTORS[0];
}

// Best-effort match of the tutor's preferred voice from the browser's voice list.
export function pickVoiceForTutor(
  tutor: TutorPreset,
  voices: SpeechSynthesisVoice[]
): SpeechSynthesisVoice | null {
  const en = voices.filter((v) => v.lang.startsWith("en"));
  for (const hint of tutor.voiceHints) {
    const found = en.find((v) => v.name.toLowerCase().includes(hint.toLowerCase()));
    if (found) return found;
  }
  return en[0] ?? null;
}
