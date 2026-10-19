import api from "./api";
import type { GetDashboardParams } from "../types/owner";

const OWNER_API = import.meta.env.VITE_OWNER_API || "owner";

export const DashboardService = {
  getOwnerDashboard: async (params?: GetDashboardParams) => {
    const response = await api.get(`${OWNER_API}/dashboard`, { params });
    return response.data;
  },
  
  getSalesAnalytics: async (period?: string) => {
    const response = await api.get(`/${OWNER_API}/sales-analytics/dashboard`, {
      params: { period },
    });
    return response.data;
  },

  importSalesData: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post(`${OWNER_API}/import`, formData);
    return response.data;
  },
};