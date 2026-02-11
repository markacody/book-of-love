/**
 * Upload all media files to Cloudflare R2 and update URIs in Supabase.
 *
 * Usage: node scripts/upload-media.mjs
 */

import fs from "fs";
import path from "path";
import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { createClient } from "@supabase/supabase-js";

// Load .env.local
const envPath = path.join(process.cwd(), ".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
const env = {};
for (const line of envContent.split("\n")) {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
}

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});

const bucket = env.R2_BUCKET_NAME;
const publicUrl = env.R2_PUBLIC_URL;

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

const MIME_TYPES = {
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  mp4: "video/mp4",
  png: "image/png",
};

async function fileExistsInR2(key) {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return true;
  } catch {
    return false;
  }
}

async function uploadFile(filePath, key) {
  const ext = path.extname(filePath).slice(1).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";
  const body = fs.readFileSync(filePath);

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
}

async function main() {
  const mediaDir = path.join(process.cwd(), "media");
  const files = fs.readdirSync(mediaDir).filter((f) => !f.startsWith("."));

  console.log(`Found ${files.length} media files to upload`);

  // Upload files
  let uploaded = 0;
  let skipped = 0;

  for (const file of files) {
    const filePath = path.join(mediaDir, file);
    const key = file; // flat structure in bucket

    const exists = await fileExistsInR2(key);
    if (exists) {
      skipped++;
      continue;
    }

    await uploadFile(filePath, key);
    uploaded++;
    process.stdout.write(`\r  Uploaded ${uploaded}, skipped ${skipped}/${files.length}...`);
  }

  console.log(`\n  Done: ${uploaded} uploaded, ${skipped} already existed`);

  // Update media URIs in Supabase
  console.log("\nUpdating media URIs in Supabase...");

  // Fetch all media records (paginate past 1000 limit)
  const allMedia = [];
  let from = 0;
  const batchSize = 1000;

  while (true) {
    const { data: batch, error } = await supabase
      .from("media")
      .select("id, uri")
      .range(from, from + batchSize - 1);

    if (error) {
      console.error("Error fetching media:", error);
      process.exit(1);
    }
    if (!batch || batch.length === 0) break;
    allMedia.push(...batch);
    if (batch.length < batchSize) break;
    from += batchSize;
  }

  console.log(`  ${allMedia.length} media records to update`);

  let updated = 0;
  for (const record of allMedia) {
    // Extract filename from URI like "./media/uuid.jpeg" or "media/uuid.jpeg"
    const filename = record.uri.split("/").pop();
    const newUri = `${publicUrl}/${filename}`;

    if (record.uri === newUri) continue; // already updated

    const { error } = await supabase
      .from("media")
      .update({ uri: newUri })
      .eq("id", record.id);

    if (error) {
      console.error(`  Error updating media ${record.id}:`, error);
    } else {
      updated++;
    }
  }

  console.log(`  Updated ${updated} URIs`);
  console.log(`\nMedia now served from: ${publicUrl}/`);
  console.log("Done!");
}

main().catch(console.error);
