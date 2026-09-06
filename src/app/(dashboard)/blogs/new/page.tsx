"use client";

import { PageTransition } from "@/components/layout/page-transition";
import { BlogForm } from "@/components/blogs/blog-form";
import { createBlog } from "@/lib/firebase/blogs";
import type { BlogFormData } from "@/types/blog";

export default function NewBlogPage() {
  const handleSubmit = async (data: BlogFormData) => {
    await createBlog(data);
  };

  return (
    <PageTransition>
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Write article
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Save a draft or publish when the article is ready.
          </p>
        </div>
        <BlogForm mode="create" onSubmit={handleSubmit} />
      </div>
    </PageTransition>
  );
}
