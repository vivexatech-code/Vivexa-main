import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  runTransaction,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { getClientDb } from "./client";
import {
  COUNTER_COLLECTION,
  EMPLOYEE_COUNTER_DOC,
  EMPLOYEE_ID_START,
  EMPLOYEES_COLLECTION,
} from "@/lib/constants";
import { buildVerificationUrl } from "@/lib/utils";
import type {
  DashboardStats,
  Employee,
  EmployeeFormData,
  PhotoCrop,
} from "@/types/employee";

function toIso(value: unknown): string {
  if (!value) return new Date().toISOString();
  if (typeof value === "string") return value;
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  return new Date().toISOString();
}

function mapPhotoCrop(value: unknown): PhotoCrop | undefined {
  if (!value || typeof value !== "object") return undefined;
  const crop = value as Record<string, unknown>;
  return {
    x: Number(crop.x ?? 0),
    y: Number(crop.y ?? 0),
    zoom: Number(crop.zoom ?? 1.2),
  };
}

function mapEmployee(id: string, data: Record<string, unknown>): Employee {
  return {
    id,
    employeeId: String(data.employeeId ?? id),
    name: String(data.name ?? ""),
    designation: String(data.designation ?? ""),
    phone: String(data.phone ?? ""),
    employeeType: (data.employeeType as Employee["employeeType"]) ?? "Employee",
    profilePhoto: String(data.profilePhoto ?? ""),
    profilePhotoOriginal: data.profilePhotoOriginal
      ? String(data.profilePhotoOriginal)
      : undefined,
    photoCrop: mapPhotoCrop(data.photoCrop),
    joinedDate: toIso(data.joinedDate),
    status: (data.status as Employee["status"]) ?? "Active",
    verificationUrl: String(data.verificationUrl ?? ""),
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
  };
}

export async function generateEmployeeId(): Promise<string> {
  const db = getClientDb();
  const counterRef = doc(db, COUNTER_COLLECTION, EMPLOYEE_COUNTER_DOC);

  const next = await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(counterRef);
    const current = snapshot.exists() ? Number(snapshot.data().value ?? 0) : 0;
    // Migrate from older counters (< 12701) and continue the sequence
    const value = current < EMPLOYEE_ID_START ? EMPLOYEE_ID_START : current + 1;
    transaction.set(counterRef, { value }, { merge: true });
    return value;
  });

  return String(next);
}

export async function getEmployees(): Promise<Employee[]> {
  const db = getClientDb();
  const q = query(
    collection(db, EMPLOYEES_COLLECTION),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((item) => mapEmployee(item.id, item.data()));
}

export async function getEmployeeById(id: string): Promise<Employee | null> {
  const snapshot = await getDoc(doc(getClientDb(), EMPLOYEES_COLLECTION, id));
  if (!snapshot.exists()) return null;
  return mapEmployee(snapshot.id, snapshot.data());
}

export async function getEmployeeByEmployeeId(
  employeeId: string
): Promise<Employee | null> {
  const snapshot = await getDoc(
    doc(getClientDb(), EMPLOYEES_COLLECTION, employeeId)
  );
  if (!snapshot.exists()) return null;
  return mapEmployee(snapshot.id, snapshot.data());
}

export async function createEmployee(
  data: EmployeeFormData
): Promise<Employee> {
  const employeeId = await generateEmployeeId();
  const verificationUrl = buildVerificationUrl(employeeId);
  const now = new Date().toISOString();

  const payload = {
    employeeId,
    name: data.name.trim(),
    designation: data.designation.trim(),
    phone: data.phone.trim(),
    employeeType: data.employeeType,
    profilePhoto: data.profilePhoto,
    joinedDate: data.joinedDate,
    status: data.status,
    verificationUrl,
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(doc(getClientDb(), EMPLOYEES_COLLECTION, employeeId), {
    ...payload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return { id: employeeId, ...payload };
}

export async function updateEmployee(
  employeeId: string,
  data: EmployeeFormData
): Promise<void> {
  const ref = doc(getClientDb(), EMPLOYEES_COLLECTION, employeeId);
  await updateDoc(ref, {
    name: data.name.trim(),
    designation: data.designation.trim(),
    phone: data.phone.trim(),
    employeeType: data.employeeType,
    profilePhoto: data.profilePhoto,
    joinedDate: data.joinedDate,
    status: data.status,
    updatedAt: serverTimestamp(),
  });
}

export async function updateEmployeePhotoCrop(
  employeeId: string,
  data: {
    profilePhoto: string;
    profilePhotoOriginal: string;
    photoCrop: PhotoCrop;
  }
): Promise<void> {
  const ref = doc(getClientDb(), EMPLOYEES_COLLECTION, employeeId);
  await updateDoc(ref, {
    profilePhoto: data.profilePhoto,
    profilePhotoOriginal: data.profilePhotoOriginal,
    photoCrop: data.photoCrop,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteEmployee(employeeId: string): Promise<void> {
  await deleteDoc(doc(getClientDb(), EMPLOYEES_COLLECTION, employeeId));
}

export function computeDashboardStats(employees: Employee[]): DashboardStats {
  return {
    totalEmployees: employees.filter((e) => e.employeeType === "Employee")
      .length,
    totalInterns: employees.filter((e) => e.employeeType === "Intern").length,
    activeEmployees: employees.filter((e) => e.status === "Active").length,
    inactiveEmployees: employees.filter((e) => e.status === "Inactive").length,
  };
}
