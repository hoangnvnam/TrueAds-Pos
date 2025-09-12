import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '~/hooks/useTheme';
import { useCashierStyles } from './styles';
import { useFetchData } from '~/hooks/useApi';

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
}

export function Cashier() {
  const theme = useTheme();
  const { styles } = useCashierStyles();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [screenData, setScreenData] = useState(Dimensions.get('window'));

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

  // Listen to orientation changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenData(window);
    });

    return () => subscription?.remove();
  }, []);

  // Check if device is in landscape mode
  const isLandscape = screenData.width > screenData.height;
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
        return prevCart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) => prevCart.map((item) => (item.id === productId ? { ...item, quantity } : item)));
  };

  const getTotalAmount = () => {
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

  const handleCheckout = () => {
    alert('Thanh toán thành công!');
    setCart([]);
  };

  const renderProductItem = ({ item, detail = false }: { item: Product; detail?: boolean }) => (
    <TouchableOpacity style={[styles.productCard]} onPress={() => addToCart(item)}>
      <Text style={[styles.productName, { color: theme.colors.text }]}>{item.name}</Text>
      <Text style={[styles.productPrice, { color: theme.colors.primary }]}>{formatCurrency(item.price)}</Text>
      <Text style={[styles.productStock, { color: theme.colors.textSecondary }]}>
        Kho: {item.stock_quantity && item.stock_quantity !== 0 ? item.stock_quantity : item.stock_status}
      </Text>
    </TouchableOpacity>
  );

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={[styles.cartItem, { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border }]}>
      <View style={styles.cartItemInfo}>
        <Text style={[styles.cartItemName, { color: theme.colors.text }]}>{item.name}</Text>
        <Text style={[styles.cartItemPrice, { color: theme.colors.primary }]}>{formatCurrency(item.price)}</Text>
      </View>
      <View style={styles.cartItemControls}>
        <TouchableOpacity
          style={[styles.quantityButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => updateQuantity(item.id, item.quantity - 1)}
        >
          <Text style={styles.quantityButtonText}>-</Text>
        </TouchableOpacity>
        <Text style={[styles.quantity, { color: theme.colors.text }]}>{item.quantity}</Text>
        <TouchableOpacity
          style={[styles.quantityButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => updateQuantity(item.id, item.quantity + 1)}
        >
          <Text style={styles.quantityButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Portrait Layout
  if (!isLandscape) {
    return (
      <SafeAreaView style={[styles.container]}>
        <ScrollView style={styles.portraitContainer} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.portraitHeader}>
            <Text style={[styles.title, { color: theme.colors.text }]}>Bán hàng POS</Text>
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
              placeholderTextColor={theme.colors.textSecondary}
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
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}
            >
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Sản phẩm</Text>
              <Text style={{ color: theme.colors.textSecondary }}>{filteredProducts?.length || 0} sản phẩm</Text>
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

          {cart.length > 0 && (
            <View style={[styles.portraitCartSection, { backgroundColor: theme.colors.cardBackground }]}>
              <View style={styles.cartHeader}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Giỏ hàng</Text>
                  <View
                    style={{
                      backgroundColor: theme.colors.primary,
                      paddingHorizontal: 10,
                      paddingVertical: 3,
                      borderRadius: 16,
                    }}
                  >
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>{getTotalItems()}</Text>
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
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: theme.colors.text }]}>Tổng tiền:</Text>
                  <Text style={[styles.summaryValue, { color: theme.colors.primary }]}>
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
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container]}>
      <View style={styles.mainContent}>
        <View style={[styles.leftPanel, { backgroundColor: theme.colors.cardBackground }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>Sản phẩm</Text>
            <Text style={[{ color: theme.colors.textSecondary, fontSize: 16 }]}>
              {filteredProducts?.length || 0} sản phẩm
            </Text>
          </View>

          {/* Search Bar */}
          <TextInput
            style={[
              styles.searchInput,
              { backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text },
            ]}
            placeholder="Tìm kiếm sản phẩm..."
            placeholderTextColor={theme.colors.textSecondary}
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

          {/* Products Grid */}
          <FlatList
            data={filteredProducts}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.productsGrid}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Right Side - Cart & Payment */}
        <View style={[styles.rightPanel, { backgroundColor: theme.colors.cardBackground }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>Giỏ hàng</Text>
            <View
              style={{
                backgroundColor: theme.colors.primary,
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderRadius: 20,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>{getTotalItems()}</Text>
            </View>
          </View>

          {cart.length === 0 ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 16, textAlign: 'center' }}>
                Giỏ hàng trống{'\n'}Vui lòng thêm sản phẩm
              </Text>
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
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: theme.colors.text }]}>Tổng tiền:</Text>
              <Text style={[styles.summaryValue, { color: theme.colors.primary }]}>
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
      </View>
    </SafeAreaView>
  );
}
