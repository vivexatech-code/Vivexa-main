"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  KeyRound,
  Shield,
  User as UserIcon,
  Building2,
} from "lucide-react";
import { toast } from "sonner";
import { sendPasswordResetEmail } from "firebase/auth";
import { getClientAuth } from "@/lib/firebase/client";
import { getAdminUser, getAdminUsers } from "@/lib/firebase/admin-users";
import { getDepartments } from "@/lib/firebase/departments";
import { resolveUserPermissions } from "@/lib/permissions";
import { APP_MODULE_CONFIG } from "@/lib/constants";
import { ModuleGuard } from "@/components/auth/module-guard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { AdminUser, AppModule, PermissionLevel } from "@/types/auth";
import type { Department } from "@/types/department";

interface Props {
  params: Promise<{ id: string }>;
}

export default function UserDetailPage({ params }: Props) {
  const resolvedParams = use(params);
  const userId = resolvedParams.id;
  const router = useRouter();

  const [user, setUser] = useState<AdminUser | null>(null);
  const [manager, setManager] = useState<AdminUser | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [u, depts, allUsers] = await Promise.all([
          getAdminUser(userId),
          getDepartments(),
          getAdminUsers(),
        ]);
        setUser(u);
        setDepartments(depts);
        if (u?.reportingManagerId) {
          const m = allUsers.find((x) => x.id === u.reportingManagerId);
          setManager(m || null);
        }
      } catch (err) {
        console.error("Failed to load user details:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userId]);

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-xl font-bold">User Not Found</h2>
        <p className="mt-2 text-sm text-muted-foreground">The requested user does not exist.</p>
        <Button className="mt-4" onClick={() => router.push("/users")}>
          Return to Users
        </Button>
      </div>
    );
  }

  const effectivePermissions = resolveUserPermissions(user, departments);
  const userDepts = departments.filter((d) => user.departments.includes(d.id));

  const handlePasswordReset = async () => {
    try {
      await sendPasswordResetEmail(getClientAuth(), user.email);
      toast.success(`Password reset link sent to ${user.email}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send reset link");
    }
  };

  const getPermissionBadge = (level: PermissionLevel) => {
    switch (level) {
      case "full":
        return <Badge className="bg-primary text-primary-foreground">Full Access</Badge>;
      case "approval_required":
        return <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30">Write (Needs Approval)</Badge>;
      case "read_write":
        return <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30">Read & Write</Badge>;
      case "read":
        return <Badge variant="secondary">Read Only</Badge>;
      case "none":
      default:
        return <Badge variant="outline" className="text-muted-foreground opacity-60">No Access</Badge>;
    }
  };

  return (
    <ModuleGuard module="users">
      <div className="space-y-6 max-w-5xl">
        {/* Navigation & Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/users">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
                  {user.displayName}
                </h1>
                {user.isSuperAdmin ? (
                  <Badge className="bg-primary/10 text-primary border-primary/20">
                    <Shield className="mr-1 h-3 w-3" />
                    Super Admin
                  </Badge>
                ) : null}
              </div>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handlePasswordReset}>
              <KeyRound className="mr-2 h-4 w-4" />
              Send Reset Link
            </Button>
            <Button asChild>
              <Link href={`/users/${user.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile & Permissions
              </Link>
            </Button>
          </div>
        </div>

        {/* User Details Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-primary" />
                Account Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-xs font-semibold text-muted-foreground uppercase">Designation</dt>
                  <dd className="mt-1 font-medium text-foreground">{user.jobTitle || "Not specified"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-muted-foreground uppercase">Account Status</dt>
                  <dd className="mt-1">
                    <span className="capitalize font-medium">{user.status}</span>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-muted-foreground uppercase">Reporting Manager</dt>
                  <dd className="mt-1 font-medium text-foreground">
                    {manager ? `${manager.displayName} (${manager.email})` : "Direct / None"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-muted-foreground uppercase">Member Since</dt>
                  <dd className="mt-1 text-muted-foreground">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-GB") : "Unknown"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-muted-foreground uppercase">Last Active Login</dt>
                  <dd className="mt-1 text-muted-foreground">
                    {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString("en-GB") : "Never logged in"}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Department Membership */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                Assigned Departments
              </CardTitle>
              <CardDescription>Inherited department access policies</CardDescription>
            </CardHeader>
            <CardContent>
              {userDepts.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No department assigned.</p>
              ) : (
                <div className="space-y-3">
                  {userDepts.map((d) => (
                    <div key={d.id} className="rounded-lg border p-3">
                      <p className="text-sm font-semibold text-foreground">{d.name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{d.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Effective Permission Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Effective Permissions Breakdown</CardTitle>
            <CardDescription>
              Shows the resolved permissions across all 14 administrative modules. Super admins automatically receive Full Access.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-xl border border-border">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-xs font-semibold text-muted-foreground uppercase">
                    <th className="px-4 py-3">Module</th>
                    <th className="px-4 py-3">Effective Level</th>
                    <th className="px-4 py-3">Origin / Priority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {APP_MODULE_CONFIG.map((config) => {
                    const mod = config.id as AppModule;
                    const level = effectivePermissions[mod];
                    const hasOverride = user.permissions && user.permissions[mod] !== undefined;

                    let origin = "Department Default";
                    if (user.isSuperAdmin) origin = "Super Admin (Unrestricted)";
                    else if (hasOverride) origin = "Individual User Override";

                    return (
                      <tr key={mod} className="hover:bg-muted/10 transition-colors">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-semibold text-foreground">{config.label}</p>
                            <p className="text-xs text-muted-foreground">{config.description}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">{getPermissionBadge(level)}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{origin}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </ModuleGuard>
  );
}
