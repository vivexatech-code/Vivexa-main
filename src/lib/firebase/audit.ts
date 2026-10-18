import {
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  where,
} from "firebase/firestore";
import { getClientDb } from "./client";
import { AUDIT_LOGS_COLLECTION } from "@/lib/constants";
import type { AuditLog, AuditLogFilters } from "@/types/audit";

function toIso(value: unknown): string {
  if (!value) return new Date().toISOString();
  if (typeof value === "string") return value;
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  return new Date().toISOString();
}

function mapAuditLog(id: string, data: Record<string, unknown>): AuditLog {
  return {
    id,
    actorId: String(data.actorId || ""),
    actorName: String(data.actorName || "System"),
    actorEmail: String(data.actorEmail || ""),
    action: String(data.action || ""),
    module: (data.module as AuditLog["module"]) || "dashboard",
    resourceType: String(data.resourceType || ""),
    resourceId: String(data.resourceId || ""),
    resourceName: data.resourceName ? String(data.resourceName) : undefined,
    details: (data.details as Record<string, unknown>) || undefined,
    approvalRequestId: data.approvalRequestId ? String(data.approvalRequestId) : undefined,
    timestamp: toIso(data.timestamp || data.createdAt),
  };
}

export async function logAuditEvent(
  entry: Omit<AuditLog, "id" | "timestamp">,
): Promise<void> {
  try {
    const db = getClientDb();
    const newRef = doc(collection(db, AUDIT_LOGS_COLLECTION));
    await setDoc(newRef, {
      ...entry,
      timestamp: serverTimestamp(),
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    // Non-blocking in case of offline, but console logged
    console.error("Failed to record audit log:", error);
  }
}

export async function getAuditLogs(
  filters?: AuditLogFilters,
  maxRecords = 100,
): Promise<AuditLog[]> {
  const db = getClientDb();
  let q = query(
    collection(db, AUDIT_LOGS_COLLECTION),
    orderBy("timestamp", "desc"),
    limit(maxRecords),
  );

  if (filters?.module) {
    q = query(q, where("module", "==", filters.module));
  }
  if (filters?.actorId) {
    q = query(q, where("actorId", "==", filters.actorId));
  }

  const snap = await getDocs(q);
  return snap.docs.map((d) => mapAuditLog(d.id, d.data() as Record<string, unknown>));
}
