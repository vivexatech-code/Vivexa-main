"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { PageTransition } from "@/components/layout/page-transition";
import { ServiceTable } from "@/components/services/service-table";
import { TableSkeleton } from "@/components/shared/skeletons";
import { Button } from "@/components/ui/button";
import { useServices } from "@/hooks/use-services";
import { createService, isServiceSlugTaken } from "@/lib/firebase/services";
import { starterServices } from "@/lib/seed-catalog";

export default function ServicesPage() {
  const { services, loading, error, removeService, refresh } = useServices();
  const [seeding, setSeeding] = useState(false);

  const importStarter = async () => {
    setSeeding(true);
    try {
      let created = 0;
      for (const service of starterServices) {
        if (await isServiceSlugTaken(service.slug)) continue;
        await createService(service);
        created += 1;
      }
      await refresh();
      toast.success(
        created
          ? `Imported ${created} starter service${created === 1 ? "" : "s"}`
          : "Starter services already exist",
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
              Services
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Control the services shown on vivexatech.in
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={importStarter} disabled={seeding}>
              {seeding ? "Importing…" : "Import starter catalog"}
            </Button>
            <Button asChild>
              <Link href="/services/new">
                <Plus className="h-4 w-4" />
                Add service
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
          <ServiceTable services={services} onDelete={removeService} />
        )}
      </div>
    </PageTransition>
  );
}
