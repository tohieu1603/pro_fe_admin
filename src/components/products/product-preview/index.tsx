"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Row, Col, Typography, Spin, message, Breadcrumb, Tabs, Button, InputNumber, Rate, Tag, Space, Card, Divider } from "antd";
import {
  HomeOutlined,
  AppstoreOutlined,
  ShoppingCartOutlined,
  ThunderboltFilled,
  CheckCircleFilled,
  CloseCircleFilled,
  SafetyCertificateOutlined,
  GiftOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import Image from "next/image";
import { productService } from "@/services";
import type { Product, ProductVariant, Promotion } from "@/types";
import ProductSpecifications from "./product-specifications";
import ProductDescriptionTab from "./product-description-tab";
import ProductReviews from "./product-reviews";
import ProductQA from "./product-qa";
import type { OptionGroup, StockStatus } from "./types";
import { formatCurrency } from "./types";

const { Title, Text } = Typography;

interface ProductPreviewProps {
  productId: string;
}

export default function ProductPreview({ productId }: ProductPreviewProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [promotions, setPromotions] = useState<Promotion[]>([]);

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const [productRes, promotionsRes] = await Promise.all([
        productService.getById(productId),
        productService.getPromotions(productId),
      ]);

      const data = productRes.data;
      if (!data) {
        message.error("Không tìm thấy sản phẩm");
        return;
      }
      setProduct(data);
      setPromotions(promotionsRes.data || []);

      if (data.variants && data.variants.length > 0) {
        const defaultVariant = data.variants.find((v: ProductVariant) => v.isDefault) || data.variants[0];
        setSelectedVariant(defaultVariant);

        const variantOptions = (defaultVariant as any).options || [];
        if (variantOptions.length > 0) {
          const options: Record<string, string> = {};
          variantOptions.forEach((opt: any) => {
            if (opt.optionType && opt.optionValue) {
              options[opt.optionType.id] = opt.optionValue.id;
            }
          });
          setSelectedOptions(options);
        }
      }
    } catch (error) {
      message.error("Không thể tải thông tin sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  // Group option values by option type
  const optionGroups: OptionGroup[] = useMemo(() => {
    if (!product?.variants) return [];
    const groups: Record<string, OptionGroup> = {};

    product.variants.forEach((variant: any) => {
      const variantOptions = variant.options || [];
      variantOptions.forEach((opt: any) => {
        if (opt.optionType && opt.optionValue) {
          if (!groups[opt.optionType.id]) {
            groups[opt.optionType.id] = { optionType: opt.optionType, values: [] };
          }
          if (!groups[opt.optionType.id].values.find((v) => v.id === opt.optionValue.id)) {
            groups[opt.optionType.id].values.push({
              id: opt.optionValue.id,
              value: opt.optionValue.value,
              displayValue: opt.optionValue.displayValue,
              colorCode: opt.optionValue.colorCode,
            });
          }
        }
      });
    });

    return Object.values(groups);
  }, [product]);

  // Find matching variant based on selected options
  useEffect(() => {
    if (!product?.variants || Object.keys(selectedOptions).length === 0) return;

    const matchingVariant = product.variants.find((variant: any) => {
      const variantOptions = variant.options || [];
      if (variantOptions.length === 0) return false;
      return variantOptions.every((opt: any) => {
        if (!opt.optionType || !opt.optionValue) return true;
        return selectedOptions[opt.optionType.id] === opt.optionValue.id;
      });
    });

    if (matchingVariant) {
      setSelectedVariant(matchingVariant);
    }
  }, [selectedOptions, product]);

  const handleOptionChange = (optionTypeId: string, valueId: string) => {
    setSelectedOptions((prev) => ({ ...prev, [optionTypeId]: valueId }));
  };

  // Get product images
  const images = useMemo(() => {
    const imgs: string[] = [];
    if ((selectedVariant as any)?.imageUrl) {
      imgs.push((selectedVariant as any).imageUrl);
    }
    if (product?.media && product.media.length > 0) {
      const sortedMedia = [...product.media].sort((a, b) => a.displayOrder - b.displayOrder);
      sortedMedia.forEach((m: any) => {
        if (m.type === "image" && !imgs.includes(m.url)) {
          imgs.push(m.url);
        }
      });
    }
    if (imgs.length === 0) {
      imgs.push("https://via.placeholder.com/500x500?text=No+Image");
    }
    return imgs;
  }, [product, selectedVariant]);

  // Prices
  const currentPrice = selectedVariant?.price || product?.basePrice || 0;
  const comparePrice = selectedVariant?.compareAtPrice;
  const discountPercent = comparePrice ? Math.round((1 - currentPrice / comparePrice) * 100) : 0;

  // Stock status
  const stockStatus: StockStatus = useMemo(() => {
    if (!selectedVariant) return { inStock: false, quantity: 0 };
    const inventories = (selectedVariant as any).inventories || [];
    if (inventories.length > 0) {
      const totalQty = inventories.reduce((sum: number, inv: any) => sum + (inv.quantity - inv.reservedQuantity), 0);
      return { inStock: totalQty > 0, quantity: totalQty };
    }
    return { inStock: selectedVariant.stockQuantity > 0, quantity: selectedVariant.stockQuantity };
  }, [selectedVariant]);

  // Counts
  const reviewCount = product?.reviews?.filter((r) => r.isApproved)?.length || 0;
  const questionCount = product?.questions?.filter((q) => q.isApproved)?.length || 0;
  const avgRating = product?.reviews && reviewCount > 0
    ? product.reviews.filter((r) => r.isApproved).reduce((sum, r) => sum + r.rating, 0) / reviewCount
    : 0;

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <Title level={4}>Không tìm thấy sản phẩm</Title>
      </div>
    );
  }

  return (
    <div style={{ background: "#f0f0f0", minHeight: "100vh" }}>
      {/* Breadcrumb */}
      <div style={{ background: "#2f9e44", padding: "10px 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px" }}>
          <Breadcrumb
            separator={<span style={{ color: "rgba(255,255,255,0.6)" }}>/</span>}
            items={[
              { title: <Link href="/" style={{ color: "#fff" }}><HomeOutlined /> Trang chủ</Link> },
              { title: <Link href="/products" style={{ color: "#fff" }}><AppstoreOutlined /> Sản phẩm</Link> },
              { title: <span style={{ color: "#fff" }}>{product.category?.name || "Danh mục"}</span> },
            ]}
          />
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: 16 }}>
        {/* Main Product Section - 2 Columns Layout */}
        <Row gutter={24}>
          {/* LEFT: Image Gallery */}
          <Col xs={24} lg={12}>
            <Card bordered={false} styles={{ body: { padding: 16 } }}>
              {/* Main Image */}
              <div style={{
                position: "relative",
                width: "100%",
                aspectRatio: "1/1",
                background: "#fff",
                borderRadius: 8,
                overflow: "hidden",
                marginBottom: 12
              }}>
                <Image
                  src={images[activeImageIndex]}
                  alt={product.name}
                  fill
                  style={{ objectFit: "contain", padding: 16 }}
                  unoptimized
                />
                {discountPercent > 0 && (
                  <div style={{
                    position: "absolute",
                    top: 10,
                    left: 10,
                    background: "#e53935",
                    color: "#fff",
                    padding: "4px 10px",
                    borderRadius: 4,
                    fontWeight: 700,
                    fontSize: 14
                  }}>
                    -{discountPercent}%
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      style={{
                        width: 60,
                        height: 60,
                        flexShrink: 0,
                        borderRadius: 4,
                        border: idx === activeImageIndex ? "2px solid #2f9e44" : "1px solid #d9d9d9",
                        cursor: "pointer",
                        overflow: "hidden",
                        position: "relative"
                      }}
                    >
                      <Image src={img} alt="" fill style={{ objectFit: "cover" }} unoptimized />
                    </div>
                  ))}
                </div>
              )}

              {/* Shop Commitment - Like DMX "Điện Máy XANH cam kết" */}
              <Divider style={{ margin: "16px 0" }} />
              <div style={{
                background: "#f0f9ff",
                borderRadius: 8,
                padding: 12,
                border: "1px solid #bae7ff"
              }}>
                <div style={{ fontWeight: 600, marginBottom: 8, color: "#1890ff" }}>
                  <SafetyCertificateOutlined style={{ marginRight: 6 }} />
                  Shop cam kết
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                    <CheckCircleFilled style={{ color: "#52c41a" }} />
                    <span>Bảo hành chính hãng 12 tháng</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                    <CheckCircleFilled style={{ color: "#52c41a" }} />
                    <span>Đổi trả miễn phí trong 7 ngày</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                    <CheckCircleFilled style={{ color: "#52c41a" }} />
                    <span>Giao hàng toàn quốc</span>
                  </div>
                </div>
              </div>
            </Card>
          </Col>

          {/* RIGHT: Product Info, Variants & Actions */}
          <Col xs={24} lg={12}>
            <Card bordered={false} styles={{ body: { padding: 20 } }}>
              {/* Product Name */}
              <Title level={3} style={{ marginBottom: 12, fontWeight: 700, lineHeight: 1.4, fontSize: 22 }}>
                {product.name}
              </Title>

              {/* Rating & Brand */}
              <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                {reviewCount > 0 && (
                  <Space size={4}>
                    <Rate disabled value={avgRating} allowHalf style={{ fontSize: 12 }} />
                    <Text type="secondary" style={{ fontSize: 12 }}>({reviewCount})</Text>
                  </Space>
                )}
                {product.brand && (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Thương hiệu: <Text strong style={{ color: "#1890ff" }}>{product.brand.name}</Text>
                  </Text>
                )}
              </div>
              {selectedVariant && (
                <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 12 }}>
                  SKU: {selectedVariant.sku}
                </Text>
              )}

              {/* Price Box */}
              <div style={{
                background: "linear-gradient(90deg, #d32f2f 0%, #e53935 100%)",
                padding: "12px 16px",
                borderRadius: 8,
                marginBottom: 16
              }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                  <span style={{ fontSize: 24, fontWeight: 700, color: "#fff" }}>
                    {formatCurrency(currentPrice)}
                  </span>
                  {comparePrice && comparePrice > currentPrice && (
                    <span style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", textDecoration: "line-through" }}>
                      {formatCurrency(comparePrice)}
                    </span>
                  )}
                </div>
              </div>

              {/* Variant Options */}
              {optionGroups.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  {optionGroups.map((group) => (
                    <div key={group.optionType.id} style={{ marginBottom: 12 }}>
                      <Text strong style={{ display: "block", marginBottom: 8, fontSize: 13 }}>
                        {group.optionType.name}:
                      </Text>
                      <Space wrap size={6}>
                        {group.values.map((value) => {
                          const isSelected = selectedOptions[group.optionType.id] === value.id;
                          const isColor = value.colorCode;

                          if (isColor) {
                            return (
                              <div
                                key={value.id}
                                onClick={() => handleOptionChange(group.optionType.id, value.id)}
                                title={value.displayValue || value.value}
                                style={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: "50%",
                                  backgroundColor: value.colorCode,
                                  border: isSelected ? "3px solid #2f9e44" : "2px solid #d9d9d9",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                {isSelected && <CheckCircleFilled style={{ color: "#fff", fontSize: 16 }} />}
                              </div>
                            );
                          }

                          return (
                            <Button
                              key={value.id}
                              type={isSelected ? "primary" : "default"}
                              onClick={() => handleOptionChange(group.optionType.id, value.id)}
                              size="small"
                              style={{
                                minWidth: 70,
                                height: 36,
                                borderColor: isSelected ? "#2f9e44" : "#d9d9d9",
                                backgroundColor: isSelected ? "#2f9e44" : "#fff",
                              }}
                            >
                              {value.displayValue || value.value}
                            </Button>
                          );
                        })}
                      </Space>
                    </div>
                  ))}
                </div>
              )}

              {/* Stock Status */}
              <div style={{ marginBottom: 12 }}>
                {stockStatus.inStock ? (
                  <Tag color="success" icon={<CheckCircleFilled />} style={{ fontSize: 13, padding: "4px 10px" }}>
                    Còn hàng ({stockStatus.quantity})
                  </Tag>
                ) : (
                  <Tag color="error" icon={<CloseCircleFilled />} style={{ fontSize: 13, padding: "4px 10px" }}>
                    Hết hàng
                  </Tag>
                )}
              </div>

              {/* Quantity */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <Text style={{ fontSize: 13 }}>Số lượng:</Text>
                <InputNumber
                  min={1}
                  max={stockStatus.quantity || 99}
                  value={quantity}
                  onChange={(val) => setQuantity(val || 1)}
                  size="small"
                  style={{ width: 80 }}
                />
              </div>

              {/* Action Buttons */}
              <Space direction="vertical" style={{ width: "100%" }} size={8}>
                <Button
                  type="primary"
                  size="large"
                  block
                  disabled={!stockStatus.inStock}
                  icon={<ThunderboltFilled />}
                  style={{
                    height: 44,
                    fontSize: 15,
                    fontWeight: 700,
                    background: stockStatus.inStock ? "linear-gradient(180deg, #ff9100 0%, #ff6d00 100%)" : undefined,
                    border: "none",
                  }}
                >
                  MUA NGAY
                </Button>
                <Button
                  size="large"
                  block
                  disabled={!stockStatus.inStock}
                  icon={<ShoppingCartOutlined />}
                  style={{
                    height: 44,
                    fontSize: 15,
                    fontWeight: 600,
                    borderColor: "#2f9e44",
                    color: "#2f9e44",
                  }}
                >
                  THÊM VÀO GIỎ
                </Button>
              </Space>

              {/* Promotions - Inline in right column */}
              {promotions.length > 0 && (
                <div style={{ marginTop: 20, background: "#fff7e6", borderRadius: 8, padding: 16, border: "1px solid #ffd591" }}>
                  <div style={{ fontWeight: 600, marginBottom: 12, color: "#fa8c16", fontSize: 14 }}>
                    <GiftOutlined style={{ marginRight: 8 }} />
                    Ưu đãi khi mua sản phẩm
                  </div>
                  {promotions.slice(0, 3).map((promo) => (
                    <div key={promo.id} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
                      <CheckCircleFilled style={{ color: "#52c41a", marginTop: 3 }} />
                      <div>
                        <Text style={{ fontSize: 13 }}>{promo.name}</Text>
                        {promo.value && <Text style={{ color: "#ff4d4f", fontWeight: 600, marginLeft: 6 }}>{promo.value}</Text>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </Col>
        </Row>

        {/* Bottom Section - Specs, Reviews, Q&A */}
        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col xs={24}>
            <Card bordered={false} styles={{ body: { padding: "16px 24px" } }}>
              <Tabs
                items={[
                  { key: "specs", label: "Thông số kỹ thuật", children: <ProductSpecifications product={product} selectedVariant={selectedVariant} /> },
                  { key: "desc", label: "Thông tin sản phẩm", children: <ProductDescriptionTab product={product} /> },
                  { key: "reviews", label: `Đánh giá (${reviewCount})`, children: <ProductReviews reviews={product.reviews || []} /> },
                  { key: "qa", label: `Hỏi đáp (${questionCount})`, children: <ProductQA questions={product.questions || []} /> },
                ]}
                size="large"
                tabBarStyle={{ marginBottom: 20 }}
              />
            </Card>
          </Col>
        </Row>
      </div>

      <style jsx global>{`
        .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn { color: #2f9e44 !important; font-weight: 600; }
        .ant-tabs-ink-bar { background: #2f9e44 !important; height: 3px !important; }
        .ant-tabs-tab:hover { color: #2f9e44 !important; }
      `}</style>
    </div>
  );
}
