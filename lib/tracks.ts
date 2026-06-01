export type TrackLesson = {
  id: string;
  day: number;
  title: string;
  emoji: string;
  description: string;
  goal: string;
  rolePrompt: string;
  starterLine: string;
  examples: string[];
};

export type LearningTrack = {
  id: "beginner" | "swe";
  title: string;
  subtitle: string;
  emoji: string;
  level: "beginner" | "intermediate" | "advanced";
  lessons: TrackLesson[];
};

const BEGINNER_LESSONS: TrackLesson[] = [
  {
    id: "beg-day-1",
    day: 1,
    title: "Greetings & Introductions",
    emoji: "👋",
    description: "Say hello, share your name, ask how someone is.",
    goal: "By the end you can confidently introduce yourself and exchange greetings.",
    rolePrompt:
      "a friendly stranger meeting the student for the first time at a community event. Speak slowly and simply, using only beginner-level vocabulary. After every learner reply, gently invite them to use a new greeting or self-introduction phrase. Keep your sentences under 8 words",
    starterLine: "Hi there! Welcome. My name is Maya. What's your name?",
    examples: [
      "Hello! My name is Sam.",
      "Nice to meet you.",
      "How are you today?",
      "I am fine, thank you.",
      "Goodbye! See you tomorrow.",
    ],
  },
  {
    id: "beg-day-2",
    day: 2,
    title: "Daily Routine",
    emoji: "☀️",
    description: "Describe morning, afternoon, and evening activities.",
    goal: "Practice talking about what you do every day in simple sentences.",
    rolePrompt:
      "a curious friend asking the student about their daily routine. Speak slowly using simple present tense only. Ask one short question at a time. Encourage the learner to use words like wake up, eat, work, sleep",
    starterLine: "Good morning! What time do you wake up every day?",
    examples: [
      "I wake up at seven.",
      "I eat breakfast at home.",
      "I go to work at nine.",
      "In the evening I read a book.",
      "I sleep at ten o'clock.",
    ],
  },
  {
    id: "beg-day-3",
    day: 3,
    title: "Asking Simple Questions",
    emoji: "❓",
    description: "Use where, what, when, who to ask everyday questions.",
    goal: "Build confidence asking for information in real life.",
    rolePrompt:
      "a helpful information desk clerk. Encourage the learner to ASK questions using where/what/when/who. After they ask, give a short clear answer, then prompt them to ask another question",
    starterLine: "Hi! I'm here to help. What would you like to know?",
    examples: [
      "Where is the bathroom?",
      "What time is it?",
      "When does the bus come?",
      "Who is your teacher?",
      "What is your favorite food?",
    ],
  },
  {
    id: "beg-day-4",
    day: 4,
    title: "Family & Describing People",
    emoji: "👨‍👩‍👧",
    description: "Talk about your family and describe people you know.",
    goal: "Use simple adjectives (tall, kind, funny) and possessives (my, his, her).",
    rolePrompt:
      "a kind new neighbor curious about the student's family. Ask short simple questions about their family members one at a time. Model and encourage descriptive words like tall, kind, funny, smart",
    starterLine: "Hi neighbor! Tell me — do you have any brothers or sisters?",
    examples: [
      "I have one brother.",
      "My mother is very kind.",
      "My friend is tall and funny.",
      "She is a good teacher.",
      "He likes to play cricket.",
    ],
  },
];

