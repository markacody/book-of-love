# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: The Book of Love

A private, love-themed web application for Mark Cody and Jose Burgos to browse, search, and revisit their Facebook Messenger conversation history. Target launch: February 14, 2026. Only two users will ever access this app.

## Current State

The app is **functional locally and backed by Supabase**. Core UI and data layer are complete. Next step is Vercel deployment.

### What's Built
- Next.js 14 + TypeScript + Tailwind CSS with love theme
- Landing page (`/`), timeline (`/timeline`), search (`/search`)
- 5 components: Message, MessageList, ReactionBadge, SearchBar, DatePicker
- 3 API routes querying Supabase: paginated messages, search, day listing
- Supabase PostgreSQL with 3 tables (messages, media, reactions), GIN index, RLS
- 5,941 messages imported (Nov 18, 2023 – Nov 24, 2024)
- 357 media references, 2,788 reactions
- Merge script for combining Facebook Messenger exports
- Media served locally via symlink (not yet on R2)
- Git repo with 2 commits pushed to github.com/markacody/book-of-love

### What's NOT Built Yet
- Vercel deployment
- Cloudflare R2 media storage (user has Cloudflare account)
- Supabase Auth (2 users: Mark = admin, Jose = user)
- Messages after Nov 2024 (E2EE export limitation — see Data Notes below)
- Gallery page, video playback, "on this day" feature, AI features

## Technology Stack

- **Framework:** Next.js 14 + React + TypeScript
- **Styling:** Tailwind CSS with custom love theme
- **Database:** Supabase (PostgreSQL) — project: nrmcmrndrijacsjvmzkr
- **Auth:** Supabase Auth (not yet configured)
- **Media Storage:** Cloudflare R2 (not yet configured, serving locally)
- **Deployment:** Vercel (not yet deployed)
- **Node.js:** v20.20.0 via nvm (required — `nvm use 20` before npm commands)

## Development Commands

```bash
nvm use 20             # Switch to Node 20 (required)
npm install            # Install dependencies
npm run dev            # Start dev server (http://localhost:3000)
npm run build          # Production build
npm run lint           # Lint
```

## Scripts

```bash
python3 scripts/merge-exports.py       # Merge new Facebook export into jose-burgos.json
node scripts/import-messages.mjs       # Import jose-burgos.json into Supabase
```

- `scripts/setup-db.sql` — SQL to create tables/indexes/RLS (run in Supabase SQL Editor)

## Architecture

```
app/
├── layout.tsx              # Root layout with nav (Timeline | Search)
├── page.tsx                # Landing page ("The Book of Love")
├── globals.css             # Tailwind + theme + custom scrollbar
├── timeline/page.tsx       # Chat timeline with day grouping
├── search/page.tsx         # Search with date range filters
└── api/messages/
    ├── route.ts            # GET paginated messages (Supabase)
    ├── search/route.ts     # GET search (ILIKE on Supabase)
    └── days/route.ts       # GET day listing with counts
components/
├── Message.tsx             # Chat bubble (left/right aligned, media, reactions, links)
├── MessageList.tsx         # Infinite-scroll day-grouped list
├── ReactionBadge.tsx       # Emoji pill with actor name
├── SearchBar.tsx           # Search input + date range pickers
└── DatePicker.tsx          # Jump-to-date dropdown
lib/
├── messages.ts             # Local JSON loader (legacy, still used for merge script)
└── supabase.ts             # Supabase client (public + service role)
```

## Database Schema (Supabase)

- **messages** — id, sender_name, text, timestamp (bigint), type, is_unsent, share_link
- **media** — id, message_id (FK), uri, original_filename, file_type
- **reactions** — id, message_id (FK), actor, reaction

Key indexes: messages.timestamp, GIN on messages.text, media.message_id, reactions.message_id.
RLS enabled: authenticated users can SELECT all tables.

## Data Notes

### Facebook Messenger Export Encoding
- Facebook exports encode UTF-8 as latin1 byte sequences (mojibake)
- Files must be read with `latin1` encoding, then decoded back to UTF-8
- The `decodeFBString()` function in lib/messages.ts and import script handles this

### Two Export Formats
1. **Original format** (jose-burgos.json): camelCase fields (`senderName`, `timestamp`, `text`), ascending order, media as `{uri}` array, type field
2. **Facebook download format** (message_1.json): snake_case fields (`sender_name`, `timestamp_ms`, `content`), descending order, separate `photos`/`gifs`/`share`/`sticker` fields

The merge script (`scripts/merge-exports.py`) normalizes format 2 into format 1.

### E2EE Limitation
Messages after the E2EE migration (~Mar 2024) may not be exportable via Facebook's "Download Your Information" tool. The post-March 2024 data we have came from an earlier export. Messages from Nov 2024 onward are currently missing.

### Merging New Exports
1. Place new Jose conversation folder in `../friends/`
2. Update `NEW_EXPORT` path in `scripts/merge-exports.py`
3. Run `python3 scripts/merge-exports.py`
4. Run `node scripts/import-messages.mjs` (truncate tables first if re-importing)

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=https://nrmcmrndrijacsjvmzkr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
# Future:
R2_ACCOUNT_ID
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_BUCKET_NAME
```

## Design

- **Colors:** rose (#C45B6E), blush (#F2D1D1), cream (#FFFDD0), flesh (#E8C4A0), steel (#71797E)
- **Font:** Inter via next/font
- **Layout:** Max-width 3xl centered, sticky nav, sticky day headers
- **Messages:** Right-aligned (Mark, rose bg), left-aligned (Jose, blush bg)
- **Reactions:** Emoji pills below messages with actor first name

## Deployment Checklist (Next Session)

1. [ ] Deploy to Vercel (connect GitHub repo, set env vars)
2. [ ] Set up Cloudflare R2 bucket and upload media
3. [ ] Update media URIs in Supabase to point to R2
4. [ ] Set up Supabase Auth (2 users)
5. [ ] Add auth protection to pages
6. [ ] Test production build end-to-end

## Post-MVP (P1/P2)

- Media gallery view
- Video playback
- Search highlighting in timeline context
- "On this day" feature
- AI summaries
- AI-generated artwork from seed photos (jose*.jpg)
- Stats dashboard
