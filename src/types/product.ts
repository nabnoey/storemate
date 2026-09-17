import type { Review } from "./review";

export type Product = {
  id: number;
  productName: string;
  imageUrl: string;
  price: number;
  categoryName: string;
  sammary: string;
  description: string;
  status: "ACTIVE" | "INACTIVE"| "DELETED";
  createAt: string;
  stockQuantity: number;
  productStatus: "ACTIVE" | "INACTIVE" | "DELETED";
  is_deleted: boolean;
  quantity: number;
};

export interface CategoryGroup {
  categoryName: string;
  products: Product[];
}

export interface ProductImage {
  id: number;
  imageName: string;
  imageUrl: string;
}

export interface ProductDetail {
  id: number;
  productName: string;
  description: string;
  quantity: number;
  price: number;
  RatingScore: number;
  productImages: ProductImage[];
  reviews: Review[];
  productStatus: "ACTIVE" | "INACTIVE" | "DELETED";
}
