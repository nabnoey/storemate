import api from "./api"
import type { RegisterDTO, LoginDTO } from "../types/user"
import type { AuthUser } from "../types/auth"
import { TokenService } from "./token.service"

export const registerService = async (data: RegisterDTO) => {
  const res = await api.post(`${import.meta.env.VITE_AUTH_API}/register`, data)
  return res.data
}

export const loginService = async (data: LoginDTO) => {
  const res = await api.post<AuthUser>(`${import.meta.env.VITE_AUTH_API}/login`, data)
  if (res.status === 200 && res.data?.token) {
    TokenService.setToken(res.data.token)
  }
  return res.data
}

export const forgotPasswordService = async (email: string) => {
  const res = await api.post<AuthUser>(`${import.meta.env.VITE_AUTH_API}/forgot-password?email=${email}`)
  return res.data
}

export const resetPasswordService = async (token: string, password: string, confirmPassword: string) => {
  const res = await api.post<AuthUser>(`${import.meta.env.VITE_AUTH_API}/reset-password?token=${token}`, { token, password, confirmPassword })
  return res.data
}

export const changePasswordService = async (oldPassword: string, newPassword: string, confirmPassword: string) => {
  const res = await api.post<AuthUser>(`${import.meta.env.VITE_AUTH_API}/change-password`, { oldPassword, newPassword, confirmPassword })
  return res.data
}

export const AuthService = {
  registerService,
  loginService,
  forgotPasswordService,
  resetPasswordService,
  changePasswordService
}