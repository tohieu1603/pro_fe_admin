"use client";

import React from "react";
import { Row, Col, Space, Button, Tooltip, Tag, Image } from "antd";
import {
  HeartOutlined,
  ShareAltOutlined,
  ExpandOutlined,
  ZoomInOutlined,
} from "@ant-design/icons";

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  activeImageIndex: number;
  onImageChange: (index: number) => void;
  discountPercent: number;
  isNew?: boolean;
  isWishlisted: boolean;
  onToggleWishlist: () => void;
}

export default function ProductImageGallery({
  images,
  productName,
  activeImageIndex,
  onImageChange,
  discountPercent,
  isNew,
  isWishlisted,
  onToggleWishlist,
}: ProductImageGalleryProps) {
  return (
    <div style={{ position: "sticky", top: 24 }}>
      {/* Main Image */}
      <div style={{ position: "relative", marginBottom: 12 }}>
        <Image.PreviewGroup items={images}>
          <Image
            src={images[activeImageIndex]}
            alt={productName}
            style={{ width: "100%", borderRadius: 8, border: "1px solid #f0f0f0" }}
            preview={{
              mask: (
                <Space>
                  <ZoomInOutlined /> Phóng to
                </Space>
              ),
            }}
          />
        </Image.PreviewGroup>

        {/* Badges */}
        <div style={{ position: "absolute", top: 12, left: 12 }}>
          {discountPercent > 0 && (
            <Tag color="red" style={{ fontSize: 14, padding: "4px 12px", fontWeight: "bold" }}>
              -{discountPercent}%
            </Tag>
          )}
          {isNew && (
            <Tag color="green" style={{ fontSize: 14, padding: "4px 12px", marginLeft: 4 }}>
              Mới
            </Tag>
          )}
        </div>

        {/* Quick actions */}
        <div style={{ position: "absolute", top: 12, right: 12 }}>
          <Space direction="vertical">
            <Tooltip title={isWishlisted ? "Bỏ yêu thích" : "Thêm vào yêu thích"}>
              <Button
                shape="circle"
                icon={<HeartOutlined style={{ color: isWishlisted ? "#ff4d4f" : undefined }} />}
                onClick={onToggleWishlist}
              />
            </Tooltip>
            <Tooltip title="Chia sẻ">
              <Button shape="circle" icon={<ShareAltOutlined />} />
            </Tooltip>
            <Tooltip title="So sánh">
              <Button shape="circle" icon={<ExpandOutlined />} />
            </Tooltip>
          </Space>
        </div>
      </div>

      {/* Thumbnail Gallery */}
      <Row gutter={8}>
        {images.map((img, index) => (
          <Col span={4} key={index}>
            <div
              onClick={() => onImageChange(index)}
              style={{
                cursor: "pointer",
                border: activeImageIndex === index ? "2px solid #1890ff" : "1px solid #f0f0f0",
                borderRadius: 4,
                overflow: "hidden",
                transition: "all 0.2s",
              }}
            >
              <img
                src={img}
                alt={`thumb-${index}`}
                style={{ width: "100%", height: 60, objectFit: "cover" }}
              />
            </div>
          </Col>
        ))}
      </Row>
    </div>
  );
}
