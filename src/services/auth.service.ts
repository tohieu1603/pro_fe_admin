import api, { ApiResponse } from "@/lib/api";
import { User, LoginRequest, RegisterRequest, AuthResponse } from "@/types";

export const authService = {
  login: async (data: LoginRequest) => {
    const response = await api.post<ApiResponse<AuthResponse>>("/auth/login", data);
    return response.data;
  },

  register: async (data: RegisterRequest) => {
    const response = await api.post<ApiResponse<User>>("/auth/register", data);
    return response.data;
  },

  logout: async (refreshToken: string) => {
    const response = await api.post<ApiResponse<null>>("/auth/logout", { refreshToken });
    return response.data;
  },

  refresh: async (refreshToken: string) => {
    const response = await api.post<ApiResponse<{ accessToken: string }>>("/auth/refresh", { refreshToken });
    return response.data;
  },

  getMe: async () => {
    const response = await api.get<ApiResponse<User>>("/auth/me");
    return response.data;
  },
};
