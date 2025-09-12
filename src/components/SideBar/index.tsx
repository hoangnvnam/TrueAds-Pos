import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '~/contexts/AuthContext';
import { useSidebar } from '../../contexts/SidebarContext';
import { Icon } from '../Icon';
import { Image } from '../Image';
import { WrapperSidebar } from '../WrapperSidebar';
import { useSideBarStyles } from './styles';

export function SideBar() {
  const { authInfo, logout } = useAuth();
  const navigation = useNavigation() as any;
  const { styles } = useSideBarStyles();
  const { isOpen, closeSidebar, openSidebar } = useSidebar();
  const isAccessToStore =
    navigation.getState().routes[0].name === 'AccessToStore' || navigation.getState().routes[0].name === 'Purchase';

  const menuItems = [
    // {
    //   hidden: isAccessToStore,
    //   id: 'pages',
    //   title: 'Trang của bạn',
    //   subtitle: 'Danh sách trang đã kết nối',
    //   icon: (
    //     <Image source={require('~/assets/icons/storefront.png')} width={20} resizeMode="contain" style={styles.icon} />
    //   ),
    //   onPress: () => {
    //     toastInfo('Chức năng đang phát triển');
    //   },
    // },
    {
      hidden: isAccessToStore,
      id: 'account',
      title: 'Thông tin tài khoản',
      subtitle: 'Thông tin tài khoản của bạn',
      icon: (
        <Image source={require('~/assets/icons/account.png')} width={20} resizeMode="contain" style={styles.icon} />
      ),
      onPress: () => {
        navigation.navigate('Profile');
      },
    },
    {
      id: 'sessions',
      title: 'Phiên đăng nhập',
      subtitle: 'Thiết bị và phiên đăng nhập',
      icon: (
        <Image source={require('~/assets/icons/devices.png')} width={20} resizeMode="contain" style={styles.icon} />
      ),
      onPress: () => {
        navigation.navigate('Devices');
      },
    },
    {
      id: 'packages',
      title: 'Gói cước',
      subtitle: 'Gói cước của bạn',
      icon: (
        <Image source={require('~/assets/icons/bookmarks.png')} width={20} resizeMode="contain" style={styles.icon} />
      ),
      onPress: () => {
        closeSidebar();
        navigation.navigate('Packages');
      },
      isIos: true,
    },

    {
      id: 'scanner',
      title: 'Scanner',
      subtitle: 'Tự động thêm vào đơn hàng/sản phẩm',
      icon: <Image source={require('~/assets/icons/scan.png')} width={20} resizeMode="contain" style={styles.icon} />,
      onPress: () => {
        closeSidebar();
        navigation.navigate('BarcodeScanner');
      },
      isIos: true,
    },

    // {
    //   hidden: isAccessToStore,
    //   id: 'settings',
    //   title: 'Cài đặt ứng dụng',
    //   subtitle: 'Cài đặt âm thanh, thông báo...',
    //   icon: (
    //     <Image source={require('~/assets/icons/settings.png')} width={20} resizeMode="contain" style={styles.icon} />
    //   ),
    //   onPress: () => {
    //     toastInfo('Chức năng đang phát triển');
    //   },
    // },
  ];

  const productItems: any[] = [
    // {
    //   id: 'website',
    //   title: 'TrueAds Website',
    //   icon: (
    //     <Image source={require('~/assets/icons/website.png')} width={20} resizeMode="contain" style={styles.icon} />
    //   ),
    //   onPress: () => {
    //     toastInfo('Chức năng đang phát triển');
    //   },
    // },
    // {
    //   id: 'crm',
    //   title: 'TrueAds CRM',
    //   icon: <Image source={require('~/assets/icons/crm.png')} width={20} resizeMode="contain" style={styles.icon} />,
    //   onPress: () => {
    //     toastInfo('Chức năng đang phát triển');
    //   },
    // },
    // {
    //   id: 'chat',
    //   title: 'TrueAds Social Chat',
    //   icon: <Image source={require('~/assets/icons/pos.png')} width={20} resizeMode="contain" style={styles.icon} />,
    //   onPress: () => {
    //     closeSidebar();
    //     navigation.replace('HomeTabs');
    //   },
    //   hidden: isAccessToStore,
    // },
    // {
    //   id: 'pos',
    //   title: 'TrueAds Cashier',
    //   icon: <Image source={require('~/assets/icons/pos.png')} width={20} resizeMode="contain" style={styles.icon} />,
    //   onPress: () => {
    //     closeSidebar();
    //     navigation.replace('POSTabs');
    //   },
    //   hidden: isAccessToStore,
    // },
    // {
    //   id: 'erp',
    //   title: 'TrueAds ERP',
    //   icon: <Image source={require('~/assets/icons/erp.png')} width={20} resizeMode="contain" style={styles.icon} />,
    //   onPress: () => {
    //     toastInfo('Chức năng đang phát triển');
    //   },
    // },
    // {
    //   id: 'report',
    //   title: 'Báo cáo Quảng cáo',
    //   icon: <Image source={require('~/assets/icons/report.png')} width={20} resizeMode="contain" style={styles.icon} />,
    //   onPress: () => {
    //     toastInfo('Chức năng đang phát triển');
    //   },
    // },
  ];

  const renderMenuItem = (item: any) => {
    if (item.hidden) return null;
    if (item.isIos && Platform.OS !== 'ios') return null;
    return (
      <TouchableOpacity key={item.id} style={styles.menuItem} onPress={item.onPress}>
        {item.icon}
        <View style={styles.menuContent}>
          <Text style={styles.menuTitle}>{item.title}</Text>
          <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <WrapperSidebar slide={true} isOpen={isOpen} closeSidebar={closeSidebar} openSidebar={openSidebar}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerAvatar}>
            <View style={styles.avatar}>
              <Text style={{ color: '#fff' }}>{authInfo?.display_name?.charAt(0)}</Text>
            </View>
            <Text numberOfLines={1} ellipsizeMode="tail" style={styles.title}>
              {authInfo?.display_name}
            </Text>
          </View>
          <View style={styles.headerInfo}>
            <View style={styles.contactBox}>
              <Icon name="facebook" type="material-community" size={20} style={styles.icon} />
              <Text numberOfLines={1} ellipsizeMode="tail" style={styles.email}>
                {authInfo?.email}
              </Text>
            </View>
            <View style={styles.contactBox}>
              <Icon name="phone" type="material-community" size={20} style={styles.icon} />
              <Text style={styles.id}>{authInfo?.phone_number}</Text>
            </View>
          </View>
        </View>

        <ScrollView style={styles.menuContainer}>
          <View style={styles.menuSection}>{menuItems.map((item) => renderMenuItem(item))}</View>

          <View style={styles.divider} />

          <View style={styles.menuSection}>{productItems.map((item) => renderMenuItem(item))}</View>
        </ScrollView>
      </SafeAreaView>
    </WrapperSidebar>
  );
}
