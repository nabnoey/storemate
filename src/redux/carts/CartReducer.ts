import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { CartItem, CartItemRequestDTO } from "../../types/cartItem";
import { CartItemService } from "../../services/cartitem.service";

type CartState = {
  items: CartItem[];
  selectedItems: CartItem[];

}

const initialState: CartState = {
  items: [],
  selectedItems: [],
};

export const fetchCartThunk = createAsyncThunk("cart/fetchCart", async () => {
  const response = await CartItemService.getCart();
  return response;
});

export const addToCartThunk = createAsyncThunk(
  "cart/addToCart",
  async (itemData: CartItemRequestDTO, { dispatch }) => {
      const response = await CartItemService.addToCart(itemData);
      dispatch(fetchCartThunk());
      return response;
    }
,
);

export const incrementCartItemThunk = createAsyncThunk(
  "cart/incrementCartItem",
  async (productId: number) => {
    
      const response = await CartItemService.incrementCartItem(productId);
      return response;
  },
);

export const decrementCartItemThunk = createAsyncThunk(
  "cart/decrementCartItem",
  async (productId: number) => {

      const response = await CartItemService.decrementCartItem(productId);
      return response;
  },
);

export const deleteCartItemThunk = createAsyncThunk(
  "cart/deleteCartItemThunk",
  async (productId: number) => {
    const response = await CartItemService.removeCartItem(productId);
    return response;
  },
);

const cartSlice = createSlice({
  name: "carts",
  initialState,
  reducers: {
    setSelectedItems: (state, action: PayloadAction<CartItem[]>) => {
      state.selectedItems = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(addToCartThunk.fulfilled, (state, action) => {
        const requestData = action.meta.arg;
        const existingItem = state.items.find(
          (i) => (i.productId) === (requestData.productId),
        );

        if (existingItem) {
          existingItem.quantity += requestData.quantity;
        } else if (
          typeof action.payload === "object" &&
          action.payload !== null
        ) {
          state.items.push(action.payload);
        }
      })
  
      .addCase(incrementCartItemThunk.fulfilled, (state, action) => {
        const productId = action.meta.arg;

        const item = state.items.find(
          (i) => (i.productId) === (productId),
        );
        if (item) {
          item.quantity += 1;
        }
      })

      .addCase(decrementCartItemThunk.fulfilled, (state, action) => {
        const productId = action.meta.arg;

        const item = state.items.find(
          (i) => (i.productId) === (productId),
        );
        if (item && item.quantity > 1) {
          item.quantity -= 1;
        }
      })
      .addCase(deleteCartItemThunk.fulfilled, (state, action) => {
        const productId = action.meta.arg;

        state.items = state.items.filter(
          (item) => item.productId !== productId,
        );

        state.selectedItems = state.selectedItems.filter(
          (item) => item.productId !== productId,
        );
      })
 
      .addCase(fetchCartThunk.fulfilled, (state, action) => {
        state.items = action.payload;
      })
  },
});

export const { setSelectedItems } = cartSlice.actions;
export default cartSlice.reducer;
