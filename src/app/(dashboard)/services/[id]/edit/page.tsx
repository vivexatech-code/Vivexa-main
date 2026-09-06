"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { PageTransition } from "@/components/layout/page-transition";
import { ServiceForm } from "@/components/services/service-form";
import { getServiceById, updateService } from "@/lib/firebase/services";
import type { Service, ServiceFormData } from "@/types/service";

export default function EditServicePage() {
  const params = useParams<{ id: string }>();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void getServiceById(params.id)
      .then((data) => {
        if (!active) return;
        setService(data);
        if (!data) setError("Service not found");
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load service");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [params.id]);

  const handleSubmit = async (data: ServiceFormData) => {
    await updateService(params.id, data);
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
        {error || "Service not found"}
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="mx-auto max-w-3xl space-y-8">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Edit service
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{service.name}</p>
        </div>
        <ServiceForm mode="edit" initialData={service} onSubmit={handleSubmit} />
      </div>
    </PageTransition>
  );
}
