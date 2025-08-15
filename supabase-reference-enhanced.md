# Enhanced Supabase Reference Subsystem for Claude Code

### 🗄️ SUPABASE INTEGRATION & REFERENCE SUBSYSTEM

This subsystem provides the standards, protocols, and checklists for implementing Supabase as the primary Backend-as-a-Service (BaaS) within a **Next.js 14+ App Router** environment.

-----

## 1. Purpose & Core Stack

Claude Code must treat Supabase as the primary BaaS option for features requiring:

* **Authentication** and user management (JWT-based).
* **Database** (PostgreSQL) operations.
* **File Storage**.
* **Real-time Subscriptions**.
* **Edge Functions**.
* **Row-Level Security (RLS)**.

All implementations must meet production-readiness, security, and maintainability standards.

-----

## 2. Project Setup & Environment

Before implementation, the following setup must be verified or performed:

* **Supabase Project:** A new project is created and the following keys are gathered:

    * `NEXT_PUBLIC_SUPABASE_URL`
    * `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    * `SERVICE_ROLE_KEY` (For server-side use ONLY).

* **Authentication Configuration:**

    * In the Supabase Dashboard, correct redirect URLs for both development (`http://localhost:3000`) and production are added under **Authentication > URL Configuration**.
    * Email Authentication is enabled. For rapid development, "Confirm email" can be temporarily disabled.
    * A manual test user is created in **Authentication > Users**.

* **Environment Variables:**

    * The `.env.local` file must be populated correctly. **NEVER** hardcode keys in the application.
    * The `NEXTAUTH_SECRET` should be generated with a secure method like `openssl rand -base64 32`.

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=<your_project_url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_anon_key>
# SERVICE_ROLE_KEY=<your_service_role_key> # Only if needed server-side

# For Next.js / Vercel
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generated_secure_secret>
```

-----

## 3. RefTools Integration Protocol

Whenever writing or modifying Supabase-related code, Claude Code **MUST**:

1. **Check Docs:** Use `RefTools MCP` to check version-specific Supabase documentation before implementation (especially for SDK changes, PostgREST syntax, or authentication APIs).

2. **Verify APIs:** Confirm the syntax and usage for:

    * Auth methods: `signUp`, `signInWithPassword`, `signInWithOAuth`, `signOut`.
    * Client initialization: `createBrowserClient()`, `createServerClient()` patterns.
    * Query syntax: `.select()`, `.insert()`, `.update()`, `.delete()`.
    * Storage and Realtime API usage.

3. **Integrate Best Practices:** Automatically apply pagination, schema constraints, indexing, server-side filtering, and explicit field selection.

4. **Annotate:** Add a `@reftools` verification annotation in the JSDoc header of Supabase-related functions.

```javascript
/**
 * @reftools Verified against: Supabase JS v2.x, @supabase/ssr v0.x
 */
```

-----

## 4. Implementation Standards

### **CRITICAL UPDATE: Auth Helpers Migration**

**⚠️ BREAKING CHANGE:** The `@supabase/auth-helpers` package is **DEPRECATED**. Use `@supabase/ssr` instead.

#### Package Installation

```bash
npm install @supabase/supabase-js @supabase/ssr
```

#### Client Initialization

Create separate clients for browser and server environments:

```typescript
// @file utils/supabase/client.ts
// @description Browser client for Client Components
// @reftools Verified against: @supabase/ssr v0.x

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

```typescript
// @file utils/supabase/server.ts
// @description Server client for Server Components, Actions, and Route Handlers
// @reftools Verified against: @supabase/ssr v0.x, Next.js 14+ App Router

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set({ name, value, ...options })
          })
        },
      },
    }
  )
}
```

### TypeScript Integration & Type Safety

**MANDATORY:** Generate and maintain TypeScript definitions for type safety:

```bash
# Generate types from your database schema
supabase gen types typescript --local > lib/database.types.ts

# For remote projects:
supabase gen types typescript --project-id=<project-id> > lib/database.types.ts
```

