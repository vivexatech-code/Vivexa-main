"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  Eye,
  Search,
  XCircle,
} from "lucide-react";
import type { ApprovalRequest, ApprovalStatus } from "@/types/approval";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApprovalActionDialog } from "./approval-action-dialog";
import { useAuth } from "@/contexts/auth-context";
import { APP_MODULE_MAP } from "@/lib/constants";

interface Props {
  requests: ApprovalRequest[];
  onRefresh: () => Promise<void>;
}

export function ApprovalTable({ requests, onRefresh }: Props) {
  const { adminUser: currentUser, can } = useAuth();
  const [tab, setTab] = useState<string>("pending");
  const [search, setSearch] = useState("");
  const [activeRequest, setActiveRequest] = useState<ApprovalRequest | null>(null);
  const [actionDialogMode, setActionDialogMode] = useState<"approve" | "reject" | null>(null);

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  const filtered = requests.filter((r) => {
    const matchesTab = tab === "all" || r.status === tab;
    const matchesSearch =
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.requesterName.toLowerCase().includes(search.toLowerCase()) ||
      r.requesterEmail.toLowerCase().includes(search.toLowerCase()) ||
      r.module.toLowerCase().includes(search.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const getStatusBadge = (status: ApprovalStatus) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30">
            <Clock className="mr-1 h-3 w-3" /> Pending Review
          </Badge>
        );
      case "approved":
        return (
          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30">
            <CheckCircle2 className="mr-1 h-3 w-3" /> Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" /> Rejected
          </Badge>
        );
    }
  };

  const getActionBadge = (action: ApprovalRequest["action"]) => {
    switch (action) {
      case "create":
        return <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20">Create</Badge>;
      case "update":
        return <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20">Update</Badge>;
      case "delete":
        return <Badge variant="outline" className="text-xs bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20">Delete</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{action}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Tabs */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={tab} onValueChange={setTab} className="w-auto">
          <TabsList className="bg-muted/60">
            <TabsTrigger value="pending" className="gap-2">
              Pending
              {pendingCount > 0 ? (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
                  {pendingCount}
                </span>
              ) : null}
            </TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="all">All Requests</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, requester..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3.5">Change Request</th>
                <th className="px-5 py-3.5">Module & Type</th>
                <th className="px-5 py-3.5">Submitted By</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 hidden md:table-cell">Submitted Date</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">
                    No approval requests found for this filter.
                  </td>
                </tr>
              ) : (
                filtered.map((req) => {
                  const modConfig = APP_MODULE_MAP[req.module];
                  const isSelf = currentUser?.id === req.requesterId;
                  const canDecide = can(req.module, "approve") && !isSelf;

                  return (
                    <tr key={req.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-4 max-w-xs">
                        <div>
                          <p className="font-semibold text-foreground truncate">{req.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{req.summary}</p>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span className="text-xs font-medium text-foreground">
                            {modConfig?.label || req.module}
                          </span>
                          {getActionBadge(req.action)}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div>
                          <p className="text-xs font-semibold text-foreground">{req.requesterName}</p>
                          <p className="text-[11px] text-muted-foreground">{req.requesterEmail}</p>
                        </div>
                      </td>

                      <td className="px-5 py-4">{getStatusBadge(req.status)}</td>

                      <td className="px-5 py-4 text-xs text-muted-foreground hidden md:table-cell">
                        {new Date(req.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/approvals/${req.id}`}>
                              <Eye className="h-4 w-4 mr-1" />
                              View Diff
                            </Link>
                          </Button>

                          {req.status === "pending" && canDecide ? (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive hover:bg-destructive/10"
                                onClick={() => {
                                  setActiveRequest(req);
                                  setActionDialogMode("reject");
                                }}
                              >
                                Reject
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => {
                                  setActiveRequest(req);
                                  setActionDialogMode("approve");
                                }}
                              >
                                Approve
                              </Button>
                            </>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Dialog */}
      <ApprovalActionDialog
        request={activeRequest}
        mode={actionDialogMode}
        onClose={() => {
          setActiveRequest(null);
          setActionDialogMode(null);
        }}
        onSuccess={onRefresh}
      />
    </div>
  );
}
