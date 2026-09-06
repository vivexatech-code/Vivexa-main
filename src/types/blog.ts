export type BlogStatus = "draft" | "published";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage: string;
  featuredImageAlt: string;
  category: string;
  tags: string[];
  author: string;
  content: string;
  status: BlogStatus;
  publishedAt: string;
  seoTitle: string;
  seoDescription: string;
  focusKeyword: string;
  canonicalUrl: string;
  createdAt: string;
  updatedAt: string;
}

export type BlogFormData = Omit<BlogPost, "id" | "createdAt" | "updatedAt">;
