import api from "./api";

const OWNER_API = import.meta.env.VITE_OWNER_API || "owner";

export const DashboardService = {
  getOwnerDashboard: async () => {
    const response = await api.get(`${OWNER_API}/dashboard`);
    return response.data;
  },
  
  getSalesAnalytics: async () => {
    const response = await api.get(`${OWNER_API}/sales-analytics/dashboard`);
    return response.data;
  },

  importSalesData: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post(`${OWNER_API}/import`, formData);
    return response.data;
  },
};