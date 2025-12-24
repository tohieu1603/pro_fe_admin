"use client";

import { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  Switch,
  Tabs,
  Row,
  Col,
  Card,
  Space,
  DatePicker,
  message,
  Spin,
} from "antd";
import {
  SaveOutlined,
  SendOutlined,
  EyeOutlined,
  SettingOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { articleService, articleCategoryService, tagService } from "@/services";
import type { Article, ArticleCategory, CreateArticleDTO, Tag, ArticleStatus } from "@/types";
import dayjs from "dayjs";

// Dynamic import for markdown editor (SSR disabled)
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface ArticleFormProps {
  article?: Article;
  mode: "create" | "edit";
}

export default function ArticleForm({ article, mode }: ArticleFormProps) {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [content, setContent] = useState(article?.content || "");
  const [activeTab, setActiveTab] = useState("content");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, tagRes] = await Promise.all([
          articleCategoryService.getActive(),
          tagService.getAll({ limit: 100 }),
        ]);
        setCategories(catRes.data || []);
        setTags(tagRes.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (article) {
      form.setFieldsValue({
        ...article,
        tagIds: article.tags?.map((t) => t.id) || [],
        scheduledAt: article.scheduledAt ? dayjs(article.scheduledAt) : undefined,
      });
      setContent(article.content || "");
    }
  }, [article, form]);

  const handleSubmit = async (values: any, publish = false) => {
    setLoading(true);
    try {
      const data: CreateArticleDTO = {
        ...values,
        content,
        status: publish ? "published" : (values.status || "draft"),
        scheduledAt: values.scheduledAt?.toISOString(),
      };

      if (mode === "edit" && article) {
        await articleService.update(article.id, data);
        message.success("Cập nhật bài viết thành công");
      } else {
        await articleService.create(data);
        message.success("Tạo bài viết thành công");
      }
      router.push("/articles");
    } catch (error: any) {
      message.error(error.response?.data?.message || "Không thể lưu bài viết");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = () => {
    form.validateFields(["title"]).then((values) => {
      handleSubmit({ ...form.getFieldsValue(), status: "draft" }, false);
    });
  };

  const handlePublish = () => {
    form.validateFields().then((values) => {
      handleSubmit(values, true);
    });
  };

  const tabItems = [
    {
      key: "content",
      label: "Nội dung",
      children: (
        <div data-color-mode="light">
          <MDEditor
            value={content}
            onChange={(val) => setContent(val || "")}
            height={500}
            preview="live"
          />
        </div>
      ),
    },
    {
      key: "seo",
      label: (
        <span>
          <SearchOutlined /> SEO
        </span>
      ),
      children: (
        <Row gutter={16}>
          <Col span={24}>
            <Card title="SEO cơ bản" size="small" style={{ marginBottom: 16 }}>
              <Form.Item name="metaTitle" label="Meta Title">
                <Input
                  placeholder="Tiêu đề SEO (60 ký tự)"
                  maxLength={60}
                  showCount
                />
              </Form.Item>
              <Form.Item name="metaDescription" label="Meta Description">
                <Input.TextArea
                  placeholder="Mô tả SEO (160 ký tự)"
                  maxLength={160}
                  showCount
                  rows={3}
                />
              </Form.Item>
              <Form.Item name="metaKeywords" label="Keywords">
                <Select
                  mode="tags"
                  placeholder="Nhập từ khóa và nhấn Enter"
                  style={{ width: "100%" }}
                />
              </Form.Item>
              <Form.Item name="canonicalUrl" label="Canonical URL">
                <Input placeholder="https://example.com/article/..." />
              </Form.Item>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title="Open Graph (Facebook)" size="small" style={{ marginBottom: 16 }}>
              <Form.Item name="ogTitle" label="OG Title">
                <Input placeholder="Tiêu đề khi chia sẻ Facebook" />
              </Form.Item>
              <Form.Item name="ogDescription" label="OG Description">
                <Input.TextArea placeholder="Mô tả khi chia sẻ Facebook" rows={2} />
              </Form.Item>
              <Form.Item name="ogImage" label="OG Image URL">
                <Input placeholder="URL hình ảnh khi chia sẻ" />
              </Form.Item>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title="Twitter Card" size="small" style={{ marginBottom: 16 }}>
              <Form.Item name="twitterTitle" label="Twitter Title">
                <Input placeholder="Tiêu đề khi chia sẻ Twitter" />
              </Form.Item>
              <Form.Item name="twitterDescription" label="Twitter Description">
                <Input.TextArea placeholder="Mô tả khi chia sẻ Twitter" rows={2} />
              </Form.Item>
              <Form.Item name="twitterImage" label="Twitter Image URL">
                <Input placeholder="URL hình ảnh khi chia sẻ" />
              </Form.Item>
            </Card>
          </Col>
          <Col span={24}>
            <Card title="Robots Meta" size="small">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="robotsIndex"
                    label="Cho phép index"
                    valuePropName="checked"
                  >
                    <Switch defaultChecked />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="robotsFollow"
                    label="Cho phép follow links"
                    valuePropName="checked"
                  >
                    <Switch defaultChecked />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: "settings",
      label: (
        <span>
          <SettingOutlined /> Cài đặt
        </span>
      ),
      children: (
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Card title="Hiển thị" size="small" style={{ marginBottom: 16 }}>
              <Form.Item
                name="isFeatured"
                label="Bài viết nổi bật"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                name="isSticky"
                label="Ghim lên đầu"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item name="displayOrder" label="Thứ tự hiển thị">
                <Input type="number" placeholder="0" />
              </Form.Item>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title="Lên lịch" size="small" style={{ marginBottom: 16 }}>
              <Form.Item name="scheduledAt" label="Thời gian xuất bản">
                <DatePicker
                  showTime
                  format="DD/MM/YYYY HH:mm"
                  placeholder="Chọn thời gian"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Card>
          </Col>
        </Row>
      ),
    },
  ];

  return (
    <Spin spinning={loading}>
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          status: "draft",
          robotsIndex: true,
          robotsFollow: true,
          isFeatured: false,
          isSticky: false,
          displayOrder: 0,
        }}
      >
        <Row gutter={24}>
          <Col xs={24} lg={18}>
            <Card style={{ marginBottom: 16 }}>
              <Form.Item
                name="title"
                label="Tiêu đề"
                rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
              >
                <Input placeholder="Nhập tiêu đề bài viết" size="large" />
              </Form.Item>

              <Form.Item name="slug" label="Slug">
                <Input placeholder="Tự động tạo từ tiêu đề" />
              </Form.Item>

              <Form.Item name="excerpt" label="Tóm tắt">
                <Input.TextArea
                  placeholder="Mô tả ngắn gọn nội dung bài viết..."
                  rows={3}
                />
              </Form.Item>

              <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={tabItems}
              />
            </Card>
          </Col>

          <Col xs={24} lg={6}>
            <Card title="Xuất bản" style={{ marginBottom: 16 }}>
              <Form.Item name="status" label="Trạng thái">
                <Select
                  options={[
                    { label: "Nháp", value: "draft" },
                    { label: "Đã xuất bản", value: "published" },
                    { label: "Lên lịch", value: "scheduled" },
                    { label: "Lưu trữ", value: "archived" },
                  ]}
                />
              </Form.Item>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Button
                  icon={<SaveOutlined />}
                  onClick={handleSaveDraft}
                  block
                >
                  Lưu nháp
                </Button>
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={handlePublish}
                  block
                >
                  Xuất bản
                </Button>
              </Space>
            </Card>

            <Card title="Phân loại" style={{ marginBottom: 16 }}>
              <Form.Item name="categoryId" label="Danh mục">
                <Select
                  placeholder="Chọn danh mục"
                  allowClear
                  options={categories.map((cat) => ({
                    label: cat.name,
                    value: cat.id,
                  }))}
                />
              </Form.Item>
              <Form.Item name="tagIds" label="Tags">
                <Select
                  mode="multiple"
                  placeholder="Chọn tags"
                  options={tags.map((tag) => ({
                    label: tag.name,
                    value: tag.id,
                  }))}
                />
              </Form.Item>
            </Card>

            <Card title="Ảnh đại diện" style={{ marginBottom: 16 }}>
              <Form.Item name="featuredImage" label="URL ảnh">
                <Input placeholder="https://..." />
              </Form.Item>
              <Form.Item name="featuredImageAlt" label="Alt text">
                <Input placeholder="Mô tả ảnh" />
              </Form.Item>
            </Card>
          </Col>
        </Row>
      </Form>
    </Spin>
  );
}
