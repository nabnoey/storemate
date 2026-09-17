import type { OrderStatus } from "../types/orders";

import type { PaymentMethod } from "../types/payment";

export const statusConfig = {
  ALL: { tab: "ทั้งหมด", color: "text-black" },
  COMPLETED: {
    tab: "คำสั่งซื้อสำเร็จ",
    color: "text-green-500",
  },
  PENDING: { tab: "ที่ต้องชำระ", color: "text-[#1E40AF]" },
  PROCESSING: {
    tab: "ที่ต้องจัดส่ง",
    color: "text-blue-500",
  },
  RECEIVED: {
    tab: "ที่ต้องได้รับ",
    color: "text-[#1E40AF]",
  },
  CANCELLED: {
    tab: "ยกเลิก",
    color: "text-red-500",
  },
  REFUNDED: {
    tab: "คืนเงิน",
    color: "text-red-500",
  },
} as const;

export const getOrderLabel = (
  status: OrderStatus,
  paymentMethod: PaymentMethod,
) => {
  // สำหรับการชำระเงินปลายทาง ให้แสดงว่าเป็นรายการที่ต้องจัดส่ง
  if (paymentMethod === "DESTINATION") {
    switch (status) {
      case "PENDING":
      case "PROCESSING":
        return "ที่ต้องจัดส่ง";
      case "RECEIVED":
        return "ที่ต้องได้รับ";
      case "COMPLETED":
        return "คำสั่งซื้อสำเร็จ";
      case "CANCELLED":
        return "ยกเลิกคำสั่งซื้อ";
      case "REFUNDED":
        return "คืนเงิน";
      default:
        return "-";
    }
  }

  // พร้อมเพย์ กับ บัตรเครดิต
  switch (status) {
    case "PENDING":
      return "ที่ต้องชำระ";
    case "PROCESSING":
      return "ที่ต้องจัดส่ง";
    case "RECEIVED":
      return "ที่ต้องได้รับ";
    case "COMPLETED":
      return "คำสั่งซื้อสำเร็จ";
    case "CANCELLED":
      return "ยกเลิกคำสั่งซื้อ";
    case "REFUNDED":
      return "คืนเงิน";
    default:
      return "-";
  }
};
