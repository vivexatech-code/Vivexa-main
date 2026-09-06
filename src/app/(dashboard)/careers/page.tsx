"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { PageTransition } from "@/components/layout/page-transition";
import { CareerTable } from "@/components/careers/career-table";
import { TableSkeleton } from "@/components/shared/skeletons";
import { Button } from "@/components/ui/button";
import { useCareers } from "@/hooks/use-careers";

export default function CareersAdminPage() {
  const { careers, loading, error, removeCareer, setCareerStatus } =
    useCareers();

  return (
    <PageTransition>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight">
              Career Management
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Publish jobs and internships to the public careers page
            </p>
          </div>
          <Button asChild>
            <Link href="/careers/new">
              <Plus className="h-4 w-4" />
              Add opportunity
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
          <CareerTable
            careers={careers}
            onDelete={removeCareer}
            onStatusChange={setCareerStatus}
          />
        )}
      </div>
    </PageTransition>
  );
}
