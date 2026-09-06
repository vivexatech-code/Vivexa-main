"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { PageTransition } from "@/components/layout/page-transition";
import { BlogTable } from "@/components/blogs/blog-table";
import { TableSkeleton } from "@/components/shared/skeletons";
import { Button } from "@/components/ui/button";
import { useBlogs } from "@/hooks/use-blogs";
import { createBlog, isBlogSlugTaken } from "@/lib/firebase/blogs";
import { starterBlogs } from "@/lib/seed-blogs";

export default function BlogsPage() {
  const { blogs, loading, error, removeBlog, setBlogStatus, refresh } =
    useBlogs();
  const [seeding, setSeeding] = useState(false);

  const importStarter = async () => {
    setSeeding(true);
    try {
      let created = 0;
      for (const blog of starterBlogs) {
        if (await isBlogSlugTaken(blog.slug)) continue;
        await createBlog(blog);
        created += 1;
      }
      await refresh();
      toast.success(
        created
          ? `Imported ${created} starter article${created === 1 ? "" : "s"}`
          : "Starter articles already exist",
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import failed");
    } finally {
      setSeeding(false);
    }
  };

  return (
    <PageTransition>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight">
              Blog Management
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Draft, preview, and publish articles for vivexatech.in
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={importStarter} disabled={seeding}>
              {seeding ? "Importing…" : "Import starter articles"}
            </Button>
            <Button asChild>
              <Link href="/blogs/new">
                <Plus className="h-4 w-4" />
                Write article
              </Link>
            </Button>
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        {loading ? (
          <TableSkeleton />
        ) : (
          <BlogTable
            blogs={blogs}
            onDelete={removeBlog}
            onStatusChange={setBlogStatus}
          />
        )}
      </div>
    </PageTransition>
  );
}
