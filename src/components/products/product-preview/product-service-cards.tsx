"use client";

import React from "react";
import { Row, Col, Card, Typography, Space } from "antd";
import {
  SafetyCertificateOutlined,
  SyncOutlined,
  ToolOutlined,
  CustomerServiceOutlined,
  TruckOutlined,
  GiftOutlined,
  CheckCircleOutlined,
  StarOutlined,
} from "@ant-design/icons";
import type { ServiceInfo } from "@/types";

const { Text } = Typography;

interface ProductServiceCardsProps {
  services: ServiceInfo[];
}

const getServiceIcon = (iconName?: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    safety: <SafetyCertificateOutlined style={{ fontSize: 24, color: "#1e8c00" }} />,
    sync: <SyncOutlined style={{ fontSize: 24, color: "#1e8c00" }} />,
    tool: <ToolOutlined style={{ fontSize: 24, color: "#1e8c00" }} />,
    support: <CustomerServiceOutlined style={{ fontSize: 24, color: "#1e8c00" }} />,
    truck: <TruckOutlined style={{ fontSize: 24, color: "#1e8c00" }} />,
    gift: <GiftOutlined style={{ fontSize: 24, color: "#1e8c00" }} />,
    check: <CheckCircleOutlined style={{ fontSize: 24, color: "#1e8c00" }} />,
    star: <StarOutlined style={{ fontSize: 24, color: "#1e8c00" }} />,
  };

  return iconMap[iconName || "check"] || <CheckCircleOutlined style={{ fontSize: 24, color: "#1e8c00" }} />;
};

export default function ProductServiceCards({ services }: ProductServiceCardsProps) {
  if (!services || services.length === 0) return null;

  return (
    <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
      {services.map((service) => (
        <Col xs={12} sm={8} md={6} key={service.id}>
          <Card
            size="small"
            style={{
              textAlign: "center",
              height: "100%",
              borderColor: "#e8f5e9",
              background: "linear-gradient(135deg, #fff 0%, #f0fff0 100%)",
            }}
            styles={{ body: { padding: "12px 8px" } }}
          >
            <Space direction="vertical" size={4}>
              {getServiceIcon(service.icon)}
              <Text strong style={{ fontSize: 12, display: "block" }}>
                {service.name}
              </Text>
              {service.description && (
                <Text type="secondary" style={{ fontSize: 11, display: "block" }}>
                  {service.description}
                </Text>
              )}
            </Space>
          </Card>
        </Col>
      ))}
    </Row>
  );
}
