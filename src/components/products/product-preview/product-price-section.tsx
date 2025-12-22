"use client";

import React from "react";
import { Card, Row, Col, Typography, Tag, Space, List } from "antd";
import {
  ThunderboltOutlined,
  GiftOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import { formatCurrency } from "./types";

const { Title, Text } = Typography;

interface ProductPriceSectionProps {
  currentPrice: number;
  comparePrice?: number;
  discountPercent: number;
}

export default function ProductPriceSection({
  currentPrice,
  comparePrice,
  discountPercent,
}: ProductPriceSectionProps) {
  return (
    <>
      {/* Price Card */}
      <Card
        size="small"
        style={{
          background: "linear-gradient(135deg, #fff1f0 0%, #fff 100%)",
          marginBottom: 16,
          borderColor: "#ffccc7",
        }}
      >
        <Row align="middle" gutter={16}>
          <Col>
            <Title level={2} style={{ color: "#cf1322", margin: 0 }}>
              {formatCurrency(currentPrice)}
            </Title>
          </Col>
          {comparePrice && (
            <>
              <Col>
                <Text delete type="secondary" style={{ fontSize: 18 }}>
                  {formatCurrency(comparePrice)}
                </Text>
              </Col>
              <Col>
                <Tag color="red" style={{ fontSize: 14 }}>
                  Tiết kiệm {formatCurrency(comparePrice - currentPrice)}
                </Tag>
              </Col>
            </>
          )}
        </Row>

        {/* Flash Sale Timer (mock) */}
        <div style={{ marginTop: 12, padding: "8px 12px", background: "#fff2e8", borderRadius: 4 }}>
          <Space>
            <ThunderboltOutlined style={{ color: "#fa541c" }} />
            <Text strong style={{ color: "#fa541c" }}>Flash Sale</Text>
            <Text>kết thúc sau</Text>
            <Tag color="red">02</Tag>:<Tag color="red">15</Tag>:<Tag color="red">30</Tag>
          </Space>
        </div>
      </Card>

      {/* Promotions */}
      <Card size="small" style={{ marginBottom: 16, background: "#f6ffed", borderColor: "#b7eb8f" }}>
        <Space direction="vertical" size={4} style={{ width: "100%" }}>
          <Space>
            <GiftOutlined style={{ color: "#52c41a" }} />
            <Text strong>Ưu đãi đặc biệt</Text>
          </Space>
          <List
            size="small"
            dataSource={[
              "Giảm thêm 5% khi thanh toán qua VNPAY",
              "Tặng kèm Remote thông minh trị giá 500.000đ",
              "Miễn phí lắp đặt trong nội thành",
              "Trả góp 0% lãi suất qua thẻ tín dụng",
            ]}
            renderItem={(item) => (
              <List.Item style={{ padding: "4px 0", border: "none" }}>
                <Space>
                  <CheckOutlined style={{ color: "#52c41a", fontSize: 12 }} />
                  <Text style={{ fontSize: 13 }}>{item}</Text>
                </Space>
              </List.Item>
            )}
          />
        </Space>
      </Card>
    </>
  );
}
