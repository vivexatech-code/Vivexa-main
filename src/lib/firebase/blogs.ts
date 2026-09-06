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
import { BLOGS_COLLECTION } from "@/lib/constants";
import { slugify } from "@/lib/slug";
import type { BlogFormData, BlogPost, BlogStatus } from "@/types/blog";

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

function mapBlog(id: string, data: Record<string, unknown>): BlogPost {
  return {
    id,
    title: String(data.title ?? ""),
    slug: String(data.slug ?? id),
    excerpt: String(data.excerpt ?? ""),
    featuredImage: String(data.featuredImage ?? ""),
    featuredImageAlt: String(data.featuredImageAlt ?? ""),
    category: String(data.category ?? "Process"),
    tags: asList(data.tags),
    author: String(data.author ?? "Vivexa Tech"),
    content: String(data.content ?? ""),
    status: data.status === "published" ? "published" : "draft",
    publishedAt: toIso(data.publishedAt).slice(0, 10),
    seoTitle: String(data.seoTitle ?? ""),
    seoDescription: String(data.seoDescription ?? ""),
    focusKeyword: String(data.focusKeyword ?? ""),
    canonicalUrl: String(data.canonicalUrl ?? ""),
    createdAt: toIso(data.createdAt) || new Date().toISOString(),
    updatedAt: toIso(data.updatedAt) || new Date().toISOString(),
  };
}

function writePayload(data: BlogFormData) {
  const status: BlogStatus = data.status === "published" ? "published" : "draft";
  const publishedAt =
    status === "published"
      ? data.publishedAt.trim() || new Date().toISOString().slice(0, 10)
      : data.publishedAt.trim();

  return {
    title: data.title.trim(),
    slug: slugify(data.slug || data.title),
    excerpt: data.excerpt.trim(),
    featuredImage: data.featuredImage.trim(),
    featuredImageAlt: data.featuredImageAlt.trim(),
    category: data.category.trim() || "Process",
    tags: data.tags.map((tag) => tag.trim()).filter(Boolean).slice(0, 8),
    author: data.author.trim() || "Vivexa Tech",
    content: data.content,
    status,
    publishedAt,
    seoTitle: data.seoTitle.trim(),
    seoDescription: data.seoDescription.trim(),
    focusKeyword: data.focusKeyword.trim(),
    canonicalUrl: data.canonicalUrl.trim(),
  };
}

export async function getBlogs(): Promise<BlogPost[]> {
  const snapshot = await getDocs(collection(getClientDb(), BLOGS_COLLECTION));
  return snapshot.docs
    .map((item) => mapBlog(item.id, item.data()))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getBlogById(id: string): Promise<BlogPost | null> {
  const snapshot = await getDoc(doc(getClientDb(), BLOGS_COLLECTION, id));
  if (!snapshot.exists()) return null;
  return mapBlog(snapshot.id, snapshot.data());
}

export async function isBlogSlugTaken(slug: string, excludeId?: string) {
  const snapshot = await getDocs(
    query(collection(getClientDb(), BLOGS_COLLECTION), where("slug", "==", slug)),
  );
  return snapshot.docs.some((item) => item.id !== excludeId);
}

export async function createBlog(data: BlogFormData): Promise<BlogPost> {
  const payload = writePayload(data);
  const now = new Date().toISOString();
  const ref = await addDoc(collection(getClientDb(), BLOGS_COLLECTION), {
    ...payload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return { id: ref.id, ...payload, createdAt: now, updatedAt: now };
}

export async function updateBlog(id: string, data: BlogFormData): Promise<void> {
  await updateDoc(doc(getClientDb(), BLOGS_COLLECTION, id), {
    ...writePayload(data),
    updatedAt: serverTimestamp(),
  });
}

export async function updateBlogStatus(
  id: string,
  status: BlogStatus,
): Promise<void> {
  const payload: Record<string, unknown> = {
    status,
    updatedAt: serverTimestamp(),
  };
  if (status === "published") {
    payload.publishedAt = new Date().toISOString().slice(0, 10);
  }
  await updateDoc(doc(getClientDb(), BLOGS_COLLECTION, id), payload);
}

export async function deleteBlog(id: string): Promise<void> {
  await deleteDoc(doc(getClientDb(), BLOGS_COLLECTION, id));
}
