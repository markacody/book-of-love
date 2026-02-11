/**
 * Import messages from jose-burgos.json into Supabase.
 *
 * Usage: node scripts/import-messages.mjs
 *
 * Reads .env.local for Supabase credentials.
 */

import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

// Load .env.local manually (no dotenv dependency needed)
const envPath = path.join(process.cwd(), ".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
const env = {};
for (const line of envContent.split("\n")) {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Facebook Messenger encodes UTF-8 as latin1 — decode it
function decodeFBString(str) {
  if (!str) return str;
  try {
    const bytes = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
      bytes[i] = str.charCodeAt(i);
    }
    return new TextDecoder("utf-8").decode(bytes);
  } catch {
    return str;
  }
}

async function main() {
  // Load JSON
  console.log("Loading jose-burgos.json...");
  const raw = fs.readFileSync(
    path.join(process.cwd(), "jose-burgos.json"),
    "latin1"
  );
  const data = JSON.parse(raw);
  const messages = data.messages;
  console.log(`  ${messages.length} messages to import`);

  // Check if already imported
  const { count } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true });
  if (count > 0) {
    console.log(`  Database already has ${count} messages.`);
    console.log("  To re-import, truncate tables first via SQL Editor:");
    console.log(
      "  TRUNCATE messages, media, reactions RESTART IDENTITY CASCADE;"
    );
    process.exit(0);
  }

  // Import in batches
  const BATCH_SIZE = 100;
  let imported = 0;

  for (let i = 0; i < messages.length; i += BATCH_SIZE) {
    const batch = messages.slice(i, i + BATCH_SIZE);

    // Insert messages
    const messageRows = batch.map((msg) => ({
      sender_name: decodeFBString(msg.senderName),
      text: msg.text ? decodeFBString(msg.text) : "",
      timestamp: msg.timestamp,
      type: msg.type,
      is_unsent: msg.isUnsent || false,
      share_link: msg.shareLink || null,
    }));

    const { data: insertedMessages, error: msgError } = await supabase
      .from("messages")
      .insert(messageRows)
      .select("id");

    if (msgError) {
      console.error(`Error inserting messages batch at ${i}:`, msgError);
      process.exit(1);
    }

    // Insert media and reactions for each message in the batch
    const mediaRows = [];
    const reactionRows = [];

    batch.forEach((msg, j) => {
      const messageId = insertedMessages[j].id;

      // Media
      if (msg.media && msg.media.length > 0) {
        for (const m of msg.media) {
          const filename = m.uri.split("/").pop();
          const ext = filename.split(".").pop().toLowerCase();
          mediaRows.push({
            message_id: messageId,
            uri: m.uri,
            original_filename: filename,
            file_type: ext,
          });
        }
      }

      // Reactions
      if (msg.reactions && msg.reactions.length > 0) {
        for (const r of msg.reactions) {
          reactionRows.push({
            message_id: messageId,
            actor: decodeFBString(r.actor),
            reaction: decodeFBString(r.reaction),
          });
        }
      }
    });

    if (mediaRows.length > 0) {
      const { error: mediaError } = await supabase
        .from("media")
        .insert(mediaRows);
      if (mediaError) {
        console.error(`Error inserting media at batch ${i}:`, mediaError);
      }
    }

    if (reactionRows.length > 0) {
      const { error: reactError } = await supabase
        .from("reactions")
        .insert(reactionRows);
      if (reactError) {
        console.error(`Error inserting reactions at batch ${i}:`, reactError);
      }
    }

    imported += batch.length;
    process.stdout.write(
      `\r  Imported ${imported}/${messages.length} messages...`
    );
  }

  console.log("\n\nVerifying...");

  const { count: msgCount } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true });
  const { count: mediaCount } = await supabase
    .from("media")
    .select("*", { count: "exact", head: true });
  const { count: reactionCount } = await supabase
    .from("reactions")
    .select("*", { count: "exact", head: true });

  console.log(`  Messages:  ${msgCount}`);
  console.log(`  Media:     ${mediaCount}`);
  console.log(`  Reactions: ${reactionCount}`);
  console.log("\nDone!");
}

main().catch(console.error);
