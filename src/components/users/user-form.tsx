"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Shield, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PermissionMatrix } from "@/components/shared/permission-matrix";
import type { AdminUser, AdminUserFormData, AppModule, PermissionLevel, UserStatus } from "@/types/auth";
import type { Department } from "@/types/department";

const baseSchema = z.object({
  displayName: z.string().min(2, "Full name is required"),
  email: z.string().email("Enter a valid email address"),
  jobTitle: z.string().optional(),
  status: z.enum(["active", "inactive", "suspended", "revoked"]),
  reportingManagerId: z.string().optional(),
  isSuperAdmin: z.boolean(),
  initialPassword: z.string().optional(),
});

type FormValues = z.infer<typeof baseSchema>;

interface UserFormProps {
  mode: "create" | "edit";
  initialData?: AdminUser;
  departments: Department[];
  allUsers: AdminUser[];
  onSubmit: (data: AdminUserFormData) => Promise<void>;
}

export function UserForm({
  mode,
  initialData,
  departments,
  allUsers,
  onSubmit,
}: UserFormProps) {
  const router = useRouter();
  const { isSuperAdmin: currentUserIsSuperAdmin } = useAuth();
  const [saving, setSaving] = useState(false);
  const [selectedDepts, setSelectedDepts] = useState<string[]>(
    initialData?.departments || [],
  );
  const [overrides, setOverrides] = useState<Partial<Record<AppModule, PermissionLevel>>>(
    initialData?.permissions || {},
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(
      mode === "create"
        ? baseSchema.refine((data) => !data.initialPassword || data.initialPassword.length >= 6, {
            message: "Password must be at least 6 characters",
            path: ["initialPassword"],
          })
        : baseSchema,
    ),
    defaultValues: {
      displayName: initialData?.displayName || "",
      email: initialData?.email || "",
      jobTitle: initialData?.jobTitle || "",
      status: initialData?.status || "active",
      reportingManagerId: initialData?.reportingManagerId || "none",
      isSuperAdmin: initialData?.isSuperAdmin || false,
      initialPassword: "",
    },
  });

  const status = watch("status");
  const isSuperAdmin = watch("isSuperAdmin");
  const reportingManagerId = watch("reportingManagerId");

  const toggleDept = (deptId: string) => {
    setSelectedDepts((prev) =>
      prev.includes(deptId) ? prev.filter((id) => id !== deptId) : [...prev, deptId],
    );
  };

  const submit = handleSubmit(async (values) => {
    setSaving(true);
    try {
      const payload: AdminUserFormData = {
        displayName: values.displayName.trim(),
        email: values.email.trim().toLowerCase(),
        jobTitle: values.jobTitle?.trim() || undefined,
        departments: selectedDepts,
        reportingManagerId:
          values.reportingManagerId && values.reportingManagerId !== "none"
            ? values.reportingManagerId
            : undefined,
        status: values.status as UserStatus,
        isSuperAdmin: values.isSuperAdmin,
        permissions: overrides,
        initialPassword: values.initialPassword?.trim() || undefined,
      };

      await onSubmit(payload);
      toast.success(mode === "create" ? "User created successfully" : "User updated successfully");
      router.push("/users");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save user");
    } finally {
      setSaving(false);
    }
  });

  return (
    <form onSubmit={submit} className="space-y-8">
      {/* 1. Account Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserIcon className="h-5 w-5 text-primary" />
            <CardTitle>Account Information</CardTitle>
          </div>
          <CardDescription>
            Basic identity details and credentials for administrative authentication.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="displayName">Full Name</Label>
              <Input
                id="displayName"
                placeholder="e.g. Sarah Jenkins"
                {...register("displayName")}
              />
              {errors.displayName ? (
                <p className="text-sm text-destructive">{errors.displayName.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="sarah@vivexatech.in"
                disabled={mode === "edit"} // Email matches Auth UID
                {...register("email")}
              />
              {errors.email ? (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title / Designation (Optional)</Label>
              <Input
                id="jobTitle"
                placeholder="e.g. Senior SEO Strategist"
                {...register("jobTitle")}
              />
            </div>

            <div className="space-y-2">
              <Label>Account Status</Label>
              <Select
                value={status}
                onValueChange={(val) => setValue("status", val as UserStatus, { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active (Access Allowed)</SelectItem>
                  <SelectItem value="inactive">Inactive (Disabled)</SelectItem>
                  <SelectItem value="suspended">Suspended (Temporary Freeze)</SelectItem>
                  <SelectItem value="revoked">Revoked (Access Banned)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {mode === "create" ? (
            <div className="space-y-2">
              <Label htmlFor="initialPassword">Initial Password (Optional)</Label>
              <Input
                id="initialPassword"
                type="password"
                placeholder="At least 6 characters (or send reset link later)"
                {...register("initialPassword")}
              />
              {errors.initialPassword ? (
                <p className="text-sm text-destructive">{errors.initialPassword.message}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  If left blank, user can be sent a secure password setup link.
                </p>
              )}
            </div>
          ) : null}

          {/* Reporting Manager */}
          <div className="space-y-2">
            <Label>Reporting Manager (Optional)</Label>
            <Select
              value={reportingManagerId}
              onValueChange={(val) => setValue("reportingManagerId", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select manager" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Manager (Direct / Lead)</SelectItem>
                {allUsers
                  .filter((u) => u.id !== initialData?.id)
                  .map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.displayName} ({m.email})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Super Admin Privileges */}
          {currentUserIsSuperAdmin ? (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  checked={isSuperAdmin}
                  onChange={(e) => setValue("isSuperAdmin", e.target.checked)}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold text-foreground">
                      Grant Super Administrator Privileges
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    Super administrators bypass department limitations and have unrestricted access to all modules, user administration, and system-level actions.
                  </p>
                </div>
              </label>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* 2. Department Assignments */}
      <Card>
        <CardHeader>
          <CardTitle>Department Assignments</CardTitle>
          <CardDescription>
            Assign the user to one or more departments. Users inherit the default permissions of all assigned departments.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {departments.map((dept) => {
              const isChecked = selectedDepts.includes(dept.id);
              return (
                <div
                  key={dept.id}
                  onClick={() => toggleDept(dept.id)}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all ${
                    isChecked
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border bg-card hover:bg-muted/30"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary pointer-events-none"
                  />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{dept.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                      {dept.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          {departments.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              No departments created yet. Go to Department Management to add departments.
            </p>
          ) : null}
        </CardContent>
      </Card>

      {/* 3. Individual Permission Overrides */}
      <Card>
        <CardHeader>
          <CardTitle>Individual Permission Overrides</CardTitle>
          <CardDescription>
            Explicit individual permissions take precedence over department defaults. Set any module to override the department-level assignment for this specific user.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PermissionMatrix
            value={overrides}
            onChange={(next) => setOverrides(next)}
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          {mode === "create" ? "Create User" : "Save Changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/users")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
