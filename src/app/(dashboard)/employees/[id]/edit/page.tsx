"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageTransition } from "@/components/layout/page-transition";
import { EmployeeForm } from "@/components/employees/employee-form";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getEmployeeByEmployeeId,
  updateEmployee,
} from "@/lib/firebase/employees";
import type { Employee, EmployeeFormData } from "@/types/employee";

export default function EditEmployeePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const data = await getEmployeeByEmployeeId(params.id);
        if (!cancelled) {
          setEmployee(data);
          if (!data) router.replace("/employees");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params.id, router]);

  const handleSubmit = async (data: EmployeeFormData) => {
    await updateEmployee(params.id, data);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!employee) return null;

  return (
    <PageTransition>
      <div className="mx-auto max-w-3xl space-y-8">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Edit Employee
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Update profile details for {employee.name}
          </p>
        </div>
        <EmployeeForm
          mode="edit"
          initialData={employee}
          onSubmit={handleSubmit}
        />
      </div>
    </PageTransition>
  );
}
