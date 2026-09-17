export const TIME_FILTER_MAP = {
  "วันนี้": "today",
  "สัปดาห์นี้": "week",
  "เดือนนี้": "month",
} 
export type TimeFilter = keyof typeof TIME_FILTER_MAP;

export interface OrderItem {
  id: number;
  productName?: string;
  imageUrl?: string;
  quantity: number;
  price: number;
  subTotal?: number;
}

export interface OrderStatusHistory {
  status: string;

  updatedBy: string;

  updatedAt: string;
}

export interface OrderMod {
  id: number;
  orderNo: string;
  recipientName?: string;
  phone?: string;
  status: string;
  total: number;
  shippingFrom?: string;
  is_printed?: boolean;
  checkoutType?: string;
  orderItems?: OrderItem[];
  orderStatusHistory?: OrderStatusHistory[];
  updatedAt: string;
  createdAt: string;

  // ปรับโครงสร้างตรงนี้ให้ตรงกับ Backend
  orderRecipient?: {
    recipientName?: string;
    phone?: string;
    streetAddress?: string;
    subdistrict?: string;
    district?: string;
    province?: string;
    zipcode?: string;
  };
  
  // เพิ่มฟิลด์รองรับรูปแบบ ShippingLabel
  shippingItems?: OrderItem[];
  senderInfo?: {
    name?: string;
    phone?: string;
    address?: string;
  };
  receiverInfo?: {
    name?: string;
    phone?: string;
    address?: string;
  };
}

export interface ShippingLabel {
  order: OrderMod[];
  shippingItems: OrderItem[];
  total: number;
  checkoutType: string;
  senderInfo:{
    name: string;
    phone: string;
    address: string;
  }
  receiverInfo:{
    name: string;
    phone: string;
    address: string;
  }
}

export const STATUS_ORDER = ["PENDING", "PROCESSING", "RECEIVED", "COMPLETED"];

export const STATUS_LABELS: Record<string, string> = {
  PENDING: "รอดำเนินการ",
  PROCESSING: "กำลังเตรียมสินค้า",
  RECEIVED: "จัดส่งแล้ว",
  COMPLETED: "สำเร็จแล้ว",
};

export const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  PROCESSING: "bg-blue-100 text-blue-700",
  RECEIVED: "bg-purple-100 text-purple-700",
  COMPLETED: "bg-green-100 text-green-700",
};