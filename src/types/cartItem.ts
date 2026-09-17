export type CartItem = {
  cartItemId: number | null;
  productId: number;
  productName: string;
  imageUrl: string | null;
  price: number;
  quantity: number;
  subTotal: number;
  stockQuantity: number;
  productStatus: "ACTIVE" | "INACTIVE" |"CHECKED_OUT";
};

export type CartItemRequestDTO = Pick<CartItem, "productId" | "quantity">;
export type UpdateCartItemDTO = Pick<CartItem, "productId">;
