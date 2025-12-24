"use client";

import { useState } from "react";
import {
  Upload,
  Card,
  Row,
  Col,
  Button,
  message,
  Image,
  Tooltip,
  Popconfirm,
  Space,
  Typography,
  Spin,
  Empty,
} from "antd";
import type { UploadProps } from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  StarOutlined,
  StarFilled,
  EyeOutlined,
} from "@ant-design/icons";
import { uploadService } from "@/services";
import { MediaType, type ProductMedia } from "@/types";

const { Text } = Typography;

interface ProductMediaUploadProps {
  productId?: string;
  media: ProductMedia[];
  onChange: (media: ProductMedia[]) => void;
  disabled?: boolean;
}

export default function ProductMediaUpload({
  productId,
  media,
  onChange,
  disabled = false,
}: ProductMediaUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  // Handle file upload
  const handleUpload: UploadProps["customRequest"] = async (options) => {
    const { file, onSuccess, onError } = options;

    if (!(file instanceof File)) {
      onError?.(new Error("Invalid file"));
      return;
    }

    setUploading(true);
    try {
      const result = await uploadService.uploadImage(file, "products");

      if (result.success && result.data) {
        const newMedia: ProductMedia = {
          id: `temp-${Date.now()}`,
          productId: productId || "",
          type: MediaType.IMAGE,
          url: result.data.url,
          altText: file.name,
          displayOrder: media.length,
          isPrimary: media.length === 0,
        };

        onChange([...media, newMedia]);
        message.success("Upload thành công");
        onSuccess?.(result.data);
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      message.error("Upload thất bại");
      onError?.(error as Error);
    } finally {
      setUploading(false);
    }
  };

  // Handle multiple file upload
  const handleMultipleUpload = async (files: File[]) => {
    setUploading(true);
    try {
      const result = await uploadService.uploadImages(files, "products");

      if (result.success && result.data) {
        const newMedia: ProductMedia[] = result.data.uploaded.map(
          (uploaded, index) => ({
            id: `temp-${Date.now()}-${index}`,
            productId: productId || "",
            type: MediaType.IMAGE,
            url: uploaded.url,
            altText: uploaded.originalName,
            displayOrder: media.length + index,
            isPrimary: media.length === 0 && index === 0,
          })
        );

        onChange([...media, ...newMedia]);
        message.success(`Upload thành công ${result.data.successCount} ảnh`);

        if (result.data.failedCount > 0) {
          message.warning(`${result.data.failedCount} ảnh upload thất bại`);
        }
      }
    } catch (error) {
      message.error("Upload thất bại");
    } finally {
      setUploading(false);
    }
  };

  // Delete image
  const handleDelete = async (mediaId: string) => {
    const mediaItem = media.find((m) => m.id === mediaId);
    if (!mediaItem) return;

    // If it's a temp image (not saved to server yet), just remove from state
    if (mediaItem.id.startsWith("temp-")) {
      // Try to delete the file from server
      try {
        await uploadService.deleteImage(mediaItem.url);
      } catch {
        // Ignore error, file might not exist
      }
    }

    const newMedia = media.filter((m) => m.id !== mediaId);

    // If deleted image was primary, set first image as primary
    if (mediaItem.isPrimary && newMedia.length > 0) {
      newMedia[0].isPrimary = true;
    }

    onChange(newMedia);
    message.success("Đã xóa ảnh");
  };

  // Set as primary image
  const setPrimaryImage = (mediaId: string) => {
    const newMedia = media.map((m) => ({
      ...m,
      isPrimary: m.id === mediaId,
    }));
    onChange(newMedia);
  };

  // Preview image
  const handlePreview = (url: string) => {
    setPreviewImage(uploadService.getImageUrl(url));
    setPreviewOpen(true);
  };

  // Reorder images (move up)
  const moveUp = (index: number) => {
    if (index === 0) return;
    const newMedia = [...media];
    [newMedia[index - 1], newMedia[index]] = [newMedia[index], newMedia[index - 1]];
    // Update displayOrder
    newMedia.forEach((m, i) => {
      m.displayOrder = i;
    });
    onChange(newMedia);
  };

  // Reorder images (move down)
  const moveDown = (index: number) => {
    if (index === media.length - 1) return;
    const newMedia = [...media];
    [newMedia[index], newMedia[index + 1]] = [newMedia[index + 1], newMedia[index]];
    // Update displayOrder
    newMedia.forEach((m, i) => {
      m.displayOrder = i;
    });
    onChange(newMedia);
  };

  return (
    <Card
      title={
        <Space>
          <span>Hình ảnh sản phẩm</span>
          {uploading && <Spin size="small" />}
        </Space>
      }
      style={{ marginBottom: 24 }}
      extra={
        <Text type="secondary" style={{ fontSize: 12 }}>
          Kéo thả để sắp xếp. Click ngôi sao để chọn ảnh đại diện.
        </Text>
      }
    >
      <Row gutter={[16, 16]}>
        {/* Image list */}
        {media.map((item, index) => (
          <Col key={item.id} xs={12} sm={8} md={6}>
            <div
              style={{
                position: "relative",
                border: item.isPrimary
                  ? "2px solid #1890ff"
                  : "1px solid #d9d9d9",
                borderRadius: 8,
                overflow: "hidden",
                background: "#fafafa",
              }}
            >
              {/* Primary badge */}
              {item.isPrimary && (
                <div
                  style={{
                    position: "absolute",
                    top: 4,
                    left: 4,
                    background: "#1890ff",
                    color: "#fff",
                    padding: "2px 8px",
                    borderRadius: 4,
                    fontSize: 11,
                    zIndex: 1,
                  }}
                >
                  Ảnh đại diện
                </div>
              )}

              {/* Image */}
              <div style={{ aspectRatio: "1", overflow: "hidden" }}>
                <Image
                  src={uploadService.getImageUrl(item.url)}
                  alt={item.altText || "Product image"}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                  preview={false}
                  fallback="/placeholder.png"
                  onClick={() => handlePreview(item.url)}
                />
              </div>

              {/* Actions */}
              {!disabled && (
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: "rgba(0,0,0,0.5)",
                    padding: "4px 8px",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Space size={4}>
                    {/* Move up */}
                    <Tooltip title="Di chuyển lên">
                      <Button
                        type="text"
                        size="small"
                        disabled={index === 0}
                        onClick={() => moveUp(index)}
                        style={{ color: "#fff" }}
                      >
                        ↑
                      </Button>
                    </Tooltip>
                    {/* Move down */}
                    <Tooltip title="Di chuyển xuống">
                      <Button
                        type="text"
                        size="small"
                        disabled={index === media.length - 1}
                        onClick={() => moveDown(index)}
                        style={{ color: "#fff" }}
                      >
                        ↓
                      </Button>
                    </Tooltip>
                  </Space>

                  <Space size={4}>
                    {/* Set primary */}
                    <Tooltip title={item.isPrimary ? "Ảnh đại diện" : "Đặt làm ảnh đại diện"}>
                      <Button
                        type="text"
                        size="small"
                        onClick={() => setPrimaryImage(item.id)}
                        style={{ color: item.isPrimary ? "#faad14" : "#fff" }}
                      >
                        {item.isPrimary ? <StarFilled /> : <StarOutlined />}
                      </Button>
                    </Tooltip>

                    {/* Preview */}
                    <Tooltip title="Xem">
                      <Button
                        type="text"
                        size="small"
                        onClick={() => handlePreview(item.url)}
                        style={{ color: "#fff" }}
                      >
                        <EyeOutlined />
                      </Button>
                    </Tooltip>

                    {/* Delete */}
                    <Popconfirm
                      title="Xóa ảnh này?"
                      onConfirm={() => handleDelete(item.id)}
                      okText="Xóa"
                      cancelText="Hủy"
                    >
                      <Tooltip title="Xóa">
                        <Button
                          type="text"
                          size="small"
                          danger
                          style={{ color: "#ff4d4f" }}
                        >
                          <DeleteOutlined />
                        </Button>
                      </Tooltip>
                    </Popconfirm>
                  </Space>
                </div>
              )}
            </div>
          </Col>
        ))}

        {/* Upload button */}
        {!disabled && (
          <Col xs={12} sm={8} md={6}>
            <Upload
              accept="image/*"
              multiple
              showUploadList={false}
              customRequest={handleUpload}
              beforeUpload={(file, fileList) => {
                // Check file type
                if (!file.type.startsWith("image/")) {
                  message.error("Chỉ được upload file ảnh");
                  return Upload.LIST_IGNORE;
                }
                // Check file size (max 10MB)
                if (file.size > 10 * 1024 * 1024) {
                  message.error("File quá lớn. Tối đa 10MB");
                  return Upload.LIST_IGNORE;
                }
                return true;
              }}
              disabled={uploading}
            >
              <div
                style={{
                  aspectRatio: "1",
                  border: "1px dashed #d9d9d9",
                  borderRadius: 8,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: uploading ? "not-allowed" : "pointer",
                  background: "#fafafa",
                  transition: "border-color 0.3s",
                }}
                onMouseEnter={(e) => {
                  if (!uploading) {
                    e.currentTarget.style.borderColor = "#1890ff";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#d9d9d9";
                }}
              >
                {uploading ? (
                  <Spin />
                ) : (
                  <>
                    <PlusOutlined style={{ fontSize: 24, color: "#999" }} />
                    <Text type="secondary" style={{ marginTop: 8, fontSize: 12 }}>
                      Thêm ảnh
                    </Text>
                  </>
                )}
              </div>
            </Upload>
          </Col>
        )}
      </Row>

      {media.length === 0 && disabled && (
        <Empty description="Chưa có ảnh" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}

      {/* Preview Modal */}
      <Image
        style={{ display: "none" }}
        preview={{
          visible: previewOpen,
          src: previewImage,
          onVisibleChange: (visible) => setPreviewOpen(visible),
        }}
      />
    </Card>
  );
}
