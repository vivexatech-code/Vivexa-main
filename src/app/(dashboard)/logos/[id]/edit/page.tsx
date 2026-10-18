"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { PageTransition } from "@/components/layout/page-transition";
import { LogoForm } from "@/components/logos/logo-form";
import { Button } from "@/components/ui/button";
import { getClientLogoById, updateClientLogo } from "@/lib/firebase/client-logos";
import type { ClientLogo, ClientLogoFormData } from "@/types/client-logo";

export default function EditLogoPage() {
  const params = useParams<{ id: string }>();
  const [logo, setLogo] = useState<ClientLogo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!params.id) return;
    void getClientLogoById(params.id)
      .then((data) => {
        if (!active) return;
        setLogo(data);
        if (!data) setError("Client logo not found");
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load logo");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [params.id]);

  const handleSubmit = async (data: ClientLogoFormData) => {
    if (!params.id) return;
    await updateClientLogo(params.id, data);
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !logo) {
    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
        {error || "Client logo not found"}
      </div>
    );
  }

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
              Edit Client Logo
            </h1>
            <p className="text-xs text-muted-foreground">{logo.name}</p>
          </div>
        </div>

        <LogoForm mode="edit" initialData={logo} onSubmit={handleSubmit} />
      </div>
    </PageTransition>
  );
}
