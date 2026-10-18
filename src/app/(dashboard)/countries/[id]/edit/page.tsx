"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { PageTransition } from "@/components/layout/page-transition";
import { CountryForm } from "@/components/countries/country-form";
import { Button } from "@/components/ui/button";
import { getCountryById, updateCountry } from "@/lib/firebase/countries";
import type { Country, CountryFormData } from "@/types/country";

export default function EditCountryPage() {
  const params = useParams<{ id: string }>();
  const [country, setCountry] = useState<Country | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!params.id) return;
    void getCountryById(params.id)
      .then((data) => {
        if (!active) return;
        setCountry(data);
        if (!data) setError("Country experience not found");
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load country");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [params.id]);

  const handleSubmit = async (data: CountryFormData) => {
    if (!params.id) return;
    await updateCountry(params.id, data);
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !country) {
    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
        {error || "Country experience not found"}
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/countries">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight">
              Edit {country.name} ({country.destinationUrl})
            </h1>
            <p className="text-xs text-muted-foreground">
              Update landing page copy, pricing, currency, Google reviews, or SEO metadata.
            </p>
          </div>
        </div>

        <CountryForm mode="edit" initialData={country} onSubmit={handleSubmit} />
      </div>
    </PageTransition>
  );
}
