import type { ContentStatus } from "./project";

export interface Service {
  id: string;
  slug: string;
  name: string;
  eyebrow: string;
  shortDescription: string;
  detailedDescription: string;
  image: string;
  category: string;
  features: string[];
  status: ContentStatus;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export type ServiceFormData = {
  name: string;
  slug: string;
  eyebrow: string;
  shortDescription: string;
  detailedDescription: string;
  image: string;
  category: string;
  features: string[];
  status: ContentStatus;
  sortOrder: number;
};
