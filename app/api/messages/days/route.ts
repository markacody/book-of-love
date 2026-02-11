import { NextResponse } from "next/server";
import { getDaySummaries } from "@/lib/messages";

export async function GET() {
  const days = getDaySummaries();
  return NextResponse.json({ days });
}
