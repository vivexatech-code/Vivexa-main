"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createBlog,
  deleteBlog,
  getBlogs,
  updateBlog,
  updateBlogStatus,
} from "@/lib/firebase/blogs";
import type { BlogFormData, BlogPost, BlogStatus } from "@/types/blog";

export function useBlogs() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setBlogs(await getBlogs());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load blogs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addBlog = useCallback(async (data: BlogFormData) => {
    const created = await createBlog(data);
    setBlogs((prev) => [created, ...prev]);
    return created;
  }, []);

  const editBlog = useCallback(async (id: string, data: BlogFormData) => {
    await updateBlog(id, data);
    setBlogs((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, ...data, updatedAt: new Date().toISOString() }
          : item,
      ),
    );
  }, []);

  const setBlogStatus = useCallback(async (id: string, status: BlogStatus) => {
    await updateBlogStatus(id, status);
    setBlogs((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status,
              publishedAt:
                status === "published"
                  ? item.publishedAt || new Date().toISOString().slice(0, 10)
                  : item.publishedAt,
              updatedAt: new Date().toISOString(),
            }
          : item,
      ),
    );
  }, []);

  const removeBlog = useCallback(async (id: string) => {
    await deleteBlog(id);
    setBlogs((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return {
    blogs,
    loading,
    error,
    refresh,
    addBlog,
    editBlog,
    setBlogStatus,
    removeBlog,
  };
}
