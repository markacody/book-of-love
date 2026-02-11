import { NextRequest, NextResponse } from "next/server";
import { searchMessages } from "@/lib/messages";

export async function GET(request: NextRequest) {
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

  const results = searchMessages(q, from, to);
  return NextResponse.json({ results, total: results.length, query: q });
}
