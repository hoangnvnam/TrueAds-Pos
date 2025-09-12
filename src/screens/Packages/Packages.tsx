import { useNavigation } from '@react-navigation/native';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { Linking, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from '~/components/Icon';
import { SettingItem } from '~/components/SwitchItem';
import { axiosParent } from '~/configs/axios';
import { useLoading } from '~/contexts/LoadingContext';
import { useComponentStyles } from '~/hooks/useComponentStyles';

export function Packages() {
  const { showLoading, hideLoading } = useLoading();
  const navigation = useNavigation();
  const [yourStores, setYourStores] = useState<any[]>([]);
  const { styles } = useProfileStyles();

  useEffect(() => {
    getStores();
  }, []);
  const getStores = async () => {
    try {
      showLoading();
      const { data, status } = await axiosParent.get('/stores');
      if (status === 200) {
        setYourStores(data.dataOwneSite || []);
      }
    } catch (error: any) {
      console.log('error', error.response?.data);
    } finally {
      hideLoading();
    }
  };
  return (
    <>
      {/* {Platform.OS === 'ios' && (
        <SettingItem
          title="Điều khoản chính sách"
          icon={<Icon name="description" size={24} color="#757575" />}
          style={{ marginBottom: 10, marginTop: 10 }}
          onPress={async () => {
            try {
              await WebBrowser.openBrowserAsync('https://trueads.ai/privacy-policy/');
            } catch (error) {
              Linking.openURL('https://trueads.ai/privacy-policy/');
            }
          }}
        />
      )}
      {Platform.OS === 'ios' && (
        <SettingItem
          title="EULA - Thỏa thuận Giấy phép Người dùng"
          icon={<Icon name="description" size={24} color="#757575" />}
          style={{ marginBottom: 10 }}
          onPress={async () => {
            try {
              await WebBrowser.openBrowserAsync('https://www.apple.com/legal/internet-services/itunes/dev/stdeula/');
            } catch (error) {
              Linking.openURL('https://www.apple.com/legal/internet-services/itunes/dev/stdeula/');
            }
          }}
        />
      )} */}
      <Text style={styles.headerTitle}>Chọn cửa hàng của bạn để tiếp tục</Text>
      <ScrollView style={{ flex: 1, padding: 20 }} showsVerticalScrollIndicator={false}>
        {yourStores.map((store, index) => (
          <TouchableOpacity
            key={index}
            style={styles.container}
            onPress={() => {
              navigation.navigate('Purchase', {
                param: store.abc,
              });
            }}
          >
            <View style={{ marginBottom: 10 }}>
              <Text style={[styles.text, { fontWeight: 'bold' }]}>{store.site_title}</Text>
              <Text style={styles.text}>{store.site_host}</Text>
            </View>

            <Icon name="arrow-right" type="material-community" size={24} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </>
  );
}

const useProfileStyles = () =>
  useComponentStyles((theme) => ({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      padding: 20,
      borderRadius: 10,
      marginBottom: 15,
      shadowColor: theme.colors.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    text: {
      color: theme.colors.text,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 20,
      marginTop: 10,
      color: theme.colors.primary,
      textAlign: 'center',
    },
  }));
