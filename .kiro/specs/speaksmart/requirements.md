# Requirements — SpeakSmart (Kiro Spec)

> Kiro spec-driven format. Acceptance criteria use **EARS** notation:
> *Event-Driven*: WHEN `<trigger>` THEN the system SHALL `<response>`.
> *State-Driven*: WHILE `<state>` the system SHALL `<behavior>`.
> *Optional*: WHERE `<feature included>` the system SHALL `<behavior>`.
> *Unwanted*: IF `<unwanted condition>` THEN the system SHALL `<mitigation>`.

---

## 1. Introduction

SpeakSmart is a free web app that helps students improve spoken English through real-time AI-powered conversation, pronunciation feedback, and grammar correction. It runs entirely on free-tier services (Groq, Supabase, Vercel) so it remains accessible to learners worldwide at zero cost.

---

## 2. Requirements

### Requirement 1: Voice Capture

**User Story:** As a student, I want to record my voice in the browser, so that I can speak to the AI tutor without installing anything.

**Acceptance Criteria:**
1.1 WHEN the user clicks the microphone button THEN the system SHALL request browser microphone permission.
1.2 WHEN microphone permission is granted THEN the system SHALL begin recording audio via `MediaRecorder`.
1.3 WHILE recording is active the system SHALL display a visible pulsing animation on the microphone button.
1.4 WHEN the user clicks the microphone button a second time THEN the system SHALL stop recording and produce an audio Blob.
1.5 IF microphone permission is denied THEN the system SHALL display a friendly message explaining how to enable it.
1.6 IF the browser does not support `MediaRecorder` THEN the system SHALL display a fallback message naming compatible browsers.

### Requirement 2: Speech Transcription

**User Story:** As a student, I want my speech transcribed to text, so the AI can understand what I said.

**Acceptance Criteria:**
2.1 WHEN the user stops recording THEN the system SHALL POST the audio Blob to `/api/transcribe`.
2.2 WHEN `/api/transcribe` receives audio THEN the system SHALL call Groq Whisper-large-v3 and return the transcript as JSON.
2.3 WHEN a transcript is returned THEN the system SHALL render it as a user message in the chat thread within 2 seconds of upload completion.
2.4 IF transcription fails (network/quota) THEN the system SHALL show a non-blocking toast with a retry button.
2.5 WHILE transcription is in progress the system SHALL show a "Transcribing…" indicator on the pending user message.

### Requirement 3: AI Tutor Reply

**User Story:** As a student, I want the AI to reply naturally to what I said, so that I can have a real conversation.

**Acceptance Criteria:**
3.1 WHEN a user transcript is added to the conversation THEN the system SHALL POST the full conversation history to `/api/chat`.
3.2 WHEN `/api/chat` is invoked THEN the system SHALL call Groq `llama-3.3-70b-versatile` with a tutor system prompt that includes the active scenario.
3.3 WHEN the model streams tokens THEN the system SHALL render them progressively in the chat thread.
3.4 IF the model returns an error THEN the system SHALL show a non-blocking toast and keep the user's message in the thread.

### Requirement 4: Spoken AI Reply (TTS)

**User Story:** As a student, I want to hear the AI's reply spoken aloud, so I can practice listening.

**Acceptance Criteria:**
4.1 WHEN a complete AI message is rendered THEN the system SHALL speak it via `window.speechSynthesis`.
4.2 WHERE the user has muted TTS the system SHALL NOT speak the reply.
4.3 WHEN the user changes the selected voice in settings THEN the system SHALL use that voice for subsequent replies.
4.4 IF `window.speechSynthesis` is unavailable THEN the system SHALL hide TTS-related controls.

### Requirement 5: Pronunciation Feedback

**User Story:** As a student, I want to see how well I pronounced what I said, so I know what to improve.

