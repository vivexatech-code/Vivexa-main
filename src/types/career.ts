export type CareerType = "Job" | "Internship";
export type CareerWorkType = "On-site" | "Hybrid" | "Remote";
export type CareerEmploymentType = "Full-time" | "Part-time" | "Contract" | "";
export type CareerStatus = "draft" | "published" | "closed";

export interface CareerOpportunity {
  id: string;
  title: string;
  type: CareerType;
  department: string;
  location: string;
  workType: CareerWorkType;
  employmentType: CareerEmploymentType;
  shortDescription: string;
  fullDescription: string;
  responsibilities: string[];
  requirements: string[];
  openings: number;
  deadline: string;
  keepOpen: boolean;
  duration: string;
  stipend: string;
  status: CareerStatus;
  createdAt: string;
  updatedAt: string;
}

export type CareerFormData = Omit<
  CareerOpportunity,
  "id" | "createdAt" | "updatedAt"
>;

export type ApplicationStatus =
  | "new"
  | "review"
  | "shortlisted"
  | "rejected"
  | "selected";

export interface CareerApplication {
  id: string;
  opportunityId: string;
  opportunityTitle: string;
  opportunityType: CareerType;
  name: string;
  email: string;
  phone: string;
  location: string;
  resumeUrl: string;
  portfolioUrl: string;
  coverLetter: string;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
}
