import { useRoute } from '@react-navigation/native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Icon } from '~/components/Icon';
import { Image } from '~/components/Image';
import { useAuth } from '~/contexts/AuthContext';
import { useComponentStyles } from '~/hooks/useComponentStyles';
import { globalStyles } from '~/styles/globalStyles';

export function HeaderModal({ param, onBackBtn, onPressAvatar }: any) {
  const { styles } = useHeaderModalStyles();
  const { authInfo } = useAuth();

  const params = useRoute().params as any;

  return (
    <>
      <View style={[styles.container, globalStyles.dropShadow]}>
        <View style={styles.headerLeft}>
          {onBackBtn && (
            <TouchableOpacity onPress={onBackBtn}>
              <Icon name="arrow-left" type="material-community" size={24} style={styles.headerLeftIcon} />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.headerLeft} onPress={onPressAvatar}>
            {params?.avatar ? (
              <Image source={params.avatar} borderRadius={99} />
            ) : (
              <View style={[styles.avatar]}>
                <Text style={{ color: '#fff' }}>{authInfo?.display_name?.charAt(0)}</Text>
              </View>
            )}
            <Text style={styles.headerTitle}>{params?.name || authInfo?.display_name}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const useHeaderModalStyles = () =>
  useComponentStyles((theme) => ({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 10,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },

    headerRightButton: {
      padding: 5,
    },
    headerRightIcon: {
      color: theme.colors.text,
    },
    headerTitle: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: 'bold',
    },
  }));
