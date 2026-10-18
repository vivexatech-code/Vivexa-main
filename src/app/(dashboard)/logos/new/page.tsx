"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageTransition } from "@/components/layout/page-transition";
import { LogoForm } from "@/components/logos/logo-form";
import { Button } from "@/components/ui/button";
import { useClientLogos } from "@/hooks/use-client-logos";

export default function NewLogoPage() {
  const { addLogo } = useClientLogos();

  return (
    <PageTransition>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/logos">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight">
              Add Client Logo
            </h1>
            <p className="text-xs text-muted-foreground">
              Add a client logo to feature on the website&apos;s &quot;Who We Work With&quot; marquee.
            </p>
          </div>
        </div>

        <LogoForm mode="create" onSubmit={async (data) => { await addLogo(data); }} />
      </div>
    </PageTransition>
  );
}
