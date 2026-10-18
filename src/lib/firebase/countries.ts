import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { getClientDb } from "./client";
import { COUNTRIES_COLLECTION } from "@/lib/constants";
import { slugify } from "@/lib/slug";
import type { Country, CountryFormData } from "@/types/country";

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

function mapCountry(id: string, data: Record<string, unknown>): Country {
  const hero = (data.hero as Record<string, unknown>) || {};
  const currency = (data.currency as Record<string, unknown>) || {};
  const pricing = (data.pricing as Record<string, unknown>) || {};
  const contactInfo = (data.contactInfo as Record<string, unknown>) || {};
  const googleReviews = (data.googleReviews as Record<string, unknown>) || {};
  const seo = (data.seo as Record<string, unknown>) || {};

  const highlights = Array.isArray(hero.highlights)
    ? hero.highlights.map((h: Record<string, unknown>) => ({
        label: cleanString(h?.label),
        value: cleanString(h?.value),
      }))
    : [];

  const budgetOptions = Array.isArray(pricing.budgetOptions)
    ? pricing.budgetOptions.map((b) => cleanString(b)).filter(Boolean)
    : [];

  const officeAddress = Array.isArray(contactInfo.officeAddress)
    ? contactInfo.officeAddress.map((a) => cleanString(a)).filter(Boolean)
    : [];

  const keywords = Array.isArray(seo.keywords)
    ? seo.keywords.map((k) => cleanString(k)).filter(Boolean)
    : [];

  const slug = cleanString(data.slug, id).toLowerCase();
  const isDefault = Boolean(data.isDefault || slug === "in");

  return {
    id,
    slug,
    name: cleanString(data.name, "Untitled Country"),
    code: cleanString(data.code, "IN").toUpperCase(),
    flag: cleanString(data.flag, "🌐"),
    flagImage: cleanString(data.flagImage),
    image: cleanString(data.image),
    shortDescription: cleanString(data.shortDescription),
    status: data.status === "draft" ? "draft" : "published",
    isDefault,
    showOnHomepage: data.showOnHomepage !== false,
    sortOrder: Number.isFinite(data.sortOrder) ? Number(data.sortOrder) : 0,
    destinationUrl: cleanString(data.destinationUrl, isDefault ? "/" : `/${slug}`),
    hero: {
      eyebrow: cleanString(hero.eyebrow),
      title: cleanString(hero.title),
      titleHighlight: cleanString(hero.titleHighlight),
      description: cleanString(hero.description),
      primaryCtaLabel: cleanString(hero.primaryCtaLabel, "Book strategy call"),
      primaryCtaLink: cleanString(hero.primaryCtaLink, "/contact"),
      secondaryCtaLabel: cleanString(hero.secondaryCtaLabel, "View selected work"),
      secondaryCtaLink: cleanString(hero.secondaryCtaLink, "#work"),
      highlights,
    },
    currency: {
      code: cleanString(currency.code, "INR").toUpperCase(),
      symbol: cleanString(currency.symbol, "₹"),
      name: cleanString(currency.name, "Indian Rupee"),
    },
    pricing: {
      budgetOptions,
      samplePricingNote: cleanString(pricing.samplePricingNote),
    },
    contactInfo: {
      phoneDisplay: cleanString(contactInfo.phoneDisplay),
      phoneHref: cleanString(contactInfo.phoneHref),
      email: cleanString(contactInfo.email, "info@vivexatech.in"),
      emailHref: cleanString(contactInfo.emailHref, "mailto:info@vivexatech.in"),
      officeAddress,
      mapsUrl: cleanString(contactInfo.mapsUrl),
      mapsLabel: cleanString(contactInfo.mapsLabel, "Get directions"),
      serviceNote: cleanString(contactInfo.serviceNote),
    },
    googleReviews: {
      enabled: Boolean(googleReviews.enabled),
      profileName: cleanString(googleReviews.profileName),
      placeId: cleanString(googleReviews.placeId),
      rating: Number.isFinite(googleReviews.rating) ? Number(googleReviews.rating) : 5.0,
      reviewCount: Number.isFinite(googleReviews.reviewCount) ? Number(googleReviews.reviewCount) : 0,
      reviewDestinationUrl: cleanString(googleReviews.reviewDestinationUrl),
      displayLabel: cleanString(googleReviews.displayLabel),
      note: cleanString(googleReviews.note),
      isCompanyFallback: Boolean(googleReviews.isCompanyFallback),
    },
    seo: {
      metaTitle: cleanString(seo.metaTitle),
      metaDescription: cleanString(seo.metaDescription),
      ogImage: cleanString(seo.ogImage),
      keywords,
    },
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
  };
}

