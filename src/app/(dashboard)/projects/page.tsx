"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { PageTransition } from "@/components/layout/page-transition";
import { ProjectTable } from "@/components/projects/project-table";
import { TableSkeleton } from "@/components/shared/skeletons";
import { Button } from "@/components/ui/button";
import { useProjects } from "@/hooks/use-projects";
import { createProject, isProjectSlugTaken } from "@/lib/firebase/projects";
import { starterProjects } from "@/lib/seed-catalog";

export default function ProjectsPage() {
  const { projects, loading, error, removeProject, refresh } = useProjects();
  const [seeding, setSeeding] = useState(false);

  const importStarter = async () => {
    setSeeding(true);
    try {
      let created = 0;
      for (const project of starterProjects) {
        if (await isProjectSlugTaken(project.slug)) continue;
        await createProject(project);
        created += 1;
      }
      await refresh();
      toast.success(
        created
          ? `Imported ${created} starter project${created === 1 ? "" : "s"}`
          : "Starter projects already exist",
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import failed");
    } finally {
      setSeeding(false);
    }
  };

  return (
    <PageTransition>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight">
              Projects
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage the work shown on the public website
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={importStarter} disabled={seeding}>
              {seeding ? "Importing…" : "Import starter catalog"}
            </Button>
            <Button asChild>
              <Link href="/projects/new">
                <Plus className="h-4 w-4" />
                Add project
              </Link>
            </Button>
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        {loading ? (
          <TableSkeleton />
        ) : (
          <ProjectTable projects={projects} onDelete={removeProject} />
        )}
      </div>
    </PageTransition>
  );
}
