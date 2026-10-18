import type { AdminUser, AppModule, ModulePermissions, PermissionLevel } from "@/types/auth";
import type { Department } from "@/types/department";

export const ALL_MODULES: AppModule[] = [
  "dashboard",
  "employees",
  "countries",
  "logos",
  "projects",
  "services",
  "careers",
  "applications",
  "blogs",
  "contacts",
  "approvals",
  "users",
  "departments",
  "audit_logs",
];

export const PERMISSION_LEVEL_LABELS: Record<PermissionLevel, { label: string; description: string; badgeVariant: "default" | "secondary" | "outline" | "destructive" }> = {
  none: {
    label: "No Access",
    description: "Module hidden and blocked from access",
    badgeVariant: "secondary",
  },
  read: {
    label: "Read Only",
    description: "View records, search and filter. Cannot create, edit, or delete",
    badgeVariant: "outline",
  },
  read_write: {
    label: "Read & Write",
    description: "View, create, and edit records directly. Cannot delete sensitive data",
    badgeVariant: "default",
  },
  approval_required: {
    label: "Write + Approval",
    description: "Can submit new records or edits, but changes require admin approval",
    badgeVariant: "secondary",
  },
  full: {
    label: "Full Access",
    description: "Complete authority within module including deletion and publishing",
    badgeVariant: "default",
  },
};

/**
 * Default permissions for the 5 initial departments.
 * Administrators can customize these at any time via Department Management.
 */
export const DEFAULT_DEPARTMENT_PERMISSIONS: Record<string, ModulePermissions> = {
  hr: {
    dashboard: "read",
    employees: "full",
    careers: "full",
    applications: "full",
    countries: "none",
    logos: "none",
    projects: "none",
    services: "none",
    blogs: "none",
    contacts: "none",
    approvals: "read",
    users: "none",
    departments: "none",
    audit_logs: "none",
  },
  support: {
    dashboard: "read",
    contacts: "read_write",
    applications: "read",
    services: "read",
    employees: "read",
    countries: "read",
    logos: "none",
    projects: "read",
    careers: "none",
    blogs: "none",
    approvals: "none",
    users: "none",
    departments: "none",
    audit_logs: "none",
  },
  operations: {
    dashboard: "read",
    services: "read_write",
    projects: "read_write",
    logos: "read_write",
    countries: "approval_required",
    employees: "read",
    careers: "read",
    applications: "read",
    blogs: "read",
    contacts: "read",
    approvals: "read",
    users: "none",
    departments: "none",
    audit_logs: "none",
  },
  seo: {
    dashboard: "read",
    blogs: "full",
    countries: "approval_required",
    services: "read",
    projects: "read",
    logos: "none",
    employees: "none",
    careers: "none",
    applications: "none",
    contacts: "none",
    approvals: "none",
    users: "none",
    departments: "none",
    audit_logs: "none",
  },
  management: {
    dashboard: "full",
    employees: "read",
    countries: "read",
    logos: "read",
    projects: "read",
    services: "read",
    careers: "read",
    applications: "read",
    blogs: "read",
    contacts: "read",
    approvals: "full",
    audit_logs: "read",
    users: "read",
    departments: "read",
  },
};

export const INITIAL_DEPARTMENTS: {
  id: string;
  name: string;
  description: string;
}[] = [
  {
    id: "hr",
    name: "HR Department",
    description: "Employee directories, staff profiles, career openings, and job applications.",
  },
  {
    id: "support",
    name: "Support Department",
    description: "Customer enquiries, support requests, and service enquiry communications.",
  },
  {
    id: "operations",
    name: "Operations Department",
    description: "Service offerings, project deliveries, client logos, and operational workflows.",
  },
  {
    id: "seo",
    name: "SEO Department",
    description: "Website search metadata, country SEO configurations, and blog publishing.",
  },
  {
    id: "management",
    name: "Management Department",
    description: "Executive dashboards, departmental oversight, approval decisions, and audit trail.",
  },
];

const PERMISSION_RANK: Record<PermissionLevel, number> = {
  none: 0,
  read: 1,
  approval_required: 2,
  read_write: 3,
  full: 4,
};

/**
 * Resolves the effective permission map for a user.
 * Rule:
 * 1. If user is Super Admin -> All modules are "full"
 * 2. If user has explicit individual override for module -> User override wins
 * 3. Else if user belongs to one or more active departments -> Highest permission rank wins
 * 4. Default -> "none"
 */
export function resolveUserPermissions(
  user: AdminUser | null | undefined,
  allDepartments: Department[] = [],
): ModulePermissions {
  const result: ModulePermissions = {
    dashboard: "none",
    employees: "none",
    countries: "none",
    logos: "none",
    projects: "none",
    services: "none",
    careers: "none",
    applications: "none",
    blogs: "none",
    contacts: "none",
    approvals: "none",
    users: "none",
    departments: "none",
    audit_logs: "none",
  };

  if (!user) return result;

  // Deactivated users have zero permissions
  if (user.status !== "active") {
    return result;
  }

  // Super admins have full access across the entire system
  if (user.isSuperAdmin) {
    for (const mod of ALL_MODULES) {
      result[mod] = "full";
    }
    return result;
  }

  // 1. Calculate combined department permissions
  const activeUserDepts = allDepartments.filter(
    (dept) =>
      user.departments.includes(dept.id) &&
      dept.status === "active",
  );

  for (const mod of ALL_MODULES) {
    let highestLevel: PermissionLevel = "none";
    let highestRank = 0;

    for (const dept of activeUserDepts) {
      const level = dept.defaultPermissions?.[mod] || "none";
      const rank = PERMISSION_RANK[level] || 0;
      if (rank > highestRank) {
        highestRank = rank;
        highestLevel = level;
      }
    }
    result[mod] = highestLevel;
  }

  // 2. Individual user overrides take precedence over department defaults
  if (user.permissions) {
    for (const mod of ALL_MODULES) {
      const explicit = user.permissions[mod];
      if (explicit && explicit !== undefined) {
        result[mod] = explicit;
      }
    }
  }

  return result;
}

export function canView(level: PermissionLevel): boolean {
  return level !== "none";
}

export function canWrite(level: PermissionLevel): boolean {
  return level === "read_write" || level === "full";
}

export function requiresApproval(level: PermissionLevel): boolean {
  return level === "approval_required";
}

export function canDelete(level: PermissionLevel): boolean {
  return level === "full";
}

export function canApprove(level: PermissionLevel): boolean {
  return level === "full";
}

export function isFull(level: PermissionLevel): boolean {
  return level === "full";
}
