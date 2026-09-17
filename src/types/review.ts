export interface Reviewer {
  id: number;
  name: string;
  imageUrl: string;
}

export interface Review {
  id: number;
  reviewer: Reviewer;
  reviewScore: number;
  message: string;
  createdAt: string;
  orderNo: string;
}

//ดึงมาเฉพาะ ดาว กับ ข้อความ review เพราะ backend ใช้แค่นี้
export type CreateReviewPayload = Pick<Review, "reviewScore" | "message">;
