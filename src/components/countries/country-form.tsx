"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, Star, X } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { slugify } from "@/lib/slug";
import { isCountrySlugTaken } from "@/lib/firebase/countries";
import type { Country, CountryFormData, CountryHeroHighlight } from "@/types/country";

const schema = z.object({
  name: z.string().min(2, "Country name is required"),
  slug: z.string().min(1, "Slug is required"),
  code: z.string().min(2, "2-letter ISO code required").max(3),
  flag: z.string().min(1, "Flag emoji or character required"),
  flagImage: z.string().optional(),
  image: z.string().optional(),
  shortDescription: z.string().min(10, "Add a short description for homepage cards"),
  status: z.enum(["published", "draft"]),
  isDefault: z.boolean(),
  showOnHomepage: z.boolean(),
  sortOrder: z.coerce.number().int().min(0),
  destinationUrl: z.string().optional(),

  // Hero
  heroEyebrow: z.string().min(2, "Hero eyebrow is required"),
  heroTitle: z.string().min(5, "Hero title is required"),
  heroTitleHighlight: z.string().min(1, "Highlight text is required"),
  heroDescription: z.string().min(10, "Hero description is required"),
  primaryCtaLabel: z.string().min(2, "CTA label required"),
  primaryCtaLink: z.string().min(1, "CTA link required"),
  secondaryCtaLabel: z.string().min(2, "CTA label required"),
  secondaryCtaLink: z.string().min(1, "CTA link required"),

  // Currency & Pricing
  currencyCode: z.string().min(2, "Currency code required"),
  currencySymbol: z.string().min(1, "Currency symbol required"),
  currencyName: z.string().min(2, "Currency name required"),
  samplePricingNote: z.string().optional(),

  // Contact
  phoneDisplay: z.string().optional(),
  phoneHref: z.string().optional(),
  email: z.string().email("Valid email required"),
  emailHref: z.string().optional(),
  mapsUrl: z.string().optional(),
  mapsLabel: z.string().optional(),
  serviceNote: z.string().optional(),

  // Google Reviews
  reviewsEnabled: z.boolean(),
  reviewsProfileName: z.string().optional(),
  reviewsPlaceId: z.string().optional(),
  reviewsRating: z.coerce.number().min(1).max(5),
  reviewsCount: z.coerce.number().int().min(0),
  reviewsDestinationUrl: z.string().optional(),
  reviewsDisplayLabel: z.string().optional(),
  reviewsNote: z.string().optional(),
  reviewsIsFallback: z.boolean(),

  // SEO
  metaTitle: z.string().min(5, "Meta title is required"),
  metaDescription: z.string().min(10, "Meta description is required"),
  ogImage: z.string().optional(),

  // Subpage Content Overrides (Optional)
  aboutEyebrow: z.string().optional(),
  aboutTitle: z.string().optional(),
  aboutDescription: z.string().optional(),
  contactEyebrow: z.string().optional(),
  contactTitle: z.string().optional(),
  contactDescription: z.string().optional(),
  servicesEyebrow: z.string().optional(),
  servicesTitle: z.string().optional(),
  servicesDescription: z.string().optional(),
  faqEyebrow: z.string().optional(),
  faqTitle: z.string().optional(),
  faqDescription: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type CountryFormProps = {
  mode: "create" | "edit";
  initialData?: Country;
  onSubmit: (data: CountryFormData) => Promise<void>;
};

export function CountryForm({ mode, initialData, onSubmit }: CountryFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(mode === "edit");

  // Dynamic lists
  const [highlights, setHighlights] = useState<CountryHeroHighlight[]>(
    initialData?.hero.highlights?.length
      ? initialData.hero.highlights
      : [
          { label: "Typical launch", value: "1–2 weeks" },
          { label: "Built for", value: "Startups" },
        ],
  );

  const [budgetOptions, setBudgetOptions] = useState<string[]>(
    initialData?.pricing.budgetOptions?.length
      ? initialData.pricing.budgetOptions
      : ["Tier 1", "Tier 2", "Tier 3", "Tier 4"],
  );

  const [addressLines, setAddressLines] = useState<string[]>(
    initialData?.contactInfo.officeAddress?.length
      ? initialData.contactInfo.officeAddress
      : [""],
  );

  const [keywords, setKeywords] = useState<string>(
    initialData?.seo.keywords?.join(", ") ?? "",
  );

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
      code: initialData?.code ?? "",
      flag: initialData?.flag ?? "🌐",
      flagImage: initialData?.flagImage ?? "",
      image: initialData?.image ?? "",
      shortDescription: initialData?.shortDescription ?? "",
      status: initialData?.status ?? "published",
      isDefault: initialData?.isDefault ?? false,
      showOnHomepage: initialData?.showOnHomepage ?? true,
      sortOrder: initialData?.sortOrder ?? 0,
      destinationUrl: initialData?.destinationUrl ?? "",

      // Hero
      heroEyebrow: initialData?.hero.eyebrow ?? "Web Studio",
      heroTitle: initialData?.hero.title ?? "Launch your business online,",
      heroTitleHighlight: initialData?.hero.titleHighlight ?? "affordably.",
      heroDescription:
        initialData?.hero.description ??
        "We help new businesses and startups launch high-converting, professional websites.",
      primaryCtaLabel: initialData?.hero.primaryCtaLabel ?? "Book strategy call",
      primaryCtaLink: initialData?.hero.primaryCtaLink ?? "/contact",
      secondaryCtaLabel: initialData?.hero.secondaryCtaLabel ?? "View selected work",
      secondaryCtaLink: initialData?.hero.secondaryCtaLink ?? "#work",

      // Currency
      currencyCode: initialData?.currency.code ?? "USD",
      currencySymbol: initialData?.currency.symbol ?? "$",
      currencyName: initialData?.currency.name ?? "US Dollar",
      samplePricingNote: initialData?.pricing.samplePricingNote ?? "",

      // Contact
      phoneDisplay: initialData?.contactInfo.phoneDisplay ?? "+91 95821 94338",
      phoneHref: initialData?.contactInfo.phoneHref ?? "tel:+919582194338",
      email: initialData?.contactInfo.email ?? "info@vivexatech.in",
      emailHref: initialData?.contactInfo.emailHref ?? "mailto:info@vivexatech.in",
      mapsUrl: initialData?.contactInfo.mapsUrl ?? "",
      mapsLabel: initialData?.contactInfo.mapsLabel ?? "Get directions",
      serviceNote: initialData?.contactInfo.serviceNote ?? "",

      // Reviews
      reviewsEnabled: initialData?.googleReviews.enabled ?? true,
      reviewsProfileName: initialData?.googleReviews.profileName ?? "Vivexa Tech",
      reviewsPlaceId: initialData?.googleReviews.placeId ?? "",
      reviewsRating: initialData?.googleReviews.rating ?? 5.0,
      reviewsCount: initialData?.googleReviews.reviewCount ?? 38,
      reviewsDestinationUrl:
        initialData?.googleReviews.reviewDestinationUrl ??
        "https://maps.app.goo.gl/GmhAVRH4byHbsqpC6",
      reviewsDisplayLabel:
        initialData?.googleReviews.displayLabel ??
        "5.0 ★ Rated by Verified Clients on Google",
      reviewsNote:
        initialData?.googleReviews.note ??
        "Genuine client feedback from verified Google profile.",
      reviewsIsFallback: initialData?.googleReviews.isCompanyFallback ?? false,

      // SEO
      metaTitle: initialData?.seo.metaTitle ?? "",
      metaDescription: initialData?.seo.metaDescription ?? "",
      ogImage: initialData?.seo.ogImage ?? "",

      // Subpage Overrides
      aboutEyebrow: initialData?.pages?.about?.eyebrow ?? "",
      aboutTitle: initialData?.pages?.about?.title ?? "",
      aboutDescription: initialData?.pages?.about?.description ?? "",
      contactEyebrow: initialData?.pages?.contact?.eyebrow ?? "",
      contactTitle: initialData?.pages?.contact?.title ?? "",
      contactDescription: initialData?.pages?.contact?.description ?? "",
      servicesEyebrow: initialData?.pages?.services?.eyebrow ?? "",
      servicesTitle: initialData?.pages?.services?.title ?? "",
      servicesDescription: initialData?.pages?.services?.description ?? "",
      faqEyebrow: initialData?.pages?.faq?.eyebrow ?? "",
      faqTitle: initialData?.pages?.faq?.title ?? "",
      faqDescription: initialData?.pages?.faq?.description ?? "",
    },
  });

  const image = watch("image") ?? "";
  const flagImage = watch("flagImage") ?? "";
  const status = watch("status");
  const reviewsEnabled = watch("reviewsEnabled");
  const showOnHomepage = watch("showOnHomepage");

  const submit = handleSubmit(async (values) => {
    const slug = slugify(values.slug || values.name).toLowerCase();
    setSaving(true);
    try {
      if (await isCountrySlugTaken(slug, initialData?.id)) {
        toast.error("That country slug is already registered");
        return;
      }

      const cleanHighlights = highlights
        .map((h) => ({ label: h.label.trim(), value: h.value.trim() }))
        .filter((h) => h.label && h.value);

      const cleanBudget = budgetOptions.map((b) => b.trim()).filter(Boolean);
      const cleanAddress = addressLines.map((a) => a.trim()).filter(Boolean);
      const cleanKeywords = keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);

      const payload: CountryFormData = {
        name: values.name.trim(),
        slug,
        code: values.code.trim().toUpperCase(),
        flag: values.flag.trim(),
        flagImage: values.flagImage?.trim() ?? "",
        image: values.image?.trim() ?? "",
        shortDescription: values.shortDescription.trim(),
        status: values.status,
        isDefault: Boolean(values.isDefault || slug === "in"),
        showOnHomepage: Boolean(values.showOnHomepage),
        sortOrder: values.sortOrder,
        destinationUrl:
          slug === "in" || values.isDefault
            ? "/"
            : values.destinationUrl?.trim() || `/${slug}`,
        hero: {
          eyebrow: values.heroEyebrow.trim(),
          title: values.heroTitle.trim(),
          titleHighlight: values.heroTitleHighlight.trim(),
          description: values.heroDescription.trim(),
          primaryCtaLabel: values.primaryCtaLabel.trim(),
          primaryCtaLink: values.primaryCtaLink.trim(),
          secondaryCtaLabel: values.secondaryCtaLabel.trim(),
          secondaryCtaLink: values.secondaryCtaLink.trim(),
          highlights: cleanHighlights,
        },
        currency: {
          code: values.currencyCode.trim().toUpperCase(),
          symbol: values.currencySymbol.trim(),
          name: values.currencyName.trim(),
        },
        pricing: {
          budgetOptions: cleanBudget,
          samplePricingNote: values.samplePricingNote?.trim() ?? "",
        },
        contactInfo: {
          phoneDisplay: values.phoneDisplay?.trim() ?? "",
          phoneHref: values.phoneHref?.trim() ?? "",
          email: values.email.trim(),
          emailHref: values.emailHref?.trim() ?? `mailto:${values.email.trim()}`,
          officeAddress: cleanAddress,
          mapsUrl: values.mapsUrl?.trim() ?? "",
          mapsLabel: values.mapsLabel?.trim() ?? "Directions",
          serviceNote: values.serviceNote?.trim() ?? "",
        },
        googleReviews: {
          enabled: Boolean(values.reviewsEnabled),
          profileName: values.reviewsProfileName?.trim() ?? "",
          placeId: values.reviewsPlaceId?.trim() ?? "",
          rating: values.reviewsRating,
          reviewCount: values.reviewsCount,
          reviewDestinationUrl: values.reviewsDestinationUrl?.trim() ?? "",
          displayLabel: values.reviewsDisplayLabel?.trim() ?? "",
          note: values.reviewsNote?.trim() ?? "",
          isCompanyFallback: Boolean(values.reviewsIsFallback),
        },
        seo: {
          metaTitle: values.metaTitle.trim(),
          metaDescription: values.metaDescription.trim(),
          ogImage: values.ogImage?.trim() ?? "",
          keywords: cleanKeywords,
        },
        pages: {
          about: {
            eyebrow: values.aboutEyebrow?.trim() || undefined,
            title: values.aboutTitle?.trim() || undefined,
            description: values.aboutDescription?.trim() || undefined,
          },
          contact: {
            eyebrow: values.contactEyebrow?.trim() || undefined,
            title: values.contactTitle?.trim() || undefined,
            description: values.contactDescription?.trim() || undefined,
          },
          services: {
            eyebrow: values.servicesEyebrow?.trim() || undefined,
            title: values.servicesTitle?.trim() || undefined,
            description: values.servicesDescription?.trim() || undefined,
          },
          faq: {
            eyebrow: values.faqEyebrow?.trim() || undefined,
            title: values.faqTitle?.trim() || undefined,
            description: values.faqDescription?.trim() || undefined,
          },
        },
      };

      await onSubmit(payload);
      toast.success(mode === "create" ? "Country experience created" : "Country updated");
      router.push("/countries");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save country");
    } finally {
      setSaving(false);
    }
  });

  return (
    <form onSubmit={submit} className="space-y-8">
      {/* 1. Basic Info & URL */}
      <Card>
        <CardHeader>
          <CardTitle>Country & Route Information</CardTitle>
          <CardDescription>
            Configure the country identification, URL slug, and homepage visibility.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="name">Country Name</Label>
              <Input
                id="name"
                placeholder="e.g. United Kingdom"
                {...register("name", {
                  onChange: (e) => {
                    if (!slugTouched) {
                      setValue("slug", slugify(e.target.value), {
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
              <Label htmlFor="slug">URL Slug</Label>
              <Input
                id="slug"
                placeholder="e.g. uk, us, ca, au"
                {...register("slug", { onChange: () => setSlugTouched(true) })}
              />
              {errors.slug ? (
                <p className="text-sm text-destructive">{errors.slug.message}</p>
              ) : null}
              <p className="text-xs text-muted-foreground">
                Matches /slug (e.g. www.vivexatech.in/uk). India uses &quot;in&quot; for /
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">ISO Country Code (2 letters)</Label>
              <Input
                id="code"
                placeholder="e.g. GB, US, CA, AU, IN"
                maxLength={3}
                {...register("code")}
              />
              {errors.code ? (
                <p className="text-sm text-destructive">{errors.code.message}</p>
              ) : null}
              <p className="text-xs text-muted-foreground">
                Used for geolocation header matching (Vercel x-vercel-ip-country)
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="flag">Flag Emoji / Icon</Label>
              <Input id="flag" placeholder="e.g. 🇬🇧, 🇺🇸, 🇮🇳" {...register("flag")} />
              {errors.flag ? (
                <p className="text-sm text-destructive">{errors.flag.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sortOrder">Homepage Display Order</Label>
              <Input id="sortOrder" type="number" min={0} {...register("sortOrder")} />
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
                  <SelectItem value="published">Published on website</SelectItem>
                  <SelectItem value="draft">Draft (hidden from public)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shortDescription">Homepage Card Description</Label>
            <Textarea
              id="shortDescription"
              rows={2}
              placeholder="Brief summary of your genuine services for this country (shown on 'Countries We Work With' card)..."
              {...register("shortDescription")}
            />
            {errors.shortDescription ? (
              <p className="text-sm text-destructive">{errors.shortDescription.message}</p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-2">
            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                checked={showOnHomepage}
                onChange={(e) => setValue("showOnHomepage", e.target.checked)}
              />
              Show in &quot;Countries We Work With&quot; section on homepage
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2 pt-2">
            <ImageUpload
              value={image}
              onChange={(url) => setValue("image", url, { shouldValidate: true })}
              folder="countries"
              label="Country Card Image / Banner"
              hint="Optional landmark or skyline photo for homepage country card."
            />
            <ImageUpload
              value={flagImage}
              onChange={(url) => setValue("flagImage", url, { shouldValidate: true })}
              folder="countries"
              label="Custom Flag Image (Optional)"
              hint="Optional custom SVG/PNG flag if you prefer an image over an emoji."
            />
          </div>
        </CardContent>
      </Card>

      {/* 2. Country-Specific Hero */}
      <Card>
        <CardHeader>
          <CardTitle>Hero Section Content</CardTitle>
          <CardDescription>
            Country-tailored headline, copy, and call-to-actions shown on this country&apos;s landing page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="heroEyebrow">Hero Eyebrow</Label>
            <Input id="heroEyebrow" placeholder="e.g. UK Web Studio Partner" {...register("heroEyebrow")} />
            {errors.heroEyebrow ? (
              <p className="text-sm text-destructive">{errors.heroEyebrow.message}</p>
            ) : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="heroTitle">Hero Title (Prefix)</Label>
              <Input
                id="heroTitle"
                placeholder="e.g. High-impact web design for UK businesses,"
                {...register("heroTitle")}
              />
              {errors.heroTitle ? (
                <p className="text-sm text-destructive">{errors.heroTitle.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="heroTitleHighlight">Hero Title (Gradient Highlight)</Label>
              <Input
                id="heroTitleHighlight"
                placeholder="e.g. delivered fast."
                {...register("heroTitleHighlight")}
              />
              {errors.heroTitleHighlight ? (
                <p className="text-sm text-destructive">{errors.heroTitleHighlight.message}</p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="heroDescription">Hero Subheading & Description</Label>
            <Textarea
              id="heroDescription"
              rows={3}
              placeholder="We help UK startups and businesses establish a credible, high-converting digital presence..."
              {...register("heroDescription")}
            />
            {errors.heroDescription ? (
              <p className="text-sm text-destructive">{errors.heroDescription.message}</p>
            ) : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="primaryCtaLabel">Primary Button Label</Label>
              <Input id="primaryCtaLabel" {...register("primaryCtaLabel")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="primaryCtaLink">Primary Button Destination</Label>
              <Input id="primaryCtaLink" {...register("primaryCtaLink")} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="secondaryCtaLabel">Secondary Button Label</Label>
              <Input id="secondaryCtaLabel" {...register("secondaryCtaLabel")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondaryCtaLink">Secondary Button Destination</Label>
              <Input id="secondaryCtaLink" {...register("secondaryCtaLink")} />
            </div>
          </div>

          {/* Highlights */}
          <div className="space-y-3 pt-2">
            <Label>Hero Highlights / Badges (3 items recommended)</Label>
            {highlights.map((h, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  value={h.label}
                  placeholder="Label (e.g. Typical launch)"
                  onChange={(e) => {
                    const next = [...highlights];
                    next[i] = { ...next[i], label: e.target.value };
                    setHighlights(next);
                  }}
                  className="flex-1"
                />
                <Input
                  value={h.value}
                  placeholder="Value (e.g. 1–2 weeks)"
                  onChange={(e) => {
                    const next = [...highlights];
                    next[i] = { ...next[i], value: e.target.value };
                    setHighlights(next);
                  }}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setHighlights(highlights.filter((_, idx) => idx !== i))}
                  disabled={highlights.length <= 1}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setHighlights([...highlights, { label: "", value: "" }])}
            >
              <Plus className="h-4 w-4" />
              Add highlight
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 3. Currency & Pricing */}
      <Card>
        <CardHeader>
          <CardTitle>Local Currency & Pricing</CardTitle>
          <CardDescription>
            Each country supports its own currency formatting and manually defined budget tiers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="currencyCode">Currency Code (ISO)</Label>
              <Input id="currencyCode" placeholder="GBP, USD, CAD, AUD, INR" {...register("currencyCode")} />
              {errors.currencyCode ? (
                <p className="text-sm text-destructive">{errors.currencyCode.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="currencySymbol">Currency Symbol</Label>
              <Input id="currencySymbol" placeholder="£, $, C$, A$, ₹" {...register("currencySymbol")} />
              {errors.currencySymbol ? (
                <p className="text-sm text-destructive">{errors.currencySymbol.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="currencyName">Currency Name</Label>
              <Input id="currencyName" placeholder="British Pound" {...register("currencyName")} />
              {errors.currencyName ? (
                <p className="text-sm text-destructive">{errors.currencyName.message}</p>
              ) : null}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Contact Form Budget Tiers (in local currency)</Label>
            {budgetOptions.map((tier, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  value={tier}
                  placeholder={`Budget tier ${i + 1} (e.g. Under £1,000)`}
                  onChange={(e) => {
                    const next = [...budgetOptions];
                    next[i] = e.target.value;
                    setBudgetOptions(next);
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setBudgetOptions(budgetOptions.filter((_, idx) => idx !== i))}
                  disabled={budgetOptions.length <= 1}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setBudgetOptions([...budgetOptions, ""])}
            >
              <Plus className="h-4 w-4" />
              Add budget tier
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="samplePricingNote">Pricing Policy / Transparency Note</Label>
            <Input
              id="samplePricingNote"
              placeholder="e.g. Fixed GBP quotes with transparent scope and milestone payments."
              {...register("samplePricingNote")}
            />
          </div>
        </CardContent>
      </Card>

      {/* 4. Google Reviews Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 fill-amber-400 text-amber-500" />
            <CardTitle>Google Reviews Configuration</CardTitle>
          </div>
          <CardDescription>
            Configure legitimate, country-appropriate Google review badge and destination. Never fabricates reviews.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              checked={reviewsEnabled}
              onChange={(e) => setValue("reviewsEnabled", e.target.checked)}
            />
            Display Google Reviews badge on this country experience
          </label>

          {reviewsEnabled ? (
            <div className="space-y-4 rounded-xl border border-border p-4 bg-muted/20">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="reviewsProfileName">Business Profile Name</Label>
                  <Input
                    id="reviewsProfileName"
                    placeholder="e.g. Vivexa Tech (or local eligible profile name)"
                    {...register("reviewsProfileName")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reviewsPlaceId">Google Maps Place ID (Optional)</Label>
                  <Input
                    id="reviewsPlaceId"
                    placeholder="ChIJW1qW_gUVDTkR65l9jJ36aZQ"
                    {...register("reviewsPlaceId")}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="reviewsRating">Rating Score (1.0 to 5.0)</Label>
                  <Input
                    id="reviewsRating"
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    {...register("reviewsRating")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reviewsCount">Verified Review Count</Label>
                  <Input
                    id="reviewsCount"
                    type="number"
                    min="0"
                    {...register("reviewsCount")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reviewsDestinationUrl">Google Reviews / Maps URL</Label>
                <Input
                  id="reviewsDestinationUrl"
                  placeholder="https://maps.app.goo.gl/..."
                  {...register("reviewsDestinationUrl")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reviewsDisplayLabel">Badge Display Label</Label>
                <Input
                  id="reviewsDisplayLabel"
                  placeholder="5.0 ★ Rated by Verified Clients on Google"
                  {...register("reviewsDisplayLabel")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reviewsNote">Attribution & Source Note</Label>
                <Input
                  id="reviewsNote"
                  placeholder="e.g. Reviews reflect verified client feedback from Vivexa Tech's Google Business profile."
                  {...register("reviewsNote")}
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer pt-1">
                <input
                  type="checkbox"
                  className="h-3.5 w-3.5 rounded border-border"
                  {...register("reviewsIsFallback")}
                />
                Use company-wide verified Google reviews profile (recommended when no separate local country office exists)
              </label>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* 5. Contact & Collaboration */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information & Localized Desk</CardTitle>
          <CardDescription>
            Display appropriate contact details and service notes for clients in this country.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phoneDisplay">Phone Display</Label>
              <Input id="phoneDisplay" placeholder="+44 20 7946 0192 or +91 95821 94338" {...register("phoneDisplay")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneHref">Phone Tel Link</Label>
              <Input id="phoneHref" placeholder="tel:+919582194338" {...register("phoneHref")} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Contact Email</Label>
              <Input id="email" type="email" placeholder="info@vivexatech.in" {...register("email")} />
              {errors.email ? (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="serviceNote">Service Availability Note</Label>
              <Input
                id="serviceNote"
                placeholder="e.g. London & UK Business Hours Alignment (GMT/BST)"
                {...register("serviceNote")}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Office / Delivery Address Lines</Label>
            {addressLines.map((line, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  value={line}
                  placeholder={`Address line ${i + 1}`}
                  onChange={(e) => {
                    const next = [...addressLines];
                    next[i] = e.target.value;
                    setAddressLines(next);
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setAddressLines(addressLines.filter((_, idx) => idx !== i))}
                  disabled={addressLines.length <= 1}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAddressLines([...addressLines, ""])}
            >
              <Plus className="h-4 w-4" />
              Add address line
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 6. SEO & Social Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>SEO & Social Metadata</CardTitle>
          <CardDescription>
            Generate unique title tags, meta descriptions, and search indexing for this country route.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="metaTitle">SEO Meta Title</Label>
            <Input
              id="metaTitle"
              placeholder="e.g. Vivexa Tech UK — High-Impact Web Design for UK Startups"
              {...register("metaTitle")}
            />
            {errors.metaTitle ? (
              <p className="text-sm text-destructive">{errors.metaTitle.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="metaDescription">Meta Description</Label>
            <Textarea
              id="metaDescription"
              rows={3}
              placeholder="Unique, high-quality description summarizing your web studio services for this country..."
              {...register("metaDescription")}
            />
            {errors.metaDescription ? (
              <p className="text-sm text-destructive">{errors.metaDescription.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="keywords">SEO Keywords (comma separated)</Label>
            <Input
              id="keywords"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="web design UK, London startup agency, Next.js web design"
            />
          </div>
        </CardContent>
      </Card>

      {/* 7. Subpage Content Overrides */}
      <Card>
        <CardHeader>
          <CardTitle>Subpage Content Overrides</CardTitle>
          <CardDescription>
            Optionally customize headlines and descriptions for specific pages (About, Contact, Services, FAQ) for this country. If left blank, sensible defaults will be used.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* About Page */}
          <div className="rounded-xl border border-border p-4 bg-muted/10 space-y-4">
            <h4 className="font-semibold text-sm">About Us Page</h4>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="aboutEyebrow">Eyebrow</Label>
                <Input
                  id="aboutEyebrow"
                  placeholder="e.g. About Vivexa Tech UK"
                  {...register("aboutEyebrow")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="aboutTitle">Heading Title</Label>
                <Input
                  id="aboutTitle"
                  placeholder="e.g. Reliable web studio partner for British businesses"
                  {...register("aboutTitle")}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="aboutDescription">Description</Label>
              <Textarea
                id="aboutDescription"
                rows={2}
                placeholder="Custom copy describing your studio's offering for this country..."
                {...register("aboutDescription")}
              />
            </div>
          </div>

          {/* Contact Page */}
          <div className="rounded-xl border border-border p-4 bg-muted/10 space-y-4">
            <h4 className="font-semibold text-sm">Contact Us Page</h4>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contactEyebrow">Eyebrow</Label>
                <Input
                  id="contactEyebrow"
                  placeholder="e.g. UK Client Desk"
                  {...register("contactEyebrow")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactTitle">Heading Title</Label>
                <Input
                  id="contactTitle"
                  placeholder="e.g. Start your project with our dedicated desk"
                  {...register("contactTitle")}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactDescription">Description</Label>
              <Textarea
                id="contactDescription"
                rows={2}
                placeholder="Custom copy for the contact page..."
                {...register("contactDescription")}
              />
            </div>
          </div>

          {/* Services Page */}
          <div className="rounded-xl border border-border p-4 bg-muted/10 space-y-4">
            <h4 className="font-semibold text-sm">Services Page</h4>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="servicesEyebrow">Eyebrow</Label>
                <Input
                  id="servicesEyebrow"
                  placeholder="e.g. Services for UK Clients"
                  {...register("servicesEyebrow")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="servicesTitle">Heading Title</Label>
                <Input
                  id="servicesTitle"
                  placeholder="e.g. Fast, modern web engineering tailored for the UK market"
                  {...register("servicesTitle")}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="servicesDescription">Description</Label>
              <Textarea
                id="servicesDescription"
                rows={2}
                placeholder="Custom copy for the services page..."
                {...register("servicesDescription")}
              />
            </div>
          </div>

          {/* FAQ Page */}
          <div className="rounded-xl border border-border p-4 bg-muted/10 space-y-4">
            <h4 className="font-semibold text-sm">FAQ Page</h4>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="faqEyebrow">Eyebrow</Label>
                <Input
                  id="faqEyebrow"
                  placeholder="e.g. UK Client FAQ"
                  {...register("faqEyebrow")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="faqTitle">Heading Title</Label>
                <Input
                  id="faqTitle"
                  placeholder="e.g. How we collaborate with UK businesses"
                  {...register("faqTitle")}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="faqDescription">Description</Label>
              <Textarea
                id="faqDescription"
                rows={2}
                placeholder="Custom copy for the FAQ page..."
                {...register("faqDescription")}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {mode === "create" ? "Create country experience" : "Save changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/countries")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
