import type { ContentStatus } from "./project";

export interface ClientLogo {
  id: string;
  name: string;
  logoUrl: string;
  altText: string;
  websiteUrl?: string;
  status: ContentStatus; // "published" | "draft"
  sortOrder: number;
  isGlobal: boolean; // true = display on all country sites
  countries: string[]; // specific country slugs if not global
  createdAt: string;
  updatedAt: string;
}

export type ClientLogoFormData = Omit<ClientLogo, "id" | "createdAt" | "updatedAt">;
