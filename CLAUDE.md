# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: The Book of Love

A private, love-themed web application for Mark Cody and Jose Burgos to browse, search, and revisit their Facebook Messenger conversation history. Target launch: February 14, 2026. Only two users will ever access this app.

## Current State

This project is in the **pre-development / planning phase**. The repository currently contains:
- `BOOK_OF_LOVE_PLAN.md` — comprehensive project specification (read this for full context)
- `jose-burgos.json` — Facebook Messenger export (3,707 messages, 44K+ lines)
- `media/` — 200+ media files (86 JPEG, 81 GIF, 22 WebP, 10 MP4)
- `jose*.jpg` — seed images for future AI artwork generation

No application code, package.json, or framework scaffolding exists yet.

## Planned Technology Stack

- **Framework:** Next.js 14 + React + TypeScript
- **Styling:** Tailwind CSS with custom love theme (black, flesh tone, rose, warm blush, steel accents)
- **Database:** Supabase (PostgreSQL) with full-text search
- **Auth:** Supabase Auth (email/password, 2 users only)
- **Media Storage:** Cloudflare R2
- **Deployment:** Vercel

## Development Commands (once scaffolded)

```bash
npm install          # Install dependencies
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # Lint
```

## Planned Architecture

Next.js App Router structure under `book-of-love/` (or at repo root):

- `app/` — pages: login (`page.tsx`), `timeline/`, `search/`, `gallery/`, `admin/`, and `api/` routes for messages, search, media
- `components/` — Message, MessageList, DatePicker, SearchBar, MediaGallery, ReactionBadge
- `lib/` — Supabase client (`supabase.ts`), R2 helpers (`r2.ts`), utilities
- `scripts/` — `import-messages.ts` (parse Messenger JSON, seed Supabase), `upload-media.ts` (upload to R2)

## Database Schema (4 tables)

- **messages** — id, sender_name, text, timestamp, type (text|media|link|placeholder), is_unsent
- **media** — id, message_id (FK), uri (R2 URL), original_filename, file_type (jpeg|gif|webp|mp4)
- **reactions** — id, message_id (FK), actor, reaction (emoji)
- **users** — managed by Supabase Auth; roles: admin (Mark) | user (Jose)

Key indexes: messages.timestamp, GIN on messages.text, media.message_id, reactions.message_id.

## Data Format

`jose-burgos.json` is a standard Facebook Messenger export. Messages have fields: `sender_name`, `timestamp_ms`, `content`, `type`, `photos`, `gifs`, `videos`, `reactions`, `is_unsent`. Media files are referenced by filename and stored in `media/`.

## Environment Variables Required

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
R2_ACCOUNT_ID
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_BUCKET_NAME
```

## Design Direction

- Typography: Bold sans-serif headings, Inter for messages
- UI metaphors: timeline as "chapters," gallery as "photo album," search as "remembering together"
- Reactions displayed as margin annotations
- Must be mobile-responsive
- The experience should feel intimate and special — this is a keepsake, not a utility

## MVP Priority (P0)

Auth, chat timeline (grouped by day), keyword search, date picker, inline media, reaction display, responsive design, love theme styling.

## Post-MVP (P1/P2)

Media gallery view, video playback, search highlighting, weekly export merging, "on this day" feature, AI summaries, AI-generated artwork from seed photos, stats dashboard.
