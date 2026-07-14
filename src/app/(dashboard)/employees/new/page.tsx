"use client";

import { PageTransition } from "@/components/layout/page-transition";
import { EmployeeForm } from "@/components/employees/employee-form";
import { createEmployee } from "@/lib/firebase/employees";
import type { EmployeeFormData } from "@/types/employee";

export default function NewEmployeePage() {
  const handleSubmit = async (data: EmployeeFormData) => {
    await createEmployee(data);
  };

  return (
    <PageTransition>
      <div className="mx-auto max-w-3xl space-y-8">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Add Employee
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a new employee or intern profile. Employee ID is generated
            automatically (12701, 12702, …).
          </p>
        </div>
        <EmployeeForm mode="create" onSubmit={handleSubmit} />
      </div>
    </PageTransition>
  );
}
