/**
 * @file page.tsx
 * @description Healthcare provider login page
 * @module app/auth/login
 * 
 * Key responsibilities:
 * - Display professional login interface
 * - Handle authentication redirects
 * - Show success/error messages from URL params
 * - Integrate with Supabase Auth workflow
 * 
 * @reftools Verified against: Next.js 14+ App Router patterns
 * @supabase Integrated with auth workflow and middleware
 * @author Claude Code
 * @created 2025-08-13
 */

import { Suspense } from "react";
import { Metadata } from "next";
import { LoginForm } from "@/components/features/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Sign In | Curie - Medical Imaging Platform",
  description: "Sign in to your healthcare provider account to access medical imaging studies and diagnostic tools.",
};

interface LoginPageProps {
  searchParams: {
    message?: string;
    error?: string;
    email?: string;
  };
}

function LoginMessages({ searchParams }: LoginPageProps) {
  const { message, error } = searchParams;

  if (message) {
    return (
      <Alert className="mb-6">
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          {getMessageText(message)}
        </AlertDescription>
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {getErrorText(error)}
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}

function getMessageText(message: string): string {
  switch (message) {
    case "registration_success":
      return "Registration submitted successfully! Please check your email for verification and wait for account approval.";
    case "password_reset_success":
      return "Password updated successfully! You can now sign in with your new password.";
    case "email_confirmed":
      return "Email confirmed successfully! You can now sign in once your account is approved.";
    case "logout_success":
      return "You have been signed out successfully.";
    default:
      return message;
  }
}

function getErrorText(error: string): string {
  switch (error) {
    case "access_denied":
      return "Access denied. Please contact your administrator.";
    case "server_error":
      return "A server error occurred. Please try again later.";
    case "invalid_request":
      return "Invalid request. Please try again.";
    case "session_expired":
      return "Your session has expired. Please sign in again.";
    default:
      return error;
  }
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-12">
      <div className="w-full max-w-md">
        <Suspense fallback={<div className="h-16" />}>
          <LoginMessages searchParams={searchParams} />
        </Suspense>
        
        <LoginForm />
        
        {/* Professional Footer */}
        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>
            Curie Medical Imaging Platform v1.0
          </p>
          <p className="mt-1">
            For healthcare professionals only. Unauthorized access is prohibited.
          </p>
        </div>
      </div>
    </div>
  );
}