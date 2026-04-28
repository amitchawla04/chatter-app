/**
 * /onboard/beta — invite-code entry for the charter cohort.
 * Codes from /docs/CHARTER-CREATOR-STRATEGY.md → distributed to 320 charter
 * contributors before WC launch. Unlocking with a valid code grants the
 * charter badge automatically.
 */
import Link from "next/link";
import { ChatterMark } from "@/components/ChatterMark";
import { BetaCodeForm } from "@/components/BetaCodeForm";

export default function BetaOnboardPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <header className="px-6 sm:px-10 pt-6 sm:pt-8 flex justify-between items-center">
        <Link href="/">
          <ChatterMark size="sm" pulse="breath" />
        </Link>
        <span className="label-text text-muted">charter cohort</span>
      </header>

      <section className="flex-1 flex items-center px-6 sm:px-10 py-16">
        <div className="max-w-md mx-auto w-full">
          <p className="label-text text-red mb-6">invite only · for now</p>
          <h1 className="display-text text-3xl sm:text-4xl text-ink mb-3">
            you got an invite.
          </h1>
          <p className="body-text text-muted mb-10">
            charter contributors shape the first version of chatter. enter
            your code, claim your handle, get a charter badge that never
            expires and earn equity in the creator pool.
          </p>

          <BetaCodeForm />

          <p className="mono-text text-xs text-muted mt-10 leading-relaxed">
            no code? join the waitlist at{" "}
            <Link href="/" className="text-red hover:text-ink transition">
              chatter
            </Link>
            . charter opens to 320 creators before wc 2026, then 500 by aug, 750 by year-end.
          </p>
        </div>
      </section>
    </main>
  );
}
