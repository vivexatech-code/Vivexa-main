"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link as LinkIcon, Loader2, Upload, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { ImageUpload } from "@/components/shared/image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { ClientLogo, ClientLogoFormData } from "@/types/client-logo";

function isValidHttpUrl(string: string) {
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

const schema = z.object({
  name: z.string().min(2, "Client name is required"),
  logoUrl: z
    .string()
    .min(1, "Please upload or provide a logo image URL")
    .refine((url) => {
      const lower = url.trim().toLowerCase();
      if (lower.startsWith("javascript:") || lower.startsWith("data:") || lower.startsWith("vbscript:")) {
        return false;
      }
      return isValidHttpUrl(url);
    }, "Please enter a valid HTTP or HTTPS image URL (unsafe schemes are blocked)"),
  altText: z.string().min(2, "Alt text is required for accessibility"),
  websiteUrl: z
    .string()
    .optional()
    .refine((url) => {
      if (!url || url.trim() === "") return true;
      const lower = url.trim().toLowerCase();
      if (lower.startsWith("javascript:") || lower.startsWith("data:")) return false;
      return isValidHttpUrl(url);
    }, "Website URL must be a valid HTTP or HTTPS address"),
  status: z.enum(["published", "draft"]),
  sortOrder: z.coerce.number().int().min(0),
  isGlobal: z.boolean(),
  countriesInput: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type LogoFormProps = {
  mode: "create" | "edit";
  initialData?: ClientLogo;
  onSubmit: (data: ClientLogoFormData) => Promise<void>;
};

export function LogoForm({ mode, initialData, onSubmit }: LogoFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [urlPreviewError, setUrlPreviewError] = useState(false);

  // Determine initial input method: if logoUrl is from an external host, default to 'url', else 'upload'
  const isCloudinaryOrFirebase = (url?: string) =>
    url && (url.includes("res.cloudinary.com") || url.includes("firebasestorage.googleapis.com") || url.includes("storage.googleapis.com"));

  const [inputMethod, setInputMethod] = useState<"upload" | "url">(() => {
    if (!initialData?.logoUrl) return "upload";
    return isCloudinaryOrFirebase(initialData.logoUrl) ? "upload" : "url";
  });

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
      logoUrl: initialData?.logoUrl ?? "",
      altText: initialData?.altText ?? "",
      websiteUrl: initialData?.websiteUrl ?? "",
      status: initialData?.status ?? "published",
      sortOrder: initialData?.sortOrder ?? 0,
      isGlobal: initialData?.isGlobal ?? true,
      countriesInput: initialData?.countries?.join(", ") ?? "",
    },
  });

  const logoUrl = watch("logoUrl") ?? "";
  const status = watch("status");
  const isGlobal = watch("isGlobal");
  const clientName = watch("name");

  // Reset preview error whenever URL changes
  useEffect(() => {
    setUrlPreviewError(false);
  }, [logoUrl]);

  const submit = handleSubmit(async (values) => {
    setSaving(true);
    try {
      const countryList = (values.countriesInput || "")
        .split(",")
        .map((c) => c.trim().toLowerCase())
        .filter(Boolean);

      const payload: ClientLogoFormData = {
        name: values.name.trim(),
        logoUrl: values.logoUrl.trim(),
        altText: values.altText.trim() || `${values.name.trim()} logo`,
        websiteUrl: values.websiteUrl?.trim() ?? "",
        status: values.status,
        sortOrder: values.sortOrder,
        isGlobal: values.isGlobal,
        countries: values.isGlobal ? [] : countryList,
      };

      await onSubmit(payload);
      toast.success(mode === "create" ? "Client logo added" : "Client logo updated");
      router.push("/logos");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save logo");
    } finally {
      setSaving(false);
    }
  });

  return (
    <form onSubmit={submit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Client Logo Details</CardTitle>
          <CardDescription>
            This logo will be displayed dynamically in the &quot;Who We Work With&quot; marquee on the website.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Logo Input Method Switcher */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Logo Source</Label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setInputMethod("upload")}
                className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  inputMethod === "upload"
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border bg-background hover:bg-muted text-muted-foreground"
                }`}
              >
                <Upload className="h-4 w-4" />
                Option A: Upload Logo File
              </button>
              <button
                type="button"
                onClick={() => setInputMethod("url")}
                className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  inputMethod === "url"
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border bg-background hover:bg-muted text-muted-foreground"
                }`}
              >
                <LinkIcon className="h-4 w-4" />
                Option B: Enter Image URL
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              {inputMethod === "upload"
                ? "Upload an SVG, PNG, or WebP logo file directly into cloud storage."
                : "Paste a direct, publicly accessible HTTPS URL to the client's logo image."}
            </p>
          </div>

          {/* Option A: Upload */}
          {inputMethod === "upload" ? (
            <div className="space-y-2 rounded-xl border border-dashed border-border/80 bg-muted/20 p-4">
              <ImageUpload
                value={logoUrl}
                onChange={(url) => {
                  setValue("logoUrl", url, { shouldValidate: true });
                  if (!watch("altText") && clientName) {
                    setValue("altText", `${clientName} logo`);
                  }
                }}
                folder="logos"
                label="Upload Logo File"
                hint="SVG, PNG, or WebP with transparent background recommended. Up to 5MB."
              />
            </div>
          ) : (
            /* Option B: Image URL */
            <div className="space-y-4 rounded-xl border border-border bg-muted/20 p-4">
              <div className="space-y-2">
                <Label htmlFor="logoUrlInput">Direct Image URL</Label>
                <Input
                  id="logoUrlInput"
                  placeholder="https://example.com/assets/logo.svg or https://...png"
                  value={logoUrl}
                  onChange={(e) => {
                    const val = e.target.value.trim();
                    setValue("logoUrl", val, { shouldValidate: true });
                    if (!watch("altText") && clientName) {
                      setValue("altText", `${clientName} logo`);
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Must be a secure HTTPS or HTTP link to an image file (e.g. .svg, .png, .webp).
                </p>
              </div>

              {/* URL Preview */}
              {logoUrl ? (
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Image Preview
                  </span>
                  <div className="flex items-center justify-center rounded-lg border border-border bg-card p-6 min-h-[100px]">
                    {urlPreviewError ? (
                      <div className="flex items-center gap-2 text-sm text-destructive">
                        <AlertCircle className="h-4 w-4" />
                        <span>Could not load image from this URL. Please verify the URL is public and valid.</span>
                      </div>
                    ) : (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={logoUrl}
                        alt="Logo preview"
                        className="max-h-16 max-w-[200px] object-contain"
                        onError={() => setUrlPreviewError(true)}
                        onLoad={() => setUrlPreviewError(false)}
                      />
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {errors.logoUrl ? (
            <p className="text-sm text-destructive">{errors.logoUrl.message}</p>
          ) : null}

          {/* Client Name & Website */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Client / Company Name</Label>
              <Input
                id="name"
                placeholder="e.g. Acme Tech"
                {...register("name", {
                  onChange: (e) => {
                    if (!watch("altText")) {
                      setValue("altText", `${e.target.value} logo`);
                    }
                  },
                })}
              />
              {errors.name ? (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="websiteUrl">Client Website URL (Optional)</Label>
              <Input
                id="websiteUrl"
                placeholder="https://example.com"
                {...register("websiteUrl")}
              />
              {errors.websiteUrl ? (
                <p className="text-sm text-destructive">{errors.websiteUrl.message}</p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="altText">Accessible Alt Text</Label>
            <Input
              id="altText"
              placeholder="e.g. Acme Tech logo"
              {...register("altText")}
            />
            {errors.altText ? (
              <p className="text-sm text-destructive">{errors.altText.message}</p>
            ) : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sortOrder">Display Order (Position)</Label>
              <Input
                id="sortOrder"
                type="number"
                min={0}
                {...register("sortOrder")}
              />
              <p className="text-xs text-muted-foreground">
                Lower numbers appear first in the marquee scroll.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Publication Status</Label>
              <Select
                value={status}
                onValueChange={(val) =>
                  setValue("status", val as FormValues["status"], {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">Published (Visible on site)</SelectItem>
                  <SelectItem value="draft">Draft (Hidden)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Global or Country Assignment */}
          <div className="space-y-3 pt-2">
            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                checked={isGlobal}
                onChange={(e) => setValue("isGlobal", e.target.checked)}
              />
              Global Logo (Show on all country landing pages)
            </label>

            {!isGlobal ? (
              <div className="space-y-2 pl-6">
                <Label htmlFor="countriesInput">Assigned Country Slugs</Label>
                <Input
                  id="countriesInput"
                  placeholder="e.g. in, uk, us (comma separated)"
                  {...register("countriesInput")}
                />
                <p className="text-xs text-muted-foreground">
                  Specify country codes/slugs where this logo should appear (e.g. uk, us, ca).
                </p>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          {mode === "create" ? "Add client logo" : "Save changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/logos")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
