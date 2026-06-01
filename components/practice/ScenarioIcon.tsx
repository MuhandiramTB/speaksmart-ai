"use client";

import { cn } from "@/lib/utils";

type Props = { id: string; className?: string };

export function ScenarioIcon({ id, className }: Props) {
  const cls = cn("h-12 w-12", className);
  switch (id) {
    case "free-chat":
      return <FreeChatIcon className={cls} />;
    case "interview":
      return <InterviewIcon className={cls} />;
    case "restaurant":
      return <RestaurantIcon className={cls} />;
    case "airport":
      return <AirportIcon className={cls} />;
    case "meeting":
      return <MeetingIcon className={cls} />;
    case "shopping":
      return <ShoppingIcon className={cls} />;
    default:
      return <FreeChatIcon className={cls} />;
  }
}

function FreeChatIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect x="6" y="14" width="40" height="28" rx="8" fill="#14b8a6" />
      <path d="M14 42 L18 50 L24 42" fill="#14b8a6" />
      <circle cx="18" cy="28" r="2.5" fill="#fff" />
      <circle cx="26" cy="28" r="2.5" fill="#fff" />
      <circle cx="34" cy="28" r="2.5" fill="#fff" />
      <rect x="22" y="22" width="36" height="22" rx="7" fill="#fcd34d" opacity="0.95" />
      <path d="M50 44 L46 52 L40 44" fill="#fcd34d" opacity="0.95" />
      <circle cx="34" cy="33" r="2" fill="#92400e" />
      <circle cx="42" cy="33" r="2" fill="#92400e" />
      <circle cx="50" cy="33" r="2" fill="#92400e" />
    </svg>
  );
}

function InterviewIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect x="10" y="22" width="44" height="28" rx="4" fill="#7c3aed" />
      <rect x="10" y="22" width="44" height="6" fill="#5b21b6" />
      <path d="M24 22 V18 a4 4 0 0 1 4 -4 h8 a4 4 0 0 1 4 4 v4" fill="none" stroke="#5b21b6" strokeWidth="3" />
      <rect x="28" y="32" width="8" height="3" rx="1" fill="#fbbf24" />
      <circle cx="32" cy="42" r="3" fill="#fbbf24" />
    </svg>
  );
}

function RestaurantIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <ellipse cx="32" cy="42" rx="22" ry="6" fill="#cbd5e1" />
      <ellipse cx="32" cy="38" rx="22" ry="6" fill="#f1f5f9" />
      <rect x="14" y="12" width="3" height="28" rx="1.5" fill="#94a3b8" />
      <path d="M14 12 v10 a3 3 0 0 0 6 0 v-10" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M48 12 c-4 4 -4 12 0 16 v12" stroke="#94a3b8" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="32" cy="36" r="6" fill="#ef4444" />
      <circle cx="32" cy="36" r="2.5" fill="#fbbf24" />
    </svg>
  );
}

function AirportIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <path
        d="M8 38 L26 32 L20 18 L26 16 L36 30 L52 26 a3 3 0 0 1 0.5 5.8 L20 46 L14 44 L20 38 L10 40 Z"
        fill="#3b82f6"
        stroke="#1d4ed8"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="40" cy="32" r="1.5" fill="#dbeafe" />
    </svg>
  );
}

function MeetingIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect x="8" y="16" width="48" height="32" rx="4" fill="#0f172a" />
      <rect x="11" y="19" width="42" height="22" rx="2" fill="#1e293b" />
      <rect x="28" y="48" width="8" height="4" fill="#0f172a" />
      <rect x="20" y="52" width="24" height="3" rx="1.5" fill="#475569" />
      <path d="M16 36 L22 28 L26 32 L34 22 L42 32 L48 26 L48 36 Z" fill="#34d399" />
      <path d="M16 36 L22 28 L26 32 L34 22 L42 32 L48 26" stroke="#10b981" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
    </svg>
  );
}

function ShoppingIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <path d="M14 22 H50 L46 52 H18 Z" fill="#ec4899" />
      <path d="M14 22 H50 L46 52 H18 Z" fill="none" stroke="#be185d" strokeWidth="2" strokeLinejoin="round" />
      <path d="M22 22 V16 a10 10 0 0 1 20 0 V22" fill="none" stroke="#be185d" strokeWidth="3" strokeLinecap="round" />
      <circle cx="26" cy="34" r="2" fill="#fff" />
      <circle cx="38" cy="34" r="2" fill="#fff" />
    </svg>
  );
}
