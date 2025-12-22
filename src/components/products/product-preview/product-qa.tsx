"use client";

import React, { useMemo } from "react";
import { Row, Col, Card, Typography, Space, Button, Input, List, Avatar, Empty, Collapse } from "antd";
import { QuestionCircleOutlined, UserOutlined } from "@ant-design/icons";
import type { ProductQuestion } from "@/types";

const { Text, Paragraph } = Typography;

interface ProductQAProps {
  questions: ProductQuestion[];
}

export default function ProductQA({ questions }: ProductQAProps) {
  // Filter only approved questions
  const approvedQuestions = useMemo(
    () => questions.filter((q) => q.isApproved),
    [questions]
  );

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN");
  };

  return (
    <Row gutter={32}>
      <Col xs={24} lg={16}>
        {/* Ask Question Form */}
        <Card size="small" style={{ marginBottom: 16 }}>
          <Space.Compact style={{ width: "100%" }}>
            <Input.TextArea
              placeholder="Bạn có câu hỏi về sản phẩm này?"
              autoSize={{ minRows: 2 }}
              style={{ borderRadius: "6px 0 0 6px" }}
            />
            <Button type="primary" style={{ height: "auto" }}>
              Gửi câu hỏi
            </Button>
          </Space.Compact>
        </Card>

        {/* Questions List */}
        {approvedQuestions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Empty
              description="Chưa có câu hỏi nào"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Text type="secondary">Hãy là người đầu tiên đặt câu hỏi!</Text>
            </Empty>
          </div>
        ) : (
          <List
            itemLayout="vertical"
            dataSource={approvedQuestions}
            renderItem={(item) => (
              <Card size="small" style={{ marginBottom: 12 }}>
                <Space direction="vertical" style={{ width: "100%" }}>
                  {/* Question */}
                  <Space align="start">
                    <QuestionCircleOutlined style={{ color: "#1890ff", marginTop: 4 }} />
                    <div style={{ flex: 1 }}>
                      <Text strong>{item.question}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        <UserOutlined /> {item.customerName} - {formatDate(item.createdAt)}
                      </Text>
                    </div>
                  </Space>

                  {/* Answers */}
                  {item.answers && item.answers.length > 0 && (
                    <div style={{ marginLeft: 22 }}>
                      {item.answers.map((answer) => (
                        <div
                          key={answer.id}
                          style={{
                            padding: "8px 12px",
                            background: answer.isOfficial ? "#f6ffed" : "#fafafa",
                            borderRadius: 4,
                            borderLeft: answer.isOfficial
                              ? "3px solid #52c41a"
                              : "3px solid #d9d9d9",
                            marginBottom: 8,
                          }}
                        >
                          <Space direction="vertical" size={4} style={{ width: "100%" }}>
                            <Space>
                              <Avatar
                                size="small"
                                style={{
                                  backgroundColor: answer.isOfficial ? "#52c41a" : "#bfbfbf",
                                }}
                              >
                                {answer.isOfficial ? "S" : "K"}
                              </Avatar>
                              <Text strong>
                                {answer.isOfficial ? "Shop trả lời" : answer.answeredBy}
                              </Text>
                              {answer.isOfficial && (
                                <Text
                                  style={{
                                    fontSize: 10,
                                    color: "#52c41a",
                                    background: "#f6ffed",
                                    padding: "1px 6px",
                                    borderRadius: 2,
                                  }}
                                >
                                  Chính thức
                                </Text>
                              )}
                            </Space>
                            <Paragraph style={{ margin: 0 }}>{answer.answer}</Paragraph>
                            <Text type="secondary" style={{ fontSize: 11 }}>
                              {formatDate(answer.createdAt)}
                            </Text>
                          </Space>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* No answer yet */}
                  {(!item.answers || item.answers.length === 0) && (
                    <div
                      style={{
                        marginLeft: 22,
                        padding: "8px 12px",
                        background: "#fffbe6",
                        borderRadius: 4,
                        borderLeft: "3px solid #faad14",
                      }}
                    >
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Câu hỏi đang chờ được trả lời...
                      </Text>
                    </div>
                  )}
                </Space>
              </Card>
            )}
          />
        )}

        {approvedQuestions.length > 5 && (
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <Button>Xem thêm câu hỏi</Button>
          </div>
        )}
      </Col>

      <Col xs={24} lg={8}>
        <Card size="small" title="Câu hỏi thường gặp">
          <Collapse ghost>
            <Collapse.Panel header="Thời gian giao hàng?" key="1">
              <Text>Giao hàng trong 2-3 ngày làm việc.</Text>
            </Collapse.Panel>
            <Collapse.Panel header="Có hỗ trợ trả góp không?" key="2">
              <Text>Có hỗ trợ trả góp 0% qua thẻ tín dụng.</Text>
            </Collapse.Panel>
            <Collapse.Panel header="Chính sách đổi trả?" key="3">
              <Text>Đổi trả trong 30 ngày nếu lỗi từ NSX.</Text>
            </Collapse.Panel>
          </Collapse>
        </Card>
      </Col>
    </Row>
  );
}
