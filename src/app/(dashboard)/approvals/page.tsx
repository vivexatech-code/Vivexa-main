"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Clock, FileCheck, RefreshCw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ApprovalTable } from "@/components/approvals/approval-table";
import { ModuleGuard } from "@/components/auth/module-guard";
import { getApprovalRequests } from "@/lib/firebase/approvals";
import type { ApprovalRequest } from "@/types/approval";

export default function ApprovalsPage() {
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getApprovalRequests();
      setRequests(data);
    } catch (err) {
      console.error("Failed to load approval requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const approvedCount = requests.filter((r) => r.status === "approved").length;
  const rejectedCount = requests.filter((r) => r.status === "rejected").length;

  return (
    <ModuleGuard module="approvals">
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FileCheck className="h-5 w-5" />
              </div>
              <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
                Approval Workflow
              </h1>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Review, verify, and approve pending data submissions before they go live on the public website.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={loadData}
              disabled={loading}
              title="Refresh approvals"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-center gap-3.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
              <p className="text-xs text-muted-foreground font-medium">Pending Approvals</p>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex items-center gap-3.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{approvedCount}</p>
              <p className="text-xs text-muted-foreground font-medium">Approved & Applied</p>
            </div>
          </div>

          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 flex items-center gap-3.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
              <XCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{rejectedCount}</p>
              <p className="text-xs text-muted-foreground font-medium">Rejected Submissions</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full max-w-sm" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        ) : (
          <ApprovalTable
            requests={requests}
            onRefresh={loadData}
          />
        )}
      </div>
    </ModuleGuard>
  );
}
