"use client";

import { useEffect, useState } from "react";
import { History, RefreshCw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AuditTable } from "@/components/audit/audit-table";
import { ModuleGuard } from "@/components/auth/module-guard";
import { getAuditLogs } from "@/lib/firebase/audit";
import type { AuditLog } from "@/types/audit";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getAuditLogs();
      setLogs(data);
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <ModuleGuard module="audit_logs">
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <History className="h-5 w-5" />
              </div>
              <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
                Audit Trail & Activity Log
              </h1>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Immutable record of administrative actions, user permission changes, and approval lifecycles.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={loadData}
              disabled={loading}
              title="Refresh logs"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Security Notice */}
        <div className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-xs text-muted-foreground">
          <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
          <p>
            Audit records are append-only and cannot be altered or removed. All changes to users, departments, and protected content generate permanent records.
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full max-w-sm" />
            <Skeleton className="h-96 w-full rounded-2xl" />
          </div>
        ) : (
          <AuditTable logs={logs} />
        )}
      </div>
    </ModuleGuard>
  );
}
