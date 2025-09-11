import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Image } from 'react-native';
import { useTheme } from '~/hooks/useTheme';
import { POSInventory } from '~/screens/POS/Inventory';
import { POSReports } from '~/screens/POS/Reports';
import { Cashier } from '~/screens/POS/Cashier';
import { POSSettings } from '~/screens/POS/Settings';

// Import icons
import { useFocusEffect } from '@react-navigation/native';
import * as ScreenOrientation from 'expo-screen-orientation';
import salesIcon from '~/assets/icons/cart.png';
import reportsIcon from '~/assets/icons/chart.png';
import settingsIcon from '~/assets/icons/menu.png';
import inventoryIcon from '~/assets/icons/order.png';
import { GradientBackground } from '~/components/GradientBackground';
import { Layout } from '~/components/Layout';
import { NotificationHandler } from '~/components/NotificationHandler';
import { PrivateRoute } from '~/components/PrivateRoute';
import { useSidebar } from '~/contexts/SidebarContext';

const posTabs = [
  {
    name: 'Cashier',
    title: 'Bán hàng',
    icon: salesIcon,
    component: Cashier,
    routeName: 'Cashier',
  },
  {
    name: 'POSInventory',
    title: 'Kho hàng',
    icon: inventoryIcon,
    component: POSInventory,
    routeName: 'POSInventory',
  },
  {
    name: 'POSReports',
    title: 'Báo cáo',
    icon: reportsIcon,
    component: POSReports,
    routeName: 'POSReports',
  },
  {
    name: 'POSSettings',
    title: 'Cài đặt',
    icon: settingsIcon,
    component: POSSettings,
    routeName: 'POSSettings',
  },
];

const POSTabScreenWrapper = React.memo(
  ({
    routeName,
    navigation,
    Component,
    layout = GradientBackground,
  }: {
    routeName: string;
    navigation: any;
    Component: React.ComponentType<any>;
    layout?: React.ComponentType<any>;
  }) => {
    const { closeFilter, closeSidebar } = useSidebar();

    useFocusEffect(
      React.useCallback(() => {
        return () => {
          closeFilter();
          closeSidebar();
        };
      }, [closeFilter, closeSidebar]),
    );

    useFocusEffect(
      React.useCallback(() => {
        const unlockOrientation = async () => {
          await ScreenOrientation.unlockAsync();
        };

        unlockOrientation();
      }, []),
    );

    return (
      <PrivateRoute>
        <Layout layout={layout} back={true}>
          <Component navigation={navigation} />
          <NotificationHandler />
        </Layout>
      </PrivateRoute>
    );
  },
);

export const POSNavigator = () => {
  const theme = useTheme();
  const Tab = createBottomTabNavigator();

  return (
    <Tab.Navigator
      initialRouteName="Cashier"
      screenOptions={{
        lazy: true,
        tabBarStyle: {
          backgroundColor: theme.colors.tabBar,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
        },
        tabBarActiveTintColor: theme.colors.primary,
        headerShown: false,
      }}
    >
      {posTabs.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color, size }: { color: string; size: number }) => (
              <Image
                source={tab.icon}
                tintColor={color}
                style={{
                  width: size,
                  height: size,
                }}
                resizeMode="contain"
              />
            ),
          }}
        >
          {(props) => <POSTabScreenWrapper routeName={tab.routeName} Component={tab.component} {...props} />}
        </Tab.Screen>
      ))}
    </Tab.Navigator>
  );
};
