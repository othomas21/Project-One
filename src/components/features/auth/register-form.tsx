/**
 * @file register-form.tsx
 * @description Healthcare provider registration form with institutional validation
 * @module components/features/auth
 * 
 * Key responsibilities:
 * - Collect healthcare provider information for account creation
 * - Validate medical credentials and institutional affiliation
 * - Create user profile with appropriate role assignment
 * - Integration with Supabase Auth and profiles table
 * - Professional medical registration workflow
 * 
 * @reftools Verified against: Supabase Auth v2.x, React Hook Form patterns
 * @supabase Integrated with auth and profiles tables
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  UserPlus, 
  Mail, 
  Lock, 
  User, 
  Building2, 
  Phone,
  Stethoscope,
  IdCard,
  Shield,
  Loader2,
  AlertCircle,
  CheckCircle
} from "lucide-react";

// Healthcare provider registration schema
const registerSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .min(1, "Email is required")
    .refine((email) => {
      // Validate professional email domains
      const commonDomains = ["gmail.com", "yahoo.com", "hotmail.com"];
      const domain = email.split("@")[1]?.toLowerCase();
      return !commonDomains.includes(domain);
    }, "Please use your professional/institutional email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be less than 50 characters"),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be less than 50 characters"),
  role: z.enum(["radiologist", "technician", "referring_physician"]).refine(
    (val) => ["radiologist", "technician", "referring_physician"].includes(val),
    { message: "Please select your role" }
  ),
  licenseNumber: z
    .string()
    .min(1, "Medical license number is required")
    .max(20, "License number must be less than 20 characters"),
  institution: z
    .string()
    .min(2, "Institution name is required")
    .max(100, "Institution name must be less than 100 characters"),
  phone: z
    .string()
    .regex(/^\+?[\d\s\-\(\)\.]{10,}$/, "Please enter a valid phone number"),
  specialization: z
    .string()
    .min(2, "Specialization is required")
    .max(100, "Specialization must be less than 100 characters"),
  department: z
    .string()
    .min(2, "Department is required")
    .max(100, "Department must be less than 100 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const HEALTHCARE_ROLES = [
  { value: "radiologist", label: "Radiologist", description: "Interpret medical images and provide diagnoses" },
  { value: "technician", label: "Radiology Technician", description: "Operate imaging equipment and assist procedures" },
  { value: "referring_physician", label: "Referring Physician", description: "Order imaging studies and review results" },
];

const SPECIALIZATIONS = [
  "Diagnostic Radiology",
  "Interventional Radiology", 
  "Nuclear Medicine",
  "Radiation Oncology",
  "Neuroradiology",
  "Musculoskeletal Radiology",
  "Cardiovascular Radiology",
  "Pediatric Radiology",
  "Emergency Medicine",
  "Internal Medicine",
  "Surgery",
  "Oncology",
  "Cardiology",
  "Neurology",
  "Orthopedics",
  "Other"
];

interface RegisterFormProps {
  onSuccess?: () => void;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  });


  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const supabase = createClient();

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
          }
        }
      });

      if (authError) {
        switch (authError.message) {
          case "User already registered":
            setAuthError("An account with this email already exists. Please try logging in instead.");
            break;
          case "Invalid email":
            setAuthError("Please enter a valid email address.");
            break;
          case "Password should be at least 6 characters":
            setAuthError("Password must be at least 8 characters long.");
            break;
          default:
            setAuthError(authError.message);
        }
        return;
      }

      if (!authData.user) {
        setAuthError("Failed to create user account. Please try again.");
        return;
      }

      // Create user profile with pending status (requires admin approval)
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: authData.user.id,
          email: data.email,
          first_name: data.firstName,
          last_name: data.lastName,
          role: data.role,
          license_number: data.licenseNumber,
          institution: data.institution,
          phone: data.phone,
          specialization: data.specialization,
          department: data.department,
          status: "pending", // Requires admin approval
        });

      if (profileError) {
        console.error("Profile creation error:", profileError);
        setAuthError("Failed to create user profile. Please contact support.");
        
        // Cleanup: delete the auth user if profile creation failed
        await supabase.auth.admin.deleteUser(authData.user.id);
        return;
      }

      // Success - show confirmation message
      setIsSuccess(true);
      onSuccess?.();

      // Auto-redirect after success
      setTimeout(() => {
        router.push("/auth/login?message=registration_success");
      }, 3000);

    } catch (error) {
      console.error("Registration error:", error);
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
          <CardTitle className="text-xl text-green-700">Registration Submitted</CardTitle>
          <CardDescription>
            Your account has been created and is pending approval
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Please check your email for a verification link.
            </p>
            <p className="text-sm text-muted-foreground">
              Your account will be reviewed by an administrator and activated within 24-48 hours.
            </p>
          </div>
          
          <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border">
            <Shield className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
            <div className="text-xs text-muted-foreground">
              <p className="font-medium mb-1">Security Notice</p>
              <p>
                All healthcare provider registrations require manual verification 
                to ensure HIPAA compliance and institutional authorization.
              </p>
            </div>
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

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-8 w-8 text-primary" />
            <div className="text-2xl font-bold">Curie</div>
          </div>
        </div>
        <CardTitle className="text-2xl text-center">Healthcare Provider Registration</CardTitle>
        <CardDescription className="text-center">
          Create your professional account for medical imaging access
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {authError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{authError}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  {...register("firstName")}
                  id="firstName"
                  placeholder="Enter your first name"
                  disabled={isLoading}
                />
                {errors.firstName && (
                  <p className="text-sm text-destructive">{errors.firstName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  {...register("lastName")}
                  id="lastName"
                  placeholder="Enter your last name"
                  disabled={isLoading}
                />
                {errors.lastName && (
                  <p className="text-sm text-destructive">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Professional Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  {...register("email")}
                  id="email"
                  type="email"
                  placeholder="doctor@hospital.com"
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  {...register("phone")}
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Professional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <IdCard className="h-5 w-5" />
              Professional Information
            </h3>

            <div className="space-y-2">
              <Label>Role</Label>
              <Select onValueChange={(value) => setValue("role", value as any)} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  {HEALTHCARE_ROLES.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      <div>
                        <div className="font-medium">{role.label}</div>
                        <div className="text-xs text-muted-foreground">{role.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-sm text-destructive">{errors.role.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="licenseNumber">Medical License Number</Label>
                <Input
                  {...register("licenseNumber")}
                  id="licenseNumber"
                  placeholder="Enter license number"
                  disabled={isLoading}
                />
                {errors.licenseNumber && (
                  <p className="text-sm text-destructive">{errors.licenseNumber.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization</Label>
                <Select onValueChange={(value) => setValue("specialization", value)} disabled={isLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    {SPECIALIZATIONS.map((spec) => (
                      <SelectItem key={spec} value={spec}>
                        {spec}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.specialization && (
                  <p className="text-sm text-destructive">{errors.specialization.message}</p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Institutional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Institutional Information
            </h3>

            <div className="space-y-2">
              <Label htmlFor="institution">Institution / Hospital</Label>
              <Input
                {...register("institution")}
                id="institution"
                placeholder="Enter your institution name"
                disabled={isLoading}
              />
              {errors.institution && (
                <p className="text-sm text-destructive">{errors.institution.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                {...register("department")}
                id="department"
                placeholder="e.g., Radiology, Emergency Medicine"
                disabled={isLoading}
              />
              {errors.department && (
                <p className="text-sm text-destructive">{errors.department.message}</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Security */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Account Security
            </h3>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  {...register("password")}
                  id="password"
                  type="password"
                  placeholder="Create a strong password"
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  {...register("confirmPassword")}
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border">
            <Shield className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
            <div className="text-xs text-muted-foreground">
              <p className="font-medium mb-1">Registration Review Process</p>
              <p>
                All healthcare provider registrations require manual verification 
                to ensure HIPAA compliance and proper institutional authorization. 
                You will receive email notification once your account is approved.
              </p>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !isValid}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Submit Registration
              </>
            )}
          </Button>
        </form>

        <Separator />

        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Button
            variant="link"
            className="p-0 h-auto font-normal"
            onClick={() => router.push("/auth/login")}
            disabled={isLoading}
          >
            Sign in here
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}