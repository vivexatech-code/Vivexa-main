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
} from "firebase/firestore";
import type { User } from "firebase/auth";
import { getClientDb } from "./client";
import { ADMIN_USERS_COLLECTION } from "@/lib/constants";
import type { AdminUser, AdminUserFormData, UserStatus } from "@/types/auth";
import { logAuditEvent } from "./audit";

function toIso(value: unknown): string {
  if (!value) return new Date().toISOString();
  if (typeof value === "string") return value;
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  return new Date().toISOString();
}

function mapAdminUser(id: string, data: Record<string, unknown>): AdminUser {
  return {
    id,
    email: String(data.email || "").trim().toLowerCase(),
    displayName: String(data.displayName || data.name || "").trim(),
    jobTitle: data.jobTitle ? String(data.jobTitle).trim() : undefined,
    departments: Array.isArray(data.departments)
      ? data.departments.map(String)
      : [],
    reportingManagerId: data.reportingManagerId
      ? String(data.reportingManagerId)
      : undefined,
    reportingManagerName: data.reportingManagerName
      ? String(data.reportingManagerName)
      : undefined,
    status: (data.status as UserStatus) || "active",
    isSuperAdmin: Boolean(data.isSuperAdmin),
    permissions: (data.permissions as AdminUser["permissions"]) || {},
    capabilities: (data.capabilities as AdminUser["capabilities"]) || {},
    lastLoginAt: data.lastLoginAt ? toIso(data.lastLoginAt) : undefined,
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
    createdById: data.createdById ? String(data.createdById) : undefined,
  };
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  const db = getClientDb();
  const snap = await getDocs(
    query(collection(db, ADMIN_USERS_COLLECTION), orderBy("createdAt", "desc")),
  );
  return snap.docs.map((d) => mapAdminUser(d.id, d.data() as Record<string, unknown>));
}

export async function getAdminUser(id: string): Promise<AdminUser | null> {
  const db = getClientDb();
  const snap = await getDoc(doc(db, ADMIN_USERS_COLLECTION, id));
  if (!snap.exists()) return null;
  return mapAdminUser(snap.id, snap.data() as Record<string, unknown>);
}

export async function createAdminUser(
  userId: string,
  data: AdminUserFormData,
  actor?: { id: string; name: string; email: string },
): Promise<void> {
  const db = getClientDb();
  const userDoc = {
    email: data.email.trim().toLowerCase(),
    displayName: data.displayName.trim(),
    jobTitle: data.jobTitle?.trim() || null,
    departments: data.departments,
    reportingManagerId: data.reportingManagerId || null,
    status: data.status,
    isSuperAdmin: Boolean(data.isSuperAdmin),
    permissions: data.permissions || {},
    capabilities: data.capabilities || {},
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdById: actor?.id || null,
  };

  await setDoc(doc(db, ADMIN_USERS_COLLECTION, userId), userDoc);

  if (actor) {
    await logAuditEvent({
      actorId: actor.id,
      actorName: actor.name,
      actorEmail: actor.email,
      action: "user.create",
      module: "users",
      resourceType: "user",
      resourceId: userId,
      resourceName: data.displayName,
      details: {
        email: data.email,
        departments: data.departments,
        status: data.status,
        isSuperAdmin: data.isSuperAdmin,
      },
    });
  }
}

export async function updateAdminUser(
  userId: string,
  data: Partial<AdminUserFormData>,
  actor?: { id: string; name: string; email: string },
): Promise<void> {
  const db = getClientDb();
  const updateData: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };

  if (data.displayName !== undefined) updateData.displayName = data.displayName.trim();
  if (data.email !== undefined) updateData.email = data.email.trim().toLowerCase();
  if (data.jobTitle !== undefined) updateData.jobTitle = data.jobTitle.trim() || null;
  if (data.departments !== undefined) updateData.departments = data.departments;
  if (data.reportingManagerId !== undefined) {
    updateData.reportingManagerId = data.reportingManagerId || null;
  }
  if (data.status !== undefined) updateData.status = data.status;
  if (data.isSuperAdmin !== undefined) updateData.isSuperAdmin = data.isSuperAdmin;
  if (data.permissions !== undefined) updateData.permissions = data.permissions;
  if (data.capabilities !== undefined) updateData.capabilities = data.capabilities;

  await updateDoc(doc(db, ADMIN_USERS_COLLECTION, userId), updateData);

  if (actor) {
    await logAuditEvent({
      actorId: actor.id,
      actorName: actor.name,
      actorEmail: actor.email,
      action: "user.update",
      module: "users",
      resourceType: "user",
      resourceId: userId,
      resourceName: data.displayName,
      details: updateData,
    });
  }
}

export async function updateUserStatus(
  userId: string,
  status: UserStatus,
  actor?: { id: string; name: string; email: string },
): Promise<void> {
  const db = getClientDb();
  await updateDoc(doc(db, ADMIN_USERS_COLLECTION, userId), {
    status,
    updatedAt: serverTimestamp(),
  });

  if (actor) {
    await logAuditEvent({
      actorId: actor.id,
      actorName: actor.name,
      actorEmail: actor.email,
      action: `user.status.${status}`,
      module: "users",
      resourceType: "user",
      resourceId: userId,
      details: { newStatus: status },
    });
  }
}

export async function deleteAdminUser(
  userId: string,
  actor?: { id: string; name: string; email: string },
): Promise<void> {
  const db = getClientDb();
  const target = await getAdminUser(userId);
  if (target?.isSuperAdmin) {
    throw new Error("Primary super administrator cannot be deleted.");
  }

  await deleteDoc(doc(db, ADMIN_USERS_COLLECTION, userId));

  if (actor) {
    await logAuditEvent({
      actorId: actor.id,
      actorName: actor.name,
      actorEmail: actor.email,
      action: "user.delete",
      module: "users",
      resourceType: "user",
      resourceId: userId,
      resourceName: target?.displayName,
    });
  }
}

/**
 * Ensures the currently logged-in Firebase user has an active record in `admin_users`.
 * If no users exist in the collection yet, this user becomes the primary Super Administrator!
 */
export async function ensurePrimaryAdmin(firebaseUser: User): Promise<AdminUser> {
  const db = getClientDb();
  const userRef = doc(db, ADMIN_USERS_COLLECTION, firebaseUser.uid);
  const snap = await getDoc(userRef);

  if (snap.exists()) {
    // Update lastLoginAt
    await updateDoc(userRef, {
      lastLoginAt: serverTimestamp(),
    });
    return mapAdminUser(snap.id, snap.data() as Record<string, unknown>);
  }

  // Check if any admin users exist at all
  const allSnap = await getDocs(collection(db, ADMIN_USERS_COLLECTION));
  const isFirstUser = allSnap.empty;

  const newUser: AdminUser = {
    id: firebaseUser.uid,
    email: (firebaseUser.email || "").toLowerCase(),
    displayName: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Administrator",
    departments: isFirstUser ? ["management"] : [],
    status: "active",
    isSuperAdmin: isFirstUser, // First user is automatically primary Super Administrator
    permissions: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };

  await setDoc(userRef, {
    email: newUser.email,
    displayName: newUser.displayName,
    departments: newUser.departments,
    status: newUser.status,
    isSuperAdmin: newUser.isSuperAdmin,
    permissions: {},
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
  });

  return newUser;
}
