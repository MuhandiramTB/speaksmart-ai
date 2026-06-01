# SpeakSmart — Architecture Document

**Authored by:** BMad Architect Agent
**Date:** 2026-06-01

---

## 1. High-Level Architecture

```
┌──────────────────────────┐
│   Browser (Next.js UI)   │
│                          │
│  - MediaRecorder (mic)   │
│  - speechSynthesis (TTS) │
│  - shadcn/ui chat view   │
└──────┬───────────────────┘
       │ HTTPS
┌──────▼───────────────────┐
│ Next.js Route Handlers   │  (Vercel Edge / Node runtime)
│                          │
│  /api/transcribe   ──────┼──► Groq Whisper-large-v3
│  /api/chat         ──────┼──► Groq Llama 3.3 70B Versatile
│  /api/grammar      ──────┼──► Groq Llama 3.3 (structured output)
│  /api/score        ──────┼──► Pronunciation scoring (Whisper logprobs)
│  /api/sessions     ──────┼──► Supabase Postgres
└──────────────────────────┘
       │
       └─► Supabase (Auth + Postgres + Row Level Security)
```

## 2. Tech Stack

| Layer            | Choice                                  | Why                                  |
|------------------|-----------------------------------------|--------------------------------------|
| Framework        | Next.js 15 (App Router)                 | Free hosting, SSR, route handlers    |
| Language         | TypeScript 5.x (strict)                 | Safety                               |
| Styling          | Tailwind CSS 4 + shadcn/ui              | Fast, consistent UI                  |
| LLM              | Groq `llama-3.3-70b-versatile`          | Free tier, fast inference            |
| STT              | Groq `whisper-large-v3`                 | Free, accurate                       |
| TTS              | Browser `window.speechSynthesis`        | Zero cost, no API needed             |
| Auth + DB        | Supabase (free tier)                    | Free auth + Postgres + RLS           |
| Hosting          | Vercel (free tier / Hobby)              | Free for personal use                |
| State            | Zustand                                 | Small, simple                        |
| Forms            | react-hook-form + zod                   | Type-safe validation                 |
| Testing          | Vitest + Playwright                     | Standard for Next.js                 |

## 3. Repository Structure

```
SpeakSmart/
├── .bmad-core/                # BMad agent definitions & workflow
├── .kiro/specs/speaksmart/    # Kiro spec-driven artifacts
│   ├── requirements.md
│   ├── design.md
│   └── tasks.md
├── docs/
│   ├── prd.md
│   ├── architecture.md
│   └── stories/
├── app/
│   ├── (marketing)/page.tsx           # Landing
│   ├── practice/page.tsx              # Main practice screen
│   ├── dashboard/page.tsx             # Progress
│   ├── auth/{signin,signup}/page.tsx
│   └── api/
│       ├── transcribe/route.ts
│       ├── chat/route.ts
│       ├── grammar/route.ts
│       └── sessions/route.ts
├── components/
│   ├── ui/                    # shadcn primitives
│   ├── practice/
│   │   ├── MicButton.tsx
│   │   ├── ChatThread.tsx
│   │   ├── FeedbackPanel.tsx
│   │   └── ScenarioPicker.tsx
│   └── dashboard/
├── lib/
│   ├── groq.ts                # Groq client
│   ├── supabase/{client,server}.ts
│   ├── prompts/
│   │   ├── tutor.ts
│   │   ├── grammar.ts
│   │   └── pronunciation.ts
│   ├── audio.ts               # MediaRecorder helpers
│   ├── tts.ts                 # speechSynthesis wrapper
│   └── store.ts               # Zustand store
├── types/
└── public/
```

## 4. Data Model (Supabase)

```sql
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  level text check (level in ('beginner','intermediate','advanced')) default 'intermediate',
  target_accent text default 'US',
  created_at timestamptz default now()
);

create table sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  scenario text not null,
  started_at timestamptz default now(),
  ended_at timestamptz,
  duration_seconds int,
  avg_pronunciation_score numeric(5,2),
  grammar_errors_count int default 0
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions on delete cascade,
  role text check (role in ('user','assistant')),
  content text not null,
  audio_transcript text,             -- raw STT output before normalization
  pronunciation_score numeric(5,2),  -- only for user role
  grammar_corrections jsonb,         -- [{original, corrected, explanation}]
  created_at timestamptz default now()
);

-- RLS: users can only read/write their own rows
alter table profiles enable row level security;
alter table sessions enable row level security;
alter table messages enable row level security;
-- (policies in supabase/migrations/)
```

## 5. Pronunciation Scoring Approach (free)

True phoneme-level scoring (ELSA-grade) requires paid services. We approximate using free tools:

1. Run Whisper twice: once with the user's audio, once with TTS of the reference text.
2. Compare word error rate (WER) and per-word confidence (Whisper returns logprobs).
3. Map confidence → 0–100 score; words with logprob below threshold are flagged as weak.

This gives a useful, encouraging signal without paid phoneme APIs.

## 6. Security & Privacy

- API keys live in Vercel env vars only — never shipped to the client.
- Supabase Row Level Security restricts every table to `auth.uid() = user_id`.
- Audio Blobs are sent to `/api/transcribe`, transcribed, then **discarded** — never persisted.
- No tracking pixels, no third-party analytics in v1.

## 7. Free-Tier Budget

| Service       | Free Limit                     | Expected Usage      |
|---------------|--------------------------------|---------------------|
| Groq Whisper  | ~7,200 audio sec/min/day       | 30 min/student/day  |
| Groq Llama 70B| ~6,000 tokens/min, 14,400/day  | ~200 turns/day      |
| Supabase      | 500 MB DB, 50K MAU             | Plenty              |
| Vercel        | 100 GB bandwidth/mo            | Plenty              |

Comfortably within free tiers for a student-scale launch.
