"use client";

import { useEffect, useState } from "react";
import {
  Card,
  Table,
  InputNumber,
  Switch,
  Input,
  Button,
  message,
  Spin,
  Typography,
  Space,
  Tag,
  Tooltip,
} from "antd";
import { SaveOutlined, SyncOutlined } from "@ant-design/icons";
import { regionService, productRegionService } from "@/services";
import type { Region, ProductRegion, CreateProductRegionDTO } from "@/types";

const { Text } = Typography;

interface ProductRegionPricingProps {
  productId?: string;
  basePrice: number;
}

interface RegionPriceRow {
  regionId: string;
  regionName: string;
  regionSlug: string;
  isDefault: boolean;
  price: number | null;
  compareAtPrice: number | null;
  stockQuantity: number;
  isAvailable: boolean;
  promotionText: string;
  shippingNote: string;
  deliveryDays: number | null;
  isDirty: boolean;
}

export default function ProductRegionPricing({
  productId,
  basePrice,
}: ProductRegionPricingProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [regions, setRegions] = useState<Region[]>([]);
  const [rows, setRows] = useState<RegionPriceRow[]>([]);

  useEffect(() => {
    loadData();
  }, [productId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load all regions
      const regionsRes = await regionService.getAll({ limit: 100 });
      const allRegions = regionsRes.data || [];
      setRegions(allRegions);

      // Load existing product-region mappings if editing
      let existingMappings: ProductRegion[] = [];
      if (productId) {
        const mappingsRes = await productRegionService.getByProduct(productId);
        existingMappings = mappingsRes.data || [];
      }

      // Create rows for each region
      const newRows: RegionPriceRow[] = allRegions.map((region) => {
        const existing = existingMappings.find((m) => m.regionId === region.id);
        return {
          regionId: region.id,
          regionName: region.name,
          regionSlug: region.slug,
          isDefault: region.isDefault,
          price: existing?.price ?? null,
          compareAtPrice: existing?.compareAtPrice ?? null,
          stockQuantity: existing?.stockQuantity ?? 0,
          isAvailable: existing?.isAvailable ?? true,
          promotionText: existing?.promotionText || "",
          shippingNote: existing?.shippingNote || "",
          deliveryDays: existing?.deliveryDays ?? null,
          isDirty: false,
        };
      });

      setRows(newRows);
    } catch (error) {
      message.error("Không thể tải dữ liệu vùng");
    } finally {
      setLoading(false);
    }
  };

  const updateRow = (regionId: string, field: string, value: any) => {
    setRows(
      rows.map((row) =>
        row.regionId === regionId
          ? { ...row, [field]: value, isDirty: true }
          : row
      )
    );
  };

  const copyFromBase = () => {
    setRows(
      rows.map((row) => ({
        ...row,
        price: basePrice,
        isDirty: true,
      }))
    );
    message.success("Đã copy giá cơ bản cho tất cả vùng");
  };

  const saveRegionPricing = async () => {
    if (!productId) {
      message.warning("Vui lòng lưu sản phẩm trước khi thiết lập giá vùng");
      return;
    }

    setSaving(true);
    try {
      const dirtyRows = rows.filter((r) => r.isDirty);

      for (const row of dirtyRows) {
        // Only save if there's meaningful data
        if (
          row.price !== null ||
          row.stockQuantity > 0 ||
          row.promotionText ||
          !row.isAvailable
        ) {
          const data: CreateProductRegionDTO = {
            productId,
            regionId: row.regionId,
            price: row.price ?? undefined,
            compareAtPrice: row.compareAtPrice ?? undefined,
            stockQuantity: row.stockQuantity,
            isAvailable: row.isAvailable,
            promotionText: row.promotionText || undefined,
            shippingNote: row.shippingNote || undefined,
            deliveryDays: row.deliveryDays ?? undefined,
          };
          await productRegionService.upsert(data);
        }
      }

      // Reset dirty flags
      setRows(rows.map((r) => ({ ...r, isDirty: false })));
      message.success(`Đã lưu giá cho ${dirtyRows.length} vùng`);
    } catch (error) {
      message.error("Không thể lưu giá vùng");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      title: "Vùng",
      dataIndex: "regionName",
      key: "regionName",
      width: 150,
      fixed: "left" as const,
      render: (name: string, record: RegionPriceRow) => (
        <Space>
          <Text strong={record.isDefault}>{name}</Text>
          {record.isDefault && <Tag color="blue">Mặc định</Tag>}
          {record.isDirty && <Tag color="orange">*</Tag>}
        </Space>
      ),
    },
    {
      title: (
        <Tooltip title="Để trống = dùng giá cơ bản">
          <span>Giá bán (VND)</span>
        </Tooltip>
      ),
      dataIndex: "price",
      key: "price",
      width: 150,
      render: (value: number | null, record: RegionPriceRow) => (
        <InputNumber
          value={value}
          placeholder={basePrice?.toLocaleString()}
          style={{ width: "100%" }}
          formatter={(v) => (v ? `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "")}
          parser={(v) => (v ? Number(v.replace(/,/g, "")) : (null as any))}
          onChange={(v) => updateRow(record.regionId, "price", v)}
        />
      ),
    },
    {
      title: "Giá gốc",
      dataIndex: "compareAtPrice",
      key: "compareAtPrice",
      width: 150,
      render: (value: number | null, record: RegionPriceRow) => (
        <InputNumber
          value={value}
          placeholder="Giá so sánh"
          style={{ width: "100%" }}
          formatter={(v) => (v ? `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "")}
          parser={(v) => (v ? Number(v.replace(/,/g, "")) : (null as any))}
          onChange={(v) => updateRow(record.regionId, "compareAtPrice", v)}
        />
      ),
    },
    {
      title: "Tồn kho",
      dataIndex: "stockQuantity",
      key: "stockQuantity",
      width: 100,
      render: (value: number, record: RegionPriceRow) => (
        <InputNumber
          value={value}
          min={0}
          style={{ width: "100%" }}
          onChange={(v) => updateRow(record.regionId, "stockQuantity", v || 0)}
        />
      ),
    },
    {
      title: "Khả dụng",
      dataIndex: "isAvailable",
      key: "isAvailable",
      width: 80,
      align: "center" as const,
      render: (value: boolean, record: RegionPriceRow) => (
        <Switch
          checked={value}
          onChange={(v) => updateRow(record.regionId, "isAvailable", v)}
        />
      ),
    },
    {
      title: "KM / Ghi chú",
      dataIndex: "promotionText",
      key: "promotionText",
      width: 200,
      render: (value: string, record: RegionPriceRow) => (
        <Input
          value={value}
          placeholder="VD: Miễn phí lắp đặt"
          onChange={(e) =>
            updateRow(record.regionId, "promotionText", e.target.value)
          }
        />
      ),
    },
    {
      title: "Giao hàng (ngày)",
      dataIndex: "deliveryDays",
      key: "deliveryDays",
      width: 120,
      render: (value: number | null, record: RegionPriceRow) => (
        <InputNumber
          value={value}
          placeholder="2-3"
          min={0}
          style={{ width: "100%" }}
          onChange={(v) => updateRow(record.regionId, "deliveryDays", v)}
        />
      ),
    },
  ];

  if (loading) {
    return (
      <Card title="Giá theo vùng">
        <div style={{ textAlign: "center", padding: 40 }}>
          <Spin />
        </div>
      </Card>
    );
  }

  const dirtyCount = rows.filter((r) => r.isDirty).length;

  return (
    <Card
      title={
        <Space>
          <span>Giá theo vùng</span>
          {dirtyCount > 0 && (
            <Tag color="orange">{dirtyCount} thay đổi chưa lưu</Tag>
          )}
        </Space>
      }
      extra={
        <Space>
          <Button icon={<SyncOutlined />} onClick={copyFromBase} size="small">
            Copy từ giá cơ bản
          </Button>
          {productId && (
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={saveRegionPricing}
              loading={saving}
              disabled={dirtyCount === 0}
              size="small"
            >
              Lưu giá vùng
            </Button>
          )}
        </Space>
      }
      style={{ marginBottom: 24 }}
    >
      {!productId && (
        <Text type="warning" style={{ display: "block", marginBottom: 16 }}>
          Lưu sản phẩm trước để thiết lập giá theo vùng
        </Text>
      )}

      <Table
        columns={columns}
        dataSource={rows}
        rowKey="regionId"
        size="small"
        pagination={false}
        scroll={{ x: 1000 }}
      />

      <div style={{ marginTop: 12 }}>
        <Text type="secondary">
          * Để trống giá = sử dụng giá cơ bản ({basePrice?.toLocaleString()} VND)
        </Text>
      </div>
    </Card>
  );
}
