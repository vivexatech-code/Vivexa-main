"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { PageTransition } from "@/components/layout/page-transition";
import { ProjectForm } from "@/components/projects/project-form";
import { getProjectById, updateProject } from "@/lib/firebase/projects";
import type { Project, ProjectFormData } from "@/types/project";

export default function EditProjectPage() {
  const params = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void getProjectById(params.id)
      .then((data) => {
        if (!active) return;
        setProject(data);
        if (!data) setError("Project not found");
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load project");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [params.id]);

  const handleSubmit = async (data: ProjectFormData) => {
    await updateProject(params.id, data);
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
        {error || "Project not found"}
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="mx-auto max-w-3xl space-y-8">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Edit project
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{project.name}</p>
        </div>
        <ProjectForm mode="edit" initialData={project} onSubmit={handleSubmit} />
      </div>
    </PageTransition>
  );
}
