-- The Book of Love: Database Schema
-- Run this in Supabase Dashboard > SQL Editor

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  sender_name TEXT NOT NULL,
  text TEXT DEFAULT '',
  timestamp BIGINT NOT NULL,
  type TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'media', 'link', 'placeholder')),
  is_unsent BOOLEAN DEFAULT FALSE,
  share_link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Media table
CREATE TABLE IF NOT EXISTS media (
  id SERIAL PRIMARY KEY,
  message_id INTEGER REFERENCES messages(id) ON DELETE CASCADE,
  uri TEXT NOT NULL,
  original_filename TEXT,
  file_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reactions table
CREATE TABLE IF NOT EXISTS reactions (
  id SERIAL PRIMARY KEY,
  message_id INTEGER REFERENCES messages(id) ON DELETE CASCADE,
  actor TEXT NOT NULL,
  reaction TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_messages_text_search ON messages USING GIN (to_tsvector('english', text));
CREATE INDEX IF NOT EXISTS idx_media_message_id ON media(message_id);
CREATE INDEX IF NOT EXISTS idx_reactions_message_id ON reactions(message_id);

-- Enable Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

-- Policies: authenticated users can read everything
CREATE POLICY "Authenticated users can read messages" ON messages
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read media" ON media
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read reactions" ON reactions
  FOR SELECT TO authenticated USING (true);
