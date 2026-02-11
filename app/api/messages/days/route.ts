import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export async function GET() {
  const supabase = createServiceClient();

  // Fetch all message timestamps to group by day
  // Supabase limits to 1000 rows by default, so paginate through all
  const allTimestamps: { timestamp: number }[] = [];
  let from = 0;
  const batchSize = 1000;

  while (true) {
    const { data: batch, error: batchError } = await supabase
      .from("messages")
      .select("timestamp")
      .order("timestamp", { ascending: true })
      .range(from, from + batchSize - 1);

    if (batchError) {
      return NextResponse.json({ error: batchError.message }, { status: 500 });
    }

    if (!batch || batch.length === 0) break;
    allTimestamps.push(...batch);
    if (batch.length < batchSize) break;
    from += batchSize;
  }

  // Group by day
  const dayMap = new Map<string, number>();
  for (const msg of allTimestamps) {
    const date = new Date(msg.timestamp);
    const key = date.toISOString().split("T")[0];
    dayMap.set(key, (dayMap.get(key) || 0) + 1);
  }

  const days = Array.from(dayMap.entries()).map(([dateStr, count]) => {
    const date = new Date(dateStr + "T12:00:00");
    return {
      date: dateStr,
      label: date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      count,
    };
  });

  return NextResponse.json({ days });
}
