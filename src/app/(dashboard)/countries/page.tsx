"use client";

import { useState } from "react";
import Link from "next/link";
import { Globe, Plus } from "lucide-react";
import { toast } from "sonner";
import { PageTransition } from "@/components/layout/page-transition";
import { CountryTable } from "@/components/countries/country-table";
import { TableSkeleton } from "@/components/shared/skeletons";
import { Button } from "@/components/ui/button";
import { useCountries } from "@/hooks/use-countries";
import { createCountry, isCountrySlugTaken } from "@/lib/firebase/countries";
import { starterCountries } from "@/lib/seed-countries";

export default function CountriesPage() {
  const { countries, loading, error, removeCountry, refresh } = useCountries();
  const [seeding, setSeeding] = useState(false);

  const importStarter = async () => {
    setSeeding(true);
    try {
      let created = 0;
      for (const country of starterCountries) {
        if (await isCountrySlugTaken(country.slug)) continue;
        await createCountry(country);
        created += 1;
      }
      await refresh();
      toast.success(
        created
          ? `Imported ${created} starter country experience${created === 1 ? "" : "s"}`
          : "Starter countries already configured",
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
            <div className="flex items-center gap-2">
              <Globe className="h-6 w-6 text-primary" />
              <h1 className="font-display text-3xl font-semibold tracking-tight">
                Country Experiences
              </h1>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage Netflix-style multi-country landing pages, local currencies, pricing, Google reviews, and SEO.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={importStarter} disabled={seeding}>
              {seeding ? "Importing…" : "Import starter countries (UK, US, CA, AU, IN)"}
            </Button>
            <Button asChild>
              <Link href="/countries/new">
                <Plus className="h-4 w-4" />
                Add country
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
          <CountryTable countries={countries} onDelete={removeCountry} />
        )}
      </div>
    </PageTransition>
  );
}
