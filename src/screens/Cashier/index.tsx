import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
} from 'react-native';
import { useFetchData } from '~/hooks/useApi';
import { useTheme } from '~/hooks/useTheme';
import { useCashierStyles } from './styles';
import { toastError, toastSuccess, toastInfo, toastWarning } from '~/hooks/useToast';
import { Icon } from '~/components/Icon';

interface Product {
  id: string;
  name: string;
  price: number;
  categories?: [];
  stock_quantity: number | null;
  stock_status: string | null;
}

interface CartItem extends Product {
  quantity: number;
  discountCode?: string;
  discountPercent?: number;
  discountAmount?: number;
  finalPrice?: number;
  manualDiscountType?: 'percentage' | 'fixed';
  manualDiscountValue?: number;
  isManualDiscount?: boolean;
}

export function Cashier() {
  const theme = useTheme();
  const { styles } = useCashierStyles();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [screenData, setScreenData] = useState(Dimensions.get('window'));
  const [discountModalVisible, setDiscountModalVisible] = useState(false);
  const [selectedItemForDiscount, setSelectedItemForDiscount] = useState<string | null>(null);
  const [discountCode, setDiscountCode] = useState('');
  const [quantityInput, setQuantityInput] = useState<{ [key: string]: string }>({});
  const [discountType, setDiscountType] = useState<'coupon' | 'manual'>('manual');
  const [manualDiscountType, setManualDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [manualDiscountValue, setManualDiscountValue] = useState('');
  const [viewMode, setViewMode] = useState<'split' | 'fullscreen'>('split');
  const [cartModalVisible, setCartModalVisible] = useState(false);
  const [orientationChangeTimeout, setOrientationChangeTimeout] = useState<NodeJS.Timeout | null>(null);

  // Mock discount codes for demo
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

  const categories = ['Tất cả', 'Đồ uống', 'Thực phẩm', 'Snack'];

  // Listen to orientation changes with debounce
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      // Clear existing timeout
      if (orientationChangeTimeout) {
        clearTimeout(orientationChangeTimeout);
      }

      // Set new timeout to debounce orientation changes
      const timeout = setTimeout(() => {
        setScreenData(window);
      }, 150); // 150ms debounce

      setOrientationChangeTimeout(timeout);
    });

    return () => {
      subscription?.remove();
      if (orientationChangeTimeout) {
        clearTimeout(orientationChangeTimeout);
      }
    };
  }, [orientationChangeTimeout]);

  // Check if device is in landscape mode with threshold to prevent flickering
  const isLandscape = screenData.width > screenData.height + 50; // Add threshold to prevent edge case flickering
  const isTablet = Math.min(screenData.width, screenData.height) >= 600; // Consider tablet if smaller dimension >= 600

  const filteredProducts = dataProducts?.data?.filter((product: any) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Tất cả' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                finalPrice: calculateFinalPrice(item.price, item.discountPercent) * (item.quantity + 1),
              }
            : item,
        );
      }
      const newItem = { ...product, quantity: 1, finalPrice: product.price * 1 };
      return [...prevCart, newItem];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
    const updatedQuantityInput = { ...quantityInput };
    delete updatedQuantityInput[productId];
    setQuantityInput(updatedQuantityInput);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    // Find the product to check stock
    const product = dataProducts?.data?.find((p: any) => p.id === productId);
    const maxStock = product?.stock_quantity || 999; // Default to 999 if no stock limit

    if (quantity > maxStock) {
      toastWarning(`Số lượng không được vượt quá ${maxStock}`);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId
          ? { ...item, quantity, finalPrice: calculateFinalPrice(item.price, item.discountPercent) * quantity }
          : item,
      ),
    );

    // Update the quantity input state to sync with the new quantity
    setQuantityInput((prev) => ({
      ...prev,
      [productId]: quantity.toString(),
    }));
  };

  const calculateFinalPrice = (originalPrice: number, discountPercent?: number) => {
    if (!discountPercent) return originalPrice;
    return originalPrice * (1 - discountPercent / 100);
  };

  const applyDiscount = () => {
    if (!selectedItemForDiscount) {
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

      setCart((prevCart) =>
        prevCart.map((item) => {
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
      );

      Alert.alert('Thành công', `Đã áp dụng ${discount.name}`);
    } else {
      // Manual discount
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
        // Fixed amount
        if (discountValue > cartItem.price) {
          Alert.alert('Lỗi', 'Số tiền giảm không được > giá sản phẩm');
          return;
        }
        discountAmount = discountValue;
        finalPrice = cartItem.price - discountValue;

        discountPercent = (discountValue / cartItem.price) * 100;
      }
      setCart((prevCart) =>
        prevCart.map((item) => {
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

  const removeDiscount = (productId: string) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
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

  const getTotalAmount = () => {
    return cart.reduce((total, item) => {
      // Nếu có finalPrice thì dùng finalPrice, nếu không thì tính giá * số lượng
      const itemPrice = item.finalPrice !== undefined ? item.finalPrice : item.price * item.quantity;
      return total + itemPrice;
    }, 0);
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  // Render Discount Modal - can be used in both portrait and landscape
  const renderDiscountModal = () => (
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

          {/* Discount Type Toggle */}
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
                {/* Manual Discount Type */}
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

                {/* Manual Discount Value Input */}
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
  );

  // Render Cart Modal - optimized for both portrait and landscape
  const renderCartModal = () => (
    <Modal
      visible={cartModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setCartModalVisible(false)}
      supportedOrientations={['portrait', 'landscape']}
    >
      <View style={styles.cartModalOverlay}>
        <TouchableOpacity
          style={styles.cartModalBackdrop}
          activeOpacity={1}
          onPress={() => setCartModalVisible(false)}
        />
        <View style={[styles.cartModalContainer]}>
          <View style={styles.cartModalHeader}>
            <Text style={[styles.cartModalTitle, { color: theme.colors.text }]}>Giỏ hàng</Text>
            <TouchableOpacity onPress={() => setCartModalVisible(false)}>
              <Icon name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          {cart.length === 0 ? (
            <View style={styles.emptyCartContainer}>
              <Text style={styles.emptyCartText}>Giỏ hàng trống{'\n'}Vui lòng thêm sản phẩm</Text>
            </View>
          ) : (
            <FlatList
              data={cart}
              renderItem={renderCartItem}
              keyExtractor={(item) => item.id}
              style={styles.cartModalList}
              showsVerticalScrollIndicator={false}
            />
          )}

          {/* Payment Summary */}
          <View style={[styles.cartModalPayment, { borderTopColor: theme.colors.border }]}>
            {getTotalDiscount() > 0 && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.colors.text }]}>Tổng gốc:</Text>
                <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
                  {formatCurrency(getOriginalTotal())}
                </Text>
              </View>
            )}

            {getTotalDiscount() > 0 && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.colors.text }]}>Giảm giá:</Text>
                <Text style={[styles.summaryValue, { color: '#28a745' }]}>-{formatCurrency(getTotalDiscount())}</Text>
              </View>
            )}

            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: theme.colors.text, fontWeight: 'bold' }]}>Thành tiền:</Text>
              <Text style={[styles.summaryValue, { color: theme.colors.primary, fontWeight: 'bold' }]}>
                {formatCurrency(getTotalAmount())}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.checkoutButton,
                { backgroundColor: theme.colors.primary, opacity: cart.length === 0 ? 0.6 : 1 },
              ]}
              onPress={() => {
                handleCheckout();
                setCartModalVisible(false);
              }}
              disabled={cart.length === 0}
            >
              <Text style={styles.checkoutButtonText}>Thanh toán</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const handleCheckout = () => {
    const originalTotal = getOriginalTotal();
    const discountTotal = getTotalDiscount();
    const finalTotal = getTotalAmount();

    let message = `Thanh toán thành công!\n\nTổng hóa đơn: ${formatCurrency(finalTotal)}`;

    if (discountTotal > 0) {
      message += `\nTổng gốc: ${formatCurrency(originalTotal)}`;
      message += `\nTiết kiệm: ${formatCurrency(discountTotal)}`;
    }

    toastSuccess(message);
    setCart([]);
    setQuantityInput({});
  };

  const renderProductItem = ({ item, detail = false }: { item: Product; detail?: boolean }) => (
    <TouchableOpacity style={[styles.productCard]} onPress={() => addToCart(item)}>
      <Text style={[styles.productName, { color: theme.colors.text }]}>{item.name}</Text>
      <Text style={[styles.productPrice, { color: theme.colors.primary }]}>{formatCurrency(item.price)}</Text>
      <Text style={[styles.productStock, { color: theme.colors.text }]}>
        Kho: {item.stock_quantity && item.stock_quantity !== 0 ? item.stock_quantity : item.stock_status}
      </Text>
    </TouchableOpacity>
  );

  const renderCartItem = ({ item }: { item: CartItem }) => {
    const originalPrice = item.price * item.quantity;
    const finalPrice = item.finalPrice !== undefined ? item.finalPrice : originalPrice;

    const hasDiscount = item.discountPercent && item.discountPercent > 0;

    return (
      <View
        style={[styles.cartItem, { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border }]}
      >
        <View style={styles.cartItemInfo}>
          <Text style={[styles.cartItemName, { color: theme.colors.text }]}>{item.name}</Text>

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
            <TouchableOpacity
              style={[styles.floatingCartButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => setCartModalVisible(true)}
            >
              <Icon name="shopping-basket" size={24} color="#fff" />
              {cart.length > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{getTotalItems()}</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Cart Modal */}
            {renderCartModal()}
          </>
        )}

        <ScrollView style={styles.portraitContainer} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.portraitHeader}>
            <View style={styles.headerRow}>
              <Text style={[styles.title, { color: theme.colors.text }]}>Bán hàng POS</Text>
              <TouchableOpacity
                style={[styles.viewModeToggle, { backgroundColor: theme.colors.primary }]}
                onPress={() => setViewMode(viewMode === 'split' ? 'fullscreen' : 'split')}
              >
                <Icon name={viewMode === 'split' ? 'open-in-full' : 'close-fullscreen'} size={20} color="#fff" />
              </TouchableOpacity>
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
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  {
                    backgroundColor: selectedCategory === category ? theme.colors.primary : theme.colors.cardBackground,
                  },
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text
                  style={[styles.categoryText, { color: selectedCategory === category ? '#fff' : theme.colors.text }]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.productsSection}>
            <View style={styles.productSectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Sản phẩm</Text>
              <Text style={styles.productCount}>{filteredProducts?.length || 0} sản phẩm</Text>
            </View>
            <FlatList
              data={filteredProducts}
              renderItem={renderProductItem}
              keyExtractor={(item) => item.id}
              numColumns={2}
              scrollEnabled={false}
              contentContainerStyle={styles.productsGrid}
            />
          </View>

          {cart.length > 0 && viewMode === 'split' && (
            <View style={[styles.portraitCartSection, { backgroundColor: theme.colors.cardBackground }]}>
              <View style={styles.cartHeader}>
                <View style={styles.cartHeaderRow}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Giỏ hàng</Text>
                  <View style={styles.cartItemsBadge}>
                    <Text style={styles.cartItemsBadgeText}>{getTotalItems()}</Text>
                  </View>
                </View>
              </View>

              <FlatList
                data={cart}
                renderItem={renderCartItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                style={styles.portraitCartList}
              />

              <View style={[styles.portraitCheckout, { borderTopColor: theme.colors.border }]}>
                {getTotalDiscount() > 0 && (
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: theme.colors.text }]}>Tổng gốc:</Text>
                    <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
                      {formatCurrency(getOriginalTotal())}
                    </Text>
                  </View>
                )}

                {getTotalDiscount() > 0 && (
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: theme.colors.text }]}>Giảm giá:</Text>
                    <Text style={[styles.summaryValue, { color: '#28a745' }]}>
                      -{formatCurrency(getTotalDiscount())}
                    </Text>
                  </View>
                )}

                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: theme.colors.text, fontWeight: 'bold' }]}>
                    Thành tiền:
                  </Text>
                  <Text style={[styles.summaryValue, { color: theme.colors.primary, fontWeight: 'bold' }]}>
                    {formatCurrency(getTotalAmount())}
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
          )}
        </ScrollView>

        {/* Discount Modal for Portrait */}
        {renderDiscountModal()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container]}>
      {/* Floating Cart Button for fullscreen mode */}
      {viewMode === 'fullscreen' && (
        <>
          <TouchableOpacity
            style={[styles.floatingCartButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => setCartModalVisible(true)}
          >
            <Icon name="shopping-basket" size={24} color="#fff" />
            {cart.length > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{getTotalItems()}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Cart Modal for fullscreen mode */}
          {renderCartModal()}
        </>
      )}

      <View style={styles.mainContent}>
        <View style={[styles.leftPanel, { flex: viewMode === 'fullscreen' ? 1 : 2 }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>Sản phẩm</Text>
            <View style={styles.headerActions}>
              <Text style={[{ color: theme.colors.text, fontSize: 16, marginRight: 12 }]}>
                {filteredProducts?.length || 0} sản phẩm
              </Text>
              <TouchableOpacity
                style={[styles.viewModeToggle, { backgroundColor: theme.colors.primary }]}
                onPress={() => setViewMode(viewMode === 'split' ? 'fullscreen' : 'split')}
              >
                <Icon name={viewMode === 'split' ? 'open-in-full' : 'close-fullscreen'} size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Bar */}
          <TextInput
            style={[styles.searchInput]}
            placeholder="Tìm kiếm sản phẩm..."
            placeholderTextColor={theme.colors.text}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          {/* Category Filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  {
                    backgroundColor: selectedCategory === category ? theme.colors.primary : theme.colors.background,
                  },
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text
                  style={[styles.categoryText, { color: selectedCategory === category ? '#fff' : theme.colors.text }]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <FlatList
            data={filteredProducts}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.productsGrid}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Right Side - Cart & Payment (Only in split mode) */}
        {viewMode === 'split' && (
          <View style={[styles.rightPanel, { backgroundColor: theme.colors.cardBackground }]}>
            <View style={styles.header}>
              <Text style={[styles.title, { color: theme.colors.text }]}>Giỏ hàng</Text>
              <View style={styles.cartItemsBadgeLarge}>
                <Text style={styles.cartItemsBadgeTextLarge}>{getTotalItems()}</Text>
              </View>
            </View>

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
              {getTotalDiscount() > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: theme.colors.text }]}>Tổng gốc:</Text>
                  <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
                    {formatCurrency(getOriginalTotal())}
                  </Text>
                </View>
              )}

              {getTotalDiscount() > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: theme.colors.text }]}>Giảm giá:</Text>
                  <Text style={[styles.summaryValue, { color: '#28a745' }]}>-{formatCurrency(getTotalDiscount())}</Text>
                </View>
              )}

              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.colors.text, fontWeight: 'bold' }]}>Thành tiền:</Text>
                <Text style={[styles.summaryValue, { color: theme.colors.primary, fontWeight: 'bold' }]}>
                  {formatCurrency(getTotalAmount())}
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

      {/* Discount Modal */}
      {/* Discount Modal for Landscape */}
      {renderDiscountModal()}
    </SafeAreaView>
  );
}
