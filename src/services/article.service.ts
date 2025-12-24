import api, { ApiResponse, PaginationParams } from "@/lib/api";
import { Article, ArticleStatus, CreateArticleDTO } from "@/types";

export interface ArticleParams extends PaginationParams {
  status?: ArticleStatus;
  categoryId?: string;
  authorId?: string;
  isFeatured?: boolean;
  tagIds?: string[];
}

export const articleService = {
  getAll: async (params?: ArticleParams) => {
    const queryParams: Record<string, string> = {};

    if (params) {
      if (params.page) queryParams.page = params.page.toString();
      if (params.limit) queryParams.limit = params.limit.toString();
      if (params.search) queryParams.search = params.search;
      if (params.sortBy) queryParams.sortBy = params.sortBy;
      if (params.sortOrder) queryParams.sortOrder = params.sortOrder;
      if (params.status) queryParams.status = params.status;
      if (params.categoryId) queryParams.categoryId = params.categoryId;
      if (params.authorId) queryParams.authorId = params.authorId;
      if (params.isFeatured !== undefined) queryParams.isFeatured = params.isFeatured.toString();
      if (params.tagIds && params.tagIds.length > 0) queryParams.tagIds = params.tagIds.join(",");
    }

    const response = await api.get<ApiResponse<Article[]>>("/articles", { params: queryParams });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<ApiResponse<Article>>(`/articles/${id}`);
    return response.data;
  },

  getBySlug: async (slug: string) => {
    const response = await api.get<ApiResponse<Article>>(`/articles/slug/${slug}`);
    return response.data;
  },

  getFeatured: async (limit?: number) => {
    const response = await api.get<ApiResponse<Article[]>>("/articles/featured", {
      params: limit ? { limit } : undefined,
    });
    return response.data;
  },

  getRecent: async (limit?: number) => {
    const response = await api.get<ApiResponse<Article[]>>("/articles/recent", {
      params: limit ? { limit } : undefined,
    });
    return response.data;
  },

  getByCategory: async (categoryId: string, limit?: number) => {
    const response = await api.get<ApiResponse<Article[]>>(`/articles/category/${categoryId}`, {
      params: limit ? { limit } : undefined,
    });
    return response.data;
  },

  create: async (data: CreateArticleDTO) => {
    const response = await api.post<ApiResponse<Article>>("/articles", data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateArticleDTO>) => {
    const response = await api.put<ApiResponse<Article>>(`/articles/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete<ApiResponse<null>>(`/articles/${id}`);
    return response.data;
  },

  publish: async (id: string) => {
    const response = await api.post<ApiResponse<Article>>(`/articles/${id}/publish`);
    return response.data;
  },

  unpublish: async (id: string) => {
    const response = await api.post<ApiResponse<Article>>(`/articles/${id}/unpublish`);
    return response.data;
  },

  archive: async (id: string) => {
    const response = await api.post<ApiResponse<Article>>(`/articles/${id}/archive`);
    return response.data;
  },
};
