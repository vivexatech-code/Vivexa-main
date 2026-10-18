import type { ContentStatus } from "./project";

export interface CountryHeroHighlight {
  label: string;
  value: string;
}

export interface CountryHero {
  eyebrow: string;
  title: string;
  titleHighlight: string;
  description: string;
  primaryCtaLabel: string;
  primaryCtaLink: string;
  secondaryCtaLabel: string;
  secondaryCtaLink: string;
  highlights: CountryHeroHighlight[];
}

export interface CountryCurrency {
  code: string; // e.g. "GBP", "USD", "INR", "CAD", "AUD"
  symbol: string; // e.g. "£", "$", "₹", "C$", "A$"
  name: string; // e.g. "British Pound"
}

export interface CountryPricing {
  budgetOptions: string[];
  samplePricingNote: string;
}

export interface CountryContactInfo {
  phoneDisplay: string;
  phoneHref: string;
  email: string;
  emailHref: string;
  officeAddress: string[];
  mapsUrl: string;
  mapsLabel: string;
  serviceNote: string;
}

export interface CountryGoogleReviews {
  enabled: boolean;
  profileName: string;
  placeId: string;
  rating: number;
  reviewCount: number;
  reviewDestinationUrl: string;
  displayLabel: string;
  note: string;
  isCompanyFallback: boolean;
}

export interface CountrySeo {
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
  keywords: string[];
}

export interface CountryPageOverrides {
  about?: {
    eyebrow?: string;
    title?: string;
    description?: string;
    storyHeading?: string;
  };
  contact?: {
    eyebrow?: string;
    title?: string;
    description?: string;
    directNote?: string;
  };
  services?: {
    eyebrow?: string;
    title?: string;
    description?: string;
  };
  faq?: {
    eyebrow?: string;
    title?: string;
    description?: string;
  };
}

export interface Country {
  id: string;
  slug: string; // e.g. "uk", "us", "ca", "au", "in"
  name: string; // e.g. "United Kingdom"
  code: string; // e.g. "GB", "US", "CA", "AU", "IN" (ISO 2-letter for geo-detection)
  flag: string; // Emoji flag or icon e.g. "🇬🇧"
  flagImage?: string; // Optional custom flag image
  image?: string; // Optional landmark / skyline image
  shortDescription: string;
  status: ContentStatus; // "published" | "draft"
  isDefault: boolean; // true for India
  showOnHomepage: boolean; // whether to show in "Countries We Work With"
  sortOrder: number;
  destinationUrl: string; // e.g. "/uk", "/us", "/" for India
  hero: CountryHero;
  currency: CountryCurrency;
  pricing: CountryPricing;
  contactInfo: CountryContactInfo;
  googleReviews: CountryGoogleReviews;
  seo: CountrySeo;
  pages?: CountryPageOverrides;
  createdAt: string;
  updatedAt: string;
}

export type CountryFormData = Omit<Country, "id" | "createdAt" | "updatedAt">;
