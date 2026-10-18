import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { getClientDb } from "./client";
import { APPROVAL_REQUESTS_COLLECTION } from "@/lib/constants";
import type {
  ApprovalAction,
  ApprovalDiffItem,
  ApprovalRequest,
  ApprovalStatus,
} from "@/types/approval";
import type { AppModule } from "@/types/auth";
import { logAuditEvent } from "./audit";

function toIso(value: unknown): string {
  if (!value) return new Date().toISOString();
  if (typeof value === "string") return value;
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  return new Date().toISOString();
}

function mapApprovalRequest(id: string, data: Record<string, unknown>): ApprovalRequest {
  const decision = data.decision as Record<string, unknown> | undefined;

  return {
    id,
    module: (data.module as AppModule) || "dashboard",
    action: (data.action as ApprovalAction) || "update",
    targetCollection: String(data.targetCollection || ""),
    targetDocId: data.targetDocId ? String(data.targetDocId) : undefined,
    title: String(data.title || "Proposed Change"),
    summary: String(data.summary || ""),
    requesterId: String(data.requesterId || ""),
    requesterName: String(data.requesterName || "Team Member"),
    requesterEmail: String(data.requesterEmail || ""),
    requesterDepartmentId: data.requesterDepartmentId ? String(data.requesterDepartmentId) : undefined,
    status: (data.status as ApprovalStatus) || "pending",
    currentData: (data.currentData as Record<string, unknown>) || undefined,
    proposedData: (data.proposedData as Record<string, unknown>) || {},
    diff: Array.isArray(data.diff) ? (data.diff as ApprovalDiffItem[]) : undefined,
    decision: decision
      ? {
          decidedBy: String(decision.decidedBy || ""),
          decidedByName: String(decision.decidedByName || ""),
          decidedByEmail: String(decision.decidedByEmail || ""),
          decidedAt: toIso(decision.decidedAt),
          comments: decision.comments ? String(decision.comments) : undefined,
        }
      : undefined,
    rejectionReason: data.rejectionReason ? String(data.rejectionReason) : undefined,
    appliedAt: data.appliedAt ? toIso(data.appliedAt) : undefined,
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
  };
}

export function computeDiff(
  current: Record<string, unknown> = {},
  proposed: Record<string, unknown> = {},
): ApprovalDiffItem[] {
  const allKeys = Array.from(new Set([...Object.keys(current), ...Object.keys(proposed)]));
  const ignoredKeys = new Set(["createdAt", "updatedAt", "id", "docId"]);
  const items: ApprovalDiffItem[] = [];

  for (const key of allKeys) {
    if (ignoredKeys.has(key)) continue;
    const oldVal = current[key];
    const newVal = proposed[key];

    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      items.push({
        field: key,
        fieldLabel: key
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (s) => s.toUpperCase()),
        oldValue: oldVal ?? "—",
        newValue: newVal ?? "—",
      });
    }
  }

  return items;
}

export async function getApprovalRequests(status?: ApprovalStatus): Promise<ApprovalRequest[]> {
  const db = getClientDb();
  let q = query(collection(db, APPROVAL_REQUESTS_COLLECTION), orderBy("createdAt", "desc"));

  if (status) {
    q = query(
      collection(db, APPROVAL_REQUESTS_COLLECTION),
      where("status", "==", status),
      orderBy("createdAt", "desc"),
    );
  }

  const snap = await getDocs(q);
  return snap.docs.map((d) => mapApprovalRequest(d.id, d.data() as Record<string, unknown>));
}

export async function getApprovalRequest(id: string): Promise<ApprovalRequest | null> {
  const db = getClientDb();
  const snap = await getDoc(doc(db, APPROVAL_REQUESTS_COLLECTION, id));
  if (!snap.exists()) return null;
  return mapApprovalRequest(snap.id, snap.data() as Record<string, unknown>);
}

export async function getPendingApprovalsCount(): Promise<number> {
  try {
    const db = getClientDb();
    const snap = await getDocs(
      query(collection(db, APPROVAL_REQUESTS_COLLECTION), where("status", "==", "pending")),
    );
    return snap.size;
  } catch {
    return 0;
  }
}

export interface SubmitApprovalInput {
  module: AppModule;
  action: ApprovalAction;
  targetCollection: string;
  targetDocId?: string;
  title: string;
  summary: string;
  requester: {
    id: string;
    name: string;
    email: string;
    departmentId?: string;
  };
  currentData?: Record<string, unknown>;
  proposedData: Record<string, unknown>;
}

