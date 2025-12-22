// Auth Types
export enum UserRole {
  ADMIN = "admin",
  USER = "user",
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  description?: string;
  website?: string;
  country?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  parentId?: string;
  parent?: Category;
  children?: Category[];
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  displayOrder: number;
  path?: string;
  level: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum ProductStatus {
  DRAFT = "draft",
  ACTIVE = "active",
  INACTIVE = "inactive",
  DISCONTINUED = "discontinued",
}

export interface Product {
  id: string;
  spk: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  brandId?: string;
  brand?: Brand;
  categoryId?: string;
  category?: Category;
  basePrice: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  status: ProductStatus;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  variants?: ProductVariant[];
  media?: ProductMedia[];
  attributes?: ProductAttribute[];
  tags?: Tag[];
  reviews?: ProductReview[];
  questions?: ProductQuestion[];
}

export enum VariantStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  OUT_OF_STOCK = "out_of_stock",
}

export interface ProductVariant {
  id: string;
  productId: string;
  product?: Product;
  sku: string;
  name?: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  stockQuantity: number;
  lowStockThreshold: number;
  trackInventory: boolean;
  allowBackorder: boolean;
  weight?: number;
  weightUnit: string;
  barcode?: string;
  isDefault: boolean;
  status: VariantStatus;
  createdAt: string;
  updatedAt: string;
  options?: ProductVariantOption[];
  inventories?: Inventory[];
}

export interface VariantOptionType {
  id: string;
  name: string;
  slug: string;
  displayOrder: number;
  categoryIds?: string[];
  values?: VariantOptionValue[];
}

export interface VariantOptionValue {
  id: string;
  optionTypeId: string;
  optionType?: VariantOptionType;
  value: string;
  displayValue?: string;
  colorCode?: string;
  displayOrder: number;
}

export interface ProductVariantOption {
  id: string;
  variantId: string;
  optionTypeId: string;
  optionType?: VariantOptionType;
  optionValueId: string;
  optionValue?: VariantOptionValue;
}

export interface AttributeDefinition {
  id: string;
  categoryId?: string;
  category?: Category;
  name: string;
  slug: string;
  dataType: "text" | "number" | "boolean" | "select";
  unit?: string;
  possibleValues?: string[];
  displayGroup?: string;
  displayOrder: number;
  isFilterable: boolean;
  isComparable: boolean;
}

export interface ProductAttribute {
  id: string;
  productId: string;
  attributeId: string;
  attribute?: AttributeDefinition;
  value: string;
}

export enum MediaType {
  IMAGE = "image",
  VIDEO = "video",
  VIEW_360 = "360",
  AR_MODEL = "ar_model",
}

export interface ProductMedia {
  id: string;
  productId: string;
  variantId?: string;
  type: MediaType;
  url: string;
  thumbnailUrl?: string;
  altText?: string;
  title?: string;
  videoProvider?: string;
  videoId?: string;
  duration?: number;
  displayOrder: number;
  isPrimary: boolean;
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  address?: string;
  city?: string;
  province?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Inventory {
  id: string;
  variantId: string;
  variant?: ProductVariant;
  warehouseId: string;
  warehouse?: Warehouse;
  quantity: number;
  reservedQuantity: number;
  updatedAt: string;
}

export enum MovementType {
  IN = "in",
  OUT = "out",
  TRANSFER = "transfer",
  ADJUSTMENT = "adjustment",
}

export interface InventoryMovement {
  id: string;
  variantId?: string;
  variant?: ProductVariant;
  warehouseId?: string;
  warehouse?: Warehouse;
  type: MovementType;
  quantity: number;
  referenceType?: string;
  referenceId?: string;
  note?: string;
  createdBy?: string;
  createdAt: string;
}

export enum TagType {
  GENERAL = "general",
  BADGE = "badge",
  PROMOTION = "promotion",
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  type: TagType;
  createdAt: string;
  updatedAt: string;
}

export interface PriceRule {
  id: string;
  name: string;
  type: "percentage" | "fixed_amount" | "fixed_price";
  value: number;
  appliesTo?: "all" | "category" | "brand" | "product" | "variant";
  targetIds?: string[];
  minQuantity: number;
  customerGroupIds?: string[];
  startsAt?: string;
  endsAt?: string;
  isActive: boolean;
  priority: number;
}

export interface FlashSale {
  id: string;
  name: string;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  items?: FlashSaleItem[];
}

export interface FlashSaleItem {
  id: string;
  flashSaleId: string;
  variantId: string;
  variant?: ProductVariant;
  salePrice: number;
  quantityLimit?: number;
  quantitySold: number;
  perCustomerLimit: number;
}

export interface ProductReview {
  id: string;
  productId: string;
  variantId?: string;
  customerId: string;
  orderId?: string;
  rating: number;
  title?: string;
  content?: string;
  pros?: string[];
  cons?: string[];
  images?: string[];
  videos?: string[];
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  helpfulCount: number;
  notHelpfulCount: number;
  createdAt: string;
  replies?: ReviewReply[];
}

export interface ReviewReply {
  id: string;
  reviewId: string;
  content: string;
  repliedBy?: string;
  createdAt: string;
}

export interface ProductQuestion {
  id: string;
  productId: string;
  customerName: string;
  customerEmail?: string;
  question: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
  answers?: QuestionAnswer[];
}

export interface QuestionAnswer {
  id: string;
  questionId: string;
  answer: string;
  answeredBy: string;
  isOfficial: boolean;
  createdAt: string;
}

export interface Promotion {
  id: string;
  name: string;
  description?: string;
  type: string; // discount, gift, shipping, installment
  value?: string;
  appliesTo: string; // all, category, brand, product
  targetIds?: string[];
  startsAt?: string;
  endsAt?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceInfo {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  appliesTo: string;
  targetIds?: string[];
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}
