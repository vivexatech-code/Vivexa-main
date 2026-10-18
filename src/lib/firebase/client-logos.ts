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
import { CLIENT_LOGOS_COLLECTION } from "@/lib/constants";
import type { ClientLogo, ClientLogoFormData } from "@/types/client-logo";

function toIso(value: unknown): string {
  if (!value) return new Date().toISOString();
  if (typeof value === "string") return value;
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  return new Date().toISOString();
}

function cleanString(val: unknown, fallback = ""): string {
  return typeof val === "string" ? val.trim() : fallback;
}

function mapClientLogo(id: string, data: Record<string, unknown>): ClientLogo {
  const countries = Array.isArray(data.countries)
    ? data.countries.map((c) => cleanString(c)).filter(Boolean)
    : [];

  return {
    id,
    name: cleanString(data.name, "Client Logo"),
    logoUrl: cleanString(data.logoUrl),
    altText: cleanString(data.altText, `${cleanString(data.name)} logo`),
    websiteUrl: cleanString(data.websiteUrl),
    status: data.status === "draft" ? "draft" : "published",
    sortOrder: Number.isFinite(data.sortOrder) ? Number(data.sortOrder) : 0,
    isGlobal: data.isGlobal !== false,
    countries,
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
  };
}

function writePayload(data: ClientLogoFormData) {
  return {
    name: data.name.trim(),
    logoUrl: data.logoUrl.trim(),
    altText: (data.altText || `${data.name.trim()} logo`).trim(),
    websiteUrl: (data.websiteUrl || "").trim(),
    status: data.status,
    sortOrder: Number.isFinite(data.sortOrder) ? Number(data.sortOrder) : 0,
    isGlobal: Boolean(data.isGlobal),
    countries: (data.countries || []).map((c) => c.trim().toLowerCase()).filter(Boolean),
  };
}

export async function getClientLogos(): Promise<ClientLogo[]> {
  const snapshot = await getDocs(collection(getClientDb(), CLIENT_LOGOS_COLLECTION));
  return snapshot.docs
    .map((item) => mapClientLogo(item.id, item.data() as Record<string, unknown>))
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
}

export async function getClientLogoById(id: string): Promise<ClientLogo | null> {
  const snapshot = await getDoc(doc(getClientDb(), CLIENT_LOGOS_COLLECTION, id));
  if (!snapshot.exists()) return null;
  return mapClientLogo(snapshot.id, snapshot.data() as Record<string, unknown>);
}

export async function createClientLogo(data: ClientLogoFormData): Promise<ClientLogo> {
  const payload = writePayload(data);
  const now = new Date().toISOString();
  const ref = await addDoc(collection(getClientDb(), CLIENT_LOGOS_COLLECTION), {
    ...payload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return { id: ref.id, ...payload, createdAt: now, updatedAt: now };
}

export async function updateClientLogo(
  id: string,
  data: ClientLogoFormData,
): Promise<void> {
  await updateDoc(doc(getClientDb(), CLIENT_LOGOS_COLLECTION, id), {
    ...writePayload(data),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteClientLogo(id: string): Promise<void> {
  await deleteDoc(doc(getClientDb(), CLIENT_LOGOS_COLLECTION, id));
}
