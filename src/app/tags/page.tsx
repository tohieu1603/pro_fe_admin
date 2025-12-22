"use client";

import { useEffect, useState, useCallback } from "react";
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
  Modal,
  Form,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import AdminLayout from "@/components/layout/AdminLayout";
import { tagService } from "@/services";
import type { Tag as TagType, TagType as TagTypeEnum } from "@/types";

const { Title } = Typography;
const { Option } = Select;

export default function TagsPage() {
  const [tags, setTags] = useState<TagType[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTag, setEditingTag] = useState<TagType | null>(null);
  const [form] = Form.useForm();

  const fetchTags = useCallback(async () => {
    setLoading(true);
    try {
      const response = await tagService.getAll({
        page: pagination.current,
        limit: pagination.pageSize,
        search: search || undefined,
        type: typeFilter as TagTypeEnum || undefined,
      });

      setTags(response.data || []);
      setPagination((prev) => ({
        ...prev,
        total: response.meta?.total || 0,
      }));
    } catch (error) {
      message.error("Không thể tải danh sách tags");
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, search, typeFilter]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const handleTableChange = (paginationConfig: TablePaginationConfig) => {
    setPagination((prev) => ({
      ...prev,
      current: paginationConfig.current || 1,
      pageSize: paginationConfig.pageSize || 10,
    }));
  };

  const handleDelete = async (id: string) => {
    try {
      await tagService.delete(id);
      message.success("Xóa tag thành công");
      fetchTags();
    } catch (error) {
      message.error("Không thể xóa tag");
    }
  };

  const handleOpenModal = (tag?: TagType) => {
    if (tag) {
      setEditingTag(tag);
      form.setFieldsValue(tag);
    } else {
      setEditingTag(null);
      form.resetFields();
    }
    setModalVisible(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingTag) {
        await tagService.update(editingTag.id, values);
        message.success("Cập nhật tag thành công");
      } else {
        await tagService.create(values);
        message.success("Tạo tag thành công");
      }
      setModalVisible(false);
      fetchTags();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Không thể lưu tag");
    }
  };

  const columns: ColumnsType<TagType> = [
    {
      title: "Tên tag",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Slug",
      dataIndex: "slug",
      key: "slug",
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      render: (type: TagTypeEnum) => {
        const config: Record<string, { color: string; text: string }> = {
          general: { color: "default", text: "Chung" },
          badge: { color: "blue", text: "Badge" },
          promotion: { color: "red", text: "Khuyến mãi" },
        };
        return <Tag color={config[type]?.color}>{config[type]?.text}</Tag>;
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
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
            title="Xóa tag?"
            description="Bạn có chắc chắn muốn xóa tag này?"
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
            <Title level={3}>Quản lý Tags</Title>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleOpenModal()}
            >
              Thêm tag
            </Button>
          </Col>
        </Row>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={8}>
          <Input
            placeholder="Tìm kiếm..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onPressEnter={fetchTags}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Select
            placeholder="Loại tag"
            allowClear
            style={{ width: "100%" }}
            value={typeFilter || undefined}
            onChange={(value) => setTypeFilter(value || "")}
          >
            <Option value="general">Chung</Option>
            <Option value="badge">Badge</Option>
            <Option value="promotion">Khuyến mãi</Option>
          </Select>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={tags}
        rowKey="id"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} tags`,
        }}
        onChange={handleTableChange}
      />

      <Modal
        title={editingTag ? "Chỉnh sửa tag" : "Thêm tag mới"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ type: "general" }}
        >
          <Form.Item
            name="name"
            label="Tên tag"
            rules={[{ required: true, message: "Vui lòng nhập tên tag" }]}
          >
            <Input placeholder="Nhập tên tag" />
          </Form.Item>

          <Form.Item name="slug" label="Slug">
            <Input placeholder="Tự động tạo từ tên" />
          </Form.Item>

          <Form.Item
            name="type"
            label="Loại"
            rules={[{ required: true, message: "Vui lòng chọn loại" }]}
          >
            <Select placeholder="Chọn loại tag">
              <Option value="general">Chung</Option>
              <Option value="badge">Badge</Option>
              <Option value="promotion">Khuyến mãi</Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                {editingTag ? "Cập nhật" : "Tạo mới"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </AdminLayout>
  );
}
