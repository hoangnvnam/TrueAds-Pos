import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { Modal, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { ButtonRipple } from '~/components/ButtonRipple';
import { Icon } from '~/components/Icon';
import { Image } from '~/components/Image';
import { Input } from '~/components/Input';
import { axiosChild, axiosParent } from '~/configs/axios';
import { DIMENSIONS } from '~/constants/dimensions';
import { useAuth } from '~/contexts/AuthContext';
import { useInitData } from '~/contexts/InitData';
import { useLoading } from '~/contexts/LoadingContext';
import { useDebounce } from '~/hooks/useDebounce';
import { useTheme } from '~/hooks/useTheme';
import { globalStyles } from '~/styles/globalStyles';
import { copyToClipboard } from '~/utils/copy';
import { isMobile } from '~/utils/devices';
import { useAccessToStoreStyles } from './styles';

const StoreItem = ({ item, type, onPress }: { item: any; type: string; onPress: (expired?: boolean) => void }) => {
  const { styles } = useAccessToStoreStyles();
  const theme = useTheme();

  const [countdown, setCountdown] = useState<string>('');
  const [expired, setExpired] = useState(false);

  // Tìm end_date cao nhất trong list_service
  const maxEndDate = item.list_service?.length
    ? item.list_service.reduce((max: Date | null, service: any) => {
        const endDate = new Date(service.end_date);
        return !max || endDate > max ? endDate : max;
      }, null)
    : null;

  useLayoutEffect(() => {
    if (!maxEndDate) {
      setCountdown('Không có thời hạn');
      return;
    }

    const interval = setInterval(() => {
      const now = new Date();
      const timeLeft = maxEndDate.getTime() - now.getTime();
      if (timeLeft <= 0) {
        setExpired(true);
        setCountdown('Đã hết hạn');
        clearInterval(interval);
        return;
      }

      const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

      setCountdown(`${days} ngày ${hours} giờ ${minutes} phút ${seconds} giây`);
      setExpired(false);
    }, 1000);

    // Khởi tạo giá trị ban đầu ngay lập tức
    const now = new Date();
    const timeLeft = maxEndDate.getTime() - now.getTime();
    if (timeLeft <= 0) {
      setCountdown('Đã hết hạn');
    }

    return () => clearInterval(interval);
  }, [maxEndDate]);

  return (
    <ButtonRipple
      onPress={() => onPress(expired)}
      style={[styles.storeItem, globalStyles.dropShadow]}
      rippleColor="blue"
    >
      <Image source={require('~/assets/icons/storefront.png')} style={styles.storeItemImage} resizeMode="contain" />
      <View style={styles.storeItemContent}>
        <Text numberOfLines={1} ellipsizeMode="tail" style={styles.storeItemName}>
          {item.site_title}
        </Text>
        <Text numberOfLines={1} ellipsizeMode="tail" style={styles.storeItemHost}>
          {item.site_host}
        </Text>
        <Text style={[styles.storeItemHost, { color: theme.colors.error, fontSize: 12 }]}>Hết hạn: {countdown}</Text>
      </View>
      <Image source={require('~/assets/icons/login.png')} width={20} resizeMode="contain" />
    </ButtonRipple>
  );
};

export function AccessToStore() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { logout, setAuthChild } = useAuth();
  const { showLoading, hideLoading } = useLoading();
  const { purchase, setPurchased } = useInitData();

  const { styles } = useAccessToStoreStyles();
  const theme = useTheme();
  const [search, setSearch] = useState('');
  const [loadingSearch, setLoadingSearch] = useState(false);
  const debouncedSearch = useDebounce(search, 500);
  const [yourStores, setYourStores] = useState([]);
  const [collabStores, setCollabStores] = useState([]);

  const [modalVisible, setModalVisible] = useState<{ show: boolean; data: any }>({ show: false, data: null });

  useEffect(() => {
    if (debouncedSearch.length > 0) {
      setLoadingSearch(true);
      setTimeout(() => {
        setLoadingSearch(false);
      }, 500);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    getStores();
    if (purchase) {
      setPurchased(false);
    }
  }, [purchase]);

  const getStores = async () => {
    try {
      showLoading();
      const { data, status } = await axiosParent.get('/stores');
      if (status === 200) {
        setYourStores(data.dataOwneSite || []);
        setCollabStores(data.listSites || []);
      }
    } catch (error: any) {
      console.log('error', error.response?.data);
    } finally {
      hideLoading();
    }
  };

  const handleAccessStore = async (item: any, type: string, expired?: boolean) => {
    if (expired) {
      return setModalVisible({
        show: true,
        data: item,
      });
    }
    showLoading();
    try {
      const { data, status } = await axiosParent.post('/child-login', {
        idLogin: type === 'owner' ? '1' : item.id_site,
        subsite: item.site_host,
      });
      if (status === 200) {
        await AsyncStorage.setItem('storeDomain', item.site_domain);
        await AsyncStorage.setItem('storeSelected', JSON.stringify(item));

        const { data: dataChild, status: statusChild } = await (
          await axiosChild({ action: null })
        ).post('/logged', {
          session: data.accessToken,
        });

        if (statusChild === 200) {
          if (dataChild.data?.fbAuthResponse) {
            await AsyncStorage.setItem('fbAuthResponse', dataChild.data.fbAuthResponse);
          }
          if (dataChild.data?.zaloAuthResponse) {
            await AsyncStorage.setItem('zaloAuthResponse', dataChild.data.zaloAuthResponse);
          }
          delete dataChild.data.fbAuthResponse;
          delete dataChild.data.zaloAuthResponse;
          delete dataChild.data.assignedConversations;

          await AsyncStorage.setItem('authChild', JSON.stringify(dataChild.data));
          setAuthChild(dataChild.data);
          // navigation.replace('HomeTabs');
          navigation.replace('ServiceSelection');
        }
      }
    } catch (error: any) {
      console.log('error', error.message);
    } finally {
      hideLoading();
    }
  };

  const renderStore = (item: any, type: string) => {
    return (
      <StoreItem key={item.abc} item={item} type={type} onPress={(expired) => handleAccessStore(item, type, expired)} />
    );
  };

  const handleLogout = async () => {
    await logout();
    return navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const copy = async (text: string) => {
    await copyToClipboard(text);
  };

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: isMobile() ? 10 : 20, marginBottom: 20 }}>
        <Input
          placeholder="Tìm kiếm"
          style={styles.input}
          close
          value={search}
          setValue={setSearch}
          radius={100}
          icon={<Icon name="search" size={18} />}
          loading={loadingSearch}
        />
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            backgroundColor: theme.colors.error,
            padding: 10,
            borderRadius: 10,
          }}
          onPress={handleLogout}
        >
          {!isMobile() && <Text style={{ color: '#fff' }}>Đăng xuất</Text>}
          <Icon name="logout" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
      <ScrollView style={{ flex: 1 }}>
        <View style={styles.logoContainer}>
          <Image source={require('../../../assets/logo.png')} style={styles.fixedLogo} resizeMode="contain" />
          <Image source={require('../../../assets/text.png')} style={styles.text} resizeMode="contain" />
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>Chọn cửa hàng để truy cập</Text>

          {yourStores.length > 0 && (
            <View
              style={[
                styles.storeContainer,
                collabStores.length > 0 && {
                  maxHeight: (DIMENSIONS.SCREEN_HEIGHT - 250) / 2,
                },
              ]}
            >
              <Text style={styles.storeTitle}>Cửa hàng của bạn</Text>
              <ScrollView nestedScrollEnabled={true} style={styles.storeList}>
                {yourStores.map((item) => renderStore(item, 'owner'))}
              </ScrollView>
            </View>
          )}

          {collabStores.length > 0 && (
            <View
              style={[
                styles.storeContainer,
                yourStores.length > 0 && {
                  maxHeight: (DIMENSIONS.SCREEN_HEIGHT - 250) / 2,
                },
              ]}
            >
              <Text style={styles.storeTitle}>Cửa hàng bạn đang hợp tác</Text>
              <ScrollView nestedScrollEnabled={true} style={styles.storeList}>
                {collabStores.map((item) => renderStore(item, 'collab'))}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible.show}
        onRequestClose={() => setModalVisible({ show: false, data: null })}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, globalStyles.dropShadow]}>
            <Text style={[styles.title, { marginBottom: 20 }]}>Liên hệ hỗ trợ</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
              <Text style={styles.modalText}>Email: hi@adsagency.vn</Text>
              <TouchableOpacity style={styles.copyButton} onPress={() => copy('hi@adsagency.vn')}>
                <Icon name="copy" type="ionicons" size={18} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
              <Text style={styles.modalText}>Số điện thoại: 034 734 8668</Text>
              <TouchableOpacity style={styles.copyButton} onPress={() => copy('034 734 8668')}>
                <Icon name="copy" type="ionicons" size={18} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
            {Platform.OS === 'ios' && (
              <>
                <Text style={styles.modalText}>
                  Hoặc bạn có thể tới trang dịch vụ của chúng tôi để đăng ký: &nbsp;
                  <Text
                    style={[styles.modalLink, { color: theme.colors.primary }]}
                    onPress={() => {
                      setModalVisible({ show: false, data: null });
                      navigation.navigate('Purchase', {
                        param: modalVisible.data?.abc,
                      });
                    }}
                  >
                    Dịch vụ
                  </Text>
                </Text>
                <Text style={styles.modalText}>Chúng tôi sẽ hỗ trợ bạn trong thời gian sớm nhất.</Text>
              </>
            )}
            <ButtonRipple
              onPress={() => setModalVisible({ show: false, data: null })}
              style={styles.closeButton}
              rippleColor="gray"
            >
              <Text style={styles.closeButtonText}>Đóng</Text>
            </ButtonRipple>
          </View>
        </View>
      </Modal>
    </View>
  );
}
