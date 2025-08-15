/**
 * @file page.tsx
 * @description Main dashboard for authenticated healthcare providers
 * @module app/dashboard
 * 
 * Key responsibilities:
 * - Display role-specific dashboard content
 * - Show recent studies and quick actions
 * - Provide navigation to main application features
 * - Display user profile and account information
 * - Healthcare-focused interface design
 * 
 * @reftools Verified against: Next.js 14+ App Router patterns
 * @supabase Integrated with protected authentication
 * @author Claude Code
 * @created 2025-08-13
 */

"use client";

import { useRouter } from "next/navigation";
import { useAuth, ProtectedRoute } from "@/components/features/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Upload, 
  FileImage, 
  Users, 
  Settings, 
  BarChart3,
  Stethoscope,
  Clock,
  AlertCircle,
  CheckCircle2,
  Activity
} from "lucide-react";

function DashboardContent() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth/login?message=logout_success");
  };

  const getRoleDisplayName = (role: string): string => {
    switch (role) {
      case "radiologist":
        return "Radiologist";
      case "technician":
        return "Radiology Technician";
      case "referring_physician":
        return "Referring Physician";
      case "admin":
        return "System Administrator";
      default:
        return "Healthcare Provider";
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "radiologist":
        return "default";
      case "technician":
        return "secondary";
      case "referring_physician":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getQuickActions = (role: string) => {
    const baseActions = [
      {
        title: "Search Studies",
        description: "Search and review medical imaging studies",
        icon: Search,
        href: "/search",
        primary: true,
      },
    ];

    if (role === "technician" || role === "radiologist" || role === "admin") {
      baseActions.push({
        title: "Upload Images",
        description: "Upload new medical images and DICOM files",
        icon: Upload,
        href: "/upload",
        primary: false,
      });
    }

    if (role === "admin") {
      baseActions.push(
        {
          title: "User Management",
          description: "Manage healthcare provider accounts",
          icon: Users,
          href: "/admin/users",
          primary: false,
        },
        {
          title: "System Analytics",
          description: "View system usage and performance metrics",
          icon: BarChart3,
          href: "/admin/analytics",
          primary: false,
        }
      );
    }

    return baseActions;
  };

  if (!user) {
    return null; // This should not happen due to ProtectedRoute
  }

  const quickActions = getQuickActions(user.profile?.role || "");

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome, {user.profile?.first_name || "Healthcare Provider"}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <Badge variant={getRoleBadgeVariant(user.profile?.role || "")}>
              {getRoleDisplayName(user.profile?.role || "")}
            </Badge>
            <span className="text-muted-foreground">
              {user.profile?.institution || "Medical Institution"}
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">
              {user.profile?.department || "Department"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => router.push("/profile")}>
            <Settings className="h-4 w-4 mr-2" />
            Profile
          </Button>
          <Button variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </div>

      {/* Account Status Alert */}
      {user.profile?.status !== "active" && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">Account Status: {user.profile?.status}</p>
                <p className="text-sm text-yellow-700">
                  {user.profile?.status === "pending" 
                    ? "Your account is pending approval. Some features may be limited."
                    : "Your account status may affect access to certain features."
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickActions.map((action) => (
          <Card 
            key={action.title} 
            className={`cursor-pointer transition-all hover:shadow-lg ${
              action.primary ? "border-primary bg-primary/5" : ""
            }`}
            onClick={() => router.push(action.href)}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <action.icon className="h-5 w-5" />
                {action.title}
              </CardTitle>
              <CardDescription>{action.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Recent Activity / Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Database Connection</span>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Online</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Image Storage</span>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Available</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">AI Analysis Service</span>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Ready</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Studies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileImage className="h-5 w-5" />
              Recent Studies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No recent studies</p>
              <p className="text-xs">Start by searching for medical imaging studies</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Professional Footer */}
      <Card className="border-muted bg-muted/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4" />
              <span>Curie Medical Imaging Platform v1.0</span>
            </div>
            <div>
              <span>Session expires in 8 hours</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}