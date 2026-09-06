"use client";

import { PageTransition } from "@/components/layout/page-transition";
import { ApplicationTable } from "@/components/applications/application-table";
import { TableSkeleton } from "@/components/shared/skeletons";
import { useApplications } from "@/hooks/use-applications";

export default function ApplicationsPage() {
  const { applications, loading, error } = useApplications();

  return (
    <PageTransition>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Applications
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review candidates who applied from the public careers page
          </p>
        </div>

        {error ? (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        {loading ? (
          <TableSkeleton />
        ) : (
          <ApplicationTable applications={applications} />
        )}
      </div>
    </PageTransition>
  );
}
