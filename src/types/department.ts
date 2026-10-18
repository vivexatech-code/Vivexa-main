import type { AppModule, PermissionLevel } from "./auth";

export type DepartmentStatus = "active" | "inactive";

export interface Department {
  id: string; // e.g. "hr", "support", "operations", "seo", "management"
  name: string;
  description: string;
  status: DepartmentStatus;
  defaultPermissions: Record<AppModule, PermissionLevel>;
  isSystem?: boolean; // Default initial departments
  memberCount?: number;
  createdAt: string;
  updatedAt: string;
}

export type DepartmentFormData = {
  name: string;
  description: string;
  status: DepartmentStatus;
  defaultPermissions: Record<AppModule, PermissionLevel>;
};
