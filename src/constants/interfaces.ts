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
}

export interface OrderDiscount {
  type: 'percentage' | 'fixed';
  value: number;
  amount: number;
}

export interface Promotion {
  code: string;
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
  amount: number;
}
