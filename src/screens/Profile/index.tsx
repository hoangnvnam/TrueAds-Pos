import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useAuth } from '~/contexts/AuthContext';
import { getQueryData } from '~/hooks/useQuery';
import { getStoreDomain } from '~/utils/storedomain';
import { useProfileStyles } from './styles';

type Props = {
  route: {
    params: {
      user: string;
    };
  };
};

export function Profile({ route }: Props) {
  const { styles } = useProfileStyles();
  const { authInfo: userInfo } = useAuth();
  const dataPagesConnected = getQueryData('pagesConnected');
  const [storeDomain, setStoreDomain] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const storeDomain = await getStoreDomain();
      setStoreDomain(storeDomain);
    })();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>THÔNG TIN TÀI KHOẢN</Text>
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{userInfo.email}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Số điện thoại</Text>
            <Text style={styles.value}>{userInfo.phone_number || 'Chưa có'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Facebook Id</Text>
            <Text style={styles.value}>{userInfo.facebookId || 'Chưa có'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Tài khoản TrueAds</Text>
            <Text style={styles.value}>{storeDomain?.toString().replace('https://', '') || 'Chưa có'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Trang đã liên kết</Text>
            <View style={styles.linkedPages}>
              {dataPagesConnected?.data?.map((page: any, index: number) => (
                <Text key={index} style={styles.linkedPage}>
                  {page.name} ({page.come_from})
                </Text>
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* Other Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>CÀI ĐẶT KHÁC</Text>
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Ngôn ngữ</Text>
            <Text style={styles.value}>{userInfo.language || 'Tiếng Việt'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Múi giờ</Text>
            <Text style={styles.value}>{userInfo.location || 'Hồ Chí Minh, Việt Nam'}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
