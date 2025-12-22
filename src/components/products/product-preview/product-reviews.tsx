"use client";

import React, { useMemo } from "react";
import {
  Row,
  Col,
  Card,
  Typography,
  Space,
  Button,
  Rate,
  Progress,
  Radio,
  List,
  Avatar,
  Tag,
  Image,
  Empty,
} from "antd";
import {
  StarFilled,
  LikeOutlined,
  DislikeOutlined,
  CameraOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import type { ProductReview } from "@/types";

const { Title, Text, Paragraph } = Typography;

interface ProductReviewsProps {
  reviews: ProductReview[];
}

export default function ProductReviews({ reviews }: ProductReviewsProps) {
  // Filter only approved reviews
  const approvedReviews = useMemo(
    () => reviews.filter((r) => r.isApproved),
    [reviews]
  );

  // Calculate average rating
  const avgRating = useMemo(() => {
    if (approvedReviews.length === 0) return 0;
    const total = approvedReviews.reduce((sum, r) => sum + r.rating, 0);
    return Math.round((total / approvedReviews.length) * 10) / 10;
  }, [approvedReviews]);

  // Calculate rating distribution
  const ratingDistribution = useMemo(() => {
    const distribution = [
      { stars: 5, count: 0, percent: 0 },
      { stars: 4, count: 0, percent: 0 },
      { stars: 3, count: 0, percent: 0 },
      { stars: 2, count: 0, percent: 0 },
      { stars: 1, count: 0, percent: 0 },
    ];

    if (approvedReviews.length === 0) return distribution;

    approvedReviews.forEach((r) => {
      const idx = distribution.findIndex((d) => d.stars === r.rating);
      if (idx !== -1) {
        distribution[idx].count++;
      }
    });

    distribution.forEach((d) => {
      d.percent = Math.round((d.count / approvedReviews.length) * 100);
    });

    return distribution;
  }, [approvedReviews]);

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN");
  };

  if (approvedReviews.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <Empty
          description="Chưa có đánh giá nào"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" icon={<CameraOutlined />}>
            Viết đánh giá đầu tiên
          </Button>
        </Empty>
      </div>
    );
  }

  return (
    <Row gutter={32}>
      {/* Rating Overview */}
      <Col xs={24} lg={8}>
        <Card size="small" style={{ textAlign: "center", marginBottom: 16 }}>
          <Title level={1} style={{ margin: 0, color: "#faad14" }}>
            {avgRating}
          </Title>
          <Rate disabled value={avgRating} allowHalf />
          <br />
          <Text type="secondary">{approvedReviews.length} đánh giá</Text>

          <div style={{ marginTop: 16 }}>
            {ratingDistribution.map((item) => (
              <Row key={item.stars} align="middle" gutter={8} style={{ marginBottom: 8 }}>
                <Col span={4}>
                  <Space size={2}>
                    {item.stars} <StarFilled style={{ color: "#faad14", fontSize: 12 }} />
                  </Space>
                </Col>
                <Col span={14}>
                  <Progress
                    percent={item.percent}
                    showInfo={false}
                    strokeColor="#faad14"
                    size="small"
                  />
                </Col>
                <Col span={6}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {item.count}
                  </Text>
                </Col>
              </Row>
            ))}
          </div>
        </Card>

        <Button type="primary" block icon={<CameraOutlined />}>
          Viết đánh giá
        </Button>
      </Col>

      {/* Review List */}
      <Col xs={24} lg={16}>
        <Space style={{ marginBottom: 16 }}>
          <Text strong>Lọc theo:</Text>
          <Radio.Group defaultValue="all" buttonStyle="solid" size="small">
            <Radio.Button value="all">Tất cả</Radio.Button>
            <Radio.Button value="5">5 sao</Radio.Button>
            <Radio.Button value="4">4 sao</Radio.Button>
            <Radio.Button value="3">3 sao</Radio.Button>
            <Radio.Button value="image">Có hình ảnh</Radio.Button>
          </Radio.Group>
        </Space>

        <List
          itemLayout="vertical"
          dataSource={approvedReviews}
          renderItem={(review) => (
            <List.Item
              style={{
                padding: "16px",
                background: "#fafafa",
                borderRadius: 8,
                marginBottom: 12,
              }}
              actions={[
                <Space key="helpful">
                  <Button size="small" icon={<LikeOutlined />}>
                    {review.helpfulCount}
                  </Button>
                  <Button size="small" icon={<DislikeOutlined />}>
                    {review.notHelpfulCount}
                  </Button>
                </Space>,
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${review.customerId}`}
                  />
                }
                title={
                  <Space>
                    <Text strong>{review.title || "Khách hàng"}</Text>
                    {review.isVerifiedPurchase && (
                      <Tag color="green" style={{ fontSize: 10 }}>
                        <CheckCircleOutlined /> Đã mua hàng
                      </Tag>
                    )}
                  </Space>
                }
                description={
                  <Space>
                    <Rate disabled value={review.rating} style={{ fontSize: 12 }} />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {formatDate(review.createdAt)}
                    </Text>
                  </Space>
                }
              />
              <Paragraph style={{ marginBottom: 8 }}>{review.content}</Paragraph>

              {/* Pros & Cons */}
              {review.pros && review.pros.length > 0 && (
                <div style={{ marginBottom: 8 }}>
                  <Text type="success" style={{ fontSize: 12 }}>
                    + Ưu điểm: {review.pros.join(", ")}
                  </Text>
                </div>
              )}
              {review.cons && review.cons.length > 0 && (
                <div style={{ marginBottom: 8 }}>
                  <Text type="danger" style={{ fontSize: 12 }}>
                    - Nhược điểm: {review.cons.join(", ")}
                  </Text>
                </div>
              )}

              {/* Review Images */}
              {review.images && review.images.length > 0 && (
                <Image.PreviewGroup>
                  <Space>
                    {review.images.map((img, idx) => (
                      <Image
                        key={idx}
                        src={img}
                        width={80}
                        height={80}
                        style={{ borderRadius: 4, objectFit: "cover" }}
                      />
                    ))}
                  </Space>
                </Image.PreviewGroup>
              )}

              {/* Shop Reply */}
              {review.replies && review.replies.length > 0 && (
                <div
                  style={{
                    marginTop: 12,
                    padding: "8px 12px",
                    background: "#e6f7ff",
                    borderRadius: 4,
                    borderLeft: "3px solid #1890ff",
                  }}
                >
                  {review.replies.map((reply) => (
                    <div key={reply.id}>
                      <Space style={{ marginBottom: 4 }}>
                        <Avatar size="small" style={{ backgroundColor: "#1890ff" }}>
                          S
                        </Avatar>
                        <Text strong>Shop phản hồi</Text>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          {formatDate(reply.createdAt)}
                        </Text>
                      </Space>
                      <Paragraph style={{ margin: 0, marginLeft: 28 }}>
                        {reply.content}
                      </Paragraph>
                    </div>
                  ))}
                </div>
              )}
            </List.Item>
          )}
        />

        {approvedReviews.length > 5 && (
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <Button>Xem thêm đánh giá</Button>
          </div>
        )}
      </Col>
    </Row>
  );
}
