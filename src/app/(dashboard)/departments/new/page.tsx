"use client";

import Link from "next/link";
import { ArrowLeft, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DepartmentForm } from "@/components/departments/department-form";
import { ModuleGuard } from "@/components/auth/module-guard";
import { createDepartment } from "@/lib/firebase/departments";
import type { DepartmentFormData } from "@/types/department";

export default function NewDepartmentPage() {
  const handleCreate = async (data: DepartmentFormData) => {
    await createDepartment(data);
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
                Create Department
              </h1>
              <p className="text-sm text-muted-foreground">
                Set up a new department and configure default module permissions.
              </p>
            </div>
          </div>
        </div>

        <DepartmentForm
          mode="create"
          onSubmit={handleCreate}
        />
      </div>
    </ModuleGuard>
  );
}
