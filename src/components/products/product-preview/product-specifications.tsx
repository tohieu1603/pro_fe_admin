"use client";

import React, { useMemo } from "react";
import { Row, Col, Card, Table, Collapse, Descriptions, Space, Button, Typography, Empty } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import type { Product, ProductVariant } from "@/types";

const { Text } = Typography;

interface ProductSpecificationsProps {
  product: Product;
  selectedVariant: ProductVariant | null;
}

export default function ProductSpecifications({
  product,
  selectedVariant,
}: ProductSpecificationsProps) {
  // Specifications table columns
  const specColumns = [
    { title: "Thông số", dataIndex: "name", key: "name", width: "40%" },
    { title: "Chi tiết", dataIndex: "value", key: "value" },
  ];

  // Group attributes by displayGroup
  const { mainSpecs, groupedSpecs } = useMemo(() => {
    const main: Array<{ key: string; name: string; value: string }> = [];
    const groups: Record<string, Array<{ label: string; value: string }>> = {};

    if (product?.attributes && product.attributes.length > 0) {
      // Sort by displayOrder
      const sortedAttrs = [...product.attributes].sort((a, b) => {
        const orderA = a.attribute?.displayOrder || 999;
        const orderB = b.attribute?.displayOrder || 999;
        return orderA - orderB;
      });

      sortedAttrs.forEach((attr, index) => {
        // Get name from nested attribute object
        const attrName = attr.attribute?.name || "Thông số";
        const attrValue = attr.value || "N/A";
        const group = attr.attribute?.displayGroup || "Thông tin chung";

        // Add to main table
        main.push({
          key: index.toString(),
          name: attrName,
          value: attrValue,
        });

        // Add to grouped specs
        if (!groups[group]) {
          groups[group] = [];
        }
        groups[group].push({
          label: attrName,
          value: attrValue,
        });
      });
    }

    // Add basic info if no attributes
    if (main.length === 0) {
      if (product?.brand?.name) {
        main.push({ key: "brand", name: "Thương hiệu", value: product.brand.name });
      }
      if (product?.category?.name) {
        main.push({ key: "category", name: "Danh mục", value: product.category.name });
      }
      if (selectedVariant?.sku) {
        main.push({ key: "sku", name: "Mã sản phẩm", value: selectedVariant.sku });
      }
    }

    return { mainSpecs: main, groupedSpecs: groups };
  }, [product, selectedVariant]);

  // Variant info for "Thông tin chi tiết" section
  const variantInfo = useMemo(() => {
    const info: Array<{ label: string; value: string }> = [];

    if (selectedVariant?.sku) {
      info.push({ label: "Model / SKU", value: selectedVariant.sku });
    }
    if (product?.brand?.name) {
      info.push({ label: "Thương hiệu", value: product.brand.name });
    }
    if (product?.brand?.country) {
      info.push({ label: "Xuất xứ thương hiệu", value: product.brand.country });
    }
    if (product?.category?.name) {
      info.push({ label: "Danh mục", value: product.category.name });
    }

    return info;
  }, [product, selectedVariant]);

  return (
    <Row gutter={32}>
      <Col xs={24} lg={16}>
        {/* Main Specs Table */}
        {mainSpecs.length > 0 ? (
          <Table
            columns={specColumns}
            dataSource={mainSpecs}
            pagination={false}
            bordered
            size="middle"
            style={{ marginBottom: 16 }}
          />
        ) : (
          <Empty description="Chưa có thông số kỹ thuật" style={{ marginBottom: 16 }} />
        )}

        {/* Grouped Specs in Collapse */}
        <Collapse defaultActiveKey={["info"]}>
          {/* Basic Info */}
          {variantInfo.length > 0 && (
            <Collapse.Panel header="Thông tin chi tiết" key="info">
              <Descriptions bordered column={1} size="small">
                {variantInfo.map((item, idx) => (
                  <Descriptions.Item key={idx} label={item.label}>
                    {item.value}
                  </Descriptions.Item>
                ))}
              </Descriptions>
            </Collapse.Panel>
          )}

          {/* Grouped Attributes */}
          {Object.entries(groupedSpecs).map(([groupName, items]) => (
            <Collapse.Panel header={groupName} key={groupName}>
              <Descriptions bordered column={1} size="small">
                {items.map((item, idx) => (
                  <Descriptions.Item key={idx} label={item.label}>
                    {item.value}
                  </Descriptions.Item>
                ))}
              </Descriptions>
            </Collapse.Panel>
          ))}
        </Collapse>
      </Col>

      <Col xs={24} lg={8}>
        <Card size="small" title="So sánh với sản phẩm khác">
          <Space direction="vertical" style={{ width: "100%" }}>
            <Text type="secondary">Chọn sản phẩm để so sánh thông số</Text>
            <Button block icon={<PlusOutlined />}>
              Thêm sản phẩm so sánh
            </Button>
          </Space>
        </Card>
      </Col>
    </Row>
  );
}
