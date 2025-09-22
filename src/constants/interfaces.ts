export interface Category {
  id: number;
  name: string;
  slug: string;
  count: number;
  img_url: string;
  thumbnail_id: string;
  parent: any;
  description: string;
  description_long: string;
  order: string;
  view_url: string;
  yoast_title: string;
  yoast_description: string;
  focuskw: string;
  noindex: string;
  og_image: string;
}

export interface ProcessedCategory {
  id: number | 'all';
  name: string;
  slug?: string;
  count?: number;
  img_url?: string;
}

export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  categories?: ProductCategory[];
  stock_quantity: number | null;
  stock_status: string | null;
  img_url?: string;
  images?: any;
  // WooCommerce specific (optional) fields
  type?: 'simple' | 'variable' | string;
  attributes?: Array<{
    id: number;
    name: string;
    slug: string; // e.g., pa_kich-thuoc
    position: number;
    visible: boolean;
    variation: boolean;
    options: string[]; // human-readable option names
  }>;
  default_attributes?: Array<{
    id?: number;
    name?: string;
    slug?: string; // e.g., pa_kich-thuoc
    option?: string; // human-readable option name
  }>;
  variations?: Array<{
    id: number;
    image?: string;
    sku?: string;
    price: string; // raw from API, convert to number when used
    regular_price?: string;
    sale_price?: string;
    attributes: Record<string, string>; // { 'pa_kich-thuoc': 'lon' }
    stock_quantity: number | null;
    stock_status: string | null;
    product_name?: string;
    enabled?: boolean;
  }>;
}

export interface CartItem extends Product {
  quantity: number;
  discountCode?: string;
  discountPercent?: number;
  discountAmount?: number;
  finalPrice?: number;
  manualDiscountType?: 'percentage' | 'fixed';
  manualDiscountValue?: number;
  isManualDiscount?: boolean;
  // Variant specific metadata (optional)
  variantId?: string; // variation id if item is a variant
  selectedAttributes?: Record<string, string>; // { 'pa_kich-thuoc': 'Lớn' }
  variantImage?: string;
}

export interface OrderDiscount {
  type: 'percentage' | 'fixed';
  value: number;
  amount: number;
}

export interface OrderPromotion {
  code: string;
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
  amount: number;
}

export interface OrderItem extends CartItem {
  // OrderItem is the same as CartItem but in the context of an order
}

export interface Order {
  id: string;
  name: string;
  orderNumber: number;
  items: OrderItem[];
  orderDiscount: OrderDiscount | null;
  orderPromotion: OrderPromotion | null;
  customer: any | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Promotion {
  code: string;
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
  amount: number;
}
