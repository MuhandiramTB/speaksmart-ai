# SpeakSmart — Product Requirements Document (PRD)

**Authored by:** BMad PM Agent
**Date:** 2026-06-01
**Status:** v1 Draft

---

## 1. Goals and Background Context

### Goals
- Provide a **free** alternative to paid spoken-English-improvement apps (e.g., ELSA, FluentU, Cambly).
- Help students practice English speaking with **realistic, judgement-free AI conversation**.
- Give **actionable feedback** on pronunciation, grammar, and fluency.
- Be **accessible from any browser** (desktop or phone) — no app-store install required.

### Background Context
Paid spoken-English apps charge $10–$30/month, which is unaffordable for many students globally. Recent advances in open-weight LLMs (Llama 3.3) and fast inference platforms (Groq) make it feasible to deliver high-quality conversational AI tutoring at zero ongoing cost using free API tiers. The user wants to build and share this with fellow students.

### Change Log
| Date       | Version | Description           | Author    |
|------------|---------|-----------------------|-----------|
| 2026-06-01 | 0.1     | Initial PRD draft     | PM Agent  |

---

## 2. Requirements

### Functional Requirements
- **FR1** The user can press a button to start recording their voice in the browser.
- **FR2** The system transcribes the user's speech to text using Groq Whisper.
- **FR3** The system sends the transcript to an AI tutor (Llama 3.3 70B on Groq) and receives a conversational reply.
- **FR4** The system speaks the AI reply aloud using the browser's Web Speech API.
- **FR5** After each user utterance, the system shows a pronunciation score (0–100) and highlights weakly-pronounced words.
- **FR6** After each user utterance, the system shows grammar corrections with a diff view (original → corrected).
- **FR7** The user can pick from preset practice scenarios (Job Interview, Restaurant, Airport, Meeting, Shopping, Free Chat).
- **FR8** The user can sign up / sign in (email + password via Supabase Auth) to save progress across sessions.
- **FR9** A progress dashboard shows: total practice minutes, average pronunciation score over time, common grammar mistakes, and streak.
- **FR10** Conversations are saved per user and viewable as transcripts.

### Non-Functional Requirements
- **NFR1** Time-to-first-AI-reply must be **under 3 seconds** on a typical home internet connection.
- **NFR2** App must run entirely on free tiers (Groq free, Supabase free, Vercel free) for typical student usage (~50 min/day).
- **NFR3** App must be responsive — usable on phone, tablet, and desktop.
- **NFR4** All audio processing must happen via streaming where possible to feel "real-time."
- **NFR5** No personally identifiable information beyond email is stored. Audio is **not** retained on server after transcription.
- **NFR6** Accessibility: keyboard navigation works for all controls; screen-reader-friendly labels.

---

## 3. User Interface Design Goals

### Overall UX Vision
A calm, encouraging space — not a test. Big central microphone button. Conversations flow vertically like a chat. Feedback appears unobtrusively below each user message. Color palette favors warm greens/blues to feel safe.

### Core Screens
1. **Landing** — value prop, "Start practicing free" CTA.
2. **Scenario Picker** — grid of scenario cards.
3. **Practice (main screen)** — chat view + record button + live feedback panel.
4. **Progress Dashboard** — stats, charts, recent sessions.
5. **Auth** — sign in / sign up.
6. **Settings** — voice preference, target accent (US/UK/AU), level (beginner/intermediate/advanced).

### Branding
Friendly, modern, education-positive. Inter font. Rounded corners. Subtle micro-animations on the record button (pulse while recording).

### Target Platforms
**Web Responsive** — works in Chrome/Edge/Safari/Firefox on any screen size. Installable as PWA.

---

## 4. Technical Assumptions

- **Repository Structure:** Monorepo (single Next.js app).
- **Service Architecture:** Serverless (Next.js Route Handlers on Vercel) calling Groq + Supabase.
- **Testing:** Vitest for units, Playwright for e2e on critical flows.
- **Languages:** TypeScript (strict mode).
- **Style:** Tailwind CSS with shadcn/ui component primitives.

---

## 5. Epics

### Epic 1: Foundation & Voice Loop
Establish project scaffolding, deploy a Hello World to Vercel, and ship the core capture → transcribe → reply → speak loop with a single hardcoded scenario.

### Epic 2: Feedback Layer
Add pronunciation scoring and grammar correction visible after every user utterance.

### Epic 3: Scenarios & Personalization
Multiple practice scenarios, level selection, accent preference.

### Epic 4: Persistence & Progress
Supabase auth, conversation history, progress dashboard with charts.

### Epic 5: Polish & Launch
PWA install, onboarding tour, share button, deploy production.

---

## 6. Epic 1 Stories

### Story 1.1: Project Scaffold
**As a** developer
**I want** a Next.js 15 + TS + Tailwind + shadcn/ui project pushed to GitHub and deployed to Vercel
**so that** every subsequent change can be previewed live.

**Acceptance Criteria:**
1. `npm run dev` boots without error.
2. Landing page renders "SpeakSmart" + hero text.
3. Deployed to Vercel with a public URL.
4. ESLint + TypeScript strict mode enabled.

### Story 1.2: Voice Capture
**As a** student
**I want** to press a button and record my voice in the browser
**so that** I can speak to the AI tutor.

**Acceptance Criteria:**
1. A microphone button is visible on the practice page.
2. Clicking it requests microphone permission.
3. Recording starts; button shows a pulsing animation.
4. Clicking again stops recording and produces a WAV/WebM Blob.
5. Permission denial shows a helpful message.

### Story 1.3: Speech-to-Text
**As a** student
**I want** my recorded speech transcribed to text
**so that** the AI can understand me.

**Acceptance Criteria:**
1. Recorded audio is POSTed to `/api/transcribe`.
2. The route calls Groq Whisper-large-v3 and returns the transcript.
3. Transcript appears in the chat thread as a user message.
4. Errors (network, API quota) show a non-blocking toast.

### Story 1.4: AI Tutor Reply
**As a** student
**I want** the AI to reply to what I said
**so that** we have a real conversation.

**Acceptance Criteria:**
1. After transcription, the transcript + system prompt are sent to `/api/chat`.
2. The route calls Groq Llama 3.3 70B with a "patient English tutor" system prompt.
3. Reply streams into the chat thread.
4. Conversation history is included in each subsequent call.

### Story 1.5: Text-to-Speech Reply
**As a** student
**I want** to hear the AI's reply spoken aloud
**so that** I can practice listening too.

**Acceptance Criteria:**
1. When a new AI message arrives, it is spoken via `window.speechSynthesis`.
2. The user can mute/unmute TTS.
3. Voice can be chosen from available system voices (English only).

---

(Epic 2–5 stories are drafted in `docs/stories/` after Epic 1 ships.)
