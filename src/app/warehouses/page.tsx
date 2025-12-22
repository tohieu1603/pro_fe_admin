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
import { warehouseService } from "@/services";
import type { Warehouse } from "@/types";

const { Title } = Typography;

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(
    null
  );
  const [form] = Form.useForm();

  const fetchWarehouses = useCallback(async () => {
    setLoading(true);
    try {
      const response = await warehouseService.getAll({
        page: pagination.current,
        limit: pagination.pageSize,
        search: search || undefined,
      });

      setWarehouses(response.data || []);
      setPagination((prev) => ({
        ...prev,
        total: response.meta?.total || 0,
      }));
    } catch (error) {
      message.error("Không thể tải danh sách kho");
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, search]);

  useEffect(() => {
    fetchWarehouses();
  }, [fetchWarehouses]);

  const handleTableChange = (paginationConfig: TablePaginationConfig) => {
    setPagination((prev) => ({
      ...prev,
      current: paginationConfig.current || 1,
      pageSize: paginationConfig.pageSize || 10,
    }));
  };

  const handleDelete = async (id: string) => {
    try {
      await warehouseService.delete(id);
      message.success("Xóa kho thành công");
      fetchWarehouses();
    } catch (error) {
      message.error("Không thể xóa kho");
    }
  };

  const handleOpenModal = (warehouse?: Warehouse) => {
    if (warehouse) {
      setEditingWarehouse(warehouse);
      form.setFieldsValue(warehouse);
    } else {
      setEditingWarehouse(null);
      form.resetFields();
    }
    setModalVisible(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingWarehouse) {
        await warehouseService.update(editingWarehouse.id, values);
        message.success("Cập nhật kho thành công");
      } else {
        await warehouseService.create(values);
        message.success("Tạo kho thành công");
      }
      setModalVisible(false);
      fetchWarehouses();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Không thể lưu kho");
    }
  };

  const columns: ColumnsType<Warehouse> = [
    {
      title: "Mã kho",
      dataIndex: "code",
      key: "code",
      width: 120,
    },
    {
      title: "Tên kho",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Thành phố",
      dataIndex: "city",
      key: "city",
    },
    {
      title: "Tỉnh/Thành",
      dataIndex: "province",
      key: "province",
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
      ellipsis: true,
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
            title="Xóa kho?"
            description="Bạn có chắc chắn muốn xóa kho này?"
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
            <Title level={3}>Quản lý kho hàng</Title>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleOpenModal()}
            >
              Thêm kho
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
            onPressEnter={fetchWarehouses}
          />
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={warehouses}
        rowKey="id"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} kho`,
        }}
        onChange={handleTableChange}
      />

      <Modal
        title={editingWarehouse ? "Chỉnh sửa kho" : "Thêm kho mới"}
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
            name="code"
            label="Mã kho"
            rules={[{ required: true, message: "Vui lòng nhập mã kho" }]}
          >
            <Input placeholder="VD: WH-HN" />
          </Form.Item>

          <Form.Item
            name="name"
            label="Tên kho"
            rules={[{ required: true, message: "Vui lòng nhập tên kho" }]}
          >
            <Input placeholder="Nhập tên kho" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="city" label="Thành phố">
                <Input placeholder="Nhập thành phố" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="province" label="Tỉnh/Thành">
                <Input placeholder="Nhập tỉnh/thành" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="address" label="Địa chỉ">
            <Input.TextArea rows={2} placeholder="Địa chỉ chi tiết" />
          </Form.Item>

          <Form.Item name="isActive" label="Hoạt động" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                {editingWarehouse ? "Cập nhật" : "Tạo mới"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </AdminLayout>
  );
}
