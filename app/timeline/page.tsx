"use client";

import { useState } from "react";
import MessageList from "@/components/MessageList";
import DatePicker from "@/components/DatePicker";

export default function TimelinePage() {
  const [selectedDate, setSelectedDate] = useState<string | undefined>();

  return (
    <div className="flex-1 flex flex-col max-w-3xl w-full mx-auto">
      {/* Header with date picker */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-blush bg-white/50">
        <h2 className="text-sm font-semibold text-steel">
          {selectedDate ? "" : "All Messages"}
        </h2>
        <DatePicker
          onSelectDate={(date) => setSelectedDate(date)}
          currentDate={selectedDate}
        />
        {selectedDate && (
          <button
            onClick={() => setSelectedDate(undefined)}
            className="text-xs text-steel/60 hover:text-rose transition-colors"
          >
            Show all
          </button>
        )}
      </div>

      {/* Message list */}
      <MessageList initialDate={selectedDate} />
    </div>
  );
}
