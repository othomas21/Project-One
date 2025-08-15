/**
 * @file forgot-password-form.tsx
 * @description Password reset form for healthcare providers
 * @module components/features/auth
 * 
 * Key responsibilities:
 * - Secure password reset workflow for healthcare providers
 * - Email validation and reset link generation
 * - Integration with Supabase Auth password reset
 * - Professional medical interface design
 * - Security-focused user experience
 * 
 * @reftools Verified against: Supabase Auth v2.x, React Hook Form patterns
 * @supabase Integrated with auth password reset flow
 * @author Claude Code
 * @created 2025-08-13
 */

"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  KeyRound, 
  Mail, 
  ArrowLeft, 
  Loader2, 
  AlertCircle,
  CheckCircle,
  Shield,
  Stethoscope
} from "lucide-react";

// Email validation schema
const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .min(1, "Email is required"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

interface ForgotPasswordFormProps {
  onSuccess?: () => void;
}

function ForgotPasswordFormContent({ onSuccess }: ForgotPasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onChange",
    defaultValues: {
      email: email,
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const supabase = createClient();

      // Check if user exists in profiles table first (for better UX)
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, email, status")
        .eq("email", data.email)
        .single();

      if (!profile) {
        setAuthError("No account found with this email address. Please check your email or contact your administrator.");
        return;
      }

      if (profile.status !== "active") {
        setAuthError("Your account is not active. Please contact your administrator for assistance.");
        return;
      }

      // Send password reset email
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        switch (error.message) {
          case "Invalid email":
            setAuthError("Please enter a valid email address.");
            break;
          case "User not found":
            setAuthError("No account found with this email address. Please check your email or contact your administrator.");
            break;
          case "Email rate limit exceeded":
            setAuthError("Too many password reset requests. Please wait a few minutes before trying again.");
            break;
          default:
            setAuthError(error.message);
        }
        return;
      }

      // Success
      setIsSuccess(true);
      onSuccess?.();

    } catch (error) {
      console.error("Password reset error:", error);
      setAuthError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-xl text-green-700">Reset Link Sent</CardTitle>
          <CardDescription>
            Check your email for password reset instructions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              We've sent a secure password reset link to your email address.
            </p>
            <p className="text-sm text-muted-foreground">
              The link will expire in 24 hours for security purposes.
            </p>
          </div>
          
          <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border">
            <Shield className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
            <div className="text-xs text-muted-foreground">
              <p className="font-medium mb-1">Security Notice</p>
              <p>
                If you don't receive the email within 10 minutes, check your spam folder 
                or contact your system administrator for assistance.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Button 
              onClick={() => router.push("/auth/login")}
              className="w-full"
            >
              Return to Login
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => setIsSuccess(false)}
              className="w-full"
            >
              Send Another Reset Link
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-8 w-8 text-primary" />
            <div className="text-2xl font-bold">Curie</div>
          </div>
        </div>
        <CardTitle className="text-2xl text-center">Reset Password</CardTitle>
        <CardDescription className="text-center">
          Enter your email to receive a secure password reset link
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {authError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{authError}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Professional Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                {...register("email")}
                id="email"
                type="email"
                placeholder="doctor@hospital.com"
                className="pl-10"
                disabled={isLoading}
                autoComplete="email"
              />
            </div>
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !isValid}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Reset Link...
              </>
            ) : (
              <>
                <KeyRound className="mr-2 h-4 w-4" />
                Send Reset Link
              </>
            )}
          </Button>
        </form>

        <Separator />

        <div className="space-y-3">
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => router.push("/auth/login")}
            disabled={isLoading}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Login
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Button
              variant="link"
              className="p-0 h-auto font-normal"
              onClick={() => router.push("/auth/register")}
              disabled={isLoading}
            >
              Contact your administrator
            </Button>
          </div>
        </div>

        {/* Security Information */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border">
          <Shield className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
          <div className="text-xs text-muted-foreground">
            <p className="font-medium mb-1">Security Information</p>
            <p>
              Password reset links are only sent to verified healthcare provider 
              email addresses and expire after 24 hours for security.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ForgotPasswordFormFallback() {
  return (
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
        <CardDescription>Preparing password reset form...</CardDescription>
      </CardHeader>
    </Card>
  );
}

export function ForgotPasswordForm({ onSuccess }: ForgotPasswordFormProps) {
  return (
    <Suspense fallback={<ForgotPasswordFormFallback />}>
      <ForgotPasswordFormContent onSuccess={onSuccess} />
    </Suspense>
  );
}