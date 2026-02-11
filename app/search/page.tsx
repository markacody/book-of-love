"use client";

import { useState } from "react";
import SearchBar from "@/components/SearchBar";
import Message from "@/components/Message";

interface MessageData {
  id: number;
  senderName: string;
  text: string;
  timestamp: number;
  type: "text" | "media" | "link" | "placeholder";
  media: { uri: string }[];
  reactions: { actor: string; reaction: string }[];
  isUnsent: boolean;
}

export default function SearchPage() {
  const [results, setResults] = useState<MessageData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [query, setQuery] = useState("");
  const [total, setTotal] = useState(0);

  const handleSearch = async (q: string, from?: string, to?: string) => {
    setLoading(true);
    setQuery(q);
    setSearched(true);

    const params = new URLSearchParams({ q });
    if (from) params.set("from", from);
    if (to) params.set("to", to);

    const res = await fetch(`/api/messages/search?${params}`);
    const data = await res.json();

    setResults(data.results);
    setTotal(data.total);
    setLoading(false);
  };

  return (
    <div className="flex-1 flex flex-col max-w-3xl w-full mx-auto">
      {/* Search header */}
      <div className="px-4 py-6 border-b border-blush bg-white/50">
        <h2 className="text-lg font-bold text-rose mb-1">
          Remembering Together
        </h2>
        <p className="text-xs text-steel/60 mb-4">
          Search through all your messages
        </p>
        <SearchBar onSearch={handleSearch} loading={loading} />
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-pulse text-rose text-sm">
              Searching...
            </div>
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <div className="text-center py-12">
            <p className="text-steel/60 text-sm">
              No messages found for &ldquo;{query}&rdquo;
            </p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <>
            <div className="mb-4 text-xs text-steel/60">
              {total} message{total !== 1 ? "s" : ""} found
            </div>
            <div className="space-y-1">
              {results.map((msg) => {
                const date = new Date(msg.timestamp).toLocaleDateString(
                  "en-US",
                  {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }
                );
                return (
                  <div key={msg.id}>
                    <div className="text-[10px] text-steel/40 ml-2 mb-0.5">
                      {date}
                    </div>
                    <a href={`/timeline?date=${new Date(msg.timestamp).toISOString().split("T")[0]}`}>
                      <Message {...msg} highlight={query} />
                    </a>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {!searched && (
          <div className="text-center py-16">
            <div className="text-4xl mb-4 opacity-30">&#128270;</div>
            <p className="text-steel/40 text-sm">
              Search for a word, a phrase, a memory...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
