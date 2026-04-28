/**
 * AI in Chatter — Pact promises 11, 12, 13 made visible as a public page.
 * What we use AI for. What we never do. What's opt-in.
 */
import Link from "next/link";
import { Bot, ShieldOff, Mic, Languages, type LucideIcon } from "lucide-react";
import { ChatterMark } from "@/components/ChatterMark";

export const metadata = {
  title: "AI in Chatter — what we do · what we don't",
};

export default function AIPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <header className="px-6 sm:px-10 pt-6 sm:pt-8 flex justify-between items-center">
        <Link href="/">
          <ChatterMark size="sm" pulse="breath" />
        </Link>
        <Link href="/" className="label-text text-muted hover:text-ink transition">
          ← back
        </Link>
      </header>

      <section className="flex-1 px-6 sm:px-10 py-12 sm:py-20">
        <div className="max-w-2xl mx-auto w-full">
          <p className="label-text text-red mb-6">AI in Chatter · Pact 11-13</p>
          <h1 className="display-text text-4xl sm:text-5xl text-ink mb-5">
            ai is invisible infrastructure.
          </h1>
          <p className="body-text text-muted text-lg mb-12 max-w-xl">
            most of chatter has no ai in it at all. when we do use it, it&rsquo;s on your behalf, never on your behalf without consent, and never to teach external models.
          </p>

          <h2 className="display-italic text-2xl text-red mb-4 flex items-center gap-2">
            <Bot size={20} strokeWidth={1.5} /> what we use AI for
          </h2>
          <ul className="space-y-3 mb-10">
            <Pill icon={Languages}>
              <strong>translation</strong> — when you ask. across whispers, captions, and replies.
            </Pill>
            <Pill icon={Mic}>
              <strong>transcription</strong> — voice whispers get text transcripts so screen-readers and search work. you can edit or remove the transcript.
            </Pill>
            <Pill icon={ShieldOff}>
              <strong>safety scan</strong> — every whisper passes a moderation check before publishing (hate speech, threats, spam, CSAM). always on. always disclosed. (Pact 12.)
            </Pill>
          </ul>

          <h2 className="display-italic text-2xl text-warn mb-4">what we never do</h2>
          <ul className="space-y-3 mb-10">
            <li className="border-l-2 border-warn pl-5 body-text text-ink">
              <strong>train external AI on your content.</strong> Pact 11. your whispers, photos, and voice notes are not training data — for us or for anyone we share with.
            </li>
            <li className="border-l-2 border-warn pl-5 body-text text-ink">
              <strong>post, reply, or comment in your name.</strong> Pact 13. AI doesn&rsquo;t act as you. ever.
            </li>
            <li className="border-l-2 border-warn pl-5 body-text text-ink">
              <strong>auto-generate content tagged as yours.</strong> no &ldquo;AI assistant&rdquo; that posts on your behalf. no &ldquo;auto-reply.&rdquo; you write your whispers.
            </li>
            <li className="border-l-2 border-warn pl-5 body-text text-ink">
              <strong>default-on AI features that change what you see.</strong> Pact 12. recommendation tweaks, AI summaries, AI feed-shaping — opt-in, never opt-out.
            </li>
          </ul>

          <h2 className="display-italic text-2xl text-ink mb-4">how to verify</h2>
          <p className="body-text text-muted mb-3">
            every voice whisper has its transcript visible — you can see exactly what AI heard. every translation is labeled. every safety scan flag is appealable within 7 days.
          </p>
          <p className="body-text text-muted mb-8">
            if we ever introduce a new AI feature, it will be a separate setting in your account that defaults to off, with a plain-language explanation of what it does. you&rsquo;ll see this notice 14 days before it ships.
          </p>

          <div className="border-t border-line pt-8">
            <Link href="/pact" className="btn-primary inline-flex">
              read the full pact →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function Pill({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3 border-l-2 border-red pl-5 body-text text-ink leading-relaxed">
      <Icon size={18} strokeWidth={1.5} className="text-red mt-1 flex-shrink-0" />
      <span>{children}</span>
    </li>
  );
}
