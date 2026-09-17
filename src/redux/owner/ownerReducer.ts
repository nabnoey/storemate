import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ownerService } from "../../services/owner.service";
import { DashboardService } from "../../services/dashboard.service";
import type {
  Store,
  UserRole,
  OwnerState,
  GetUserManagementParams,
  UserManagementResponse,
} from "../../types/owner";

const ROLE_PRIORITY: Record<string, number> = {
  OWNER: 0,
  ADMIN: 0,
  MODERATOR: 1,
  USER: 2,
};

const initialState: OwnerState = {
  users: [],
  page: 0,
  size: 5,
  total: 0,
  totalPages: 0,
  loading: false,
  error: null,
  store: null,
  dashData: null,
  salesData: null,
};

export const getUserManagement = createAsyncThunk<
  UserManagementResponse,
  GetUserManagementParams
>("owner/getUserManagement", async ({ page, size, search }) => {
  return await ownerService.getUserManagement(page, size, search);
});

export const getStore = createAsyncThunk("owner/getStore", async () => {
  return await ownerService.getStore();
});

export const getOwnerDashboard = createAsyncThunk(
  "owner/getOwnerDashboard",
  async () => {
    const res = await DashboardService.getOwnerDashboard();
    return res?.data || res;
  }
);

export const getSalesAnalytics = createAsyncThunk(
  "owner/getSalesAnalytics",
  async () => {
    const res = await DashboardService.getSalesAnalytics();
    return res?.data || res;
  }
);

export const importSalesData = createAsyncThunk(
  "owner/importSalesData",
  async (file: File) => {
    const res = await DashboardService.importSalesData(file);
    return res?.data || res;
  }
);

export const updateUserRole = createAsyncThunk(
  "owner/updateUserRole",
  async ({ userId, roleName }: { userId: number; roleName: UserRole }) => {
    await ownerService.updateUserRole(userId, roleName);
    return { userId, roleName };
  },
);

export const suspendUser = createAsyncThunk(
  "owner/suspendUser",
  async (userId: number) => {
    const res = await ownerService.suspendUser(userId);
    return { userId, response: res };
  },
);

export const activeUser = createAsyncThunk(
  "owner/activeUser",
  async (userId: number) => {
    const res = await ownerService.activeUser(userId);
    return { userId, response: res };
  },
);

export const updateStore = createAsyncThunk(
  "owner/updateStore",
  async (data: Store) => {
    return await ownerService.updateStore(data);
  },
);

const ownerSlice = createSlice({
  name: "owner",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // GET USER MANAGEMENT
      .addCase(getUserManagement.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserManagement.fulfilled, (state, action) => {
        state.loading = false;

        // จัดเรียงลำดับ Role ลื่นขึ้นด้วยโครงสร้างที่คลีน
        state.users = [...(action.payload.data ?? [])].sort((a, b) => {
          const normA = (a.role || "")
            .toUpperCase()
            .replace("ROLE_", "")
            .trim();
          const normB = (b.role || "")
            .toUpperCase()
            .replace("ROLE_", "")
            .trim();
          return (ROLE_PRIORITY[normA] ?? 99) - (ROLE_PRIORITY[normB] ?? 99);
        });

        state.page = action.payload.page;
        state.size = action.payload.size || 10; 
        state.total = action.payload.total ?? 0;
        
        
        state.totalPages = Math.ceil(state.total / state.size);
      })

      
      .addCase(getStore.fulfilled, (state, action) => {
        state.store = action.payload;
      })

      .addCase(suspendUser.fulfilled, (state, action) => {
        const { userId, response } = action.payload;
        const user = state.users.find((u) => u.id === userId);
        if (user) {
          const updatedData = response?.data || response;
          user.suspended =
            updatedData && typeof updatedData.suspended === "boolean"
              ? updatedData.suspended
              : true;
        }
      })

  // ACTIVE USER
      .addCase(activeUser.fulfilled, (state, action) => {
        const { userId, response } = action.payload;
        const user = state.users.find((u) => u.id === userId);
        if (user) {
          const updatedData = response?.data || response;
          user.suspended =
            updatedData && typeof updatedData.suspended === "boolean"
              ? updatedData.suspended
              : false;
        }
      })

      // UPDATE USER ROLE
      .addCase(updateUserRole.fulfilled, (state, action) => {
        const { userId, roleName } = action.payload;
        const user = state.users.find((u) => u.id === userId);
        if (user) {
          user.role = roleName;
        }
      })

      // GET OWNER DASHBOARD
      .addCase(getOwnerDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOwnerDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.dashData = action.payload;
      })
      .addCase(getOwnerDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "เกิดข้อผิดพลาดในการโหลดข้อมูลแดชบอร์ด";
      })

      // GET SALES ANALYTICS
      .addCase(getSalesAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSalesAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.salesData = action.payload;
      })
      .addCase(getSalesAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "เกิดข้อผิดพลาดในการโหลดข้อมูลยอดขาย";
      })


      // UPDATE STORE
      .addCase(updateStore.fulfilled, (state, action) => {
        const updatedStore = action.payload?.data || action.payload;
        if (updatedStore && updatedStore.storeName) {
          state.store = updatedStore;
        }
      });
  },
});

export default ownerSlice.reducer;
