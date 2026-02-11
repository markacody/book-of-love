import Link from "next/link";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4">
      <div className="text-center space-y-8 max-w-md">
        {/* Heart icon */}
        <div className="text-6xl animate-pulse">&#10084;&#65039;</div>

        {/* Title */}
        <div>
          <h1 className="text-5xl font-bold text-rose tracking-tight">
            The Book of Love
          </h1>
          <p className="mt-3 text-steel text-lg">
            Our story, one message at a time
          </p>
        </div>

        {/* Subtitle */}
        <p className="text-steel/70 text-sm leading-relaxed">
          3,707 messages. 8 months. Every word, every photo, every reaction
          &mdash; preserved here for us to revisit whenever we want.
        </p>

        {/* Enter button */}
        <Link
          href="/timeline"
          className="inline-flex items-center gap-2 rounded-full bg-rose px-8 py-3 text-lg font-semibold text-white shadow-lg transition-all hover:bg-rose/90 hover:shadow-xl hover:scale-105 active:scale-100"
        >
          Enter
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </Link>

        {/* Footer */}
        <p className="text-[10px] text-steel/40 pt-8">
          Mark &amp; Jose
        </p>
      </div>
    </div>
  );
}
