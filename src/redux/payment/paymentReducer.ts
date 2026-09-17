import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { PaymentService } from "../../services/payment.service";
import type {
  PaymentIntentPayload,
  PaymentNowPayload,
  RetryPaymentRequest,
  ReOrderPayment,
} from "../../types/payment";

import type { RefundRequest } from "../../types/orders";

interface PaymentState {
  status: "PENDING" | "PAYMENT_SUCCESS" | "PAYMENT_FAILS";
  orderId: string | null;

  loading: boolean;
  error: string | null;
}

// ค่าเริ่มต้น redux
const initialState: PaymentState = {
  status: "PENDING",
  orderId: null,

  loading: false,
  error: null,
};

export const createPaymentIntentThunk = createAsyncThunk(
  // เรียกว่า Action type prefix เอาไว้เรียกอัตโนมัติใน extra reducer
  "payment/createIntent",
  async (data: PaymentIntentPayload, thunkAPI) => {
    try {
      return await PaymentService.createPaymentIntent(data);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Create payment intent failed",
      );
    }
  },
);

export const paymentNowThunk = createAsyncThunk(
  "payment/paymentNow",
  async (data: PaymentNowPayload, thunkAPI) => {
    try {
      return await PaymentService.paymentNow(data);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Payment failed",
      );
    }
  },
);

export const sendRefundThunk = createAsyncThunk(
  "payment/sendRefund",
  async (data: RefundRequest, thunkAPI) => {
    try {
      return await PaymentService.sendRefund(data);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Refund failed",
      );
    }
  },
);

export const retryPaymentThunk = createAsyncThunk(
  "payment/retry",
  async (data: RetryPaymentRequest, thunkAPI) => {
    try {
      return await PaymentService.retryPayment(data);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Retry payment failed",
      );
    }
  },
);

export const reOrderPaymentThunk = createAsyncThunk(
  "payment/reorder",
  async (data: ReOrderPayment, thunkAPI) => {
    try {
      return await PaymentService.reOrderPayment(data);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Reorder payment failed",
      );
    }
  },
);

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    setPaymentStatus: (
      state,
      action: PayloadAction<{
        status: PaymentState["status"];
        orderId?: string;
      }>,
    ) => {
      if (state.status === action.payload.status) return;

      state.status = action.payload.status;
      state.orderId = action.payload.orderId || null;
    },

    resetPaymentStatus: (state) => {
      state.status = "PENDING";
      state.orderId = null;
    },
  },

  extraReducers: (builder) => {
    builder

      .addCase(paymentNowThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.status = "PENDING";
      })

      .addCase(paymentNowThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.orderId = action.payload.orderNo;
      })

      .addCase(paymentNowThunk.rejected, (state, action) => {
        state.loading = false;
        state.status = "PAYMENT_FAILS";
        state.error = action.payload as string;
      })

      .addCase(createPaymentIntentThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(createPaymentIntentThunk.fulfilled, (state) => {
        state.loading = false;
      })

      .addCase(createPaymentIntentThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(sendRefundThunk.pending, (state) => {
        state.loading = true;
      })

      .addCase(sendRefundThunk.fulfilled, (state) => {
        state.loading = false;
      })

      .addCase(sendRefundThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(retryPaymentThunk.pending, (state) => {
        state.loading = true;
      })

      .addCase(retryPaymentThunk.fulfilled, (state) => {
        state.loading = false;
      })

      .addCase(retryPaymentThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(reOrderPaymentThunk.pending, (state) => {
        state.loading = true;
      })

      .addCase(reOrderPaymentThunk.fulfilled, (state) => {
        state.loading = false;
      })

      .addCase(reOrderPaymentThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setPaymentStatus, resetPaymentStatus } = paymentSlice.actions;
export default paymentSlice.reducer;
