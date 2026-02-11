"use client";

import { useState, useEffect } from "react";

interface DaySummary {
  date: string;
  label: string;
  count: number;
}

interface DatePickerProps {
  onSelectDate: (date: string) => void;
  currentDate?: string;
}

export default function DatePicker({ onSelectDate, currentDate }: DatePickerProps) {
  const [days, setDays] = useState<DaySummary[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch("/api/messages/days")
      .then((res) => res.json())
      .then((data) => setDays(data.days));
  }, []);

  const currentLabel = currentDate
    ? days.find((d) => d.date === currentDate)?.label || currentDate
    : "Jump to date";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full border border-blush bg-white px-4 py-2 text-sm text-steel shadow-sm transition-colors hover:border-rose hover:text-rose"
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
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span className="max-w-[200px] truncate">{currentLabel}</span>
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          {/* Dropdown */}
          <div className="absolute left-0 top-full z-50 mt-2 max-h-72 w-72 overflow-y-auto rounded-xl border border-blush bg-white shadow-lg">
            <div className="p-2">
              <div className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-steel/60">
                Choose a day
              </div>
              {days.map((day) => (
                <button
                  key={day.date}
                  onClick={() => {
                    onSelectDate(day.date);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-blush/50 ${
                    currentDate === day.date
                      ? "bg-rose/10 text-rose font-medium"
                      : "text-gray-700"
                  }`}
                >
                  <span>{day.label}</span>
                  <span className="text-[10px] text-steel/60">
                    {day.count} msgs
                  </span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
