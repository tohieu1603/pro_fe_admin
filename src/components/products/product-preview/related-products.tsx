"use client";

import React from "react";
import { Row, Col, Card, Typography, Space, Rate } from "antd";
import { formatCurrency } from "./types";

const { Text } = Typography;

export default function RelatedProducts() {
  return (
    <Card bordered={false} title="Sản phẩm tương tự" style={{ borderRadius: 12 }}>
      <Row gutter={[16, 16]}>
        {[1, 2, 3, 4].map((i) => (
          <Col xs={12} sm={8} md={6} key={i}>
            <Card
              hoverable
              cover={
                <img
                  alt={`related-${i}`}
                  src={`https://picsum.photos/seed/related${i}/300/300`}
                  style={{ height: 180, objectFit: "cover" }}
                />
              }
            >
              <Card.Meta
                title={<Text ellipsis>Sản phẩm liên quan {i}</Text>}
                description={
                  <Space direction="vertical" size={0}>
                    <Text type="danger" strong>{formatCurrency(5990000 + i * 1000000)}</Text>
                    <Space size={4}>
                      <Rate disabled defaultValue={4} style={{ fontSize: 10 }} />
                      <Text type="secondary" style={{ fontSize: 11 }}>(99)</Text>
                    </Space>
                  </Space>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>
    </Card>
  );
}
