/**
 * Logo concepts gallery — generated via ImageResponse.
 * Public preview surface so the founder can pick one without me copy-pasting screenshots.
 */
import Link from "next/link";
import { ChatterMark } from "@/components/ChatterMark";

export const metadata = {
  title: "Logo concepts · Chatter brand",
  description: "Five concept directions for the Chatter mark. Pick one to ship.",
};

const concepts = [
  {
    id: "01-wordmark-classic",
    name: "Wordmark Classic",
    tagline: "the existing italic-c-period set as the canonical mark",
    note: "warm canvas · ink · breathing red period · Cormorant Garamond italic. The system already running across favicon, apple-icon, OG card.",
  },
  {
    id: "02-wordmark-inverted",
    name: "Wordmark Inverted",
    tagline: "same wordmark on ink for dark surfaces",
    note: "for dark-mode app icons (when added), social embeds on dark backgrounds, founder pulse dashboard header.",
  },
  {
    id: "03-stamp",
    name: "Circle Stamp",
    tagline: "lowercase 'c.' inside a thin gold ring",
    note: "App Store thumbnail at 60×60 still reads — works where the full wordmark is illegible. Gold ring nods to charter.",
  },
  {
    id: "04-whisper-mark",
    name: "Whisper Curve",
    tagline: "abstract speech-curve with the period as mouth",
    note: "smallest scale identity — favicon at 16×16 still parses. Reads as 'a small voice' — fits the whisper-network thesis.",
  },
  {
    id: "05-combo",
    name: "Stamp + Wordmark",
    tagline: "circle stamp left of italic chatter wordmark",
    note: "the marketing/PR-deck composite. App store + landing + investor deck use this lockup.",
  },
];

export default function LogosPage() {
  return (
    <main className="min-h-screen pb-32">
      <h1 className="sr-only">Logo concepts · Chatter</h1>
      <header className="px-6 sm:px-10 pt-6 sm:pt-8 flex justify-between items-center">
        <Link href="/">
          <ChatterMark size="sm" pulse="breath" />
        </Link>
        <Link href="/" className="label-text text-muted hover:text-ink transition">
          ← back
        </Link>
      </header>

      <section className="px-6 sm:px-10 py-10 max-w-4xl mx-auto">
        <p className="label-text text-red mb-3">brand · logo concepts</p>
        <h2 className="display-italic text-4xl text-ink mb-3">Five marks. Pick one.</h2>
        <p className="body-text text-muted text-base leading-relaxed max-w-2xl mb-12">
          Each mark is generated dynamically at 1024×1024 by Next.js so we can iterate without binary assets in the repo. Open any thumbnail in a new tab to see it at full size. Reply with the id of the one you like (or any to combine), and that becomes the canonical mark — favicon, apple-icon, OG card, all swap automatically.
        </p>

        <ul className="grid sm:grid-cols-2 gap-8">
          {concepts.map((c) => (
            <li key={c.id} className="border border-line bg-paper">
              <a
                href={`/api/brand/logo/${c.id}`}
                target="_blank"
                rel="noreferrer noopener"
                className="block aspect-square overflow-hidden bg-canvas"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/brand/logo/${c.id}`}
                  alt={`${c.name} concept`}
                  className="w-full h-full object-contain"
                  width={512}
                  height={512}
                />
              </a>
              <div className="p-5">
                <p className="mono-text text-[10px] uppercase tracking-wider text-muted mb-1">
                  {c.id}
                </p>
                <h3 className="display-italic text-2xl text-ink mb-1">{c.name}</h3>
                <p className="text-muted text-sm italic mb-2">{c.tagline}</p>
                <p className="text-ink text-xs leading-relaxed">{c.note}</p>
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-12 mono-text text-xs text-muted leading-relaxed max-w-xl">
          design language constraints kept across all five: warm canvas <span className="mono-text">#FAF9F6</span> · near-black ink <span className="mono-text">#0A0A0A</span> · red period <span className="text-red mono-text">#FF2D2D</span> · gold accent for charter <span className="mono-text">#C8A24E</span> · Cormorant Garamond italic display · no decorative flourishes.
        </p>
      </section>
    </main>
  );
}
