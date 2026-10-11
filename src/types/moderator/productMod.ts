import type { Product } from "../product";

export interface ProductMod {
  id: number;
  productNo: string;
  productName: string;
  category: number | string;
  price: number;
  status: Product["status"];
  description: string;
  stockQuantity: number;
}

// ---- เพิ่มใหม่: ย้ายมาจากคอมโพเนนต์ ----

export interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  product?: ProductMod | null;
}
export const STATUS_CONFIG = {
  ACTIVE: {
    label: "พร้อมจำหน่าย",
    className: "bg-green-100 text-green-700",
  },
  INACTIVE: {
    label: "ไม่พร้อมจำหน่าย",
    className: "bg-red-100 text-red-600",
  },
  DELETED: {
    label: "ลบแล้ว",
    className: "bg-gray-200 text-gray-600",
  },
};

export interface ProductFormValues {
  productName: string;
  categoryName: string;
  price: number | "";
  stockQuantity: number | "";
  status: "ACTIVE" | "INACTIVE";
  description: string;
}

