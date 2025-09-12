import { useNavigation } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  SafeAreaView,
  Dimensions,
  Alert,
} from 'react-native';
import { useTheme } from '~/hooks/useTheme';
import { useAuth } from '~/contexts/AuthContext';

interface SettingItem {
  id: string;
  title: string;
  description: string;
  type: 'switch' | 'input' | 'button';
  value?: string | boolean;
}

const settingsData: SettingItem[] = [
  {
    id: 'auto_print',
    title: 'Tự động in hóa đơn',
    description: 'In hóa đơn tự động sau mỗi giao dịch thành công',
    type: 'switch',
    value: true,
  },
  {
    id: 'sound_effects',
    title: 'Âm thanh thông báo',
    description: 'Phát âm thanh khi có giao dịch thành công',
    type: 'switch',
    value: false,
  },
  {
    id: 'tax_rate',
    title: 'Thuế VAT (%)',
    description: 'Tỷ lệ thuế VAT áp dụng cho sản phẩm',
    type: 'input',
    value: '10',
  },
  {
    id: 'currency_display',
    title: 'Hiển thị tiền tệ',
    description: 'Định dạng hiển thị tiền tệ trên hệ thống',
    type: 'input',
    value: 'VND',
  },
  {
    id: 'low_stock_alert',
    title: 'Cảnh báo hết hàng',
    description: 'Thông báo khi sản phẩm sắp hết hàng',
    type: 'switch',
    value: true,
  },
  {
    id: 'backup_data',
    title: 'Sao lưu dữ liệu',
    description: 'Sao lưu dữ liệu định kỳ',
    type: 'button',
  },
];

export function POSSettings() {
  const navigation = useNavigation();
  const theme = useTheme();
  const { logout } = useAuth();
  const [settings, setSettings] = useState(settingsData);
  const [screenData, setScreenData] = useState(Dimensions.get('window'));

  // Listen to orientation changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenData(window);
    });

    return () => subscription?.remove();
  }, []);

  const isLandscape = screenData.width > screenData.height;

  const updateSetting = (id: string, value: string | boolean) => {
    setSettings((prev) => prev.map((setting) => (setting.id === id ? { ...setting, value } : setting)));
  };

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Đăng xuất',
          onPress: async () => {
            try {
              await logout();
              // Navigation will be handled by the auth state change
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể đăng xuất. Vui lòng thử lại sau.');
            }
          },
          style: 'destructive',
        },
      ],
      { cancelable: true },
    );
  };

  const renderSettingItem = (item: SettingItem) => {
    switch (item.type) {
      case 'switch':
        return (
          <View
            key={item.id}
            style={[
              styles.settingCard,
              { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border },
            ]}
          >
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: theme.colors.text }]}>{item.title}</Text>
              <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>{item.description}</Text>
            </View>
            <Switch
              value={item.value as boolean}
              onValueChange={(value) => updateSetting(item.id, value)}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={item.value ? '#fff' : '#f4f3f4'}
            />
          </View>
        );

      case 'input':
        return (
          <View
            key={item.id}
            style={[
              styles.settingCard,
              { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border },
            ]}
          >
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: theme.colors.text }]}>{item.title}</Text>
              <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>{item.description}</Text>
            </View>
            <TextInput
              style={[
                styles.settingInput,
                {
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border,
                  color: theme.colors.text,
                },
              ]}
              value={item.value as string}
              onChangeText={(value) => updateSetting(item.id, value)}
              placeholder="Nhập giá trị..."
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>
        );

      case 'button':
        return (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.settingCard,
              { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border },
            ]}
            onPress={() => {
              if (item.id === 'backup_data') {
                alert('Đang sao lưu dữ liệu...');
              }
            }}
          >
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: theme.colors.text }]}>{item.title}</Text>
              <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>{item.description}</Text>
            </View>
            <Text style={[styles.buttonText, { color: theme.colors.primary }]}>Thực hiện</Text>
          </TouchableOpacity>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.container]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Cài đặt POS</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Cấu hình hệ thống điểm bán hàng</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.settingsContainer, { flexDirection: isLandscape ? 'row' : 'column' }]}>
          {/* Left Column in Landscape / Full width in Portrait */}
          <View style={[styles.settingsColumn, { flex: isLandscape ? 1 : 0, marginRight: isLandscape ? 16 : 0 }]}>
            {/* General Settings */}
            <View style={styles.settingsSection}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Cài đặt chung</Text>
              {settings.slice(0, 3).map(renderSettingItem)}
            </View>

            {/* Display Settings */}
            <View style={styles.settingsSection}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Hiển thị</Text>
              {settings.slice(3, 4).map(renderSettingItem)}
            </View>
          </View>

          {/* Right Column in Landscape / Continue in Portrait */}
          <View style={[styles.settingsColumn, { flex: isLandscape ? 1 : 0, marginLeft: isLandscape ? 16 : 0 }]}>
            {/* Alert Settings */}
            <View style={styles.settingsSection}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Thông báo</Text>
              {settings.slice(4, 5).map(renderSettingItem)}
            </View>

            {/* System Settings */}
            <View style={styles.settingsSection}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Hệ thống</Text>
              {settings.slice(5).map(renderSettingItem)}
            </View>

            {/* Device Info */}
            <View
              style={[
                styles.deviceInfo,
                { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Thông tin thiết bị</Text>

              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Tên thiết bị:</Text>
                <Text style={[styles.infoValue, { color: theme.colors.text }]}>POS Terminal 01</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Phiên bản:</Text>
                <Text style={[styles.infoValue, { color: theme.colors.text }]}>1.0.0</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Cửa hàng:</Text>
                <Text style={[styles.infoValue, { color: theme.colors.text }]}>TrueAds Store</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Kết nối:</Text>
                <Text style={[styles.infoValue, { color: '#00AA00' }]}>Đã kết nối</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons - Always at bottom */}
        <View
          style={[
            styles.actionButtons,
            {
              flexDirection: isLandscape ? 'row' : 'column',
              marginTop: 20,
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: theme.colors.primary,
                marginBottom: isLandscape ? 0 : 12,
                marginRight: isLandscape ? 8 : 0,
              },
            ]}
            onPress={() => alert('Lưu cài đặt thành công!')}
          >
            <Text style={styles.actionButtonText}>Lưu cài đặt</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: '#FF4444',
                marginLeft: isLandscape ? 8 : 0,
                marginRight: isLandscape ? 8 : 0,
                marginBottom: isLandscape ? 0 : 12,
              },
            ]}
            onPress={() => {
              navigation.navigate('Print');
            }}
          >
            <Text style={styles.actionButtonText}>Kết nối máy in</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: '#FF4444',
                marginLeft: isLandscape ? 8 : 0,
                marginBottom: isLandscape ? 0 : 12,
              },
            ]}
            onPress={() => {
              setSettings(settingsData);
              alert('Khôi phục cài đặt mặc định!');
            }}
          >
            <Text style={styles.actionButtonText}>Khôi phục mặc định</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[
            styles.logoutButton,
            {
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.danger,
              marginTop: 20,
              marginBottom: 30,
            },
          ]}
          onPress={handleLogout}
        >
          <Text style={[styles.logoutButtonText, { color: theme.colors.danger }]}>Đăng xuất</Text>
        </TouchableOpacity>
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
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  content: {
    flex: 1,
  },
  settingsContainer: {
    paddingBottom: 20,
  },
  settingsColumn: {
    // Dynamic flex applied inline
  },
  settingsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 0,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  settingDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  settingInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 100,
    textAlign: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  deviceInfo: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 0,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 15,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  actionButtons: {
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
