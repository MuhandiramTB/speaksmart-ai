export type SkinTone = "light" | "tan" | "medium" | "deep";
export type HairStyle = "long" | "short" | "bun" | "curly" | "buzz" | "wavy" | "bald";
export type HairColor = "black" | "brown" | "blonde" | "auburn" | "gray" | "silver" | "saltpepper";
export type Accessory = "none" | "glasses" | "earrings" | "reading-glasses";
export type AgeBand = "young" | "adult" | "senior";

export type TeachingStyle = "warm" | "direct" | "encouraging" | "playful";
export type Gender = "female" | "male";

export type TutorPreset = {
  id: string;
  name: string;
  tagline: string;
  personality: string; // injected into system prompt
  teachingStyle: TeachingStyle;
  gender: Gender; // used for voice fallback so male tutors never sound female
  career?: string; // optional career badge ("Tech Lead", "Sales Coach", etc.)
  careerPrompt?: string; // optional career-context injection
  ageBand: AgeBand;
  appearance: {
    skin: SkinTone;
    hairStyle: HairStyle;
    hairColor: HairColor;
    accessory: Accessory;
    accent: "brand" | "indigo" | "rose" | "amber" | "emerald" | "violet" | "slate" | "sky";
    facialHair?: "none" | "stubble" | "beard";
  };
  voiceHints: string[];
};

// Common name fragments found across Chrome, Edge, Safari, and Android
// English voices. We over-list so at least one match lands on every device.
export const MALE_VOICE_HINTS = [
  // Chrome/Google
  "Google UK English Male",
  "Google US English Male",
  "Google US English",
  // Microsoft Edge / Windows
  "Microsoft David",
  "Microsoft Mark",
  "Microsoft Guy",
  "Microsoft Brian",
  "Microsoft Eric",
  "Microsoft Davis",
  "Microsoft Christopher",
  "Microsoft Tony",
  "Microsoft Ryan",
  "Microsoft Andrew",
  // Apple
  "Daniel",
  "Alex",
  "Fred",
  "Aaron",
  "Tom",
  "Reed",
  // Amazon Polly
  "Matthew",
  "Joey",
  "Justin",
  // Generic / android
  "Male",
];

export const FEMALE_VOICE_HINTS = [
  "Google UK English Female",
  "Google US English Female",
  "Microsoft Zira",
  "Microsoft Aria",
  "Microsoft Jenny",
  "Microsoft Sonia",
  "Microsoft Libby",
  "Microsoft Catherine",
  "Microsoft Hazel",
  "Samantha",
  "Karen",
  "Tessa",
  "Moira",
  "Victoria",
  "Susan",
  "Joanna",
  "Salli",
  "Ivy",
  "Kendra",
  "Kimberly",
  "Female",
];

