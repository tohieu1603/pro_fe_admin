"use client";

import { useState } from "react";
import {
  Card,
  Upload,
  Button,
  Typography,
  Alert,
  Space,
  Table,
  message,
  Divider,
  Steps,
  Result,
} from "antd";
import {
  UploadOutlined,
  DownloadOutlined,
  FileExcelOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd/es/upload/interface";
import AdminLayout from "@/components/layout/AdminLayout";
import { importService, ImportResult } from "@/services";

const { Title, Text, Paragraph } = Typography;
const { Dragger } = Upload;

export default function ProductImportPage() {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const handleDownloadTemplate = async () => {
    try {
      const blob = await importService.downloadTemplate();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "product-import-template.xlsx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      message.success("Tải template thành công!");
    } catch (error) {
      message.error("Không thể tải template");
    }
  };

  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.warning("Vui lòng chọn file Excel");
      return;
    }

    const file = fileList[0].originFileObj as File;
    setUploading(true);
    setCurrentStep(1);

    try {
      const response = await importService.importProducts(file);
      if (response.data) {
        setResult(response.data);
        setCurrentStep(2);
      }

      if (response.success) {
        message.success(response.message);
      } else {
        message.warning(response.message);
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || "Lỗi import");
      setCurrentStep(0);
    } finally {
      setUploading(false);
    }
  };

  const uploadProps: UploadProps = {
    onRemove: () => {
      setFileList([]);
      setResult(null);
      setCurrentStep(0);
    },
    beforeUpload: (file) => {
      const isExcel =
        file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.type === "application/vnd.ms-excel" ||
        file.name.endsWith(".xlsx") ||
        file.name.endsWith(".xls");

      if (!isExcel) {
        message.error("Chỉ chấp nhận file Excel (.xlsx, .xls)");
        return Upload.LIST_IGNORE;
      }

      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error("File phải nhỏ hơn 10MB");
        return Upload.LIST_IGNORE;
      }

      setFileList([file as any]);
      setResult(null);
      setCurrentStep(0);
      return false;
    },
    fileList,
    maxCount: 1,
  };

  const handleReset = () => {
    setFileList([]);
    setResult(null);
    setCurrentStep(0);
  };

  return (
    <AdminLayout>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <Title level={3}>Import Sản phẩm từ Excel</Title>

        <Steps
          current={currentStep}
          items={[
            { title: "Chọn file", icon: <FileExcelOutlined /> },
            { title: "Đang xử lý", icon: uploading ? <UploadOutlined spin /> : <UploadOutlined /> },
            { title: "Kết quả" },
          ]}
          style={{ marginBottom: 32 }}
        />

        {/* Step 1: Download template & Upload file */}
        {currentStep === 0 && (
          <>
            <Card title="Bước 1: Tải template mẫu" style={{ marginBottom: 16 }}>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Paragraph>
                  Tải file Excel mẫu để xem cấu trúc dữ liệu cần import. File mẫu gồm 4 sheet:
                </Paragraph>
                <ul>
                  <li><Text strong>Products</Text> - Thông tin sản phẩm chính (bắt buộc)</li>
                  <li><Text strong>Variants</Text> - Các biến thể sản phẩm (tùy chọn)</li>
                  <li><Text strong>Attributes</Text> - Thông số kỹ thuật (tùy chọn)</li>
                  <li><Text strong>Media</Text> - Hình ảnh, video (tùy chọn)</li>
                </ul>
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={handleDownloadTemplate}
                >
                  Tải Template Excel
                </Button>
              </Space>
            </Card>

            <Card title="Bước 2: Upload file Excel đã điền dữ liệu" style={{ marginBottom: 16 }}>
              <Dragger {...uploadProps}>
                <p className="ant-upload-drag-icon">
                  <FileExcelOutlined style={{ fontSize: 48, color: "#52c41a" }} />
                </p>
                <p className="ant-upload-text">
                  Kéo thả file Excel vào đây hoặc click để chọn file
                </p>
                <p className="ant-upload-hint">
                  Chấp nhận file .xlsx, .xls (tối đa 10MB)
                </p>
              </Dragger>

              {fileList.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <Button
                    type="primary"
                    onClick={handleUpload}
                    loading={uploading}
                    icon={<UploadOutlined />}
                    size="large"
                  >
                    Bắt đầu Import
                  </Button>
                </div>
              )}
            </Card>

            <Alert
              type="info"
              showIcon
              message="Lưu ý khi import"
              description={
                <ul style={{ paddingLeft: 20, margin: 0 }}>
                  <li>Cột <code>name</code>, <code>sku_prefix</code>, <code>base_price</code> là bắt buộc trong sheet Products</li>
                  <li>Thương hiệu và danh mục sẽ được tự động tạo nếu chưa tồn tại</li>
                  <li>SKU của mỗi variant phải là duy nhất</li>
                  <li>Tags phân cách bằng dấu phẩy (ví dụ: hot,new,sale)</li>
                </ul>
              }
            />
          </>
        )}

        {/* Step 2: Processing */}
        {currentStep === 1 && (
          <Card>
            <div style={{ textAlign: "center", padding: 40 }}>
              <UploadOutlined spin style={{ fontSize: 48, color: "#1890ff" }} />
              <Title level={4} style={{ marginTop: 16 }}>
                Đang xử lý file...
              </Title>
              <Text type="secondary">Vui lòng đợi trong giây lát</Text>
            </div>
          </Card>
        )}

        {/* Step 3: Results */}
        {currentStep === 2 && result && (
          <>
            <Card style={{ marginBottom: 16 }}>
              <Result
                status={result.errors.length === 0 ? "success" : "warning"}
                title={result.errors.length === 0 ? "Import thành công!" : "Import hoàn tất có lỗi"}
                subTitle={
                  <Space direction="vertical">
                    <Text>Sản phẩm đã tạo: <Text strong style={{ color: "#52c41a" }}>{result.productsCreated}</Text></Text>
                    <Text>Biến thể đã tạo: <Text strong style={{ color: "#1890ff" }}>{result.variantsCreated}</Text></Text>
                  </Space>
                }
                extra={[
                  <Button type="primary" key="reset" onClick={handleReset}>
                    Import file khác
                  </Button>,
                  <Button key="products" href="/products">
                    Xem danh sách sản phẩm
                  </Button>,
                ]}
              />
            </Card>

            {/* Errors */}
            {result.errors.length > 0 && (
              <Card
                title={
                  <Space>
                    <CloseCircleOutlined style={{ color: "#ff4d4f" }} />
                    <span>Lỗi ({result.errors.length})</span>
                  </Space>
                }
                style={{ marginBottom: 16 }}
              >
                <Table
                  dataSource={result.errors.map((err, i) => ({ key: i, message: err }))}
                  columns={[
                    { title: "Mô tả lỗi", dataIndex: "message", key: "message" },
                  ]}
                  pagination={false}
                  size="small"
                />
              </Card>
            )}

            {/* Warnings */}
            {result.warnings.length > 0 && (
              <Card
                title={
                  <Space>
                    <WarningOutlined style={{ color: "#faad14" }} />
                    <span>Cảnh báo ({result.warnings.length})</span>
                  </Space>
                }
              >
                <Table
                  dataSource={result.warnings.map((warn, i) => ({ key: i, message: warn }))}
                  columns={[
                    { title: "Mô tả", dataIndex: "message", key: "message" },
                  ]}
                  pagination={false}
                  size="small"
                />
              </Card>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
