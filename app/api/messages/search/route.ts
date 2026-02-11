import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const supabase = createServiceClient();
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  const from = searchParams.get("from") || undefined;
  const to = searchParams.get("to") || undefined;

  if (!q) {
    return NextResponse.json(
      { error: "Query parameter 'q' is required" },
      { status: 400 }
    );
  }

  // Use PostgreSQL full-text search with websearch_to_tsquery for natural queries,
  // falling back to ILIKE for simple substring matches
  let query = supabase
    .from("messages")
    .select("*, media(*), reactions(*)", { count: "exact" })
    .ilike("text", `%${q}%`)
    .order("timestamp", { ascending: true })
    .limit(200);

  if (from) {
    const fromTs = new Date(from).getTime();
    query = query.gte("timestamp", fromTs);
  }
  if (to) {
    const toTs = new Date(to).getTime() + 86400000;
    query = query.lt("timestamp", toTs);
  }

  const { data, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const results = (data || []).map((msg) => ({
    id: msg.id,
    senderName: msg.sender_name,
    text: msg.text,
    timestamp: msg.timestamp,
    type: msg.type,
    isUnsent: msg.is_unsent,
    shareLink: msg.share_link,
    media: (msg.media || []).map((m: { uri: string }) => ({ uri: m.uri })),
    reactions: (msg.reactions || []).map((r: { actor: string; reaction: string }) => ({
      actor: r.actor,
      reaction: r.reaction,
    })),
  }));

  return NextResponse.json({ results, total: count || 0, query: q });
}
