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

export interface ProductFormValues {
  productName: string;
  categoryName: string;
  price: number | "";
  stockQuantity: number | "";
  status: "ACTIVE" | "INACTIVE";
  description: string;
}