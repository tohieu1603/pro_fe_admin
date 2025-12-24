"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Layout, Menu, theme, Typography, Dropdown, Space, Avatar } from "antd";
import {
  DashboardOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
  TagsOutlined,
  BankOutlined,
  InboxOutlined,
  SettingOutlined,
  TagOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  TeamOutlined,
  FileTextOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

type MenuItem = Required<MenuProps>["items"][number];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isAdmin } = useAuth();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Build menu items based on user role
  const menuItems: MenuItem[] = [
    {
      key: "/",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "/products",
      icon: <ShoppingOutlined />,
      label: "Sản phẩm",
    },
    {
      key: "/categories",
      icon: <AppstoreOutlined />,
      label: "Danh mục",
    },
    {
      key: "/brands",
      icon: <TagsOutlined />,
      label: "Thương hiệu",
    },
    {
      key: "/warehouses",
      icon: <BankOutlined />,
      label: "Kho hàng",
    },
    {
      key: "/inventory",
      icon: <InboxOutlined />,
      label: "Tồn kho",
    },
    {
      key: "/tags",
      icon: <TagOutlined />,
      label: "Tags",
    },
    {
      key: "/articles",
      icon: <FileTextOutlined />,
      label: "Bài viết",
    },
    {
      key: "/regions",
      icon: <GlobalOutlined />,
      label: "Vùng/Chi nhánh",
    },
    // Admin only - Users management
    ...(isAdmin
      ? [
          {
            key: "/users",
            icon: <TeamOutlined />,
            label: "Người dùng",
          },
        ]
      : []),
    {
      key: "/settings",
      icon: <SettingOutlined />,
      label: "Cài đặt",
    },
  ];

  const handleMenuClick: MenuProps["onClick"] = (e) => {
    router.push(e.key);
  };

  const handleLogout = async () => {
    await logout();
  };

  // User dropdown menu
  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Thông tin cá nhân",
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme="light"
        style={{
          borderRight: "1px solid #f0f0f0",
        }}
      >
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <Title level={4} style={{ margin: 0, color: "#1890ff" }}>
            {collapsed ? "PA" : "Product Admin"}
          </Title>
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: "0 24px",
            background: colorBgContainer,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            {React.createElement(
              collapsed ? MenuUnfoldOutlined : MenuFoldOutlined,
              {
                className: "trigger",
                onClick: () => setCollapsed(!collapsed),
                style: { fontSize: 18, cursor: "pointer" },
              }
            )}
          </div>

          {/* User info and logout */}
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space style={{ cursor: "pointer" }}>
              <Avatar
                style={{ backgroundColor: isAdmin ? "#f56a00" : "#1890ff" }}
                icon={<UserOutlined />}
              />
              <div style={{ lineHeight: 1.2 }}>
                <Text strong style={{ display: "block" }}>
                  {user?.name || "User"}
                </Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {user?.role === UserRole.ADMIN ? "Administrator" : "User"}
                </Text>
              </div>
            </Space>
          </Dropdown>
        </Header>
        <Content
          style={{
            margin: 24,
            padding: 24,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            minHeight: 280,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
