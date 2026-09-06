"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { ImageUpload } from "@/components/shared/image-upload";
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
import { SERVICE_CATEGORIES } from "@/lib/constants";
import { slugify } from "@/lib/slug";
import { isServiceSlugTaken } from "@/lib/firebase/services";
import type { Service, ServiceFormData } from "@/types/service";

const schema = z.object({
  name: z.string().min(2, "Service name is required"),
  slug: z.string().min(2, "Slug is required"),
  eyebrow: z.string().min(2, "Eyebrow is required"),
  shortDescription: z.string().min(12, "Add a short description"),
  detailedDescription: z.string().min(24, "Add a detailed description"),
  image: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  status: z.enum(["published", "draft"]),
  sortOrder: z.coerce.number().int().min(0),
});

type FormValues = z.infer<typeof schema>;

type ServiceFormProps = {
  mode: "create" | "edit";
  initialData?: Service;
  onSubmit: (data: ServiceFormData) => Promise<void>;
};

export function ServiceForm({ mode, initialData, onSubmit }: ServiceFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [features, setFeatures] = useState<string[]>(
    initialData?.features?.length ? initialData.features : [""],
  );
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
      eyebrow: initialData?.eyebrow ?? "Core service",
      shortDescription: initialData?.shortDescription ?? "",
      detailedDescription: initialData?.detailedDescription ?? "",
      image: initialData?.image ?? "",
      category: initialData?.category ?? "Core Services",
      status: initialData?.status ?? "published",
      sortOrder: initialData?.sortOrder ?? 0,
    },
  });

  const image = watch("image") ?? "";
  const category = watch("category");
  const status = watch("status");

  const submit = handleSubmit(async (values) => {
    const cleanFeatures = features.map((item) => item.trim()).filter(Boolean);
    if (cleanFeatures.length === 0) {
      toast.error("Add at least one key feature");
      return;
    }

    const slug = slugify(values.slug || values.name);
    setSaving(true);
    try {
      if (await isServiceSlugTaken(slug, initialData?.id)) {
        toast.error("That slug is already used by another service");
        return;
      }
      await onSubmit({
        ...values,
        slug,
        image: values.image ?? "",
        features: cleanFeatures,
      });
      toast.success(mode === "create" ? "Service created" : "Service updated");
      router.push("/services");
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
          <CardTitle>Service details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <ImageUpload
            value={image}
            onChange={(url) => setValue("image", url, { shouldValidate: true })}
            folder="services"
            label="Service image or icon"
            hint="Optional. Square or wide images both work."
          />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Service name</Label>
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
                {...register("slug", { onChange: () => setSlugTouched(true) })}
              />
              {errors.slug ? (
                <p className="text-sm text-destructive">{errors.slug.message}</p>
              ) : null}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="eyebrow">Eyebrow</Label>
              <Input id="eyebrow" {...register("eyebrow")} />
              {errors.eyebrow ? (
                <p className="text-sm text-destructive">
                  {errors.eyebrow.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="sortOrder">Display order</Label>
              <Input id="sortOrder" type="number" min={0} {...register("sortOrder")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="shortDescription">Short description</Label>
            <Textarea id="shortDescription" rows={3} {...register("shortDescription")} />
            {errors.shortDescription ? (
              <p className="text-sm text-destructive">
                {errors.shortDescription.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="detailedDescription">Detailed description</Label>
            <Textarea
              id="detailedDescription"
              rows={7}
              {...register("detailedDescription")}
            />
            {errors.detailedDescription ? (
              <p className="text-sm text-destructive">
                {errors.detailedDescription.message}
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
                  {SERVICE_CATEGORIES.map((item) => (
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
          <div className="space-y-3">
            <Label>Key features</Label>
            {features.map((feature, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={feature}
                  onChange={(event) => {
                    const next = [...features];
                    next[index] = event.target.value;
                    setFeatures(next);
                  }}
                  placeholder={`Feature ${index + 1}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setFeatures(features.filter((_, i) => i !== index))
                  }
                  disabled={features.length <= 1}
                  aria-label="Remove feature"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setFeatures([...features, ""])}
            >
              <Plus className="h-4 w-4" />
              Add feature
            </Button>
          </div>
        </CardContent>
      </Card>
      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {mode === "create" ? "Create service" : "Save changes"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/services")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
