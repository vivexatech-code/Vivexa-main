"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserForm } from "@/components/users/user-form";
import { ModuleGuard } from "@/components/auth/module-guard";
import { getAdminUser, getAdminUsers, updateAdminUser } from "@/lib/firebase/admin-users";
import { getDepartments } from "@/lib/firebase/departments";
import { useAuth } from "@/contexts/auth-context";
import type { AdminUser, AdminUserFormData } from "@/types/auth";
import type { Department } from "@/types/department";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  params: Promise<{ id: string }>;
}

export default function EditUserPage({ params }: Props) {
  const resolvedParams = use(params);
  const userId = resolvedParams.id;
  const { adminUser: currentUser } = useAuth();

  const [user, setUser] = useState<AdminUser | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [allUsers, setAllUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [u, d, users] = await Promise.all([
          getAdminUser(userId),
          getDepartments(),
          getAdminUsers(),
        ]);
        setUser(u);
        setDepartments(d);
        setAllUsers(users);
      } catch (err) {
        console.error("Failed to load user for edit:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userId]);

  const handleUpdate = async (data: AdminUserFormData) => {
    await updateAdminUser(userId, data, currentUser ? {
      id: currentUser.id,
      name: currentUser.displayName,
      email: currentUser.email,
    } : undefined);
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
              <UserCog className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
                Edit User & Permissions
              </h1>
              <p className="text-sm text-muted-foreground">
                Update account details, adjust department memberships, and configure custom overrides.
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>
        ) : user ? (
          <UserForm
            mode="edit"
            initialData={user}
            departments={departments}
            allUsers={allUsers}
            onSubmit={handleUpdate}
          />
        ) : (
          <div className="py-12 text-center text-muted-foreground">User not found.</div>
        )}
      </div>
    </ModuleGuard>
  );
}
