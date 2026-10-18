"use client";

import Link from "next/link";
import { Building2, Plus } from "lucide-react";
import { PageTransition } from "@/components/layout/page-transition";
import { LogoTable } from "@/components/logos/logo-table";
import { TableSkeleton } from "@/components/shared/skeletons";
import { Button } from "@/components/ui/button";
import { useClientLogos } from "@/hooks/use-client-logos";

export default function LogosPage() {
  const { logos, loading, error, removeLogo } = useClientLogos();

  return (
    <PageTransition>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary" />
              <h1 className="font-display text-3xl font-semibold tracking-tight">
                Client Logos
              </h1>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage client logos featured in the &quot;Who We Work With&quot; marquee across the website.
            </p>
          </div>
          <Button asChild>
            <Link href="/logos/new">
              <Plus className="h-4 w-4" />
              Add client logo
            </Link>
          </Button>
        </div>

        {error ? (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        {loading ? (
          <TableSkeleton />
        ) : (
          <LogoTable logos={logos} onDelete={removeLogo} />
        )}
      </div>
    </PageTransition>
  );
}
