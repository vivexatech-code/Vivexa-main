export type ContentStatus = "published" | "draft";

export interface Project {
  id: string;
  slug: string;
  name: string;
  description: string;
  location: string;
  country: string;
  growth: string;
  focus: string;
  target: string;
  websiteUrl: string;
  tags: string[];
  image: string;
  category: string;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
}

export type ProjectFormData = {
  name: string;
  slug: string;
  description: string;
  location: string;
  country: string;
  growth: string;
  focus: string;
  target: string;
  websiteUrl: string;
  tags: string[];
  image: string;
  category: string;
  status: ContentStatus;
};
