import { NextRequest, NextResponse } from "next/server";
import { getMessagesPaginated } from "@/lib/messages";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "0", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "50", 10);
  const from = searchParams.get("from") || undefined;
  const to = searchParams.get("to") || undefined;

  const result = getMessagesPaginated(page, pageSize, from, to);
  return NextResponse.json(result);
}
