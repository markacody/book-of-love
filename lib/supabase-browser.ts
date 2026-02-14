import { createClient } from "@supabase/supabase-js";

// Single shared Supabase client for the browser.
// Sessions are persisted in localStorage and auto-refreshed.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
