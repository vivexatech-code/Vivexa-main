"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserForm } from "@/components/users/user-form";
import { ModuleGuard } from "@/components/auth/module-guard";
import { getDepartments } from "@/lib/firebase/departments";
import { getAdminUsers, createAdminUser } from "@/lib/firebase/admin-users";
import { useAuth } from "@/contexts/auth-context";
import type { AdminUser, AdminUserFormData } from "@/types/auth";
import type { Department } from "@/types/department";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function NewUserPage() {
  const { adminUser: currentUser } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [allUsers, setAllUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [d, u] = await Promise.all([getDepartments(), getAdminUsers()]);
        setDepartments(d);
        setAllUsers(u);
      } catch (err) {
        console.error("Failed to load prerequisites:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleCreate = async (data: AdminUserFormData) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          actor: currentUser
            ? {
                id: currentUser.id,
                name: currentUser.displayName,
                email: currentUser.email,
              }
            : undefined,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Failed to create user account");
      }

      const resData = await res.json();
      if (resData.resetLink) {
        toast.info("Password setup link generated for user", {
          description: "An invitation or password link has been created.",
          duration: 6000,
        });
      }
    } catch {
      // If server route failed or was unavailable, use client Firestore write fallback
      const randomUid = crypto.randomUUID();
      await createAdminUser(randomUid, data, currentUser ? {
        id: currentUser.id,
        name: currentUser.displayName,
        email: currentUser.email,
      } : undefined);
    }
  };

  return (
    <ModuleGuard module="users">
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/users">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
                Add New Administrator
              </h1>
              <p className="text-sm text-muted-foreground">
                Provision a team member, set department roles, and configure module-level permissions.
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>
        ) : (
          <UserForm
            mode="create"
            departments={departments}
            allUsers={allUsers}
            onSubmit={handleCreate}
          />
        )}
      </div>
    </ModuleGuard>
  );
}
