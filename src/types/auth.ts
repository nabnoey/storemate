import type { User } from "./user";

export interface AuthUser {
  type: "Bearer";
  token: string;
  user: User;
}
