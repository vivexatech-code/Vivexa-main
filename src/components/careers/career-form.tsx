"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
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
  CAREER_DEPARTMENTS,
  CAREER_EMPLOYMENT_TYPES,
  CAREER_WORK_TYPES,
} from "@/lib/constants";
import type { CareerFormData, CareerOpportunity } from "@/types/career";

const schema = z.object({
  title: z.string().min(2, "Role name is required"),
  type: z.enum(["Job", "Internship"]),
  department: z.string().min(1, "Department is required"),
  location: z.string().min(2, "Location is required"),
  workType: z.enum(["On-site", "Hybrid", "Remote"]),
  employmentType: z.enum(["Full-time", "Part-time", "Contract", ""]),
  shortDescription: z.string().min(12, "Add a short description"),
  fullDescription: z.string().min(24, "Add a full description"),
  openings: z.coerce.number().int().min(1),
  deadline: z.string().optional(),
  keepOpen: z.boolean(),
  duration: z.string().optional(),
  stipend: z.string().optional(),
  status: z.enum(["draft", "published", "closed"]),
});

type FormValues = z.infer<typeof schema>;

type CareerFormProps = {
  mode: "create" | "edit";
  initialData?: CareerOpportunity;
  onSubmit: (data: CareerFormData) => Promise<void>;
};

export function CareerForm({ mode, initialData, onSubmit }: CareerFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [responsibilities, setResponsibilities] = useState<string[]>(
    initialData?.responsibilities?.length ? initialData.responsibilities : [""],
  );
  const [requirements, setRequirements] = useState<string[]>(
    initialData?.requirements?.length ? initialData.requirements : [""],
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
      title: initialData?.title ?? "",
      type: initialData?.type ?? "Job",
      department: initialData?.department ?? "Engineering",
      location: initialData?.location ?? "Gurugram",
      workType: initialData?.workType ?? "Hybrid",
      employmentType: initialData?.employmentType ?? "Full-time",
      shortDescription: initialData?.shortDescription ?? "",
      fullDescription: initialData?.fullDescription ?? "",
      openings: initialData?.openings ?? 1,
      deadline: initialData?.deadline ?? "",
      keepOpen: initialData?.keepOpen ?? false,
      duration: initialData?.duration ?? "",
      stipend: initialData?.stipend ?? "",
      status: initialData?.status ?? "published",
    },
  });

  const type = watch("type");
  const department = watch("department");
  const workType = watch("workType");
  const employmentType = watch("employmentType");
  const status = watch("status");
  const keepOpen = watch("keepOpen");

  const submit = handleSubmit(async (values) => {
    const cleanResponsibilities = responsibilities
      .map((item) => item.trim())
      .filter(Boolean);
    const cleanRequirements = requirements
      .map((item) => item.trim())
      .filter(Boolean);
    if (!cleanRequirements.length) {
      toast.error("Add at least one requirement or skill");
      return;
    }

    setSaving(true);
    try {
      await onSubmit({
        ...values,
        employmentType: values.type === "Job" ? values.employmentType : "",
        duration: values.type === "Internship" ? values.duration ?? "" : "",
        stipend: values.type === "Internship" ? values.stipend ?? "" : "",
        deadline: values.deadline ?? "",
        responsibilities: cleanResponsibilities,
        requirements: cleanRequirements,
      });
      toast.success(mode === "create" ? "Opportunity created" : "Opportunity updated");
      router.push("/careers");
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
          <CardTitle>Opportunity details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title / role name</Label>
              <Input id="title" {...register("title")} />
              {errors.title ? (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label>Opportunity type</Label>
              <Select
                value={type}
                onValueChange={(value) =>
                  setValue("type", value as FormValues["type"], {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Job">Job</SelectItem>
                  <SelectItem value="Internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Department</Label>
              <Select
                value={department}
                onValueChange={(value) =>
                  setValue("department", value, { shouldValidate: true })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CAREER_DEPARTMENTS.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" {...register("location")} />
              {errors.location ? (
                <p className="text-sm text-destructive">
                  {errors.location.message}
                </p>
              ) : null}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Work type</Label>
              <Select
                value={workType}
                onValueChange={(value) =>
                  setValue("workType", value as FormValues["workType"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CAREER_WORK_TYPES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {type === "Job" ? (
              <div className="space-y-2">
                <Label>Employment type</Label>
                <Select
                  value={employmentType || "Full-time"}
                  onValueChange={(value) =>
                    setValue(
                      "employmentType",
                      value as FormValues["employmentType"],
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CAREER_EMPLOYMENT_TYPES.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="duration">Internship duration</Label>
                <Input
                  id="duration"
                  placeholder="e.g. 3 months"
                  {...register("duration")}
                />
              </div>
            )}
          </div>
          {type === "Internship" ? (
            <div className="space-y-2">
              <Label htmlFor="stipend">Stipend (optional)</Label>
              <Input
                id="stipend"
                placeholder="e.g. ₹10,000/month"
                {...register("stipend")}
              />
            </div>
          ) : null}
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
            <Label htmlFor="fullDescription">Full description</Label>
            <Textarea id="fullDescription" rows={6} {...register("fullDescription")} />
            {errors.fullDescription ? (
              <p className="text-sm text-destructive">
                {errors.fullDescription.message}
              </p>
            ) : null}
          </div>
          <ListEditor
            label="Responsibilities"
            values={responsibilities}
            onChange={setResponsibilities}
          />
          <ListEditor
            label="Requirements / skills"
            values={requirements}
            onChange={setRequirements}
          />
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="openings">Number of openings</Label>
              <Input id="openings" type="number" min={1} {...register("openings")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline">Application deadline</Label>
              <Input id="deadline" type="date" {...register("deadline")} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={status}
                onValueChange={(value) =>
                  setValue("status", value as FormValues["status"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={keepOpen}
              onChange={(event) => setValue("keepOpen", event.target.checked)}
              className="h-4 w-4 rounded border-input"
            />
            Keep accepting applications after the deadline
          </label>
        </CardContent>
      </Card>
      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {mode === "create" ? "Create opportunity" : "Save changes"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/careers")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function ListEditor({
  label,
  values,
  onChange,
}: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
}) {
  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      {values.map((value, index) => (
        <div key={index} className="flex gap-2">
          <Input
            value={value}
            onChange={(event) => {
              const next = [...values];
              next[index] = event.target.value;
              onChange(next);
            }}
            placeholder={`${label} ${index + 1}`}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onChange(values.filter((_, i) => i !== index))}
            disabled={values.length <= 1}
            aria-label={`Remove ${label}`}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onChange([...values, ""])}
      >
        <Plus className="h-4 w-4" />
        Add
      </Button>
    </div>
  );
}
