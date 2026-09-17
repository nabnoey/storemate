import api from "./api";
import type { RefundsResponse, RefundItem } from "../types/moderator/refundMod";

const getAllOrders = async (keyword?: string, startDate?: string, endDate?: string,period?:string, page?: number, size?: number) => {
  const res = await api.get(`${import.meta.env.VITE_MOD_API}/orders`, {
    params: { keyword, startDate, endDate, period, page, size },
  });
  return res.data;
};

//  refundOrder
const getRefunds = async (
  page: number,
  size: number,
  keyword: string | undefined,
  status: string,
): Promise<RefundsResponse> => {
  const res = await api.get(`${import.meta.env.VITE_MOD_API}/orders/refund`, {
    params: { page, size, keyword, status },
  });
  return res.data;
};

const getRefundDetail = async (refundNo: string): Promise<RefundItem> => {
  const res = await api.get(
    `${import.meta.env.VITE_MOD_API}/orders/refund/${refundNo}`,
  );
  return res.data;
};

const approveRefund = async (refundNo: string): Promise<void> => {
  const res = await api.get(
    `${import.meta.env.VITE_PAYMENT_REFUND}/${refundNo}/approve`,
  );
  return res.data;
};

const rejectRefund = async (refundNo: string): Promise<void> => {
  const res = await api.get(
    `${import.meta.env.VITE_PAYMENT_REFUND}/${refundNo}/reject`,
  );
  return res.data;
};

const shippingOrder = async (Ids: number[]) => {
  const res = await api.post(
    `${import.meta.env.VITE_MOD_API}/orders/shipping-label`,
    { ids: Ids }
  );
  return res.data;
};


const getOrderByOrderNo = async (orderNo: string) => {
  const res = await api.get(
    `${import.meta.env.VITE_MOD_API}/orders/${orderNo}`,
  );
  return res.data;
};

const addProduct = async (data: FormData) => {
  const res = await api.post(`${import.meta.env.VITE_MOD_API}/products`, data);
  return res;
};

const getproducts = async (page?: number, size?: number, keyword?: string) => {
  const res = await api.get(`${import.meta.env.VITE_MOD_API}/products`, {
    params: { page, size, keyword },
  });
  return res;
}
const updateProduct = async (id: number, data: FormData) => {
  const res = await api.put(
    `${import.meta.env.VITE_MOD_API}/products/${id}`,
    data,
  );
  return res.data;
};

const deleteProduct = async (id: number) => {
  const res = await api.delete(
    `${import.meta.env.VITE_MOD_API}/products/${id}`,
  );
  return res.data;
};



export const changeStatus = async (orderNo: string, status: string) => {
  const res = await api.put(
    `${import.meta.env.VITE_MOD_API}/orders/${orderNo}/change-status`,
    { status }
  );
  return res.data;
};

export const ModeratorService = {
  getAllOrders,
  updateProduct,
  deleteProduct,
  shippingOrder,
  addProduct,
  getOrderByOrderNo,
  changeStatus,
  getRefunds,
  rejectRefund,
  approveRefund,
  getRefundDetail,
  getproducts,
};
