import api, { ApiResponse, PaginationParams } from "@/lib/api";
import { Region, CreateRegionDTO, ProductRegion, CreateProductRegionDTO } from "@/types";

export const regionService = {
  // Region CRUD
  getAll: async (params?: PaginationParams) => {
    const response = await api.get<ApiResponse<Region[]>>("/regions", { params });
    return response.data;
  },

  getActive: async () => {
    const response = await api.get<ApiResponse<Region[]>>("/regions/active");
    return response.data;
  },

  getCurrent: async () => {
    const response = await api.get<ApiResponse<Region>>("/regions/current");
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<ApiResponse<Region>>(`/regions/${id}`);
    return response.data;
  },

  getBySlug: async (slug: string) => {
    const response = await api.get<ApiResponse<Region>>(`/regions/slug/${slug}`);
    return response.data;
  },

  getBySubdomain: async (subdomain: string) => {
    const response = await api.get<ApiResponse<Region>>(`/regions/subdomain/${subdomain}`);
    return response.data;
  },

  create: async (data: CreateRegionDTO) => {
    const response = await api.post<ApiResponse<Region>>("/regions", data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateRegionDTO>) => {
    const response = await api.put<ApiResponse<Region>>(`/regions/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete<ApiResponse<null>>(`/regions/${id}`);
    return response.data;
  },

  setDefault: async (id: string) => {
    const response = await api.post<ApiResponse<Region>>(`/regions/${id}/set-default`);
    return response.data;
  },
};

export const productRegionService = {
  // Get products for a region
  getByRegion: async (regionId: string, params?: PaginationParams) => {
    const response = await api.get<ApiResponse<ProductRegion[]>>(
      `/regions/${regionId}/products`,
      { params }
    );
    return response.data;
  },

  // Get regions for a product
  getByProduct: async (productId: string) => {
    const response = await api.get<ApiResponse<ProductRegion[]>>(
      `/regions/product/${productId}/regions`
    );
    return response.data;
  },

  // Get specific product-region
  getByProductAndRegion: async (regionId: string, productId: string) => {
    const response = await api.get<ApiResponse<ProductRegion>>(
      `/regions/${regionId}/products/${productId}`
    );
    return response.data;
  },

  // Create or update product-region
  upsert: async (data: CreateProductRegionDTO) => {
    const response = await api.post<ApiResponse<ProductRegion>>(
      "/regions/product-regions",
      data
    );
    return response.data;
  },

  // Bulk update availability
  bulkUpdateAvailability: async (
    regionId: string,
    productIds: string[],
    isAvailable: boolean
  ) => {
    const response = await api.post<ApiResponse<{ updated: number }>>(
      "/regions/product-regions/bulk-availability",
      { regionId, productIds, isAvailable }
    );
    return response.data;
  },

  // Copy products from one region to another
  copyFromRegion: async (
    sourceRegionId: string,
    targetRegionId: string,
    copyPrices = false
  ) => {
    const response = await api.post<ApiResponse<{ copied: number }>>(
      "/regions/product-regions/copy",
      { sourceRegionId, targetRegionId, copyPrices }
    );
    return response.data;
  },

  // Get low stock products
  getLowStock: async (regionId: string) => {
    const response = await api.get<ApiResponse<ProductRegion[]>>(
      `/regions/${regionId}/products/low-stock`
    );
    return response.data;
  },

  // Remove product from region
  removeFromRegion: async (regionId: string, productId: string) => {
    const response = await api.delete<ApiResponse<null>>(
      `/regions/${regionId}/products/${productId}`
    );
    return response.data;
  },
};
