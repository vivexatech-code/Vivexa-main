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
