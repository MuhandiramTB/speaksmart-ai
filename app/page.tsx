import Link from "next/link";
import { Mic, MessageCircle, Heart, Compass } from "lucide-react";
import { ShareButton } from "@/components/ShareButton";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-50 via-white to-white">
      <section className="mx-auto flex max-w-5xl flex-col items-center px-6 pt-20 pb-12 text-center">
        <span className="mb-4 rounded-full bg-brand-100 px-4 py-1 text-sm font-medium text-brand-700">
          100% free for students
        </span>
        <h1 className="text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl">
          Speak <span className="text-brand-600">smarter</span> English.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-slate-600">
          Practice real conversations with a patient AI tutor. Get instant pronunciation scores and
          grammar fixes — no subscriptions, no app store.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/practice"
            className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-brand-600/30 transition hover:bg-brand-700"
          >
            <Mic className="h-5 w-5" />
            Start practicing free
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-4 text-base font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            View progress
          </Link>
        </div>
        <p className="mt-3 text-sm text-slate-500">No sign-up required.</p>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Feature
            icon={<MessageCircle className="h-6 w-6" />}
            title="Real conversation"
            body="Speak naturally. The AI replies in real time, just like a tutor would."
          />
          <Feature
            icon={<Mic className="h-6 w-6" />}
            title="Pronunciation scores"
            body="See which words to work on with a clear 0–100 score per utterance."
          />
          <Feature
            icon={<Heart className="h-6 w-6" />}
            title="Grammar fixes"
            body="Gentle corrections after every message so you learn while you talk."
          />
          <Feature
            icon={<Compass className="h-6 w-6" />}
            title="Scenarios"
            body="Practice job interviews, ordering food, meetings, airports, and more."
          />
        </div>
      </section>

      <section className="mx-auto flex max-w-3xl flex-col items-center px-6 pb-16 text-center">
        <p className="mb-4 text-sm text-slate-600">Know someone who would love this?</p>
        <ShareButton />
      </section>

      <footer className="border-t border-slate-200 py-6 text-center text-sm text-slate-500">
        Built with care for students everywhere.
      </footer>
    </main>
  );
}

function Feature({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-700">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-600">{body}</p>
    </div>
  );
}
