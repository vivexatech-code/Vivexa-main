"use client";

import { useEffect } from "react";
import { ShieldAlert } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function VerifyError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="surface-grid flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-lg shadow-lift">
        <CardContent className="flex flex-col items-center px-6 py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h1 className="mt-5 font-display text-2xl font-semibold">
            Verification Failed
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Something went wrong while verifying this employee.
          </p>
          <Button className="mt-6" onClick={reset}>
            Try again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
