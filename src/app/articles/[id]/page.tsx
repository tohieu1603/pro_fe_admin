"use client";

import { useEffect, useState } from "react";
import {
  Typography,
  Row,
  Col,
  Button,
  Spin,
  message,
  Card,
  Tag,
  Descriptions,
  Space,
  Divider,
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import AdminLayout from "@/components/layout/AdminLayout";
import { articleService } from "@/services";
import type { Article } from "@/types";
import dayjs from "dayjs";

const MDEditor = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default.Markdown),
  { ssr: false }
);

const { Title, Text } = Typography;

const statusColors: Record<string, string> = {
  draft: "default",
  published: "success",
  scheduled: "processing",
  archived: "warning",
};

const statusLabels: Record<string, string> = {
  draft: "Nháp",
  published: "Đã xuất bản",
  scheduled: "Lên lịch",
  archived: "Lưu trữ",
};

export default function ArticleDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await articleService.getById(params.id as string);
        setArticle(response.data || null);
      } catch (error) {
        message.error("Không thể tải bài viết");
        router.push("/articles");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchArticle();
    }
  }, [params.id, router]);

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ textAlign: "center", padding: 100 }}>
          <Spin size="large" />
        </div>
      </AdminLayout>
    );
  }

  if (!article) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="page-header">
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push("/articles")}
            >
              Quay lại
            </Button>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => router.push(`/articles/${article.id}/edit`)}
            >
              Chỉnh sửa
            </Button>
          </Col>
        </Row>
      </div>

      <Row gutter={24}>
        <Col xs={24} lg={18}>
          <Card style={{ marginBottom: 16 }}>
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <div>
                <Tag color={statusColors[article.status]}>
                  {statusLabels[article.status]}
                </Tag>
                {article.isFeatured && <Tag color="gold">Nổi bật</Tag>}
                {article.category && (
                  <Tag color="blue">{article.category.name}</Tag>
                )}
              </div>

              <Title level={2} style={{ marginBottom: 0 }}>
                {article.title}
              </Title>

              <Space split={<Divider type="vertical" />}>
                {article.author && (
                  <Text type="secondary">
                    <UserOutlined /> {article.author.name}
                  </Text>
                )}
                {article.publishedAt && (
                  <Text type="secondary">
                    <ClockCircleOutlined />{" "}
                    {dayjs(article.publishedAt).format("DD/MM/YYYY HH:mm")}
                  </Text>
                )}
                {article.readingTime && (
                  <Text type="secondary">{article.readingTime} phút đọc</Text>
                )}
                <Text type="secondary">
                  <EyeOutlined /> {article.viewCount} lượt xem
                </Text>
              </Space>

              {article.excerpt && (
                <Text type="secondary" italic>
                  {article.excerpt}
                </Text>
              )}
            </Space>
          </Card>

          <Card>
            <div data-color-mode="light">
              <MDEditor source={article.content} />
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={6}>
          <Card title="Thông tin SEO" size="small" style={{ marginBottom: 16 }}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Meta Title">
                {article.metaTitle || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Meta Description">
                {article.metaDescription || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Keywords">
                {article.metaKeywords?.join(", ") || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Canonical URL">
                {article.canonicalUrl || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Robots Index">
                {article.robotsIndex ? "Có" : "Không"}
              </Descriptions.Item>
              <Descriptions.Item label="Robots Follow">
                {article.robotsFollow ? "Có" : "Không"}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {article.tags && article.tags.length > 0 && (
            <Card title="Tags" size="small" style={{ marginBottom: 16 }}>
              <Space wrap>
                {article.tags.map((tag) => (
                  <Tag key={tag.id}>{tag.name}</Tag>
                ))}
              </Space>
            </Card>
          )}

          <Card title="Thời gian" size="small">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Tạo lúc">
                {dayjs(article.createdAt).format("DD/MM/YYYY HH:mm")}
              </Descriptions.Item>
              <Descriptions.Item label="Cập nhật">
                {dayjs(article.updatedAt).format("DD/MM/YYYY HH:mm")}
              </Descriptions.Item>
              {article.publishedAt && (
                <Descriptions.Item label="Xuất bản">
                  {dayjs(article.publishedAt).format("DD/MM/YYYY HH:mm")}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </AdminLayout>
  );
}
