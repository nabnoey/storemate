import type { User } from "./user";

export interface Cart {
  id: number;
  status: "ACTIVE" | "CHECKED_OUT";
  createAt: string;
  updateAt: string;
  user: User;
}
