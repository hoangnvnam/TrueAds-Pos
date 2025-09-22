import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import BottomSheetModal from '~/components/BottomSheetModal';
import { Icon } from '~/components/Icon';
import { Image } from '~/components/Image';
import {
  CartItem,
  Category,
  Order,
  OrderDiscount,
  OrderItem,
  OrderPromotion,
  ProcessedCategory,
  Product,
  ProductCategory,
  Promotion,
} from '~/constants/interfaces';
import { useFetchData } from '~/hooks/useApi';
import { useCashierSettings } from '~/hooks/useCashierSettings';
import { useOrientation } from '~/hooks/useOrientation';
import { useTheme } from '~/hooks/useTheme';
import { toastInfo, toastSuccess, toastWarning } from '~/hooks/useToast';
import { formatCurrency } from '~/utils/format';
import { useCashierStyles } from './styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DIMENSIONS } from '~/constants/dimensions';

// Global storage for orders to persist across re-mounts
let globalOrdersStorage: Order[] = [];
let globalActiveOrderId: string | null = null;
let globalOrderCounter: number = 1;

export function Cashier() {
  const theme = useTheme();
  const { styles } = useCashierStyles();
  const { settings, isLoaded, updateProductViewMode, updateViewMode, updateAutoPrint } = useCashierSettings();
  const { isLandscape } = useOrientation();

  // Multi-order state - Initialize from global storage
  const [orders, setOrders] = useState<Order[]>(() => globalOrdersStorage);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(() => globalActiveOrderId);
  const [orderCounter, setOrderCounter] = useState(() => globalOrderCounter);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  const [discountModalVisible, setDiscountModalVisible] = useState(false);
  const [selectedItemForDiscount, setSelectedItemForDiscount] = useState<string | null>(null);
  const [discountCode, setDiscountCode] = useState('');
  const [quantityInput, setQuantityInput] = useState<{ [key: string]: string }>({});
  const [discountType, setDiscountType] = useState<'coupon' | 'manual'>('manual');
  const [manualDiscountType, setManualDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [manualDiscountValue, setManualDiscountValue] = useState('');
  const [cartBottomSheetVisible, setCartBottomSheetVisible] = useState(false);

  // Modal states for order-level discount/promotion
  const [footerCollapsed, setFooterCollapsed] = useState(false);
  const [orderDiscountModalVisible, setOrderDiscountModalVisible] = useState(false);
  const [promotionModalVisible, setPromotionModalVisible] = useState(false);
  const [orderDiscountType, setOrderDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [orderDiscountValue, setOrderDiscountValue] = useState('');
  const [promotionCode, setPromotionCode] = useState('');

  // Variation selection modal state
  const [variationModalVisible, setVariationModalVisible] = useState(false);
  const [productForVariation, setProductForVariation] = useState<Product | null>(null);
  const [selectedVariations, setSelectedVariations] = useState<Record<string, string>>({});

  // Quick add product modal state
  const [quickAddModalVisible, setQuickAddModalVisible] = useState(false);
  const [quickAddData, setQuickAddData] = useState({
    name: '',
    sku: '',
    regularPrice: '',
    salePrice: '',
    manageStock: false,
    stockQuantity: '',
  });

  // Barcode scanner modal state
  const [barcodeScannerVisible, setBarcodeScannerVisible] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);

  // Refresh control state
  const [refreshing, setRefreshing] = useState(false);

  // Customer selection state
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [customerDropdownVisible, setCustomerDropdownVisible] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');

  // Camera permissions
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  // Helper function to get current active order
  const getCurrentOrder = (): Order | null => {
    return orders.find((order) => order.id === activeOrderId) || null;
  };

  // Helper function to get current cart items
  const cart = getCurrentOrder()?.items || [];

  // Helper function to get current order discount
  const orderDiscount = getCurrentOrder()?.orderDiscount || null;

  // Helper function to get current order promotion
  const orderPromotion = getCurrentOrder()?.orderPromotion || null;

  // Helper function to get current order customer
  const currentCustomer = getCurrentOrder()?.customer || null;

  // Update customer for current order
  const updateOrderCustomer = (customer: any) => {
    if (!activeOrderId) return;

    setOrders((prevOrders) =>
      prevOrders.map((order) => {
        if (order.id === activeOrderId) {
          return {
            ...order,
            customer: customer,
            updatedAt: new Date(),
          };
        }
        return order;
      }),
    );
  };

  // Sync selected customer with current order
  React.useEffect(() => {
    setSelectedCustomer(currentCustomer);
  }, [currentCustomer, activeOrderId]);

  // Sync local state with global storage
  useEffect(() => {
    globalOrdersStorage = orders;
  }, [orders]);

  useEffect(() => {
    globalActiveOrderId = activeOrderId;
  }, [activeOrderId]);

  useEffect(() => {
    globalOrderCounter = orderCounter;
  }, [orderCounter]);

  useEffect(() => {
    if (orders.length === 0) {
      createNewOrder();
    }
  }, [orders.length]);

  useEffect(() => {
    if (orders.length > 0) {
      const maxOrderNumber = Math.max(...orders.map((order) => order.orderNumber || 0));
      if (maxOrderNumber >= orderCounter) {
        setOrderCounter(maxOrderNumber + 1);
      }
    }
  }, [orders]);

  // Function to create new order
  const createNewOrder = () => {
    const newOrderId = `order_${Date.now()}`;
    const newOrder: Order = {
      id: newOrderId,
      name: `Đơn hàng ${orderCounter}`,
      orderNumber: orderCounter,
      items: [],
      orderDiscount: null,
      orderPromotion: null,
      customer: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setOrders((prev) => [...prev, newOrder]);
    setActiveOrderId(newOrderId);
    setOrderCounter((prev) => prev + 1); // Increment counter for next order
  };

  // Function to rename an order (optional feature)
  const renameOrder = (orderId: string, newName: string) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) => {
        if (order.id === orderId) {
          return {
            ...order,
            name: newName,
            updatedAt: new Date(),
          };
        }
        return order;
      }),
    );
  };

  // Function to delete an order
  const deleteOrder = (orderId: string) => {
    if (orders.length <= 1) {
      Alert.alert('Thông báo', 'Phải có ít nhất 1 đơn hàng');
      return;
    }

    const orderToDelete = orders.find((order) => order.id === orderId);

    setOrders((prev) => {
      const newOrders = prev.filter((order) => order.id !== orderId);

      // If deleting active order, switch to another order
      if (orderId === activeOrderId) {
        const remainingOrder = newOrders[0];
        setActiveOrderId(remainingOrder?.id || null);
      }

      return newOrders;
    });
  };

  const switchToOrder = (orderId: string) => {
    setActiveOrderId(orderId);
  };

  const viewMode = settings.viewMode;
  const productViewMode = settings.productViewMode;
  const autoPrint = settings.autoPrint;

  useEffect(() => {
    if (viewMode === 'split') {
      setCartBottomSheetVisible(false);
    }
  }, [viewMode]);

  const discountCodes = {
    SAVE10: { percent: 10, name: 'Giảm 10%' },
    SAVE20: { percent: 20, name: 'Giảm 20%' },
    NEWCUSTOMER: { percent: 15, name: 'Khách hàng mới 15%' },
    VIP30: { percent: 30, name: 'VIP 30%' },
  };

  const { data: dataProducts, refresh: refreshProducts } = useFetchData({
    queryKey: ['productsData'],
    url: '/get',
    action: 'get_products_api',
    options: {
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchOnReconnect: true,
      refetchInterval: 1000 * 60 * 60 * 24,
      staleTime: 1000 * 60 * 60 * 24,
    },
  });

  const { data: categories, refresh: refreshCategories } = useFetchData({
    queryKey: ['categoriesData'],
    url: '/get',
    action: 'get_all_categories',
    options: {
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchOnReconnect: true,
      refetchInterval: 1000 * 60 * 60 * 24,
      staleTime: 1000 * 60 * 60 * 24,
    },
  });
  const { data: attributes, refresh: refreshAttributes } = useFetchData({
    queryKey: ['attributesData'],
    url: '/get',
    action: 'get_all_product_attributes',
    options: {
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchOnReconnect: true,
      refetchInterval: 1000 * 60 * 60 * 24,
      staleTime: 1000 * 60 * 60 * 24,
    },
  });
  const { data: customers, refresh: refreshCustomer } = useFetchData({
    queryKey: ['customersData'],
    url: '/get',
    action: 'get_all_customers_api',
    options: {
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchOnReconnect: true,
      refetchInterval: 1000 * 60 * 60 * 24,
      staleTime: 1000 * 60 * 60 * 24,
    },
  });
  const processedCategories: ProcessedCategory[] = React.useMemo(() => {
    if (!categories?.data) return [{ id: 'all', name: 'Tất cả' }];

    const allCategory: ProcessedCategory = { id: 'all', name: 'Tất cả' };
    const apiCategories: ProcessedCategory[] = categories.data.map((cat: Category) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      count: cat.count,
      img_url: cat.img_url,
    }));

    return [allCategory, ...apiCategories];
  }, [categories?.data]);

  const filteredProducts = dataProducts?.data?.filter((product: any) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesCategory = true;
    if (selectedCategory !== 'all') {
      if (product.categories && Array.isArray(product.categories)) {
        matchesCategory = product.categories.some((category: ProductCategory) => category.id === selectedCategory);
      } else {
        matchesCategory = false;
      }
    }

    return matchesSearch && matchesCategory;
  });

  // Add product to cart; if variable, open variation selection first
  const addToCart = (product: Product) => {
    if (!activeOrderId) return;
    // If variable product -> open picker modal
    if (product.type === 'variable' && product.variations && product.variations.length > 0) {
      setProductForVariation(product);
      // Prefill default attributes if any
      const defaults: Record<string, string> = {};
      product.default_attributes?.forEach((d) => {
        if (d.slug && d.option) defaults[d.slug] = d.option;
      });
      setSelectedVariations(defaults);
      setVariationModalVisible(true);
      return;
    }

    // Simple product flow: increase if exists, else add new
    setOrders((prevOrders) =>
      prevOrders.map((order) => {
        if (order.id !== activeOrderId) return order;

        const existingItem = order.items.find((item) => item.id === product.id && !item.variantId);
        let updatedItems;

        if (existingItem) {
          const newQty = existingItem.quantity + 1;
          updatedItems = order.items.map((item) =>
            item === existingItem
              ? {
                  ...item,
                  quantity: newQty,
                  finalPrice: calculateFinalPrice(item.price, item.discountPercent) * newQty,
                }
              : item,
          );
        } else {
          const newItem: OrderItem = {
            ...product,
            quantity: 1,
            finalPrice: product.price * 1,
          };
          updatedItems = [...order.items, newItem];
        }

        return {
          ...order,
          items: updatedItems,
          updatedAt: new Date(),
        };
      }),
    );
  };

  const addSelectedVariantToCart = (product: Product, variationId: number, selectedAttrs: Record<string, string>) => {
    if (!activeOrderId) return;
    const variation = product.variations?.find((v) => v.id === variationId);
    if (!variation) return;

    const variantPrice = Number(variation.price || product.price || 0);
    const lineId = `${product.id}:${variationId}`;

    setOrders((prevOrders) =>
      prevOrders.map((order) => {
        if (order.id !== activeOrderId) return order;

        // Identify existing cart line by composite line id
        const existingItem = order.items.find((item) => item.id === lineId);

        let updatedItems: OrderItem[];
        if (existingItem) {
          const newQty = existingItem.quantity + 1;
          updatedItems = order.items.map((item) =>
            item === existingItem
              ? {
                  ...item,
                  quantity: newQty,
                  finalPrice: calculateFinalPrice(item.price, item.discountPercent) * newQty,
                }
              : item,
          );
        } else {
          const newItem: OrderItem = {
            ...product,
            id: lineId,
            price: variantPrice,
            variantId: String(variationId),
            selectedAttributes: selectedAttrs,
            variantImage: variation.image || product.img_url,
            stock_quantity: variation.stock_quantity ?? product.stock_quantity ?? null,
            stock_status: variation.stock_status ?? product.stock_status ?? null,
            quantity: 1,
            finalPrice: variantPrice,
          } as OrderItem;
          updatedItems = [...order.items, newItem];
        }

        return { ...order, items: updatedItems, updatedAt: new Date() };
      }),
    );
  };

  // Remove product from cart completely
  const removeFromCart = (productId: string) => {
    if (!activeOrderId) return;

    setOrders((prevOrders) =>
      prevOrders.map((order) => {
        if (order.id !== activeOrderId) return order;

        return {
          ...order,
          items: order.items.filter((item) => item.id !== productId),
          updatedAt: new Date(),
        };
      }),
    );

    const updatedQuantityInput = { ...quantityInput };
    delete updatedQuantityInput[productId];
    setQuantityInput(updatedQuantityInput);
  };

  // Update quantity for a cart item
  const updateQuantity = (productId: string, quantity: number) => {
    if (!activeOrderId) return;

    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    // Find corresponding item in current cart to respect variant stock
    const order = getCurrentOrder();
    const cartItem = order?.items.find((i) => i.id === productId);
    let maxStock = 999;
    if (cartItem) {
      maxStock = cartItem.stock_quantity ?? 999;
    } else {
      const product = dataProducts?.data?.find((p: any) => p.id === productId);
      maxStock = product?.stock_quantity ?? 999;
    }

    if (quantity > maxStock) {
      toastWarning(`Số lượng không được vượt quá ${maxStock}`);
      return;
    }

    setOrders((prevOrders) =>
      prevOrders.map((order) => {
        if (order.id !== activeOrderId) return order;

        return {
          ...order,
          items: order.items.map((item) =>
            item.id === productId
              ? { ...item, quantity, finalPrice: calculateFinalPrice(item.price, item.discountPercent) * quantity }
              : item,
          ),
          updatedAt: new Date(),
        };
      }),
    );

    setQuantityInput((prev) => ({
      ...prev,
      [productId]: quantity.toString(),
    }));
  };

  // Calculate final price after discount
  const calculateFinalPrice = (originalPrice: number, discountPercent?: number) => {
    if (!discountPercent) return originalPrice;
    return originalPrice * (1 - discountPercent / 100);
  };

  // Apply discount to selected cart item
  const applyDiscount = () => {
    if (!selectedItemForDiscount || !activeOrderId) {
      Alert.alert('Thông báo', 'Vui lòng chọn sản phẩm');
      return;
    }

    if (discountType === 'coupon') {
      if (!discountCode.trim()) {
        Alert.alert('Thông báo', 'Vui lòng nhập mã giảm giá');
        return;
      }

      const discount = discountCodes[discountCode.toUpperCase() as keyof typeof discountCodes];
      if (!discount) {
        Alert.alert('Lỗi', 'Mã giảm giá không hợp lệ');
        return;
      }

      setOrders((prevOrders) =>
        prevOrders.map((order) => {
          if (order.id !== activeOrderId) return order;

          return {
            ...order,
            items: order.items.map((item) => {
              if (item.id === selectedItemForDiscount) {
                const finalPrice = calculateFinalPrice(item.price, discount.percent);
                return {
                  ...item,
                  discountCode: discountCode.toUpperCase(),
                  discountPercent: discount.percent,
                  discountAmount: item.price - finalPrice,
                  finalPrice: finalPrice * item.quantity,
                  isManualDiscount: false,
                  manualDiscountType: undefined,
                  manualDiscountValue: undefined,
                };
              }
              return item;
            }),
            updatedAt: new Date(),
          };
        }),
      );

      Alert.alert('Thành công', `Đã áp dụng ${discount.name}`);
    } else {
      const discountValue = parseFloat(manualDiscountValue);
      if (!discountValue || discountValue <= 0) {
        Alert.alert('Lỗi', 'Vui lòng nhập giá trị giảm giá hợp lệ');
        return;
      }

      const cartItem = cart.find((item) => item.id === selectedItemForDiscount);
      if (!cartItem) return;

      let discountPercent = 0;
      let discountAmount = 0;
      let finalPrice = cartItem.price;

      if (manualDiscountType === 'percentage') {
        if (discountValue > 100) {
          Alert.alert('Lỗi', 'Phần trăm giảm giá không được > 100%');
          return;
        }
        discountPercent = discountValue;
        finalPrice = cartItem.price * (1 - discountValue / 100);
        discountAmount = cartItem.price - finalPrice;
      } else {
        if (discountValue > cartItem.price) {
          Alert.alert('Lỗi', 'Số tiền giảm không được > giá sản phẩm');
          return;
        }
        discountAmount = discountValue;
        finalPrice = cartItem.price - discountValue;
        discountPercent = (discountValue / cartItem.price) * 100;
      }

      setOrders((prevOrders) =>
        prevOrders.map((order) => {
          if (order.id !== activeOrderId) return order;

          return {
            ...order,
            items: order.items.map((item) => {
              if (item.id === selectedItemForDiscount) {
                return {
                  ...item,
                  discountCode: undefined,
                  discountPercent,
                  discountAmount,
                  finalPrice: finalPrice * item.quantity,
                  isManualDiscount: true,
                  manualDiscountType,
                  manualDiscountValue: discountValue,
                };
              }
              return item;
            }),
            updatedAt: new Date(),
          };
        }),
      );

      const discountTypeText =
        manualDiscountType === 'percentage' ? `${discountValue}%` : formatCurrency(discountValue);
      Alert.alert('Thành công', `Đã áp dụng giảm giá ${discountTypeText}`);
    }

    setDiscountModalVisible(false);
    setDiscountCode('');
    setManualDiscountValue('');
    setSelectedItemForDiscount(null);
    setDiscountType('coupon');
  };

  // Apply discount to entire order
  const applyOrderDiscount = () => {
    if (!activeOrderId) return;

    const discountValue = parseFloat(orderDiscountValue);
    if (!discountValue || discountValue <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập giá trị giảm giá hợp lệ');
      return;
    }

    const orderSubtotal = getOrderSubtotal();

    let discountAmount = 0;

    if (orderDiscountType === 'percentage') {
      if (discountValue > 100) {
        Alert.alert('Lỗi', 'Phần trăm giảm giá không được > 100%');
        return;
      }
      discountAmount = (orderSubtotal * discountValue) / 100;
    } else {
      if (discountValue > orderSubtotal) {
        Alert.alert('Lỗi', 'Số tiền giảm không được > tổng tiền hàng');
        return;
      }
      discountAmount = discountValue;
    }

    const newOrderDiscount: OrderDiscount = {
      type: orderDiscountType,
      value: discountValue,
      amount: discountAmount,
    };

    setOrders((prevOrders) =>
      prevOrders.map((order) => {
        if (order.id !== activeOrderId) return order;

        return {
          ...order,
          orderDiscount: newOrderDiscount,
          updatedAt: new Date(),
        };
      }),
    );

    setOrderDiscountModalVisible(false);
    setOrderDiscountValue('');

    const discountTypeText = orderDiscountType === 'percentage' ? `${discountValue}%` : formatCurrency(discountValue);
    toastSuccess(`Đã áp dụng giảm giá ${discountTypeText}`);
  };

  // Apply promotion code to order
  const applyPromotion = async () => {
    if (!activeOrderId) return;

    if (!promotionCode.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập mã khuyến mãi');
      return;
    }

    try {
      const mockPromotions: { [key: string]: any } = {
        SUMMER2024: { name: 'Ưu đãi mùa hè', type: 'percentage', value: 15 },
        NEWUSER: { name: 'Khách hàng mới', type: 'fixed', value: 50000 },
        VIP100: { name: 'VIP 100K', type: 'fixed', value: 100000 },
        PERCENT20: { name: 'Giảm 20%', type: 'percentage', value: 20 },
      };

      const promotionData = mockPromotions[promotionCode.toUpperCase()];

      if (!promotionData) {
        Alert.alert('Lỗi', 'Mã khuyến mãi không hợp lệ hoặc đã hết hạn');
        return;
      }

      const orderSubtotal = getOrderSubtotal();
      let promotionAmount = 0;

      if (promotionData.type === 'percentage') {
        promotionAmount = (orderSubtotal * promotionData.value) / 100;
      } else {
        promotionAmount = Math.min(promotionData.value, orderSubtotal);
      }

      const newOrderPromotion: OrderPromotion = {
        code: promotionCode.toUpperCase(),
        name: promotionData.name,
        type: promotionData.type,
        value: promotionData.value,
        amount: promotionAmount,
      };

      setOrders((prevOrders) =>
        prevOrders.map((order) => {
          if (order.id !== activeOrderId) return order;

          return {
            ...order,
            orderPromotion: newOrderPromotion,
            updatedAt: new Date(),
          };
        }),
      );

      setPromotionModalVisible(false);
      setPromotionCode('');

      toastSuccess(`Đã áp dụng khuyến mãi: ${promotionData.name}`);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể xác thực mã khuyến mãi. Vui lòng thử lại.');
    }
  };

  const removeOrderDiscount = () => {
    if (!activeOrderId) return;

    setOrders((prevOrders) =>
      prevOrders.map((order) => {
        if (order.id !== activeOrderId) return order;

        return {
          ...order,
          orderDiscount: null,
          updatedAt: new Date(),
        };
      }),
    );
    toastInfo('Đã bỏ giảm giá');
  };

  const removeOrderPromotion = () => {
    if (!activeOrderId) return;

    setOrders((prevOrders) =>
      prevOrders.map((order) => {
        if (order.id !== activeOrderId) return order;

        return {
          ...order,
          orderPromotion: null,
          updatedAt: new Date(),
        };
      }),
    );
    toastInfo('Đã bỏ khuyến mãi');
  };

  // Recalculate order-level discounts when cart changes
  const recalculateOrderDiscounts = () => {
    if (!activeOrderId) return;

    const subtotal = getOrderSubtotal();
    const currentOrder = getCurrentOrder();

    if (currentOrder?.orderDiscount) {
      let newAmount = 0;
      if (currentOrder.orderDiscount.type === 'percentage') {
        newAmount = (subtotal * currentOrder.orderDiscount.value) / 100;
      } else {
        newAmount = Math.min(currentOrder.orderDiscount.value, subtotal);
      }

      if (newAmount !== currentOrder.orderDiscount.amount) {
        setOrders((prevOrders) =>
          prevOrders.map((order) => {
            if (order.id !== activeOrderId) return order;

            return {
              ...order,
              orderDiscount: order.orderDiscount ? { ...order.orderDiscount, amount: newAmount } : null,
              updatedAt: new Date(),
            };
          }),
        );
      }
    }

    if (currentOrder?.orderPromotion) {
      let newAmount = 0;
      if (currentOrder.orderPromotion.type === 'percentage') {
        newAmount = (subtotal * currentOrder.orderPromotion.value) / 100;
      } else {
        newAmount = Math.min(currentOrder.orderPromotion.value, subtotal);
      }

      if (newAmount !== currentOrder.orderPromotion.amount) {
        setOrders((prevOrders) =>
          prevOrders.map((order) => {
            if (order.id !== activeOrderId) return order;

            return {
              ...order,
              orderPromotion: order.orderPromotion ? { ...order.orderPromotion, amount: newAmount } : null,
              updatedAt: new Date(),
            };
          }),
        );
      }
    }
  };

  useEffect(() => {
    recalculateOrderDiscounts();
  }, [cart]);

  const removeDiscount = (productId: string) => {
    if (!activeOrderId) return;

    setOrders((prevOrders) =>
      prevOrders.map((order) => {
        if (order.id !== activeOrderId) return order;

        return {
          ...order,
          items: order.items.map((item) =>
            item.id === productId
              ? {
                  ...item,
                  discountCode: undefined,
                  discountPercent: undefined,
                  discountAmount: undefined,
                  finalPrice: item.price * item.quantity,
                  isManualDiscount: undefined,
                  manualDiscountType: undefined,
                  manualDiscountValue: undefined,
                }
              : item,
          ),
          updatedAt: new Date(),
        };
      }),
    );
  };

  const handleQuantityInputChange = (productId: string, value: string) => {
    setQuantityInput({ ...quantityInput, [productId]: value });
  };

  const handleQuantityInputSubmit = (productId: string) => {
    const value = quantityInput[productId];
    const quantity = parseInt(value) || 1;
    updateQuantity(productId, quantity);
    setQuantityInput({ ...quantityInput, [productId]: quantity.toString() });
  };

  // Get total amount including all discounts
  const getTotalAmount = () => {
    return cart.reduce((total, item) => {
      const itemPrice = item.finalPrice !== undefined ? item.finalPrice : item.price * item.quantity;
      return total + itemPrice;
    }, 0);
  };

  // Get subtotal before order-level discounts
  const getOrderSubtotal = () => {
    return cart.reduce((total, item) => {
      const itemPrice = item.finalPrice !== undefined ? item.finalPrice : item.price * item.quantity;
      return total + itemPrice;
    }, 0);
  };

  // Get final total after all discounts and promotions
  const getFinalOrderTotal = () => {
    const subtotal = getOrderSubtotal();
    let total = subtotal;

    if (orderDiscount) {
      total -= orderDiscount.amount;
    }

    if (orderPromotion) {
      total -= orderPromotion.amount;
    }

    const finalTotal = Math.max(total, 0);

    if (total < 0 && subtotal > 0) {
      console.warn('Total discount exceeds order subtotal');
    }

    return finalTotal;
  };

  const getTotalDiscount = () => {
    return cart.reduce((total, item) => {
      if (item.discountAmount) {
        return total + item.discountAmount * item.quantity;
      }
      return total;
    }, 0);
  };

  const getOriginalTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const renderOrderDiscountRow = React.useCallback(
    () => (
      <View style={styles.summaryRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <Text style={[styles.summaryLabel, { color: theme.colors.text }]}>Giảm giá:</Text>
          <TouchableOpacity
            onPress={() => (orderDiscount ? removeOrderDiscount() : setOrderDiscountModalVisible(true))}
            style={{
              marginLeft: 8,
              backgroundColor: orderDiscount ? '#dc3545' : theme.colors.primary,
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 4,
            }}
          >
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: '500' }}>{orderDiscount ? '✕' : '+'}</Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.summaryValue, { color: orderDiscount ? '#28a745' : theme.colors.text }]}>
          {orderDiscount ? `-${formatCurrency(orderDiscount.amount)}` : '0đ'}
        </Text>
      </View>
    ),
    [
      orderDiscount,
      styles.summaryRow,
      styles.summaryLabel,
      styles.summaryValue,
      theme.colors.text,
      theme.colors.primary,
      removeOrderDiscount,
      formatCurrency,
    ],
  );

  const renderPromotionRow = React.useCallback(
    () => (
      <View style={styles.summaryRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <Text style={[styles.summaryLabel, { color: theme.colors.text }]}>Khuyến mãi:</Text>
          <TouchableOpacity
            onPress={() => (orderPromotion ? removeOrderPromotion() : setPromotionModalVisible(true))}
            style={{
              marginLeft: 8,
              backgroundColor: orderPromotion ? '#dc3545' : theme.colors.primary,
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 4,
            }}
          >
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: '500' }}>{orderPromotion ? '✕' : '+'}</Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.summaryValue, { color: orderPromotion ? '#28a745' : theme.colors.text }]}>
          {orderPromotion ? `-${formatCurrency(orderPromotion.amount)}` : '0đ'}
        </Text>
      </View>
    ),
    [
      orderPromotion,
      styles.summaryRow,
      styles.summaryLabel,
      styles.summaryValue,
      theme.colors.text,
      theme.colors.primary,
      removeOrderPromotion,
      formatCurrency,
    ],
  );

  const renderAutoPrintToggle = React.useCallback(
    () => (
      <View style={[styles.summaryRow, { marginBottom: 16 }]}>
        <Text style={[styles.summaryLabel, { color: theme.colors.text, flex: 1 }]}>Tự động in</Text>
        <Switch
          value={autoPrint}
          onValueChange={updateAutoPrint}
          trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
          thumbColor={autoPrint ? '#fff' : '#f4f3f4'}
          ios_backgroundColor={theme.colors.border}
        />
      </View>
    ),
    [
      autoPrint,
      updateAutoPrint,
      styles.summaryRow,
      styles.summaryLabel,
      theme.colors.text,
      theme.colors.border,
      theme.colors.primary,
    ],
  );

  const renderToggleFooterButton = React.useCallback(
    (source: string) => (
      <TouchableOpacity
        onPress={() => {
          setFooterCollapsed(!footerCollapsed);
        }}
        style={{
          alignSelf: 'center',
          paddingVertical: 8,
          paddingHorizontal: 16,
          marginBottom: 8,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <Text style={[{ color: theme.colors.text, marginRight: 4, fontSize: 12 }]}>
          {footerCollapsed ? 'Hiện chi tiết' : 'Ẩn chi tiết'}
        </Text>
        <Icon
          name={footerCollapsed ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
          size={20}
          color={theme.colors.text}
        />
      </TouchableOpacity>
    ),
    [footerCollapsed, theme.colors.text],
  );

  const renderOrderSummaryDetails = React.useCallback(
    () => (
      <>
        {/* Order details when expanded */}
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: theme.colors.text }]}>Tổng tiền:</Text>
          <Text style={[styles.summaryValue, { color: theme.colors.text }]}>{formatCurrency(getOriginalTotal())}</Text>
        </View>

        {getTotalDiscount() > 0 && (
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.colors.text }]}>Giảm SP:</Text>
            <Text style={[styles.summaryValue, { color: '#28a745' }]}>-{formatCurrency(getTotalDiscount())}</Text>
          </View>
        )}

        {(orderDiscount?.amount || 0) + (orderPromotion?.amount || 0) > 0 && (
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.colors.text }]}>Tổng tiết kiệm:</Text>
            <Text style={[styles.summaryValue, { color: '#28a745' }]}>
              -{formatCurrency(getTotalDiscount() + (orderDiscount?.amount || 0) + (orderPromotion?.amount || 0))}
            </Text>
          </View>
        )}
      </>
    ),
    [
      styles.summaryRow,
      styles.summaryLabel,
      styles.summaryValue,
      theme.colors.text,
      formatCurrency,
      getOriginalTotal,
      getTotalDiscount,
      orderDiscount?.amount,
      orderPromotion?.amount,
    ],
  );

  const renderDiscountModal = React.useCallback(
    () => (
      <Modal
        visible={discountModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setDiscountModalVisible(false);
          setDiscountCode('');
          setManualDiscountValue('');
          setSelectedItemForDiscount(null);
          setDiscountType('coupon');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Giảm giá sản phẩm</Text>

            <View style={styles.discountTypeToggle}>
              <TouchableOpacity
                onPress={() => setDiscountType('coupon')}
                style={[styles.discountTypeButton, discountType === 'coupon' && styles.discountTypeButtonActive]}
              >
                <Text
                  style={[
                    styles.discountTypeButtonText,
                    discountType === 'coupon'
                      ? styles.discountTypeButtonTextActive
                      : styles.discountTypeButtonTextInactive,
                  ]}
                >
                  Mã giảm giá
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setDiscountType('manual')}
                style={[styles.discountTypeButton, discountType === 'manual' && styles.discountTypeButtonActive]}
              >
                <Text
                  style={[
                    styles.discountTypeButtonText,
                    discountType === 'manual'
                      ? styles.discountTypeButtonTextActive
                      : styles.discountTypeButtonTextInactive,
                  ]}
                >
                  Giảm thủ công
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScrollView}>
              {discountType === 'coupon' ? (
                <View>
                  <TextInput
                    style={styles.couponInput}
                    placeholder="Nhập mã giảm giá..."
                    placeholderTextColor={theme.colors.text}
                    value={discountCode}
                    onChangeText={setDiscountCode}
                    autoCapitalize="characters"
                  />

                  <View style={styles.couponListContainer}>
                    <Text style={styles.couponListTitle}>Mã giảm giá có sẵn:</Text>
                    {Object.entries(discountCodes).map(([code, details]) => (
                      <TouchableOpacity
                        key={code}
                        onPress={() => setDiscountCode(code)}
                        style={[
                          styles.couponItem,
                          discountCode === code ? styles.couponItemActive : styles.couponItemInactive,
                        ]}
                      >
                        <Text style={styles.couponCode}>{code}</Text>
                        <Text style={styles.couponName}>{details.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ) : (
                <View>
                  <View style={styles.manualDiscountSection}>
                    <Text style={styles.manualDiscountLabel}>Loại giảm giá:</Text>
                    <View style={styles.manualDiscountTypeRow}>
                      <TouchableOpacity
                        onPress={() => setManualDiscountType('percentage')}
                        style={[
                          styles.manualDiscountTypeButton,
                          manualDiscountType === 'percentage'
                            ? styles.manualDiscountTypeButtonActive
                            : styles.manualDiscountTypeButtonInactive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.manualDiscountTypeText,
                            manualDiscountType === 'percentage'
                              ? styles.manualDiscountTypeTextActive
                              : styles.manualDiscountTypeTextInactive,
                          ]}
                        >
                          Phần trăm (%)
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setManualDiscountType('fixed')}
                        style={[
                          styles.manualDiscountTypeButton,
                          manualDiscountType === 'fixed'
                            ? styles.manualDiscountTypeButtonActive
                            : styles.manualDiscountTypeButtonInactive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.manualDiscountTypeText,
                            manualDiscountType === 'fixed'
                              ? styles.manualDiscountTypeTextActive
                              : styles.manualDiscountTypeTextInactive,
                          ]}
                        >
                          Số tiền cố định
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={{ marginBottom: 16 }}>
                    <Text style={{ color: theme.colors.text, marginBottom: 8, fontSize: 16, fontWeight: '500' }}>
                      {manualDiscountType === 'percentage' ? 'Phần trăm giảm (%)' : 'Số tiền giảm (VND)'}:
                    </Text>
                    <TextInput
                      style={{
                        borderWidth: 1,
                        borderColor: theme.colors.border,
                        borderRadius: 12,
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        fontSize: 16,
                        color: theme.colors.text,
                        backgroundColor: theme.colors.background,
                      }}
                      placeholder={
                        manualDiscountType === 'percentage' ? 'Nhập % giảm (vd: 15)' : 'Nhập số tiền (vd: 50000)'
                      }
                      placeholderTextColor={theme.colors.text}
                      value={manualDiscountValue}
                      onChangeText={setManualDiscountValue}
                      keyboardType="numeric"
                    />
                    {manualDiscountType === 'percentage' && (
                      <Text style={{ color: theme.colors.text, fontSize: 12, marginTop: 4 }}>
                        Lưu ý: Phần trăm phải nhỏ hơn hoặc bằng 100%
                      </Text>
                    )}
                    {manualDiscountType === 'fixed' && selectedItemForDiscount && (
                      <Text style={{ color: theme.colors.text, fontSize: 12, marginTop: 4 }}>
                        Lưu ý: Số tiền phải nhỏ hơn hoặc bằng giá sản phẩm (
                        {formatCurrency(cart.find((item) => item.id === selectedItemForDiscount)?.price || 0)})
                      </Text>
                    )}
                  </View>
                </View>
              )}
            </ScrollView>

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
              <TouchableOpacity
                onPress={() => {
                  setDiscountModalVisible(false);
                  setDiscountCode('');
                  setManualDiscountValue('');
                  setSelectedItemForDiscount(null);
                  setDiscountType('coupon');
                }}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 12,
                  backgroundColor: theme.colors.border,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: theme.colors.text, fontWeight: '500' }}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={applyDiscount}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 12,
                  backgroundColor: theme.colors.primary,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Áp dụng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    ),
    [
      discountModalVisible,
      discountType,
      discountCode,
      manualDiscountType,
      manualDiscountValue,
      selectedItemForDiscount,
      theme.colors.text,
      styles.modalOverlay,
      styles.modalContainer,
      styles.modalTitle,
      styles.discountTypeToggle,
      styles.discountTypeButton,
      styles.discountTypeButtonActive,
      styles.discountTypeButtonText,
      styles.discountTypeButtonTextActive,
      styles.discountTypeButtonTextInactive,
      styles.modalScrollView,
      styles.couponInput,
      styles.couponListContainer,
      styles.couponListTitle,
      styles.couponItem,
      styles.couponItemActive,
      styles.couponItemInactive,
      styles.couponCode,
      styles.couponName,
      styles.manualDiscountSection,
      styles.manualDiscountLabel,
      styles.manualDiscountTypeRow,
      styles.manualDiscountTypeButton,
      styles.manualDiscountTypeButtonActive,
      styles.manualDiscountTypeButtonInactive,
      styles.manualDiscountTypeText,
      styles.manualDiscountTypeTextActive,
      styles.manualDiscountTypeTextInactive,
      styles.manualDiscountInput,
      styles.modalButtons,
      styles.modalCancelButton,
      styles.modalCancelButtonText,
      styles.modalApplyButton,
      styles.modalApplyButtonText,
      discountCodes,
      applyDiscount,
    ],
  );

  const renderOrderDiscountModal = React.useCallback(
    () => (
      <Modal
        visible={orderDiscountModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setOrderDiscountModalVisible(false);
          setOrderDiscountValue('');
          setOrderDiscountType('percentage');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Giảm giá tổng đơn</Text>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScrollView}>
              {/* Order Discount Type */}
              <View style={styles.manualDiscountSection}>
                <Text style={styles.manualDiscountLabel}>Loại giảm giá:</Text>
                <View style={styles.manualDiscountTypeRow}>
                  <TouchableOpacity
                    onPress={() => setOrderDiscountType('percentage')}
                    style={[
                      styles.manualDiscountTypeButton,
                      orderDiscountType === 'percentage'
                        ? styles.manualDiscountTypeButtonActive
                        : styles.manualDiscountTypeButtonInactive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.manualDiscountTypeText,
                        orderDiscountType === 'percentage'
                          ? styles.manualDiscountTypeTextActive
                          : styles.manualDiscountTypeTextInactive,
                      ]}
                    >
                      Phần trăm (%)
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setOrderDiscountType('fixed')}
                    style={[
                      styles.manualDiscountTypeButton,
                      orderDiscountType === 'fixed'
                        ? styles.manualDiscountTypeButtonActive
                        : styles.manualDiscountTypeButtonInactive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.manualDiscountTypeText,
                        orderDiscountType === 'fixed'
                          ? styles.manualDiscountTypeTextActive
                          : styles.manualDiscountTypeTextInactive,
                      ]}
                    >
                      Số tiền cố định
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Order Discount Value Input */}
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: theme.colors.text, marginBottom: 8, fontSize: 16, fontWeight: '500' }}>
                  {orderDiscountType === 'percentage' ? 'Phần trăm giảm (%)' : 'Số tiền giảm (VND)'}:
                </Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    fontSize: 16,
                    color: theme.colors.text,
                    backgroundColor: theme.colors.background,
                  }}
                  placeholder={orderDiscountType === 'percentage' ? 'Nhập % giảm (vd: 15)' : 'Nhập số tiền (vd: 50000)'}
                  placeholderTextColor={theme.colors.text}
                  value={orderDiscountValue}
                  onChangeText={setOrderDiscountValue}
                  keyboardType="numeric"
                />
                {orderDiscountType === 'percentage' && (
                  <Text style={{ color: theme.colors.text, fontSize: 12, marginTop: 4 }}>
                    Lưu ý: Phần trăm phải nhỏ hơn hoặc bằng 100%
                  </Text>
                )}
                {orderDiscountType === 'fixed' && (
                  <Text style={{ color: theme.colors.text, fontSize: 12, marginTop: 4 }}>
                    Lưu ý: Số tiền phải nhỏ hơn hoặc bằng tổng tiền hàng ({formatCurrency(getOrderSubtotal())})
                  </Text>
                )}
              </View>
            </ScrollView>

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
              <TouchableOpacity
                onPress={() => {
                  setOrderDiscountModalVisible(false);
                  setOrderDiscountValue('');
                  setOrderDiscountType('percentage');
                }}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 12,
                  backgroundColor: theme.colors.border,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: theme.colors.text, fontWeight: '500' }}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={applyOrderDiscount}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 12,
                  backgroundColor: theme.colors.primary,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Áp dụng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    ),
    [
      orderDiscountModalVisible,
      orderDiscountType,
      orderDiscountValue,
      theme.colors.text,
      styles.modalOverlay,
      styles.modalContainer,
      styles.modalTitle,
      styles.modalScrollView,
      styles.manualDiscountSection,
      styles.manualDiscountLabel,
      styles.manualDiscountTypeRow,
      styles.manualDiscountTypeButton,
      styles.manualDiscountTypeButtonActive,
      styles.manualDiscountTypeButtonInactive,
      styles.manualDiscountTypeText,
      styles.manualDiscountTypeTextActive,
      styles.manualDiscountTypeTextInactive,
      styles.manualDiscountInput,
      styles.modalButtons,
      styles.modalCancelButton,
      styles.modalCancelButtonText,
      styles.modalApplyButton,
      styles.modalApplyButtonText,
      applyOrderDiscount,
    ],
  );

  const renderPromotionModal = React.useCallback(
    () => (
      <Modal
        visible={promotionModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setPromotionModalVisible(false);
          setPromotionCode('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Mã khuyến mãi</Text>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScrollView}>
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: theme.colors.text, marginBottom: 8, fontSize: 16, fontWeight: '500' }}>
                  Mã khuyến mãi:
                </Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    fontSize: 16,
                    color: theme.colors.text,
                    backgroundColor: theme.colors.background,
                  }}
                  placeholder="Nhập mã khuyến mãi..."
                  placeholderTextColor={theme.colors.text}
                  value={promotionCode}
                  onChangeText={setPromotionCode}
                  autoCapitalize="characters"
                />
              </View>

              <View style={styles.couponListContainer}>
                <Text style={styles.couponListTitle}>Mã khuyến mãi có sẵn:</Text>
                {[
                  { code: 'SUMMER2024', name: 'Ưu đãi mùa hè - Giảm 15%' },
                  { code: 'NEWUSER', name: 'Khách hàng mới - Giảm 50K' },
                  { code: 'VIP100', name: 'VIP - Giảm 100K' },
                  { code: 'PERCENT20', name: 'Giảm 20%' },
                ].map((promo) => (
                  <TouchableOpacity
                    key={promo.code}
                    onPress={() => setPromotionCode(promo.code)}
                    style={[
                      styles.couponItem,
                      promotionCode === promo.code ? styles.couponItemActive : styles.couponItemInactive,
                    ]}
                  >
                    <Text style={styles.couponCode}>{promo.code}</Text>
                    <Text style={styles.couponName}>{promo.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
              <TouchableOpacity
                onPress={() => {
                  setPromotionModalVisible(false);
                  setPromotionCode('');
                }}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 12,
                  backgroundColor: theme.colors.border,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: theme.colors.text, fontWeight: '500' }}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={applyPromotion}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 12,
                  backgroundColor: theme.colors.primary,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Áp dụng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    ),
    [
      promotionModalVisible,
      promotionCode,
      theme.colors.text,
      styles.modalOverlay,
      styles.modalContainer,
      styles.modalTitle,
      styles.modalScrollView,
      styles.couponInput,
      styles.modalButtons,
      styles.modalCancelButton,
      styles.modalCancelButtonText,
      styles.modalApplyButton,
      styles.modalApplyButtonText,
      applyPromotion,
    ],
  );

  const renderCartBottomSheet = () => {
    const renderCartHeader = () => (
      <View>
        {/* Order Tabs */}
        <View style={styles.cartModalOrderTabs}>{renderOrderTabs()}</View>

        <View style={styles.cartModalHeader}>
          <Text style={[styles.cartModalTitle, { color: theme.colors.text }]}>
            {getCurrentOrder()?.name || 'Giỏ hàng'}
          </Text>
        </View>
      </View>
    );

    const renderCartFooter = () => (
      <View style={[styles.cartModalPayment, { borderTopColor: theme.colors.border }]}>
        {/* Collapsible footer toggle */}
        {renderToggleFooterButton('BottomSheet')}

        {/* Collapsible section - Order Discount, Promotion, Auto Print */}
        {!footerCollapsed && (
          <>
            {/* Order Discount Row */}
            {renderOrderDiscountRow()}

            {/* Promotion Row */}
            {renderPromotionRow()}

            {/* Auto Print Toggle */}
            {renderAutoPrintToggle()}

            {/* Order details when expanded */}
            {renderOrderSummaryDetails()}
          </>
        )}

        {/* Total and Checkout Button - always visible */}
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: theme.colors.text, fontWeight: 'bold' }]}>Khách phải trả:</Text>
          <Text style={[styles.summaryValue, { color: theme.colors.primary, fontWeight: 'bold' }]}>
            {formatCurrency(getFinalOrderTotal())}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.checkoutButton,
            { backgroundColor: theme.colors.primary, opacity: cart.length === 0 ? 0.6 : 1 },
          ]}
          onPress={() => {
            handleCheckout();
            setCartBottomSheetVisible(false);
          }}
          disabled={cart.length === 0}
        >
          <Text style={styles.checkoutButtonText}>Thanh toán</Text>
        </TouchableOpacity>
      </View>
    );

    const renderEmptyCart = () => (
      <View style={styles.emptyCartContainer}>
        <Text style={styles.emptyCartText}>Giỏ hàng trống{'\n'}Vui lòng thêm sản phẩm</Text>
      </View>
    );

    return (
      cartBottomSheetVisible && (
        <BottomSheetModal
          isVisible={cartBottomSheetVisible}
          onClose={() => setCartBottomSheetVisible(false)}
          componentView="BottomSheetFlatList"
          data={cart}
          renderItem={renderCartItem}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderCartHeader}
          ListEmptyComponent={renderEmptyCart}
          renderFooter={renderCartFooter}
          firstPointIndex={1}
          scrollEnabled
        />
      )
    );
  };

  // Variation Picker Modal
  const renderVariationModal = React.useCallback(() => {
    if (!variationModalVisible || !productForVariation) return null;

    // Attributes used for variation
    const attrs = productForVariation.attributes?.filter((a) => a.variation) || [];

    const getTermsFromGlobal = (slug: string) => {
      const globalAttr = attributes?.data?.find((a: any) => a.slug === slug);
      return globalAttr?.terms || [];
    };

    // Build selected slug map for already chosen attributes
    const selectedBySlug: Record<string, string> = {};
    attrs.forEach((a) => {
      const human = selectedVariations[a.slug];
      if (!human) return;
      const terms = getTermsFromGlobal(a.slug);
      const term = terms.find((t: any) => t.name === human);
      const slugVal = term?.slug || human.toString().toLowerCase().replace(/\s+/g, '-');
      selectedBySlug[a.slug] = slugVal;
    });

    const allSelected = attrs.every((a) => !!selectedVariations[a.slug]);

    // Try to find matching variation when user has selected all attributes
    const matchingVariation = allSelected
      ? productForVariation.variations?.find((v) =>
          attrs.every((a) => v.attributes?.[a.slug] === selectedBySlug[a.slug]),
        )
      : null;

    const onConfirm = () => {
      if (!allSelected) {
        Alert.alert('Thông báo', 'Vui lòng chọn đầy đủ thuộc tính');
        return;
      }
      if (!matchingVariation) {
        Alert.alert('Không tìm thấy biến thể', 'Tổ hợp thuộc tính không có sẵn. Vui lòng chọn lại.');
        return;
      }
      addSelectedVariantToCart(productForVariation, matchingVariation.id, selectedVariations);
      setVariationModalVisible(false);
      setProductForVariation(null);
      setSelectedVariations({});
    };

    return (
      <Modal
        transparent
        visible={variationModalVisible}
        animationType="fade"
        onRequestClose={() => setVariationModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContainer,
              {
                maxHeight: '85%',
                paddingBottom: 20,
                paddingTop: 20,
              },
            ]}
          >
            <Text style={[styles.modalTitle, { color: theme.colors.text, marginBottom: 12 }]}>Chọn biến thể</Text>

            {/* Preview box */}
            <View
              style={{
                flexDirection: 'row',
                padding: 12,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.cardBackground,
                marginBottom: 16,
              }}
            >
              <View
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: 10,
                  overflow: 'hidden',
                  backgroundColor: theme.colors.background,
                  marginRight: 14,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Image
                  source={
                    matchingVariation?.image ||
                    productForVariation.img_url ||
                    productForVariation.images?.[0]?.src ||
                    ''
                  }
                  style={{ width: 70, height: 70 }}
                  resizeMode="cover"
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: theme.colors.text,
                    fontSize: 15,
                    fontWeight: '600',
                    marginBottom: 4,
                  }}
                  numberOfLines={2}
                >
                  {productForVariation.name}
                </Text>
                <Text
                  style={{
                    color: theme.colors.text,
                    fontSize: 12,
                    opacity: 0.75,
                    marginBottom: 6,
                  }}
                  numberOfLines={2}
                >
                  {Object.values(selectedVariations).length > 0
                    ? Object.values(selectedVariations).join(' • ')
                    : 'Chọn thuộc tính để xem giá'}
                </Text>
                <Text
                  style={{
                    color: matchingVariation ? theme.colors.primary : theme.colors.text,
                    fontSize: 16,
                    fontWeight: '700',
                  }}
                >
                  {matchingVariation
                    ? formatCurrency(Number(matchingVariation.price || productForVariation.price || 0))
                    : '—'}
                </Text>
              </View>
            </View>

            <ScrollView style={[styles.modalScrollView, { paddingTop: 4 }]} showsVerticalScrollIndicator={false}>
              {attrs.map((a) => {
                const terms = getTermsFromGlobal(a.slug);
                const options = terms.length > 0 ? terms.map((t: any) => t.name) : a.options;
                const current = selectedVariations[a.slug];
                return (
                  <View key={a.slug} style={{ marginBottom: 18 }}>
                    <Text style={{ color: theme.colors.text, marginBottom: 10, fontWeight: '500', fontSize: 14 }}>
                      {a.name}
                    </Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 }}>
                      {options.map((opt: string) => {
                        const selected = current === opt;
                        return (
                          <TouchableOpacity
                            key={opt}
                            onPress={() =>
                              setSelectedVariations((prev) => {
                                const next = { ...prev } as Record<string, string>;
                                if (next[a.slug] === opt) {
                                  delete next[a.slug];
                                } else {
                                  next[a.slug] = opt;
                                }
                                return next;
                              })
                            }
                            style={{
                              paddingVertical: 10,
                              paddingHorizontal: 14,
                              borderRadius: 22,
                              borderWidth: 1,
                              margin: 4,
                              minHeight: 40,
                              justifyContent: 'center',
                              borderColor: selected ? theme.colors.primary : theme.colors.border,
                              backgroundColor: selected ? theme.colors.primary : theme.colors.cardBackground,
                              shadowColor: '#000',
                              shadowOpacity: selected ? 0.25 : 0,
                              shadowOffset: { width: 0, height: 2 },
                              shadowRadius: 4,
                            }}
                            activeOpacity={0.8}
                          >
                            <Text
                              style={{
                                color: selected ? '#fff' : theme.colors.text,
                                fontWeight: '500',
                                fontSize: 13,
                              }}
                            >
                              {opt}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                );
              })}
            </ScrollView>

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
              <TouchableOpacity
                onPress={() => {
                  setVariationModalVisible(false);
                  setProductForVariation(null);
                  setSelectedVariations({});
                }}
                style={[styles.modalCancelButton, { flex: 1, backgroundColor: theme.colors.border, borderRadius: 14 }]}
                activeOpacity={0.7}
              >
                <Text style={[styles.modalCancelButtonText, { color: theme.colors.text, fontWeight: '500' }]}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onConfirm}
                disabled={!allSelected || !matchingVariation}
                style={[
                  styles.modalApplyButton,
                  {
                    flex: 1,
                    borderRadius: 14,
                    backgroundColor: theme.colors.primary,
                    opacity: !allSelected || !matchingVariation ? 0.5 : 1,
                  },
                ]}
                activeOpacity={0.8}
              >
                <Text style={[styles.modalApplyButtonText, { fontWeight: '700' }]}>
                  {matchingVariation ? 'Thêm vào giỏ' : allSelected ? 'Không có biến thể' : 'Chọn thuộc tính'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }, [variationModalVisible, productForVariation, selectedVariations, attributes?.data, theme.colors, formatCurrency]);

  // Reset quick add form
  const resetQuickAddForm = () => {
    setQuickAddData({
      name: '',
      sku: '',
      regularPrice: '',
      salePrice: '',
      manageStock: false,
      stockQuantity: '',
    });
  };

  // Handle quick add product
  const handleQuickAddProduct = () => {
    // Validate required fields
    if (!quickAddData.name.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên sản phẩm');
      return;
    }

    if (!quickAddData.regularPrice.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập giá bán thường');
      return;
    }

    const regularPrice = parseFloat(quickAddData.regularPrice);
    if (isNaN(regularPrice) || regularPrice <= 0) {
      Alert.alert('Lỗi', 'Giá bán thường phải là số dương');
      return;
    }

    const salePrice = quickAddData.salePrice.trim() ? parseFloat(quickAddData.salePrice) : null;
    if (salePrice !== null && (isNaN(salePrice) || salePrice < 0)) {
      Alert.alert('Lỗi', 'Giá khuyến mãi phải là số không âm');
      return;
    }

    if (salePrice !== null && salePrice >= regularPrice) {
      Alert.alert('Lỗi', 'Giá khuyến mãi phải nhỏ hơn giá bán thường');
      return;
    }

    const stockQuantity = quickAddData.manageStock ? parseInt(quickAddData.stockQuantity) : null;
    if (quickAddData.manageStock && (isNaN(stockQuantity!) || stockQuantity! < 0)) {
      Alert.alert('Lỗi', 'Số lượng tồn kho phải là số không âm');
      return;
    }

    // Create temporary product object
    const newProduct: Product = {
      id: `temp_${Date.now()}`,
      name: quickAddData.name.trim(),
      price: salePrice || regularPrice,
      stock_quantity: stockQuantity || 999,
      stock_status: quickAddData.manageStock ? (stockQuantity! > 0 ? 'instock' : 'outofstock') : 'instock',
      img_url: '',
      images: [],
      type: 'simple',
      categories: [],
      attributes: [],
      variations: [],
    };

    // Add to cart
    addToCart(newProduct);

    // Show success message
    toastSuccess(`Đã thêm "${newProduct.name}" vào giỏ hàng`);

    // Close modal and reset form
    setQuickAddModalVisible(false);
    resetQuickAddForm();
  };

  const playSuccessSound = async () => {
    try {
      console.log('Barcode scanned successfully');
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  };

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;
    setScanned(true);
    await playSuccessSound();

    const product = dataProducts?.data?.find(
      (p: any) => p.sku === data || p.id === data || p.name.toLowerCase().includes(data.toLowerCase()),
    );

    if (product) {
      addToCart(product);
      toastSuccess(`Đã thêm "${product.name}" vào giỏ hàng`);
    } else {
      setQuickAddData((prev) => ({
        ...prev,
        sku: data,
        name: `Sản phẩm ${data}`,
      }));
      setBarcodeScannerVisible(false);
      setQuickAddModalVisible(true);
      toastInfo(`Không tìm thấy sản phẩm với mã "${data}". Mở form thêm nhanh.`);
    }

    // Reset scanner after 1 second
    setTimeout(() => {
      setScanned(false);
    }, 1000);
  };

  const toggleCamera = () => {
    setCameraEnabled(!cameraEnabled);
    if (scanned) {
      setScanned(false);
    }
  };

  const openBarcodeScanner = async () => {
    if (!cameraPermission?.granted) {
      const result = await requestCameraPermission();
      if (!result.granted) {
        Alert.alert('Lỗi', 'Cần quyền truy cập camera để quét mã vạch');
        return;
      }
    }
    setBarcodeScannerVisible(true);
    setCameraEnabled(true);
    setScanned(false);
  };

  const closeBarcodeScanner = () => {
    setBarcodeScannerVisible(false);
    setCameraEnabled(false);
    setScanned(false);
  };

  // Handle pull to refresh
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      // Refresh all data concurrently
      await Promise.all([refreshProducts(), refreshCategories(), refreshAttributes(), refreshCustomer()]);
      toastSuccess('Đã cập nhật dữ liệu');
    } catch (error) {
      console.error('Error refreshing data:', error);
      toastWarning('Có lỗi khi cập nhật dữ liệu');
    } finally {
      setRefreshing(false);
    }
  }, [refreshProducts, refreshCategories, refreshAttributes, refreshCustomer]);

  // Filter customers based on search query
  const filteredCustomers = React.useMemo(() => {
    if (!customers?.data) return [];
    if (!customerSearchQuery.trim()) {
      return customers.data.slice(0, 20);
    }

    return customers.data.filter(
      (customer: any) =>
        customer.display_name?.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
        customer.user_email?.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
        customer.phone?.includes(customerSearchQuery) ||
        customer.user_login?.toLowerCase().includes(customerSearchQuery.toLowerCase()),
    );
  }, [customers?.data, customerSearchQuery]);

  // Render Customer Select Component
  const renderCustomerSelect = React.useCallback(() => {
    return (
      <View style={{ marginBottom: 16 }}>
        <Text style={[{ color: theme.colors.text, fontSize: 14, fontWeight: '500', marginBottom: 8 }]}>Khách hàng</Text>

        <TouchableOpacity
          style={{
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 10,
            backgroundColor: theme.colors.cardBackground,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
          onPress={() => setCustomerDropdownVisible(true)}
        >
          <View style={{ flex: 1 }}>
            {selectedCustomer ? (
              <View>
                <Text style={[{ color: theme.colors.text, fontSize: 14, fontWeight: '500' }]}>
                  {selectedCustomer.display_name}
                </Text>
                {selectedCustomer.user_email && (
                  <Text style={[{ color: theme.colors.text, fontSize: 12, opacity: 0.7 }]}>
                    {selectedCustomer.user_email}
                  </Text>
                )}
                {selectedCustomer.phone && (
                  <Text style={[{ color: theme.colors.text, fontSize: 12, opacity: 0.7 }]}>
                    📞 {selectedCustomer.phone}
                  </Text>
                )}
              </View>
            ) : (
              <Text style={[{ color: theme.colors.text, opacity: 0.5 }]}>Chọn khách hàng...</Text>
            )}
          </View>

          <Icon name="keyboard-arrow-down" size={20} color={theme.colors.text} />
        </TouchableOpacity>

        {/* Customer Dropdown Modal */}
        <Modal
          visible={customerDropdownVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => {
            setCustomerDropdownVisible(false);
            setCustomerSearchQuery('');
          }}
        >
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.5)',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            activeOpacity={1}
            onPress={() => {
              setCustomerDropdownVisible(false);
              setCustomerSearchQuery('');
            }}
          >
            <TouchableOpacity
              style={{
                width: '90%',
                maxWidth: 400,
                maxHeight: '80%',
                backgroundColor: theme.colors.background,
                borderRadius: 12,
                padding: 20,
              }}
              activeOpacity={1}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 16,
                }}
              >
                <Text style={[{ color: theme.colors.text, fontSize: 18, fontWeight: '600' }]}>Chọn khách hàng</Text>
                <TouchableOpacity
                  onPress={() => {
                    setCustomerDropdownVisible(false);
                    setCustomerSearchQuery('');
                  }}
                >
                  <Icon name="close" size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>

              {/* Search Input */}
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  fontSize: 14,
                  color: theme.colors.text,
                  backgroundColor: theme.colors.cardBackground,
                  marginBottom: 16,
                }}
                placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
                placeholderTextColor={theme.colors.text + '60'}
                value={customerSearchQuery}
                onChangeText={setCustomerSearchQuery}
                autoFocus
              />

              {/* Clear Selection Option */}
              <TouchableOpacity
                style={{
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: theme.colors.border,
                  backgroundColor: selectedCustomer === null ? theme.colors.primary + '20' : 'transparent',
                }}
                onPress={() => {
                  setSelectedCustomer(null);
                  updateOrderCustomer(null);
                  setCustomerDropdownVisible(false);
                  setCustomerSearchQuery('');
                }}
              >
                <Text
                  style={[
                    {
                      color: selectedCustomer === null ? theme.colors.primary : theme.colors.text,
                      fontSize: 14,
                      fontStyle: 'italic',
                    },
                  ]}
                >
                  Khách vãng lai (không chọn khách hàng)
                </Text>
              </TouchableOpacity>

              {/* Customer List */}
              <ScrollView style={{ maxHeight: DIMENSIONS.SCREEN_HEIGHT * 0.5 }} showsVerticalScrollIndicator={false}>
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer: any, index: number) => (
                    <TouchableOpacity
                      key={index}
                      style={{
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                        borderBottomWidth: 1,
                        borderBottomColor: theme.colors.border,
                        backgroundColor:
                          selectedCustomer?.ID === customer.ID ? theme.colors.primary + '20' : 'transparent',
                      }}
                      onPress={() => {
                        setSelectedCustomer(customer);
                        updateOrderCustomer(customer);
                        setCustomerDropdownVisible(false);
                        setCustomerSearchQuery('');
                      }}
                    >
                      <View style={{ height: 50, flexDirection: 'column' }}>
                        <Text
                          style={[
                            {
                              color: selectedCustomer?.ID === customer.ID ? theme.colors.primary : theme.colors.text,
                              fontSize: 14,
                              fontWeight: '500',
                            },
                          ]}
                        >
                          {customer.display_name}
                        </Text>

                        {customer.user_email && (
                          <Text
                            style={[
                              {
                                color: theme.colors.text,
                                fontSize: 12,
                                opacity: 0.7,
                                marginTop: 2,
                              },
                            ]}
                          >
                            📧 {customer.user_email}
                          </Text>
                        )}

                        {customer.phone && (
                          <Text
                            style={[
                              {
                                color: theme.colors.text,
                                fontSize: 12,
                                opacity: 0.7,
                                marginTop: 2,
                              },
                            ]}
                          >
                            📞 {customer.phone}
                          </Text>
                        )}

                        {/* Show additional info */}
                        <View style={{ flexDirection: 'row', marginTop: 4, gap: 12 }}>
                          <Text
                            style={[
                              {
                                color: theme.colors.text,
                                fontSize: 11,
                                opacity: 0.6,
                              },
                            ]}
                          >
                            {customer.total_order} đơn
                          </Text>
                          <Text
                            style={[
                              {
                                color: theme.colors.primary,
                                fontSize: 11,
                                fontWeight: '500',
                              },
                            ]}
                          >
                            {formatCurrency(customer.total_spent)}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={{ padding: 20, alignItems: 'center' }}>
                    <Text style={[{ color: theme.colors.text, opacity: 0.7 }]}>
                      {customerSearchQuery ? 'Không tìm thấy khách hàng' : 'Đang tải...'}
                    </Text>
                  </View>
                )}
              </ScrollView>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  }, [theme.colors, selectedCustomer, customerDropdownVisible, customerSearchQuery, filteredCustomers]);

  // Render Barcode Scanner Modal
  const renderBarcodeScannerModal = React.useCallback(() => {
    if (!cameraPermission) {
      return null;
    }

    return (
      <Modal
        visible={barcodeScannerVisible}
        transparent={true}
        animationType="none"
        onRequestClose={closeBarcodeScanner}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { maxHeight: '80%', minHeight: 500 }]}>
            {/* Header */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20,
              }}
            >
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Quét mã vạch sản phẩm</Text>
              <TouchableOpacity onPress={closeBarcodeScanner}>
                <Icon name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            {/* Camera Container */}
            <View
              style={{
                height: 300,
                borderRadius: 12,
                overflow: 'hidden',
                backgroundColor: theme.colors.background,
                marginBottom: 20,
              }}
            >
              {cameraEnabled && cameraPermission.granted ? (
                <>
                  <CameraView
                    style={{ flex: 1 }}
                    onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                    barcodeScannerSettings={{
                      barcodeTypes: ['qr', 'code128', 'code39', 'ean13', 'ean8', 'upc_a', 'upc_e'],
                    }}
                  />
                  {/* Scan Overlay */}
                  <View
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <View
                      style={{
                        width: 200,
                        height: 200,
                        borderWidth: 2,
                        borderColor: theme.colors.primary,
                        borderRadius: 12,
                        backgroundColor: 'transparent',
                      }}
                    />
                  </View>
                </>
              ) : (
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: theme.colors.border,
                  }}
                >
                  <Icon name="camera" size={48} color={theme.colors.text} />
                  <Text style={{ color: theme.colors.text, fontSize: 14, marginTop: 12, textAlign: 'center' }}>
                    {!cameraPermission.granted ? 'Cần quyền truy cập camera' : 'Camera đã tắt'}
                  </Text>
                </View>
              )}
            </View>

            {/* Info Text */}
            <Text
              style={{
                color: theme.colors.text,
                fontSize: 14,
                textAlign: 'center',
                marginBottom: 20,
                opacity: 0.7,
              }}
            >
              Đưa mã vạch vào khung để quét
            </Text>

            {/* Controls */}
            <View style={{ gap: 12 }}>
              {!cameraPermission.granted ? (
                <TouchableOpacity
                  style={{
                    backgroundColor: theme.colors.primary,
                    paddingVertical: 12,
                    borderRadius: 12,
                    alignItems: 'center',
                  }}
                  onPress={requestCameraPermission}
                >
                  <Text style={{ color: '#fff', fontWeight: '600' }}>Cấp quyền camera</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={{
                    backgroundColor: cameraEnabled ? '#dc3545' : theme.colors.primary,
                    paddingVertical: 12,
                    borderRadius: 12,
                    alignItems: 'center',
                  }}
                  onPress={toggleCamera}
                >
                  <Text style={{ color: '#fff', fontWeight: '600' }}>{cameraEnabled ? 'Tắt Camera' : 'Mở Camera'}</Text>
                </TouchableOpacity>
              )}

              {scanned && (
                <Text
                  style={{
                    color: '#28a745',
                    fontSize: 14,
                    textAlign: 'center',
                    fontWeight: '500',
                  }}
                >
                  Quét thành công! Đang xử lý...
                </Text>
              )}
            </View>
          </View>
        </View>
      </Modal>
    );
  }, [barcodeScannerVisible, cameraEnabled, scanned, cameraPermission, theme.colors]);

  // Render Quick Add Product Modal
  const renderQuickAddModal = React.useCallback(() => {
    return (
      <Modal
        visible={quickAddModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setQuickAddModalVisible(false);
          resetQuickAddForm();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { maxHeight: '90%' }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Thêm sản phẩm</Text>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScrollView}>
              {/* Product Name */}
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: theme.colors.text, marginBottom: 8, fontWeight: '500' }}>
                  Tên sản phẩm <Text style={{ color: '#ff4444' }}>*</Text>
                </Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    fontSize: 16,
                    color: theme.colors.text,
                    backgroundColor: theme.colors.background,
                  }}
                  placeholder="Nhập tên sản phẩm..."
                  placeholderTextColor={theme.colors.text + '60'}
                  value={quickAddData.name}
                  onChangeText={(text) => setQuickAddData({ ...quickAddData, name: text })}
                />
              </View>

              {/* SKU */}
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: theme.colors.text, marginBottom: 8, fontWeight: '500' }}>Mã SKU</Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    fontSize: 16,
                    color: theme.colors.text,
                    backgroundColor: theme.colors.background,
                  }}
                  placeholder="Nhập mã SKU (tự động tạo nếu để trống)"
                  placeholderTextColor={theme.colors.text + '60'}
                  value={quickAddData.sku}
                  onChangeText={(text) => setQuickAddData({ ...quickAddData, sku: text })}
                />
              </View>

              {/* Regular Price */}
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: theme.colors.text, marginBottom: 8, fontWeight: '500' }}>
                  Giá bán thường <Text style={{ color: '#ff4444' }}>*</Text>
                </Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    fontSize: 16,
                    color: theme.colors.text,
                    backgroundColor: theme.colors.background,
                  }}
                  placeholder="Nhập giá bán thường..."
                  placeholderTextColor={theme.colors.text + '60'}
                  value={quickAddData.regularPrice}
                  onChangeText={(text) => setQuickAddData({ ...quickAddData, regularPrice: text })}
                  keyboardType="numeric"
                />
              </View>

              {/* Sale Price */}
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: theme.colors.text, marginBottom: 8, fontWeight: '500' }}>Giá khuyến mãi</Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    fontSize: 16,
                    color: theme.colors.text,
                    backgroundColor: theme.colors.background,
                  }}
                  placeholder="Nhập giá khuyến mãi (tùy chọn)"
                  placeholderTextColor={theme.colors.text + '60'}
                  value={quickAddData.salePrice}
                  onChangeText={(text) => setQuickAddData({ ...quickAddData, salePrice: text })}
                  keyboardType="numeric"
                />
              </View>

              {/* Manage Stock Toggle */}
              <View style={{ marginBottom: 16 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ color: theme.colors.text, fontWeight: '500' }}>Quản lý tồn kho</Text>
                  <Switch
                    value={quickAddData.manageStock}
                    onValueChange={(value) =>
                      setQuickAddData({
                        ...quickAddData,
                        manageStock: value,
                        stockQuantity: value ? quickAddData.stockQuantity : '',
                      })
                    }
                    trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                    thumbColor={quickAddData.manageStock ? '#fff' : '#f4f3f4'}
                    ios_backgroundColor={theme.colors.border}
                  />
                </View>

                {quickAddData.manageStock && (
                  <TextInput
                    style={{
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      fontSize: 16,
                      color: theme.colors.text,
                      backgroundColor: theme.colors.background,
                    }}
                    placeholder="Nhập số lượng tồn kho..."
                    placeholderTextColor={theme.colors.text + '60'}
                    value={quickAddData.stockQuantity}
                    onChangeText={(text) => setQuickAddData({ ...quickAddData, stockQuantity: text })}
                    keyboardType="numeric"
                  />
                )}
              </View>
            </ScrollView>

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
              <TouchableOpacity
                onPress={() => {
                  setQuickAddModalVisible(false);
                  resetQuickAddForm();
                }}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 12,
                  backgroundColor: theme.colors.border,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: theme.colors.text, fontWeight: '500' }}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleQuickAddProduct}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 12,
                  backgroundColor: theme.colors.primary,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '600' }}>Thêm sản phẩm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }, [quickAddModalVisible, quickAddData, theme.colors]);

  // Process checkout and reset current order
  const handleCheckout = () => {
    if (!activeOrderId || cart.length === 0) return;

    const originalTotal = getOriginalTotal();
    const itemDiscountTotal = getTotalDiscount();
    const orderDiscountAmount = orderDiscount?.amount || 0;
    const promotionAmount = orderPromotion?.amount || 0;
    const finalTotal = getFinalOrderTotal();

    let message = `Thanh toán thành công!\n\nTổng hóa đơn: ${formatCurrency(finalTotal)}`;

    // Add customer info if available
    const currentOrder = getCurrentOrder();
    if (currentOrder?.customer) {
      const customer = currentOrder.customer;
      message += `\nKhách hàng: ${customer.display_name}`;
      if (customer.user_email) {
        message += `\nEmail: ${customer.user_email}`;
      }
      if (customer.phone) {
        message += `\nSĐT: ${customer.phone}`;
      }
    }

    if (itemDiscountTotal > 0 || orderDiscountAmount > 0 || promotionAmount > 0) {
      message += `\nTổng gốc: ${formatCurrency(originalTotal)}`;

      if (itemDiscountTotal > 0) {
        message += `\nGiảm giá sản phẩm: ${formatCurrency(itemDiscountTotal)}`;
      }

      if (orderDiscountAmount > 0) {
        const discountText =
          orderDiscount?.type === 'percentage' ? `${orderDiscount.value}%` : formatCurrency(orderDiscount?.value || 0);
        message += `\nGiảm giá đơn hàng (${discountText}): ${formatCurrency(orderDiscountAmount)}`;
      }

      if (promotionAmount > 0) {
        message += `\nKhuyến mãi (${orderPromotion?.code}): ${formatCurrency(promotionAmount)}`;
      }

      const totalSavings = itemDiscountTotal + orderDiscountAmount + promotionAmount;
      message += `\nTổng tiết kiệm: ${formatCurrency(totalSavings)}`;
    }

    if (autoPrint) {
      message += '\n\n🖨️ Đang in hóa đơn...';
      // Here you would integrate with your printing service
    }

    toastSuccess(message);

    // Reset current order instead of all orders
    setOrders((prevOrders) =>
      prevOrders.map((order) => {
        if (order.id !== activeOrderId) return order;

        return {
          ...order,
          items: [],
          orderDiscount: null,
          orderPromotion: null,
          customer: null,
          updatedAt: new Date(),
        };
      }),
    );

    setQuantityInput({});
    setFooterCollapsed(false);
  };

  const renderProductItem = React.useCallback(
    ({ item, detail = false }: { item: Product; detail?: boolean }) => (
      <TouchableOpacity style={[styles.productCard]} onPress={() => addToCart(item)}>
        <Image source={item.img_url || ''} width={100} />
        <Text style={[styles.productName, { color: theme.colors.text }]}>{item.name}</Text>
        <Text style={[styles.productPrice, { color: theme.colors.primary }]}>{formatCurrency(item.price)}</Text>
        <Text style={[styles.productStock, { color: theme.colors.text }]}>
          Kho: {item.stock_quantity && item.stock_quantity !== 0 ? item.stock_quantity : item.stock_status}
        </Text>
      </TouchableOpacity>
    ),
    [
      theme.colors.text,
      theme.colors.primary,
      addToCart,
      formatCurrency,
      styles.productCard,
      styles.productName,
      styles.productPrice,
      styles.productStock,
    ],
  );

  const renderProductItemList = React.useCallback(
    ({ item }: { item: Product }) => (
      <TouchableOpacity style={[styles.productCardList]} onPress={() => addToCart(item)}>
        <View style={styles.productListContent}>
          <Image source={item.img_url || item.images[0]?.src || ''} style={{ marginRight: 10 }} />
          <View style={styles.productListInfo}>
            <Text style={[styles.productNameList, { color: theme.colors.text }]}>{item.name}</Text>
            <Text style={[styles.productStockList, { color: theme.colors.text }]}>
              Kho: {item.stock_quantity && item.stock_quantity !== 0 ? item.stock_quantity : item.stock_status}
            </Text>
          </View>
          <Text style={[styles.productPriceList, { color: theme.colors.primary }]}>{formatCurrency(item.price)}</Text>
        </View>
      </TouchableOpacity>
    ),
    [
      theme.colors.text,
      theme.colors.primary,
      addToCart,
      formatCurrency,
      styles.productCardList,
      styles.productListContent,
      styles.productListInfo,
      styles.productNameList,
      styles.productStockList,
      styles.productPriceList,
    ],
  );

  // Render Order Tabs component
  const renderOrderTabs = React.useCallback(() => {
    return (
      <View style={styles.orderTabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.orderTabsScrollView}>
          {orders.map((order, index) => (
            <TouchableOpacity
              key={order.id}
              style={[
                styles.orderTab,
                {
                  backgroundColor: activeOrderId === order.id ? theme.colors.primary : theme.colors.cardBackground,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={() => switchToOrder(order.id)}
              activeOpacity={0.8}
              delayPressIn={0} // Immediate feedback for tab switch
            >
              <View style={styles.orderTabContent}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <Text
                    style={[styles.orderTabText, { color: activeOrderId === order.id ? '#fff' : theme.colors.text }]}
                  >
                    {order.name}
                  </Text>
                  {order.items.length > 0 && (
                    <View
                      style={[
                        styles.orderTabBadge,
                        { backgroundColor: activeOrderId === order.id ? '#fff' : theme.colors.primary },
                      ]}
                    >
                      <Text
                        style={[
                          styles.orderTabBadgeText,
                          { color: activeOrderId === order.id ? theme.colors.primary : '#fff' },
                        ]}
                      >
                        {order.items.reduce((total, item) => total + item.quantity, 0)}
                      </Text>
                    </View>
                  )}
                </View>
                {orders.length > 1 && (
                  <TouchableOpacity
                    style={[
                      styles.orderTabCloseButton,
                      {
                        backgroundColor: activeOrderId === order.id ? 'rgba(255,255,255,0.2)' : 'rgba(220,53,69,0.1)',
                      },
                    ]}
                    onPress={(e) => {
                      e.stopPropagation();
                      e.preventDefault();

                      // Add confirmation for delete action with usage hint
                      Alert.alert(
                        'Xác nhận xóa',
                        `Bạn có chắc muốn xóa "${order.name}"?\n\n💡 Mẹo: Nhấn giữ nút × để xóa nhanh không cần xác nhận.`,
                        [
                          {
                            text: 'Hủy',
                            style: 'cancel',
                          },
                          {
                            text: 'Xóa',
                            style: 'destructive',
                            onPress: () => deleteOrder(order.id),
                          },
                        ],
                      );
                    }}
                    onLongPress={(e) => {
                      // Alternative: immediate delete on long press with haptic feedback
                      e.stopPropagation();
                      // Add haptic feedback if available
                      if (require('react-native').Vibration) {
                        require('react-native').Vibration.vibrate(50);
                      }
                      deleteOrder(order.id);
                    }}
                    delayLongPress={600} // Reduce to 600ms for better UX
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} // Increase touch area
                    activeOpacity={0.6}
                  >
                    <Text
                      style={[styles.orderTabCloseText, { color: activeOrderId === order.id ? '#fff' : '#dc3545' }]}
                    >
                      ×
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          ))}

          {/* Add New Order Button */}
          <TouchableOpacity
            style={[
              styles.addOrderButton,
              { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border },
            ]}
            onPress={createNewOrder}
          >
            <Text style={[styles.addOrderButtonText, { color: theme.colors.primary }]}>+ Thêm đơn</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }, [orders, activeOrderId, theme.colors, switchToOrder, deleteOrder, createNewOrder]);

  const renderCartItem = ({ item }: { item: OrderItem }) => {
    const originalPrice = item.price * item.quantity;
    const finalPrice = item.finalPrice !== undefined ? item.finalPrice : originalPrice;

    const hasDiscount = item.discountPercent && item.discountPercent > 0;

    return (
      <View
        style={[styles.cartItem, { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border }]}
      >
        <View style={styles.cartItemInfo}>
          <Text style={[styles.cartItemName, { color: theme.colors.text }]}>{item.name}</Text>

          {item.selectedAttributes && (
            <Text style={{ color: theme.colors.text, opacity: 0.7, marginTop: 4, fontSize: 12 }}>
              {Object.values(item.selectedAttributes).join(' • ')}
            </Text>
          )}

          {/* Price Display */}
          <View style={styles.priceContainer}>
            {hasDiscount ? (
              <View>
                <Text style={[styles.cartItemPrice, styles.originalPriceStrikethrough]}>
                  {formatCurrency(originalPrice)}
                </Text>
                <View style={styles.priceRow}>
                  <Text style={[styles.cartItemPrice, styles.discountedPrice]}>{formatCurrency(finalPrice)}</Text>
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountBadgeText}>-{item.discountPercent?.toFixed(1)}%</Text>
                  </View>
                  {item.isManualDiscount && (
                    <View style={styles.manualDiscountBadge}>
                      <Text style={styles.manualDiscountBadgeText}>
                        {item.manualDiscountType === 'percentage' ? '%' : 'VND'}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ) : (
              <Text style={[styles.cartItemPrice, { color: theme.colors.primary }]}>{formatCurrency(finalPrice)}</Text>
            )}
          </View>

          {/* Discount Actions */}
          <View style={styles.discountActionsContainer}>
            {hasDiscount ? (
              <TouchableOpacity onPress={() => removeDiscount(item.id)} style={styles.removeDiscountButton}>
                <Text style={styles.discountButtonText}>Bỏ giảm giá</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => {
                  setSelectedItemForDiscount(item.id);
                  setDiscountModalVisible(true);
                }}
                style={styles.addDiscountButton}
              >
                <Text style={styles.discountButtonText}>Thêm giảm giá</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Quantity Controls */}
        <View style={styles.cartItemControls}>
          <TouchableOpacity
            style={[styles.quantityButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => updateQuantity(item.id, item.quantity - 1)}
          >
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>

          <TextInput
            style={styles.quantityInput}
            value={quantityInput[item.id] !== undefined ? quantityInput[item.id] : item.quantity.toString()}
            onChangeText={(value) => handleQuantityInputChange(item.id, value)}
            onBlur={() => handleQuantityInputSubmit(item.id)}
            onSubmitEditing={() => handleQuantityInputSubmit(item.id)}
            keyboardType="numeric"
            selectTextOnFocus
          />

          <TouchableOpacity
            style={[styles.quantityButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => updateQuantity(item.id, item.quantity + 1)}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Portrait Layout
  if (!isLandscape) {
    return (
      <SafeAreaView style={[styles.container]}>
        {viewMode === 'fullscreen' && (
          <>
            {/* Floating Cart Button */}
            {!cartBottomSheetVisible && (
              <TouchableOpacity
                style={[styles.floatingCartButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => setCartBottomSheetVisible(true)}
              >
                <Icon name="shopping-basket" size={24} color="#fff" />
                {cart.length > 0 && (
                  <View style={styles.cartBadge}>
                    <Text style={styles.cartBadgeText}>{getTotalItems()}</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}

            {/* Cart BottomSheet */}
            {renderCartBottomSheet()}
          </>
        )}

        <FlatList
          data={filteredProducts}
          renderItem={productViewMode === 'grid' ? renderProductItem : renderProductItemList}
          keyExtractor={(item) => item.id}
          numColumns={productViewMode === 'grid' ? 2 : 1}
          key={productViewMode} // Force re-render when view mode changes
          scrollEnabled={true}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={5}
          initialNumToRender={10}
          contentContainerStyle={[
            productViewMode === 'grid' ? styles.productsGrid : styles.productsList,
            { paddingBottom: 20 },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          ListHeaderComponent={
            <View>
              {/* Header */}
              <View style={styles.portraitHeader}>
                <View style={styles.headerRow}>
                  <Text style={[styles.title, { color: theme.colors.text }]}>Bán hàng POS</Text>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity
                      style={[styles.viewModeToggle, { backgroundColor: theme.colors.primary }]}
                      onPress={() => setQuickAddModalVisible(true)}
                    >
                      <Icon name="add" size={20} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.viewModeToggle, { backgroundColor: theme.colors.primary }]}
                      onPress={openBarcodeScanner}
                    >
                      <Icon name="barcode-scan" type="material-community" size={20} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.viewModeToggle, { backgroundColor: theme.colors.primary }]}
                      onPress={() => updateViewMode(viewMode === 'split' ? 'fullscreen' : 'split')}
                    >
                      <Icon name={viewMode === 'split' ? 'open-in-full' : 'close-fullscreen'} size={20} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <View style={styles.searchSection}>
                <TextInput
                  style={[
                    styles.searchInput,
                    {
                      backgroundColor: theme.colors.cardBackground,
                      borderColor: theme.colors.border,
                      color: theme.colors.text,
                    },
                  ]}
                  placeholder="Tìm kiếm sản phẩm..."
                  placeholderTextColor={theme.colors.text}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
                {processedCategories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryButton,
                      {
                        backgroundColor:
                          selectedCategory === category.id ? theme.colors.primary : theme.colors.cardBackground,
                      },
                    ]}
                    onPress={() => setSelectedCategory(category.id)}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        { color: selectedCategory === category.id ? '#fff' : theme.colors.text },
                      ]}
                    >
                      {category.name}
                      {category.count !== undefined && category.id !== 'all' ? ` (${category.count})` : ''}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.productSectionHeader}>
                <View style={styles.productHeaderRight}>
                  <TouchableOpacity
                    style={[styles.viewToggleButton, { backgroundColor: theme.colors.border }]}
                    onPress={() => updateProductViewMode(productViewMode === 'grid' ? 'list' : 'grid')}
                  >
                    <Icon
                      name={productViewMode === 'grid' ? 'view-list' : 'view-module'}
                      size={20}
                      color={theme.colors.text}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          }
          ListFooterComponent={
            viewMode === 'split' ? (
              <View style={[styles.portraitCartSection]}>
                {/* Order Tabs */}
                {renderOrderTabs()}

                <View style={styles.cartHeader}>
                  <View style={styles.cartHeaderRow}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                      {getCurrentOrder()?.name || 'Giỏ hàng'}
                    </Text>
                    <View style={styles.cartItemsBadge}>
                      <Text style={styles.cartItemsBadgeText}>{getTotalItems()}</Text>
                    </View>
                  </View>
                </View>

                {/* Customer Select for Portrait */}
                {renderCustomerSelect()}

                {cart.length === 0 ? (
                  <View style={styles.emptyCartContainer}>
                    <Text style={styles.emptyCartText}>Giỏ hàng trống{'\n'}Vui lòng thêm sản phẩm</Text>
                  </View>
                ) : (
                  <View>
                    {cart.map((item) => (
                      <View key={item.id}>{renderCartItem({ item })}</View>
                    ))}
                  </View>
                )}

                <View style={[styles.portraitCheckout, { borderTopColor: theme.colors.border }]}>
                  {/* Collapsible footer toggle */}
                  {renderToggleFooterButton('Portrait')}

                  {/* Collapsible section - Order Discount, Promotion, Auto Print */}
                  {!footerCollapsed && (
                    <>
                      {/* Order Discount Row */}
                      {renderOrderDiscountRow()}

                      {/* Promotion Row */}
                      {renderPromotionRow()}

                      {/* Auto Print Toggle */}
                      {renderAutoPrintToggle()}

                      {/* Order details when expanded */}
                      {renderOrderSummaryDetails()}
                    </>
                  )}

                  {/* Total and Checkout Button - always visible */}
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: theme.colors.text, fontWeight: 'bold' }]}>
                      Khách phải trả:
                    </Text>
                    <Text style={[styles.summaryValue, { color: theme.colors.primary, fontWeight: 'bold' }]}>
                      {formatCurrency(getFinalOrderTotal())}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.checkoutButton, { backgroundColor: theme.colors.primary }]}
                    onPress={handleCheckout}
                  >
                    <Text style={styles.checkoutButtonText}>Thanh toán</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : null
          }
        />

        {/* Discount Modal for Portrait */}
        {renderDiscountModal()}

        {/* Order Discount Modal */}
        {renderOrderDiscountModal()}

        {/* Promotion Modal */}
        {renderPromotionModal()}

        {/* Variation Modal */}
        {renderVariationModal()}

        {/* Quick Add Product Modal */}
        {renderQuickAddModal()}

        {/* Barcode Scanner Modal */}
        {renderBarcodeScannerModal()}
      </SafeAreaView>
    );
  }

  // Don't render until settings are loaded
  if (!isLoaded) {
    return (
      <SafeAreaView style={[styles.container]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const ViewLandscape = Platform.OS === 'ios' ? View : SafeAreaView;

  return (
    <ViewLandscape style={[styles.container]}>
      {/* Floating Cart Button for fullscreen mode */}
      {viewMode === 'fullscreen' && (
        <>
          {!cartBottomSheetVisible && (
            <TouchableOpacity
              style={[styles.floatingCartButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => setCartBottomSheetVisible(true)}
            >
              <Icon name="shopping-basket" size={24} color="#fff" />
              {cart.length > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{getTotalItems()}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}

          {/* Cart BottomSheet for fullscreen mode */}
          {renderCartBottomSheet()}
        </>
      )}

      <View style={styles.mainContent}>
        <View style={[styles.leftPanel, { flex: viewMode === 'fullscreen' ? 1 : 2 }]}>
          <View style={styles.header}>
            {/* Search Bar */}
            <TextInput
              style={[styles.searchInput]}
              placeholder="Tìm kiếm sản phẩm..."
              placeholderTextColor={theme.colors.text}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={[styles.viewModeToggle, { backgroundColor: theme.colors.primary }]}
                onPress={() => setQuickAddModalVisible(true)}
              >
                <Icon name="add" size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.viewModeToggle, { backgroundColor: theme.colors.primary }]}
                onPress={openBarcodeScanner}
              >
                <Icon name="barcode-scan" type="material-community" size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.viewModeToggle, { backgroundColor: theme.colors.primary }]}
                onPress={() => updateViewMode(viewMode === 'split' ? 'fullscreen' : 'split')}
              >
                <Icon name={viewMode === 'split' ? 'open-in-full' : 'close-fullscreen'} size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Category Filter */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={[
              !isLandscape ? styles.categoryContainer : { ...styles.categoryContainer, paddingBottom: 30 },
              filteredProducts?.length === 0 && { maxHeight: 60 },
            ]}
          >
            {processedCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  {
                    backgroundColor: selectedCategory === category.id ? theme.colors.primary : theme.colors.background,
                  },
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    { color: selectedCategory === category.id ? '#fff' : theme.colors.text },
                  ]}
                >
                  {category.name}
                  {category.count !== undefined && category.id !== 'all' ? ` (${category.count})` : ''}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.productSectionHeader}>
            <View style={styles.productHeaderLeft}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Sản phẩm</Text>
              <Text style={styles.productCount}>{filteredProducts?.length || 0} sản phẩm</Text>
            </View>
            <View style={styles.productHeaderRight}>
              <TouchableOpacity
                style={[styles.viewToggleButton, { backgroundColor: theme.colors.border }]}
                onPress={() => updateProductViewMode(productViewMode === 'grid' ? 'list' : 'grid')}
              >
                <Icon
                  name={productViewMode === 'grid' ? 'view-list' : 'view-module'}
                  size={20}
                  color={theme.colors.text}
                />
              </TouchableOpacity>
            </View>
          </View>

          <FlatList
            data={filteredProducts}
            renderItem={productViewMode === 'grid' ? renderProductItem : renderProductItemList}
            keyExtractor={(item) => item.id}
            numColumns={productViewMode === 'grid' ? 3 : 1}
            key={productViewMode}
            removeClippedSubviews={true}
            maxToRenderPerBatch={15}
            windowSize={5}
            initialNumToRender={15}
            contentContainerStyle={[
              productViewMode === 'grid' ? styles.productsGrid : styles.productsList,
              { paddingBottom: 200 },
            ]}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[theme.colors.primary]}
                tintColor={theme.colors.primary}
              />
            }
          />
        </View>

        {/* Right Side - Cart & Payment (Only in split mode) */}
        {viewMode === 'split' && (
          <View style={[styles.rightPanel]}>
            {/* Order Tabs */}
            {renderOrderTabs()}
            <View style={styles.header}>
              <Text style={[styles.title, { color: theme.colors.text }]}>{getCurrentOrder()?.name || 'Giỏ hàng'}</Text>
              <View style={styles.cartItemsBadgeLarge}>
                <Text style={styles.cartItemsBadgeText}>{getTotalItems()}</Text>
              </View>
            </View>

            {/* Customer Select */}
            {renderCustomerSelect()}
            {cart.length === 0 ? (
              <View style={styles.emptyCartContainer}>
                <Text style={styles.emptyCartText}>Giỏ hàng trống{'\n'}Vui lòng thêm sản phẩm</Text>
              </View>
            ) : (
              <FlatList
                data={cart}
                renderItem={renderCartItem}
                keyExtractor={(item) => item.id}
                style={styles.cartList}
                showsVerticalScrollIndicator={false}
              />
            )}

            {/* Payment Summary */}
            <View style={[styles.paymentSummary, { borderTopColor: theme.colors.border }]}>
              {/* Collapsible footer toggle */}
              {renderToggleFooterButton('Landscape')}

              {/* Collapsible section - Order Discount, Promotion, Auto Print */}
              {!footerCollapsed && (
                <>
                  {/* Order Discount Row */}
                  {renderOrderDiscountRow()}

                  {/* Promotion Row */}
                  {renderPromotionRow()}

                  {/* Auto Print Toggle */}
                  {renderAutoPrintToggle()}

                  {/* Order details when expanded */}
                  {renderOrderSummaryDetails()}
                </>
              )}

              {/* Total and Checkout Button - always visible */}
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.colors.text, fontWeight: 'bold' }]}>
                  Khách phải trả:
                </Text>
                <Text style={[styles.summaryValue, { color: theme.colors.primary, fontWeight: 'bold' }]}>
                  {formatCurrency(getFinalOrderTotal())}
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.checkoutButton,
                  { backgroundColor: theme.colors.primary, opacity: cart.length === 0 ? 0.6 : 1 },
                ]}
                onPress={handleCheckout}
                disabled={cart.length === 0}
              >
                <Text style={styles.checkoutButtonText}>Thanh toán</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Discount Modal for Landscape */}
      {renderDiscountModal()}

      {/* Order Discount Modal */}
      {renderOrderDiscountModal()}

      {/* Promotion Modal */}
      {renderPromotionModal()}

      {/* Variation Modal */}
      {renderVariationModal()}

      {/* Quick Add Product Modal */}
      {renderQuickAddModal()}

      {/* Barcode Scanner Modal */}
      {renderBarcodeScannerModal()}
    </ViewLandscape>
  );
}
