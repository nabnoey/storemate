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
  roleName?: string;
  suspended?: boolean;
}

/** API response จาก GET /owner/users?page=0&size=5 */
export interface UserManagementResponse {
  data: User[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

export interface MonthIncomeGraph {
  monthNo: number;
  month: string;
  totalMonthlyIncome: number;
}

export interface YearIncomeData {
  year: string;
  totalIncome: number;
  graph: MonthIncomeGraph[];
}

export interface YearActiveIncomeChart {
  growthRate: number;
  thisYear: YearIncomeData;
  lastYear: YearIncomeData;
}

export interface WeeklyIncomeGraph {
  dayOfWeek: number;
  date: string;
  totalSummary: number;
}

export interface WeeklyActiveIncomeChart {
  totalWeeklyIncome: number;
  graph: WeeklyIncomeGraph[];
}

export interface YearActiveOrderChart {
  monthNo: number;
  month: string;
  total: number;
}

export interface OrderChannelRate {
  orderChannel: string;
  avg: number;
}

export interface SalesPercentage {
  id: number;
  name: string;
  avg: number;
}

export interface UserChart {
  oldUser: number;
  newUser: number;
  inactiveUser: number;
}

export interface RegionalRevenue {
  geography: string;
  totalOrders: number;
}

export interface ReviewItem {
  score: number;
  reviewScore: number;
}

export interface ProductAlertItem {
  id: number;
  name: string;
  imageUrl: string;
  stockQuantity: string | number;
  status: string;
}

export interface DashboardResponse {
  activeUsers: number;
  newUserToday: number;
  totalRevenue: number;
  totalOrder: number;
  newUsers: number;
  totalProductSale: number;
  yearActiveIncomeChart?: YearActiveIncomeChart;
  weeklyActiveIncomeChart?: WeeklyActiveIncomeChart;
  yearActiveOrderChart?: YearActiveOrderChart[];
  orderChannelRete?: OrderChannelRate[];
  salesPercentage?: SalesPercentage[];
  userChart?: UserChart;
  regionalRevenue?: RegionalRevenue[];
  reviews?: ReviewItem[];
  productAlert?: ProductAlertItem[];
}
