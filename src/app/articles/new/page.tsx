"use client";

import { Typography, Row, Col, Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/layout/AdminLayout";
import ArticleForm from "@/components/articles/ArticleForm";

const { Title } = Typography;

export default function NewArticlePage() {
  const router = useRouter();

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
              Tạo bài viết mới
            </Title>
          </Col>
        </Row>
      </div>

      <ArticleForm mode="create" />
    </AdminLayout>
  );
}
