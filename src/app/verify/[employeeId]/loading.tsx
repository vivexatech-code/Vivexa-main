import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function VerifyLoading() {
  return (
    <div className="surface-grid flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-lg shadow-lift">
        <CardContent className="space-y-6 px-6 py-10">
          <div className="flex flex-col items-center gap-3">
            <Skeleton className="h-16 w-16 rounded-full" />
            <Skeleton className="h-7 w-56" />
          </div>
          <Skeleton className="mx-auto h-24 w-24 rounded-2xl" />
          <Skeleton className="h-36 w-full rounded-2xl" />
        </CardContent>
      </Card>
    </div>
  );
}
