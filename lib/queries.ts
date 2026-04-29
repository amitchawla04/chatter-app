import "server-only";
/**
 * Server-side query helpers for Chatter.
 * Only importable from server components, route handlers, server actions.
 * For types + pure helpers (safe in client code), import from `@/lib/whisper`.
 */
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  joinRowToWhisperRow,
  type WhisperJoinRow,
  type WhisperRow,
} from "@/lib/whisper";

/**
 * Fetch public whispers for the home feed.
 */
export async function fetchPublicWhispers(limit = 40): Promise<WhisperRow[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("whispers")
    .select(`
      id, author_id, topic_id, modality, content_text, content_transcript, content_media_url, content_duration_sec, scope, kind, is_whisper_tier,
      echo_count, pass_count, corroboration_count, created_at,
      users:author_id ( handle, display_name, insider_tags, trust_score, is_charter ),
      topics:topic_id ( id, name, emoji, type )
    `)
    .eq("scope", "public")
    .eq("is_hidden", false)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("fetchPublicWhispers error", error);
    return [];
  }

  return ((data ?? []) as unknown as WhisperJoinRow[]).map(joinRowToWhisperRow);
}

export async function fetchTopicWhispers(
  topicId: string,
  limit = 40,
): Promise<WhisperRow[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("whispers")
    .select(`
      id, author_id, topic_id, modality, content_text, content_transcript, content_media_url, content_duration_sec, scope, kind, is_whisper_tier,
      echo_count, pass_count, corroboration_count, created_at,
      users:author_id ( handle, display_name, insider_tags, trust_score, is_charter ),
      topics:topic_id ( id, name, emoji, type )
    `)
    .eq("topic_id", topicId)
    .eq("is_hidden", false)
    .in("scope", ["public", "network"])
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("fetchTopicWhispers error", error);
    return [];
  }

  return ((data ?? []) as unknown as WhisperJoinRow[]).map(joinRowToWhisperRow);
}

export async function fetchTopicBySlug(slug: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("topics")
    .select("*")
    .eq("slug", slug)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("fetchTopicBySlug error", error);
    return null;
  }
  return data;
}

export async function fetchCurrentUserRow() {
  const supabase = await createServerClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) return null;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("users")
    .select("*")
    .eq("id", authUser.id)
    .limit(1)
    .maybeSingle();
  if (error) {
    console.error("fetchCurrentUserRow error", error);
    return null;
  }
  return data;
}

/**
 * Given a set of whisper IDs, return the subset the current user has echoed.
 */
export async function fetchEchoedIds(whisperIds: string[]): Promise<Set<string>> {
  if (whisperIds.length === 0) return new Set();
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Set();

  const admin = createAdminClient();
  const { data } = await admin
    .from("echoes")
    .select("whisper_id")
    .eq("user_id", user.id)
    .in("whisper_id", whisperIds);

  return new Set((data ?? []).map((r) => r.whisper_id));
}

export type GlimpseRow = {
  id: string;
  media_url: string;
  topic_id: string;
  topic_name: string;
  topic_emoji: string | null;
  author_handle: string;
  author_is_charter: boolean;
  created_at: string;
};

/**
 * Glimpse feed — image-modality whispers from the last 24h.
 * One per author (most recent), prefers charter, hides if scope='private'.
 * No view counts persisted (Pact 5: no popularity surfacing between users).
 */
export async function fetchGlimpseImages(limit = 12): Promise<GlimpseRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("whispers")
    .select(`
      id, content_media_url, created_at, topic_id, author_id, scope,
      users:author_id ( handle, is_charter ),
      topics:topic_id ( name, emoji )
    `)
    .eq("modality", "image")
    .eq("is_hidden", false)
    .in("scope", ["public", "network", "circle"])
    .not("content_media_url", "is", null)
    .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .order("created_at", { ascending: false })
    .limit(limit * 2);

  if (error) {
    console.error("fetchGlimpseImages error", error);
    return [];
  }

  type Row = {
    id: string;
    content_media_url: string | null;
    created_at: string;
    topic_id: string;
    author_id: string;
    scope: string;
    users: { handle: string; is_charter: boolean | null } | null;
    topics: { name: string; emoji: string | null } | null;
  };

  // Dedupe by author — keep most recent per author
  const seen = new Set<string>();
  const out: GlimpseRow[] = [];
  for (const r of (data ?? []) as unknown as Row[]) {
    if (!r.content_media_url || !r.users || !r.topics) continue;
    if (!r.content_media_url.startsWith("http")) continue; // skip placeholders
    if (seen.has(r.author_id)) continue;
    seen.add(r.author_id);
    out.push({
      id: r.id,
      media_url: r.content_media_url,
      topic_id: r.topic_id,
      topic_name: r.topics.name,
      topic_emoji: r.topics.emoji,
      author_handle: r.users.handle,
      author_is_charter: Boolean(r.users.is_charter),
      created_at: r.created_at,
    });
    if (out.length >= limit) break;
  }
  // Charter first within recency-bucket
  out.sort((a, b) => {
    if (a.author_is_charter !== b.author_is_charter) return a.author_is_charter ? -1 : 1;
    return b.created_at.localeCompare(a.created_at);
  });
  return out;
}

