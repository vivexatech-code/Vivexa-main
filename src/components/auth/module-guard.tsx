"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import type { AppModule } from "@/types/auth";
import { Button } from "@/components/ui/button";
import { ShieldX, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ModuleGuardProps {
  module: AppModule;
  children: React.ReactNode;
}

export function ModuleGuard({ module, children }: ModuleGuardProps) {
  const { can, loading } = useAuth();

  if (loading) {
    return (
      <div className="space-y-6 py-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const allowed = can(module, "view");

  if (!allowed) {
    return (
      <div className="flex min-h-[450px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/60 p-8 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <ShieldX className="h-7 w-7" />
        </div>
        <h3 className="font-display text-2xl font-bold tracking-tight text-foreground">
          Access Restricted
        </h3>
        <p className="mt-2 max-w-md text-sm text-muted-foreground leading-relaxed">
          You do not have permission to view or manage the <strong className="text-foreground capitalize">{module.replace("_", " ")}</strong> module. Contact the system administrator or your department head if you believe you require access.
        </p>
        <div className="mt-6">
          <Button asChild variant="outline">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
