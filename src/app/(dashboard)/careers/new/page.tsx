"use client";

import { PageTransition } from "@/components/layout/page-transition";
import { CareerForm } from "@/components/careers/career-form";
import { createCareer } from "@/lib/firebase/careers";
import type { CareerFormData } from "@/types/career";

export default function NewCareerPage() {
  const handleSubmit = async (data: CareerFormData) => {
    await createCareer(data);
  };

  return (
    <PageTransition>
      <div className="mx-auto max-w-3xl space-y-8">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Add opportunity
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Published jobs and internships appear on the website careers page.
          </p>
        </div>
        <CareerForm mode="create" onSubmit={handleSubmit} />
      </div>
    </PageTransition>
  );
}
