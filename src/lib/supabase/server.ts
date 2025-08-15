/**
 * @file server.ts
 * @description Supabase server client for Next.js 14 App Router
 * @module lib/supabase
 * 
 * Server-side Supabase client for use in:
 * - Server Components
 * - Server Actions
 * - Route Handlers
 * - Middleware
 * 
 * @reftools Verified against: @supabase/ssr v0.x, Next.js 14+ App Router
 * @supabase Uses createServerClient with cookie handling for auth persistence
 * @author Claude Code
 * @created 2025-08-13
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '../../types/database'

/**
 * Create Supabase server client with cookie-based auth
 * IMPORTANT: Always use this for server-side operations
 * 
 * @returns Supabase client configured for server-side use
 */
export function createClient() {
  const cookieStore = cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}

/**
 * Create Supabase admin client for server-side operations requiring elevated privileges
 * SECURITY: Only use this for admin operations, never expose service role key to client
 * 
 * @returns Supabase client with service role privileges
 */
export function createAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for admin operations')
  }

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get() {
          return undefined
        },
      },
    }
  )
}

/**
 * Helper function to get current authenticated user
 * SECURITY: Always use getUser() instead of getSession() in server code
 * 
 * @returns Current user or null if not authenticated
 */
export async function getCurrentUser() {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    console.error('Error getting current user:', error)
    return null
  }
  
  return user
}

/**
 * Helper function to get current user's profile
 * 
 * @returns User profile with institution and role information
 */
export async function getCurrentUserProfile() {
  const user = await getCurrentUser()
  if (!user) return null

  const supabase = createClient()
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('Error getting user profile:', error)
    return null
  }

  return profile
}

/**
 * Helper function to check if user is admin
 * 
 * @returns true if user has admin role, false otherwise
 */
export async function isUserAdmin() {
  const profile = await getCurrentUserProfile()
  return profile?.role === 'admin'
}

/**
 * Helper function to get user's institution
 * 
 * @returns User's institution or null
 */
export async function getUserInstitution() {
  const profile = await getCurrentUserProfile()
  return profile?.institution || null
}