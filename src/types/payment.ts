import type { Order } from "./orders";
export type PaymentMethod = "CARD" | "PROMPTPAY" | "DESTINATION";

export type SavedCard = {
  id: string;
  brand: string;
  bankName: string;
  last4: string;
};

export type PaymentIntentPayload = {
  ids: number;
  checkoutType: PaymentMethod;
  cardId?: string; // จะมีเฉพาะถ้า checkoutType เป็น "CARD"
};

export type PaymentNowPayload = {
  id: number;
  quantity: number;
  checkoutType: PaymentMethod;
  cardId?: string; // จะมีเฉพาะถ้า checkoutType เป็น "CARD"
};

export interface RetryPaymentRequest {
  orderNo: Order["orderNo"];
}

export interface ReOrderPayment {
  orderNo: Order["orderNo"];
  checkoutType: PaymentMethod;
}

export interface PaymentIntentResponse {
  paymentIntentId: string;
  paymentExpired: string;
  orderNo: string;
  clientSecret: string;
}
