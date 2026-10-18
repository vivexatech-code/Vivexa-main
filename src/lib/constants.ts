/** First auto-generated employee ID (then 12702, 12703, …) */
export const EMPLOYEE_ID_START = 12701;

export const EMPLOYEES_COLLECTION = "employees";
export const COUNTER_COLLECTION = "counters";
export const EMPLOYEE_COUNTER_DOC = "employeeId";

export const EMPLOYEE_TYPES = ["Employee", "Intern"] as const;
export const EMPLOYEE_STATUSES = ["Active", "Inactive"] as const;

export const PROJECTS_COLLECTION = "projects";
export const SERVICES_COLLECTION = "services";

export const CONTENT_STATUSES = ["published", "draft"] as const;
export const PROJECT_CATEGORIES = [
  "Website",
  "E-commerce",
  "Education",
  "Sports",
  "Health & Fitness",
  "Local Business",
  "Other",
] as const;
export const SERVICE_CATEGORIES = [
  "Core Services",
  "Design",
  "Growth",
  "Support",
] as const;
export const PROJECT_TAG_LIMIT = 3;

export const CAREERS_COLLECTION = "careerOpportunities";
export const APPLICATIONS_COLLECTION = "careerApplications";

export const CAREER_TYPES = ["Job", "Internship"] as const;
export const CAREER_WORK_TYPES = ["On-site", "Hybrid", "Remote"] as const;
export const CAREER_EMPLOYMENT_TYPES = [
  "Full-time",
  "Part-time",
  "Contract",
] as const;
export const CAREER_STATUSES = ["draft", "published", "closed"] as const;
export const APPLICATION_STATUSES = [
  "new",
  "review",
  "shortlisted",
  "rejected",
  "selected",
] as const;
export const BLOGS_COLLECTION = "blogs";
export const BLOG_CATEGORIES = [
  "Process",
  "SEO",
  "Security",
  "Design",
  "Company",
  "Other",
] as const;

export const CAREER_DEPARTMENTS = [
  "Design",
  "Engineering",
  "Marketing",
  "Operations",
  "Other",
] as const;

export const COUNTRIES_COLLECTION = "countries";
export const CLIENT_LOGOS_COLLECTION = "clientLogos";

export const ADMIN_USERS_COLLECTION = "admin_users";
export const DEPARTMENTS_COLLECTION = "departments";
export const APPROVAL_REQUESTS_COLLECTION = "approval_requests";
export const AUDIT_LOGS_COLLECTION = "audit_logs";
export const CONTACT_INQUIRIES_COLLECTION = "contactInquiries";

import type { AppModule } from "@/types/auth";

export const APP_MODULE_CONFIG = [
  { id: "dashboard" as const, label: "Dashboard", description: "Overview metrics and system status" },
  { id: "employees" as const, label: "Employees & Team", description: "Staff directory, designations, and ID cards" },
  { id: "countries" as const, label: "Country Management", description: "Multi-country routes, currencies, and hero settings" },
  { id: "logos" as const, label: "Client Logos", description: "Marquee and partner client brand logos" },
  { id: "projects" as const, label: "Projects & Portfolio", description: "Work portfolio and case study showcases" },
  { id: "services" as const, label: "Services & Pricing", description: "Services offerings, tiers, and pricing" },
  { id: "careers" as const, label: "Careers & Openings", description: "Job and internship listings" },
  { id: "applications" as const, label: "Job Applications", description: "Applicant resumes and review workflows" },
  { id: "blogs" as const, label: "Blog & Journal", description: "Articles, author attribution, and SEO" },
  { id: "contacts" as const, label: "Contact Inquiries", description: "Client leads and project inquiries" },
  { id: "approvals" as const, label: "Approval Requests", description: "Review and approve/reject pending changes" },
  { id: "users" as const, label: "User Management", description: "Manage admin users, roles, and security access" },
  { id: "departments" as const, label: "Department Management", description: "Manage departments and default permissions" },
  { id: "audit_logs" as const, label: "Audit Logs", description: "View immutable administrative and security audit trail" },
] as const;

export const APP_MODULE_MAP: Record<AppModule, { id: AppModule; label: string; description: string }> =
  APP_MODULE_CONFIG.reduce((acc, mod) => {
    acc[mod.id as AppModule] = mod;
    return acc;
  }, {} as Record<AppModule, { id: AppModule; label: string; description: string }>);


