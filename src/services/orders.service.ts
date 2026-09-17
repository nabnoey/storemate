import api from "./api";
import type { OrderStatus } from "../types/orders";

const getOrders = async (status: OrderStatus) => {
  const res = await api.get(`${import.meta.env.VITE_ORDER_API}`, {
    params: { status },
  });
  return res.data;
};

const getOrdersStatus = async (orderNo: string) => {
  const res = await api.get(
    `${import.meta.env.VITE_ORDER_API}/${orderNo}/status`,
  );
  return res.data;
};

const orderDetails = async (orderNo: string) => {
  const res = await api.get(`${import.meta.env.VITE_ORDER_API}/${orderNo}`);
  return res.data;
};

export const OrdersService = {
  getOrders,
  getOrdersStatus,
  orderDetails,
};
