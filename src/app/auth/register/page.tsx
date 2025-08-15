/**
 * @file page.tsx
 * @description Healthcare provider registration page
 * @module app/auth/register
 * 
 * Key responsibilities:
 * - Display professional registration interface
 * - Handle healthcare provider account creation
 * - Collect medical credentials and institutional info
 * - Integrate with Supabase Auth and profiles
 * 
 * @reftools Verified against: Next.js 14+ App Router patterns
 * @supabase Integrated with auth registration and profiles table
 * @author Claude Code
 * @created 2025-08-13
 */

import { Metadata } from "next";
import { RegisterForm } from "@/components/features/auth";

export const metadata: Metadata = {
  title: "Healthcare Provider Registration | Curie - Medical Imaging Platform",
  description: "Register for a healthcare provider account to access medical imaging studies and diagnostic tools.",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-12">
      <div className="container mx-auto flex items-center justify-center">
        <div className="w-full max-w-2xl">
          <RegisterForm />
          
          {/* Professional Footer */}
          <div className="mt-8 text-center text-xs text-muted-foreground">
            <p>
              Curie Medical Imaging Platform v1.0
            </p>
            <p className="mt-1">
              Healthcare provider registration requires institutional verification and admin approval.
            </p>
            <p className="mt-1">
              By registering, you agree to comply with HIPAA regulations and institutional policies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}