import type { AppModule } from "./auth";

export type ApprovalStatus = "pending" | "approved" | "rejected";
export type ApprovalAction = "create" | "update" | "delete" | "publish";

export interface ApprovalDiffItem {
  field: string;
  fieldLabel: string;
  oldValue: unknown;
  newValue: unknown;
}

export interface ApprovalRequest {
  id: string;
  module: AppModule;
  action: ApprovalAction;
  targetCollection: string;
  targetDocId?: string;
  title: string;
  summary: string;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  requesterDepartmentId?: string;
  status: ApprovalStatus;
  currentData?: Record<string, unknown>;
  proposedData: Record<string, unknown>;
  diff?: ApprovalDiffItem[];
  decision?: {
    decidedBy: string;
    decidedByName: string;
    decidedByEmail: string;
    decidedAt: string;
    comments?: string;
  };
  rejectionReason?: string;
  appliedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type ApprovalDecisionInput = {
  requestId: string;
  status: "approved" | "rejected";
  comments?: string;
};
