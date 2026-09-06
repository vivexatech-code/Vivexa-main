import {
  addDoc,
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
import { CAREERS_COLLECTION } from "@/lib/constants";
import type {
  CareerFormData,
  CareerOpportunity,
  CareerStatus,
  CareerType,
  CareerWorkType,
} from "@/types/career";

function toIso(value: unknown): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  return "";
}

function asList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item).trim()).filter(Boolean);
}

function mapCareer(
  id: string,
  data: Record<string, unknown>,
): CareerOpportunity {
  return {
    id,
    title: String(data.title ?? ""),
    type: data.type === "Internship" ? "Internship" : "Job",
    department: String(data.department ?? ""),
    location: String(data.location ?? ""),
    workType: (data.workType as CareerWorkType) || "On-site",
    employmentType:
      data.employmentType === "Part-time" || data.employmentType === "Contract"
        ? data.employmentType
        : data.employmentType === "Full-time"
          ? "Full-time"
          : "",
    shortDescription: String(data.shortDescription ?? ""),
    fullDescription: String(data.fullDescription ?? ""),
    responsibilities: asList(data.responsibilities),
    requirements: asList(data.requirements),
    openings: Number(data.openings ?? 1) || 1,
    deadline: toIso(data.deadline).slice(0, 10),
    keepOpen: Boolean(data.keepOpen),
    duration: String(data.duration ?? ""),
    stipend: String(data.stipend ?? ""),
    status: (["draft", "published", "closed"] as CareerStatus[]).includes(
      data.status as CareerStatus,
    )
      ? (data.status as CareerStatus)
      : "draft",
    createdAt: toIso(data.createdAt) || new Date().toISOString(),
    updatedAt: toIso(data.updatedAt) || new Date().toISOString(),
  };
}

function writePayload(data: CareerFormData) {
  return {
    title: data.title.trim(),
    type: data.type as CareerType,
    department: data.department.trim(),
    location: data.location.trim(),
    workType: data.workType,
    employmentType: data.type === "Job" ? data.employmentType : "",
    shortDescription: data.shortDescription.trim(),
    fullDescription: data.fullDescription.trim(),
    responsibilities: data.responsibilities
      .map((item) => item.trim())
      .filter(Boolean),
    requirements: data.requirements.map((item) => item.trim()).filter(Boolean),
    openings: Number(data.openings) || 1,
    deadline: data.deadline.trim(),
    keepOpen: Boolean(data.keepOpen),
    duration: data.type === "Internship" ? data.duration.trim() : "",
    stipend: data.type === "Internship" ? data.stipend.trim() : "",
    status: data.status,
  };
}

export async function getCareers(): Promise<CareerOpportunity[]> {
  const snapshot = await getDocs(collection(getClientDb(), CAREERS_COLLECTION));
  return snapshot.docs
    .map((item) => mapCareer(item.id, item.data()))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getCareerById(
  id: string,
): Promise<CareerOpportunity | null> {
  const snapshot = await getDoc(doc(getClientDb(), CAREERS_COLLECTION, id));
  if (!snapshot.exists()) return null;
  return mapCareer(snapshot.id, snapshot.data());
}

export async function createCareer(
  data: CareerFormData,
): Promise<CareerOpportunity> {
  const payload = writePayload(data);
  const now = new Date().toISOString();
  const ref = await addDoc(collection(getClientDb(), CAREERS_COLLECTION), {
    ...payload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return { id: ref.id, ...payload, createdAt: now, updatedAt: now };
}

export async function updateCareer(
  id: string,
  data: CareerFormData,
): Promise<void> {
  await updateDoc(doc(getClientDb(), CAREERS_COLLECTION, id), {
    ...writePayload(data),
    updatedAt: serverTimestamp(),
  });
}

export async function updateCareerStatus(
  id: string,
  status: CareerStatus,
): Promise<void> {
  await updateDoc(doc(getClientDb(), CAREERS_COLLECTION, id), {
    status,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteCareer(id: string): Promise<void> {
  await deleteDoc(doc(getClientDb(), CAREERS_COLLECTION, id));
}
