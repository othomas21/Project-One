/**
 * @file reset-password-form.tsx
 * @description Password reset form for healthcare providers with new password input
 * @module components/features/auth
 * 
 * Key responsibilities:
 * - Secure password reset with strong validation
 * - Integration with Supabase Auth password update
 * - Professional medical interface design
 * - Security-focused password requirements
 * - Automatic redirect after successful reset
 * 
 * @reftools Verified against: Supabase Auth v2.x, React Hook Form patterns
 * @supabase Integrated with auth password update flow
 * @author Claude Code
 * @created 2025-08-13
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Lock, 
  Eye, 
  EyeOff, 
  Shield, 
  CheckCircle, 
  Loader2, 
  AlertCircle,
  Stethoscope
} from "lucide-react";

// Strong password validation schema for healthcare systems
const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character")
    .max(128, "Password must be less than 128 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordFormProps {
  onSuccess?: () => void;
}

export function ResetPasswordForm({ onSuccess }: ResetPasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
  });

  const password = watch("password", "");

  // Check if we have a valid password reset session
  useEffect(() => {
    const checkSession = async () => {
      try {
        const supabase = createClient();
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session check error:", error);
          setIsValidSession(false);
          return;
        }

        // Check if this is a password reset session
        if (session && session.user?.app_metadata?.providers?.includes('email')) {
          setIsValidSession(true);
        } else {
          setIsValidSession(false);
        }
      } catch (error) {
        console.error("Session validation error:", error);
        setIsValidSession(false);
      }
    };

    checkSession();
  }, []);

  // Calculate password strength
  const getPasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 10;
    if (/[a-z]/.test(password)) strength += 20;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 20;
    if (/[^A-Za-z0-9]/.test(password)) strength += 10;
    return Math.min(strength, 100);
  };

  const getPasswordStrengthLabel = (strength: number): string => {
    if (strength < 40) return "Weak";
    if (strength < 70) return "Fair";
    if (strength < 90) return "Good";
    return "Strong";
  };

  const getPasswordStrengthColor = (strength: number): string => {
    if (strength < 40) return "bg-red-500";
    if (strength < 70) return "bg-yellow-500";
    if (strength < 90) return "bg-blue-500";
    return "bg-green-500";
  };

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const supabase = createClient();

      // Update the user's password
      const { error } = await supabase.auth.updateUser({
        password: data.password
      });

      if (error) {
        switch (error.message) {
          case "New password should be different from the old password":
            setAuthError("New password must be different from your current password.");
            break;
          case "Password should be at least 6 characters":
            setAuthError("Password must be at least 8 characters long.");
            break;
          case "Unable to update password":
            setAuthError("Unable to update password. The reset link may have expired.");
            break;
          default:
            setAuthError(error.message);
        }
        return;
      }

      // Success
      setIsSuccess(true);
      onSuccess?.();

      // Auto-redirect after success
      setTimeout(() => {
        router.push("/auth/login?message=password_reset_success");
      }, 3000);

    } catch (error) {
      console.error("Password reset error:", error);
      setAuthError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking session
  if (isValidSession === null) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Validating reset session...</p>
        </CardContent>
      </Card>
    );
  }

  // Show error if session is invalid
  if (isValidSession === false) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-16 w-16 text-red-500" />
          </div>
          <CardTitle className="text-xl text-red-700">Invalid Reset Link</CardTitle>
          <CardDescription>
            This password reset link is invalid or has expired
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Password reset links expire after 24 hours for security purposes.
            </p>
            <p className="text-sm text-muted-foreground">
              Please request a new password reset link.
            </p>
          </div>
          
          <div className="space-y-2">
            <Button 
              onClick={() => router.push("/auth/forgot-password")}
              className="w-full"
            >
              Request New Reset Link
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => router.push("/auth/login")}
              className="w-full"
            >
              Return to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show success state
  if (isSuccess) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-xl text-green-700">Password Updated</CardTitle>
          <CardDescription>
            Your password has been successfully updated
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              You can now sign in with your new password.
            </p>
          </div>
          
          <Button 
            onClick={() => router.push("/auth/login")}
            className="w-full"
          >
            Continue to Login
          </Button>
        </CardContent>
      </Card>
    );
  }

  const passwordStrength = getPasswordStrength(password);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-8 w-8 text-primary" />
            <div className="text-2xl font-bold">Curie</div>
          </div>
        </div>
        <CardTitle className="text-2xl text-center">Set New Password</CardTitle>
        <CardDescription className="text-center">
          Create a strong password for your healthcare provider account
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
          {/* New Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              New Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                {...register("password")}
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                className="pl-10 pr-10"
                disabled={isLoading}
                autoComplete="new-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-8 w-8 p-0"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          {/* Password Strength Indicator */}
          {password && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Password Strength</span>
                <span className={`font-medium ${
                  passwordStrength < 40 ? 'text-red-500' :
                  passwordStrength < 70 ? 'text-yellow-500' :
                  passwordStrength < 90 ? 'text-blue-500' : 'text-green-500'
                }`}>
                  {getPasswordStrengthLabel(passwordStrength)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength)}`}
                  style={{ width: `${passwordStrength}%` }}
                />
              </div>
            </div>
          )}

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm New Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                {...register("confirmPassword")}
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                className="pl-10 pr-10"
                disabled={isLoading}
                autoComplete="new-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-8 w-8 p-0"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !isValid || passwordStrength < 70}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating Password...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Update Password
              </>
            )}
          </Button>
        </form>

        {/* Security Information */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border">
          <Shield className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
          <div className="text-xs text-muted-foreground">
            <p className="font-medium mb-1">Password Requirements</p>
            <ul className="space-y-1">
              <li>• At least 8 characters long</li>
              <li>• Include uppercase and lowercase letters</li>
              <li>• Include at least one number</li>
              <li>• Include at least one special character</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}