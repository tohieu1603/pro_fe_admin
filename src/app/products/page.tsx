"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  Button,
  Space,
  Input,
  Select,
  Tag,
  Popconfirm,
  message,
  Typography,
  Row,
  Col,
  Card,
  Image,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  StopOutlined,
} from "@ant-design/icons";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import AdminLayout from "@/components/layout/AdminLayout";
import { productService, categoryService, brandService } from "@/services";
import type { Product, Category, Brand, ProductStatus } from "@/types";

const { Title } = Typography;
const { Option } = Select;

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    search: "",
    categoryId: "",
    brandId: "",
    status: "",
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await productService.getAll({
        page: pagination.current,
        limit: pagination.pageSize,
        search: filters.search || undefined,
        categoryId: filters.categoryId || undefined,
        brandId: filters.brandId || undefined,
        status: filters.status || undefined,
      });

      setProducts(response.data || []);
      setPagination((prev) => ({
        ...prev,
        total: response.meta?.total || 0,
      }));
    } catch (error) {
      message.error("Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const fetchFiltersData = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          categoryService.getActive(),
          brandService.getActive(),
        ]);
        setCategories(catRes.data || []);
        setBrands(brandRes.data || []);
      } catch (error) {
        console.error("Error fetching filter data:", error);
      }
    };
    fetchFiltersData();
  }, []);

  const handleTableChange = (paginationConfig: TablePaginationConfig) => {
    setPagination((prev) => ({
      ...prev,
      current: paginationConfig.current || 1,
      pageSize: paginationConfig.pageSize || 10,
    }));
  };

  const handleDelete = async (id: string) => {
    try {
      await productService.delete(id);
      message.success("Xóa sản phẩm thành công");
      fetchProducts();
    } catch (error) {
      message.error("Không thể xóa sản phẩm");
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await productService.publish(id);
      message.success("Đã xuất bản sản phẩm");
      fetchProducts();
    } catch (error) {
      message.error("Không thể xuất bản sản phẩm");
    }
  };

  const handleUnpublish = async (id: string) => {
    try {
      await productService.unpublish(id);
      message.success("Đã ẩn sản phẩm");
      fetchProducts();
    } catch (error) {
      message.error("Không thể ẩn sản phẩm");
    }
  };

  const columns: ColumnsType<Product> = [
    {
      title: "Hình ảnh",
      dataIndex: "media",
      key: "image",
      width: 80,
      render: (media) => {
        const primaryImage = media?.find((m: any) => m.isPrimary) || media?.[0];
        return primaryImage ? (
          <Image
            src={primaryImage.url}
            alt="Product"
            width={50}
            height={50}
            style={{ objectFit: "cover", borderRadius: 4 }}
            fallback="/placeholder.png"
          />
        ) : (
          <div
            style={{
              width: 50,
              height: 50,
              background: "#f0f0f0",
              borderRadius: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            N/A
          </div>
        );
      },
    },
    {
      title: "SPK",
      dataIndex: "spk",
      key: "spk",
      width: 120,
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
      key: "name",
      ellipsis: true,
    },
    {
      title: "Danh mục",
      dataIndex: ["category", "name"],
      key: "category",
      width: 150,
    },
    {
      title: "Thương hiệu",
      dataIndex: ["brand", "name"],
      key: "brand",
      width: 120,
    },
    {
      title: "Giá",
      dataIndex: "basePrice",
      key: "basePrice",
      width: 130,
      render: (price: number) =>
        new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(price),
    },
    {
      title: "Biến thể",
      dataIndex: "variants",
      key: "variants",
      width: 80,
      render: (variants) => variants?.length || 0,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: ProductStatus) => {
        const config: Record<string, { color: string; text: string }> = {
          draft: { color: "default", text: "Nháp" },
          active: { color: "success", text: "Đang bán" },
          inactive: { color: "warning", text: "Tạm ẩn" },
          discontinued: { color: "error", text: "Ngừng bán" },
        };
        return (
          <Tag color={config[status]?.color}>{config[status]?.text}</Tag>
        );
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 180,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => router.push(`/products/${record.id}`)}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => router.push(`/products/${record.id}/edit`)}
          />
          {record.status === "draft" || record.status === "inactive" ? (
            <Button
              type="text"
              icon={<CheckCircleOutlined />}
              style={{ color: "#52c41a" }}
              onClick={() => handlePublish(record.id)}
            />
          ) : (
            <Button
              type="text"
              icon={<StopOutlined />}
              style={{ color: "#faad14" }}
              onClick={() => handleUnpublish(record.id)}
            />
          )}
          <Popconfirm
            title="Xóa sản phẩm?"
            description="Bạn có chắc chắn muốn xóa sản phẩm này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="page-header">
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3}>Quản lý sản phẩm</Title>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => router.push("/products/new")}
            >
              Thêm sản phẩm
            </Button>
          </Col>
        </Row>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="Tìm kiếm..."
              prefix={<SearchOutlined />}
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
              onPressEnter={fetchProducts}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Danh mục"
              allowClear
              style={{ width: "100%" }}
              value={filters.categoryId || undefined}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, categoryId: value || "" }))
              }
            >
              {categories.map((cat) => (
                <Option key={cat.id} value={cat.id}>
                  {cat.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Thương hiệu"
              allowClear
              style={{ width: "100%" }}
              value={filters.brandId || undefined}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, brandId: value || "" }))
              }
            >
              {brands.map((brand) => (
                <Option key={brand.id} value={brand.id}>
                  {brand.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Trạng thái"
              allowClear
              style={{ width: "100%" }}
              value={filters.status || undefined}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, status: value || "" }))
              }
            >
              <Option value="draft">Nháp</Option>
              <Option value="active">Đang bán</Option>
              <Option value="inactive">Tạm ẩn</Option>
              <Option value="discontinued">Ngừng bán</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      <Table
        columns={columns}
        dataSource={products}
        rowKey="id"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} sản phẩm`,
        }}
        onChange={handleTableChange}
        scroll={{ x: 1200 }}
      />
    </AdminLayout>
  );
}
