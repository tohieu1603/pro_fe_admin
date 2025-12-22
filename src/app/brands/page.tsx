"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Table,
  Button,
  Space,
  Input,
  Tag,
  Popconfirm,
  message,
  Typography,
  Row,
  Col,
  Modal,
  Form,
  Switch,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import AdminLayout from "@/components/layout/AdminLayout";
import { brandService } from "@/services";
import type { Brand } from "@/types";

const { Title } = Typography;

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [form] = Form.useForm();

  const fetchBrands = useCallback(async () => {
    setLoading(true);
    try {
      const response = await brandService.getAll({
        page: pagination.current,
        limit: pagination.pageSize,
        search: search || undefined,
      });

      setBrands(response.data || []);
      setPagination((prev) => ({
        ...prev,
        total: response.meta?.total || 0,
      }));
    } catch (error) {
      message.error("Không thể tải danh sách thương hiệu");
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, search]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  const handleTableChange = (paginationConfig: TablePaginationConfig) => {
    setPagination((prev) => ({
      ...prev,
      current: paginationConfig.current || 1,
      pageSize: paginationConfig.pageSize || 10,
    }));
  };

  const handleDelete = async (id: string) => {
    try {
      await brandService.delete(id);
      message.success("Xóa thương hiệu thành công");
      fetchBrands();
    } catch (error) {
      message.error("Không thể xóa thương hiệu");
    }
  };

  const handleOpenModal = (brand?: Brand) => {
    if (brand) {
      setEditingBrand(brand);
      form.setFieldsValue(brand);
    } else {
      setEditingBrand(null);
      form.resetFields();
    }
    setModalVisible(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingBrand) {
        await brandService.update(editingBrand.id, values);
        message.success("Cập nhật thương hiệu thành công");
      } else {
        await brandService.create(values);
        message.success("Tạo thương hiệu thành công");
      }
      setModalVisible(false);
      fetchBrands();
    } catch (error: any) {
      message.error(
        error.response?.data?.message || "Không thể lưu thương hiệu"
      );
    }
  };

  const columns: ColumnsType<Brand> = [
    {
      title: "Tên thương hiệu",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Slug",
      dataIndex: "slug",
      key: "slug",
    },
    {
      title: "Quốc gia",
      dataIndex: "country",
      key: "country",
    },
    {
      title: "Website",
      dataIndex: "website",
      key: "website",
      render: (website) =>
        website ? (
          <a href={website} target="_blank" rel="noopener noreferrer">
            {website}
          </a>
        ) : (
          "-"
        ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive) => (
        <Tag color={isActive ? "success" : "default"}>
          {isActive ? "Hoạt động" : "Tạm ẩn"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleOpenModal(record)}
          />
          <Popconfirm
            title="Xóa thương hiệu?"
            description="Bạn có chắc chắn muốn xóa thương hiệu này?"
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
            <Title level={3}>Quản lý thương hiệu</Title>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleOpenModal()}
            >
              Thêm thương hiệu
            </Button>
          </Col>
        </Row>
      </div>

      <Row style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={8}>
          <Input
            placeholder="Tìm kiếm..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onPressEnter={fetchBrands}
          />
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={brands}
        rowKey="id"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} thương hiệu`,
        }}
        onChange={handleTableChange}
      />

      <Modal
        title={editingBrand ? "Chỉnh sửa thương hiệu" : "Thêm thương hiệu mới"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ isActive: true }}
        >
          <Form.Item
            name="name"
            label="Tên thương hiệu"
            rules={[
              { required: true, message: "Vui lòng nhập tên thương hiệu" },
            ]}
          >
            <Input placeholder="Nhập tên thương hiệu" />
          </Form.Item>

          <Form.Item name="slug" label="Slug">
            <Input placeholder="Tự động tạo từ tên" />
          </Form.Item>

          <Form.Item name="country" label="Quốc gia">
            <Input placeholder="Nhập quốc gia" />
          </Form.Item>

          <Form.Item name="website" label="Website">
            <Input placeholder="https://example.com" />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} placeholder="Mô tả về thương hiệu" />
          </Form.Item>

          <Form.Item name="isActive" label="Hoạt động" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                {editingBrand ? "Cập nhật" : "Tạo mới"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </AdminLayout>
  );
}
