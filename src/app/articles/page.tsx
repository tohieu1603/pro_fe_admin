"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Table,
  Button,
  Space,
  Input,
  Tag,
  Popconfirm,
  message,
  Typography,
  Row,
  Col,
  Select,
  Dropdown,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  EyeOutlined,
  MoreOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/layout/AdminLayout";
import { articleService, articleCategoryService } from "@/services";
import type { Article, ArticleCategory, ArticleStatus } from "@/types";
import dayjs from "dayjs";

const { Title } = Typography;

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

export default function ArticlesPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ArticleStatus | undefined>();
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>();

  const fetchCategories = useCallback(async () => {
    try {
      const response = await articleCategoryService.getActive();
      setCategories(response.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }, []);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await articleService.getAll({
        page: pagination.current,
        limit: pagination.pageSize,
        search: search || undefined,
        status: statusFilter,
        categoryId: categoryFilter,
      });

      setArticles(response.data || []);
      setPagination((prev) => ({
        ...prev,
        total: response.meta?.total || 0,
      }));
    } catch (error) {
      message.error("Không thể tải danh sách bài viết");
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, search, statusFilter, categoryFilter]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleTableChange = (paginationConfig: TablePaginationConfig) => {
    setPagination((prev) => ({
      ...prev,
      current: paginationConfig.current || 1,
      pageSize: paginationConfig.pageSize || 10,
    }));
  };

  const handleDelete = async (id: string) => {
    try {
      await articleService.delete(id);
      message.success("Xóa bài viết thành công");
      fetchArticles();
    } catch (error) {
      message.error("Không thể xóa bài viết");
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await articleService.publish(id);
      message.success("Xuất bản bài viết thành công");
      fetchArticles();
    } catch (error) {
      message.error("Không thể xuất bản bài viết");
    }
  };

  const handleUnpublish = async (id: string) => {
    try {
      await articleService.unpublish(id);
      message.success("Gỡ xuất bản bài viết thành công");
      fetchArticles();
    } catch (error) {
      message.error("Không thể gỡ xuất bản bài viết");
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await articleService.archive(id);
      message.success("Lưu trữ bài viết thành công");
      fetchArticles();
    } catch (error) {
      message.error("Không thể lưu trữ bài viết");
    }
  };

  const columns: ColumnsType<Article> = [
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      render: (title, record) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: 500 }}>{title}</span>
          {record.isFeatured && <Tag color="gold">Nổi bật</Tag>}
        </Space>
      ),
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
      render: (category) => category?.name || "-",
    },
    {
      title: "Tác giả",
      dataIndex: "author",
      key: "author",
      render: (author) => author?.name || "-",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={statusColors[status]}>
          {statusLabels[status] || status}
        </Tag>
      ),
    },
    {
      title: "Lượt xem",
      dataIndex: "viewCount",
      key: "viewCount",
      align: "right",
      render: (count) => count?.toLocaleString() || 0,
    },
    {
      title: "Ngày đăng",
      dataIndex: "publishedAt",
      key: "publishedAt",
      render: (date) => date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "-",
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => router.push(`/articles/${record.id}`)}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => router.push(`/articles/${record.id}/edit`)}
          />
          <Dropdown
            menu={{
              items: [
                record.status !== "published" && {
                  key: "publish",
                  icon: <CheckCircleOutlined />,
                  label: "Xuất bản",
                  onClick: () => handlePublish(record.id),
                },
                record.status === "published" && {
                  key: "unpublish",
                  icon: <CloseCircleOutlined />,
                  label: "Gỡ xuất bản",
                  onClick: () => handleUnpublish(record.id),
                },
                record.status !== "archived" && {
                  key: "archive",
                  icon: <InboxOutlined />,
                  label: "Lưu trữ",
                  onClick: () => handleArchive(record.id),
                },
                { type: "divider" },
                {
                  key: "delete",
                  icon: <DeleteOutlined />,
                  label: "Xóa",
                  danger: true,
                  onClick: () => handleDelete(record.id),
                },
              ].filter(Boolean) as any,
            }}
          >
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="page-header">
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3}>Quản lý bài viết</Title>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => router.push("/articles/new")}
            >
              Thêm bài viết
            </Button>
          </Col>
        </Row>
      </div>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8} md={6}>
          <Input
            placeholder="Tìm kiếm..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onPressEnter={() => fetchArticles()}
          />
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Select
            placeholder="Trạng thái"
            allowClear
            style={{ width: "100%" }}
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { label: "Nháp", value: "draft" },
              { label: "Đã xuất bản", value: "published" },
              { label: "Lên lịch", value: "scheduled" },
              { label: "Lưu trữ", value: "archived" },
            ]}
          />
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Select
            placeholder="Danh mục"
            allowClear
            style={{ width: "100%" }}
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={categories.map((cat) => ({
              label: cat.name,
              value: cat.id,
            }))}
          />
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={articles}
        rowKey="id"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} bài viết`,
        }}
        onChange={handleTableChange}
      />
    </AdminLayout>
  );
}
