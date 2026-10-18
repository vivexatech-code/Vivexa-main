"use client";

import { useEffect, useState, use, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  User as UserIcon,
  XCircle,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ModuleGuard } from "@/components/auth/module-guard";
import { ApprovalDiffViewer } from "@/components/approvals/approval-diff-viewer";
import { ApprovalActionDialog } from "@/components/approvals/approval-action-dialog";
import { getApprovalRequest } from "@/lib/firebase/approvals";
import { useAuth } from "@/contexts/auth-context";
import { APP_MODULE_MAP } from "@/lib/constants";
import type { ApprovalRequest } from "@/types/approval";

interface Props {
  params: Promise<{ id: string }>;
}

export default function ApprovalDetailPage({ params }: Props) {
  const resolvedParams = use(params);
  const requestId = resolvedParams.id;
  const router = useRouter();
  const { adminUser: currentUser, can } = useAuth();

  const [request, setRequest] = useState<ApprovalRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogMode, setDialogMode] = useState<"approve" | "reject" | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getApprovalRequest(requestId);
      setRequest(data);
    } catch (err) {
      console.error("Failed to load approval request:", err);
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-xl font-bold">Request Not Found</h2>
        <p className="mt-2 text-sm text-muted-foreground">The requested approval record does not exist.</p>
        <Button className="mt-4" onClick={() => router.push("/approvals")}>
          Return to Approvals
        </Button>
      </div>
    );
  }

  const isSelf = currentUser?.id === request.requesterId;
  const canDecide = can(request.module, "approve") && !isSelf;
  const modConfig = APP_MODULE_MAP[request.module];

  return (
    <ModuleGuard module="approvals">
      <div className="space-y-6 max-w-5xl">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/approvals">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
                  {request.title}
                </h1>
                {request.status === "pending" ? (
                  <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30">
                    <Clock className="mr-1 h-3 w-3" /> Pending Review
                  </Badge>
                ) : request.status === "approved" ? (
                  <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30">
                    <CheckCircle2 className="mr-1 h-3 w-3" /> Approved & Applied
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <XCircle className="mr-1 h-3 w-3" /> Rejected
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                Submitted on {new Date(request.createdAt).toLocaleString("en-GB")}
              </p>
            </div>
          </div>

          {request.status === "pending" && canDecide ? (
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="text-destructive hover:bg-destructive/10"
                onClick={() => setDialogMode("reject")}
              >
                Reject Request
              </Button>
              <Button onClick={() => setDialogMode("approve")}>
                Approve & Apply Live
              </Button>
            </div>
          ) : null}
        </div>

        {/* Metadata Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                Submission Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-xs font-semibold text-muted-foreground uppercase">Target Module</dt>
                  <dd className="mt-1 font-semibold text-foreground">
                    {modConfig?.label || request.module}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-muted-foreground uppercase">Operation Type</dt>
                  <dd className="mt-1 capitalize font-medium">{request.action}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-muted-foreground uppercase">Database Collection</dt>
                  <dd className="mt-1 font-mono text-xs text-muted-foreground">
                    {request.targetCollection}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-muted-foreground uppercase">Target Document</dt>
                  <dd className="mt-1 font-mono text-xs text-muted-foreground">
                    {request.targetDocId || "New Document"}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs font-semibold text-muted-foreground uppercase">Summary / Rationale</dt>
                  <dd className="mt-1 text-sm text-foreground bg-muted/30 p-2.5 rounded-lg border">
                    {request.summary || "No summary provided."}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Requester & Reviewer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-primary" />
                Audit Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase block">
                  Requested By
                </span>
                <p className="font-semibold text-foreground mt-0.5">{request.requesterName}</p>
                <p className="text-xs text-muted-foreground">{request.requesterEmail}</p>
              </div>

              {request.decision ? (
                <div className="border-t pt-3">
                  <span className="text-xs font-semibold text-muted-foreground uppercase block">
                    Reviewed By
                  </span>
                  <p className="font-semibold text-foreground mt-0.5">
                    {request.decision.decidedByName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {request.decision.decidedByEmail}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(request.decision.decidedAt).toLocaleString("en-GB")}
                  </p>
                  {request.decision.comments ? (
                    <div className="mt-2 rounded-lg bg-muted/40 p-2.5 text-xs text-foreground border">
                      <strong>Note:</strong> {request.decision.comments}
                    </div>
                  ) : null}
                </div>
              ) : null}

              {request.rejectionReason && !request.decision ? (
                <div className="border-t pt-3 text-destructive">
                  <span className="text-xs font-semibold uppercase block">Rejection Reason</span>
                  <p className="text-xs mt-1">{request.rejectionReason}</p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>

        {/* Diff Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Changes Comparison (Diff)</CardTitle>
            <CardDescription>
              Side-by-side verification of current live data versus the proposed modifications.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ApprovalDiffViewer
              diff={request.diff}
              action={request.action}
              currentData={request.currentData}
              proposedData={request.proposedData}
            />
          </CardContent>
        </Card>

        {/* Action Dialog */}
        <ApprovalActionDialog
          request={request}
          mode={dialogMode}
          onClose={() => setDialogMode(null)}
          onSuccess={loadData}
        />
      </div>
    </ModuleGuard>
  );
}
