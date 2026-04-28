/**
 * /settings/notifications — opt-in push notifications page.
 * Per Pact: never auto-prompt, never push engagement metrics.
 */
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { ChatterMark } from "@/components/ChatterMark";
import { EnableNotifications } from "@/components/EnableNotifications";
import { createClient as createServerClient } from "@/lib/supabase/server";

export default async function NotificationsSettingsPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");

  return (
    <main className="min-h-screen pb-12">
      <header className="sticky top-0 z-40 bg-canvas/95 backdrop-blur border-b border-line px-5 py-4 flex items-center justify-between">
        <Link
          href="/settings"
          className="text-muted hover:text-ink transition flex items-center gap-1 text-sm"
          aria-label="Back to settings"
        >
          <ChevronLeft size={18} strokeWidth={1.5} />
          settings
        </Link>
        <ChatterMark size="sm" />
        <div className="w-16" />
      </header>

      <section className="px-5 sm:px-10 py-10 max-w-lg mx-auto">
        <p className="label-text text-red mb-3">notifications</p>
        <h1 className="display-text text-3xl text-ink mb-3">
          when chatter pings you.
        </h1>
        <p className="body-text text-muted mb-8">
          we never push engagement metrics. no &ldquo;3 people echoed your
          whisper&rdquo;. no streaks. no FOMO. just three things that need
          your attention right now.
        </p>

        <div className="space-y-3 mb-10">
          <Notification
            title="new pass arrived"
            description="someone in your village passed you a whisper. the kind of moment Chatter exists for."
          />
          <Notification
            title="your topic just went live"
            description="a topic you tuned into started a live event — match, premiere, awards. one ping, then we go quiet."
          />
          <Notification
            title="someone vouched for you"
            description="rare. earned. we tell you because credentials are part of how trust works on chatter."
          />
        </div>

        <EnableNotifications />

        <p className="mono-text text-xs text-muted mt-8 leading-relaxed">
          opt-in only · revoke anytime in browser settings · never sold ·
          never used to drive time-on-app · pact 14 enforced.
        </p>
      </section>
    </main>
  );
}

function Notification({ title, description }: { title: string; description: string }) {
  return (
    <div className="border-l-2 border-red pl-4 py-1">
      <p className="display-italic text-lg text-ink">{title}</p>
      <p className="body-text text-sm text-muted">{description}</p>
    </div>
  );
}
