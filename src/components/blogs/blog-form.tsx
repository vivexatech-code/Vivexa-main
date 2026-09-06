"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ImageUpload } from "@/components/shared/image-upload";
import { TagInput } from "@/components/shared/tag-input";
import { RichTextEditor } from "@/components/blogs/rich-text-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BLOG_CATEGORIES } from "@/lib/constants";
import { slugify } from "@/lib/slug";
import { isBlogSlugTaken } from "@/lib/firebase/blogs";
import type { BlogFormData, BlogPost } from "@/types/blog";

const schema = z.object({
  title: z.string().min(4, "Title is required"),
  slug: z.string().min(2, "Slug is required"),
  excerpt: z.string().min(12, "Add a short excerpt"),
  featuredImage: z.string().optional(),
  featuredImageAlt: z.string().optional(),
  category: z.string().min(1),
  author: z.string().min(2, "Author is required"),
  publishedAt: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  focusKeyword: z.string().optional(),
  canonicalUrl: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type BlogFormProps = {
  mode: "create" | "edit";
  initialData?: BlogPost;
  onSubmit: (data: BlogFormData) => Promise<void>;
};

export function BlogForm({ mode, initialData, onSubmit }: BlogFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState<"draft" | "published" | null>(null);
  const [content, setContent] = useState(initialData?.content ?? "<p></p>");
  const [tags, setTags] = useState<string[]>(initialData?.tags ?? []);
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [dirty, setDirty] = useState(false);
  const draftKey = useMemo(
    () => `vivexa-blog-draft-${initialData?.id ?? "new"}`,
    [initialData?.id],
  );
  const skipDirty = useRef(true);

  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initialData?.title ?? "",
      slug: initialData?.slug ?? "",
      excerpt: initialData?.excerpt ?? "",
      featuredImage: initialData?.featuredImage ?? "",
      featuredImageAlt: initialData?.featuredImageAlt ?? "",
      category: initialData?.category ?? "Process",
      author: initialData?.author ?? "Vivexa Tech",
      publishedAt: initialData?.publishedAt ?? "",
      seoTitle: initialData?.seoTitle ?? "",
      seoDescription: initialData?.seoDescription ?? "",
      focusKeyword: initialData?.focusKeyword ?? "",
      canonicalUrl: initialData?.canonicalUrl ?? "",
    },
  });

  const title = watch("title");
  const slug = watch("slug");
  const category = watch("category");
  const featuredImage = watch("featuredImage") ?? "";
  const excerpt = watch("excerpt");

  useEffect(() => {
    if (!slugTouched) {
      setValue("slug", slugify(title));
    }
  }, [title, slugTouched, setValue]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (!raw || initialData) return;
      const saved = JSON.parse(raw) as { values?: FormValues; content?: string; tags?: string[] };
      if (saved.values) {
        Object.entries(saved.values).forEach(([key, value]) => {
          setValue(key as keyof FormValues, value ?? "");
        });
      }
      if (saved.content) setContent(saved.content);
      if (saved.tags) setTags(saved.tags);
    } catch {
      /* ignore */
    }
  }, [draftKey, initialData, setValue]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const payload = {
        values: watch(),
        content,
        tags,
      };
      localStorage.setItem(draftKey, JSON.stringify(payload));
    }, 8000);
    return () => window.clearInterval(timer);
  }, [content, draftKey, tags, watch]);

  useEffect(() => {
    if (skipDirty.current) {
      skipDirty.current = false;
      return;
    }
    setDirty(true);
  }, [content, tags, title, excerpt]);

  useEffect(() => {
    const onLeave = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, [dirty]);

  const save = async (status: "draft" | "published") => {
    const values = watch();
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || "Please complete the required fields");
      return;
    }
    const textContent = content.replace(/<[^>]+>/g, "").trim();
    if (textContent.length < 20) {
      toast.error("Add more article content before saving");
      return;
    }
    const nextSlug = slugify(parsed.data.slug || parsed.data.title);
    if (await isBlogSlugTaken(nextSlug, initialData?.id)) {
      toast.error("That slug is already in use");
      return;
    }

    setSaving(status);
    try {
      await onSubmit({
        title: parsed.data.title,
        slug: nextSlug,
        excerpt: parsed.data.excerpt,
        featuredImage: parsed.data.featuredImage ?? "",
        featuredImageAlt: parsed.data.featuredImageAlt ?? "",
        category: parsed.data.category,
        tags,
        author: parsed.data.author,
        content,
        status,
        publishedAt: parsed.data.publishedAt ?? "",
        seoTitle: parsed.data.seoTitle ?? "",
        seoDescription: parsed.data.seoDescription ?? "",
        focusKeyword: parsed.data.focusKeyword ?? "",
        canonicalUrl: parsed.data.canonicalUrl ?? "",
      });
      localStorage.removeItem(draftKey);
      setDirty(false);
      toast.success(status === "published" ? "Blog published" : "Draft saved");
      router.push("/blogs");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed");
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Article</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register("title")} />
            {errors.title ? (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            ) : null}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                {...register("slug")}
                onChange={(event) => {
                  setSlugTouched(true);
                  setValue("slug", slugify(event.target.value), {
                    shouldValidate: true,
                  });
                }}
              />
              {errors.slug ? (
                <p className="text-sm text-destructive">{errors.slug.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={category}
                onValueChange={(value) => setValue("category", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BLOG_CATEGORIES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Input id="author" {...register("author")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="publishedAt">Publish date</Label>
              <Input id="publishedAt" type="date" {...register("publishedAt")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="excerpt">Short excerpt</Label>
            <Textarea id="excerpt" rows={3} {...register("excerpt")} />
            {errors.excerpt ? (
              <p className="text-sm text-destructive">{errors.excerpt.message}</p>
            ) : null}
          </div>
          <TagInput value={tags} onChange={setTags} max={8} placeholder="Add a tag" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Featured image</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ImageUpload
            value={featuredImage}
            onChange={(url) => setValue("featuredImage", url)}
            folder="blogs"
            label="Featured image"
          />
          <div className="space-y-2">
            <Label htmlFor="featuredImageAlt">Alt text</Label>
            <Input id="featuredImageAlt" {...register("featuredImageAlt")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Content</CardTitle>
        </CardHeader>
        <CardContent>
          <RichTextEditor value={content} onChange={setContent} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SEO</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="seoTitle">SEO title</Label>
            <Input id="seoTitle" placeholder={title} {...register("seoTitle")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="seoDescription">Meta description</Label>
            <Textarea
              id="seoDescription"
              rows={3}
              placeholder={excerpt}
              {...register("seoDescription")}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="focusKeyword">Focus keyword</Label>
              <Input id="focusKeyword" {...register("focusKeyword")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="canonicalUrl">Canonical URL</Label>
              <Input
                id="canonicalUrl"
                placeholder={`/blog/${slug || "article-slug"}`}
                {...register("canonicalUrl")}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          disabled={!!saving}
          onClick={() => void save("published")}
        >
          {saving === "published" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {mode === "edit" && initialData?.status === "published"
            ? "Update"
            : "Publish"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={!!saving}
          onClick={() => void save("draft")}
        >
          {saving === "draft" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Save draft
        </Button>
        <Button type="button" variant="outline" onClick={() => setPreviewOpen(true)}>
          Preview
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            if (dirty && !window.confirm("Leave without saving?")) return;
            router.push("/blogs");
          }}
        >
          Cancel
        </Button>
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{title || "Untitled"}</DialogTitle>
            <DialogDescription>
              {category} · {watch("author")}
            </DialogDescription>
          </DialogHeader>
          {featuredImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={featuredImage}
              alt={watch("featuredImageAlt") || title}
              className="max-h-72 w-full rounded-xl object-cover"
            />
          ) : null}
          <p className="text-sm text-muted-foreground">{excerpt}</p>
          <div
            className="blog-editor-content"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
