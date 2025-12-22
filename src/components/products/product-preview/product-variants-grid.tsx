"use client";

import React from "react";
import { Row, Col, Card, Typography, Space, Tag } from "antd";
import type { ProductVariant } from "@/types";
import { formatCurrency } from "./types";

const { Text } = Typography;

interface ProductVariantsGridProps {
  variants: ProductVariant[];
  selectedVariantId: string | null;
  onSelectVariant: (variant: ProductVariant, options: Record<string, string>) => void;
}

export default function ProductVariantsGrid({
  variants,
  selectedVariantId,
  onSelectVariant,
}: ProductVariantsGridProps) {
  if (!variants || variants.length <= 1) return null;

  return (
    <Card bordered={false} title={`Tất cả phiên bản (${variants.length})`} style={{ borderRadius: 12, marginBottom: 16 }}>
      <Row gutter={[16, 16]}>
        {variants.map((variant: any) => (
          <Col xs={24} sm={12} md={8} lg={6} key={variant.id}>
            <Card
              hoverable
              size="small"
              onClick={() => {
                const variantOptions = variant.options || [];
                if (variantOptions.length > 0) {
                  const options: Record<string, string> = {};
                  variantOptions.forEach((opt: any) => {
                    if (opt.optionType && opt.optionValue) {
                      options[opt.optionType.id] = opt.optionValue.id;
                    }
                  });
                  onSelectVariant(variant, options);
                } else {
                  onSelectVariant(variant, {});
                }
              }}
              style={{
                border: selectedVariantId === variant.id ? "2px solid #1890ff" : undefined,
              }}
            >
              <Space direction="vertical" size={4} style={{ width: "100%" }}>
                <Text strong ellipsis>{variant.name || variant.sku}</Text>
                <Space wrap size={4}>
                  {(variant.options || []).map((opt: any) => (
                    <Tag key={opt.id} color="blue" style={{ margin: 0, fontSize: 11 }}>
                      {opt.optionValue?.displayValue}
                    </Tag>
                  ))}
                </Space>
                <Text type="danger" strong style={{ fontSize: 16 }}>
                  {formatCurrency(variant.price)}
                </Text>
                {variant.compareAtPrice && (
                  <Text delete type="secondary" style={{ fontSize: 12 }}>
                    {formatCurrency(variant.compareAtPrice)}
                  </Text>
                )}
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    </Card>
  );
}
