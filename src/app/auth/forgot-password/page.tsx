/**
 * @file page.tsx
 * @description Password reset request page
 * @module app/auth/forgot-password
 * 
 * Key responsibilities:
 * - Display password reset interface
 * - Handle secure password reset workflow
 * - Email validation and reset link generation
 * - Professional medical interface design
 * 
 * @reftools Verified against: Next.js 14+ App Router patterns
 * @supabase Integrated with auth password reset flow
 * @author Claude Code
 * @created 2025-08-13
 */

import { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/features/auth";

export const metadata: Metadata = {
  title: "Reset Password | Curie - Medical Imaging Platform",
  description: "Reset your healthcare provider account password securely.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-12">
      <div className="w-full max-w-md">
        <ForgotPasswordForm />
        
        {/* Professional Footer */}
        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>
            Curie Medical Imaging Platform v1.0
          </p>
          <p className="mt-1">
            Password reset links are valid for 24 hours and sent only to verified healthcare provider accounts.
          </p>
        </div>
      </div>
    </div>
  );
}