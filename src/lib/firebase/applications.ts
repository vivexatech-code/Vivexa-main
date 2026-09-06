import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { getClientDb } from "./client";
import { APPLICATIONS_COLLECTION } from "@/lib/constants";
import type {
  ApplicationStatus,
  CareerApplication,
  CareerType,
} from "@/types/career";

function toIso(value: unknown): string {
  if (!value) return new Date().toISOString();
  if (typeof value === "string") return value;
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  return new Date().toISOString();
}

function mapApplication(
  id: string,
  data: Record<string, unknown>,
): CareerApplication {
  return {
    id,
    opportunityId: String(data.opportunityId ?? ""),
    opportunityTitle: String(data.opportunityTitle ?? ""),
    opportunityType: data.opportunityType === "Internship" ? "Internship" : "Job",
    name: String(data.name ?? ""),
    email: String(data.email ?? ""),
    phone: String(data.phone ?? ""),
    location: String(data.location ?? ""),
    resumeUrl: String(data.resumeUrl ?? ""),
    portfolioUrl: String(data.portfolioUrl ?? ""),
    coverLetter: String(data.coverLetter ?? ""),
    status: ([
      "new",
      "review",
      "shortlisted",
      "rejected",
      "selected",
    ] as ApplicationStatus[]).includes(data.status as ApplicationStatus)
      ? (data.status as ApplicationStatus)
      : "new",
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
  };
}

export async function getApplications(): Promise<CareerApplication[]> {
  const snapshot = await getDocs(
    collection(getClientDb(), APPLICATIONS_COLLECTION),
  );
  return snapshot.docs
    .map((item) => mapApplication(item.id, item.data()))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getApplicationById(
  id: string,
): Promise<CareerApplication | null> {
  const snapshot = await getDoc(doc(getClientDb(), APPLICATIONS_COLLECTION, id));
  if (!snapshot.exists()) return null;
  return mapApplication(snapshot.id, snapshot.data());
}

export async function updateApplicationStatus(
  id: string,
  status: ApplicationStatus,
): Promise<void> {
  await updateDoc(doc(getClientDb(), APPLICATIONS_COLLECTION, id), {
    status,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteApplication(id: string): Promise<void> {
  await deleteDoc(doc(getClientDb(), APPLICATIONS_COLLECTION, id));
}

export function applicationStatusLabel(status: ApplicationStatus) {
  switch (status) {
    case "new":
      return "New";
    case "review":
      return "Under Review";
    case "shortlisted":
      return "Shortlisted";
    case "rejected":
      return "Rejected";
    case "selected":
      return "Selected";
  }
}

export function opportunityTypeLabel(type: CareerType) {
  return type;
}
