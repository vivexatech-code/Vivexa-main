"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Eye,
  FileCheck,
  History,
  Search,
} from "lucide-react";
import type { AuditLog } from "@/types/audit";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { APP_MODULE_CONFIG, APP_MODULE_MAP } from "@/lib/constants";

interface Props {
  logs: AuditLog[];
}

export function AuditTable({ logs }: Props) {
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState<string>("all");
  const [viewTarget, setViewTarget] = useState<AuditLog | null>(null);

  const filtered = logs.filter((log) => {
    const matchesModule = moduleFilter === "all" || log.module === moduleFilter;
    const matchesSearch =
      log.actorName.toLowerCase().includes(search.toLowerCase()) ||
      log.actorEmail.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      (log.resourceName && log.resourceName.toLowerCase().includes(search.toLowerCase()));

    return matchesModule && matchesSearch;
  });

  const getActionBadge = (action: string) => {
    if (action.includes("create")) {
      return <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30">{action}</Badge>;
    }
    if (action.includes("delete")) {
      return <Badge variant="destructive">{action}</Badge>;
    }
    if (action.includes("approved")) {
      return <Badge className="bg-primary/15 text-primary border-primary/30">{action}</Badge>;
    }
    if (action.includes("rejected")) {
      return <Badge variant="destructive">{action}</Badge>;
    }
    if (action.includes("status")) {
      return <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30">{action}</Badge>;
    }
    return <Badge variant="outline">{action}</Badge>;
  };

  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by actor, action, resource..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-3">
          <Select value={moduleFilter} onValueChange={setModuleFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Modules" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modules</SelectItem>
              {APP_MODULE_CONFIG.map((cfg) => (
                <SelectItem key={cfg.id} value={cfg.id}>
                  {cfg.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-5 py-3.5">Actor</th>
                <th className="px-5 py-3.5">Action</th>
                <th className="px-5 py-3.5">Module</th>
                <th className="px-5 py-3.5">Resource</th>
                <th className="px-5 py-3.5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">
                    No audit records found matching query.
                  </td>
                </tr>
              ) : (
                filtered.map((log) => {
                  const modConfig = APP_MODULE_MAP[log.module];

                  return (
                    <tr key={log.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </td>

                      <td className="px-5 py-3.5">
                        <div>
                          <p className="font-semibold text-foreground text-xs">{log.actorName}</p>
                          <p className="text-[11px] text-muted-foreground">{log.actorEmail}</p>
                        </div>
                      </td>

                      <td className="px-5 py-3.5">{getActionBadge(log.action)}</td>

                      <td className="px-5 py-3.5">
                        <span className="text-xs font-medium text-foreground">
                          {modConfig?.label || log.module}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-xs text-muted-foreground max-w-xs truncate">
                        {log.resourceName ? (
                          <span className="font-medium text-foreground">{log.resourceName}</span>
                        ) : (
                          log.resourceId || "—"
                        )}
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setViewTarget(log)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Dialog */}
      {viewTarget ? (
        <Dialog open onOpenChange={(open) => !open && setViewTarget(null)}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                <DialogTitle>Audit Event Details</DialogTitle>
              </div>
              <DialogDescription>
                Immutable record logged on {new Date(viewTarget.timestamp).toLocaleString("en-GB")}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2 text-xs">
              <div className="grid grid-cols-2 gap-3 rounded-xl border bg-muted/20 p-3">
                <div>
                  <span className="text-muted-foreground font-semibold uppercase block">Actor</span>
                  <p className="font-semibold text-foreground mt-0.5">{viewTarget.actorName}</p>
                  <p className="text-muted-foreground">{viewTarget.actorEmail}</p>
                </div>
                <div>
                  <span className="text-muted-foreground font-semibold uppercase block">Action</span>
                  <p className="mt-0.5">{getActionBadge(viewTarget.action)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground font-semibold uppercase block">Module</span>
                  <p className="font-semibold text-foreground mt-0.5">
                    {APP_MODULE_MAP[viewTarget.module]?.label || viewTarget.module}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground font-semibold uppercase block">Resource</span>
                  <p className="font-semibold text-foreground mt-0.5">{viewTarget.resourceName || viewTarget.resourceType}</p>
                  <p className="text-muted-foreground font-mono text-[10px]">{viewTarget.resourceId}</p>
                </div>
              </div>

              {viewTarget.approvalRequestId ? (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCheck className="h-4 w-4 text-primary" />
                    <span className="text-xs font-semibold text-foreground">Associated Approval Request</span>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/approvals/${viewTarget.approvalRequestId}`}>
                      View Request
                    </Link>
                  </Button>
                </div>
              ) : null}

              {viewTarget.details ? (
                <div className="space-y-1.5">
                  <span className="text-muted-foreground font-semibold uppercase block">Payload Details</span>
                  <pre className="max-h-60 overflow-y-auto rounded-xl border bg-muted/40 p-3 font-mono text-[11px] whitespace-pre-wrap">
                    {JSON.stringify(viewTarget.details, null, 2)}
                  </pre>
                </div>
              ) : null}
            </div>
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  );
}
