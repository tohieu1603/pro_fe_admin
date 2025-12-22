"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Table,
  Button,
  Space,
  Input,
  Select,
  Tag,
  message,
  Typography,
  Row,
  Col,
  Modal,
  Form,
  InputNumber,
  Card,
  Tabs,
} from "antd";
import {
  PlusOutlined,
  SwapOutlined,
  HistoryOutlined,
  SearchOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import AdminLayout from "@/components/layout/AdminLayout";
import { inventoryService, warehouseService, variantService } from "@/services";
import type { Inventory, Warehouse, ProductVariant, InventoryMovement, MovementType } from "@/types";

const { Title, Text } = Typography;
const { Option } = Select;

export default function InventoryPage() {
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    search: "",
    warehouseId: "",
    lowStock: false,
  });
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [transferModalVisible, setTransferModalVisible] = useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [transferForm] = Form.useForm();

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      const response = await inventoryService.getAll({
        page: pagination.current,
        limit: pagination.pageSize,
        search: filters.search || undefined,
        warehouseId: filters.warehouseId || undefined,
        lowStock: filters.lowStock || undefined,
      });

      setInventory(response.data || []);
      setPagination((prev) => ({
        ...prev,
        total: response.meta?.total || 0,
      }));
    } catch (error) {
      message.error("Không thể tải danh sách tồn kho");
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, filters]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const response = await warehouseService.getActive();
        setWarehouses(response.data || []);
      } catch (error) {
        console.error("Error fetching warehouses:", error);
      }
    };
    fetchWarehouses();
  }, []);

  const handleTableChange = (paginationConfig: TablePaginationConfig) => {
    setPagination((prev) => ({
      ...prev,
      current: paginationConfig.current || 1,
      pageSize: paginationConfig.pageSize || 10,
    }));
  };

  const handleUpdateInventory = async (values: any) => {
    try {
      await inventoryService.updateInventory({
        variantId: values.variantId,
        warehouseId: values.warehouseId,
        quantity: values.quantity,
        type: values.type,
        note: values.note,
      });
      message.success("Cập nhật tồn kho thành công");
      setUpdateModalVisible(false);
      form.resetFields();
      fetchInventory();
    } catch (error) {
      message.error("Không thể cập nhật tồn kho");
    }
  };

  const handleTransferInventory = async (values: any) => {
    try {
      await inventoryService.transferInventory({
        variantId: values.variantId,
        fromWarehouseId: values.fromWarehouseId,
        toWarehouseId: values.toWarehouseId,
        quantity: values.quantity,
        note: values.note,
      });
      message.success("Chuyển kho thành công");
      setTransferModalVisible(false);
      transferForm.resetFields();
      fetchInventory();
    } catch (error) {
      message.error("Không thể chuyển kho");
    }
  };

  const handleViewHistory = async (variantId?: string, warehouseId?: string) => {
    try {
      const response = await inventoryService.getMovementHistory(
        variantId,
        warehouseId,
        50
      );
      setMovements(response.data || []);
      setHistoryModalVisible(true);
    } catch (error) {
      message.error("Không thể tải lịch sử");
    }
  };

  const columns: ColumnsType<Inventory> = [
    {
      title: "SKU",
      dataIndex: ["variant", "sku"],
      key: "sku",
      width: 150,
    },
    {
      title: "Sản phẩm",
      dataIndex: ["variant", "product", "name"],
      key: "product",
      ellipsis: true,
    },
    {
      title: "Biến thể",
      dataIndex: ["variant", "name"],
      key: "variant",
      width: 120,
    },
    {
      title: "Kho",
      dataIndex: ["warehouse", "name"],
      key: "warehouse",
      width: 150,
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
      render: (qty: number, record: Inventory) => {
        const threshold = record.variant?.lowStockThreshold || 5;
        const isLow = qty <= threshold && qty > 0;
        const isOut = qty === 0;
        return (
          <Text
            type={isOut ? "danger" : isLow ? "warning" : undefined}
            strong={isLow || isOut}
          >
            {isLow && <WarningOutlined style={{ marginRight: 4 }} />}
            {qty}
          </Text>
        );
      },
    },
    {
      title: "Đã đặt",
      dataIndex: "reservedQuantity",
      key: "reservedQuantity",
      width: 80,
    },
    {
      title: "Khả dụng",
      key: "available",
      width: 100,
      render: (_, record) => record.quantity - record.reservedQuantity,
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 100,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<HistoryOutlined />}
            onClick={() =>
              handleViewHistory(record.variantId, record.warehouseId)
            }
            title="Xem lịch sử"
          />
        </Space>
      ),
    },
  ];

  const movementColumns: ColumnsType<InventoryMovement> = [
    {
      title: "Thời gian",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleString("vi-VN"),
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      render: (type: MovementType) => {
        const config: Record<string, { color: string; text: string }> = {
          in: { color: "success", text: "Nhập" },
          out: { color: "error", text: "Xuất" },
          transfer: { color: "processing", text: "Chuyển" },
          adjustment: { color: "warning", text: "Điều chỉnh" },
        };
        return <Tag color={config[type]?.color}>{config[type]?.text}</Tag>;
      },
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Kho",
      dataIndex: ["warehouse", "name"],
      key: "warehouse",
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
      ellipsis: true,
    },
  ];

  return (
    <AdminLayout>
      <div className="page-header">
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3}>Quản lý tồn kho</Title>
          </Col>
          <Col>
            <Space>
              <Button
                icon={<PlusOutlined />}
                onClick={() => setUpdateModalVisible(true)}
              >
                Nhập/Xuất kho
              </Button>
              <Button
                icon={<SwapOutlined />}
                onClick={() => setTransferModalVisible(true)}
              >
                Chuyển kho
              </Button>
              <Button
                icon={<HistoryOutlined />}
                onClick={() => handleViewHistory()}
              >
                Lịch sử
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Tìm SKU hoặc tên sản phẩm..."
              prefix={<SearchOutlined />}
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
              onPressEnter={fetchInventory}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Chọn kho"
              allowClear
              style={{ width: "100%" }}
              value={filters.warehouseId || undefined}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, warehouseId: value || "" }))
              }
            >
              {warehouses.map((wh) => (
                <Option key={wh.id} value={wh.id}>
                  {wh.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Button
              type={filters.lowStock ? "primary" : "default"}
              icon={<WarningOutlined />}
              onClick={() =>
                setFilters((prev) => ({ ...prev, lowStock: !prev.lowStock }))
              }
            >
              Sắp hết
            </Button>
          </Col>
        </Row>
      </Card>

      <Table
        columns={columns}
        dataSource={inventory}
        rowKey="id"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} bản ghi`,
        }}
        onChange={handleTableChange}
      />

      {/* Update Inventory Modal */}
      <Modal
        title="Nhập/Xuất kho"
        open={updateModalVisible}
        onCancel={() => setUpdateModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleUpdateInventory}>
          <Form.Item
            name="variantId"
            label="SKU"
            rules={[{ required: true, message: "Vui lòng nhập SKU" }]}
          >
            <Input placeholder="Nhập SKU của biến thể" />
          </Form.Item>

          <Form.Item
            name="warehouseId"
            label="Kho"
            rules={[{ required: true, message: "Vui lòng chọn kho" }]}
          >
            <Select placeholder="Chọn kho">
              {warehouses.map((wh) => (
                <Option key={wh.id} value={wh.id}>
                  {wh.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="type"
            label="Loại"
            rules={[{ required: true, message: "Vui lòng chọn loại" }]}
          >
            <Select placeholder="Chọn loại">
              <Option value="in">Nhập kho</Option>
              <Option value="out">Xuất kho</Option>
              <Option value="adjustment">Điều chỉnh</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="quantity"
            label="Số lượng"
            rules={[{ required: true, message: "Vui lòng nhập số lượng" }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="note" label="Ghi chú">
            <Input.TextArea rows={2} />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button onClick={() => setUpdateModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                Xác nhận
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Transfer Modal */}
      <Modal
        title="Chuyển kho"
        open={transferModalVisible}
        onCancel={() => setTransferModalVisible(false)}
        footer={null}
      >
        <Form
          form={transferForm}
          layout="vertical"
          onFinish={handleTransferInventory}
        >
          <Form.Item
            name="variantId"
            label="SKU"
            rules={[{ required: true, message: "Vui lòng nhập SKU" }]}
          >
            <Input placeholder="Nhập SKU của biến thể" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="fromWarehouseId"
                label="Từ kho"
                rules={[{ required: true, message: "Vui lòng chọn kho nguồn" }]}
              >
                <Select placeholder="Kho nguồn">
                  {warehouses.map((wh) => (
                    <Option key={wh.id} value={wh.id}>
                      {wh.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="toWarehouseId"
                label="Đến kho"
                rules={[{ required: true, message: "Vui lòng chọn kho đích" }]}
              >
                <Select placeholder="Kho đích">
                  {warehouses.map((wh) => (
                    <Option key={wh.id} value={wh.id}>
                      {wh.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="quantity"
            label="Số lượng"
            rules={[{ required: true, message: "Vui lòng nhập số lượng" }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="note" label="Ghi chú">
            <Input.TextArea rows={2} />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button onClick={() => setTransferModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Chuyển
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* History Modal */}
      <Modal
        title="Lịch sử nhập xuất kho"
        open={historyModalVisible}
        onCancel={() => setHistoryModalVisible(false)}
        footer={null}
        width={800}
      >
        <Table
          columns={movementColumns}
          dataSource={movements}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          size="small"
        />
      </Modal>
    </AdminLayout>
  );
}
