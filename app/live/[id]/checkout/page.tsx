import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChatterMark } from "@/components/ChatterMark";
import { CheckoutFlow } from "@/components/CheckoutFlow";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { userHasTicket } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Get ticket · chatter",
  description: "Reserve your seat in this Ticketed Space.",
};

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/auth/sign-in?redirect=/live/${id}/checkout`);
  }

  const admin = createAdminClient();
  const { data: event } = await admin
    .from("live_events")
    .select("id, title, subtitle, kind, status, is_ticketed, ticket_price_cents")
    .eq("id", id)
    .maybeSingle();

  if (!event) notFound();
  const e = event as {
    id: string;
    title: string;
    subtitle: string | null;
    kind: string;
    status: string;
    is_ticketed: boolean | null;
    ticket_price_cents: number | null;
  };

  if (!e.is_ticketed) {
    redirect(`/live/${id}`);
  }
  if (e.status === "finished") {
    redirect(`/live/${id}?ticket=ended`);
  }

  if (await userHasTicket(id)) {
    redirect(`/live/${id}?ticket=already`);
  }

  const { data: userRow } = await admin
    .from("users")
    .select("phone_e164")
    .eq("id", user.id)
    .maybeSingle();
  const defaultPhone = (userRow as { phone_e164: string | null } | null)?.phone_e164 ?? null;

  return (
    <main className="min-h-screen pb-32">
      <header className="sticky top-0 z-40 bg-canvas/95 backdrop-blur border-b border-line px-5 py-4 flex items-center justify-between">
        <Link href={`/live/${id}`} className="text-muted hover:text-ink transition" aria-label="back">
          ←
        </Link>
        <ChatterMark size="sm" />
        <div className="w-4" />
      </header>

      <CheckoutFlow
        eventId={id}
        eventTitle={e.title}
        eventSubtitle={e.subtitle}
        priceCents={e.ticket_price_cents ?? 500}
        defaultPhone={defaultPhone}
      />
    </main>
  );
}
