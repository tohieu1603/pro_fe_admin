export interface ProductPreviewProps {
  productId: string;
}

export interface OptionGroup {
  optionType: { id: string; name: string; slug: string };
  values: Array<{
    id: string;
    value: string;
    displayValue: string;
    colorCode?: string;
  }>;
}

export interface StockStatus {
  inStock: boolean;
  quantity: number;
}

// Helper to format currency
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};
