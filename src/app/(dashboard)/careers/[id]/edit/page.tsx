"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { PageTransition } from "@/components/layout/page-transition";
import { CareerForm } from "@/components/careers/career-form";
import { getCareerById, updateCareer } from "@/lib/firebase/careers";
import type { CareerFormData, CareerOpportunity } from "@/types/career";

export default function EditCareerPage() {
  const params = useParams<{ id: string }>();
  const [career, setCareer] = useState<CareerOpportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void getCareerById(params.id)
      .then((data) => {
        if (!active) return;
        setCareer(data);
        if (!data) setError("Opportunity not found");
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load opportunity");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [params.id]);

  const handleSubmit = async (data: CareerFormData) => {
    await updateCareer(params.id, data);
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !career) {
    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
        {error || "Opportunity not found"}
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="mx-auto max-w-3xl space-y-8">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Edit opportunity
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{career.title}</p>
        </div>
        <CareerForm mode="edit" initialData={career} onSubmit={handleSubmit} />
      </div>
    </PageTransition>
  );
}
