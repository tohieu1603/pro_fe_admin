"use client";

import { useEffect, useState } from "react";
import { Row, Col, Card, Statistic, Typography, Spin, Table, Tag } from "antd";
import {
  ShoppingOutlined,
  AppstoreOutlined,
  TagsOutlined,
  InboxOutlined,
  ArrowUpOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import AdminLayout from "@/components/layout/AdminLayout";
import { productService, brandService, categoryService, inventoryService } from "@/services";
import type { Product, Inventory } from "@/types";

const { Title } = Typography;

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    brands: 0,
    lowStock: 0,
  });
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [lowStockItems, setLowStockItems] = useState<Inventory[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes, brandsRes, lowStockRes] =
          await Promise.all([
            productService.getAll({ limit: 5 }),
            categoryService.getAll({ limit: 1 }),
            brandService.getAll({ limit: 1 }),
            inventoryService.getLowStock(),
          ]);

        setStats({
          products: productsRes.meta?.total || 0,
          categories: categoriesRes.meta?.total || 0,
          brands: brandsRes.meta?.total || 0,
          lowStock: lowStockRes.data?.length || 0,
        });

        setRecentProducts(productsRes.data || []);
        setLowStockItems((lowStockRes.data || []).slice(0, 5));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const recentProductColumns = [
    {
      title: "SPK",
      dataIndex: "spk",
      key: "spk",
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
      key: "name",
      ellipsis: true,
    },
    {
      title: "Giá",
      dataIndex: "basePrice",
      key: "basePrice",
      render: (price: number) =>
        new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(price),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const colors: Record<string, string> = {
          draft: "default",
          active: "success",
          inactive: "warning",
          discontinued: "error",
        };
        return <Tag color={colors[status]}>{status.toUpperCase()}</Tag>;
      },
    },
  ];

  const lowStockColumns = [
    {
      title: "SKU",
      dataIndex: ["variant", "sku"],
      key: "sku",
    },
    {
      title: "Sản phẩm",
      dataIndex: ["variant", "product", "name"],
      key: "product",
      ellipsis: true,
    },
    {
      title: "Kho",
      dataIndex: ["warehouse", "name"],
      key: "warehouse",
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      render: (qty: number, record: Inventory) => (
        <span
          style={{
            color: qty === 0 ? "#ff4d4f" : qty < 10 ? "#faad14" : undefined,
          }}
        >
          {qty}
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ textAlign: "center", padding: 100 }}>
          <Spin size="large" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Title level={3}>Dashboard</Title>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng sản phẩm"
              value={stats.products}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Danh mục"
              value={stats.categories}
              prefix={<AppstoreOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Thương hiệu"
              value={stats.brands}
              prefix={<TagsOutlined />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Sắp hết hàng"
              value={stats.lowStock}
              prefix={<WarningOutlined />}
              valueStyle={{ color: stats.lowStock > 0 ? "#faad14" : "#52c41a" }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Sản phẩm mới nhất">
            <Table
              columns={recentProductColumns}
              dataSource={recentProducts}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Sản phẩm sắp hết hàng">
            <Table
              columns={lowStockColumns}
              dataSource={lowStockItems}
              rowKey="id"
              pagination={false}
              size="small"
              locale={{ emptyText: "Không có sản phẩm nào sắp hết hàng" }}
            />
          </Card>
        </Col>
      </Row>
    </AdminLayout>
  );
}
