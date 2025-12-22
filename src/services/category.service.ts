import api, { ApiResponse, PaginationParams } from "@/lib/api";
import { Category } from "@/types";

export const categoryService = {
  getAll: async (params?: PaginationParams) => {
    const response = await api.get<ApiResponse<Category[]>>("/categories", { params });
    return response.data;
  },

  getTree: async () => {
    const response = await api.get<ApiResponse<Category[]>>("/categories/tree");
    return response.data;
  },

  getActive: async () => {
    const response = await api.get<ApiResponse<Category[]>>("/categories/active");
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<ApiResponse<Category>>(`/categories/${id}`);
    return response.data;
  },

  create: async (data: Partial<Category>) => {
    const response = await api.post<ApiResponse<Category>>("/categories", data);
    return response.data;
  },

  update: async (id: string, data: Partial<Category>) => {
    const response = await api.put<ApiResponse<Category>>(`/categories/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete<ApiResponse<null>>(`/categories/${id}`);
    return response.data;
  },
};
