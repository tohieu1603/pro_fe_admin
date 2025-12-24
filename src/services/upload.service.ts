import api, { ApiResponse } from "@/lib/api";

export interface UploadedFile {
  url: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
}

export interface UploadResult {
  uploaded: UploadedFile[];
  failed: { error: string }[];
  total: number;
  successCount: number;
  failedCount: number;
}

export const uploadService = {
  // Upload single image
  uploadImage: async (file: File, folder: string = "images") => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post<ApiResponse<UploadedFile>>(
      `/upload/image?folder=${folder}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  // Upload multiple images
  uploadImages: async (files: File[], folder: string = "images") => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await api.post<ApiResponse<UploadResult>>(
      `/upload/images?folder=${folder}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  // Delete image
  deleteImage: async (url: string) => {
    const response = await api.delete<ApiResponse<null>>("/upload/image", {
      data: { url },
    });
    return response.data;
  },

  // Get full URL for image (handle both relative and absolute URLs)
  getImageUrl: (url: string | undefined | null): string => {
    if (!url) return "/placeholder.png";

    // If already absolute URL, return as is
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }

    // If relative URL starting with /uploads, prefix with API base URL
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "";
    return `${apiBaseUrl}${url}`;
  },
};
