"use client";

import { Users, UserCheck, UserMinus, GraduationCap } from "lucide-react";
import { PageTransition } from "@/components/layout/page-transition";
import { StatCard } from "@/components/dashboard/stat-card";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentEmployees } from "@/components/dashboard/recent-employees";
import { DashboardSkeleton } from "@/components/shared/skeletons";
import { useEmployees } from "@/hooks/use-employees";

export default function DashboardPage() {
  const { employees, stats, loading, error } = useEmployees();

  if (loading) return <DashboardSkeleton />;

  return (
    <PageTransition>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Overview of your Vivexa workforce
          </p>
        </div>

        {error ? (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Employees"
            value={stats.totalEmployees}
            icon={Users}
            tone="default"
            delay={0.05}
          />
          <StatCard
            title="Total Interns"
            value={stats.totalInterns}
            icon={GraduationCap}
            tone="muted"
            delay={0.1}
          />
          <StatCard
            title="Active"
            value={stats.activeEmployees}
            icon={UserCheck}
            tone="success"
            delay={0.15}
          />
          <StatCard
            title="Inactive"
            value={stats.inactiveEmployees}
            icon={UserMinus}
            tone="warning"
            delay={0.2}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <RecentEmployees employees={employees} />
          <QuickActions />
        </div>
      </div>
    </PageTransition>
  );
}
