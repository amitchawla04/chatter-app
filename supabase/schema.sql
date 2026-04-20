-- Chatter MVP database schema
-- Topics, whispers, users, passes, echoes, tunes (follows)
-- Run in Supabase SQL Editor for the dedicated "chatter" project

-- ──────────────────────────────────────────────────────
-- Extensions
-- ──────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ──────────────────────────────────────────────────────
-- Tables
-- ──────────────────────────────────────────────────────

-- Users: verified humans, pseudonymous display
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  phone_e164 TEXT UNIQUE,
  email TEXT UNIQUE,
  display_name TEXT NOT NULL,
  handle TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  trust_score INTEGER DEFAULT 0,
  insider_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  reciprocity_gate_crossed BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_users_handle ON users(handle);

-- Topics: subject-as-object. Every person, team, event, league, etc.
CREATE TABLE IF NOT EXISTS topics (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('team', 'league', 'player', 'event', 'competition', 'person', 'place', 'brand', 'show', 'other')),
  emoji TEXT,
  country_code TEXT,
  description TEXT,
  heat_score NUMERIC DEFAULT 0,
  tuned_in_count INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_topics_slug ON topics(slug);
CREATE INDEX IF NOT EXISTS idx_topics_type ON topics(type);

-- Whispers: the atomic unit
CREATE TABLE IF NOT EXISTS whispers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic_id TEXT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  modality TEXT NOT NULL CHECK (modality IN ('text', 'voice', 'image', 'video')),
  content_text TEXT,
  content_media_url TEXT,
  content_transcript TEXT,
  content_duration_sec INTEGER,
  scope TEXT NOT NULL CHECK (scope IN ('private', 'circle', 'network', 'public')),
  kind TEXT NOT NULL DEFAULT 'fact' CHECK (kind IN ('fact', 'opinion')),
  is_whisper_tier BOOLEAN DEFAULT FALSE,  -- true when earned via corroboration/insider tag
  echo_count INTEGER DEFAULT 0,
  pass_count INTEGER DEFAULT 0,
  corroboration_count INTEGER DEFAULT 0,
  is_hidden BOOLEAN DEFAULT FALSE,  -- during cooling-off period for negative whispers
  visible_at TIMESTAMPTZ DEFAULT NOW()  -- enables cooling-off logic
);

CREATE INDEX IF NOT EXISTS idx_whispers_topic_id ON whispers(topic_id);
CREATE INDEX IF NOT EXISTS idx_whispers_author_id ON whispers(author_id);
CREATE INDEX IF NOT EXISTS idx_whispers_created_at ON whispers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_whispers_topic_visible ON whispers(topic_id, visible_at DESC) WHERE is_hidden = FALSE;

-- Tunes: user follows a topic
CREATE TABLE IF NOT EXISTS tunes (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic_id TEXT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, topic_id)
);

CREATE INDEX IF NOT EXISTS idx_tunes_user_id ON tunes(user_id);
CREATE INDEX IF NOT EXISTS idx_tunes_topic_id ON tunes(topic_id);

-- Echoes: silent corroboration of a whisper
CREATE TABLE IF NOT EXISTS echoes (
  whisper_id UUID NOT NULL REFERENCES whispers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (whisper_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_echoes_whisper_id ON echoes(whisper_id);

-- Passes: send a whisper to a specific contact
CREATE TABLE IF NOT EXISTS passes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  whisper_id UUID NOT NULL REFERENCES whispers(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  opened_at TIMESTAMPTZ,
  note TEXT
);

CREATE INDEX IF NOT EXISTS idx_passes_to_user ON passes(to_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_passes_whisper ON passes(whisper_id);

-- Vouches: positive mirror of a whisper — named public endorsement
CREATE TABLE IF NOT EXISTS vouches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  topic_id TEXT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_text TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_vouches_topic ON vouches(topic_id);
CREATE INDEX IF NOT EXISTS idx_vouches_author ON vouches(author_id);

-- ──────────────────────────────────────────────────────
-- Row Level Security
-- ──────────────────────────────────────────────────────
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE whispers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tunes ENABLE ROW LEVEL SECURITY;
ALTER TABLE echoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE vouches ENABLE ROW LEVEL SECURITY;

-- Service role full access (server-side API will use this)
CREATE POLICY "service_role_users" ON users FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_topics" ON topics FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_whispers" ON whispers FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_tunes" ON tunes FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_echoes" ON echoes FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_passes" ON passes FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_vouches" ON vouches FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Public read for topics (browsable topic catalog)
CREATE POLICY "public_read_topics" ON topics FOR SELECT TO anon, authenticated USING (true);

-- Public read for public-scope whispers (feed surface)
CREATE POLICY "public_read_public_whispers" ON whispers FOR SELECT
  TO anon, authenticated
  USING (scope = 'public' AND is_hidden = FALSE);
