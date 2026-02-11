#!/usr/bin/env python3
"""
Merge two Facebook Messenger exports into a single jose-burgos.json.

- Existing: jose-burgos.json (camelCase, ascending, uses ./media/ URIs with UUIDs)
- New: joseburgos_10231848480496124/message_1.json (snake_case, descending,
  uses Facebook numeric IDs for filenames)

The script:
1. Copies new photos/gifs into Jose/media/ (keeping original filenames)
2. Normalizes new messages to match the existing camelCase format
3. Deduplicates by timestamp
4. Sorts ascending by timestamp
5. Writes merged jose-burgos.json (backs up original first)
"""

import json
import shutil
import os
from pathlib import Path

JOSE_DIR = Path(__file__).resolve().parent.parent  # /Users/.../Jose
NEW_EXPORT = JOSE_DIR.parent / "joseburgos_10231848480496124"
EXISTING_JSON = JOSE_DIR / "jose-burgos.json"
MEDIA_DIR = JOSE_DIR / "media"
BACKUP_JSON = JOSE_DIR / "jose-burgos.backup.json"


def copy_new_media():
    """Copy photos and gifs from new export into Jose/media/."""
    copied = 0
    for subdir in ["photos", "gifs"]:
        src_dir = NEW_EXPORT / subdir
        if not src_dir.exists():
            continue
        for f in src_dir.iterdir():
            dest = MEDIA_DIR / f.name
            if not dest.exists():
                shutil.copy2(f, dest)
                copied += 1
            else:
                print(f"  Skipping {f.name} (already exists)")
    return copied


def normalize_new_message(msg):
    """Convert a new-format message to match existing camelCase format."""
    # Build media array from photos, gifs, sticker
    media = []
    for photo in msg.get("photos", []):
        # Rewrite URI to ./media/filename
        filename = photo["uri"].split("/")[-1]
        media.append({"uri": f"./media/{filename}"})

    for gif in msg.get("gifs", []):
        filename = gif["uri"].split("/")[-1]
        media.append({"uri": f"./media/{filename}"})

    # Determine type
    if msg.get("is_unsent"):
        msg_type = "text"
    elif media:
        msg_type = "media"
    elif msg.get("share"):
        msg_type = "link"
    elif msg.get("sticker"):
        msg_type = "media"
        # Add sticker to media array
        filename = msg["sticker"]["uri"].split("/")[-1]
        media.append({"uri": f"./media/{filename}"})
    elif msg.get("call_duration") is not None:
        msg_type = "placeholder"
    else:
        msg_type = "text"

    # Build reactions (strip extra timestamp field)
    reactions = []
    for r in msg.get("reactions", []):
        reactions.append({
            "actor": r["actor"],
            "reaction": r["reaction"],
        })

    # Extract share link if present
    share_link = None
    if msg.get("share") and msg["share"].get("link"):
        share_link = msg["share"]["link"]

    result = {
        "isUnsent": bool(msg.get("is_unsent", False)),
        "media": media,
        "reactions": reactions,
        "senderName": msg["sender_name"],
        "text": msg.get("content", ""),
        "timestamp": msg["timestamp_ms"],
        "type": msg_type,
    }

    if share_link:
        result["shareLink"] = share_link

    return result


def main():
    # 1. Back up existing
    print(f"Backing up existing JSON to {BACKUP_JSON.name}...")
    shutil.copy2(EXISTING_JSON, BACKUP_JSON)

    # 2. Load existing
    print("Loading existing jose-burgos.json...")
    with open(EXISTING_JSON, encoding="latin-1") as f:
        existing = json.load(f)
    existing_msgs = existing["messages"]
    print(f"  Existing: {len(existing_msgs)} messages")

    # 3. Load new
    print("Loading new export...")
    with open(NEW_EXPORT / "message_1.json", encoding="latin-1") as f:
        new_data = json.load(f)
    new_msgs = new_data["messages"]
    print(f"  New: {len(new_msgs)} messages")

    # 4. Copy media files
    print("Copying new media files...")
    copied = copy_new_media()
    print(f"  Copied {copied} new media files")

    # 5. Normalize new messages
    print("Normalizing new messages...")
    normalized = [normalize_new_message(m) for m in new_msgs]

    # 6. Merge & deduplicate by timestamp
    all_msgs = existing_msgs + normalized
    seen_timestamps = set()
    deduped = []
    for m in all_msgs:
        ts = m["timestamp"]
        if ts not in seen_timestamps:
            seen_timestamps.add(ts)
            deduped.append(m)

    # 7. Sort ascending by timestamp
    deduped.sort(key=lambda m: m["timestamp"])

    print(f"  Merged: {len(deduped)} unique messages (removed {len(all_msgs) - len(deduped)} duplicates)")

    # 8. Write merged file
    merged = {
        "participants": existing.get("participants", ["Mark Cody", "Jose Burgos"]),
        "threadName": existing.get("threadName", "Jose Burgos_1"),
        "messages": deduped,
    }

    print("Writing merged jose-burgos.json...")
    with open(EXISTING_JSON, "w", encoding="latin-1") as f:
        json.dump(merged, f, indent=2, ensure_ascii=False)

    from datetime import datetime
    timestamps = [m["timestamp"] for m in deduped]
    print(f"\nDone!")
    print(f"  Total messages: {len(deduped)}")
    print(f"  Date range: {datetime.fromtimestamp(min(timestamps)/1000).date()} to {datetime.fromtimestamp(max(timestamps)/1000).date()}")


if __name__ == "__main__":
    main()
