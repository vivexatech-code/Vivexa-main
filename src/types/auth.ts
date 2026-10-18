export type PermissionLevel = "none" | "read" | "read_write" | "approval_required" | "full";

export type AppModule =
  | "dashboard"
  | "employees"
  | "countries"
  | "logos"
  | "projects"
  | "services"
  | "careers"
  | "applications"
  | "blogs"
  | "contacts"
  | "users"
  | "departments"
  | "approvals"
  | "audit_logs";

export type ModulePermissions = Record<AppModule, PermissionLevel>;

export type UserStatus = "active" | "inactive" | "suspended" | "revoked";

export interface GranularCapabilities {
  canDelete?: boolean;
  canPublish?: boolean;
  canApprove?: boolean;
  canExport?: boolean;
  canManageSettings?: boolean;
  canManageUsers?: boolean;
}

export interface AdminUser {
  id: string; // Firebase Auth uid
  email: string;
  displayName: string;
  jobTitle?: string;
  departments: string[]; // Department IDs
  reportingManagerId?: string;
  reportingManagerName?: string;
  status: UserStatus;
  isSuperAdmin: boolean;
  permissions?: Partial<Record<AppModule, PermissionLevel>>; // Individual overrides
  capabilities?: GranularCapabilities;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  createdById?: string;
}

export type AdminUserFormData = {
  displayName: string;
  email: string;
  jobTitle?: string;
  departments: string[];
  reportingManagerId?: string;
  status: UserStatus;
  isSuperAdmin?: boolean;
  permissions?: Partial<Record<AppModule, PermissionLevel>>;
  capabilities?: GranularCapabilities;
  initialPassword?: string; // Only used during creation if provisioning via auth
};
