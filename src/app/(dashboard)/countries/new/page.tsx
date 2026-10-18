"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageTransition } from "@/components/layout/page-transition";
import { CountryForm } from "@/components/countries/country-form";
import { Button } from "@/components/ui/button";
import { useCountries } from "@/hooks/use-countries";

export default function NewCountryPage() {
  const { addCountry } = useCountries();

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
              Add Country Experience
            </h1>
            <p className="text-xs text-muted-foreground">
              Define a new country landing page, local currency, pricing tiers, and Google Reviews configuration.
            </p>
          </div>
        </div>

        <CountryForm mode="create" onSubmit={async (data) => { await addCountry(data); }} />
      </div>
    </PageTransition>
  );
}
