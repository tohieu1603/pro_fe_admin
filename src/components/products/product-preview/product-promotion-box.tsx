"use client";

import React from "react";
import { Typography, Space, Tag } from "antd";
import {
  GiftOutlined,
  PercentageOutlined,
  CreditCardOutlined,
  TruckOutlined,
} from "@ant-design/icons";
import type { Promotion } from "@/types";

const { Text } = Typography;

interface ProductPromotionBoxProps {
  promotions: Promotion[];
}

const getPromotionIcon = (type: string) => {
  switch (type) {
    case "discount":
      return <PercentageOutlined style={{ color: "#ff4d4f" }} />;
    case "gift":
      return <GiftOutlined style={{ color: "#52c41a" }} />;
    case "installment":
      return <CreditCardOutlined style={{ color: "#1890ff" }} />;
    case "shipping":
      return <TruckOutlined style={{ color: "#722ed1" }} />;
    default:
      return <GiftOutlined style={{ color: "#faad14" }} />;
  }
};

const getPromotionColor = (type: string) => {
  switch (type) {
    case "discount":
      return "#fff1f0";
    case "gift":
      return "#f6ffed";
    case "installment":
      return "#e6f7ff";
    case "shipping":
      return "#f9f0ff";
    default:
      return "#fffbe6";
  }
};

export default function ProductPromotionBox({ promotions }: ProductPromotionBoxProps) {
  if (!promotions || promotions.length === 0) return null;

  return (
    <div
      style={{
        marginTop: 16,
        border: "1px solid #ff4d4f",
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)",
          padding: "8px 12px",
          color: "#fff",
        }}
      >
        <Space>
          <GiftOutlined />
          <Text strong style={{ color: "#fff" }}>
            ƯU ĐÃI ĐẶC BIỆT
          </Text>
        </Space>
      </div>

      {/* Promotion List */}
      <div style={{ padding: 12 }}>
        <Space direction="vertical" style={{ width: "100%" }} size={8}>
          {promotions.map((promo, index) => (
            <div
              key={promo.id}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 8,
                padding: 8,
                background: getPromotionColor(promo.type),
                borderRadius: 4,
              }}
            >
              <Tag
                style={{
                  margin: 0,
                  minWidth: 24,
                  textAlign: "center",
                  background: "#fff",
                  border: "1px solid #d9d9d9",
                }}
              >
                {index + 1}
              </Tag>
              <Space direction="vertical" size={0} style={{ flex: 1 }}>
                <Space>
                  {getPromotionIcon(promo.type)}
                  <Text strong>{promo.name}</Text>
                </Space>
                {promo.description && (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {promo.description}
                  </Text>
                )}
                {promo.value && (
                  <Text style={{ color: "#ff4d4f", fontWeight: 600 }}>{promo.value}</Text>
                )}
              </Space>
            </div>
          ))}
        </Space>
      </div>

      {/* Footer Note */}
      <div
        style={{
          padding: "8px 12px",
          background: "#fafafa",
          borderTop: "1px dashed #d9d9d9",
        }}
      >
        <Text type="secondary" style={{ fontSize: 12 }}>
          * Ưu đãi có thể thay đổi tùy theo chương trình khuyến mãi
        </Text>
      </div>
    </div>
  );
}
