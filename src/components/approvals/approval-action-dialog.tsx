"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { approveRequest, rejectRequest } from "@/lib/firebase/approvals";
import type { ApprovalRequest } from "@/types/approval";
import { useAuth } from "@/contexts/auth-context";

interface Props {
  request: ApprovalRequest | null;
  mode: "approve" | "reject" | null;
  onClose: () => void;
  onSuccess: () => Promise<void>;
}

export function ApprovalActionDialog({ request, mode, onClose, onSuccess }: Props) {
  const { adminUser: currentUser } = useAuth();
  const [comments, setComments] = useState("");
  const [processing, setProcessing] = useState(false);

  if (!request || !mode) return null;

  const isSelf = currentUser?.id === request.requesterId;

  const handleConfirm = async () => {
    if (!currentUser) {
      toast.error("You must be logged in to act on approval requests.");
      return;
    }

    if (isSelf) {
      toast.error("Conflict of interest: You cannot approve or reject your own request.");
      return;
    }

    if (mode === "reject" && !comments.trim()) {
      toast.error("Please provide a reason for rejecting this change.");
      return;
    }

    setProcessing(true);
    try {
      const approver = {
        id: currentUser.id,
        name: currentUser.displayName,
        email: currentUser.email,
      };

      if (mode === "approve") {
        await approveRequest(request.id, approver, comments);
        toast.success("Request approved and changes applied successfully!");
      } else {
        await rejectRequest(request.id, approver, comments);
        toast.success("Request rejected.");
      }

      onClose();
      await onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to process approval action");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <AlertDialog open onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            {mode === "approve" ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            ) : (
              <XCircle className="h-5 w-5 text-destructive" />
            )}
            <AlertDialogTitle>
              {mode === "approve" ? "Approve Change Request" : "Reject Change Request"}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            {mode === "approve" ? (
              <>
                Approving <strong>{request.title}</strong> will immediately apply these updates to the live database and website.
              </>
            ) : (
              <>
                Rejecting <strong>{request.title}</strong> will discard the proposed changes without modifying live website data.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {isSelf ? (
          <div className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <p>
              <strong>Conflict of Interest Rule:</strong> You created this request ({request.requesterName}). You cannot approve or reject your own submissions. Another authorized administrator must review it.
            </p>
          </div>
        ) : null}

        <div className="space-y-2 py-2">
          <Label htmlFor="comments" className="text-xs">
            {mode === "approve" ? "Comments / Approval Note (Optional)" : "Reason for Rejection (Required)"}
          </Label>
          <Textarea
            id="comments"
            rows={3}
            placeholder={
              mode === "approve"
                ? "e.g. Reviewed and verified SEO titles and copy."
                : "e.g. Please update pricing details before resubmitting."
            }
            value={comments}
            onChange={(e) => setComments(e.target.value)}
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={processing} onClick={onClose}>
            Cancel
          </AlertDialogCancel>
          <Button
            variant={mode === "approve" ? "default" : "destructive"}
            onClick={handleConfirm}
            disabled={processing || isSelf || (mode === "reject" && !comments.trim())}
          >
            {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {mode === "approve" ? "Confirm & Apply" : "Confirm Rejection"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
