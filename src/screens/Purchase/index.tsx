import { useNavigation, useRoute } from '@react-navigation/native';
import { useIAP } from 'expo-iap';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { axiosParent } from '~/configs/axios';
import { useAuth } from '~/contexts/AuthContext';
import { useInitData } from '~/contexts/InitData';
const productIds = [
  'social_chat_small_6_months',
  'social_chat_small_12_months',
  'social_chat_standard_6_months',
  'social_chat_business_6_months',
];

// Dữ liệu gói đăng ký để hiển thị
const subscriptionData: any = {
  social_chat_small_6_months: {
    title: 'Social Chat Cơ Bản',
    duration: '6 tháng',
    price: '₫719,000',
    features: ['Tính năng chat cơ bản', '1 trang', '3 nhân viên'],
    popular: false,
    ex: '6 months',
  },
  social_chat_small_12_months: {
    title: 'Social Chat Cơ Bản',
    duration: '12 tháng',
    price: '₫1,369,000',
    features: ['Tính năng chat cơ bản', '1 trang', '3 nhân viên', 'Hỗ trợ ưu tiên'],
    popular: true,
    ex: '12 months',
  },
  social_chat_standard_6_months: {
    title: 'Social Chat Tiêu Chuẩn',
    duration: '6 tháng',
    price: '₫1,439,000',
    features: ['Tính năng chat nâng cao', '3 trang', '3 nhân viên', 'Hỗ trợ ưu tiên'],
    popular: false,
    ex: '6 months',
  },
  social_chat_business_6_months: {
    title: 'Social Chat Doanh Nghiệp',
    duration: '6 tháng',
    price: '₫2,849,000',
    features: ['Tất cả tính năng premium', '6 trang', '10 nhân viên', 'Bảng điều khiển phân tích', 'Hỗ trợ 24/7'],
    popular: false,
    ex: '6 months',
  },
};

