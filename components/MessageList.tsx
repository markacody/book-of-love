"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Message from "./Message";

interface MediaItem {
  uri: string;
}

interface Reaction {
  actor: string;
  reaction: string;
}

interface MessageData {
  id: number;
  senderName: string;
  text: string;
  timestamp: number;
  type: "text" | "media" | "link" | "placeholder";
  media: MediaItem[];
  reactions: Reaction[];
  isUnsent: boolean;
}

interface MessageListProps {
  initialDate?: string; // YYYY-MM-DD to jump to
  scrollToMessageId?: number;
}

function formatDayHeader(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function groupByDay(messages: MessageData[]): Map<string, MessageData[]> {
  const groups = new Map<string, MessageData[]>();
  for (const msg of messages) {
    const key = new Date(msg.timestamp).toISOString().split("T")[0];
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(msg);
  }
  return groups;
}

export default function MessageList({ initialDate, scrollToMessageId }: MessageListProps) {
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const pageSize = 50;

  const fetchMessages = useCallback(
    async (pageNum: number) => {
      if (loadingRef.current) return;
      loadingRef.current = true;
      setLoading(true);

      const params = new URLSearchParams({
        page: pageNum.toString(),
        pageSize: pageSize.toString(),
      });
      if (initialDate) params.set("from", initialDate);

      const res = await fetch(`/api/messages?${params}`);
      const data = await res.json();

      setMessages((prev) => {
        const existingIds = new Set(prev.map((m) => m.id));
        const newMsgs = data.messages.filter(
          (m: MessageData) => !existingIds.has(m.id)
        );
        return [...prev, ...newMsgs];
      });
      setHasMore(data.messages.length === pageSize);
      setLoading(false);
      loadingRef.current = false;
    },
    [initialDate]
  );

  // Initial load
  useEffect(() => {
    setMessages([]);
    setPage(0);
    setHasMore(true);
    setInitialLoad(true);
    fetchMessages(0);
  }, [initialDate, fetchMessages]);

  // Scroll to bottom on initial load
  useEffect(() => {
    if (initialLoad && messages.length > 0) {
      if (scrollToMessageId !== undefined) {
        const el = document.getElementById(`msg-${scrollToMessageId}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          setInitialLoad(false);
          return;
        }
      }
      bottomRef.current?.scrollIntoView({ behavior: "auto" });
      setInitialLoad(false);
    }
  }, [messages, initialLoad, scrollToMessageId]);

  // Infinite scroll — load more when user scrolls near bottom
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      if (scrollHeight - scrollTop - clientHeight < 200 && hasMore && !loadingRef.current) {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchMessages(nextPage);
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [page, hasMore, fetchMessages]);

  const grouped = groupByDay(messages);

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto px-4 py-2">
      {Array.from(grouped.entries()).map(([dateStr, dayMessages]) => (
        <div key={dateStr}>
          {/* Sticky day header */}
          <div className="sticky top-0 z-10 flex justify-center py-3">
            <span className="bg-flesh/80 backdrop-blur-sm text-steel text-xs font-semibold px-4 py-1.5 rounded-full shadow-sm">
              {formatDayHeader(dateStr)}
            </span>
          </div>

          {/* Messages for this day */}
          {dayMessages.map((msg) => (
            <div key={msg.id} id={`msg-${msg.id}`}>
              <Message {...msg} />
            </div>
          ))}
        </div>
      ))}

      {loading && (
        <div className="flex justify-center py-4">
          <div className="animate-pulse text-rose text-sm">
            Loading messages...
          </div>
        </div>
      )}

      {!hasMore && messages.length > 0 && (
        <div className="flex justify-center py-6">
          <span className="text-steel/50 text-xs">
            You&apos;ve reached the end of this chapter
          </span>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
