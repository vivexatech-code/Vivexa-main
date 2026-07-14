"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  Building2,
  Calendar,
  IdCard,
  ShieldAlert,
  ShieldX,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getEmployeeByEmployeeId } from "@/lib/firebase/employees";
import { formatDate } from "@/lib/utils";
import type { PublicEmployee } from "@/types/employee";

type VerifyState =
  | { status: "loading" }
  | { status: "success"; employee: PublicEmployee }
  | { status: "not_found" }
  | { status: "error"; message: string };

function toPublic(data: {
  employeeId: string;
  name: string;
  designation: string;
  employeeType: "Employee" | "Intern";
  profilePhoto: string;
  joinedDate: string;
  status: "Active" | "Inactive";
}): PublicEmployee {
  return {
    employeeId: data.employeeId,
    name: data.name,
    designation: data.designation,
    employeeType: data.employeeType,
    profilePhoto: data.profilePhoto,
    joinedDate: data.joinedDate,
    status: data.status,
  };
}

export default function VerifyPage() {
  const params = useParams<{ employeeId: string }>();
  const [state, setState] = useState<VerifyState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const id = decodeURIComponent(params.employeeId || "").trim();
      if (!id) {
        setState({ status: "not_found" });
        return;
      }

      try {
        const response = await fetch(`/api/verify/${id}`);
        if (response.ok) {
          const data = (await response.json()) as PublicEmployee;
          if (!cancelled) setState({ status: "success", employee: data });
          return;
        }

        if (response.status === 404) {
          if (!cancelled) setState({ status: "not_found" });
          return;
        }

        // Fallback when Admin SDK is not configured: public Firestore get
        if (response.status === 503) {
          const employee = await getEmployeeByEmployeeId(id);
          if (!employee) {
            if (!cancelled) setState({ status: "not_found" });
            return;
          }
          if (!cancelled) {
            setState({
              status: "success",
              employee: toPublic(employee),
            });
          }
          return;
        }

        if (!cancelled) {
          setState({
            status: "error",
            message: "Verification failed. Please try again later.",
          });
        }
      } catch {
        try {
          const employee = await getEmployeeByEmployeeId(id);
          if (!employee) {
            if (!cancelled) setState({ status: "not_found" });
            return;
          }
          if (!cancelled) {
            setState({ status: "success", employee: toPublic(employee) });
          }
        } catch {
          if (!cancelled) {
            setState({
              status: "error",
              message: "Verification failed. Please try again later.",
            });
          }
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [params.employeeId]);

  return (
    <div className="surface-grid min-h-screen px-4 py-10 sm:py-16">
      <div className="mx-auto w-full max-w-lg">
        <div className="mb-10 text-center">
          <p className="font-display text-3xl font-semibold tracking-tight">
            Vivexa
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Employee Verification
          </p>
        </div>

        {state.status === "loading" ? <VerifySkeleton /> : null}

        {state.status === "success" ? (
          <VerifiedCard employee={state.employee} />
        ) : null}

        {state.status === "not_found" ? (
          <ErrorCard
            icon={ShieldX}
            title="Employee Not Found"
            description="We couldn’t find an employee with this ID. The link may be invalid or outdated."
          />
        ) : null}

        {state.status === "error" ? (
          <ErrorCard
            icon={ShieldAlert}
            title="Verification Failed"
            description={state.message}
          />
        ) : null}
      </div>
    </div>
  );
}

function VerifiedCard({ employee }: { employee: PublicEmployee }) {
  const heading =
    employee.employeeType === "Intern"
      ? "Verified Intern of Vivexa"
      : "Verified Employee of Vivexa";

  const statusLabel =
    employee.status === "Active" ? "Active" : "No Longer Working";

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className="overflow-hidden shadow-lift">
        <div className="bg-gradient-to-br from-emerald-50 via-white to-slate-50 px-6 pb-2 pt-8 text-center">
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 18 }}
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
          >
            <BadgeCheck className="h-9 w-9" />
          </motion.div>
          <h1 className="mt-5 font-display text-2xl font-semibold tracking-tight">
            {heading}
          </h1>
          <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700">
            <BadgeCheck className="h-4 w-4" />
            Verified by Vivexa
          </p>
        </div>

        <CardContent className="space-y-6 px-6 pb-8 pt-6">
          <div className="flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 rounded-2xl ring-4 ring-white shadow-soft">
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
            <h2 className="mt-4 font-display text-xl font-semibold">
              {employee.name}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {employee.designation}
            </p>
          </div>

          <div className="grid gap-3 rounded-2xl bg-muted/60 p-4">
            <InfoRow
              icon={IdCard}
              label="Employee ID"
              value={employee.employeeId}
            />
            <InfoRow
              icon={Building2}
              label="Employee Type"
              value={employee.employeeType}
            />
            <InfoRow
              icon={Calendar}
              label="Joined Date"
              value={formatDate(employee.joinedDate)}
            />
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge
                variant={employee.status === "Active" ? "success" : "warning"}
              >
                {statusLabel}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof IdCard;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" />
        {label}
      </span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

function ErrorCard({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof ShieldX;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="shadow-lift">
        <CardContent className="flex flex-col items-center px-6 py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <Icon className="h-8 w-8" />
          </div>
          <h1 className="mt-5 font-display text-2xl font-semibold tracking-tight">
            {title}
          </h1>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            {description}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function VerifySkeleton() {
  return (
    <Card className="shadow-lift">
      <CardContent className="space-y-6 px-6 py-10">
        <div className="flex flex-col items-center gap-3">
          <Skeleton className="h-16 w-16 rounded-full" />
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-36" />
        </div>
        <div className="flex flex-col items-center gap-3">
          <Skeleton className="h-24 w-24 rounded-2xl" />
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-36 w-full rounded-2xl" />
      </CardContent>
    </Card>
  );
}
