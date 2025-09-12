import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Text, View } from 'react-native';
import { Icon } from '~/components/Icon';
import { axiosParent } from '~/configs/axios';
import useDevicesStyles from './styles';

interface DeviceSession {
  token: string;
  platform: string;
  ip: string;
  login_time: string;
  expires_at: string;
  isCurrent?: boolean;
}

export function Devices() {
  const { styles } = useDevicesStyles();
  const [devices, setDevices] = useState<DeviceSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentToken, setCurrentToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem('tokenParent');
        const { token: tokenParent } = JSON.parse(token || '{}');
        setCurrentToken(tokenParent);
        const { data } = await axiosParent.get('/get-devices');

        // Mark the current device
        const devicesWithCurrent = (data || []).map((device: DeviceSession) => ({
          ...device,
          isCurrent: device.token === tokenParent,
        }));

        setDevices(devicesWithCurrent);
      } catch (error) {
        console.error('Error fetching devices:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDevices();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}, ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  const handleLogoutSession = async (sessionToken: string) => {
    if (sessionToken === currentToken) {
      Alert.alert('Thông báo', 'Bạn không thể đăng xuất phiên hiện tại', [{ text: 'Đóng', style: 'cancel' }]);
      return;
    }

    try {
      await axiosParent.post('/logout-session', { token: sessionToken });
      // Remove this session from the list
      setDevices(devices.filter((device) => device.token !== sessionToken));
    } catch (error) {
      console.error('Error logging out session:', error);
      Alert.alert('Lỗi', 'Không thể đăng xuất phiên này. Vui lòng thử lại sau.', [{ text: 'Đóng', style: 'cancel' }]);
    }
  };

  const handleLogoutAllExceptCurrent = async () => {
    try {
      await axiosParent.post('/logout-all-except-current');
      // Keep only the current session
      setDevices(devices.filter((device) => device.isCurrent));
    } catch (error) {
      console.error('Error logging out all sessions:', error);
      Alert.alert('Lỗi', 'Không thể đăng xuất các phiên khác. Vui lòng thử lại sau.', [
        { text: 'Đóng', style: 'cancel' },
      ]);
    }
  };

  const renderSessionItem = ({ item }: { item: DeviceSession }) => (
    <View style={[styles.sessionContainer, item.isCurrent && styles.currentSession]}>
      <View style={styles.sessionInfo}>
        <View style={styles.deviceRow}>
          <Icon name="cellphone-remove" type="material-community" size={20} />
          <Text style={styles.deviceText}>{item.platform || 'Unknown Device'}</Text>
          {item.isCurrent && (
            <View style={styles.currentBadge}>
              <Text style={styles.currentBadgeText}>Hiện tại</Text>
            </View>
          )}
        </View>
        <Text style={styles.ipText}>IP {item.ip}</Text>
        <Text style={styles.timeText}>{formatDate(item.login_time)}</Text>

        {/* {!item.isCurrent && (
          <TouchableOpacity style={styles.logoutButton} onPress={() => handleLogoutSession(item.token)}>
            <Text style={styles.logoutButtonText}>Đăng xuất phiên này</Text>
          </TouchableOpacity>
        )} */}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Phiên đăng nhập</Text>
      {loading ? (
        <Text>Đang tải...</Text>
      ) : (
        <FlatList
          data={devices}
          renderItem={renderSessionItem}
          keyExtractor={(item) => item.token}
          ListEmptyComponent={<Text>Không có phiên đăng nhập nào</Text>}
          // ListFooterComponent={
          //   devices.length > 1 ? (
          //     <TouchableOpacity style={styles.logoutButton} onPress={handleLogoutAllExceptCurrent}>
          //       <Text style={styles.logoutButtonText}>Đăng xuất tất cả ngoại trừ phiên này</Text>
          //     </TouchableOpacity>
          //   ) : null
          // }
        />
      )}
    </View>
  );
}
