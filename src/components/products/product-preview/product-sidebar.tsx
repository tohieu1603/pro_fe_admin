"use client";

import React from "react";
import { Card, Space, Typography, Divider, Row, Col, Statistic, Button, Avatar, Badge, Timeline } from "antd";
import {
  PhoneOutlined,
  EnvironmentOutlined,
  TruckOutlined,
  CreditCardOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

interface ProductSidebarProps {
  brandName?: string;
}

export default function ProductSidebar({ brandName }: ProductSidebarProps) {
  return (
    <>
      {/* Seller Info */}
      <Card size="small" title="Thông tin cửa hàng" style={{ marginBottom: 16 }}>
        <Space direction="vertical" size={8} style={{ width: "100%" }}>
          <Space>
            <Avatar size={48} style={{ backgroundColor: "#1890ff" }}>
              {brandName?.[0] || "S"}
            </Avatar>
            <div>
              <Text strong>Product Admin Store</Text>
              <br />
              <Space size={4}>
                <Badge status="success" />
                <Text type="secondary" style={{ fontSize: 12 }}>Online</Text>
              </Space>
            </div>
          </Space>
          <Divider style={{ margin: "8px 0" }} />
          <Row gutter={8}>
            <Col span={12}>
              <Statistic title="Đánh giá" value="4.8/5" valueStyle={{ fontSize: 16 }} />
            </Col>
            <Col span={12}>
              <Statistic title="Sản phẩm" value={125} valueStyle={{ fontSize: 16 }} />
            </Col>
          </Row>
          <Button block icon={<PhoneOutlined />}>Liên hệ ngay</Button>
        </Space>
      </Card>

      {/* Delivery Info */}
      <Card size="small" title="Thông tin vận chuyển" style={{ marginBottom: 16 }}>
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <Space>
            <EnvironmentOutlined style={{ color: "#1890ff" }} />
            <div>
              <Text>Giao đến</Text>
              <br />
              <Text strong>Q. Cầu Giấy, Hà Nội</Text>
              <Button type="link" size="small">Đổi địa chỉ</Button>
            </div>
          </Space>
          <Space>
            <TruckOutlined style={{ color: "#52c41a" }} />
            <div>
              <Text style={{ color: "#52c41a" }}>Miễn phí vận chuyển</Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>Nhận hàng trong 2-3 ngày</Text>
            </div>
          </Space>
          <Space>
            <CreditCardOutlined style={{ color: "#722ed1" }} />
            <div>
              <Text>Thanh toán khi nhận hàng (COD)</Text>
            </div>
          </Space>
        </Space>
      </Card>

      {/* Warranty */}
      <Card size="small" title="Chính sách bảo hành">
        <Timeline
          items={[
            { color: "green", children: "Bảo hành 24 tháng chính hãng" },
            { color: "green", children: "1 đổi 1 trong 30 ngày nếu lỗi NSX" },
            { color: "blue", children: "Hỗ trợ kỹ thuật trọn đời" },
          ]}
        />
      </Card>
    </>
  );
}
