import api, { ApiResponse, PaginationParams } from "@/lib/api";
import { ProductVariant } from "@/types";

export interface VariantParams extends PaginationParams {
  productId?: string;
  status?: string;
  inStock?: boolean;
}

export const variantService = {
  getAll: async (params?: VariantParams) => {
    const response = await api.get<ApiResponse<ProductVariant[]>>("/variants", { params });
    return response.data;
  },

  getByProduct: async (productId: string) => {
    const response = await api.get<ApiResponse<ProductVariant[]>>(
      `/variants/product/${productId}`
    );
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<ApiResponse<ProductVariant>>(`/variants/${id}`);
    return response.data;
  },

  getBySKU: async (sku: string) => {
    const response = await api.get<ApiResponse<ProductVariant>>(`/variants/sku/${sku}`);
    return response.data;
  },

  create: async (data: Partial<ProductVariant> & { optionValues?: string[] }) => {
    const response = await api.post<ApiResponse<ProductVariant>>("/variants", data);
    return response.data;
  },

  update: async (id: string, data: Partial<ProductVariant>) => {
    const response = await api.put<ApiResponse<ProductVariant>>(`/variants/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete<ApiResponse<null>>(`/variants/${id}`);
    return response.data;
  },

  setDefault: async (productId: string, variantId: string) => {
    const response = await api.post<ApiResponse<null>>("/variants/set-default", {
      productId,
      variantId,
    });
    return response.data;
  },

  updateStock: async (
    id: string,
    quantity: number,
    operation: "add" | "subtract" | "set"
  ) => {
    const response = await api.put<ApiResponse<ProductVariant>>(`/variants/${id}/stock`, {
      quantity,
      operation,
    });
    return response.data;
  },

  getLowStock: async (threshold?: number) => {
    const response = await api.get<ApiResponse<ProductVariant[]>>("/variants/low-stock", {
      params: { threshold },
    });
    return response.data;
  },
};
