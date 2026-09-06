"use client";

import { PageTransition } from "@/components/layout/page-transition";
import { ProjectForm } from "@/components/projects/project-form";
import { createProject } from "@/lib/firebase/projects";
import type { ProjectFormData } from "@/types/project";

export default function NewProjectPage() {
  const handleSubmit = async (data: ProjectFormData) => {
    await createProject(data);
  };

  return (
    <PageTransition>
      <div className="mx-auto max-w-3xl space-y-8">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Add project
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Published projects appear on the Vivexa Tech website.
          </p>
        </div>
        <ProjectForm mode="create" onSubmit={handleSubmit} />
      </div>
    </PageTransition>
  );
}
