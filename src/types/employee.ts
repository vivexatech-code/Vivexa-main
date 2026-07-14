export type EmployeeType = "Employee" | "Intern";
export type EmployeeStatus = "Active" | "Inactive";

/** Circular crop state for ID card photo (react-easy-crop compatible). */
export type PhotoCrop = {
  x: number;
  y: number;
  zoom: number;
};

export const DEFAULT_PHOTO_CROP: PhotoCrop = {
  x: 0,
  y: 0,
  zoom: 1.2,
};

export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  designation: string;
  phone: string;
  employeeType: EmployeeType;
  profilePhoto: string;
  /** Original upload — used when re-adjusting crop */
  profilePhotoOriginal?: string;
  photoCrop?: PhotoCrop;
  joinedDate: string;
  status: EmployeeStatus;
  verificationUrl: string;
  createdAt: string;
  updatedAt: string;
}

export type EmployeeFormData = {
  name: string;
  designation: string;
  phone: string;
  employeeType: EmployeeType;
  profilePhoto: string;
  joinedDate: string;
  status: EmployeeStatus;
};

export type PublicEmployee = Pick<
  Employee,
  | "employeeId"
  | "name"
  | "designation"
  | "employeeType"
  | "profilePhoto"
  | "joinedDate"
  | "status"
>;

export type DashboardStats = {
  totalEmployees: number;
  totalInterns: number;
  activeEmployees: number;
  inactiveEmployees: number;
};
