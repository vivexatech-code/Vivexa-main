"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DepartmentTable } from "@/components/departments/department-table";
import { ModuleGuard } from "@/components/auth/module-guard";
import { getDepartments } from "@/lib/firebase/departments";
import type { Department } from "@/types/department";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getDepartments();
      setDepartments(data);
    } catch (err) {
      console.error("Failed to load departments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <ModuleGuard module="departments">
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Building2 className="h-5 w-5" />
              </div>
              <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
                Department Management
              </h1>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Define organizational units, assign default module access policies, and manage team scopes.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={loadData}
              disabled={loading}
              title="Refresh departments"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <Button asChild>
              <Link href="/departments/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Department
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
          <DepartmentTable
            departments={departments}
            onRefresh={loadData}
          />
        )}
      </div>
    </ModuleGuard>
  );
}
