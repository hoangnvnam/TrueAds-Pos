import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { useTheme } from '~/hooks/useTheme';

interface SalesData {
  date: string;
  revenue: number;
  transactions: number;
  items: number;
}

interface ProductSales {
  name: string;
  quantity: number;
  revenue: number;
}

const mockSalesData: SalesData[] = [
  { date: '2024-01-15', revenue: 2500000, transactions: 45, items: 120 },
  { date: '2024-01-14', revenue: 1800000, transactions: 32, items: 85 },
  { date: '2024-01-13', revenue: 3200000, transactions: 58, items: 150 },
  { date: '2024-01-12', revenue: 2100000, transactions: 38, items: 95 },
  { date: '2024-01-11', revenue: 2800000, transactions: 52, items: 135 },
];

const mockTopProducts: ProductSales[] = [
  { name: 'Coca Cola', quantity: 45, revenue: 675000 },
  { name: 'Bánh mì', quantity: 32, revenue: 800000 },
  { name: 'Cà phê đen', quantity: 28, revenue: 560000 },
  { name: 'Nước suối', quantity: 55, revenue: 550000 },
  { name: 'Bánh ngọt', quantity: 18, revenue: 630000 },
];

export function POSReports() {
  const theme = useTheme();
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [screenData, setScreenData] = useState(Dimensions.get('window'));

  const periods = [
    { key: 'today', label: 'Hôm nay' },
    { key: 'week', label: 'Tuần này' },
    { key: 'month', label: 'Tháng này' },
    { key: 'quarter', label: 'Quý này' },
  ];

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const totalRevenue = mockSalesData.reduce((sum, day) => sum + day.revenue, 0);
  const totalTransactions = mockSalesData.reduce((sum, day) => sum + day.transactions, 0);
  const totalItems = mockSalesData.reduce((sum, day) => sum + day.items, 0);
  const avgTransactionValue = totalRevenue / totalTransactions;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Báo cáo & Thống kê</Text>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.periodSelector}>
          {periods.map(period => (
            <TouchableOpacity
              key={period.key}
              style={[
                styles.periodButton,
                {
                  backgroundColor: selectedPeriod === period.key ? theme.colors.primary : theme.colors.cardBackground,
                  borderColor: theme.colors.border
                }
              ]}
              onPress={() => setSelectedPeriod(period.key)}
            >
              <Text style={[
                styles.periodButtonText,
                { color: selectedPeriod === period.key ? '#fff' : theme.colors.text }
              ]}>
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Summary Cards - Responsive */}
        <View style={[
          styles.summaryContainer, 
          { 
            flexDirection: isLandscape ? 'row' : 'column',
            flexWrap: isLandscape ? 'nowrap' : 'wrap'
          }
        ]}>
          <View style={[
            styles.summaryCard, 
            { 
              backgroundColor: theme.colors.cardBackground,
              marginBottom: isLandscape ? 0 : 12,
              flex: isLandscape ? 1 : 0
            }
          ]}>
            <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Tổng doanh thu</Text>
            <Text style={[styles.summaryValue, { color: theme.colors.primary }]}>
              {formatCurrency(totalRevenue)}
            </Text>
            <Text style={[styles.summaryChange, { color: '#00AA00' }]}>+12.5%</Text>
          </View>

          <View style={[
            styles.summaryCard, 
            { 
              backgroundColor: theme.colors.cardBackground,
              marginBottom: isLandscape ? 0 : 12,
              flex: isLandscape ? 1 : 0
            }
          ]}>
            <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Số giao dịch</Text>
            <Text style={[styles.summaryValue, { color: theme.colors.primary }]}>{totalTransactions}</Text>
            <Text style={[styles.summaryChange, { color: '#00AA00' }]}>+8.3%</Text>
          </View>

          <View style={[
            styles.summaryCard, 
            { 
              backgroundColor: theme.colors.cardBackground,
              marginBottom: isLandscape ? 0 : 12,
              flex: isLandscape ? 1 : 0
            }
          ]}>
            <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Sản phẩm bán</Text>
            <Text style={[styles.summaryValue, { color: theme.colors.primary }]}>{totalItems}</Text>
            <Text style={[styles.summaryChange, { color: '#00AA00' }]}>+15.2%</Text>
          </View>

          <View style={[
            styles.summaryCard, 
            { 
              backgroundColor: theme.colors.cardBackground,
              marginBottom: isLandscape ? 0 : 12,
              flex: isLandscape ? 1 : 0
            }
          ]}>
            <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Giá trị TB/GD</Text>
            <Text style={[styles.summaryValue, { color: theme.colors.primary }]}>
              {formatCurrency(avgTransactionValue)}
            </Text>
            <Text style={[styles.summaryChange, { color: '#00AA00' }]}>+4.1%</Text>
          </View>
        </View>

        {/* Charts Container - Responsive */}
        <View style={[
          styles.chartsContainer,
          { flexDirection: isLandscape ? 'row' : 'column' }
        ]}>
          {/* Daily Sales Chart */}
          <View style={[
            styles.chartCard, 
            { 
              backgroundColor: theme.colors.cardBackground,
              marginBottom: isLandscape ? 0 : 16,
              flex: isLandscape ? 1 : 0
            }
          ]}>
            <Text style={[styles.chartTitle, { color: theme.colors.text }]}>Doanh thu theo ngày</Text>
            <View style={styles.chartContent}>
              {mockSalesData.map((day, index) => (
                <View key={index} style={styles.chartRow}>
                  <Text style={[styles.chartDate, { color: theme.colors.textSecondary }]}>
                    {formatDate(day.date)}
                  </Text>
                  <Text style={[styles.chartValue, { color: theme.colors.primary }]}>
                    {formatCurrency(day.revenue)}
                  </Text>
                  <Text style={[styles.chartTransactions, { color: theme.colors.text }]}>
                    {day.transactions} GD
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Top Products */}
          <View style={[
            styles.chartCard, 
            { 
              backgroundColor: theme.colors.cardBackground,
              flex: isLandscape ? 1 : 0
            }
          ]}>
            <Text style={[styles.chartTitle, { color: theme.colors.text }]}>Sản phẩm bán chạy</Text>
            <View style={styles.chartContent}>
              {mockTopProducts.map((product, index) => (
                <View key={index} style={styles.productRow}>
                  <View style={styles.productInfo}>
                    <Text style={[styles.productName, { color: theme.colors.text }]}>
                      {index + 1}. {product.name}
                    </Text>
                    <Text style={[styles.productQuantity, { color: theme.colors.textSecondary }]}>
                      Đã bán: {product.quantity}
                    </Text>
                  </View>
                  <Text style={[styles.productRevenue, { color: theme.colors.primary }]}>
                    {formatCurrency(product.revenue)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Performance Metrics - Responsive Grid */}
        <View style={[styles.metricsCard, { backgroundColor: theme.colors.cardBackground }]}>
          <Text style={[styles.chartTitle, { color: theme.colors.text }]}>Chỉ số hiệu suất</Text>
          
          <View style={[
            styles.metricsGrid,
            { flexDirection: isLandscape ? 'row' : 'column' }
          ]}>
            <View style={[
              styles.metricRow,
              { flexDirection: isLandscape ? 'column' : 'row' }
            ]}>
              <View style={styles.metricItem}>
                <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>Tỷ lệ chuyển đổi</Text>
                <Text style={[styles.metricValue, { color: theme.colors.primary }]}>85.2%</Text>
              </View>
              
              <View style={styles.metricItem}>
                <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>Khách hàng quay lại</Text>
                <Text style={[styles.metricValue, { color: theme.colors.primary }]}>42.8%</Text>
              </View>
            </View>
            
            <View style={[
              styles.metricRow,
              { flexDirection: isLandscape ? 'column' : 'row' }
            ]}>
              <View style={styles.metricItem}>
                <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>Sản phẩm/GD</Text>
                <Text style={[styles.metricValue, { color: theme.colors.primary }]}>2.8</Text>
              </View>
              
              <View style={styles.metricItem}>
                <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>Thời gian TB/GD</Text>
                <Text style={[styles.metricValue, { color: theme.colors.primary }]}>3.2 phút</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
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
  periodSelector: {
    marginBottom: 8,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 12,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  summaryContainer: {
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  summaryCard: {
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  summaryChange: {
    fontSize: 12,
    fontWeight: '600',
  },
  chartsContainer: {
    marginBottom: 20,
  },
  chartCard: {
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  chartContent: {
    flex: 1,
  },
  chartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  chartDate: {
    fontSize: 12,
    flex: 1,
  },
  chartValue: {
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'right',
  },
  chartTransactions: {
    fontSize: 12,
    width: 50,
    textAlign: 'right',
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  productQuantity: {
    fontSize: 12,
  },
  productRevenue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  metricsCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  metricsGrid: {
    justifyContent: 'space-between',
  },
  metricRow: {
    flex: 1,
    justifyContent: 'space-between',
  },
  metricItem: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
