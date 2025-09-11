import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Định nghĩa kiểu dữ liệu cho discount
export interface ProductDiscount {
  type: 'percent_product' | 'fixed_product';
  value: number;
}

// Định nghĩa kiểu dữ liệu cho cart item
export interface CartItem {
  product_id: string;
  product_name: string;
  quantity: number;
  price?: number;
  image?: string;
  discount?: ProductDiscount;
}

// Định nghĩa kiểu dữ liệu cho state
export interface CartState {
  items: CartItem[];
}

// Trạng thái ban đầu
const initialState: CartState = {
  items: [],
};

// Tạo slice
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Thêm sản phẩm vào giỏ hàng
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItemIndex = state.items.findIndex((item) => item.product_id === action.payload.product_id);

      if (existingItemIndex !== -1) {
        // Cập nhật số lượng nếu sản phẩm đã tồn tại
        state.items[existingItemIndex].quantity += action.payload.quantity || 1;
      } else {
        // Thêm sản phẩm mới
        state.items.push({
          ...action.payload,
          quantity: action.payload.quantity || 1,
        });
      }
    },

    // Xóa sản phẩm khỏi giỏ hàng
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.product_id !== action.payload);
    },

    // Cập nhật số lượng sản phẩm
    updateQuantity: (state, action: PayloadAction<{ productId: string; quantity: number }>) => {
      const { productId, quantity } = action.payload;
      const itemIndex = state.items.findIndex((item) => item.product_id === productId);

      if (itemIndex !== -1 && quantity > 0) {
        state.items[itemIndex].quantity = quantity;
      }
    },

    // Đặt toàn bộ giỏ hàng (thay thế)
    setCartItems: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
    },

    // Xóa giỏ hàng
    clearCart: (state) => {
      state.items = [];
    },

    // Thêm giảm giá cho sản phẩm
    setProductDiscount: (state, action: PayloadAction<{ productId: string; discount: ProductDiscount }>) => {
      const { productId, discount } = action.payload;
      const itemIndex = state.items.findIndex((item) => item.product_id === productId);

      if (itemIndex !== -1) {
        state.items[itemIndex].discount = discount;
      }
    },

    // Xóa giảm giá của sản phẩm
    removeProductDiscount: (state, action: PayloadAction<string>) => {
      const productId = action.payload;
      const itemIndex = state.items.findIndex((item) => item.product_id === productId);

      if (itemIndex !== -1) {
        delete state.items[itemIndex].discount;
      }
    },
  },
});

// Export actions
export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  setCartItems,
  clearCart,
  setProductDiscount,
  removeProductDiscount,
} = cartSlice.actions;

// Export reducer
export default cartSlice.reducer;
