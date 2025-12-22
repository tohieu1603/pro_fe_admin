import api, { ApiResponse } from "@/lib/api";

export interface ImportResult {
  productsCreated: number;
  variantsCreated: number;
  errors: string[];
  warnings: string[];
}

export const importService = {
  // Import products from Excel file
  importProducts: async (file: File): Promise<ApiResponse<ImportResult>> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post<ApiResponse<ImportResult>>(
      "/import/products",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  // Download Excel template
  downloadTemplate: async (): Promise<Blob> => {
    const response = await api.get("/import/template", {
      responseType: "blob",
    });
    return response.data;
  },
};