function writePayload(data: CountryFormData) {
  const slug = slugify(data.slug || data.name).toLowerCase();
  const isDefault = Boolean(data.isDefault || slug === "in");

  return {
    slug,
    name: data.name.trim(),
    code: (data.code || "IN").trim().toUpperCase(),
    flag: (data.flag || "🌐").trim(),
    flagImage: (data.flagImage || "").trim(),
    image: (data.image || "").trim(),
    shortDescription: data.shortDescription.trim(),
    status: data.status,
    isDefault,
    showOnHomepage: Boolean(data.showOnHomepage),
    sortOrder: Number.isFinite(data.sortOrder) ? Number(data.sortOrder) : 0,
    destinationUrl: isDefault ? "/" : (data.destinationUrl || `/${slug}`).trim(),
    hero: {
      eyebrow: data.hero.eyebrow.trim(),
      title: data.hero.title.trim(),
      titleHighlight: data.hero.titleHighlight.trim(),
      description: data.hero.description.trim(),
      primaryCtaLabel: data.hero.primaryCtaLabel.trim(),
      primaryCtaLink: data.hero.primaryCtaLink.trim(),
      secondaryCtaLabel: data.hero.secondaryCtaLabel.trim(),
      secondaryCtaLink: data.hero.secondaryCtaLink.trim(),
      highlights: (data.hero.highlights || []).map((h) => ({
        label: h.label.trim(),
        value: h.value.trim(),
      })),
    },
    currency: {
      code: (data.currency.code || "USD").trim().toUpperCase(),
      symbol: (data.currency.symbol || "$").trim(),
      name: data.currency.name.trim(),
    },
    pricing: {
      budgetOptions: (data.pricing.budgetOptions || []).map((b) => b.trim()).filter(Boolean),
      samplePricingNote: (data.pricing.samplePricingNote || "").trim(),
    },
    contactInfo: {
      phoneDisplay: (data.contactInfo.phoneDisplay || "").trim(),
      phoneHref: (data.contactInfo.phoneHref || "").trim(),
      email: (data.contactInfo.email || "").trim(),
      emailHref: (data.contactInfo.emailHref || "").trim(),
      officeAddress: (data.contactInfo.officeAddress || []).map((a) => a.trim()).filter(Boolean),
      mapsUrl: (data.contactInfo.mapsUrl || "").trim(),
      mapsLabel: (data.contactInfo.mapsLabel || "").trim(),
      serviceNote: (data.contactInfo.serviceNote || "").trim(),
    },
    googleReviews: {
      enabled: Boolean(data.googleReviews.enabled),
      profileName: (data.googleReviews.profileName || "").trim(),
      placeId: (data.googleReviews.placeId || "").trim(),
      rating: Number(data.googleReviews.rating) || 5.0,
      reviewCount: Number(data.googleReviews.reviewCount) || 0,
      reviewDestinationUrl: (data.googleReviews.reviewDestinationUrl || "").trim(),
      displayLabel: (data.googleReviews.displayLabel || "").trim(),
      note: (data.googleReviews.note || "").trim(),
      isCompanyFallback: Boolean(data.googleReviews.isCompanyFallback),
    },
    seo: {
      metaTitle: (data.seo.metaTitle || "").trim(),
      metaDescription: (data.seo.metaDescription || "").trim(),
      ogImage: (data.seo.ogImage || "").trim(),
      keywords: (data.seo.keywords || []).map((k) => k.trim()).filter(Boolean),
    },
  };
}

export async function getCountries(): Promise<Country[]> {
  const snapshot = await getDocs(collection(getClientDb(), COUNTRIES_COLLECTION));
  return snapshot.docs
    .map((item) => mapCountry(item.id, item.data() as Record<string, unknown>))
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
}

export async function getCountryById(id: string): Promise<Country | null> {
  const snapshot = await getDoc(doc(getClientDb(), COUNTRIES_COLLECTION, id));
  if (!snapshot.exists()) return null;
  return mapCountry(snapshot.id, snapshot.data() as Record<string, unknown>);
}

export async function isCountrySlugTaken(slug: string, excludeId?: string): Promise<boolean> {
  const snapshot = await getDocs(
    query(
      collection(getClientDb(), COUNTRIES_COLLECTION),
      where("slug", "==", slug.toLowerCase()),
    ),
  );
  return snapshot.docs.some((item) => item.id !== excludeId);
}

export async function createCountry(data: CountryFormData): Promise<Country> {
  const payload = writePayload(data);
  const now = new Date().toISOString();
  // Use slug as doc ID or addDoc
  const docRef = doc(collection(getClientDb(), COUNTRIES_COLLECTION), payload.slug);
  await setDoc(docRef, {
    ...payload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return { id: docRef.id, ...payload, createdAt: now, updatedAt: now };
}

export async function updateCountry(id: string, data: CountryFormData): Promise<void> {
  await updateDoc(doc(getClientDb(), COUNTRIES_COLLECTION, id), {
    ...writePayload(data),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteCountry(id: string): Promise<void> {
  await deleteDoc(doc(getClientDb(), COUNTRIES_COLLECTION, id));
}
