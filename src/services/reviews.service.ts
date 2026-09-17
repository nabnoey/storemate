import api from "./api";
import type { CreateReviewPayload, Review } from "../types/review";

const getReviews = async (orderItemId: number): Promise<Review> => {
  const res = await api.get(
    `${import.meta.env.VITE_REVIEW_API}/order-item/${orderItemId}`,
  );
  return res.data;
};

const createReviews = async (
  orderItemId: number,
  payload: CreateReviewPayload,
): Promise<Review> => {
  const res = await api.post(
    `${import.meta.env.VITE_REVIEW_API}/${orderItemId}`,
    payload,
  );
  return res.data;
};

const editReviews = async (
  reviewId: number,
  payload: CreateReviewPayload,
): Promise<Review> => {
  const res = await api.put(
    `${import.meta.env.VITE_REVIEW_API}/${reviewId}`,
    payload,
  );
  return res.data;
};

const deleteReviews = async (
  reviewId: number,
): Promise<{ message: string } | void> => {
  const res = await api.delete(
    `${import.meta.env.VITE_REVIEW_API}/${reviewId}`,
  );
  return res.data;
};

export const ReviewsService = {
  getReviews,
  createReviews,
  editReviews,
  deleteReviews,
};
