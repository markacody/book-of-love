"use client";

import { useState } from "react";

interface SearchBarProps {
  onSearch: (query: string, from?: string, to?: string) => void;
  loading?: boolean;
}

export default function SearchBar({ onSearch, loading }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim(), fromDate || undefined, toDate || undefined);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your messages..."
          className="w-full rounded-full border border-blush bg-white px-5 py-3 pr-12 text-sm text-gray-900 placeholder-steel/50 shadow-sm focus:border-rose focus:outline-none focus:ring-2 focus:ring-rose/20"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-rose p-2 text-white transition-colors hover:bg-rose/80 disabled:opacity-40"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
      </div>

      {/* Date range filters */}
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-[10px] font-medium text-steel mb-1 ml-1">
            From
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            min="2024-03-28"
            max="2024-11-24"
            className="w-full rounded-lg border border-blush bg-white px-3 py-2 text-xs text-gray-700 focus:border-rose focus:outline-none focus:ring-1 focus:ring-rose/20"
          />
        </div>
        <div className="flex-1">
          <label className="block text-[10px] font-medium text-steel mb-1 ml-1">
            To
          </label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            min="2024-03-28"
            max="2024-11-24"
            className="w-full rounded-lg border border-blush bg-white px-3 py-2 text-xs text-gray-700 focus:border-rose focus:outline-none focus:ring-1 focus:ring-rose/20"
          />
        </div>
      </div>
    </form>
  );
}
