export interface Role {
  id: number;
  roleName: "MODERATOR" | "USER" | "ADMIN";
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  accessToken: string;
  image_url: string;
  roles: Role[];
  joinDate?: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  image: string | null;
  roles: Role["roleName"][];
  joinDate: string;
}
export interface RegisterDTO {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export type LoginDTO = Pick<RegisterDTO, "email" | "password">;
