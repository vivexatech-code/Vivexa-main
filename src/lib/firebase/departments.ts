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
import { getClientDb } from "./client";
import { DEPARTMENTS_COLLECTION, ADMIN_USERS_COLLECTION } from "@/lib/constants";
import {
  DEFAULT_DEPARTMENT_PERMISSIONS,
  INITIAL_DEPARTMENTS,
} from "@/lib/permissions";
import { slugify } from "@/lib/slug";
import type { Department, DepartmentFormData } from "@/types/department";

function toIso(value: unknown): string {
  if (!value) return new Date().toISOString();
  if (typeof value === "string") return value;
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  return new Date().toISOString();
}

function mapDepartment(id: string, data: Record<string, unknown>): Department {
  return {
    id,
    name: String(data.name || "").trim(),
    description: String(data.description || "").trim(),
    status: (data.status as Department["status"]) || "active",
    defaultPermissions: (data.defaultPermissions as Department["defaultPermissions"]) || {},
    isSystem: Boolean(data.isSystem),
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
  };
}

export async function getDepartments(): Promise<Department[]> {
  const db = getClientDb();
  await seedDefaultDepartments();

  const snap = await getDocs(
    query(collection(db, DEPARTMENTS_COLLECTION), orderBy("name", "asc")),
  );

  const departments = snap.docs.map((d) =>
    mapDepartment(d.id, d.data() as Record<string, unknown>),
  );

  // Compute live member count for each department
  try {
    const usersSnap = await getDocs(collection(db, ADMIN_USERS_COLLECTION));
    const counts: Record<string, number> = {};
    for (const userDoc of usersSnap.docs) {
      const uData = userDoc.data();
      const depts = Array.isArray(uData.departments) ? uData.departments : [];
      for (const dId of depts) {
        counts[dId] = (counts[dId] || 0) + 1;
      }
    }
    return departments.map((d) => ({
      ...d,
      memberCount: counts[d.id] || 0,
    }));
  } catch {
    return departments;
  }
}

export async function getDepartment(id: string): Promise<Department | null> {
  const db = getClientDb();
  const snap = await getDoc(doc(db, DEPARTMENTS_COLLECTION, id));
  if (!snap.exists()) return null;
  return mapDepartment(snap.id, snap.data() as Record<string, unknown>);
}

export async function createDepartment(data: DepartmentFormData): Promise<string> {
  const db = getClientDb();
  const slug = slugify(data.name).toLowerCase();
  const docRef = doc(db, DEPARTMENTS_COLLECTION, slug);
  const existing = await getDoc(docRef);
  const finalId = existing.exists() ? `${slug}-${Date.now().toString(36)}` : slug;

  await setDoc(doc(db, DEPARTMENTS_COLLECTION, finalId), {
    name: data.name.trim(),
    description: data.description.trim(),
    status: data.status,
    defaultPermissions: data.defaultPermissions,
    isSystem: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return finalId;
}

export async function updateDepartment(
  id: string,
  data: Partial<DepartmentFormData>,
): Promise<void> {
  const db = getClientDb();
  const updateData: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };

  if (data.name !== undefined) updateData.name = data.name.trim();
  if (data.description !== undefined) updateData.description = data.description.trim();
  if (data.status !== undefined) updateData.status = data.status;
  if (data.defaultPermissions !== undefined) {
    updateData.defaultPermissions = data.defaultPermissions;
  }

  await updateDoc(doc(db, DEPARTMENTS_COLLECTION, id), updateData);
}

export async function deleteDepartment(id: string): Promise<void> {
  const db = getClientDb();
  const dept = await getDepartment(id);
  if (dept?.isSystem) {
    throw new Error("System default departments cannot be permanently deleted. You can deactivate them instead.");
  }
  await deleteDoc(doc(db, DEPARTMENTS_COLLECTION, id));
}

let seedPromise: Promise<void> | null = null;

export async function seedDefaultDepartments(): Promise<void> {
  if (seedPromise) return seedPromise;

  seedPromise = (async () => {
    try {
      const db = getClientDb();
      const snap = await getDocs(collection(db, DEPARTMENTS_COLLECTION));
      if (!snap.empty) return;

      for (const item of INITIAL_DEPARTMENTS) {
        await setDoc(doc(db, DEPARTMENTS_COLLECTION, item.id), {
          name: item.name,
          description: item.description,
          status: "active",
          defaultPermissions: DEFAULT_DEPARTMENT_PERMISSIONS[item.id] || {},
          isSystem: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    } catch (err) {
      console.error("Failed to seed default departments:", err);
    }
  })();

  return seedPromise;
}
