"use client";

import { PageTransition } from "@/components/layout/page-transition";
import { ServiceForm } from "@/components/services/service-form";
import { createService } from "@/lib/firebase/services";
import type { ServiceFormData } from "@/types/service";

export default function NewServicePage() {
  const handleSubmit = async (data: ServiceFormData) => {
    await createService(data);
  };

  return (
    <PageTransition>
      <div className="mx-auto max-w-3xl space-y-8">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Add service
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Published services appear on the public website without a code change.
          </p>
        </div>
        <ServiceForm mode="create" onSubmit={handleSubmit} />
      </div>
    </PageTransition>
  );
}
