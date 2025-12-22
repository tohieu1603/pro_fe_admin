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
  Select,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import AdminLayout from "@/components/layout/AdminLayout";
import AuthGuard from "@/components/auth/AuthGuard";
import { userService } from "@/services";
import { User, UserRole } from "@/types";

const { Title } = Typography;

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await userService.getAll({
        page: pagination.current,
        limit: pagination.pageSize,
        search: search || undefined,
      });

      setUsers(response.data || []);
      setPagination((prev) => ({
        ...prev,
        total: response.meta?.total || 0,
      }));
    } catch (error) {
      message.error("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleTableChange = (paginationConfig: TablePaginationConfig) => {
    setPagination((prev) => ({
      ...prev,
      current: paginationConfig.current || 1,
      pageSize: paginationConfig.pageSize || 10,
    }));
  };

  const handleDelete = async (id: string) => {
    try {
      await userService.delete(id);
      message.success("Xóa người dùng thành công");
      fetchUsers();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Không thể xóa người dùng");
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await userService.toggleActive(id);
      message.success("Cập nhật trạng thái thành công");
      fetchUsers();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Không thể cập nhật trạng thái");
    }
  };

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      form.setFieldsValue({
        ...user,
        password: undefined,
      });
    } else {
      setEditingUser(null);
      form.resetFields();
    }
    setModalVisible(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      // Remove password if empty (for edit)
      if (editingUser && !values.password) {
        delete values.password;
      }

      if (editingUser) {
        await userService.update(editingUser.id, values);
        message.success("Cập nhật người dùng thành công");
      } else {
        await userService.create(values);
        message.success("Tạo người dùng thành công");
      }
      setModalVisible(false);
      fetchUsers();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Không thể lưu người dùng");
    }
  };

  const columns: ColumnsType<User> = [
    {
      title: "Họ tên",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      render: (role: UserRole) => (
        <Tag color={role === UserRole.ADMIN ? "red" : "blue"}>
          {role === UserRole.ADMIN ? "Admin" : "User"}
        </Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean, record: User) => (
        <Switch
          checked={isActive}
          onChange={() => handleToggleActive(record.id)}
          checkedChildren="Active"
          unCheckedChildren="Inactive"
        />
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleDateString("vi-VN"),
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
            title="Xóa người dùng?"
            description="Bạn có chắc chắn muốn xóa người dùng này?"
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
    <AuthGuard requiredRole={UserRole.ADMIN}>
      <AdminLayout>
        <div className="page-header">
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={3}>Quản lý người dùng</Title>
            </Col>
            <Col>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => handleOpenModal()}
              >
                Thêm người dùng
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
              onPressEnter={fetchUsers}
            />
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} người dùng`,
          }}
          onChange={handleTableChange}
        />

        <Modal
          title={editingUser ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
          destroyOnClose
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{ role: UserRole.USER, isActive: true }}
          >
            <Form.Item
              name="name"
              label="Họ tên"
              rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
            >
              <Input placeholder="Nhập họ tên" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Vui lòng nhập email" },
                { type: "email", message: "Email không hợp lệ" },
              ]}
            >
              <Input placeholder="Nhập email" />
            </Form.Item>

            <Form.Item
              name="password"
              label={editingUser ? "Mật khẩu mới (để trống nếu không đổi)" : "Mật khẩu"}
              rules={
                editingUser
                  ? []
                  : [
                      { required: true, message: "Vui lòng nhập mật khẩu" },
                      { min: 6, message: "Mật khẩu tối thiểu 6 ký tự" },
                    ]
              }
            >
              <Input.Password placeholder="Nhập mật khẩu" />
            </Form.Item>

            <Form.Item name="role" label="Vai trò">
              <Select>
                <Select.Option value={UserRole.USER}>User</Select.Option>
                <Select.Option value={UserRole.ADMIN}>Admin</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="isActive"
              label="Trạng thái"
              valuePropName="checked"
            >
              <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
              <Space>
                <Button onClick={() => setModalVisible(false)}>Hủy</Button>
                <Button type="primary" htmlType="submit">
                  {editingUser ? "Cập nhật" : "Tạo mới"}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </AdminLayout>
    </AuthGuard>
  );
}