```typescript
// @file lib/database.types.ts
// @reftools Verified against: Supabase CLI gen types command

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          email: string
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          email?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          user_id: string
          name: string | null
          avatar_url: string | null
        }
        Insert: {
          user_id: string
          name?: string | null
          avatar_url?: string | null
        }
        Update: {
          name?: string | null
          avatar_url?: string | null
        }
      }
    }
    Views: {
      // Add view types here
    }
    Functions: {
      // Add function types here
    }
  }
}
```

```typescript
// @file utils/supabase/typed-client.ts
// @description Type-safe Supabase client
// @reftools Verified against: Supabase TypeScript integration

import { createClient } from './client'
import type { Database } from '@/lib/database.types'

export const typedSupabase = createClient<Database>()
```

### Updated Middleware Pattern

**REQUIRED:** Use Next.js 14+ App Router compatible middleware:

```typescript
// @file middleware.ts
// @description Next.js 14+ App Router middleware for Supabase auth
// @reftools Verified against: @supabase/ssr middleware patterns, Next.js 14+

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Refresh session if expired - this is critical for auth state
  const { data: { user } } = await supabase.auth.getUser()

  // Protect authenticated routes
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### Authentication Flow

```typescript
// @file app/login/actions.ts
// @description Server Actions for authentication
// @reftools Verified against: Supabase Auth v2.x, Next.js Server Actions

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export async function signUp(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  const supabase = await createClient()
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`,
    },
  })
  
  if (error) {
    console.error('Signup error:', error)
    redirect('/login?error=signup_failed')
  }
  
  if (data.user && !data.user.email_confirmed_at) {
    redirect('/login?message=check_email')
  }
  
  redirect('/dashboard')
}

export async function signIn(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  const supabase = await createClient()
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) {
    console.error('Signin error:', error)
    redirect('/login?error=invalid_credentials')
  }
  
  redirect('/dashboard')
}

export async function signOut() {
  const supabase = await createClient()
  
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    console.error('Signout error:', error)
  }
  
  redirect('/login')
}
```

### Enhanced Database Access Patterns

**CRITICAL:** Apply RLS performance optimizations:

```typescript
// @file services/users.ts
// @description User service with RLS performance optimizations
// @reftools Verified against: Supabase RLS performance recommendations

import { createClient } from '@/utils/supabase/server'
import type { Database } from '@/lib/database.types'

type User = Database['public']['Tables']['users']['Row']
type UserInsert = Database['public']['Tables']['users']['Insert']
type UserUpdate = Database['public']['Tables']['users']['Update']

/**
 * Get active users with performance optimization
 * @reftools Verified against: Supabase RLS performance patterns
 */
export const getActiveUsers = async (): Promise<User[]> => {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('users')
    .select('id, email, created_at, profiles(name, avatar_url)')
    .eq('status', 'active')
    .eq('user_id', (await supabase.auth.getUser()).data.user?.id) // Explicit filter
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) throw new SupabaseError(error.message, error.code)
  return data
}

/**
 * Create user with type safety
 */
export const createUser = async (userData: UserInsert): Promise<User> => {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('users')
    .insert(userData)
    .select()
    .single()

  if (error) throw new SupabaseError(error.message, error.code)
  return data
}
```

### Row-Level Security (RLS) Optimization

**MANDATORY RLS Performance Patterns:**

```sql
-- @reftools Verified against: Supabase RLS performance recommendations

-- 1. Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. Optimized policies using (select auth.uid()) pattern
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- 3. Policies with explicit roles
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- 4. Required indexes for RLS performance
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_users_id ON users(id);

-- 5. Security definer functions for complex policies
CREATE OR REPLACE FUNCTION private.user_has_role(required_role text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = (SELECT auth.uid()) 
    AND role = required_role
  );
END;
$$;

-- Use in policies
CREATE POLICY "Admin access" ON sensitive_table
  FOR ALL TO authenticated
  USING (private.user_has_role('admin'));
```

### Modern Edge Functions Implementation

```typescript
// @file supabase/functions/hello-world/index.ts
// @description Modern Edge Function with Deno runtime
// @reftools Verified against: Supabase Edge Functions 2024, Deno 1.x

import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'

interface RequestBody {
  name: string
}

interface ResponseBody {
  message: string
  timestamp: string
}

Deno.serve(async (req: Request): Promise<Response> => {
  // CORS handling
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }

  try {
    // Initialize Supabase client with service role for server-side operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user from JWT
    const authHeader = req.headers.get('Authorization')
    if (authHeader) {
      const { data: { user }, error } = await supabase.auth.getUser(
        authHeader.replace('Bearer ', '')
      )
      
      if (error || !user) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        )
      }
    }

    const { name }: RequestBody = await req.json()
    
    const response: ResponseBody = {
      message: `Hello ${name}!`,
      timestamp: new Date().toISOString(),
    }

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })

  } catch (error) {
    console.error('Edge function error:', error)
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    )
  }
})
```

### Real-time Subscriptions with Optimization

```typescript
// @file hooks/useRealtimeSubscription.ts
// @description Optimized real-time subscription hook
// @reftools Verified against: Supabase Realtime v2024

import { useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'

interface UseRealtimeSubscriptionProps {
  table: string
  filter?: string
  onInsert?: (payload: RealtimePostgresChangesPayload<any>) => void
  onUpdate?: (payload: RealtimePostgresChangesPayload<any>) => void
  onDelete?: (payload: RealtimePostgresChangesPayload<any>) => void
}

export function useRealtimeSubscription({
  table,
  filter,
  onInsert,
  onUpdate,
  onDelete,
}: UseRealtimeSubscriptionProps) {
  const channelRef = useRef<RealtimeChannel>()
  const supabase = createClient()

  useEffect(() => {
    // Create channel with unique name
    const channelName = `${table}${filter ? `_${filter}` : ''}_${Date.now()}`
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          ...(filter && { filter }),
        },
        (payload) => {
          switch (payload.eventType) {
            case 'INSERT':
              onInsert?.(payload)
              break
            case 'UPDATE':
              onUpdate?.(payload)
              break
            case 'DELETE':
              onDelete?.(payload)
              break
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to ${table} changes`)
        }
      })

    channelRef.current = channel

    // Cleanup subscription
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = undefined
      }
    }
  }, [table, filter, onInsert, onUpdate, onDelete])

  return {
    unsubscribe: () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = undefined
      }
    }
  }
}
```

### Enhanced Storage with RLS Security

```sql
-- @reftools Verified against: Supabase Storage RLS patterns

