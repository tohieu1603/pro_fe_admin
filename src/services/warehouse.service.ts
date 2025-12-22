import api, { ApiResponse, PaginationParams } from "@/lib/api";
import { Warehouse } from "@/types";

export const warehouseService = {
  getAll: async (params?: PaginationParams) => {
    const response = await api.get<ApiResponse<Warehouse[]>>("/warehouses", { params });
    return response.data;
  },

  getActive: async () => {
    const response = await api.get<ApiResponse<Warehouse[]>>("/warehouses/active");
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<ApiResponse<Warehouse>>(`/warehouses/${id}`);
    return response.data;
  },

  create: async (data: Partial<Warehouse>) => {
    const response = await api.post<ApiResponse<Warehouse>>("/warehouses", data);
    return response.data;
  },

  update: async (id: string, data: Partial<Warehouse>) => {
    const response = await api.put<ApiResponse<Warehouse>>(`/warehouses/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete<ApiResponse<null>>(`/warehouses/${id}`);
    return response.data;
  },
};
