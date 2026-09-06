"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { PageTransition } from "@/components/layout/page-transition";
import { BlogForm } from "@/components/blogs/blog-form";
import { getBlogById, updateBlog } from "@/lib/firebase/blogs";
import type { BlogFormData, BlogPost } from "@/types/blog";

export default function EditBlogPage() {
  const params = useParams<{ id: string }>();
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void getBlogById(params.id)
      .then((data) => {
        if (!active) return;
        setBlog(data);
        if (!data) setError("Blog not found");
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load blog");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [params.id]);

  const handleSubmit = async (data: BlogFormData) => {
    await updateBlog(params.id, data);
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
        {error || "Blog not found"}
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Edit article
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{blog.title}</p>
        </div>
        <BlogForm mode="edit" initialData={blog} onSubmit={handleSubmit} />
      </div>
    </PageTransition>
  );
}
