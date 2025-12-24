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
  InputNumber,
  Tabs,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  StarOutlined,
  StarFilled,
  CopyOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import AdminLayout from "@/components/layout/AdminLayout";
import { regionService } from "@/services";
import type { Region, CreateRegionDTO } from "@/types";

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function RegionsPage() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRegion, setEditingRegion] = useState<Region | null>(null);
  const [form] = Form.useForm();

  const fetchRegions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await regionService.getAll({
        page: pagination.current,
        limit: pagination.pageSize,
        search: search || undefined,
      });

      setRegions(response.data || []);
      setPagination((prev) => ({
        ...prev,
        total: response.meta?.total || 0,
      }));
    } catch (error) {
      message.error("Không thể tải danh sách vùng/tỉnh");
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, search]);

  useEffect(() => {
    fetchRegions();
  }, [fetchRegions]);

  const handleTableChange = (paginationConfig: TablePaginationConfig) => {
    setPagination((prev) => ({
      ...prev,
      current: paginationConfig.current || 1,
      pageSize: paginationConfig.pageSize || 10,
    }));
  };

  const handleDelete = async (id: string) => {
    try {
      await regionService.delete(id);
      message.success("Xóa vùng thành công");
      fetchRegions();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Không thể xóa vùng");
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await regionService.setDefault(id);
      message.success("Đã đặt làm vùng mặc định");
      fetchRegions();
    } catch (error) {
      message.error("Không thể đặt làm mặc định");
    }
  };

  const handleOpenModal = (region?: Region) => {
    if (region) {
      setEditingRegion(region);
      form.setFieldsValue(region);
    } else {
      setEditingRegion(null);
      form.resetFields();
    }
    setModalVisible(true);
  };

  const handleSubmit = async (values: CreateRegionDTO) => {
    try {
      if (editingRegion) {
        await regionService.update(editingRegion.id, values);
        message.success("Cập nhật vùng thành công");
      } else {
        await regionService.create(values);
        message.success("Tạo vùng thành công");
      }
      setModalVisible(false);
      fetchRegions();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Không thể lưu vùng");
    }
  };

  const copySubdomainUrl = (subdomain: string) => {
    const url = `https://${subdomain}.yourdomain.com`;
    navigator.clipboard.writeText(url);
    message.success("Đã copy URL subdomain");
  };

  const columns: ColumnsType<Region> = [
    {
      title: "Tên vùng/Tỉnh",
      dataIndex: "name",
      key: "name",
      render: (name, record) => (
        <Space>
          <span style={{ fontWeight: 500 }}>{name}</span>
          {record.isDefault && (
            <Tag color="gold" icon={<StarFilled />}>
              Mặc định
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: "Subdomain",
      dataIndex: "subdomain",
      key: "subdomain",
      render: (subdomain) => (
        <Space>
          <Tag color="blue" icon={<GlobalOutlined />}>
            {subdomain}
          </Tag>
          <Tooltip title="Copy URL">
            <Button
              type="text"
              size="small"
              icon={<CopyOutlined />}
              onClick={() => copySubdomainUrl(subdomain)}
            />
          </Tooltip>
        </Space>
      ),
    },
    {
      title: "Điện thoại",
      dataIndex: "phone",
      key: "phone",
      render: (phone) => phone || "-",
    },
    {
      title: "Tỉnh/TP",
      dataIndex: "province",
      key: "province",
      render: (province) => province || "-",
    },
    {
      title: "Phí ship",
      dataIndex: "shippingFee",
      key: "shippingFee",
      align: "right",
      render: (fee) =>
        fee ? `${Number(fee).toLocaleString("vi-VN")}đ` : "Miễn phí",
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
      width: 150,
      render: (_, record) => (
        <Space size="small">
          {!record.isDefault && (
            <Tooltip title="Đặt làm mặc định">
              <Button
                type="text"
                icon={<StarOutlined />}
                onClick={() => handleSetDefault(record.id)}
              />
            </Tooltip>
          )}
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleOpenModal(record)}
          />
          <Popconfirm
            title="Xóa vùng?"
            description="Bạn có chắc chắn muốn xóa vùng này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              disabled={record.isDefault}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const tabItems = [
    {
      key: "basic",
      label: "Thông tin cơ bản",
      children: (
        <>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Tên vùng/Tỉnh"
                rules={[{ required: true, message: "Vui lòng nhập tên" }]}
              >
                <Input placeholder="VD: Hà Nội, TP.HCM..." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="subdomain" label="Subdomain">
                <Input placeholder="VD: ha-noi, hcm..." />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="phone" label="Số điện thoại">
                <Input placeholder="Hotline vùng" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phoneSecondary" label="SĐT phụ">
                <Input placeholder="Số điện thoại phụ" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="email" label="Email">
                <Input placeholder="Email liên hệ" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="province" label="Tỉnh/Thành phố">
                <Input placeholder="Tên tỉnh/TP" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="address" label="Địa chỉ">
            <TextArea rows={2} placeholder="Địa chỉ chi nhánh" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="shippingFee" label="Phí vận chuyển">
                <InputNumber
                  style={{ width: "100%" }}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
                  placeholder="0"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="freeShippingThreshold" label="Miễn phí từ">
                <InputNumber
                  style={{ width: "100%" }}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
                  placeholder="Đơn hàng từ..."
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="displayOrder" label="Thứ tự">
                <InputNumber style={{ width: "100%" }} placeholder="0" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="isActive"
                label="Hoạt động"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="isDefault"
                label="Vùng mặc định"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </>
      ),
    },
    {
      key: "seo",
      label: "SEO",
      children: (
        <>
          <Form.Item name="metaTitle" label="Meta Title">
            <Input placeholder="Tiêu đề SEO cho vùng" maxLength={60} showCount />
          </Form.Item>
          <Form.Item name="metaDescription" label="Meta Description">
            <TextArea
              rows={3}
              placeholder="Mô tả SEO cho vùng"
              maxLength={160}
              showCount
            />
          </Form.Item>
          <Form.Item name="ogImage" label="OG Image URL">
            <Input placeholder="URL hình ảnh khi share" />
          </Form.Item>
        </>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="page-header">
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3}>Quản lý Vùng/Chi nhánh</Title>
            <Text type="secondary">
              Quản lý các vùng/tỉnh thành với subdomain riêng
            </Text>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleOpenModal()}
            >
              Thêm vùng
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
            onPressEnter={() => fetchRegions()}
          />
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={regions}
        rowKey="id"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} vùng`,
        }}
        onChange={handleTableChange}
      />

      <Modal
        title={editingRegion ? "Chỉnh sửa vùng" : "Thêm vùng mới"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ isActive: true, displayOrder: 0, shippingFee: 0 }}
        >
          <Tabs items={tabItems} />

          <Form.Item style={{ marginBottom: 0, textAlign: "right", marginTop: 16 }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                {editingRegion ? "Cập nhật" : "Tạo mới"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </AdminLayout>
  );
}
