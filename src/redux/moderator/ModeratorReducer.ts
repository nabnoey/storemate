import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ModeratorService } from "../../services/moderator.service";
import type { OrderMod } from "../../types/moderator/ordersMod";
import type { ProductMod } from "../../types/moderator/productMod";

interface ModeratorState {
  orders: OrderMod[];
  orderDetail: OrderMod[];
  products: ProductMod[];
  loading: boolean;
  totalPages: number;
}

const initialState: ModeratorState = {
  orders: [],
  orderDetail: [],
  products: [],
  loading: false,
  totalPages: 0,
};

export const fetchAllOrders = createAsyncThunk(
  "moderator/fetchAllOrders",
  async ({
    keyword,
    startDate,
    endDate,
    period,
    page,
    size,
  }: {
    keyword?: string;
    startDate?: string;
    endDate?: string;
    period?: string;
    page: number;
    size: number;
  }) => {
    const res = await ModeratorService.getAllOrders(
      keyword,
      startDate,
      endDate,
      period,
      page,
      size,
    );
    return res;
  },
);

export const shippingOrder = createAsyncThunk<OrderMod[], number[]>(
  "moderator/shippingOrder",
  async (orderIds: number[]) => {
    const res = await ModeratorService.shippingOrder(orderIds);
    return res;
  },
);

export const getOrderByOrderNo = createAsyncThunk(
  "moderator/getOrderByOrderNo",
  async (orderNo: string) => {
    const res = await ModeratorService.getOrderByOrderNo(orderNo);
    return res;
  },
);

export const addProduct = createAsyncThunk(
  "moderator/addProduct",
  async (data: FormData) => {
    const res = await ModeratorService.addProduct(data);
    return res;
  },
);

export const getproducts = createAsyncThunk(
  "moderator/getproducts",
  async ({
    page,
    size,
    keyword,
  }: {
    page: number;
    size: number;
    keyword?: string;
  }) => {
    const res = await ModeratorService.getproducts(page, size, keyword);
    return res;
  },
);

export const editProduct = createAsyncThunk(
  "moderator/editProduct",
  async ({ id, data }: { id: number; data: FormData }) => {
    const res = await ModeratorService.updateProduct(id, data);
    return res;
  },
);

export const deleteProduct = createAsyncThunk(
  "moderator/deleteProduct",
  async (id: number) => {
    const res = await ModeratorService.deleteProduct(id);
    return res;
  },
);

export const changeStatus = createAsyncThunk(
  "moderator/changeStatus",
  async ({ orderNo, status }: { orderNo: string; status: string }) => {
    const res = await ModeratorService.changeStatus(orderNo, status);
    return res;
  },
);

const moderatorSlice = createSlice({
  name: "moderator",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.orders = action.payload.content;
        state.totalPages = action.payload?.totalPages;
        state.loading = false;
      })

      .addCase(shippingOrder.fulfilled, (state, action) => {
        state.orders = state.orders.map(
          (order) => action.payload.find((o) => o.id === order.id) ?? order,
        );
      })
            .addCase(getOrderByOrderNo.pending, (state) => {
       state.loading = true;
      })

      .addCase(getOrderByOrderNo.fulfilled, (state, action) => {
        state.orderDetail = [action.payload];
        state.loading = false;
      })

      .addCase(changeStatus.fulfilled, (state, action) => {
  const updatedOrder = action.payload;

  // อัปเดตในหน้ารายการ
  state.orders = state.orders.map((order) =>
    order.orderNo === updatedOrder.orderNo
      ? { ...order, ...updatedOrder }
      : order,
  );

  // อัปเดตในหน้า Order Detail
  state.orderDetail = state.orderDetail.map((order) =>
    order.orderNo === updatedOrder.orderNo
      ? { ...order, ...updatedOrder }
      : order,
  );
})

      .addCase(addProduct.fulfilled, (state, action) => {
        if (Array.isArray(state.products)) {
          state.products.push(action.payload.data);
        }
      })
      .addCase(editProduct.fulfilled, (state, action) => {
        if (Array.isArray(state.products)) {
          const updatedProduct = action.payload?.data || action.payload;
          if (updatedProduct && updatedProduct.id) {
            state.products = state.products.map((p) =>
              String(p.id) === String(updatedProduct.id)
                ? { ...p, ...updatedProduct }
                : p,
            );
          }
        }
      })

      .addCase(deleteProduct.fulfilled, (state, action) => {
        const deletedId = action.meta.arg;

        state.products = state.products.map((product) =>
          product.id === deletedId
            ? {
                ...product,
                status: "DELETED",
              }
            : product,
        );
      })
      .addCase(getproducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(getproducts.fulfilled, (state, action) => {
        const items = action.payload?.data?.data;
        if (Array.isArray(items)) {
          state.products = items;
          state.loading = false;
          const totalItems = action.payload?.data?.total || 0;
          state.totalPages = Math.ceil(totalItems / 10);
        }
      });
  },
});

export default moderatorSlice.reducer;
