"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { PageTransition } from "@/components/layout/page-transition";
import { EmployeeTable } from "@/components/employees/employee-table";
import { TableSkeleton } from "@/components/shared/skeletons";
import { Button } from "@/components/ui/button";
import { useEmployees } from "@/hooks/use-employees";

export default function EmployeesPage() {
  const { employees, loading, error, removeEmployee, patchEmployee } =
    useEmployees();

  return (
    <PageTransition>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight">
              Employees
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Search, filter, and manage your team
            </p>
          </div>
          <Button asChild>
            <Link href="/employees/new">
              <Plus className="h-4 w-4" />
              Add Employee
            </Link>
          </Button>
        </div>

        {error ? (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        {loading ? (
          <TableSkeleton />
        ) : (
          <EmployeeTable
            employees={employees}
            onDelete={removeEmployee}
            onEmployeeUpdated={patchEmployee}
          />
        )}
      </div>
    </PageTransition>
  );
}
