export type Scenario = {
  id: string;
  title: string;
  emoji: string;
  description: string;
  rolePrompt: string;
};

export const SCENARIOS: Scenario[] = [
  {
    id: "free-chat",
    title: "Free Chat",
    emoji: "💬",
    description: "Casual conversation about anything you like.",
    rolePrompt: "a friendly conversation partner chatting casually about everyday topics",
  },
  {
    id: "interview",
    title: "Job Interview",
    emoji: "💼",
    description: "Practice answering common interview questions.",
    rolePrompt:
      "a professional interviewer at a mid-sized company conducting a friendly behavioral interview",
  },
  {
    id: "restaurant",
    title: "Restaurant",
    emoji: "🍽️",
    description: "Order food, ask questions about the menu.",
    rolePrompt: "a waiter at a casual restaurant taking the student's order",
  },
  {
    id: "airport",
    title: "Airport",
    emoji: "✈️",
    description: "Check in, ask about your gate, handle a delay.",
    rolePrompt: "an airline gate agent helping the student check in and find their gate",
  },
  {
    id: "meeting",
    title: "Business Meeting",
    emoji: "📊",
    description: "Discuss a project, give status updates.",
    rolePrompt: "a colleague in a project status meeting discussing weekly progress",
  },
  {
    id: "shopping",
    title: "Shopping",
    emoji: "🛍️",
    description: "Ask about products, prices, sizes.",
    rolePrompt: "a helpful sales associate at a clothing store assisting the student",
  },
];

export function getScenarioById(id: string | null): Scenario {
  return SCENARIOS.find((s) => s.id === id) ?? SCENARIOS[0];
}
