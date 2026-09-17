import api from "./api";
import type {
  PaymentIntentPayload,
  PaymentNowPayload,
  RetryPaymentRequest,
  ReOrderPayment,
  PaymentIntentResponse,
} from "../types/payment";
import type { RefundRequest } from "../types/orders";

const createPaymentIntent = async (
  data: PaymentIntentPayload,
): Promise<PaymentIntentResponse> => {
  const res = await api.post(
    `${import.meta.env.VITE_ORDER_API}/${import.meta.env.VITE_PAYMENT_API}/intent`,
    data,
  );
  return res.data;
};

const paymentNow = async (
  data: PaymentNowPayload,
): Promise<PaymentIntentResponse> => {
  const res = await api.post(
    `${import.meta.env.VITE_ORDER_API}/${import.meta.env.VITE_PAYMENT_API}/now`,
    data,
  );
  return res.data;
};

const sendRefund = async (data: RefundRequest) => {
  const res = await api.post(
    `${import.meta.env.VITE_PAYMENT_REFUND}/send`,
    data,
  );
  return res.data;
};

const retryPayment = async (
  data: RetryPaymentRequest,
): Promise<PaymentIntentResponse> => {
  const res = await api.post("/retry", data);
  return res.data;
};

const reOrderPayment = async (data: ReOrderPayment) => {
  const res = await api.post(`/payment/reorder`, data);
  return res.data;
};

export const PaymentService = {
  createPaymentIntent,
  paymentNow,
  sendRefund,
  retryPayment,
  reOrderPayment,
};
