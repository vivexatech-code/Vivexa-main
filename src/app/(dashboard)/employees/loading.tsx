import { TableSkeleton } from "@/components/shared/skeletons";

export default function EmployeesLoading() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="h-8 w-40 animate-pulse rounded-xl bg-slate-200/80" />
        <div className="h-4 w-64 animate-pulse rounded-xl bg-slate-200/80" />
      </div>
      <TableSkeleton />
    </div>
  );
}
