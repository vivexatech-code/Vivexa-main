"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DepartmentForm } from "@/components/departments/department-form";
import { ModuleGuard } from "@/components/auth/module-guard";
import { getDepartment, updateDepartment } from "@/lib/firebase/departments";
import type { Department, DepartmentFormData } from "@/types/department";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  params: Promise<{ id: string }>;
}

export default function EditDepartmentPage({ params }: Props) {
  const resolvedParams = use(params);
  const deptId = resolvedParams.id;

  const [dept, setDept] = useState<Department | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const d = await getDepartment(deptId);
        setDept(d);
      } catch (err) {
        console.error("Failed to load department:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [deptId]);

  const handleUpdate = async (data: DepartmentFormData) => {
    await updateDepartment(deptId, data);
  };

  return (
    <ModuleGuard module="departments">
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/departments">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
                Edit Department & Permissions
              </h1>
              <p className="text-sm text-muted-foreground">
                Modify department scope and change default inherited permissions.
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>
        ) : dept ? (
          <DepartmentForm
            mode="edit"
            initialData={dept}
            onSubmit={handleUpdate}
          />
        ) : (
          <div className="py-12 text-center text-muted-foreground">Department not found.</div>
        )}
      </div>
    </ModuleGuard>
  );
}
