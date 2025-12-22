import api, { ApiResponse, PaginationParams } from "@/lib/api";
import { Inventory, InventoryMovement, MovementType } from "@/types";

export interface InventoryParams extends PaginationParams {
  warehouseId?: string;
  variantId?: string;
  lowStock?: boolean;
}

export const inventoryService = {
  getAll: async (params?: InventoryParams) => {
    const response = await api.get<ApiResponse<Inventory[]>>("/inventory", { params });
    return response.data;
  },

  getByVariant: async (variantId: string) => {
    const response = await api.get<ApiResponse<Inventory[]>>(
      `/inventory/variant/${variantId}`
    );
    return response.data;
  },

  getByWarehouse: async (warehouseId: string) => {
    const response = await api.get<ApiResponse<Inventory[]>>(
      `/inventory/warehouse/${warehouseId}`
    );
    return response.data;
  },

  getLowStock: async (warehouseId?: string) => {
    const response = await api.get<ApiResponse<Inventory[]>>("/inventory/low-stock", {
      params: { warehouseId },
    });
    return response.data;
  },

  updateInventory: async (data: {
    variantId: string;
    warehouseId: string;
    quantity: number;
    type: MovementType;
    note?: string;
    createdBy?: string;
  }) => {
    const response = await api.post<ApiResponse<Inventory>>("/inventory/update", data);
    return response.data;
  },

  transferInventory: async (data: {
    variantId: string;
    fromWarehouseId: string;
    toWarehouseId: string;
    quantity: number;
    note?: string;
    createdBy?: string;
  }) => {
    const response = await api.post<ApiResponse<{ from: Inventory; to: Inventory }>>(
      "/inventory/transfer",
      data
    );
    return response.data;
  },

  reserveStock: async (variantId: string, warehouseId: string, quantity: number) => {
    const response = await api.post<ApiResponse<null>>("/inventory/reserve", {
      variantId,
      warehouseId,
      quantity,
    });
    return response.data;
  },

  releaseReservedStock: async (
    variantId: string,
    warehouseId: string,
    quantity: number
  ) => {
    const response = await api.post<ApiResponse<null>>("/inventory/release", {
      variantId,
      warehouseId,
      quantity,
    });
    return response.data;
  },

  getMovementHistory: async (variantId?: string, warehouseId?: string, limit = 50) => {
    const response = await api.get<ApiResponse<InventoryMovement[]>>(
      "/inventory/movements",
      {
        params: { variantId, warehouseId, limit },
      }
    );
    return response.data;
  },
};
