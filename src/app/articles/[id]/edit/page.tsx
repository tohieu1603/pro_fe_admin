"use client";

import { useEffect, useState } from "react";
import { Typography, Row, Col, Button, Spin, message } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useRouter, useParams } from "next/navigation";
import AdminLayout from "@/components/layout/AdminLayout";
import ArticleForm from "@/components/articles/ArticleForm";
import { articleService } from "@/services";
import type { Article } from "@/types";

const { Title } = Typography;

export default function EditArticlePage() {
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
            <Title level={3} style={{ marginTop: 8 }}>
              Chỉnh sửa: {article.title}
            </Title>
          </Col>
        </Row>
      </div>

      <ArticleForm mode="edit" article={article} />
    </AdminLayout>
  );
}
