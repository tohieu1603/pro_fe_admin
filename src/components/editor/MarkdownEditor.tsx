"use client";

import React, { useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { message } from "antd";

// Dynamic import to avoid SSR issues
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface MarkdownEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  height?: number;
  placeholder?: string;
}

/**
 * Markdown Editor with smart paste functionality:
 * - Paste image → converts to markdown image syntax
 * - Paste single line text → converts to H1 heading
 * - Paste multi-line text → keeps as-is
 */
export default function MarkdownEditor({
  value = "",
  onChange,
  height = 400,
  placeholder = "Nhập mô tả sản phẩm...",
}: MarkdownEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  // Handle paste event for smart formatting
  const handlePaste = useCallback(
    async (e: React.ClipboardEvent) => {
      const clipboardData = e.clipboardData;

      // Check for images first
      const items = clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];

        if (item.type.startsWith("image/")) {
          e.preventDefault();

          const file = item.getAsFile();
          if (!file) continue;

          // Convert image to base64 for preview (in production, upload to server)
          const reader = new FileReader();
          reader.onload = (event) => {
            const base64 = event.target?.result as string;
            const imageMarkdown = `\n![image](${base64})\n`;

            const newValue = value + imageMarkdown;
            onChange?.(newValue);
            message.success("Đã thêm ảnh");
          };
          reader.readAsDataURL(file);
          return;
        }
      }

      // Check for text
      const text = clipboardData.getData("text/plain");
      if (text) {
        const trimmedText = text.trim();
        const lines = trimmedText.split("\n");

        // Single line text → convert to H1
        if (lines.length === 1 && trimmedText.length > 0 && trimmedText.length < 100) {
          // Only convert if it doesn't already start with # or other markdown
          if (!trimmedText.startsWith("#") && !trimmedText.startsWith("-") && !trimmedText.startsWith("*")) {
            e.preventDefault();
            const headingMarkdown = `\n# ${trimmedText}\n`;
            const newValue = value + headingMarkdown;
            onChange?.(newValue);
            return;
          }
        }
      }
    },
    [value, onChange]
  );

  return (
    <div
      ref={editorRef}
      data-color-mode="light"
      onPaste={handlePaste}
    >
      <MDEditor
        value={value}
        onChange={(val) => onChange?.(val || "")}
        height={height}
        preview="live"
        textareaProps={{
          placeholder,
        }}
      />
      <style jsx global>{`
        .w-md-editor {
          border-radius: 6px;
          border: 1px solid #d9d9d9;
        }
        .w-md-editor:hover {
          border-color: #1890ff;
        }
        .w-md-editor-toolbar {
          background: #fafafa;
          border-bottom: 1px solid #d9d9d9;
        }
        .wmde-markdown {
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}