**Acceptance Criteria:**
5.1 WHEN a transcript is returned from `/api/transcribe` with per-word logprobs THEN the system SHALL compute a 0–100 pronunciation score.
5.2 WHEN the score is computed THEN the system SHALL display it next to the user message.
5.3 WHEN any word's confidence is below the configured threshold THEN the system SHALL underline that word in red in the chat.
5.4 WHEN the user clicks an underlined word THEN the system SHALL play TTS of the correct pronunciation.

### Requirement 6: Grammar Correction

**User Story:** As a student, I want to see grammar fixes for my utterance, so I learn from mistakes.

**Acceptance Criteria:**
6.1 WHEN a user message is added THEN the system SHALL POST it to `/api/grammar`.
6.2 WHEN `/api/grammar` is invoked THEN the system SHALL call the LLM with a JSON-schema-constrained prompt returning `{ corrected: string, diffs: [...] }`.
6.3 WHEN a correction is returned THEN the system SHALL display the diff inline beneath the user message (original strikethrough, corrected highlighted).
6.4 IF the original is already grammatically correct THEN the system SHALL display a subtle "Good!" badge.

### Requirement 7: Scenario Selection

**User Story:** As a student, I want to pick a practice scenario, so my conversation has context.

**Acceptance Criteria:**
7.1 WHEN the user lands on `/practice` without a chosen scenario THEN the system SHALL display the Scenario Picker.
7.2 WHEN the user selects a scenario THEN the system SHALL store it in URL state and seed the tutor system prompt with that scenario.
7.3 WHEN the user clicks "Change scenario" mid-session THEN the system SHALL prompt for confirmation before ending the current session.
7.4 The system SHALL ship with at least 6 scenarios: Job Interview, Restaurant, Airport, Business Meeting, Shopping, Free Chat.

### Requirement 8: Authentication

**User Story:** As a returning student, I want to sign in, so my progress is saved.

**Acceptance Criteria:**
8.1 WHEN an anonymous user finishes a practice session THEN the system SHALL prompt them to "Save progress — sign up free."
8.2 WHEN the user submits the sign-up form THEN the system SHALL create a Supabase auth user via email + password.
8.3 WHEN a signed-in user starts a session THEN the system SHALL persist messages to the `messages` table linked to a `sessions` row.
8.4 IF Supabase is unreachable THEN the system SHALL allow anonymous practice without crashing.

### Requirement 9: Progress Dashboard

**User Story:** As a returning student, I want to see my progress over time, so I stay motivated.

**Acceptance Criteria:**
9.1 WHEN a signed-in user visits `/dashboard` THEN the system SHALL show: total practice minutes, average pronunciation score (last 7 days), grammar errors per 100 words, current streak.
9.2 WHEN the user has fewer than 3 sessions THEN the system SHALL show an "Encouragement empty state" instead of charts.
9.3 The system SHALL render charts using `recharts`.

### Requirement 10: Privacy & Security

**Acceptance Criteria:**
10.1 The system SHALL NOT persist user audio Blobs to any server-side storage.
10.2 The system SHALL store API keys only in server-side environment variables.
10.3 The system SHALL enforce Supabase Row Level Security on all tables: a user can only read/write rows where `auth.uid() = user_id`.
10.4 IF an unauthenticated request hits a protected route THEN the system SHALL return HTTP 401.

### Requirement 11: Performance

**Acceptance Criteria:**
11.1 The time from "user stops recording" to "first AI token visible" SHALL be under 3 seconds at p50 on a 25 Mbps connection.
11.2 The landing page Lighthouse Performance score SHALL be ≥ 90 on mobile.
11.3 The bundle size of `/practice` SHALL be under 250 KB gzipped (first load).

### Requirement 12: Accessibility

**Acceptance Criteria:**
12.1 The system SHALL provide keyboard-accessible controls for record, stop, mute, and scenario selection.
12.2 The system SHALL include ARIA labels on all icon-only buttons.
12.3 The color-contrast ratio for text and interactive elements SHALL meet WCAG AA.
