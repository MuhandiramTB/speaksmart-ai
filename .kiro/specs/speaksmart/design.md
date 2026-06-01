# Design — SpeakSmart (Kiro Spec)

## Overview

SpeakSmart is a Next.js 15 single-app project. The browser captures audio and plays TTS locally; all AI calls (STT, chat, grammar) are proxied through Next.js Route Handlers to keep the Groq API key on the server. Supabase handles auth and persistence. There are no separate microservices.

The architecture optimizes for **time-to-first-AI-token**: the audio pipeline is sequential (record → transcribe → chat), but chat responses stream so the user hears feedback as soon as the first token arrives.

## Architecture

```
                  ┌──────────────────────────┐
                  │  /practice page (RSC)    │
                  │  ChatThread (client)     │
                  │  MicButton (client)      │
                  │  FeedbackPanel (client)  │
                  └────────┬─────────────────┘
                           │
   record audio Blob  ─────┤
                           ▼
                  ┌────────────────────────┐
                  │ POST /api/transcribe   │──► Groq Whisper-large-v3
                  └────────┬───────────────┘
                           │ { transcript, words[] }
                           ▼
                  ┌────────────────────────┐         streamed tokens
                  │ POST /api/chat         │◄─────────────────────────┐
                  └────────┬───────────────┘──► Groq Llama 3.3 70B     │
                           │                                           │
                           ▼                                           │
                  ┌────────────────────────┐                            │
                  │ POST /api/grammar      │──► Groq Llama 3.3 (JSON)  │
                  └────────┬───────────────┘                            │
                           │                                           │
                           ▼                                           │
                  ┌────────────────────────┐                            │
                  │ POST /api/sessions     │──► Supabase Postgres       │
                  └────────────────────────┘                            │
                                                                       │
                  Browser TTS (speechSynthesis) ─────────────────────────┘
```

## Components

### MicButton (`components/practice/MicButton.tsx`)
- Owns `MediaRecorder` lifecycle.
- States: `idle`, `requesting`, `recording`, `processing`, `error`.
- Emits `onAudioReady(blob: Blob, mimeType: string)`.

### ChatThread (`components/practice/ChatThread.tsx`)
- Renders messages from a Zustand store.
- For user messages: shows transcript + pronunciation score badge + grammar diff.
- For assistant messages: streams tokens.

### FeedbackPanel (`components/practice/FeedbackPanel.tsx`)
- Right-side panel (collapsible on mobile).
- Pronunciation: word-by-word with confidence bars.
- Grammar: list of corrections with explanations.

### ScenarioPicker (`components/practice/ScenarioPicker.tsx`)
- Static list rendered as card grid.

### Zustand Store (`lib/store.ts`)
```ts
type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  pronunciationScore?: number;
  weakWords?: string[];
  grammar?: { corrected: string; diffs: Diff[] };
  streaming?: boolean;
};

type State = {
  scenario: Scenario | null;
  messages: Message[];
  isRecording: boolean;
  isTtsMuted: boolean;
  addMessage(m: Message): void;
  patchMessage(id: string, patch: Partial<Message>): void;
};
```

## Route Handlers

### `POST /api/transcribe`
- Receives `multipart/form-data` with `file` field.
- Calls Groq audio transcriptions API:
  ```ts
  await groq.audio.transcriptions.create({
    file: audioFile,
    model: 'whisper-large-v3',
    response_format: 'verbose_json',
    timestamp_granularities: ['word'],
    language: 'en',
  });
  ```
- Returns `{ transcript: string, words: { word, start, end, confidence }[] }`.
- Computes pronunciation score from `avg_logprob` per word, mapped to 0–100.

### `POST /api/chat`
- Receives `{ scenario, messages, level, accent }`.
- Builds system prompt from `lib/prompts/tutor.ts` template.
- Streams response from Groq using Vercel AI SDK or raw fetch with SSE.

### `POST /api/grammar`
- Receives `{ text: string }`.
- Calls Llama 3.3 with JSON-schema-constrained output:
  ```json
  {
    "isCorrect": true,
    "corrected": "...",
    "diffs": [{ "original": "...", "corrected": "...", "explanation": "..." }]
  }
  ```

### `POST /api/sessions`
- Authenticated; persists session + messages to Supabase.

## Prompts

### Tutor System Prompt (`lib/prompts/tutor.ts`)
```
You are SpeakSmart, a warm and patient English tutor for an {{level}} learner
practicing the "{{scenario}}" scenario. Speak naturally as the role required by
the scenario (e.g., interviewer, waiter, gate agent). Keep replies under 3
sentences. If the student says something unclear, kindly ask for clarification.
Never correct their grammar in the conversation flow — corrections happen
separately. Use {{accent}} English.
```

### Grammar Prompt (`lib/prompts/grammar.ts`)
JSON-schema-constrained; one shot with examples.

## Data Flow — One User Turn

1. User taps mic → recording starts.
2. User taps mic → Blob produced.
3. Blob posted to `/api/transcribe` → transcript + word confidences.
4. Transcript added to store as user message; pronunciation score computed and rendered.
5. In parallel:
   - Full message history posted to `/api/chat` → streamed reply.
   - User text posted to `/api/grammar` → corrections.
6. Each token appended to assistant message in store.
7. When assistant message completes, browser TTS speaks it.
8. If authenticated, session + messages upserted to Supabase.

## Free-Tier Failure Modes

- **Groq rate limit (429):** show "Slow down — free tier limit hit, retrying in {n}s" with exponential backoff.
- **Supabase down:** continue in anonymous mode; do not block conversation.
- **Browser STT unavailable:** N/A (server-side STT).
- **TTS missing:** hide audio controls, text-only mode.

## Testing Strategy

- **Unit (Vitest):** prompt builders, pronunciation scoring math, grammar diff parsing.
- **Component (Vitest + Testing Library):** MicButton state machine, ChatThread rendering.
- **E2E (Playwright):** anonymous voice loop (mock Groq), sign-up flow, scenario switch.
- **Manual smoke:** real Groq calls in staging before each release.
