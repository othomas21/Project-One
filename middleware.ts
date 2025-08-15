/**
 * @file middleware.ts
 * @description Next.js middleware for Supabase authentication
 * @module root
 * 
 * Middleware responsibilities:
 * - Refresh Supabase Auth tokens automatically
 * - Handle authentication state across server/client boundary
 * - Protect authenticated routes
 * - Pass refreshed tokens to browser and server components
 * 
 * @reftools Verified against: Next.js 14+ middleware, @supabase/ssr v0.x
 * @supabase Uses createServerClient with cookie handling for auth refresh
 * @author Claude Code
 * @created 2025-08-13
 */

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Middleware function to handle Supabase authentication
 * CRITICAL: Always use getUser() instead of getSession() for security
 * 
 * @param request - Next.js request object
 * @returns NextResponse with updated auth cookies
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // IMPORTANT: Use getUser() to refresh the auth token and get the user
  // This ensures server components don't attempt to refresh the same token
  const { data: { user }, error } = await supabase.auth.getUser()

  // Handle authentication errors
  if (error) {
    console.error('Auth error in middleware:', error.message)
  }

  // Protect authenticated routes
  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth')
  const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard')
  const isSearchRoute = request.nextUrl.pathname.startsWith('/search')

  // Redirect unauthenticated users trying to access protected routes
  if (!user && (isDashboardRoute || (isSearchRoute && !isAuthRoute))) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Redirect authenticated users away from auth pages
  if (user && isAuthRoute && !request.nextUrl.pathname.includes('/callback')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Add user information to request headers for server components
  if (user) {
    response.headers.set('x-user-id', user.id)
    response.headers.set('x-user-email', user.email || '')
  }

  return response
}

/**
 * Middleware configuration
 * Runs on all routes except static assets and API internal routes
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - *.svg, *.png, *.jpg, *.jpeg, *.gif, *.webp (image files)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}