"use client";

import React from "react";
import { Typography, Space, Button, InputNumber, Rate, Tag, Row, Col } from "antd";
import {
  ShoppingCartOutlined,
  ThunderboltFilled,
  CheckCircleFilled,
  CloseCircleFilled,
} from "@ant-design/icons";
import type { Product, ProductVariant } from "@/types";
import type { OptionGroup, StockStatus } from "./types";
import { formatCurrency } from "./types";

const { Title, Text } = Typography;

interface ProductInfoSectionProps {
  product: Product;
  selectedVariant: ProductVariant | null;
  currentPrice: number;
  comparePrice?: number;
  discountPercent: number;
  stockStatus: StockStatus;
  quantity: number;
  onQuantityChange: (value: number) => void;
  optionGroups: OptionGroup[];
  selectedOptions: Record<string, string>;
  onOptionChange: (optionTypeId: string, valueId: string) => void;
  reviewCount: number;
}

export default function ProductInfoSection({
  product,
  selectedVariant,
  currentPrice,
  comparePrice,
  discountPercent,
  stockStatus,
  quantity,
  onQuantityChange,
  optionGroups,
  selectedOptions,
  onOptionChange,
  reviewCount,
}: ProductInfoSectionProps) {
  // Calculate average rating from reviews
  const avgRating =
    product.reviews && product.reviews.length > 0
      ? product.reviews.filter((r) => r.isApproved).reduce((sum, r) => sum + r.rating, 0) /
        product.reviews.filter((r) => r.isApproved).length
      : 0;

  return (
    <div>
      {/* Product Title */}
      <Title level={4} style={{ marginBottom: 8, lineHeight: 1.4 }}>
        {product.name}
      </Title>

      {/* Rating & Review Count */}
      <Space style={{ marginBottom: 12 }}>
        <Rate disabled value={avgRating} allowHalf style={{ fontSize: 14 }} />
        <Text type="secondary">({reviewCount} đánh giá)</Text>
        {product.brand && (
          <>
            <Text type="secondary">|</Text>
            <Text>
              Thương hiệu: <Text strong>{product.brand.name}</Text>
            </Text>
          </>
        )}
      </Space>

      {/* SKU */}
      {selectedVariant && (
        <div style={{ marginBottom: 12 }}>
          <Text type="secondary">SKU: {selectedVariant.sku}</Text>
        </div>
      )}

      {/* Price Box */}
      <div className="price-box">
        <Space align="baseline">
          <Title level={2} style={{ margin: 0, color: "#fff" }}>
            {formatCurrency(currentPrice)}
          </Title>
          {comparePrice && comparePrice > currentPrice && (
            <>
              <Text delete style={{ color: "rgba(255,255,255,0.7)", fontSize: 16 }}>
                {formatCurrency(comparePrice)}
              </Text>
              <Tag color="#ff4d4f" style={{ fontSize: 14, padding: "2px 8px" }}>
                -{discountPercent}%
              </Tag>
            </>
          )}
        </Space>
      </div>

      {/* Variant Options */}
      {optionGroups.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          {optionGroups.map((group) => (
            <div key={group.optionType.id} style={{ marginBottom: 12 }}>
              <Text strong style={{ display: "block", marginBottom: 8 }}>
                {group.optionType.name}:
              </Text>
              <Space wrap>
                {group.values.map((value) => {
                  const isSelected = selectedOptions[group.optionType.id] === value.id;
                  const isColor = group.optionType.slug === "color" || value.colorCode;

                  if (isColor && value.colorCode) {
                    return (
                      <div
                        key={value.id}
                        onClick={() => onOptionChange(group.optionType.id, value.id)}
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          backgroundColor: value.colorCode,
                          border: isSelected ? "3px solid #1e8c00" : "2px solid #d9d9d9",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        title={value.displayValue || value.value}
                      >
                        {isSelected && <CheckCircleFilled style={{ color: "#fff", fontSize: 16 }} />}
                      </div>
                    );
                  }

                  return (
                    <Button
                      key={value.id}
                      type={isSelected ? "primary" : "default"}
                      onClick={() => onOptionChange(group.optionType.id, value.id)}
                      style={{
                        minWidth: 60,
                        borderColor: isSelected ? "#1e8c00" : undefined,
                        backgroundColor: isSelected ? "#1e8c00" : undefined,
                      }}
                    >
                      {value.displayValue || value.value}
                    </Button>
                  );
                })}
              </Space>
            </div>
          ))}
        </div>
      )}

      {/* Stock Status */}
      <div style={{ marginBottom: 16 }}>
        {stockStatus.inStock ? (
          <Space>
            <CheckCircleFilled style={{ color: "#52c41a" }} />
            <Text style={{ color: "#52c41a" }}>
              Còn hàng ({stockStatus.quantity} sản phẩm)
            </Text>
          </Space>
        ) : (
          <Space>
            <CloseCircleFilled style={{ color: "#ff4d4f" }} />
            <Text style={{ color: "#ff4d4f" }}>Hết hàng</Text>
          </Space>
        )}
      </div>

      {/* Quantity Selector */}
      <Row gutter={16} align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Text strong>Số lượng:</Text>
        </Col>
        <Col>
          <InputNumber
            min={1}
            max={stockStatus.quantity || 99}
            value={quantity}
            onChange={(val) => onQuantityChange(val || 1)}
            style={{ width: 100 }}
          />
        </Col>
      </Row>

      {/* Action Buttons */}
      <Row gutter={12}>
        <Col span={12}>
          <Button
            type="primary"
            size="large"
            block
            className="btn-buy"
            disabled={!stockStatus.inStock}
            icon={<ThunderboltFilled />}
          >
            MUA NGAY
          </Button>
        </Col>
        <Col span={12}>
          <Button
            size="large"
            block
            className="btn-cart"
            disabled={!stockStatus.inStock}
            icon={<ShoppingCartOutlined />}
          >
            THÊM VÀO GIỎ
          </Button>
        </Col>
      </Row>

      {/* Short Description */}
      {product.shortDescription && (
        <div style={{ marginTop: 16, padding: 12, background: "#f5f5f5", borderRadius: 8 }}>
          <Text>{product.shortDescription}</Text>
        </div>
      )}
    </div>
  );
}
