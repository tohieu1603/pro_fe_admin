import api, { ApiResponse, PaginationParams } from "@/lib/api";
import { Tag, TagType } from "@/types";

export interface TagParams extends PaginationParams {
  type?: TagType;
}

export const tagService = {
  getAll: async (params?: TagParams) => {
    const response = await api.get<ApiResponse<Tag[]>>("/tags", { params });
    return response.data;
  },

  getByType: async (type: TagType) => {
    const response = await api.get<ApiResponse<Tag[]>>(`/tags/type/${type}`);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<ApiResponse<Tag>>(`/tags/${id}`);
    return response.data;
  },

  create: async (data: Partial<Tag>) => {
    const response = await api.post<ApiResponse<Tag>>("/tags", data);
    return response.data;
  },

  update: async (id: string, data: Partial<Tag>) => {
    const response = await api.put<ApiResponse<Tag>>(`/tags/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete<ApiResponse<null>>(`/tags/${id}`);
    return response.data;
  },
};
