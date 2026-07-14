"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PhotoUpload } from "@/components/employees/photo-upload";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Employee, EmployeeFormData } from "@/types/employee";

const schema = z.object({
  name: z.string().min(2, "Full name is required"),
  designation: z.string().min(2, "Designation is required"),
  phone: z.string().min(8, "Phone number is required"),
  employeeType: z.enum(["Employee", "Intern"]),
  profilePhoto: z.string().min(1, "Profile photo is required"),
  joinedDate: z.string().min(1, "Joined date is required"),
  status: z.enum(["Active", "Inactive"]),
});

type FormValues = z.infer<typeof schema>;

type EmployeeFormProps = {
  mode: "create" | "edit";
  initialData?: Employee;
  onSubmit: (data: EmployeeFormData) => Promise<void>;
};

export function EmployeeForm({ mode, initialData, onSubmit }: EmployeeFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

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
      designation: initialData?.designation ?? "",
      phone: initialData?.phone ?? "",
      employeeType: initialData?.employeeType ?? "Employee",
      profilePhoto: initialData?.profilePhoto ?? "",
      joinedDate: initialData?.joinedDate
        ? initialData.joinedDate.slice(0, 10)
        : new Date().toISOString().slice(0, 10),
      status: initialData?.status ?? "Active",
    },
  });

  const profilePhoto = watch("profilePhoto");
  const name = watch("name");
  const employeeType = watch("employeeType");
  const status = watch("status");

  const submit = handleSubmit(async (values) => {
    setSaving(true);
    try {
      await onSubmit({
        ...values,
        joinedDate: new Date(values.joinedDate).toISOString(),
      });
      toast.success(
        mode === "create"
          ? "Employee created successfully"
          : "Employee updated successfully"
      );
      router.push("/employees");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  });

  return (
    <form onSubmit={submit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {mode === "create" ? "Employee Details" : "Edit Employee"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <PhotoUpload
            value={profilePhoto}
            name={name}
            onChange={(url) =>
              setValue("profilePhoto", url, { shouldValidate: true })
            }
          />
          {errors.profilePhoto ? (
            <p className="text-sm text-destructive">{errors.profilePhoto.message}</p>
          ) : null}

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="Jane Cooper" {...register("name")} />
              {errors.name ? (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="designation">Designation</Label>
              <Input
                id="designation"
                placeholder="Software Engineer"
                {...register("designation")}
              />
              {errors.designation ? (
                <p className="text-sm text-destructive">
                  {errors.designation.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                placeholder="+91 98765 43210"
                {...register("phone")}
              />
              {errors.phone ? (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label>Employee Type</Label>
              <Select
                value={employeeType}
                onValueChange={(value: "Employee" | "Intern") =>
                  setValue("employeeType", value, { shouldValidate: true })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Employee">Employee</SelectItem>
                  <SelectItem value="Intern">Intern</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={status}
                onValueChange={(value: "Active" | "Inactive") =>
                  setValue("status", value, { shouldValidate: true })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="joinedDate">Joined Date</Label>
              <Input id="joinedDate" type="date" {...register("joinedDate")} />
              {errors.joinedDate ? (
                <p className="text-sm text-destructive">
                  {errors.joinedDate.message}
                </p>
              ) : null}
            </div>

            {mode === "edit" && initialData ? (
              <div className="space-y-2">
                <Label>Employee ID</Label>
                <Input value={initialData.employeeId} disabled />
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Employee ID</Label>
                <Input value="Auto-generated (12701…)" disabled />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {mode === "create" ? "Save Employee" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
