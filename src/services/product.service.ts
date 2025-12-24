import api, { ApiResponse, PaginationParams } from "@/lib/api";
import { Product, Promotion, ServiceInfo, ProductMedia } from "@/types";

export interface ProductParams extends PaginationParams {
  categoryId?: string;
  brandId?: string;
  status?: string;
  isFeatured?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

export const productService = {
  getAll: async (params?: ProductParams) => {
    const response = await api.get<ApiResponse<Product[]>>("/products", { params });
    return response.data;
  },

  getFeatured: async (limit = 10) => {
    const response = await api.get<ApiResponse<Product[]>>("/products/featured", {
      params: { limit },
    });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<ApiResponse<Product>>(`/products/${id}`);
    return response.data;
  },

  getBySlug: async (slug: string) => {
    const response = await api.get<ApiResponse<Product>>(`/products/slug/${slug}`);
    return response.data;
  },

  create: async (data: Partial<Product>) => {
    const response = await api.post<ApiResponse<Product>>("/products", data);
    return response.data;
  },

  update: async (id: string, data: Partial<Product>) => {
    const response = await api.put<ApiResponse<Product>>(`/products/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete<ApiResponse<null>>(`/products/${id}`);
    return response.data;
  },

  publish: async (id: string) => {
    const response = await api.post<ApiResponse<Product>>(`/products/${id}/publish`);
    return response.data;
  },

  unpublish: async (id: string) => {
    const response = await api.post<ApiResponse<Product>>(`/products/${id}/unpublish`);
    return response.data;
  },

  updateTags: async (id: string, tagIds: string[]) => {
    const response = await api.put<ApiResponse<Product>>(`/products/${id}/tags`, { tagIds });
    return response.data;
  },

  getPromotions: async (id: string) => {
    const response = await api.get<ApiResponse<Promotion[]>>(`/products/${id}/promotions`);
    return response.data;
  },

  getServices: async (id: string) => {
    const response = await api.get<ApiResponse<ServiceInfo[]>>(`/products/${id}/services`);
    return response.data;
  },

  getAllPromotions: async () => {
    const response = await api.get<ApiResponse<Promotion[]>>("/products/promotions");
    return response.data;
  },

  getAllServices: async () => {
    const response = await api.get<ApiResponse<ServiceInfo[]>>("/products/services");
    return response.data;
  },

  updateMedia: async (id: string, media: Partial<ProductMedia>[]) => {
    const response = await api.put<ApiResponse<ProductMedia[]>>(`/products/${id}/media`, { media });
    return response.data;
  },
};
