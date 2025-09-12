import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, SafeAreaView, Dimensions } from 'react-native';
import { useTheme } from '~/hooks/useTheme';

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: string;
  minStock: number;
}

const mockInventory: InventoryItem[] = [
  { id: '1', name: 'Coca Cola', sku: 'CC001', price: 15000, stock: 50, category: 'Đồ uống', minStock: 10 },
  { id: '2', name: 'Bánh mì', sku: 'BM001', price: 25000, stock: 30, category: 'Thực phẩm', minStock: 5 },
  { id: '3', name: 'Cà phê đen', sku: 'CF001', price: 20000, stock: 5, category: 'Đồ uống', minStock: 10 },
  { id: '4', name: 'Nước suối', sku: 'NS001', price: 10000, stock: 100, category: 'Đồ uống', minStock: 20 },
  { id: '5', name: 'Bánh ngọt', sku: 'BN001', price: 35000, stock: 2, category: 'Thực phẩm', minStock: 5 },
  { id: '6', name: 'Kẹo dẻo', sku: 'KD001', price: 8000, stock: 40, category: 'Snack', minStock: 15 },
  { id: '7', name: 'Sữa chua', sku: 'SC001', price: 12000, stock: 20, category: 'Thực phẩm', minStock: 8 },
  { id: '8', name: 'Trà đá', sku: 'TD001', price: 8000, stock: 35, category: 'Đồ uống', minStock: 10 },
];

export function POSInventory() {
  const theme = useTheme();
  const [inventory] = useState<InventoryItem[]>(mockInventory);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [screenData, setScreenData] = useState(Dimensions.get('window'));

  // Listen to orientation changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenData(window);
    });

    return () => subscription?.remove();
  }, []);

  const isLandscape = screenData.width > screenData.height;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = !filterLowStock || item.stock <= item.minStock;
    return matchesSearch && matchesFilter;
  });

  const getStockStatus = (item: InventoryItem) => {
    if (item.stock <= item.minStock) return 'low';
    if (item.stock <= item.minStock * 2) return 'medium';
    return 'high';
  };

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'low': return '#FF4444';
      case 'medium': return '#FF8800';
      case 'high': return '#00AA00';
      default: return theme.colors.text;
    }
  };

  const renderInventoryItem = ({ item }: { item: InventoryItem }) => {
    const stockStatus = getStockStatus(item);
    const stockColor = getStockStatusColor(stockStatus);

    return (
      <View style={[styles.inventoryCard, { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border }]}>
        <View style={styles.itemHeader}>
          <Text style={[styles.itemName, { color: theme.colors.text }]}>{item.name}</Text>
          <Text style={[styles.itemSku, { color: theme.colors.textSecondary }]}>SKU: {item.sku}</Text>
        </View>
        
        <View style={styles.itemDetails}>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Giá:</Text>
            <Text style={[styles.detailValue, { color: theme.colors.primary }]}>{formatCurrency(item.price)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Danh mục:</Text>
            <Text style={[styles.detailValue, { color: theme.colors.text }]}>{item.category}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Tồn kho:</Text>
            <Text style={[styles.detailValue, { color: stockColor }]}>
              {item.stock} / {item.minStock} (min)
            </Text>
          </View>
        </View>

        <View style={[styles.stockIndicator, { backgroundColor: stockColor }]}>
          <Text style={styles.stockIndicatorText}>
            {stockStatus === 'low' ? 'Hết hàng' : stockStatus === 'medium' ? 'Sắp hết' : 'Đủ hàng'}
          </Text>
        </View>
      </View>
    );
  };

  const lowStockCount = inventory.filter(item => item.stock <= item.minStock).length;
  const totalValue = inventory.reduce((total, item) => total + (item.price * item.stock), 0);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Quản lý Kho hàng</Text>
        
        <View style={[styles.statsContainer, { flexDirection: isLandscape ? 'row' : 'column' }]}>
          <View style={[styles.statCard, { backgroundColor: theme.colors.cardBackground, marginBottom: isLandscape ? 0 : 8 }]}>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Tổng sản phẩm</Text>
            <Text style={[styles.statValue, { color: theme.colors.primary }]}>{inventory.length}</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: theme.colors.cardBackground, marginBottom: isLandscape ? 0 : 8 }]}>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Sắp hết hàng</Text>
            <Text style={[styles.statValue, { color: '#FF4444' }]}>{lowStockCount}</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: theme.colors.cardBackground, marginBottom: isLandscape ? 0 : 8 }]}>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Giá trị tồn kho</Text>
            <Text style={[styles.statValue, { color: theme.colors.primary, fontSize: isLandscape ? 18 : 16 }]}>
              {formatCurrency(totalValue)}
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.controls, { flexDirection: isLandscape ? 'row' : 'column' }]}>
        <TextInput
          style={[
            styles.searchInput, 
            { 
              backgroundColor: theme.colors.cardBackground, 
              borderColor: theme.colors.border, 
              color: theme.colors.text,
              marginBottom: isLandscape ? 0 : 12,
              marginRight: isLandscape ? 12 : 0
            }
          ]}
          placeholder="Tìm kiếm sản phẩm hoặc SKU..."
          placeholderTextColor={theme.colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            {
              backgroundColor: filterLowStock ? theme.colors.primary : theme.colors.cardBackground,
              borderColor: theme.colors.border
            }
          ]}
          onPress={() => setFilterLowStock(!filterLowStock)}
        >
          <Text style={[
            styles.filterButtonText,
            { color: filterLowStock ? '#fff' : theme.colors.text }
          ]}>
            Sắp hết hàng
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredInventory}
        renderItem={renderInventoryItem}
        keyExtractor={item => item.id}
        numColumns={isLandscape ? 2 : 1}
        key={isLandscape ? 'landscape' : 'portrait'} // Force re-render when orientation changes
        contentContainerStyle={styles.inventoryList}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsContainer: {
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  controls: {
    marginBottom: 16,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 120,
    alignItems: 'center',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  inventoryList: {
    paddingBottom: 16,
  },
  inventoryCard: {
    flex: 1,
    margin: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  itemHeader: {
    marginBottom: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemSku: {
    fontSize: 12,
  },
  itemDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  stockIndicator: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignItems: 'center',
  },
  stockIndicatorText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
