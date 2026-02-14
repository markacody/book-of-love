"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";

export default function Nav() {
  const { session, signOut } = useAuth();

  return (
    <nav className="border-b border-blush bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="mx-auto max-w-3xl flex items-center justify-between px-4 py-3">
        <Link
          href={session ? "/timeline" : "/"}
          className="text-lg font-bold text-rose tracking-tight"
        >
          The Book of Love
        </Link>
        {session && (
          <div className="flex gap-1 items-center">
            <Link
              href="/timeline"
              className="rounded-full px-4 py-1.5 text-sm font-medium text-steel transition-colors hover:bg-blush/50 hover:text-rose"
            >
              Timeline
            </Link>
            <Link
              href="/search"
              className="rounded-full px-4 py-1.5 text-sm font-medium text-steel transition-colors hover:bg-blush/50 hover:text-rose"
            >
              Search
            </Link>
            <button
              onClick={signOut}
              className="rounded-full px-3 py-1.5 text-sm text-steel/50 transition-colors hover:text-rose ml-2"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
