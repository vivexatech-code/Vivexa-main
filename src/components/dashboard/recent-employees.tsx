"use client";

import Link from "next/link";
import { Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate } from "@/lib/utils";
import type { Employee } from "@/types/employee";

type RecentEmployeesProps = {
  employees: Employee[];
};

export function RecentEmployees({ employees }: RecentEmployeesProps) {
  const recent = employees.slice(0, 5);

  return (
    <Card className="lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Employees</CardTitle>
        <Link
          href="/employees"
          className="text-sm font-medium text-primary hover:underline"
        >
          View all
        </Link>
      </CardHeader>
      <CardContent>
        {recent.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No employees yet"
            description="Add your first team member to get started."
            actionLabel="Add Employee"
            onAction={() => {
              window.location.href = "/employees/new";
            }}
            className="border-0 bg-transparent py-10"
          />
        ) : (
          <div className="space-y-2">
            {recent.map((employee) => (
              <Link
                key={employee.employeeId}
                href={`/employees/${employee.employeeId}`}
                className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-muted/70"
              >
                <Avatar className="h-11 w-11">
                  <AvatarImage src={employee.profilePhoto} alt={employee.name} />
                  <AvatarFallback>
                    {employee.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{employee.name}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {employee.designation} · {employee.employeeId}
                  </p>
                </div>
                <div className="hidden items-center gap-2 sm:flex">
                  <Badge
                    variant={
                      employee.employeeType === "Intern" ? "muted" : "secondary"
                    }
                  >
                    {employee.employeeType}
                  </Badge>
                  <Badge
                    variant={employee.status === "Active" ? "success" : "warning"}
                  >
                    {employee.status}
                  </Badge>
                </div>
                <p className="hidden text-xs text-muted-foreground md:block">
                  {formatDate(employee.joinedDate)}
                </p>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
