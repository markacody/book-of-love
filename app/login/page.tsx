"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      router.push("/timeline");
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8 text-center">
        {/* Heart icon */}
        <div className="text-5xl animate-pulse">&#10084;&#65039;</div>

        <div>
          <h1 className="text-4xl font-bold text-rose tracking-tight">
            The Book of Love
          </h1>
          <p className="mt-2 text-steel text-sm">
            Sign in to read our story
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full rounded-lg border border-blush bg-white px-4 py-3 text-sm text-gray-900 placeholder-steel/50 focus:border-rose focus:outline-none focus:ring-2 focus:ring-rose/20"
            />
          </div>
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full rounded-lg border border-blush bg-white px-4 py-3 text-sm text-gray-900 placeholder-steel/50 focus:border-rose focus:outline-none focus:ring-2 focus:ring-rose/20"
            />
          </div>

          {error && (
            <p className="text-sm text-rose">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-rose px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-rose/90 hover:shadow-xl disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Enter"}
          </button>
        </form>

        <p className="text-[10px] text-steel/40 pt-4">
          Mark &amp; Jose
        </p>
      </div>
    </div>
  );
}
