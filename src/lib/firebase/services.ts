import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { getClientDb } from "./client";
import { SERVICES_COLLECTION } from "@/lib/constants";
import { slugify } from "@/lib/slug";
import type { Service, ServiceFormData } from "@/types/service";

function toIso(value: unknown): string {
  if (!value) return new Date().toISOString();
  if (typeof value === "string") return value;
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  return new Date().toISOString();
}

function mapService(id: string, data: Record<string, unknown>): Service {
  const features = Array.isArray(data.features)
    ? data.features.map((item) => String(item).trim()).filter(Boolean)
    : [];

  return {
    id,
    slug: String(data.slug ?? id),
    name: String(data.name ?? ""),
    eyebrow: String(data.eyebrow ?? ""),
    shortDescription: String(data.shortDescription ?? ""),
    detailedDescription: String(data.detailedDescription ?? ""),
    image: String(data.image ?? ""),
    category: String(data.category ?? "Core Services"),
    features,
    status: data.status === "draft" ? "draft" : "published",
    sortOrder: Number(data.sortOrder ?? 0),
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
  };
}

function writePayload(data: ServiceFormData) {
  return {
    name: data.name.trim(),
    slug: slugify(data.slug || data.name),
    eyebrow: data.eyebrow.trim(),
    shortDescription: data.shortDescription.trim(),
    detailedDescription: data.detailedDescription.trim(),
    image: data.image.trim(),
    category: data.category.trim() || "Core Services",
    features: data.features.map((item) => item.trim()).filter(Boolean),
    status: data.status,
    sortOrder: Number.isFinite(data.sortOrder) ? data.sortOrder : 0,
  };
}

export async function getServices(): Promise<Service[]> {
  const snapshot = await getDocs(collection(getClientDb(), SERVICES_COLLECTION));
  return snapshot.docs
    .map((item) => mapService(item.id, item.data()))
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
}

export async function getServiceById(id: string): Promise<Service | null> {
  const snapshot = await getDoc(doc(getClientDb(), SERVICES_COLLECTION, id));
  if (!snapshot.exists()) return null;
  return mapService(snapshot.id, snapshot.data());
}

export async function isServiceSlugTaken(slug: string, excludeId?: string) {
  const snapshot = await getDocs(
    query(
      collection(getClientDb(), SERVICES_COLLECTION),
      where("slug", "==", slug),
    ),
  );
  return snapshot.docs.some((item) => item.id !== excludeId);
}

export async function createService(data: ServiceFormData): Promise<Service> {
  const payload = writePayload(data);
  const now = new Date().toISOString();
  const ref = await addDoc(collection(getClientDb(), SERVICES_COLLECTION), {
    ...payload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return { id: ref.id, ...payload, createdAt: now, updatedAt: now };
}

export async function updateService(
  id: string,
  data: ServiceFormData,
): Promise<void> {
  await updateDoc(doc(getClientDb(), SERVICES_COLLECTION, id), {
    ...writePayload(data),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteService(id: string): Promise<void> {
  await deleteDoc(doc(getClientDb(), SERVICES_COLLECTION, id));
}
