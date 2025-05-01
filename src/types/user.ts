export enum UserRole {
  EMPLOYEE = "employee",
  IT_STAFF = "it_staff",
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
  department?: string;
  phone_number?: string;
  location?: string;
}

export interface UserUpdate {
  full_name?: string;
  department?: string;
  phone_number?: string;
  location?: string;
  password?: string;
}
