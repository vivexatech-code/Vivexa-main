"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ImageUpload } from "@/components/shared/image-upload";
import { TagInput } from "@/components/shared/tag-input";
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
import { PROJECT_CATEGORIES } from "@/lib/constants";
import { slugify } from "@/lib/slug";
import { isProjectSlugTaken } from "@/lib/firebase/projects";
import type { Project, ProjectFormData } from "@/types/project";

const schema = z.object({
  name: z.string().min(2, "Project name is required"),
  slug: z.string().min(2, "Slug is required"),
  description: z.string().min(12, "Add a short description"),
  location: z.string().min(2, "Location is required"),
  country: z.string().min(2, "Country is required"),
  growth: z.string().min(1, "Growth is required"),
  focus: z.string().min(1, "Focus is required"),
  target: z.string().min(1, "Target is required"),
  websiteUrl: z
    .string()
    .trim()
    .refine(
      (value) => !value || /^https?:\/\//i.test(value),
      "Use a full URL starting with http:// or https://",
    ),
  image: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  status: z.enum(["published", "draft"]),
});

type FormValues = z.infer<typeof schema>;

type ProjectFormProps = {
  mode: "create" | "edit";
  initialData?: Project;
  onSubmit: (data: ProjectFormData) => Promise<void>;
};

export function ProjectForm({ mode, initialData, onSubmit }: ProjectFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [tags, setTags] = useState<string[]>(initialData?.tags ?? []);
  const [slugTouched, setSlugTouched] = useState(mode === "edit");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialData?.name ?? "",
      slug: initialData?.slug ?? "",
      description: initialData?.description ?? "",
      location: initialData?.location ?? "",
      country: initialData?.country ?? "India",
      growth: initialData?.growth ?? "",
      focus: initialData?.focus ?? "",
      target: initialData?.target ?? "",
      websiteUrl: initialData?.websiteUrl ?? "",
      image: initialData?.image ?? "",
      category: initialData?.category ?? "Website",
      status: initialData?.status ?? "published",
    },
  });

  const image = watch("image") ?? "";
  const category = watch("category");
  const status = watch("status");
  const name = watch("name");

  const submit = handleSubmit(async (values) => {
    if (tags.length !== 3) {
      toast.error("Add exactly 3 tags");
      return;
    }
    if (values.status === "published" && !values.image) {
      toast.error("Published projects need an image or stay as a draft");
    }

    const slug = slugify(values.slug || values.name);
    setSaving(true);
    try {
      if (await isProjectSlugTaken(slug, initialData?.id)) {
        toast.error("That slug is already used by another project");
        return;
      }
      await onSubmit({
        ...values,
        slug,
        image: values.image ?? "",
        tags,
      });
      toast.success(mode === "create" ? "Project created" : "Project updated");
      router.push("/projects");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed");
    } finally {
      setSaving(false);
    }
  });

  return (
    <form onSubmit={submit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Project details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <ImageUpload
            value={image}
            onChange={(url) => setValue("image", url, { shouldValidate: true })}
            folder="projects"
            label="Project image"
            hint="Wide 16:9 works best. JPG, PNG, or WebP up to 5MB."
          />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Project name</Label>
              <Input
                id="name"
                {...register("name", {
                  onChange: (event) => {
                    if (!slugTouched) {
                      setValue("slug", slugify(event.target.value), {
                        shouldValidate: true,
                      });
                    }
                  },
                })}
              />
              {errors.name ? (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">URL slug</Label>
              <Input
                id="slug"
                {...register("slug", {
                  onChange: () => setSlugTouched(true),
                })}
              />
              {errors.slug ? (
                <p className="text-sm text-destructive">{errors.slug.message}</p>
              ) : null}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={5} {...register("description")} />
            {errors.description ? (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            ) : null}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" {...register("location")} />
              {errors.location ? (
                <p className="text-sm text-destructive">
                  {errors.location.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input id="country" {...register("country")} />
              {errors.country ? (
                <p className="text-sm text-destructive">
                  {errors.country.message}
                </p>
              ) : null}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="growth">Growth</Label>
              <Input
                id="growth"
                placeholder="Shown on the website"
                {...register("growth")}
              />
              {errors.growth ? (
                <p className="text-sm text-destructive">{errors.growth.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="focus">Focus</Label>
              <Input
                id="focus"
                placeholder="Shown on the website"
                {...register("focus")}
              />
              {errors.focus ? (
                <p className="text-sm text-destructive">{errors.focus.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="target">Target</Label>
              <Input
                id="target"
                placeholder="Shown on the website"
                {...register("target")}
              />
              {errors.target ? (
                <p className="text-sm text-destructive">{errors.target.message}</p>
              ) : null}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="websiteUrl">Project / website link</Label>
            <Input
              id="websiteUrl"
              placeholder="https://"
              {...register("websiteUrl")}
            />
            {errors.websiteUrl ? (
              <p className="text-sm text-destructive">
                {errors.websiteUrl.message}
              </p>
            ) : null}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={category}
                onValueChange={(value) =>
                  setValue("category", value, { shouldValidate: true })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_CATEGORIES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Display status</Label>
              <Select
                value={status}
                onValueChange={(value) =>
                  setValue("status", value as FormValues["status"], {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">Published on website</SelectItem>
                  <SelectItem value="draft">Draft (hidden)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Tags</Label>
            <TagInput value={tags} onChange={setTags} max={3} />
            <p className="sr-only">{name}</p>
          </div>
        </CardContent>
      </Card>
      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {mode === "create" ? "Create project" : "Save changes"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/projects")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