export const TUTORS: TutorPreset[] = [
  // -------- Original 6 --------
  {
    id: "maya",
    name: "Maya",
    tagline: "Warm and patient. Great for beginners.",
    personality:
      "warm, patient, and encouraging. You celebrate every effort, never make the learner feel bad, and use simple natural language",
    teachingStyle: "warm",
    gender: "female",
    ageBand: "young",
    appearance: {
      skin: "tan",
      hairStyle: "long",
      hairColor: "black",
      accessory: "none",
      accent: "amber",
    },
    voiceHints: ["Samantha", "Jenny", "Aria", "Joanna", ...FEMALE_VOICE_HINTS],
  },
  {
    id: "alex",
    name: "Alex",
    tagline: "Direct and efficient. Best for professionals.",
    personality:
      "direct, efficient, and professional. You give crisp feedback and stay focused on practical improvement. You skip filler and get to the point",
    teachingStyle: "direct",
    gender: "male",
    ageBand: "adult",
    appearance: {
      skin: "light",
      hairStyle: "short",
      hairColor: "brown",
      accessory: "glasses",
      accent: "brand",
    },
    voiceHints: ["Daniel", "Matthew", "Microsoft Guy", "Microsoft Brian", ...MALE_VOICE_HINTS],
  },
  {
    id: "priya",
    name: "Priya",
    tagline: "Encouraging and detailed. Great teacher.",
    personality:
      "encouraging, thoughtful, and detail-oriented. You praise specific things the learner did well before suggesting improvements. You explain rules clearly",
    teachingStyle: "encouraging",
    gender: "female",
    ageBand: "adult",
    appearance: {
      skin: "medium",
      hairStyle: "bun",
      hairColor: "black",
      accessory: "earrings",
      accent: "rose",
    },
    voiceHints: ["Neerja", "Heera", "Raveena", "Aditi", ...FEMALE_VOICE_HINTS],
  },
  {
    id: "sam",
    name: "Sam",
    tagline: "Playful and fun. Keeps practice light.",
    personality:
      "playful, friendly, and conversational. You use light humor, casual phrases, and make practice feel like chatting with a friend",
    teachingStyle: "playful",
    gender: "female",
    ageBand: "young",
    appearance: {
      skin: "tan",
      hairStyle: "curly",
      hairColor: "auburn",
      accessory: "none",
      accent: "emerald",
    },
    voiceHints: ["Karen", "Olivia", "Tessa", "Libby", ...FEMALE_VOICE_HINTS],
  },
  {
    id: "marcus",
    name: "Marcus",
    tagline: "Calm and steady. Great for nervous learners.",
    personality:
      "calm, steady, and reassuring. You speak slowly and clearly, and you never rush the learner. Your tone is grounded and confidence-building",
    teachingStyle: "warm",
    gender: "male",
    ageBand: "adult",
    appearance: {
      skin: "deep",
      hairStyle: "buzz",
      hairColor: "black",
      accessory: "glasses",
      accent: "indigo",
    },
    voiceHints: ["Microsoft Brian", "Microsoft Eric", "Microsoft Davis", "Microsoft Ryan", ...MALE_VOICE_HINTS],
  },
  {
    id: "luna",
    name: "Luna",
    tagline: "Modern and witty. For confident learners.",
    personality:
      "witty, modern, and sharp. You use contemporary expressions and challenge the learner to push their range. You expect a bit more and reward effort with sharper feedback",
    teachingStyle: "direct",
    gender: "female",
    ageBand: "young",
    appearance: {
      skin: "light",
      hairStyle: "wavy",
      hairColor: "blonde",
      accessory: "earrings",
      accent: "violet",
    },
    voiceHints: ["Aria", "Jenny", "Sonia", "Emma", ...FEMALE_VOICE_HINTS],
  },

  // -------- New 4 adult / career-specialist tutors --------
  {
    id: "ravi",
    name: "Dr. Ravi",
    tagline: "Senior mentor. Medical & healthcare English.",
    career: "Medical English",
    careerPrompt:
      "You specialize in medical English for healthcare workers — doctors, nurses, lab techs. Gently weave in clinical vocabulary (patient, symptom, prescription, consultation) and bedside-manner phrases when appropriate to the scenario",
    personality:
      "experienced, patient, and academically warm. You speak slowly with measured authority, like a senior doctor mentoring a new resident. You explain things thoroughly and never condescend",
    teachingStyle: "encouraging",
    gender: "male",
    ageBand: "senior",
    appearance: {
      skin: "medium",
      hairStyle: "short",
      hairColor: "saltpepper",
      accessory: "glasses",
      accent: "sky",
      facialHair: "stubble",
    },
    voiceHints: ["Ravi", "Prabhat", "Madhur", ...MALE_VOICE_HINTS],
  },
  {
    id: "margaret",
    name: "Margaret",
    tagline: "Executive coach. Boardroom & leadership English.",
    career: "Executive Coach",
    careerPrompt:
      "You specialize in executive and boardroom English for senior professionals. Steer practice toward leadership vocabulary — strategy, stakeholders, alignment, delegation, performance. Push for clear, confident phrasing suitable for senior meetings",
    personality:
      "polished, confident, and warmly authoritative. You speak with the precision of a veteran executive. You expect high standards but coach with respect and never lecture",
    teachingStyle: "direct",
    gender: "female",
    ageBand: "senior",
    appearance: {
      skin: "light",
      hairStyle: "short",
      hairColor: "silver",
      accessory: "earrings",
      accent: "slate",
    },
    voiceHints: ["Sonia", "Catherine", "Susan", "Emma", ...FEMALE_VOICE_HINTS],
  },
  {
    id: "diego",
    name: "Diego",
    tagline: "Casual native friend. Everyday English & slang.",
    career: "Conversation Partner",
    careerPrompt:
      "You're more of a friend than a teacher. Mix in casual idioms, contractions, and natural slang ('gonna', 'kinda', 'no worries', 'totally'). Your goal is to make the learner feel comfortable speaking the way real friends actually talk",
    personality:
      "easygoing, friendly, and genuinely curious about the learner's life. You chat like an old friend over coffee, ask about their day, share quick reactions, and keep the energy warm",
    teachingStyle: "playful",
    gender: "male",
    ageBand: "adult",
    appearance: {
      skin: "tan",
      hairStyle: "short",
      hairColor: "brown",
      accessory: "none",
      accent: "amber",
      facialHair: "beard",
    },
    voiceHints: ["Microsoft Guy", "Microsoft Davis", "Daniel", "Matthew", ...MALE_VOICE_HINTS],
  },
  {
    id: "wei",
    name: "Wei",
    tagline: "Tech lead. Software engineering English.",
    career: "Tech Lead",
    careerPrompt:
      "You specialize in software-engineering English. Steer practice toward standups, code reviews, system design, and PR discussions. Use precise engineering vocabulary (latency, scalability, refactor, rollback) when the scenario calls for it",
    personality:
      "calm, precise, and pragmatic — the way a senior staff engineer speaks. You give thoughtful concrete feedback and respect the learner's time. You're warm but efficient",
    teachingStyle: "encouraging",
    gender: "male",
    ageBand: "adult",
    appearance: {
      skin: "tan",
      hairStyle: "short",
      hairColor: "black",
      accessory: "reading-glasses",
      accent: "indigo",
    },
    voiceHints: ["Liang", "Yunjian", "Microsoft Eric", "Microsoft Guy", ...MALE_VOICE_HINTS],
  },
];

export const DEFAULT_TUTOR_ID = "maya";

export function getTutor(id: string | null | undefined): TutorPreset {
  return TUTORS.find((t) => t.id === id) ?? TUTORS[0];
}

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
