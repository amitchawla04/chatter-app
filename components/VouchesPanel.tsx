import { Sparkles } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { relativeTime } from "@/lib/whisper";
import { VouchComposer } from "./VouchComposer";

interface VouchRow {
  id: string;
  content_text: string;
  created_at: string;
  author: { handle: string; display_name: string; insider_tags: string[] | null; is_charter: boolean | null } | null;
}

export async function VouchesPanel({
  topicId,
  topicName,
  isAuthed,
}: {
  topicId: string;
  topicName: string;
  isAuthed: boolean;
}) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("vouches")
    .select("id, content_text, created_at, author:author_id ( handle, display_name, insider_tags, is_charter )")
    .eq("topic_id", topicId)
    .order("created_at", { ascending: false })
    .limit(8);
  const vouches = (data ?? []) as unknown as VouchRow[];

  return (
    <section className="px-5 py-6 border-b border-line">
      <div className="flex items-center justify-between mb-3">
        <h2 className="label-text text-muted">vouches · why these whispers are real</h2>
        {isAuthed && <VouchComposer topicId={topicId} topicName={topicName} />}
      </div>

      {vouches.length === 0 ? (
        <p className="text-muted text-xs italic">no vouches yet · {isAuthed ? "be the first" : "sign in to vouch"}</p>
      ) : (
        <ul className="space-y-3">
          {vouches.map((v) => (
            <li key={v.id} className="border-l-2 border-l-gold pl-3">
              <p className="text-ink text-sm leading-snug mb-1">{v.content_text}</p>
              <div className="flex items-center gap-2 text-[11px] mono-text text-muted">
                <span>@{v.author?.handle ?? "—"}</span>
                {v.author?.is_charter && (
                  <span className="text-gold italic">✦ charter</span>
                )}
                {v.author?.insider_tags && v.author.insider_tags.length > 0 && (
                  <span className="text-gold italic">✦ {v.author.insider_tags[0]}</span>
                )}
                <span>· {relativeTime(v.created_at)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