export function Purchase() {
  const { param } = useRoute().params as any;
  const { setPurchased } = useInitData();
  const navigation = useNavigation();

  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('social_chat_small_12_months');
  const [userPremiumStatus, setUserPremiumStatus] = useState(false);
  const [purchaseProcessed, setPurchaseProcessed] = useState(new Set());
  const [enabled, setEnabled] = useState(true);
  const [isRequesting, setIsRequesting] = useState(false);
  const { authInfo: currentUser } = useAuth();

  // Animation refs cho từng gói
  const animationRefs = useRef<{ [key: string]: Animated.Value }>({});

  // Khởi tạo animation values
  useEffect(() => {
    productIds.forEach((id) => {
      if (!animationRefs.current[id]) {
        animationRefs.current[id] = new Animated.Value(0);
      }
    });
  }, []);

  // Animation khi chọn gói
  const animateButton = (productId: string) => {
    // Reset tất cả animations về 0
    Object.keys(animationRefs.current).forEach((id) => {
      if (id !== productId) {
        Animated.timing(animationRefs.current[id], {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }).start();
      }
    });

    // Animate gói được chọn
    Animated.timing(animationRefs.current[productId], {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handlePlanSelection = (productId: string) => {
    setSelectedPlan(productId);
    animateButton(productId);
  };

  const {
    connected,
    subscriptions,
    getSubscriptions,
    requestPurchase,
    validateReceipt,
    getPurchaseHistories,
    finishTransaction,
  } = useIAP({
    onPurchaseSuccess: async (purchase) => {
      if (purchaseProcessed.has(purchase.transactionId) || !currentUser?.id) {
        return;
      }
      try {
        const isLinked = await checkPurchaseLinked(purchase.transactionId);
        if (isLinked) {
          setPurchaseProcessed((prev) => new Set([...prev, purchase.transactionId]));
          return;
        }
        setPurchaseProcessed((prev) => new Set([...prev, purchase.transactionId]));
        setLoading(false);
        validateAndLinkPurchase(purchase, enabled);
      } catch (error) {
        console.error('Lỗi khi kiểm tra liên kết giao dịch:', error);
        setLoading(false);
      }
    },
    onPurchaseError: (error) => {
      setLoading(false);
      Alert.alert('Mua Thất Bại', 'Xin lỗi, chúng tôi không thể xử lý giao dịch của bạn. Vui lòng thử lại.', [
        { text: 'OK' },
      ]);
    },
  });

  useEffect(() => {
    if (connected && currentUser.id && param) {
      loadSubscriptions();
      checkUserPremiumStatus();
      checkPendingPurchases();
    }
  }, [connected, currentUser.id, param]);

  // Animate gói được chọn mặc định khi component mount
  useEffect(() => {
    if (selectedPlan) {
      setTimeout(() => {
        animateButton(selectedPlan);
      }, 100);
    }
  }, [selectedPlan]);

  // Kiểm tra purchases chưa hoàn thành khi vào trang
  const checkPendingPurchases = async () => {
    try {
      const purchaseHistories: any = await getPurchaseHistories(productIds);
      if (!purchaseHistories) {
        console.log('Không có purchase histories');
        return;
      }
      for (const purchase of purchaseHistories) {
        if (!purchaseProcessed.has(purchase.transactionId)) {
          console.log('Tìm thấy purchase chưa xử lý:', purchase.transactionId);
          const isLinked = await checkPurchaseLinked(purchase.transactionId);

          if (!isLinked) {
            setPurchaseProcessed((prev) => new Set([...prev, purchase.transactionId]));
            await validateAndLinkPurchase(purchase, true);
          } else {
            await finishTransaction({ purchase, isConsumable: false });
          }
        }
      }
    } catch (error) {
      console.error('Lỗi kiểm tra pending purchases:', error);
    }
  };

  // Kiểm tra xem purchase đã được liên kết chưa
  const checkPurchaseLinked = async (transactionId?: string): Promise<boolean> => {
    try {
      const { data } = await axiosParent.get(`/check-purchase-linked`, {
        params: {
          userId: currentUser.id,
          transactionId,
          subsiteId: param || null,
        },
      });
      return data.isLinked;
    } catch (error: any) {
      console.error('Lỗi kiểm tra purchase link:', error.response?.data || error.message || error);
      return false;
    }
  };

  // Kiểm tra trạng thái premium của user hiện tại
  const checkUserPremiumStatus = async () => {
    try {
      const { data } = await axiosParent.get(`/check-premium-status`, {
        params: {
          userId: currentUser.id,
          subsiteId: param || null,
        },
      });
      setUserPremiumStatus(data.isPremium);
    } catch (error) {
      console.error('Không thể kiểm tra trạng thái premium:', error);
    }
  };

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      await getSubscriptions(productIds);
    } catch (error) {
      console.error('Không thể tải các gói đăng ký:', error);
    } finally {
      setLoading(false);
      setEnabled(false);
    }
  };

  const validateAndLinkPurchase = async (purchase: any, silent: boolean = false) => {
    try {
      const result = await validateReceipt(purchase.id);
      if (result.isValid) {
        await axiosParent.post('/link-purchase', {
          userId: currentUser.id,
          subsiteId: param || null,
          transactionId: purchase.transactionId,
          serviceId: purchase.id,
          orderDate: purchase.transactionDate,
          appleId: purchase.originalTransactionIdentifierIos,
          payment_method: 'applestore',
          price: purchase.priceIos,
          eviroment: purchase.environmentIos,
          duration: subscriptionData[purchase.id]?.ex,
        });

        setUserPremiumStatus(true);
        await finishTransaction({ purchase, isConsumable: false });

        if (isRequesting) {
          setIsRequesting(false);
          setPurchased(true);
          navigation.reset({
            index: 0,
            routes: [{ name: 'AccessToStore' }],
          });
        }
      }
    } catch (error: any) {
      console.error('Xác thực thất bại:', error?.response?.data || error?.message || error);
    }
  };

  const handlePurchase = async (productId: string) => {
    if (!connected) {
      Alert.alert('Lỗi Kết Nối', 'Vui lòng kiểm tra kết nối internet và thử lại.');
      return;
    }
    if (!currentUser) {
      Alert.alert('Lỗi', 'Vui lòng đăng nhập để mua gói.');
      return;
    }
    if (userPremiumStatus) {
      Alert.alert('Đã Có Premium', 'Tài khoản của bạn đã có gói premium. Bạn có muốn gia hạn hoặc nâng cấp không?', [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Tiếp tục', onPress: () => processPurchase(productId) },
      ]);
      return;
    }
    await processPurchase(productId);
  };

  const processPurchase = async (productId: string) => {
    setLoading(true);
    setIsRequesting(true);
    try {
      console.log(productId);
      await requestPurchase({ request: { sku: productId } });
    } catch (error) {
      console.error('Lỗi mua hàng:', error);
      setLoading(false);
      setIsRequesting(false);
    }
  };

  // Restore purchases
  const restorePurchases = async () => {
    try {
      setLoading(true);
      const purchaseHistories: any = await getPurchaseHistories(productIds);
      if (!purchaseHistories) {
        Alert.alert('Không có giao dịch nào để khôi phục.');
        setLoading(false);
        return;
      }
      if (purchaseHistories.length > 0) {
        let foundUnlinked = false;

        for (const purchase of purchaseHistories) {
          const isLinked = await checkPurchaseLinked(purchase.transactionId);

          if (!isLinked) {
            foundUnlinked = true;
            Alert.alert(
              'Khôi Phục Giao Dịch',
              'Chúng tôi tìm thấy giao dịch mua hàng chưa được liên kết với tài khoản này. Bạn có muốn liên kết không?',
              [
                { text: 'Không', style: 'cancel' },
                {
                  text: 'Có',
                  onPress: () => {
                    setPurchaseProcessed((prev) => new Set([...prev, purchase.transactionId]));
                    validateAndLinkPurchase(purchase);
                  },
                },
              ],
            );
            break;
          }
        }

        if (!foundUnlinked) {
          Alert.alert('Không tìm thấy giao dịch nào cần khôi phục.');
        }
      } else {
        Alert.alert('Không tìm thấy giao dịch nào để khôi phục.');
      }
    } catch (error) {
      console.error('Lỗi khôi phục:', error);
      Alert.alert('Lỗi', 'Không thể khôi phục giao dịch.');
    } finally {
      setLoading(false);
    }
  };

  const renderSubscriptionCard = (productId: string) => {
    const data = subscriptionData[productId];
    if (!data) return null;

    const isSelected = selectedPlan === productId;
    const product = subscriptions.find((p) => p.id === productId);
    const animatedValue = animationRefs.current[productId] || new Animated.Value(0);

    // Tính toán height và opacity cho animation
    const buttonHeight = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 60],
    });

    const buttonOpacity = animatedValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0, 1],
    });

    return (
      <TouchableOpacity
        key={productId}
        style={[styles.subscriptionCard, isSelected && styles.selectedCard, data.popular && styles.popularCard]}
        onPress={() => handlePlanSelection(productId)}
      >
        {data.popular && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularText}>PHỔ BIẾN NHẤT</Text>
          </View>
        )}

        <View style={styles.cardHeader}>
          <Text style={styles.subscriptionTitle}>{data.title}</Text>
          <Text style={styles.subscriptionDuration}>Thời hạn:{data.duration}</Text>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.price}>{product?.displayPrice || data.price}</Text>
          <Text style={styles.billingCycle}>Thanh toán mỗi {data.duration}</Text>
        </View>

        <View style={styles.featuresContainer}>
          {data.features.map((feature: string, index: number) => (
            <View key={index} style={styles.featureRow}>
              <Text style={styles.checkmark}>✓</Text>
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        {isSelected && (
          <View style={styles.selectionIndicator}>
            <Text style={styles.selectionText}>Đã chọn</Text>
          </View>
        )}

        {/* Animated Subscribe Button */}
        <Animated.View
          style={[
            styles.animatedButtonContainer,
            {
              height: buttonHeight,
              opacity: buttonOpacity,
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.inlineSubscribeButton, loading && styles.subscribeButtonDisabled]}
            onPress={() => handlePurchase(productId)}
            disabled={loading || !connected}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.inlineSubscribeButtonText}>
                {userPremiumStatus ? 'Nâng Cấp/Gia Hạn' : 'Đăng Ký Ngay'}
              </Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Chọn Gói Của Bạn</Text>
          <Text style={styles.headerSubtitle}>Nâng cấp lên premium và mở khóa tất cả tính năng Social Chat</Text>
          {userPremiumStatus && (
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumText}>✓ Tài khoản Premium</Text>
            </View>
          )}
        </View>

        <View style={styles.subscriptionsContainer}>
          {productIds.map((productId) => renderSubscriptionCard(productId))}
        </View>

        <View style={styles.benefitsSection}>
          <Text style={styles.benefitsTitle}>Tại Sao Chọn Social Chat Premium?</Text>
          <View style={styles.benefitsList}>
            <View style={styles.benefitRow}>
              <Text style={styles.benefitIcon}>💬</Text>
              <Text style={styles.benefitText}>Nhắn tin không giới hạn</Text>
            </View>
            <View style={styles.benefitRow}>
              <Text style={styles.benefitIcon}>🎨</Text>
              <Text style={styles.benefitText}>Giao diện tùy chỉnh & cá nhân hóa</Text>
            </View>
            <View style={styles.benefitRow}>
              <Text style={styles.benefitIcon}>🚀</Text>
              <Text style={styles.benefitText}>Hỗ trợ ưu tiên</Text>
            </View>
            <View style={styles.benefitRow}>
              <Text style={styles.benefitIcon}>📊</Text>
              <Text style={styles.benefitText}>Phân tích nâng cao</Text>
            </View>
          </View>
        </View>

        {/* Nút khôi phục giao dịch */}
        <TouchableOpacity style={styles.restoreButton} onPress={restorePurchases} disabled={loading}>
          <Text style={styles.restoreButtonText}>Khôi Phục Giao Dịch</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <TouchableOpacity
            onPress={async () => await WebBrowser.openBrowserAsync('https://trueads.ai/privacy-policy/')}
          >
            <Text style={styles.footerLink}>• Chính sách bảo mật</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={async () =>
              await WebBrowser.openBrowserAsync('https://www.apple.com/legal/internet-services/itunes/dev/stdeula/')
            }
          >
            <Text style={styles.footerLink}>• Điều khoản sử dụng</Text>
          </TouchableOpacity>
          <Text style={styles.footerText}>• Hủy bất cứ lúc nào trong cài đặt Apple ID của bạn</Text>
          <Text style={styles.footerText}>• Tự động gia hạn có thể tắt sau khi mua</Text>
          <Text style={styles.footerText}>• Thanh toán sẽ được tính vào tài khoản Apple ID của bạn</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  headerLeft: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  premiumBadge: {
    backgroundColor: '#28a745',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
  },
  premiumText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  subscriptionsContainer: {
    padding: 20,
    gap: 16,
  },
  subscriptionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: '#e9ecef',
    position: 'relative',
  },
  selectedCard: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  popularCard: {
    borderColor: '#FF6B35',
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    left: 20,
    backgroundColor: '#FF6B35',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardHeader: {
    marginBottom: 12,
  },
  subscriptionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  subscriptionDuration: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  priceContainer: {
    marginBottom: 16,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  billingCycle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  featuresContainer: {
    gap: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkmark: {
    color: '#28a745',
    fontSize: 16,
    marginRight: 8,
    fontWeight: 'bold',
  },
  featureText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  selectionIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  selectionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Styles cho animated button
  animatedButtonContainer: {
    marginTop: 10,
    marginBottom: 10,
    overflow: 'hidden',
  },
  inlineSubscribeButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  inlineSubscribeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  benefitsSection: {
    padding: 20,
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 12,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  benefitsList: {
    gap: 12,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  benefitText: {
    fontSize: 16,
    color: '#333',
  },
  subscribeButton: {
    backgroundColor: '#007AFF',
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  subscribeButtonDisabled: {
    backgroundColor: '#ccc',
  },
  subscribeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  restoreButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
    marginHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  restoreButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    paddingTop: 0,
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
  footerLink: {
    fontSize: 12,
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: 4,
  },
});
