"use client";

import React from "react";
import { Row, Col, Typography } from "antd";
import {
  SafetyCertificateOutlined,
  TruckOutlined,
  SyncOutlined,
  ToolOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

const badges = [
  { icon: <SafetyCertificateOutlined />, text: "Chính hãng 100%", color: "#52c41a", bg: "#f6ffed" },
  { icon: <TruckOutlined />, text: "Giao hàng miễn phí", color: "#1890ff", bg: "#e6f7ff" },
  { icon: <SyncOutlined />, text: "Đổi trả 30 ngày", color: "#fa8c16", bg: "#fff7e6" },
  { icon: <ToolOutlined />, text: "Bảo hành 24 tháng", color: "#722ed1", bg: "#f9f0ff" },
];

export default function ProductTrustBadges() {
  return (
    <Row gutter={[8, 8]}>
      {badges.map((item, index) => (
        <Col span={12} key={index}>
          <div
            style={{
              padding: "8px 12px",
              background: item.bg,
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ color: item.color, fontSize: 18 }}>{item.icon}</span>
            <Text style={{ fontSize: 13 }}>{item.text}</Text>
          </div>
        </Col>
      ))}
    </Row>
  );
}
