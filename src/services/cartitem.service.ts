import api from "./api";
import type { CartItemRequestDTO } from "../types/cartItem";

const getCart = async () => {
  const res = await api.get(`${import.meta.env.VITE_CART_API}/items`);
  return res.data;
};

const addToCart = async (data: CartItemRequestDTO) => {
  const res = await api.post(`${import.meta.env.VITE_CART_API}/items`, data);
  return res.data;
};

const incrementCartItem = async (productId: number) => {
  const res = await api.patch(
    `${import.meta.env.VITE_CART_API}/items/${productId}/increment`,
  );
  return res.data;
};

const decrementCartItem = async (productId: number) => {
  const res = await api.patch(
    `${import.meta.env.VITE_CART_API}/items/${productId}/decrement`,
  );
  return res.data;
};

const removeCartItem = async (productId: number) => {
  const res = await api.delete(
    `${import.meta.env.VITE_CART_API}/items/${productId}`,
  );
  return res.data;
};

export const CartItemService = {
  addToCart,
  incrementCartItem,
  decrementCartItem,
  getCart,
  removeCartItem,
};
