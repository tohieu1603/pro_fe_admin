import api, { ApiResponse, PaginationParams } from "@/lib/api";
import { VariantOptionType, VariantOptionValue } from "@/types";

export interface OptionTypeParams extends PaginationParams {
  categoryId?: string;
  all?: boolean;
}

export const optionTypeService = {
  // Option Types
  getAll: async (params?: OptionTypeParams) => {
    const response = await api.get<ApiResponse<VariantOptionType[]>>("/option-types", {
      params: params?.all ? { all: "true" } : params,
    });
    return response.data;
  },

  getByCategory: async (categoryId: string) => {
    const response = await api.get<ApiResponse<VariantOptionType[]>>(
      `/option-types/category/${categoryId}`
    );
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<ApiResponse<VariantOptionType>>(`/option-types/${id}`);
    return response.data;
  },

  create: async (data: Partial<VariantOptionType>) => {
    const response = await api.post<ApiResponse<VariantOptionType>>("/option-types", data);
    return response.data;
  },

  update: async (id: string, data: Partial<VariantOptionType>) => {
    const response = await api.put<ApiResponse<VariantOptionType>>(`/option-types/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete<ApiResponse<null>>(`/option-types/${id}`);
    return response.data;
  },

  // Option Values
  getValues: async (optionTypeId: string) => {
    const response = await api.get<ApiResponse<VariantOptionValue[]>>(
      `/option-types/${optionTypeId}/values`
    );
    return response.data;
  },

  createValue: async (optionTypeId: string, data: Partial<VariantOptionValue>) => {
    const response = await api.post<ApiResponse<VariantOptionValue>>(
      `/option-types/${optionTypeId}/values`,
      data
    );
    return response.data;
  },

  createValues: async (
    optionTypeId: string,
    values: Array<{ value: string; displayValue?: string; colorCode?: string }>
  ) => {
    const response = await api.post<ApiResponse<VariantOptionValue[]>>(
      `/option-types/${optionTypeId}/values/bulk`,
      { values }
    );
    return response.data;
  },

  findOrCreateValues: async (optionTypeId: string, values: string[]) => {
    const response = await api.post<ApiResponse<VariantOptionValue[]>>(
      `/option-types/${optionTypeId}/values/find-or-create`,
      { values }
    );
    return response.data;
  },

  updateValue: async (
    optionTypeId: string,
    valueId: string,
    data: Partial<VariantOptionValue>
  ) => {
    const response = await api.put<ApiResponse<VariantOptionValue>>(
      `/option-types/${optionTypeId}/values/${valueId}`,
      data
    );
    return response.data;
  },

  deleteValue: async (optionTypeId: string, valueId: string) => {
    const response = await api.delete<ApiResponse<null>>(
      `/option-types/${optionTypeId}/values/${valueId}`
    );
    return response.data;
  },
};
