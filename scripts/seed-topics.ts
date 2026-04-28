// Seed the 78 Chatter launch topics into Supabase
// Run with: SUPABASE_SERVICE_ROLE_KEY=... NEXT_PUBLIC_SUPABASE_URL=... npx tsx scripts/seed-topics.ts

import { createClient } from "@supabase/supabase-js";
import { allSeedTopics } from "../lib/topics";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing Supabase env vars");
  process.exit(1);
}

const sb = createClient(url, key, { auth: { persistSession: false } });

async function main() {
  const rows = allSeedTopics.map((t) => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    type: t.type === "team" || t.type === "league" || t.type === "player" || t.type === "event" || t.type === "competition" ? t.type : "other",
    emoji: t.emoji || null,
    country_code: t.country_code || null,
    description: t.description || null,
    heat_score: 0,
    tuned_in_count: 0,
  }));

  console.log(`Seeding ${rows.length} topics...`);

  // Upsert in batches of 25
  const batchSize = 25;
  let succeeded = 0;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const { error } = await sb.from("topics").upsert(batch, { onConflict: "id" });
    if (error) {
      console.error(`Batch ${Math.floor(i / batchSize)} failed:`, error);
    } else {
      succeeded += batch.length;
      console.log(`Batch ${Math.floor(i / batchSize)}: ${batch.length} rows upserted`);
    }
  }

  // Verify
  const { count, error: countError } = await sb
    .from("topics")
    .select("*", { count: "exact", head: true });

  if (countError) {
    console.error("Count failed:", countError);
  } else {
    console.log(`\n✅ Seeded. Total topics in DB: ${count}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
