import api, { ApiResponse, PaginationParams } from "@/lib/api";
import { ArticleCategory } from "@/types";

export const articleCategoryService = {
  getAll: async (params?: PaginationParams) => {
    const response = await api.get<ApiResponse<ArticleCategory[]>>("/article-categories", { params });
    return response.data;
  },

  getTree: async () => {
    const response = await api.get<ApiResponse<ArticleCategory[]>>("/article-categories/tree");
    return response.data;
  },

  getActive: async () => {
    const response = await api.get<ApiResponse<ArticleCategory[]>>("/article-categories/active");
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<ApiResponse<ArticleCategory>>(`/article-categories/${id}`);
    return response.data;
  },

  getBySlug: async (slug: string) => {
    const response = await api.get<ApiResponse<ArticleCategory>>(`/article-categories/slug/${slug}`);
    return response.data;
  },

  create: async (data: Partial<ArticleCategory>) => {
    const response = await api.post<ApiResponse<ArticleCategory>>("/article-categories", data);
    return response.data;
  },

  update: async (id: string, data: Partial<ArticleCategory>) => {
    const response = await api.put<ApiResponse<ArticleCategory>>(`/article-categories/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete<ApiResponse<null>>(`/article-categories/${id}`);
    return response.data;
  },
};
