import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ChatterMark } from "@/components/ChatterMark";
import { TabBar } from "@/components/TabBar";

export const metadata: Metadata = {
  title: "What's new · chatter",
  description: "Recent ships, fixes, and changes. Updated as we go.",
};

interface Entry {
  date: string;
  title: string;
  body: string;
  tag?: "shipped" | "fixed" | "changed";
}

const entries: Entry[] = [
  {
    date: "2026-04-29",
    title: "Custom domain · chatter.today",
    body: "Moved off the .vercel.app subdomain. The .today TLD captures the freshness ethos: what's actually happening in your village right now, vs the algorithmic timeless slop on the other platforms.",
    tag: "shipped",
  },
  {
    date: "2026-04-29",
    title: "Trust infrastructure",
    body: "Block, mute, and hidden-words filters at /settings/privacy. Your filters apply across every feed. Insider-credential claim flow at /you/credentials. Per-topic vouches on every topic page.",
    tag: "shipped",
  },
  {
    date: "2026-04-29",
    title: "Ticketed Spaces",
    body: "Charter creators can now host paid AMAs and live audio rooms. Real SMS-OTP authentication on purchase, simulated payment confirmation in beta. Real Razorpay integration follows when there's validated demand.",
    tag: "shipped",
  },
  {
    date: "2026-04-29",
    title: "Phone-OTP sign-in (production tier)",
    body: "Twilio Verify upgraded out of trial — phone OTP now lands on any number, not just verified ones. Email + phone are equal first-class sign-in paths.",
    tag: "shipped",
  },
  {
    date: "2026-04-28",
    title: "Glimpse · 24h photo strip",
    body: "Last-24h image whispers from your charter villagers as a horizontal circle strip on /home. Pact-clean: no view counts surfaced. Tap any to open the lightbox.",
    tag: "shipped",
  },
  {
    date: "2026-04-28",
    title: "Group village threads",
    body: "Up to 12 people in a private thread. Topic-anchored. /v from your profile. Pin a message, kick a member.",
    tag: "shipped",
  },
  {
    date: "2026-04-28",
    title: "Credential-weighted reply ranking",
    body: "On every whisper, replies sort: charter members → insider-credentialed → chronological. The Pact-aligned alternative to algorithmic boost.",
    tag: "shipped",
  },
  {
    date: "2026-04-28",
    title: "Watch-Together presence",
    body: "On any /live event page, see who else is watching right now. Real-time heartbeat, no view-count vanity, just the names of people in the room with you.",
    tag: "shipped",
  },
  {
    date: "2026-04-28",
    title: "i18n scaffold · 6 locales",
    body: "English, Spanish, Portuguese, Hindi, French, German. Pick your language at /settings/language.",
    tag: "shipped",
  },
];

const tagColor = {
  shipped: "text-gold border-gold",
  fixed: "text-muted border-line",
  changed: "text-ink border-ink",
} as const;

export default function ChangelogPage() {
  return (
    <main className="min-h-screen pb-32">
      <header className="sticky top-0 z-40 bg-canvas/95 backdrop-blur border-b border-line px-5 py-4 flex items-center justify-between">
        <Link href="/" className="text-muted hover:text-ink transition" aria-label="home">
          <ChevronLeft size={16} strokeWidth={1.5} />
        </Link>
        <ChatterMark size="sm" />
        <div className="w-4" />
      </header>

      <section className="px-5 pt-10 pb-6 max-w-2xl mx-auto text-center">
        <h1 className="display-italic text-4xl text-ink leading-tight mb-2">What&apos;s new.</h1>
        <p className="text-muted text-sm">Recent ships, fixes, and changes.</p>
      </section>

      <section className="px-5 max-w-2xl mx-auto">
        <ul className="space-y-8">
          {entries.map((e, i) => (
            <li key={i} className="border-l-2 border-line pl-5 relative">
              <span className="absolute -left-[5px] top-0 w-2 h-2 bg-canvas border border-ink" />
              <div className="flex items-center gap-3 mb-1">
                <span className="mono-text text-[11px] text-muted uppercase tracking-wider">{e.date}</span>
                {e.tag && (
                  <span
                    className={`mono-text text-[10px] uppercase tracking-wider px-1.5 py-0.5 border ${tagColor[e.tag]}`}
                  >
                    {e.tag}
                  </span>
                )}
              </div>
              <h2 className="display-italic text-xl text-ink mb-1.5">{e.title}</h2>
              <p className="text-muted text-sm leading-relaxed">{e.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="px-5 mt-16 mb-8 max-w-2xl mx-auto text-center">
        <p className="text-muted text-xs mono-text">
          missing something? write to{" "}
          <a href="mailto:hello@chatter.today" className="underline hover:text-ink">
            hello@chatter.today
          </a>
        </p>
      </section>

      <TabBar />
    </main>
  );
}
