import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const supabase = createServiceClient();
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "0", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "50", 10);
  const from = searchParams.get("from") || undefined;
  const to = searchParams.get("to") || undefined;

  // Build query
  let query = supabase
    .from("messages")
    .select("*, media(*), reactions(*)", { count: "exact" })
    .order("timestamp", { ascending: true });

  if (from) {
    const fromTs = new Date(from).getTime();
    query = query.gte("timestamp", fromTs);
  }
  if (to) {
    const toTs = new Date(to).getTime() + 86400000;
    query = query.lt("timestamp", toTs);
  }

  const start = page * pageSize;
  query = query.range(start, start + pageSize - 1);

  const { data, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Transform to match frontend expectations
  const messages = (data || []).map((msg) => ({
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

  return NextResponse.json({
    messages,
    total: count || 0,
    page,
    pageSize,
  });
}