export type ThreadSummary = {
  id: string;
  name: string;
  topic_id: string;
  topic_name: string;
  topic_emoji: string | null;
  participant_count: number;
  last_message_at: string;
  is_creator: boolean;
  unread_count: number;
};

export async function fetchMyThreads(): Promise<ThreadSummary[]> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const admin = createAdminClient();
  const { data: rows } = await admin
    .from("village_thread_participants")
    .select(`
      thread_id, last_read_at,
      village_threads:thread_id (
        id, name, topic_id, last_message_at, creator_id, is_archived,
        topics:topic_id ( name, emoji )
      )
    `)
    .eq("user_id", user.id);

  type Row = {
    thread_id: string;
    last_read_at: string;
    village_threads: {
      id: string;
      name: string;
      topic_id: string;
      last_message_at: string;
      creator_id: string;
      is_archived: boolean;
      topics: { name: string; emoji: string | null } | null;
    } | null;
  };

  const threadIds: string[] = [];
  const lastReadByThread = new Map<string, string>();
  const threads = ((rows ?? []) as unknown as Row[])
    .filter((r) => r.village_threads && !r.village_threads.is_archived)
    .map((r) => {
      threadIds.push(r.thread_id);
      lastReadByThread.set(r.thread_id, r.last_read_at);
      return r;
    });

  // Participant counts + unread counts in parallel
  const counts = new Map<string, number>();
  const unreads = new Map<string, number>();
  if (threadIds.length > 0) {
    const [{ data: parts }, ...unreadResults] = await Promise.all([
      admin
        .from("village_thread_participants")
        .select("thread_id")
        .in("thread_id", threadIds),
      ...threadIds.map((id) =>
        admin
          .from("whispers")
          .select("id", { count: "exact", head: true })
          .eq("thread_id", id)
          .neq("author_id", user.id)
          .gt("created_at", lastReadByThread.get(id) ?? new Date(0).toISOString()),
      ),
    ]);
    for (const p of parts ?? []) {
      counts.set(p.thread_id, (counts.get(p.thread_id) ?? 0) + 1);
    }
    threadIds.forEach((id, i) => {
      unreads.set(id, unreadResults[i].count ?? 0);
    });
  }

  return threads
    .map((r) => ({
      id: r.village_threads!.id,
      name: r.village_threads!.name,
      topic_id: r.village_threads!.topic_id,
      topic_name: r.village_threads!.topics?.name ?? "",
      topic_emoji: r.village_threads!.topics?.emoji ?? null,
      participant_count: counts.get(r.village_threads!.id) ?? 1,
      last_message_at: r.village_threads!.last_message_at,
      is_creator: r.village_threads!.creator_id === user.id,
      unread_count: unreads.get(r.village_threads!.id) ?? 0,
    }))
    .sort((a, b) => b.last_message_at.localeCompare(a.last_message_at));
}

export type ThreadDetail = {
  id: string;
  name: string;
  topic_id: string;
  topic_name: string;
  topic_emoji: string | null;
  creator_id: string;
  pinned_message: {
    id: string;
    content_text: string;
    author_handle: string;
  } | null;
  participants: { user_id: string; handle: string; is_charter: boolean; role: string }[];
  messages: {
    id: string;
    content_text: string;
    author_handle: string;
    author_is_charter: boolean;
    created_at: string;
    is_self: boolean;
  }[];
};

