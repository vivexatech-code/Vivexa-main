"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, IdCard, Pencil } from "lucide-react";
import { PageTransition } from "@/components/layout/page-transition";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { IdCardDialog } from "@/components/id-card/id-card-dialog";
import { getEmployeeByEmployeeId } from "@/lib/firebase/employees";
import { formatDate } from "@/lib/utils";
import type { Employee } from "@/types/employee";

export default function EmployeeDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [idOpen, setIdOpen] = useState(false);

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

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!employee) return null;

  return (
    <PageTransition>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="ghost" asChild className="-ml-2 w-fit">
            <Link href="/employees">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIdOpen(true)}>
              <IdCard className="h-4 w-4" />
              ID Card
            </Button>
            <Button asChild>
              <Link href={`/employees/${employee.employeeId}/edit`}>
                <Pencil className="h-4 w-4" />
                Edit
              </Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start gap-4">
              <Avatar className="h-20 w-20 rounded-2xl">
                <AvatarImage
                  src={employee.profilePhoto}
                  alt={employee.name}
                  className="rounded-2xl"
                />
                <AvatarFallback className="rounded-2xl text-xl">
                  {employee.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-2xl">{employee.name}</CardTitle>
                <p className="mt-1 text-muted-foreground">
                  {employee.designation}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant="secondary">{employee.employeeId}</Badge>
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
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Phone
                </dt>
                <dd className="mt-1 text-sm font-medium">{employee.phone}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Joined
                </dt>
                <dd className="mt-1 text-sm font-medium">
                  {formatDate(employee.joinedDate)}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Verification URL
                </dt>
                <dd className="mt-1 break-all text-sm font-medium text-primary">
                  <a
                    href={employee.verificationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline"
                  >
                    {employee.verificationUrl}
                  </a>
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <IdCardDialog
          employee={employee}
          open={idOpen}
          onOpenChange={setIdOpen}
          onEmployeeUpdated={setEmployee}
        />
      </div>
    </PageTransition>
  );
}
