/**
 * EmptyState — Pact-aligned empty surface with character.
 *
 * Visual DNA: a breathing red period with a quiet line of copy.
 * Designer pass: every empty state is intentional, never a "nothing here yet"
 * fallback. Each one is an ambient invitation back into the loop.
 */

import Link from "next/link";
import type { ReactNode } from "react";
import { MascotIcon, type MascotName } from "./MascotIcon";

interface EmptyStateProps {
  /** Single short headline — usually a question or invitation. */
  heading: string;
  /** Quiet 1-2 sentence body, max ~140 chars. */
  body: string;
  /** Optional next step. Either a Link href or a button onClick. */
  cta?: { label: string; href: string } | { label: string; onClick: () => void };
  /** Optional override for the breathing glyph. Default = the brand's red period. */
  glyph?: ReactNode;
  /** Or pass a Cycle 2 mascot name and EmptyState renders the icon for you. */
  mascot?: MascotName;
}

export function EmptyState({ heading, body, cta, glyph, mascot }: EmptyStateProps) {
  return (
    <section className="flex-1 px-6 py-20 flex flex-col items-center justify-center text-center">
      <div className="mb-6 flex items-center justify-center">
        {mascot ? (
          <MascotIcon name={mascot} size={88} className="rounded-2xl" />
        ) : (
          glyph ?? <span className="block w-16 h-16 rounded-full bg-red chatter-empty-breath" />
        )}
      </div>
      <h2 className="display-italic text-2xl text-ink mb-3 max-w-md leading-tight">
        {heading}
      </h2>
      <p className="body-text text-muted max-w-sm leading-relaxed">{body}</p>
      {cta && "href" in cta && (
        <Link href={cta.href} className="btn-primary mt-7 inline-flex">
          {cta.label}
        </Link>
      )}
      {cta && "onClick" in cta && (
        <button type="button" onClick={cta.onClick} className="btn-primary mt-7 inline-flex">
          {cta.label}
        </button>
      )}
    </section>
  );
}
