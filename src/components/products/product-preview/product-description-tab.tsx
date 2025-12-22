"use client";

import React from "react";
import { Row, Col, Card, Typography, Space, Avatar } from "antd";
import {
  ThunderboltOutlined,
  SafetyCertificateOutlined,
  ToolOutlined,
  CustomerServiceOutlined,
} from "@ant-design/icons";
import type { Product } from "@/types";
import ProductSidebar from "./product-sidebar";

const { Text, Paragraph } = Typography;

interface ProductDescriptionTabProps {
  product: Product;
}

const keyFeatures = [
  { icon: <ThunderboltOutlined />, title: "Tiết kiệm điện", desc: "Công nghệ Inverter giảm đến 60% điện năng" },
  { icon: <SafetyCertificateOutlined />, title: "An toàn", desc: "Đạt tiêu chuẩn an toàn quốc tế" },
  { icon: <ToolOutlined />, title: "Bền bỉ", desc: "Tuổi thọ cao, ít hỏng hóc" },
  { icon: <CustomerServiceOutlined />, title: "Hỗ trợ 24/7", desc: "Đội ngũ kỹ thuật luôn sẵn sàng" },
];

export default function ProductDescriptionTab({ product }: ProductDescriptionTabProps) {
  return (
    <Row gutter={32}>
      <Col xs={24} lg={16}>
        {/* Short Description */}
        {product.shortDescription && (
          <Card size="small" style={{ marginBottom: 16, background: "#fafafa" }}>
            <Text strong style={{ fontSize: 15 }}>{product.shortDescription}</Text>
          </Card>
        )}

        {/* Main Description */}
        {product.description ? (
          <div
            className="product-description"
            style={{ fontSize: 15, lineHeight: 1.8 }}
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        ) : (
          <Paragraph style={{ fontSize: 15, lineHeight: 1.8 }}>
            Chưa có mô tả chi tiết cho sản phẩm này.
          </Paragraph>
        )}

        {/* Key Features */}
        <Card title="Điểm nổi bật" size="small" style={{ marginTop: 24 }}>
          <Row gutter={[16, 16]}>
            {keyFeatures.map((item, index) => (
              <Col span={12} key={index}>
                <Space align="start">
                  <Avatar style={{ backgroundColor: "#1890ff" }} icon={item.icon} />
                  <div>
                    <Text strong>{item.title}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 13 }}>{item.desc}</Text>
                  </div>
                </Space>
              </Col>
            ))}
          </Row>
        </Card>
      </Col>

      {/* Sidebar */}
      <Col xs={24} lg={8}>
        <ProductSidebar brandName={product.brand?.name} />
      </Col>
    </Row>
  );
}
