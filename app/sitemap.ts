/**
 * Sitemap — listing of public, indexable URLs.
 * Generated dynamically so topic + whisper URLs reflect current content.
 */
import type { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/admin";

const BASE = "https://chatter.today";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const admin = createAdminClient();

  const staticUrls: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE}/home`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${BASE}/explore`, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/live`, changeFrequency: "hourly", priority: 0.8 },
    { url: `${BASE}/pact`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/privacy`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/community`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/terms`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/ai`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/onboard/beta`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE}/auth/sign-in`, changeFrequency: "monthly", priority: 0.4 },
  ];

  const [{ data: topics }, { data: whispers }, { data: events }] = await Promise.all([
    admin.from("topics").select("id, created_at").limit(500),
    admin
      .from("whispers")
      .select("id, created_at")
      .eq("scope", "public")
      .eq("is_hidden", false)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(500),
    admin.from("live_events").select("id, updated_at").order("updated_at", { ascending: false }).limit(50),
  ]);

  const topicUrls: MetadataRoute.Sitemap = (topics ?? []).map((t) => ({
    url: `${BASE}/t/${(t as { id: string }).id}`,
    lastModified: new Date((t as { created_at: string }).created_at),
    changeFrequency: "daily",
    priority: 0.7,
  }));

  const whisperUrls: MetadataRoute.Sitemap = (whispers ?? []).map((w) => ({
    url: `${BASE}/w/${(w as { id: string }).id}`,
    lastModified: new Date((w as { created_at: string }).created_at),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const eventUrls: MetadataRoute.Sitemap = (events ?? []).map((e) => ({
    url: `${BASE}/live/${(e as { id: string }).id}`,
    lastModified: new Date((e as { updated_at: string }).updated_at),
    changeFrequency: "hourly",
    priority: 0.7,
  }));

  return [...staticUrls, ...topicUrls, ...whisperUrls, ...eventUrls];
}
