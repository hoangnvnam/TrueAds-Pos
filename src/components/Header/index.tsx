import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useSidebar } from '../../contexts/SidebarContext';
import { Icon } from '../Icon';
import { useHeaderStyles } from './styles';
import { useTheme } from '~/hooks/useTheme';

export function Header({ onBackBtn }: { onBackBtn?: () => void }) {
  const theme = useTheme();
  const { authInfo } = useAuth();
  const { styles } = useHeaderStyles();
  const { openSidebar } = useSidebar();
  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerLeft}>
        {onBackBtn !== undefined && (
          <TouchableOpacity onPress={onBackBtn}>
            <Icon name="arrow-left" type="material-community" size={24} style={styles.headerLeftIcon} />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.headerLeft} onPress={openSidebar}>
          <View style={[styles.avatar]}>
            <Text style={{ color: theme.colors.text }}>{authInfo?.display_name?.charAt(0)}</Text>
          </View>
          <Text style={styles.headerTitle}>{authInfo?.display_name}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.headerRight}>
        {/* <TouchableOpacity style={styles.headerRightButton}>
          <Icon name="bell-outline" type="material-community" size={24} style={styles.headerRightIcon} />
        </TouchableOpacity> */}
        <TouchableOpacity style={styles.headerRightButton} onPress={openSidebar}>
          <Icon name="widgets-outline" type="material-community" size={24} style={styles.headerRightIcon} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
