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
import { PROJECTS_COLLECTION } from "@/lib/constants";
import { slugify } from "@/lib/slug";
import type { Project, ProjectFormData } from "@/types/project";

function toIso(value: unknown): string {
  if (!value) return new Date().toISOString();
  if (typeof value === "string") return value;
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  return new Date().toISOString();
}

function mapProject(id: string, data: Record<string, unknown>): Project {
  const tags = Array.isArray(data.tags)
    ? data.tags.map((tag) => String(tag).trim()).filter(Boolean).slice(0, 3)
    : [];

  return {
    id,
    slug: String(data.slug ?? id),
    name: String(data.name ?? ""),
    description: String(data.description ?? ""),
    location: String(data.location ?? ""),
    country: String(data.country ?? ""),
    growth: String(data.growth ?? ""),
    focus: String(data.focus ?? ""),
    target: String(data.target ?? ""),
    websiteUrl: String(data.websiteUrl ?? ""),
    tags,
    image: String(data.image ?? ""),
    category: String(data.category ?? "Website"),
    status: data.status === "draft" ? "draft" : "published",
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
  };
}

function writePayload(data: ProjectFormData) {
  return {
    name: data.name.trim(),
    slug: slugify(data.slug || data.name),
    description: data.description.trim(),
    location: data.location.trim(),
    country: data.country.trim(),
    growth: data.growth.trim(),
    focus: data.focus.trim(),
    target: data.target.trim(),
    websiteUrl: data.websiteUrl.trim(),
    tags: data.tags.map((tag) => tag.trim()).filter(Boolean).slice(0, 3),
    image: data.image.trim(),
    category: data.category.trim() || "Website",
    status: data.status,
  };
}

export async function getProjects(): Promise<Project[]> {
  const snapshot = await getDocs(collection(getClientDb(), PROJECTS_COLLECTION));
  return snapshot.docs
    .map((item) => mapProject(item.id, item.data()))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getProjectById(id: string): Promise<Project | null> {
  const snapshot = await getDoc(doc(getClientDb(), PROJECTS_COLLECTION, id));
  if (!snapshot.exists()) return null;
  return mapProject(snapshot.id, snapshot.data());
}

export async function isProjectSlugTaken(slug: string, excludeId?: string) {
  const snapshot = await getDocs(
    query(
      collection(getClientDb(), PROJECTS_COLLECTION),
      where("slug", "==", slug),
    ),
  );
  return snapshot.docs.some((item) => item.id !== excludeId);
}

export async function createProject(data: ProjectFormData): Promise<Project> {
  const payload = writePayload(data);
  const now = new Date().toISOString();
  const ref = await addDoc(collection(getClientDb(), PROJECTS_COLLECTION), {
    ...payload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return { id: ref.id, ...payload, createdAt: now, updatedAt: now };
}

export async function updateProject(
  id: string,
  data: ProjectFormData,
): Promise<void> {
  await updateDoc(doc(getClientDb(), PROJECTS_COLLECTION, id), {
    ...writePayload(data),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteProject(id: string): Promise<void> {
  await deleteDoc(doc(getClientDb(), PROJECTS_COLLECTION, id));
}
