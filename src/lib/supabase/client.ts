'use client';

import { createBrowserClient } from '@supabase/ssr';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BrowserClient = ReturnType<typeof createBrowserClient<any>>;

let instance: BrowserClient | null = null;

export function createClient(): BrowserClient {
  if (!instance) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    instance = createBrowserClient<any>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return instance;
}
