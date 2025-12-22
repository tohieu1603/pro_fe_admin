"use client";

import React from "react";
import { Typography, Space, Button, Tooltip } from "antd";
import type { OptionGroup } from "./types";

const { Text } = Typography;

interface ProductOptionSelectorProps {
  optionGroups: OptionGroup[];
  selectedOptions: Record<string, string>;
  onOptionChange: (optionTypeId: string, valueId: string) => void;
}

export default function ProductOptionSelector({
  optionGroups,
  selectedOptions,
  onOptionChange,
}: ProductOptionSelectorProps) {
  return (
    <>
      {optionGroups.map((group) => (
        <div key={group.optionType.id} style={{ marginBottom: 16 }}>
          <Text strong style={{ display: "block", marginBottom: 8 }}>
            {group.optionType.name}:
            <Text type="secondary" style={{ marginLeft: 8, fontWeight: "normal" }}>
              {group.values.find((v) => v.id === selectedOptions[group.optionType.id])?.displayValue}
            </Text>
          </Text>
          <Space wrap size={8}>
            {group.values.map((value) => {
              const isSelected = selectedOptions[group.optionType.id] === value.id;
              return value.colorCode ? (
                <Tooltip key={value.id} title={value.displayValue}>
                  <div
                    onClick={() => onOptionChange(group.optionType.id, value.id)}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      backgroundColor: value.colorCode,
                      border: isSelected ? "3px solid #1890ff" : "2px solid #d9d9d9",
                      cursor: "pointer",
                      boxShadow: isSelected ? "0 0 0 2px rgba(24,144,255,0.2)" : "none",
                      transition: "all 0.2s",
                    }}
                  />
                </Tooltip>
              ) : (
                <Button
                  key={value.id}
                  type={isSelected ? "primary" : "default"}
                  onClick={() => onOptionChange(group.optionType.id, value.id)}
                  style={{ minWidth: 80 }}
                >
                  {value.displayValue}
                </Button>
              );
            })}
          </Space>
        </div>
      ))}
    </>
  );
}
