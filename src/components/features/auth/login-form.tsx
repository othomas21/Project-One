/**
 * @file login-form.tsx
 * @description Healthcare provider login form with Supabase authentication
 * @module components/features/auth
 * 
 * Key responsibilities:
 * - Email/password authentication for healthcare providers
 * - Role-based access control integration
 * - Institution-specific login validation
 * - Secure authentication with Supabase Auth
 * - Professional medical interface design
 * 
 * @reftools Verified against: Supabase Auth v2.x, React Hook Form patterns
 * @supabase Integrated with auth providers and user management
 * @author Claude Code
 * @created 2025-08-13
 */

"use client";

import { useState } from "react";
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
import { Separator } from "@/components/ui/separator";
import { 
  Mail, 
  Lock, 
  LogIn, 
  Loader2, 
  AlertCircle,
  Building2,
  Stethoscope
} from "lucide-react";

// Healthcare-focused login validation schema
const loginSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .min(1, "Email is required")
    .refine((email) => {
      // Basic validation for professional email domains
      const commonDomains = ["gmail.com", "yahoo.com", "hotmail.com"];
      const domain = email.split("@")[1]?.toLowerCase();
      return !commonDomains.includes(domain);
    }, "Please use your professional/institutional email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export function LoginForm({ onSuccess, redirectTo = "/dashboard" }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const supabase = createClient();

      // Sign in with email and password
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        // Handle specific authentication errors
        switch (authError.message) {
          case "Invalid login credentials":
            setAuthError("Invalid email or password. Please check your credentials and try again.");
            break;
          case "Email not confirmed":
            setAuthError("Please check your email and click the confirmation link before signing in.");
            break;
          case "Too many requests":
            setAuthError("Too many login attempts. Please wait a few minutes before trying again.");
            break;
          default:
            setAuthError(authError.message);
        }
        return;
      }

      if (!authData.user) {
        setAuthError("Authentication failed. Please try again.");
        return;
      }

      // Verify user has a valid profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, role, status, institution")
        .eq("id", authData.user.id)
        .single();

      if (profileError || !profile) {
        setAuthError("User profile not found. Please contact your system administrator.");
        return;
      }

      // Check if user account is active
      if (profile.status !== "active") {
        switch (profile.status) {
          case "pending":
            setAuthError("Your account is pending approval. Please contact your administrator.");
            break;
          case "suspended":
            setAuthError("Your account has been suspended. Please contact your administrator.");
            break;
          case "inactive":
            setAuthError("Your account is inactive. Please contact your administrator.");
            break;
          default:
            setAuthError("Your account status prevents login. Please contact your administrator.");
        }
        // Sign out the user since their account is not active
        await supabase.auth.signOut();
        return;
      }

      // Success callback
      onSuccess?.();

      // Redirect to appropriate dashboard based on role
      const dashboardPath = getDashboardPath(profile.role);
      router.push(redirectTo || dashboardPath);
      router.refresh(); // Refresh to update auth state
    } catch (error) {
      console.error("Login error:", error);
      setAuthError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getDashboardPath = (role: string): string => {
    switch (role) {
      case "admin":
        return "/admin/dashboard";
      case "radiologist":
        return "/radiologist/dashboard";
      case "technician":
        return "/technician/dashboard";
      case "referring_physician":
        return "/physician/dashboard";
      default:
        return "/dashboard";
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-8 w-8 text-primary" />
            <div className="text-2xl font-bold">Curie</div>
          </div>
        </div>
        <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
        <CardDescription className="text-center">
          Sign in to your healthcare provider account
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
          {/* Email Field */}
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

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                {...register("password")}
                id="password"
                type="password"
                placeholder="Enter your password"
                className="pl-10"
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !isValid}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing In...
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </>
            )}
          </Button>
        </form>

        <Separator />

        {/* Additional Options */}
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push("/auth/forgot-password")}
            disabled={isLoading}
          >
            Forgot Password?
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Need an account?{" "}
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

        {/* Institution Notice */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border">
          <Building2 className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
          <div className="text-xs text-muted-foreground">
            <p className="font-medium mb-1">Institutional Access</p>
            <p>
              This system is restricted to authorized healthcare providers. 
              Contact your IT administrator for account registration.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}