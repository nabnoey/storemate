import type { CreateReviewPayload } from "./../../types/review";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ReviewsService } from "../../services/reviews.service";

export const fetchProductReviews = createAsyncThunk(
  "reviews/fetchReviews",
  async (orderItemId: number, { rejectWithValue }) => {
    try {
      const response = await ReviewsService.getReviews(orderItemId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to fetch reviews");
    }
  },
);

export const submitProductReview = createAsyncThunk(
  "reviews/submitReview",
  async (
    {
      orderItemId,
      payload,
    }: { orderItemId: number; payload: CreateReviewPayload },
    { rejectWithValue },
  ) => {
    try {
      const response = await ReviewsService.createReviews(orderItemId, payload);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to submit review");
    }
  },
);

export const updateProductReview = createAsyncThunk(
  "reviews/updateReview",
  async (
    { id, payload }: { id: number; payload: CreateReviewPayload },
    { rejectWithValue },
  ) => {
    try {
      const response = await ReviewsService.editReviews(id, payload);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const deleteProductReview = createAsyncThunk(
  "reviews/deleteReview",
  async ({ id }: { id: number }, { rejectWithValue }) => {
    try {
      await ReviewsService.deleteReviews(id);
      return id;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);
const reviewSlice = createSlice({
  name: "reviews",
  initialState: {
    isLoading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    // fetchReviews
    builder
      .addCase(fetchProductReviews.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductReviews.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(fetchProductReviews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    //createReview
    builder
      .addCase(submitProductReview.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(submitProductReview.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(submitProductReview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    //editReview
    builder
      .addCase(updateProductReview.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProductReview.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(updateProductReview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    //deleteReview
    builder
      .addCase(deleteProductReview.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteProductReview.fulfilled, (state) => {
        state.isLoading = false;
        // ถ้าระบบคุณมีการเก็บ List รีวิวใน State ด้วย คุณสามารถ filter รีวิวที่ถูกลบออกตรงนี้ได้
      })
      .addCase(deleteProductReview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default reviewSlice.reducer;
