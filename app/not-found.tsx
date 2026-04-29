/**
 * 404 — replaces the default Next.js not-found page.
 */

import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12 text-center">
      <span
        className="display-italic text-7xl sm:text-8xl text-ink/20 mb-4"
        aria-hidden="true"
      >
        ·
      </span>
      <h1 className="display-italic text-3xl sm:text-4xl text-ink mb-3 max-w-md">
        nothing whispers here.
      </h1>
      <p className="body-text text-muted mb-8 max-w-sm">
        this URL doesn&rsquo;t lead to a whisper, a topic, or a thread we know
        about. it may have vanished — that&rsquo;s allowed.
      </p>
      <Link href="/home" className="btn-primary px-5 py-2.5">
        back to home
      </Link>
    </main>
  );
}
