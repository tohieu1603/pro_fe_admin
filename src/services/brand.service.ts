import api, { ApiResponse, PaginationParams } from "@/lib/api";
import { Brand } from "@/types";

export const brandService = {
  getAll: async (params?: PaginationParams) => {
    const response = await api.get<ApiResponse<Brand[]>>("/brands", { params });
    return response.data;
  },

  getActive: async () => {
    const response = await api.get<ApiResponse<Brand[]>>("/brands/active");
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<ApiResponse<Brand>>(`/brands/${id}`);
    return response.data;
  },

  create: async (data: Partial<Brand>) => {
    const response = await api.post<ApiResponse<Brand>>("/brands", data);
    return response.data;
  },

  update: async (id: string, data: Partial<Brand>) => {
    const response = await api.put<ApiResponse<Brand>>(`/brands/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete<ApiResponse<null>>(`/brands/${id}`);
    return response.data;
  },
};
