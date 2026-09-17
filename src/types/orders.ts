import type { PaymentMethod } from "./payment";

export interface OrderAddress {
  id: number;
  streetAddress: string;
  subdistrict: string;
  district: string;
  province: string;
  zipcode: string;
}
export type OrderStatus =
  | "ALL"
  | "COMPLETED"
  | "PENDING"
  | "PROCESSING"
  | "RECEIVED"
  | "CANCELLED"
  | "REFUNDED";

export const statusConfig: Record<
  OrderStatus,
  { label: string; color: string }
> = {
  PENDING: { label: "ที่ต้องชำระ", color: "text-blue-500" },
  PROCESSING: { label: "ที่ต้องจัดส่ง", color: "text-[#3B82F6]" },
  RECEIVED: { label: "ที่ต้องได้รับ", color: "text-[#1E40AF]" },
  COMPLETED: { label: "คำสั่งซื้อสำเร็จ", color: "text-[#10B981]" },
  CANCELLED: { label: "ยกเลิกแล้ว", color: "text-red-500" },
  REFUNDED: { label: "คืนเงินแล้ว", color: "text-purple-500" },
  ALL: { label: "ทั้งหมด", color: "text-black" },
};


//แปลง สถานะของออเดอร์ (status) ให้เป็น ข้อความ
export const getOrderLabel = (status: OrderStatus): string => {
  return statusConfig[status]?.label || status;
};

export interface OrderItem {
  id: number;
  productName: string;
  imageUrl: string;
  price: number;
  quantity: number;
  subTotal: number;
  is_review: boolean;
}

export interface OrderRecipient {
  recipientName: string;
  phone: string;
  streetAddress: string;
  subdistrict: string;
  district: string;
  province: string;
  zipcode: string;
}

export interface Order {
  id: number;
  orderNo: string;
  status: OrderStatus;
  statusDelivery?: string;
  checkoutType: PaymentMethod;

  orderItems: OrderItem[];
  orderAddress: OrderAddress[]; //ใช้กับorderDetail
  orderRecipient: OrderRecipient; //ใช้กับorderDetail

  total: number;
  createdAt: string;
  reason: RefundRequest["reason"];
}

export interface OrdersState {
  orders: Order[];
  loading: boolean;
  error: string | null;
}

export interface StatusOrderTabsProps {
  activeTab: string;
   onTabChange: (tabName: OrderStatus) => void;
}

export interface RefundRequest {
  orderNo: Order["orderNo"];
  reason: string;
  description: string;
}
