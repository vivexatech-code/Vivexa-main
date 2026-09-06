"use client";

import {
  Briefcase,
  FolderKanban,
  GraduationCap,
  ClipboardList,
  Inbox,
  UserCheck,
  UserMinus,
  Users,
} from "lucide-react";
import { PageTransition } from "@/components/layout/page-transition";
import { StatCard } from "@/components/dashboard/stat-card";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentEmployees } from "@/components/dashboard/recent-employees";
import { DashboardSkeleton } from "@/components/shared/skeletons";
import { useApplications } from "@/hooks/use-applications";
import { useCareers } from "@/hooks/use-careers";
import { useEmployees } from "@/hooks/use-employees";
import { useProjects } from "@/hooks/use-projects";
import { useServices } from "@/hooks/use-services";

export default function DashboardPage() {
  const employeesState = useEmployees();
  const projectsState = useProjects();
  const servicesState = useServices();
  const careersState = useCareers();
  const applicationsState = useApplications();

  const loading =
    employeesState.loading ||
    projectsState.loading ||
    servicesState.loading ||
    careersState.loading ||
    applicationsState.loading;
  const error =
    employeesState.error ||
    projectsState.error ||
    servicesState.error ||
    careersState.error ||
    applicationsState.error;

  if (loading) return <DashboardSkeleton />;

  const publishedProjects = projectsState.projects.filter(
    (project) => project.status === "published",
  ).length;
  const publishedServices = servicesState.services.filter(
    (service) => service.status === "published",
  ).length;
  const publishedCareers = careersState.careers.filter(
    (career) => career.status === "published",
  ).length;
  const newApplications = applicationsState.applications.filter(
    (application) => application.status === "new",
  ).length;

  return (
    <PageTransition>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Workforce, website content, and career applications
          </p>
        </div>

        {error ? (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            title="Employees"
            value={employeesState.stats.totalEmployees}
            icon={Users}
            tone="default"
            delay={0.05}
          />
          <StatCard
            title="Interns"
            value={employeesState.stats.totalInterns}
            icon={GraduationCap}
            tone="muted"
            delay={0.08}
          />
          <StatCard
            title="Active people"
            value={employeesState.stats.activeEmployees}
            icon={UserCheck}
            tone="success"
            delay={0.11}
          />
          <StatCard
            title="Inactive"
            value={employeesState.stats.inactiveEmployees}
            icon={UserMinus}
            tone="warning"
            delay={0.14}
          />
          <StatCard
            title="Published projects"
            value={publishedProjects}
            icon={FolderKanban}
            tone="default"
            delay={0.17}
          />
          <StatCard
            title="Published services"
            value={publishedServices}
            icon={Briefcase}
            tone="muted"
            delay={0.2}
          />
          <StatCard
            title="Published openings"
            value={publishedCareers}
            icon={ClipboardList}
            tone="default"
            delay={0.23}
          />
          <StatCard
            title="New applications"
            value={newApplications}
            icon={Inbox}
            tone="success"
            delay={0.26}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <RecentEmployees employees={employeesState.employees} />
          <QuickActions />
        </div>
      </div>
    </PageTransition>
  );
}
