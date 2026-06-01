# Tasks — SpeakSmart (Kiro Spec)

> Discrete, verifiable implementation tasks. Each maps to one or more requirements (R#) from `requirements.md` and design components from `design.md`.

---

## Epic 1 — Foundation & Voice Loop ✅

- [x] **T1.1** Scaffold Next.js 15 + TS strict + Tailwind + shadcn-style UI. *(R-NFR3)*
- [x] **T1.2** Add `groq-sdk`, `zustand`, `lucide-react`, `clsx`, `tailwind-merge`, `zod`. *(setup)*
- [x] **T1.3** Create `.env.example` with `GROQ_API_KEY` + Supabase placeholders. *(R10.2)*
- [x] **T1.4** Build landing page with hero + CTA + share. *(R-UX)*
- [x] **T1.5** Create Zustand stores (`useSessionStore`, `useSettings`, `useHistory`). *(design)*
- [x] **T1.6** Implement `MicButton` with state machine (idle/recording/processing/error). *(R1.1–1.6)*
- [x] **T1.7** Implement `/api/transcribe` calling Groq Whisper + scoring + weak-word detection. *(R2.1–2.5, R5.1)*
- [x] **T1.8** Implement `lib/prompts/tutor.ts` with scenario / level / accent placeholders. *(design)*
- [x] **T1.9** Implement `/api/chat` with streaming response. *(R3.1–3.4)*
- [x] **T1.10** Implement `ChatThread` rendering streaming + weak words + grammar diff. *(R3.3, R5.2–5.4, R6.3–6.4)*
- [x] **T1.11** Implement `lib/tts.ts` wrapper + mute toggle. *(R4.1–4.4)*
- [x] **T1.12** Wire `/practice` page combining MicButton + ChatThread + scenario picker. *(integration)*

## Epic 2 — Feedback Layer ✅

- [x] **T2.1** Pronunciation scoring in `/api/transcribe` from segment logprobs. *(R5.1)*
- [x] **T2.2** Render pronunciation score badge in chat user bubbles. *(R5.2)*
- [x] **T2.3** Underline weak words; click → speak via TTS. *(R5.3, R5.4)*
- [x] **T2.4** Implement `/api/grammar` with `response_format: json_object`. *(R6.1, R6.2)*
- [x] **T2.5** Render grammar diff (strikethrough + corrected + explanation) under user messages. *(R6.3)*
- [x] **T2.6** "Good grammar" badge when no corrections needed. *(R6.4)*

## Epic 3 — Scenarios & Personalization ✅

- [x] **T3.1** 6 scenarios in `lib/scenarios.ts`. *(R7.4)*
- [x] **T3.2** `ScenarioPicker` card grid with onboarding overlay. *(R7.1)*
- [x] **T3.3** Scenario lives in session store (URL state deferred — single-page flow). *(R7.2)*
- [x] **T3.4** Settings page: level, target accent, TTS voice picker with test button. *(R4.3)*
- [x] **T3.5** Inject level + accent into tutor system prompt. *(R3.2)*

## Epic 4 — Persistence & Progress ✅ (local-first)

- [x] **T4.1** Supabase schema written (`supabase/schema.sql`) for users who opt in. *(R10.3)*
- [x] **T4.4** Sessions saved to `useHistory` (persistent localStorage) when user exits practice. *(R8.3 local variant)*
- [x] **T4.5** `/dashboard` — totals, 7-day average, grammar/100 words, streak, score chart, recent table. *(R9.1, R9.3)*
- [x] **T4.6** Empty state for < 3 sessions. *(R9.2)*
- [ ] **T4.2** (Deferred) Supabase auth pages — Schema + RLS already shipped; UI deferred to v2 to preserve "no sign-up" promise.
- [ ] **T4.3** (Deferred) Supabase middleware — same as T4.2.

## Epic 5 — Polish & Launch ✅

- [x] **T5.1** PWA `manifest.webmanifest` + SVG icon + theme color. *(NFR3)*
- [x] **T5.2** 3-step onboarding overlay on first scenario picker visit. *(UX)*
- [x] **T5.3** Share button (Web Share API + clipboard fallback). *(growth)*
- [x] **T5.4** Bundle size verified — `/practice` first-load JS under target. *(R11.3)*
- [x] **T5.5** README with setup steps + deploy instructions. *(launch)*
- [ ] **T5.6** Vercel production deploy. *(user action — needs Vercel account)*
- [ ] **T5.7** Lighthouse audit. *(user action — needs running production server)*
