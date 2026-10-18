"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Building2, Loader2 } from "lucide-react";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PermissionMatrix } from "@/components/shared/permission-matrix";
import type { Department, DepartmentFormData, DepartmentStatus } from "@/types/department";
import type { AppModule, PermissionLevel } from "@/types/auth";
import { APP_MODULE_CONFIG } from "@/lib/constants";

const schema = z.object({
  name: z.string().min(2, "Department name is required"),
  description: z.string().min(5, "Description is required"),
  status: z.enum(["active", "inactive"]),
});

type FormValues = z.infer<typeof schema>;

interface DepartmentFormProps {
  mode: "create" | "edit";
  initialData?: Department;
  onSubmit: (data: DepartmentFormData) => Promise<void>;
}

export function DepartmentForm({ mode, initialData, onSubmit }: DepartmentFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [permissions, setPermissions] = useState<Record<AppModule, PermissionLevel>>(() => {
    const base = {} as Record<AppModule, PermissionLevel>;
    for (const item of APP_MODULE_CONFIG) {
      base[item.id as AppModule] = initialData?.defaultPermissions?.[item.id as AppModule] || "none";
    }
    return base;
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
      name: initialData?.name || "",
      description: initialData?.description || "",
      status: initialData?.status || "active",
    },
  });

  const status = watch("status");

  const submit = handleSubmit(async (values) => {
    setSaving(true);
    try {
      const payload: DepartmentFormData = {
        name: values.name.trim(),
        description: values.description.trim(),
        status: values.status as DepartmentStatus,
        defaultPermissions: permissions,
      };

      await onSubmit(payload);
      toast.success(
        mode === "create" ? "Department created successfully" : "Department updated successfully",
      );
      router.push("/departments");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save department");
    } finally {
      setSaving(false);
    }
  });

  return (
    <form onSubmit={submit} className="space-y-8">
      {/* 1. Basic Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <CardTitle>Department Details</CardTitle>
          </div>
          <CardDescription>
            Define the department identity, operational scope, and status.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Department Name</Label>
              <Input
                id="name"
                placeholder="e.g. SEO Department"
                {...register("name")}
              />
              {errors.name ? (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label>Department Status</Label>
              <Select
                value={status}
                onValueChange={(val) => setValue("status", val as DepartmentStatus, { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description & Purpose</Label>
            <Textarea
              id="description"
              rows={3}
              placeholder="Describe the department's responsibilities, team roles, and scope..."
              {...register("description")}
            />
            {errors.description ? (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {/* 2. Default Department Permissions Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Default Module Permissions</CardTitle>
          <CardDescription>
            Users assigned to this department automatically inherit these permission levels across each module.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PermissionMatrix
            value={permissions}
            onChange={(next) => setPermissions(next as Record<AppModule, PermissionLevel>)}
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          {mode === "create" ? "Create Department" : "Save Changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/departments")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