export async function fetchThreadDetail(threadId: string): Promise<ThreadDetail | null> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient();

  // Verify membership
  const { data: member } = await admin
    .from("village_thread_participants")
    .select("user_id")
    .eq("thread_id", threadId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!member) return null;

  const { data: thread } = await admin
    .from("village_threads")
    .select(`
      id, name, topic_id, creator_id, pinned_message_id,
      topics:topic_id ( name, emoji )
    `)
    .eq("id", threadId)
    .maybeSingle();
  if (!thread) return null;

  const t = thread as unknown as {
    id: string;
    name: string;
    topic_id: string;
    creator_id: string;
    pinned_message_id: string | null;
    topics: { name: string; emoji: string | null } | null;
  };

  // Pinned message (if any)
  let pinned_message: ThreadDetail["pinned_message"] = null;
  if (t.pinned_message_id) {
    const { data: pin } = await admin
      .from("whispers")
      .select(`
        id, content_text,
        users:author_id ( handle )
      `)
      .eq("id", t.pinned_message_id)
      .maybeSingle();
    if (pin) {
      const p = pin as unknown as {
        id: string;
        content_text: string | null;
        users: { handle: string } | null;
      };
      if (p.content_text && p.users) {
        pinned_message = {
          id: p.id,
          content_text: p.content_text,
          author_handle: p.users.handle,
        };
      }
    }
  }

  const { data: partsRaw } = await admin
    .from("village_thread_participants")
    .select(`
      user_id, role,
      users:user_id ( handle, is_charter )
    `)
    .eq("thread_id", threadId);

  type PartRow = {
    user_id: string;
    role: string;
    users: { handle: string; is_charter: boolean | null } | null;
  };
  const participants = ((partsRaw ?? []) as unknown as PartRow[])
    .filter((p) => p.users)
    .map((p) => ({
      user_id: p.user_id,
      handle: p.users!.handle,
      is_charter: Boolean(p.users!.is_charter),
      role: p.role,
    }));

  const { data: msgRaw } = await admin
    .from("whispers")
    .select(`
      id, content_text, author_id, created_at,
      users:author_id ( handle, is_charter )
    `)
    .eq("thread_id", threadId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true })
    .limit(200);

  type MsgRow = {
    id: string;
    content_text: string | null;
    author_id: string;
    created_at: string;
    users: { handle: string; is_charter: boolean | null } | null;
  };
  const messages = ((msgRaw ?? []) as unknown as MsgRow[])
    .filter((m) => m.content_text && m.users)
    .map((m) => ({
      id: m.id,
      content_text: m.content_text!,
      author_handle: m.users!.handle,
      author_is_charter: Boolean(m.users!.is_charter),
      created_at: m.created_at,
      is_self: m.author_id === user.id,
    }));

  return {
    id: t.id,
    name: t.name,
    topic_id: t.topic_id,
    topic_name: t.topics?.name ?? "",
    topic_emoji: t.topics?.emoji ?? null,
    creator_id: t.creator_id,
    pinned_message,
    participants,
    messages,
  };
}

export type CorrectionPreview = {
  count: number;
  latest_text: string;
  author_handle: string;
  insider_tag: string | null;
};

/**
 * Given a set of whisper IDs, return a map of correction previews per whisper.
 * Used by feed cards to render inline insider-correction strips (Pact 11-13:
 * truth visible, AI/insiders disclosed).
 */
export async function fetchCorrectionPreviews(
  whisperIds: string[],
): Promise<Map<string, CorrectionPreview>> {
  if (whisperIds.length === 0) return new Map();

  const admin = createAdminClient();
  const { data } = await admin
    .from("corrections")
    .select(`
      whisper_id, content, created_at,
      users:author_id ( handle, insider_tags )
    `)
    .in("whisper_id", whisperIds)
    .order("created_at", { ascending: false });

  type Row = {
    whisper_id: string;
    content: string;
    created_at: string;
    users: { handle: string; insider_tags: string[] | null } | null;
  };

  const out = new Map<string, CorrectionPreview>();
  for (const r of (data ?? []) as unknown as Row[]) {
    const existing = out.get(r.whisper_id);
    if (existing) {
      existing.count += 1;
    } else {
      out.set(r.whisper_id, {
        count: 1,
        latest_text: r.content,
        author_handle: r.users?.handle ?? "?",
        insider_tag:
          r.users?.insider_tags && r.users.insider_tags.length > 0
            ? r.users.insider_tags[0].replace(/_/g, " ")
            : null,
      });
    }
  }
  return out;
}

/**
 * Given a set of whisper IDs, return the subset the current user has saved.
 */
export async function fetchSavedIds(whisperIds: string[]): Promise<Set<string>> {
  if (whisperIds.length === 0) return new Set();
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Set();

  const admin = createAdminClient();
  const { data } = await admin
    .from("saves")
    .select("whisper_id")
    .eq("user_id", user.id)
    .in("whisper_id", whisperIds);

  return new Set((data ?? []).map((r) => r.whisper_id));
}
