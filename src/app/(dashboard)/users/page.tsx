"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Users, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserTable } from "@/components/users/user-table";
import { ModuleGuard } from "@/components/auth/module-guard";
import { getAdminUsers } from "@/lib/firebase/admin-users";
import { getDepartments } from "@/lib/firebase/departments";
import type { AdminUser } from "@/types/auth";
import type { Department } from "@/types/department";
import { Skeleton } from "@/components/ui/skeleton";

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [u, d] = await Promise.all([getAdminUsers(), getDepartments()]);
      setUsers(u);
      setDepartments(d);
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <ModuleGuard module="users">
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Users className="h-5 w-5" />
              </div>
              <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
                User Management
              </h1>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage administrative accounts, department roles, and granular module access permissions.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={loadData}
              disabled={loading}
              title="Refresh users"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <Button asChild>
              <Link href="/users/new">
                <Plus className="mr-2 h-4 w-4" />
                Add New User
              </Link>
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full max-w-sm" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        ) : (
          <UserTable
            users={users}
            departments={departments}
            onRefresh={loadData}
          />
        )}
      </div>
    </ModuleGuard>
  );
}
