declare module '*.png' {
  const value: import('react-native').ImageSourcePropType;
  export default value;
}

declare module '*.jpg' {
  const value: import('react-native').ImageSourcePropType;
  export default value;
}

// Multi-order system types
interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  finalPrice?: number;
  discountCode?: string;
  discountPercent?: number;
  discountAmount?: number;
  isManualDiscount?: boolean;
  manualDiscountType?: 'percentage' | 'fixed';
  manualDiscountValue?: number;
  img_url?: string;
  images?: Array<{ src: string }>;
  stock_quantity?: number | null;
  stock_status?: string | null;
  categories?: any[];
}

interface OrderDiscount {
  type: 'percentage' | 'fixed';
  value: number;
  amount: number;
}

interface OrderPromotion {
  code: string;
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
  amount: number;
}

interface Order {
  id: string;
  name: string;
  orderNumber: number; // Add order number to track sequence
  items: OrderItem[];
  orderDiscount: OrderDiscount | null;
  orderPromotion: OrderPromotion | null;
  createdAt: Date;
  updatedAt: Date;
}

interface MultiOrderState {
  orders: Order[];
  activeOrderId: string | null;
}
