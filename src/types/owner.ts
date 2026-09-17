export type UserRole =
  | "OWNER"
  | "ADMIN"
  | "MODERATOR"
  | "USER"

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  suspensionReason: string | null;
  suspendAt: string | null;
  suspended: boolean;
}

export interface Store {
  id: number;
  storeName: string;
  phone: string;
  streetAddress: string;
  subdistrict: string;
  district: string;
  province: string;
  zipcode: string;
  email: string;
  promotionImage: string;
  // imageFile: string | File
}

export interface OwnerState {
  users: User[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  store: Store | null;
  dashData: any;
  salesData: any;
}

export interface GetUserManagementParams {
  page: number;
  size: number;
  search?: string;
}

/** API response จาก GET /owner/users?page=0&size=5 */
export interface UserManagementResponse {
  data: User[];
  page: number;
  size: number;
  total: number;
  totalPages: number;

}
