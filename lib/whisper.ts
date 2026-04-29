/**
 * Client-safe whisper types + pure helpers.
 * Do NOT import anything from `@supabase/ssr` or `next/headers` here — this file
 * is imported by client components.
 */

export type WhisperRow = {
  id: string;
  author_id: string;
  topic_id: string;
  modality: "text" | "voice" | "image" | "video";
  content_text: string | null;
  content_transcript: string | null;
  content_media_url: string | null;
  content_duration_sec: number | null;
  scope: "private" | "circle" | "network" | "public";
  kind: "fact" | "opinion";
  is_whisper_tier: boolean;
  // P1 feature additions (all nullable/defaulted for backwards compat with old rows)
  is_spoiler?: boolean | null;
  is_breath?: boolean | null;
  require_reply_approval?: boolean | null;
  ttl?: "permanent" | "24h" | "view_once" | null;
  expires_at?: string | null;
  deleted_at?: string | null;
  parent_id?: string | null;
  hidden_by_author_at?: string | null;
  echo_count: number;
  pass_count: number;
  corroboration_count: number;
  created_at: string;
  author: {
    handle: string;
    display_name: string;
    insider_tags: string[] | null;
    trust_score: number | null;
    is_charter?: boolean | null;
  };
  topic: {
    id: string;
    name: string;
    emoji: string | null;
    type: string;
  };
};

export type WhisperJoinRow = {
  id: string;
  author_id: string;
  topic_id: string;
  modality: "text" | "voice" | "image" | "video";
  content_text: string | null;
  content_transcript: string | null;
  content_media_url: string | null;
  content_duration_sec: number | null;
  scope: "private" | "circle" | "network" | "public";
  kind: "fact" | "opinion";
  is_whisper_tier: boolean;
  is_spoiler?: boolean | null;
  is_breath?: boolean | null;
  require_reply_approval?: boolean | null;
  ttl?: "permanent" | "24h" | "view_once" | null;
  expires_at?: string | null;
  deleted_at?: string | null;
  parent_id?: string | null;
  hidden_by_author_at?: string | null;
  echo_count: number;
  pass_count: number;
  corroboration_count: number;
  created_at: string;
  users: {
    handle: string;
    display_name: string;
    insider_tags: string[] | null;
    trust_score: number | null;
    is_charter?: boolean | null;
  };
  topics: {
    id: string;
    name: string;
    emoji: string | null;
    type: string;
  };
};

export function joinRowToWhisperRow(row: WhisperJoinRow): WhisperRow {
  return {
    id: row.id,
    author_id: row.author_id,
    topic_id: row.topic_id,
    modality: row.modality,
    content_text: row.content_text,
    content_transcript: row.content_transcript,
    content_media_url: row.content_media_url ?? null,
    content_duration_sec: row.content_duration_sec,
    scope: row.scope,
    kind: row.kind,
    is_whisper_tier: row.is_whisper_tier,
    is_spoiler: row.is_spoiler ?? null,
    is_breath: row.is_breath ?? null,
    require_reply_approval: row.require_reply_approval ?? null,
    ttl: row.ttl ?? null,
    expires_at: row.expires_at ?? null,
    deleted_at: row.deleted_at ?? null,
    parent_id: row.parent_id ?? null,
    hidden_by_author_at: row.hidden_by_author_at ?? null,
    echo_count: row.echo_count,
    pass_count: row.pass_count,
    corroboration_count: row.corroboration_count,
    created_at: row.created_at,
    author: row.users,
    topic: row.topics,
  };
}

/**
 * Human-readable relative time.
 * ("12m", "1h", "3h", "2d")
 */
export function relativeTime(isoString: string): string {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diffSec = Math.max(1, Math.floor((now - then) / 1000));
  if (diffSec < 60) return `${diffSec}s`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d`;
  const diffWk = Math.floor(diffDay / 7);
  if (diffWk < 5) return `${diffWk}w`;
  return new Date(isoString).toLocaleDateString();
}

/**
 * Humanize insider tags for the byline.
 */
export function humanizeInsiderTag(tag: string | null | undefined): string {
  if (!tag) return "";
  return tag
    .replace(/_(\d{2,4})_(\d{2,4})$/, " $1-$2")
    .replace(/_(\d{2,4})$/, " $1")
    .replace(/_/g, " ");
}

export function bestInsiderCredential(
  tags: string[] | null | undefined,
): string | null {
  if (!tags || tags.length === 0) return null;
  return humanizeInsiderTag(tags[0]);
}