-- Enable RLS on storage tables
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

-- Bucket access policy
CREATE POLICY "Users can view public buckets" ON storage.buckets
  FOR SELECT TO authenticated
  USING (public = true);

-- File upload policy - users can only upload to their own folder
CREATE POLICY "Users can upload their own files" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'user-uploads' AND
    (storage.foldername(name))[1] = (SELECT auth.uid()::text)
  );

-- File access policy
CREATE POLICY "Users can view their own files" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'user-uploads' AND
    (storage.foldername(name))[1] = (SELECT auth.uid()::text)
  );

-- File update/delete policy
CREATE POLICY "Users can update their own files" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'user-uploads' AND
    (storage.foldername(name))[1] = (SELECT auth.uid()::text)
  );

CREATE POLICY "Users can delete their own files" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'user-uploads' AND
    (storage.foldername(name))[1] = (SELECT auth.uid()::text)
  );
```

```typescript
// @file services/storage.ts
// @description Type-safe storage service with security
// @reftools Verified against: Supabase Storage v2024

import { createClient } from '@/utils/supabase/client'

export class StorageService {
  private supabase = createClient()
  
  /**
   * Upload file to user's folder with validation
   */
  async uploadFile(
    bucket: string,
    file: File,
    userId: string,
    options?: { 
      maxSize?: number
      allowedTypes?: string[]
    }
  ) {
    // Validate file size (default 5MB)
    const maxSize = options?.maxSize || 5 * 1024 * 1024
    if (file.size > maxSize) {
      throw new Error(`File size exceeds ${maxSize} bytes`)
    }

    // Validate file type
    if (options?.allowedTypes && !options.allowedTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} not allowed`)
    }

    // Create user-specific path
    const fileName = `${Date.now()}-${file.name}`
    const filePath = `${userId}/${fileName}`

    const { data, error } = await this.supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) throw new StorageError(error.message)
    return data
  }

  /**
   * Get signed URL for private file access
   */
  async getSignedUrl(bucket: string, path: string, expiresIn = 3600) {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn)

    if (error) throw new StorageError(error.message)
    return data.signedUrl
  }

  /**
   * Delete file with ownership check
   */
  async deleteFile(bucket: string, path: string) {
    const { error } = await this.supabase.storage
      .from(bucket)
      .remove([path])

    if (error) throw new StorageError(error.message)
  }
}

export class StorageError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'StorageError'
  }
}
```

### Comprehensive Error Handling

```typescript
// @file lib/supabase-errors.ts
// @description Comprehensive error handling for Supabase operations
// @reftools Verified against: Supabase JS v2 error patterns

export class SupabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any,
    public hint?: string
  ) {
    super(message)
    this.name = 'SupabaseError'
    Error.captureStackTrace(this, this.constructor)
  }
}

export class AuthError extends SupabaseError {
  constructor(message: string, code?: string) {
    super(message, code)
    this.name = 'AuthError'
  }
}

export class DatabaseError extends SupabaseError {
  constructor(message: string, code?: string, details?: any) {
    super(message, code, details)
    this.name = 'DatabaseError'
  }
}

/**
 * Handle Supabase operation with structured error handling
 */
export async function handleSupabaseOperation<T>(
  operation: () => Promise<{ data: T; error: any }>,
  context?: string
): Promise<T> {
  try {
    const { data, error } = await operation()
    
    if (error) {
      // Log error for debugging
      console.error(`Supabase operation failed${context ? ` in ${context}` : ''}:`, error)
      
      // Handle specific error codes
      switch (error.code) {
        case 'PGRST116':
          throw new DatabaseError('Record not found', error.code)
        case 'PGRST204':
          throw new DatabaseError('No permission to access this resource', error.code)
        case '23505':
          throw new DatabaseError('Duplicate record', error.code)
        case '23503':
          throw new DatabaseError('Referenced record does not exist', error.code)
        case 'invalid_credentials':
          throw new AuthError('Invalid email or password', error.code)
        case 'signup_disabled':
          throw new AuthError('Account registration is disabled', error.code)
        case 'email_not_confirmed':
          throw new AuthError('Please confirm your email address', error.code)
        default:
          throw new SupabaseError(error.message, error.code, error.details, error.hint)
      }
    }
    
    return data
  } catch (error) {
    // Re-throw known errors
    if (error instanceof SupabaseError) {
      throw error
    }
    
    // Handle unexpected errors
    console.error(`Unexpected error${context ? ` in ${context}` : ''}:`, error)
    throw new SupabaseError('An unexpected error occurred', 'UNKNOWN_ERROR')
  }
}

/**
 * Wrapper for auth operations
 */
export async function handleAuthOperation<T>(
  operation: () => Promise<{ data: T; error: any }>,
  context?: string
): Promise<T> {
  return handleSupabaseOperation(operation, context ? `auth:${context}` : 'auth')
}

/**
 * Wrapper for database operations
 */
export async function handleDatabaseOperation<T>(
  operation: () => Promise<{ data: T; error: any }>,
  context?: string
): Promise<T> {
  return handleSupabaseOperation(operation, context ? `db:${context}` : 'database')
}
```

### Performance Monitoring & Observability

```typescript
// @file lib/supabase-monitor.ts
// @description Performance monitoring for Supabase operations
// @reftools Verified against: Production monitoring best practices

interface OperationMetrics {
  operation: string
  duration: number
  success: boolean
  error?: string
  timestamp: number
}

class SupabaseMonitor {
  private metrics: OperationMetrics[] = []
  
  /**
   * Monitor a Supabase operation with performance tracking
   */
  async monitorOperation<T>(
    operationName: string,
    operation: () => Promise<T>,
    options?: {
      slowThreshold?: number
      logErrors?: boolean
    }
  ): Promise<T> {
    const start = performance.now()
    const timestamp = Date.now()
    
    try {
      const result = await operation()
      const duration = performance.now() - start
      const slowThreshold = options?.slowThreshold || 1000
      
      // Log slow operations
      if (duration > slowThreshold) {
        console.warn(`Slow Supabase operation: ${operationName} took ${duration.toFixed(2)}ms`)
      }
      
      // Store metrics
      this.metrics.push({
        operation: operationName,
        duration,
        success: true,
        timestamp,
      })
      
      return result
    } catch (error) {
      const duration = performance.now() - start
      
      if (options?.logErrors !== false) {
        console.error(`Supabase operation failed: ${operationName}`, error)
      }
      
      // Store error metrics
      this.metrics.push({
        operation: operationName,
        duration,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp,
      })
      
      throw error
    }
  }
  
  /**
   * Get performance metrics
   */
  getMetrics(since?: number): OperationMetrics[] {
    if (!since) return [...this.metrics]
    return this.metrics.filter(m => m.timestamp >= since)
  }
  
  /**
   * Clear metrics history
   */
  clearMetrics(): void {
    this.metrics = []
  }
}

export const supabaseMonitor = new SupabaseMonitor()

// Usage example
export const monitoredDatabaseOperation = async <T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> => {
  return supabaseMonitor.monitorOperation(operationName, operation)
}
```

-----

## 5. Testing & Deployment

* **Local Development:** Use `supabase start` for local development with Docker.
* **Type Generation:** Run `supabase gen types typescript --local` after schema changes.
* **Testing:** Write integration tests using Supabase's local dev environment. Mock the Supabase client for unit tests.
* **Deployment:**
    * Use environment variables in production hosting provider.
    * Ensure middleware is configured for auth token refresh.
    * Test auth flows thoroughly in staging environment.

-----

## 6. Enhanced Final Checklist

Before shipping any Supabase-related feature, confirm the following:

**Migration & Setup:**
- [ ] **Package Migration Complete:** Using `@supabase/ssr` instead of deprecated `auth-helpers`
- [ ] **TypeScript Types Generated:** `supabase gen types typescript` executed and types imported
- [ ] **Environment Variables:** All keys in `.env.local` and production, never hardcoded

**Authentication & Security:**
- [ ] **Modern Auth Flow:** Server Actions and Client Components using correct client types
- [ ] **Middleware Updated:** Next.js 14+ App Router compatible middleware implemented
- [ ] **RLS Enabled:** Row-Level Security enabled on all tables with optimized policies
- [ ] **RLS Performance:** Policies use `(SELECT auth.uid())` pattern and required indexes created

**Database & Performance:**
- [ ] **Explicit Queries:** All `.select()` calls specify fields, no `SELECT *`
- [ ] **Query Filters:** All queries include explicit filters, not relying solely on RLS
- [ ] **Indexes Added:** Performance-critical columns have appropriate indexes
- [ ] **Service Role Safe:** Service key used only server-side, never exposed to client

**Modern Features:**
- [ ] **Edge Functions Updated:** Using modern Deno runtime with proper error handling
- [ ] **Storage RLS:** Storage buckets have RLS policies for secure file access
- [ ] **Realtime Optimized:** Channel subscriptions include filters and proper cleanup
- [ ] **Error Handling:** Structured error classes and comprehensive error handling implemented

**Monitoring & Testing:**
- [ ] **Performance Monitoring:** Operation monitoring and slow query detection in place
- [ ] **Tests Written:** Unit and integration tests cover all Supabase operations
- [ ] **RefTools Verification:** All implementations verified against current Supabase documentation
- [ ] **`@reftools` Annotations:** All relevant functions annotated with verification status

This enhanced checklist ensures your Supabase implementation follows current best practices and maintains production-ready standards.