export async function submitApprovalRequest(input: SubmitApprovalInput): Promise<string> {
  const db = getClientDb();
  const newRef = doc(collection(db, APPROVAL_REQUESTS_COLLECTION));
  const diff = computeDiff(input.currentData || {}, input.proposedData || {});

  const requestData = {
    module: input.module,
    action: input.action,
    targetCollection: input.targetCollection,
    targetDocId: input.targetDocId || null,
    title: input.title,
    summary: input.summary,
    requesterId: input.requester.id,
    requesterName: input.requester.name,
    requesterEmail: input.requester.email,
    requesterDepartmentId: input.requester.departmentId || null,
    status: "pending",
    currentData: input.currentData || null,
    proposedData: input.proposedData,
    diff,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(newRef, requestData);

  await logAuditEvent({
    actorId: input.requester.id,
    actorName: input.requester.name,
    actorEmail: input.requester.email,
    action: "approval.submitted",
    module: input.module,
    resourceType: input.targetCollection,
    resourceId: newRef.id,
    resourceName: input.title,
    approvalRequestId: newRef.id,
    details: {
      action: input.action,
      targetDocId: input.targetDocId,
      diffSummary: diff.map((d) => d.fieldLabel),
    },
  });

  return newRef.id;
}

export async function approveRequest(
  requestId: string,
  approver: { id: string; name: string; email: string },
  comments?: string,
): Promise<void> {
  const db = getClientDb();
  const request = await getApprovalRequest(requestId);
  if (!request) {
    throw new Error("Approval request not found.");
  }

  if (request.status !== "pending") {
    throw new Error(`This request has already been ${request.status}.`);
  }

  // Security enforcement: Requester CANNOT approve their own request!
  if (request.requesterId === approver.id) {
    throw new Error("Conflict of Interest: You cannot approve your own change request. Another authorized approver must review it.");
  }

  // Apply the change to the actual target collection
  const targetCol = request.targetCollection;
  const targetId = request.targetDocId;

  if (request.action === "create") {
    const targetRef = targetId ? doc(db, targetCol, targetId) : doc(collection(db, targetCol));
    await setDoc(targetRef, {
      ...request.proposedData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } else if (request.action === "update") {
    if (!targetId) throw new Error("Missing target document ID for update.");
    await updateDoc(doc(db, targetCol, targetId), {
      ...request.proposedData,
      updatedAt: serverTimestamp(),
    });
  } else if (request.action === "delete") {
    if (!targetId) throw new Error("Missing target document ID for delete.");
    await deleteDoc(doc(db, targetCol, targetId));
  }

  // Update approval request record
  await updateDoc(doc(db, APPROVAL_REQUESTS_COLLECTION, requestId), {
    status: "approved",
    decision: {
      decidedBy: approver.id,
      decidedByName: approver.name,
      decidedByEmail: approver.email,
      decidedAt: serverTimestamp(),
      comments: comments?.trim() || "Approved by administrator.",
    },
    appliedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Log audit
  await logAuditEvent({
    actorId: approver.id,
    actorName: approver.name,
    actorEmail: approver.email,
    action: "approval.approved",
    module: request.module,
    resourceType: request.targetCollection,
    resourceId: requestId,
    resourceName: request.title,
    approvalRequestId: requestId,
    details: {
      requesterName: request.requesterName,
      requesterEmail: request.requesterEmail,
      action: request.action,
      comments,
    },
  });
}

export async function rejectRequest(
  requestId: string,
  approver: { id: string; name: string; email: string },
  comments?: string,
): Promise<void> {
  const db = getClientDb();
  const request = await getApprovalRequest(requestId);
  if (!request) {
    throw new Error("Approval request not found.");
  }

  if (request.status !== "pending") {
    throw new Error(`This request has already been ${request.status}.`);
  }

  if (request.requesterId === approver.id) {
    throw new Error("Conflict of Interest: You cannot review your own request.");
  }

  const reason = comments?.trim() || "Rejected by administrator.";

  await updateDoc(doc(db, APPROVAL_REQUESTS_COLLECTION, requestId), {
    status: "rejected",
    rejectionReason: reason,
    decision: {
      decidedBy: approver.id,
      decidedByName: approver.name,
      decidedByEmail: approver.email,
      decidedAt: serverTimestamp(),
      comments: reason,
    },
    updatedAt: serverTimestamp(),
  });

  await logAuditEvent({
    actorId: approver.id,
    actorName: approver.name,
    actorEmail: approver.email,
    action: "approval.rejected",
    module: request.module,
    resourceType: request.targetCollection,
    resourceId: requestId,
    resourceName: request.title,
    approvalRequestId: requestId,
    details: {
      requesterName: request.requesterName,
      requesterEmail: request.requesterEmail,
      action: request.action,
      rejectionReason: reason,
    },
  });
}
