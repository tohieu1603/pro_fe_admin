"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Button,
  Card,
  Row,
  Col,
  message,
  Spin,
  Typography,
  Space,
  Table,
  Tag,
  Popconfirm,
  Alert,
} from "antd";
import {
  SaveOutlined,
  ArrowLeftOutlined,
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import AdminLayout from "@/components/layout/AdminLayout";
import MarkdownEditor from "@/components/editor/MarkdownEditor";
import {
  productService,
  categoryService,
  brandService,
  tagService,
  optionTypeService,
  variantService,
} from "@/services";
import ProductRegionPricing from "./ProductRegionPricing";
import type {
  Product,
  Category,
  Brand,
  Tag as ProductTag,
  VariantOptionType,
  VariantOptionValue,
  ProductVariant,
} from "@/types";
import { VariantStatus } from "@/types";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface ProductFormProps {
  productId?: string;
}

// Types for variant management
interface ProductOption {
  id: string;
  optionTypeId: string;
  optionTypeName: string;
  values: string[];
}

interface VariantRow {
  key: string;
  options: Record<string, string>; // optionTypeId -> value
  sku: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  stockQuantity: number;
  isDefault: boolean;
  status: VariantStatus;
}

export default function ProductForm({ productId }: ProductFormProps) {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [tags, setTags] = useState<ProductTag[]>([]);
  const [optionTypes, setOptionTypes] = useState<VariantOptionType[]>([]);

  // Variant management state
  const [hasVariants, setHasVariants] = useState(false);
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
  const [variants, setVariants] = useState<VariantRow[]>([]);

  const isEdit = !!productId;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [catRes, brandRes, tagRes, optionTypesRes] = await Promise.all([
          categoryService.getActive(),
          brandService.getActive(),
          tagService.getAll({ limit: 100 }),
          optionTypeService.getAll({ all: true }),
        ]);

        setCategories(catRes.data || []);
        setBrands(brandRes.data || []);
        setTags(tagRes.data || []);
        setOptionTypes(optionTypesRes.data || []);

        if (productId) {
          const productRes = await productService.getById(productId);
          if (productRes.data) {
            const product = productRes.data;
            form.setFieldsValue({
              ...product,
              tagIds: product.tags?.map((t) => t.id),
            });

            // Load variants if exists
            if (product.variants && product.variants.length > 0) {
              setHasVariants(true);
              loadExistingVariants(product.variants);
            }
          }
        }
      } catch (error) {
        message.error("Không thể tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [productId, form]);

  const loadExistingVariants = (existingVariants: ProductVariant[]) => {
    // Extract unique option types and values from variants
    const optionsMap = new Map<string, Set<string>>();
    const optionTypeNames = new Map<string, string>();

    existingVariants.forEach((variant) => {
      variant.options?.forEach((opt) => {
        if (opt.optionType && opt.optionValue) {
          if (!optionsMap.has(opt.optionTypeId)) {
            optionsMap.set(opt.optionTypeId, new Set());
            optionTypeNames.set(opt.optionTypeId, opt.optionType.name);
          }
          optionsMap.get(opt.optionTypeId)?.add(opt.optionValue.value);
        }
      });
    });

    // Convert to ProductOption format
    const loadedOptions: ProductOption[] = Array.from(optionsMap.entries()).map(
      ([typeId, values], index) => ({
        id: `option-${index}`,
        optionTypeId: typeId,
        optionTypeName: optionTypeNames.get(typeId) || "",
        values: Array.from(values),
      })
    );

    setProductOptions(loadedOptions);

    // Convert variants to VariantRow format
    const loadedVariants: VariantRow[] = existingVariants.map((v) => {
      const options: Record<string, string> = {};
      v.options?.forEach((opt) => {
        if (opt.optionValue) {
          options[opt.optionTypeId] = opt.optionValue.value;
        }
      });

      return {
        key: v.id,
        options,
        sku: v.sku,
        price: v.price,
        compareAtPrice: v.compareAtPrice,
        costPrice: v.costPrice,
        stockQuantity: v.stockQuantity,
        isDefault: v.isDefault,
        status: v.status,
      };
    });

    setVariants(loadedVariants);
  };

  // Generate variants from options combinations
  const generateVariants = useCallback(() => {
    if (productOptions.length === 0) {
      setVariants([]);
      return;
    }

    // Filter out options with no values
    const validOptions = productOptions.filter((opt) => opt.values.length > 0);
    if (validOptions.length === 0) {
      setVariants([]);
      return;
    }

    const cartesian = (...arrays: string[][]): string[][] => {
      return arrays.reduce<string[][]>(
        (acc, arr) => acc.flatMap((x) => arr.map((y) => [...x, y])),
        [[]]
      );
    };

    const valueArrays = validOptions.map((opt) => opt.values);
    const combinations = cartesian(...valueArrays);

    const basePrice = form.getFieldValue("basePrice") || 0;
    const spk = form.getFieldValue("spk") || "";

    const newVariants: VariantRow[] = combinations.map((combo, index) => {
      const options: Record<string, string> = {};
      validOptions.forEach((opt, i) => {
        options[opt.optionTypeId] = combo[i];
      });

      // Generate SKU from SPK and option values
      const skuSuffix = combo.map((v) => v.substring(0, 3).toUpperCase()).join("-");
      const sku = spk ? `${spk}-${skuSuffix}` : skuSuffix;

      // Check if variant already exists with same options
      const existingVariant = variants.find((v) => {
        return validOptions.every(
          (opt) => v.options[opt.optionTypeId] === options[opt.optionTypeId]
        );
      });

      if (existingVariant) {
        return existingVariant;
      }

      return {
        key: `variant-${Date.now()}-${index}`,
        options,
        sku,
        price: basePrice,
        stockQuantity: 0,
        isDefault: index === 0,
        status: VariantStatus.ACTIVE,
      };
    });

    setVariants(newVariants);
  }, [productOptions, form, variants]);

  // Add new option type
  const addProductOption = () => {
    const newOption: ProductOption = {
      id: `option-${Date.now()}`,
      optionTypeId: "",
      optionTypeName: "",
      values: [],
    };
    setProductOptions([...productOptions, newOption]);
  };

  // Remove option type
  const removeProductOption = (optionId: string) => {
    setProductOptions(productOptions.filter((opt) => opt.id !== optionId));
  };

  // Update option type selection
  const updateOptionType = (optionId: string, optionTypeId: string) => {
    const optionType = optionTypes.find((t) => t.id === optionTypeId);
    setProductOptions(
      productOptions.map((opt) =>
        opt.id === optionId
          ? {
              ...opt,
              optionTypeId,
              optionTypeName: optionType?.name || "",
              values: [],
            }
          : opt
      )
    );
  };

  // Update option values (from tag input)
  const updateOptionValues = (optionId: string, values: string[]) => {
    setProductOptions(
      productOptions.map((opt) =>
        opt.id === optionId ? { ...opt, values } : opt
      )
    );
  };

  // Update single variant
  const updateVariant = (key: string, field: string, value: any) => {
    setVariants(
      variants.map((v) =>
        v.key === key ? { ...v, [field]: value } : v
      )
    );
  };

  // Set variant as default
  const setDefaultVariant = (key: string) => {
    setVariants(
      variants.map((v) => ({
        ...v,
        isDefault: v.key === key,
      }))
    );
  };

  // Delete variant
  const deleteVariant = (key: string) => {
    setVariants(variants.filter((v) => v.key !== key));
  };

  // Bulk update all variant prices
  const bulkUpdatePrice = (price: number) => {
    setVariants(
      variants.map((v) => ({
        ...v,
        price,
      }))
    );
  };

  // Get available option type values (from existing values or custom input)
  const getOptionTypeValues = (optionTypeId: string): VariantOptionValue[] => {
    const optionType = optionTypes.find((t) => t.id === optionTypeId);
    return optionType?.values || [];
  };

  const handleSubmit = async (values: any) => {
    setSaving(true);
    try {
      let productResult: Product | undefined;

      if (isEdit) {
        await productService.update(productId!, values);
        if (values.tagIds) {
          await productService.updateTags(productId!, values.tagIds);
        }
        productResult = { id: productId! } as Product;
      } else {
        const result = await productService.create(values);
        if (values.tagIds && result.data) {
          await productService.updateTags(result.data.id, values.tagIds);
        }
        productResult = result.data;
      }

      // Save variants if product has variants
      if (productResult && hasVariants && variants.length > 0) {
        await saveVariants(productResult.id);
      }

      message.success(isEdit ? "Cập nhật sản phẩm thành công" : "Tạo sản phẩm thành công");
      router.push("/products");
    } catch (error: any) {
      message.error(error.response?.data?.message || "Không thể lưu sản phẩm");
    } finally {
      setSaving(false);
    }
  };

  const saveVariants = async (productId: string) => {
    try {
      // First, find or create option values for each option type
      const updatedOptionTypes = [...optionTypes];

      for (const option of productOptions) {
        if (option.optionTypeId && option.values.length > 0) {
          const result = await optionTypeService.findOrCreateValues(
            option.optionTypeId,
            option.values
          );

          // Update the optionTypes state with new values
          const typeIndex = updatedOptionTypes.findIndex(t => t.id === option.optionTypeId);
          if (typeIndex !== -1 && result.data) {
            updatedOptionTypes[typeIndex] = {
              ...updatedOptionTypes[typeIndex],
              values: [
                ...(updatedOptionTypes[typeIndex].values || []),
                ...result.data.filter(
                  newVal => !updatedOptionTypes[typeIndex].values?.some(
                    existingVal => existingVal.id === newVal.id
                  )
                )
              ]
            };
          }
        }
      }

      // Refresh option types to get the newly created values
      const freshOptionTypes = await optionTypeService.getAll({ all: true });
      const allOptionTypes = freshOptionTypes.data || [];

      // Then create/update variants
      for (const variant of variants) {
        const optionValueIds: string[] = [];

        // Get option value IDs
        for (const [optionTypeId, value] of Object.entries(variant.options)) {
          const optionType = allOptionTypes.find((t) => t.id === optionTypeId);
          if (optionType && optionType.values) {
            const existingValue = optionType.values.find(
              (v) => v.value.toLowerCase() === value.toLowerCase()
            );
            if (existingValue) {
              optionValueIds.push(existingValue.id);
            }
          }
        }

        const variantData = {
          productId,
          sku: variant.sku,
          price: variant.price,
          compareAtPrice: variant.compareAtPrice,
          costPrice: variant.costPrice,
          stockQuantity: variant.stockQuantity,
          isDefault: variant.isDefault,
          status: variant.status,
          optionValues: optionValueIds,
        };

        // Check if variant exists (for edit mode)
        if (variant.key.startsWith("variant-")) {
          // New variant
          await variantService.create(variantData);
        } else {
          // Existing variant
          await variantService.update(variant.key, variantData);
        }
      }
    } catch (error) {
      console.error("Error saving variants:", error);
      throw error;
    }
  };

  // Variant table columns
  const variantColumns = useMemo(() => {
    const validOptions = productOptions.filter(opt => opt.optionTypeId);

    const baseColumns = validOptions.map((opt) => ({
      title: opt.optionTypeName || "Option",
      dataIndex: ["options", opt.optionTypeId],
      key: opt.optionTypeId,
      width: 120,
      render: (value: string) => <Tag>{value}</Tag>,
    }));

    return [
      ...baseColumns,
      {
        title: "SKU",
        dataIndex: "sku",
        key: "sku",
        width: 150,
        render: (value: string, record: VariantRow) => (
          <Input
            value={value}
            size="small"
            onChange={(e) => updateVariant(record.key, "sku", e.target.value)}
          />
        ),
      },
      {
        title: "Giá (VND)",
        dataIndex: "price",
        key: "price",
        width: 140,
        render: (value: number, record: VariantRow) => (
          <InputNumber
            value={value}
            size="small"
            style={{ width: "100%" }}
            formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            parser={(v) => v!.replace(/\$\s?|(,*)/g, "") as any}
            onChange={(v) => updateVariant(record.key, "price", v || 0)}
          />
        ),
      },
      {
        title: "Tồn kho",
        dataIndex: "stockQuantity",
        key: "stockQuantity",
        width: 100,
        render: (value: number, record: VariantRow) => (
          <InputNumber
            value={value}
            size="small"
            min={0}
            style={{ width: "100%" }}
            onChange={(v) => updateVariant(record.key, "stockQuantity", v || 0)}
          />
        ),
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        width: 120,
        render: (value: string, record: VariantRow) => (
          <Select
            value={value}
            size="small"
            style={{ width: "100%" }}
            onChange={(v) => updateVariant(record.key, "status", v)}
          >
            <Option value="active">Hoạt động</Option>
            <Option value="inactive">Tạm ẩn</Option>
            <Option value="out_of_stock">Hết hàng</Option>
          </Select>
        ),
      },
      {
        title: "Mặc định",
        dataIndex: "isDefault",
        key: "isDefault",
        width: 80,
        align: "center" as const,
        render: (value: boolean, record: VariantRow) => (
          <Switch
            checked={value}
            size="small"
            onChange={() => setDefaultVariant(record.key)}
          />
        ),
      },
      {
        title: "",
        key: "actions",
        width: 60,
        render: (_: any, record: VariantRow) => (
          <Popconfirm
            title="Xóa biến thể này?"
            onConfirm={() => deleteVariant(record.key)}
          >
            <Button type="text" danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        ),
      },
    ];
  }, [productOptions, variants]);

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
      <div className="page-header">
        <Row justify="space-between" align="middle">
          <Col>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push("/products")}
              style={{ marginRight: 16 }}
            >
              Quay lại
            </Button>
            <Title level={3} style={{ display: "inline", margin: 0 }}>
              {isEdit ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
            </Title>
          </Col>
        </Row>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          status: "draft",
          isFeatured: false,
          basePrice: 0,
        }}
      >
        <Row gutter={24}>
          <Col xs={24} lg={16}>
            <Card title="Thông tin cơ bản" style={{ marginBottom: 24 }}>
              <Form.Item
                name="name"
                label="Tên sản phẩm"
                rules={[
                  { required: true, message: "Vui lòng nhập tên sản phẩm" },
                ]}
              >
                <Input placeholder="Nhập tên sản phẩm" />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="spk" label="Mã SPK">
                    <Input placeholder="Tự động tạo nếu để trống" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="slug" label="Slug">
                    <Input placeholder="Tự động tạo từ tên" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="shortDescription" label="Mô tả ngắn">
                <TextArea rows={2} placeholder="Mô tả ngắn về sản phẩm" />
              </Form.Item>

              <Form.Item
                name="description"
                label={
                  <Space>
                    <span>Mô tả chi tiết (Markdown)</span>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Paste ảnh → tự thêm ảnh | Paste 1 dòng text → tự thành H1
                    </Text>
                  </Space>
                }
              >
                <MarkdownEditor
                  value={form.getFieldValue("description") || ""}
                  onChange={(val) => form.setFieldValue("description", val)}
                  height={350}
                  placeholder="Nhập mô tả sản phẩm... (hỗ trợ Markdown)"
                />
              </Form.Item>
            </Card>

            {/* Thông số kỹ thuật */}
            <Card title="Thông số kỹ thuật" style={{ marginBottom: 24 }}>
              <Alert
                message="Nhập thông số kỹ thuật"
                description="Thêm các thông số như Công suất, Kích thước, Trọng lượng... Các thông số này sẽ hiển thị trong bảng thông số kỹ thuật trên trang chi tiết."
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Form.List name="attributes">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Row key={key} gutter={16} style={{ marginBottom: 8 }}>
                        <Col span={10}>
                          <Form.Item
                            {...restField}
                            name={[name, "name"]}
                            rules={[{ required: true, message: "Nhập tên thông số" }]}
                            style={{ marginBottom: 0 }}
                          >
                            <Input placeholder="Tên thông số (VD: Công suất)" />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            {...restField}
                            name={[name, "value"]}
                            rules={[{ required: true, message: "Nhập giá trị" }]}
                            style={{ marginBottom: 0 }}
                          >
                            <Input placeholder="Giá trị (VD: 9000 BTU/h)" />
                          </Form.Item>
                        </Col>
                        <Col span={2}>
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => remove(name)}
                          />
                        </Col>
                      </Row>
                    ))}
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                    >
                      Thêm thông số
                    </Button>
                  </>
                )}
              </Form.List>
            </Card>

            {/* Variants Section - WooCommerce Style */}
            <Card
              title={
                <Space>
                  <span>Biến thể sản phẩm</span>
                  <Switch
                    checked={hasVariants}
                    onChange={setHasVariants}
                    checkedChildren="Có"
                    unCheckedChildren="Không"
                  />
                </Space>
              }
              style={{ marginBottom: 24 }}
            >
              {hasVariants ? (
                <>
                  <Alert
                    message="Quản lý biến thể"
                    description="Thêm các thuộc tính như Màu sắc, Kích thước... và nhập giá trị bằng cách gõ rồi nhấn Enter. Sau đó nhấn 'Tạo biến thể' để tự động sinh các biến thể."
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                  />

                  {/* Option Types Management */}
                  <div style={{ marginBottom: 24 }}>
                    <Text strong style={{ marginBottom: 12, display: "block" }}>
                      Thuộc tính sản phẩm
                    </Text>

                    {productOptions.map((option) => (
                      <Card
                        key={option.id}
                        size="small"
                        style={{ marginBottom: 12 }}
                        extra={
                          <Button
                            type="text"
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={() => removeProductOption(option.id)}
                          />
                        }
                      >
                        <Row gutter={16} align="middle">
                          <Col span={8}>
                            <Select
                              placeholder="Chọn loại thuộc tính"
                              value={option.optionTypeId || undefined}
                              onChange={(v) => updateOptionType(option.id, v)}
                              style={{ width: "100%" }}
                              showSearch
                              optionFilterProp="children"
                            >
                              {optionTypes
                                .filter(
                                  (t) =>
                                    !productOptions.some(
                                      (o) =>
                                        o.optionTypeId === t.id &&
                                        o.id !== option.id
                                    )
                                )
                                .map((type) => (
                                  <Option key={type.id} value={type.id}>
                                    {type.name}
                                  </Option>
                                ))}
                            </Select>
                          </Col>
                          <Col span={16}>
                            <Select
                              mode="tags"
                              placeholder="Nhập giá trị rồi nhấn Enter (VD: Đỏ, Xanh, Vàng)"
                              value={option.values}
                              onChange={(values) =>
                                updateOptionValues(option.id, values)
                              }
                              style={{ width: "100%" }}
                              tokenSeparators={[","]}
                              disabled={!option.optionTypeId}
                            >
                              {/* Show existing values from option type as suggestions */}
                              {getOptionTypeValues(option.optionTypeId).map(
                                (val) => (
                                  <Option key={val.id} value={val.value}>
                                    {val.displayValue || val.value}
                                    {val.colorCode && (
                                      <span
                                        style={{
                                          display: "inline-block",
                                          width: 12,
                                          height: 12,
                                          backgroundColor: val.colorCode,
                                          marginLeft: 8,
                                          borderRadius: 2,
                                        }}
                                      />
                                    )}
                                  </Option>
                                )
                              )}
                            </Select>
                          </Col>
                        </Row>
                      </Card>
                    ))}

                    <Space>
                      <Button
                        type="dashed"
                        icon={<PlusOutlined />}
                        onClick={addProductOption}
                      >
                        Thêm thuộc tính
                      </Button>
                      {productOptions.length > 0 &&
                        productOptions.some((o) => o.values.length > 0) && (
                          <Button type="primary" onClick={generateVariants}>
                            Tạo biến thể
                          </Button>
                        )}
                    </Space>
                  </div>

                  {/* Variants Table */}
                  {variants.length > 0 && (
                    <div>
                      <Row
                        justify="space-between"
                        align="middle"
                        style={{ marginBottom: 12 }}
                      >
                        <Col>
                          <Text strong>
                            Danh sách biến thể ({variants.length})
                          </Text>
                        </Col>
                        <Col>
                          <Space>
                            <Text type="secondary">Cập nhật giá tất cả:</Text>
                            <InputNumber
                              placeholder="Nhập giá"
                              style={{ width: 150 }}
                              formatter={(v) =>
                                `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                              }
                              parser={(v) =>
                                v!.replace(/\$\s?|(,*)/g, "") as any
                              }
                              onPressEnter={(e) => {
                                const value = (e.target as HTMLInputElement)
                                  .value;
                                const price = parseInt(
                                  value.replace(/,/g, ""),
                                  10
                                );
                                if (!isNaN(price)) {
                                  bulkUpdatePrice(price);
                                }
                              }}
                            />
                          </Space>
                        </Col>
                      </Row>

                      <Table
                        columns={variantColumns}
                        dataSource={variants}
                        rowKey="key"
                        size="small"
                        pagination={false}
                        scroll={{ x: "max-content" }}
                      />
                    </div>
                  )}
                </>
              ) : (
                <Text type="secondary">
                  Bật công tắc bên trên để thêm biến thể cho sản phẩm này (màu
                  sắc, kích thước...)
                </Text>
              )}
            </Card>

            <Card title="SEO" style={{ marginBottom: 24 }}>
              <Form.Item name="metaTitle" label="Meta Title">
                <Input placeholder="Tiêu đề SEO" />
              </Form.Item>
              <Form.Item name="metaDescription" label="Meta Description">
                <TextArea rows={2} placeholder="Mô tả SEO" />
              </Form.Item>
              <Form.Item name="metaKeywords" label="Keywords">
                <Select
                  mode="tags"
                  placeholder="Nhập từ khóa và nhấn Enter"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card title="Phân loại" style={{ marginBottom: 24 }}>
              <Form.Item
                name="categoryId"
                label="Danh mục"
                rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
              >
                <Select placeholder="Chọn danh mục">
                  {categories.map((cat) => (
                    <Option key={cat.id} value={cat.id}>
                      {"—".repeat(cat.level)} {cat.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name="brandId" label="Thương hiệu">
                <Select placeholder="Chọn thương hiệu" allowClear>
                  {brands.map((brand) => (
                    <Option key={brand.id} value={brand.id}>
                      {brand.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name="tagIds" label="Tags">
                <Select
                  mode="multiple"
                  placeholder="Chọn tags"
                  allowClear
                  optionFilterProp="children"
                >
                  {tags.map((tag) => (
                    <Option key={tag.id} value={tag.id}>
                      {tag.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Card>

            <Card title="Giá & Trạng thái" style={{ marginBottom: 24 }}>
              <Form.Item
                name="basePrice"
                label="Giá cơ bản"
                rules={[{ required: true, message: "Vui lòng nhập giá" }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
                  addonAfter="VND"
                />
              </Form.Item>

              <Form.Item name="status" label="Trạng thái">
                <Select>
                  <Option value="draft">Nháp</Option>
                  <Option value="active">Đang bán</Option>
                  <Option value="inactive">Tạm ẩn</Option>
                  <Option value="discontinued">Ngừng bán</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="isFeatured"
                label="Sản phẩm nổi bật"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Card>

            {/* Region Pricing - Only show for edit mode */}
            {isEdit && (
              <ProductRegionPricing
                productId={productId}
                basePrice={form.getFieldValue("basePrice") || 0}
              />
            )}

            <Card>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={saving}
                  block
                >
                  {isEdit ? "Cập nhật" : "Tạo sản phẩm"}
                </Button>
                {isEdit && (
                  <Button
                    icon={<EyeOutlined />}
                    block
                    onClick={() => window.open(`/products/${productId}/preview`, "_blank")}
                  >
                    Xem trước
                  </Button>
                )}
              </Space>
            </Card>
          </Col>
        </Row>
      </Form>
    </AdminLayout>
  );
}
