import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type {
  RefundItem,
  RefundsResponse,
} from "../../types/moderator/refundMod";

import { ModeratorService } from "../../services/moderator.service";

export interface RefundState {
  refunds: RefundItem[];
  pendingCount: number;
  total: number;
  selectedRefund: RefundItem | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
}

const initialState: RefundState = {
  refunds: [],
  pendingCount: 0,
  total: 0,
  selectedRefund: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
};

export const fetchRefunds = createAsyncThunk(
  "refunds/fetchRefunds",
  async (
    {
      status,
      page,
      size,
      keyword,
    }: { status: string; page: number; size: number; keyword: string },
    { rejectWithValue },
  ) => {
    try {
      const cleanKeyword = keyword.trim() !== "" ? keyword : undefined;

      const data = await ModeratorService.getRefunds(
        page,
        size,
        cleanKeyword,
        status,
      );

      return data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "เรียกข้อมูลล้มเหลว",
      );
    }
  },
);

export const fetchRefundDetail = createAsyncThunk(
  "refunds/fetchRefundDetail",
  async (refundNo: string, { rejectWithValue }) => {
    try {
      const data = await ModeratorService.getRefundDetail(refundNo);
      return data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "ไม่พบรายละเอียดคำขอ",
      );
    }
  },
);

export const approveRefund = createAsyncThunk(
  "refunds/approveRefund",
  async (id: string, { rejectWithValue }) => {
    try {
      await ModeratorService.approveRefund(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "ขออภัยเกิดข้อผิดพลาดในระบบ",
      );
    }
  },
);

export const rejectRefund = createAsyncThunk(
  "refunds/rejectRefund",
  async (id: string, { rejectWithValue }) => {
    try {
      await ModeratorService.rejectRefund(id);
      return id;
    } catch (err: any) {
      return rejectWithValue("ขออภัยเกิดข้อผิดพลาดในระบบ");
    }
  },
);

const refundSlice = createSlice({
  name: "refunds",
  initialState,
  reducers: {
    clearSelectedRefund: (state) => {
      state.selectedRefund = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRefunds.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchRefunds.fulfilled,
        (state, action: PayloadAction<RefundsResponse>) => {
          state.isLoading = false;
          state.refunds = action.payload.refunds;
          state.pendingCount = action.payload.pendingCount;
          state.total = action.payload.total;
        },
      )
      .addCase(fetchRefunds.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(
        fetchRefundDetail.fulfilled,
        (state, action: PayloadAction<RefundItem>) => {
          state.selectedRefund = action.payload;
        },
      )
      .addMatcher(
        (action) =>
          action.type.endsWith("/pending") && action.type.includes("Refund"),
        (state) => {
          state.isSubmitting = true;
        },
      )
      .addMatcher(
        (action) =>
          action.type.endsWith("/fulfilled") && action.type.includes("Refund"),
        (state) => {
          state.isSubmitting = false;
        },
      )
      .addMatcher(
        (action) =>
          action.type.endsWith("/rejected") && action.type.includes("Refund"),
        (state, action: PayloadAction<any>) => {
          state.isSubmitting = false;
          state.error = action.payload || "เกิดข้อผิดพลาดในการส่งข้อมูล";
        },
      );
  },
});

export const { clearSelectedRefund } = refundSlice.actions;
export default refundSlice.reducer;
