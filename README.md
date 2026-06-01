# SpeakSmart

Free AI spoken-English tutor for students. Real-time voice conversation, pronunciation scoring, and grammar correction — built with Next.js 15, Groq, and Supabase. Zero ongoing cost on free tiers.

Built using the **BMad-Method** + **Kiro spec-driven development** standards.

## Features

- Real-time voice conversation with an AI tutor (Groq Llama 3.3 70B)
- Speech-to-text via Groq Whisper-large-v3
- Text-to-speech reply via browser `speechSynthesis`
- Pronunciation score (0–100) per utterance
- Inline grammar correction
- 6 practice scenarios (Job Interview, Restaurant, Airport, Meeting, Shopping, Free Chat)
- Works on phone, tablet, desktop (responsive PWA-ready)

## Tech Stack

| Layer    | Tech                                   |
|----------|----------------------------------------|
| Framework| Next.js 15 (App Router) + TypeScript   |
| Styling  | Tailwind CSS                            |
| AI       | Groq (Whisper + Llama 3.3 70B)         |
| State    | Zustand                                |
| Auth/DB  | Supabase (free tier, optional)         |
| Hosting  | Vercel (free tier)                     |

## Project Layout

```
.bmad-core/                 BMad agent definitions (PM, Architect, SM, Dev, QA)
.kiro/specs/speaksmart/     Kiro specs (requirements.md, design.md, tasks.md)
docs/                       PRD, architecture, sharded stories
app/                        Next.js routes & API handlers
components/practice/        Mic, chat, scenario UI
lib/                        Groq client, prompts, store, audio/TTS helpers
```

## Quick Start

### 1. Install dependencies

```powershell
npm install
```

### 2. Get a free Groq API key

Sign up at [console.groq.com](https://console.groq.com) and create an API key. The free tier is generous: ~14,400 LLM requests/day and plenty of Whisper minutes — far more than a typical student needs.

### 3. Configure environment

```powershell
cp .env.example .env.local
# then open .env.local and paste your GROQ_API_KEY
```

Supabase variables are optional for v1 — the app works in anonymous mode without them.

### 4. Run locally

```powershell
npm run dev
```

Open http://localhost:3000.

### 5. Try it

1. Click **Start practicing free**.
2. Pick a scenario.
3. Tap the microphone and say something in English.
4. Tap again to stop. You'll see your transcript, a pronunciation score, and the AI's reply (spoken aloud).

## Deploy to Vercel (free)

```powershell
npm i -g vercel
vercel
```

Add `GROQ_API_KEY` in Vercel's project settings → Environment Variables. Redeploy.

## Development Workflow

This project follows BMad + Kiro conventions:

1. **PRD** (`docs/prd.md`) defines goals, requirements, epics, stories.
2. **Architecture** (`docs/architecture.md`) defines tech choices and structure.
3. **Kiro requirements** (`.kiro/specs/speaksmart/requirements.md`) restate ACs in EARS format.
4. **Kiro design** (`.kiro/specs/speaksmart/design.md`) details components and data flow.
5. **Kiro tasks** (`.kiro/specs/speaksmart/tasks.md`) is the checklist to implement.
6. **Stories** (`docs/stories/`) are shards of the PRD — one file per story, with QA verdicts.

To extend the app: add a requirement → update the design → add a task → implement → tick the task and update the story file.

## Roadmap

See `docs/prd.md` Epics 2–5:

- **Epic 2** — Pronunciation feedback details + grammar diff UI
- **Epic 3** — Settings (level, accent, voice)
- **Epic 4** — Auth + progress dashboard + streaks
- **Epic 5** — PWA install + onboarding tour + production launch

## License

MIT — share with your fellow students.
