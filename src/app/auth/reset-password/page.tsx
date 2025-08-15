/**
 * @file page.tsx
 * @description Password reset completion page
 * @module app/auth/reset-password
 * 
 * Key responsibilities:
 * - Display new password input interface
 * - Handle password update with security validation
 * - Validate reset session and tokens
 * - Redirect after successful password update
 * 
 * @reftools Verified against: Next.js 14+ App Router patterns
 * @supabase Integrated with auth password update flow
 * @author Claude Code
 * @created 2025-08-13
 */

import { Metadata } from "next";
import { ResetPasswordForm } from "@/components/features/auth";

export const metadata: Metadata = {
  title: "Set New Password | Curie - Medical Imaging Platform",
  description: "Set a new password for your healthcare provider account.",
};

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-12">
      <div className="w-full max-w-md">
        <ResetPasswordForm />
        
        {/* Professional Footer */}
        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>
            Curie Medical Imaging Platform v1.0
          </p>
          <p className="mt-1">
            Create a strong password with at least 8 characters including uppercase, lowercase, numbers, and symbols.
          </p>
        </div>
      </div>
    </div>
  );
}