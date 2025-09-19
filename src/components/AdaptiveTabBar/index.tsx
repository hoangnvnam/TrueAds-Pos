import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Image } from 'react-native';
import { useTheme } from '~/hooks/useTheme';
import { useOrientation } from '~/hooks/useOrientation';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Tab {
  name: string;
  title: string;
  icon: any;
  routeName: string;
}

interface AdaptiveTabBarProps {
  tabs: Tab[];
  activeTab: string;
  onTabPress: (tabName: string) => void;
}

export const AdaptiveTabBar: React.FC<AdaptiveTabBarProps> = ({ tabs, activeTab, onTabPress }) => {
  const theme = useTheme();
  const { isLandscape } = useOrientation();

  const tabBarStyle = isLandscape
    ? {
        ...styles.sideTabBar,
        backgroundColor: theme.colors.tabBar,
        borderRightWidth: 1,
        borderRightColor: theme.colors.border,
      }
    : {
        ...styles.bottomTabBar,
        backgroundColor: theme.colors.tabBar,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
      };

  const tabItemStyle = isLandscape ? styles.sideTabItem : styles.bottomTabItem;

  const tabIconStyle = isLandscape ? styles.sideTabIcon : styles.bottomTabIcon;

  return (
    <SafeAreaView style={tabBarStyle}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.name;
        const iconColor = isActive ? theme.colors.primary : theme.colors.text;

        return (
          <TouchableOpacity
            key={tab.name}
            style={[
              tabItemStyle,
              isActive &&
                isLandscape && {
                  backgroundColor: theme.colors.primary + '20',
                  borderRightWidth: 2,
                  borderRightColor: theme.colors.primary,
                },
            ]}
            onPress={() => onTabPress(tab.name)}
          >
            <Image source={tab.icon} tintColor={iconColor} style={tabIconStyle} resizeMode="contain" />
          </TouchableOpacity>
        );
      })}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  bottomTabBar: {
    flexDirection: 'row',
    height: 50,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  sideTabBar: {
    flexDirection: 'column',
    paddingVertical: 10,
    justifyContent: 'flex-start',
  },
  bottomTabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  sideTabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 12,
    marginBottom: 5,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  bottomTabIcon: {
    width: 20,
    height: 20,
  },
  sideTabIcon: {
    width: 18,
    height: 18,
    marginRight: 10,
  },
});