const SWE_LESSONS: TrackLesson[] = [
  {
    id: "swe-standup",
    day: 1,
    title: "Daily Standup",
    emoji: "📋",
    description: "Give a clear yesterday / today / blockers update.",
    goal: "Practice a 30-second standup update without rambling.",
    rolePrompt:
      "a scrum master running the team's daily standup. Greet the engineer, ask for their update using the three standup questions, then ask one short follow-up about blockers or scope. Stay professional and concise",
    starterLine:
      "Morning! Quick standup — what did you ship yesterday, what's on your plate today, and any blockers?",
    examples: [
      "Yesterday I finished the login refactor.",
      "Today I'm picking up the API caching ticket.",
      "I'm blocked on a credentials issue — DevOps is helping.",
      "I'll have the PR up by lunch.",
      "Could we pair on the migration after standup?",
    ],
  },
  {
    id: "swe-sprint",
    day: 2,
    title: "Sprint Planning",
    emoji: "🗓️",
    description: "Discuss ticket complexity, scope, and estimates.",
    goal: "Practice pushing back on scope and proposing alternatives professionally.",
    rolePrompt:
      "an engineering manager leading sprint planning. Walk through a hypothetical ticket and ask the engineer for their estimate, risks, and dependencies. Probe their reasoning. Be friendly but rigorous",
    starterLine:
      "Let's look at PROJ-412 — the search relevance ticket. What's your gut on the estimate and what do you think the main risks are?",
    examples: [
      "I'd estimate three days, mostly because of the index migration.",
      "The main risk is the read-write coupling on the legacy table.",
      "Could we split this into a smaller spike first?",
      "I'd want to validate the assumption about traffic before committing.",
      "Happy to take it on if we de-scope the analytics piece.",
    ],
  },
  {
    id: "swe-codereview",
    day: 3,
    title: "Code Review Discussion",
    emoji: "🔍",
    description: "Explain your PR, defend or revise a design choice.",
    goal: "Practice agreeing and disagreeing politely with technical reasons.",
    rolePrompt:
      "a senior engineer reviewing the student's pull request. Ask one specific question about a design choice (e.g., 'why a hashmap instead of a set here?'), then push gently on their answer. Be friendly but technical",
    starterLine:
      "Thanks for the PR! I had one question — why did you pick a hashmap here instead of a set? Walk me through your thinking.",
    examples: [
      "I used a hashmap because we also need the count, not just membership.",
      "Good point — I can refactor to a set if we drop the count.",
      "I see your concern; let me add a benchmark before we decide.",
      "I disagree slightly — the readability win outweighs the micro-cost.",
      "I'll address that comment and push another commit shortly.",
    ],
  },
  {
    id: "swe-presentation",
    day: 4,
    title: "Technical Presentation",
    emoji: "📊",
    description: "Present a feature or architecture and handle Q&A.",
    goal: "Practice structuring an opening, walking through a system, and fielding questions.",
    rolePrompt:
      "an engineer in the audience of the student's tech talk. Ask probing but supportive questions about their architecture choices, trade-offs, and how it would scale. One question at a time",
    starterLine:
      "Thanks for presenting. Could you walk us through the request flow when a user hits the search endpoint?",
    examples: [
      "Sure — the request enters the edge gateway first, then hits our query service.",
      "We chose this trade-off to keep tail latency under 200ms.",
      "Great question — we haven't load-tested past 10k QPS yet.",
      "We plan to address that in the next quarter.",
      "Happy to share the design doc after the talk.",
    ],
  },
  {
    id: "swe-interview",
    day: 5,
    title: "Tech Interview Answers",
    emoji: "🎤",
    description: "Behavioral + system design — clear, structured answers.",
    goal: "Practice the STAR pattern and high-level system reasoning.",
    rolePrompt:
      "a friendly interviewer at a tech company. Alternate between behavioral questions (tell me about a project, biggest challenge) and one open-ended system design prompt. Ask follow-ups that probe trade-offs",
    starterLine:
      "Let's start with — tell me about a project you're proud of and what was hard about it.",
    examples: [
      "Recently I rebuilt our notification pipeline to cut latency in half.",
      "The biggest challenge was the migration without downtime.",
      "I'd start with the read path and design for cache-first.",
      "The main trade-off would be consistency vs. cost.",
      "I'd validate with a small load test before rolling out.",
    ],
  },
  {
    id: "swe-1on1",
    day: 6,
    title: "1:1 with Manager",
    emoji: "🤝",
    description: "Discuss goals, ask for feedback, raise concerns professionally.",
    goal: "Practice raising hard topics with confidence and respect.",
    rolePrompt:
      "the student's engineering manager in a weekly 1:1. Ask how things are going, what's on their mind, and what they want to focus on this quarter. Probe gently if they bring up a concern. Be supportive",
    starterLine:
      "Good to see you. How's the week going so far — anything on your mind I can help with?",
    examples: [
      "Things are going well, but I'd love feedback on my last project.",
      "I'd like to grow into more system-design work this quarter.",
      "I've been feeling stretched thin — can we talk about scope?",
      "Could we discuss the promotion path soon?",
      "What's one thing I should focus on next?",
    ],
  },
  {
    id: "swe-review",
    day: 7,
    title: "Performance Review",
    emoji: "📈",
    description: "Talk about wins, areas to grow, and your goals.",
    goal: "Practice summarizing impact and discussing growth without bragging or being shy.",
    rolePrompt:
      "the student's manager running their semi-annual performance review. Ask them to walk through their highlights, growth areas, and one thing they'd do differently. Be encouraging and probing",
    starterLine:
      "Let's start with the highlights — what are you most proud of from the last six months?",
    examples: [
      "My biggest impact was leading the search migration to production.",
      "I learned a lot about scoping and saying no early.",
      "An area I want to grow is mentoring junior engineers.",
      "If I could redo one thing, I'd communicate the timeline risk sooner.",
      "Next half, I want to take ownership of an end-to-end feature.",
    ],
  },
  {
    id: "swe-incident",
    day: 8,
    title: "Incident Postmortem",
    emoji: "🚨",
    description: "Walk through what happened, why, and how to prevent recurrence.",
    goal: "Practice blameless incident communication.",
    rolePrompt:
      "a colleague joining the student's blameless postmortem. Ask the student to walk through timeline, root cause, and follow-ups. Push gently for specificity, not blame",
    starterLine:
      "Thanks for hosting this postmortem. Could you walk us through the timeline of what happened?",
    examples: [
      "At 14:02 UTC the on-call paged for elevated error rate.",
      "The root cause was a stale config in the deploy pipeline.",
      "We mitigated by rolling back within twelve minutes.",
      "The trigger was a misconfigured environment variable.",
      "Our follow-up is to add a validation step before deploy.",
    ],
  },
];

export const TRACKS: LearningTrack[] = [
  {
    id: "beginner",
    title: "Beginner English",
    subtitle: "4 guided days — greetings to full sentences",
    emoji: "🌱",
    level: "beginner",
    lessons: BEGINNER_LESSONS,
  },
  {
    id: "swe",
    title: "Software Engineer",
    subtitle: "8 daily scenarios — standups, reviews, interviews",
    emoji: "💻",
    level: "advanced",
    lessons: SWE_LESSONS,
  },
];

export function getTrack(id: string): LearningTrack | undefined {
  return TRACKS.find((t) => t.id === id);
}

export function getLesson(trackId: string, lessonId: string): TrackLesson | undefined {
  return getTrack(trackId)?.lessons.find((l) => l.id === lessonId);
}
