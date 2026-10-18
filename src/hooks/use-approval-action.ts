"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { submitApprovalRequest } from "@/lib/firebase/approvals";
import type { AppModule, PermissionLevel } from "@/types/auth";
import type { ApprovalAction } from "@/types/approval";

export interface ProtectedActionOptions<TCurrent = Record<string, unknown>, TProposed = Record<string, unknown>> {
  module: AppModule;
  action: ApprovalAction;
  targetCollection: string;
  targetDocId?: string;
  title: string;
  summary?: string;
  currentData?: TCurrent;
  proposedData: TProposed;
  directAction: () => Promise<void>;
  onSubmittedForApproval?: (requestId: string) => void;
}

export function useApprovalAction() {
  const { adminUser, permissions, isSuperAdmin } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  /**
   * Executes the direct action if user has direct write access (full or read_write),
   * or intercepts and submits an approval request if user has approval_required level.
   *
   * @returns boolean: true if applied directly, false if submitted for approval
   */
  const executeOrRequestApproval = async <TCurrent = Record<string, unknown>, TProposed = Record<string, unknown>>(
    options: ProtectedActionOptions<TCurrent, TProposed>,
  ): Promise<{ appliedDirectly: boolean; approvalId?: string }> => {
    const {
      module,
      action,
      targetCollection,
      targetDocId,
      title,
      summary,
      currentData,
      proposedData,
      directAction,
      onSubmittedForApproval,
    } = options;

    if (!adminUser) {
      throw new Error("You must be authenticated to perform this operation.");
    }

    const level: PermissionLevel = isSuperAdmin ? "full" : (permissions[module] || "none");

    if (level === "none" || level === "read") {
      throw new Error(`You do not have write permissions for the ${module} module.`);
    }

    // Direct write for Full Access or Read & Write
    if (level === "full" || level === "read_write" || isSuperAdmin) {
      await directAction();
      return { appliedDirectly: true };
    }

    // If approval_required, submit to approval queue
    setSubmitting(true);
    try {
      const requestId = await submitApprovalRequest({
        module,
        action,
        targetCollection,
        targetDocId,
        title,
        summary: summary || `Proposed ${action} on ${title}`,
        requester: {
          id: adminUser.id,
          name: adminUser.displayName,
          email: adminUser.email,
          departmentId: adminUser.departments[0],
        },
        currentData: currentData as Record<string, unknown>,
        proposedData: proposedData as Record<string, unknown>,
      });

      toast.info("Change submitted for administrative approval", {
        description: "Your proposal is pending review. Live content will not be updated until an administrator approves it.",
        duration: 8000,
      });

      if (onSubmittedForApproval) {
        onSubmittedForApproval(requestId);
      }

      return { appliedDirectly: false, approvalId: requestId };
    } finally {
      setSubmitting(false);
    }
  };

  return {
    executeOrRequestApproval,
    submitting,
  };
}
