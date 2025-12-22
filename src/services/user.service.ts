import api, { ApiResponse, PaginationParams } from "@/lib/api";
import { User, UserRole } from "@/types";

export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

export interface UpdateUserRequest {
  email?: string;
  password?: string;
  name?: string;
  role?: UserRole;
  isActive?: boolean;
}

export const userService = {
  getAll: async (params?: PaginationParams) => {
    const response = await api.get<ApiResponse<User[]>>("/users", { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<ApiResponse<User>>(`/users/${id}`);
    return response.data;
  },

  create: async (data: CreateUserRequest) => {
    const response = await api.post<ApiResponse<User>>("/users", data);
    return response.data;
  },

  update: async (id: string, data: UpdateUserRequest) => {
    const response = await api.put<ApiResponse<User>>(`/users/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete<ApiResponse<null>>(`/users/${id}`);
    return response.data;
  },

  toggleActive: async (id: string) => {
    const response = await api.patch<ApiResponse<User>>(`/users/${id}/toggle-active`);
    return response.data;
  },
};
