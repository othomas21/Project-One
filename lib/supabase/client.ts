/**
 * @file client.ts
 * @description Supabase client for Next.js 14 App Router - Client Components
 * @module lib/supabase
 * 
 * Client-side Supabase client for use in:
 * - Client Components
 * - Browser-side interactions
 * - Real-time subscriptions
 * 
 * @reftools Verified against: @supabase/ssr v0.x, Next.js 14+ App Router
 * @supabase Uses createBrowserClient for client-side operations
 * @author Claude Code
 * @created 2025-08-13
 */

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '../../types/database'

/**
 * Create Supabase browser client for client-side operations
 * This client automatically handles auth state and cookie management
 * 
 * @returns Supabase client configured for browser use
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

/**
 * Singleton pattern to ensure only one client instance
 * This prevents unnecessary re-creation of the client
 */
let client: ReturnType<typeof createClient> | null = null

export function getClient() {
  if (!client) {
    client = createClient()
  }
  return client
}