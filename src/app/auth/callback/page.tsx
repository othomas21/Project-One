/**
 * @file page.tsx
 * @description Authentication callback handler for Supabase Auth
 * @module app/auth/callback
 * 
 * Key responsibilities:
 * - Handle OAuth provider callbacks
 * - Process email confirmation links
 * - Handle password reset confirmations
 * - Redirect users to appropriate pages after auth events
 * - Error handling for auth failures
 * 
 * @reftools Verified against: Next.js 14+ App Router patterns, Supabase Auth v2.x
 * @supabase Integrated with auth callback handling
 * @author Claude Code
 * @created 2025-08-13
 */

"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight,
  Stethoscope
} from "lucide-react";

type CallbackStatus = 'loading' | 'success' | 'error';

interface CallbackState {
  status: CallbackStatus;
  message: string;
  redirectPath?: string;
  error?: string;
}

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [callbackState, setCallbackState] = useState<CallbackState>({
    status: 'loading',
    message: 'Processing authentication...'
  });

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const supabase = createClient();
        
        // Get the code and next parameters from URL
        const code = searchParams.get('code');
        const next = searchParams.get('next') || '/dashboard';
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        const type = searchParams.get('type'); // email confirmation, recovery, etc.

        // Handle errors from Supabase
        if (error) {
          let errorMessage = 'Authentication failed';
          
          switch (error) {
            case 'access_denied':
              errorMessage = 'Access was denied. Please try again or contact support.';
              break;
            case 'server_error':
              errorMessage = 'A server error occurred. Please try again later.';
              break;
            case 'temporarily_unavailable':
              errorMessage = 'Service temporarily unavailable. Please try again later.';
              break;
            default:
              errorMessage = errorDescription || error;
          }
          
          setCallbackState({
            status: 'error',
            message: 'Authentication Error',
            error: errorMessage
          });
          return;
        }

        // Handle email confirmation
        if (type === 'signup') {
          setCallbackState({
            status: 'success',
            message: 'Email Confirmed Successfully',
            redirectPath: '/auth/login?message=email_confirmed'
          });
          
          setTimeout(() => {
            router.push('/auth/login?message=email_confirmed');
          }, 3000);
          return;
        }

        // Handle password recovery
        if (type === 'recovery') {
          setCallbackState({
            status: 'success',
            message: 'Password Reset Authorized',
            redirectPath: '/auth/reset-password'
          });
          
          setTimeout(() => {
            router.push('/auth/reset-password');
          }, 2000);
          return;
        }

        // Handle OAuth or magic link with code
        if (code) {
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (exchangeError) {
            throw exchangeError;
          }

          if (!data.session) {
            throw new Error('No session created');
          }

          // Check user profile and status
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, role, status, first_name, last_name')
            .eq('id', data.user.id)
            .single();

          if (profileError || !profile) {
            setCallbackState({
              status: 'error',
              message: 'Profile Not Found',
              error: 'User profile not found. Please contact your administrator.'
            });
            return;
          }

          // Check if account is active
          if (profile.status !== 'active') {
            let statusMessage = '';
            switch (profile.status) {
              case 'pending':
                statusMessage = 'Your account is pending approval. Please contact your administrator.';
                break;
              case 'suspended':
                statusMessage = 'Your account has been suspended. Please contact your administrator.';
                break;
              case 'inactive':
                statusMessage = 'Your account is inactive. Please contact your administrator.';
                break;
              default:
                statusMessage = 'Your account status prevents access. Please contact your administrator.';
            }
            
            setCallbackState({
              status: 'error',
              message: 'Account Not Active',
              error: statusMessage
            });
            
            // Sign out inactive user
            await supabase.auth.signOut();
            return;
          }

          // Success - redirect to appropriate dashboard
          const dashboardPath = getDashboardPath(profile.role);
          setCallbackState({
            status: 'success',
            message: `Welcome back, ${profile.first_name}!`,
            redirectPath: next || dashboardPath
          });
          
          setTimeout(() => {
            router.push(next || dashboardPath);
            router.refresh();
          }, 2000);
          return;
        }

        // No code parameter - invalid callback
        setCallbackState({
          status: 'error',
          message: 'Invalid Authentication',
          error: 'Invalid authentication callback. Please try signing in again.'
        });

      } catch (error) {
        console.error('Auth callback error:', error);
        
        let errorMessage = 'An unexpected error occurred during authentication.';
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        
        setCallbackState({
          status: 'error',
          message: 'Authentication Failed',
          error: errorMessage
        });
      }
    };

    handleAuthCallback();
  }, [router, searchParams]);

  const getDashboardPath = (role: string): string => {
    switch (role) {
      case 'admin':
        return '/admin/dashboard';
      case 'radiologist':
        return '/radiologist/dashboard';
      case 'technician':
        return '/technician/dashboard';
      case 'referring_physician':
        return '/physician/dashboard';
      default:
        return '/dashboard';
    }
  };

  const handleRetry = () => {
    router.push('/auth/login');
  };

  const handleContinue = () => {
    if (callbackState.redirectPath) {
      router.push(callbackState.redirectPath);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-12">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center gap-2">
                <Stethoscope className="h-8 w-8 text-primary" />
                <div className="text-2xl font-bold">Curie</div>
              </div>
            </div>
            
            {callbackState.status === 'loading' && (
              <>
                <div className="flex justify-center mb-4">
                  <Loader2 className="h-16 w-16 animate-spin text-primary" />
                </div>
                <CardTitle className="text-xl">Processing...</CardTitle>
                <CardDescription>{callbackState.message}</CardDescription>
              </>
            )}
            
            {callbackState.status === 'success' && (
              <>
                <div className="flex justify-center mb-4">
                  <CheckCircle className="h-16 w-16 text-green-500" />
                </div>
                <CardTitle className="text-xl text-green-700">{callbackState.message}</CardTitle>
                <CardDescription>
                  Redirecting you to your dashboard...
                </CardDescription>
              </>
            )}
            
            {callbackState.status === 'error' && (
              <>
                <div className="flex justify-center mb-4">
                  <AlertCircle className="h-16 w-16 text-red-500" />
                </div>
                <CardTitle className="text-xl text-red-700">{callbackState.message}</CardTitle>
                <CardDescription>
                  Please try again or contact support
                </CardDescription>
              </>
            )}
          </CardHeader>
          
          <CardContent className="space-y-4">
            {callbackState.status === 'error' && callbackState.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{callbackState.error}</AlertDescription>
              </Alert>
            )}
            
            {callbackState.status === 'success' && callbackState.redirectPath && (
              <div className="text-center text-sm text-muted-foreground">
                <p>If you are not redirected automatically,</p>
                <Button 
                  variant="link" 
                  onClick={handleContinue}
                  className="p-0 h-auto"
                >
                  click here to continue
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            )}
            
            {callbackState.status === 'error' && (
              <div className="space-y-2">
                <Button onClick={handleRetry} className="w-full">
                  Return to Login
                </Button>
                
                <div className="text-center text-sm text-muted-foreground">
                  Need help?{" "}
                  <Button
                    variant="link"
                    className="p-0 h-auto font-normal"
                    onClick={() => router.push('/contact')}
                  >
                    Contact Support
                  </Button>
                </div>
              </div>
            )}
            
            {callbackState.status === 'loading' && (
              <div className="text-center text-sm text-muted-foreground">
                <p>Please wait while we process your authentication...</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Professional Footer */}
        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>Curie Medical Imaging Platform v1.0</p>
          <p className="mt-1">Secure authentication for healthcare professionals</p>
        </div>
      </div>
    </div>
  );
}

function AuthCallbackFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-12">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center gap-2">
                <Stethoscope className="h-8 w-8 text-primary" />
                <div className="text-2xl font-bold">Curie</div>
              </div>
            </div>
            <div className="flex justify-center mb-4">
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
            <CardTitle className="text-xl">Loading...</CardTitle>
            <CardDescription>Preparing authentication...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<AuthCallbackFallback />}>
      <AuthCallbackContent />
    </Suspense>
  );
}