import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStaticNavigation, StaticParamList, useFocusEffect } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { Image } from 'react-native';
import salesIcon from '~/assets/icons/cart.png';
import reportsIcon from '~/assets/icons/chart.png';
import settingsIcon from '~/assets/icons/menu.png';
import inventoryIcon from '~/assets/icons/order.png';
import { NotificationHandler } from '~/components/NotificationHandler';
import { useSidebar } from '~/contexts/SidebarContext';
import { useTheme } from '~/hooks/useTheme';
import { Layout } from '../components/Layout';
import { PrivateRoute } from '../components/PrivateRoute';
import { PublicRoute } from '../components/PublicRoute';
import { privateRoutes, routes } from '../configs/routes';

const tabs = [
  {
    name: 'Home',
    title: 'Bán hàng',
    icon: salesIcon,
    routeName: 'HomeTabs',
  },
  {
    name: 'POSInventory',
    title: 'Kho hàng',
    icon: inventoryIcon,
    routeName: 'POSInventory',
  },
  {
    name: 'POSReports',
    title: 'Báo cáo',
    icon: reportsIcon,
    routeName: 'POSReports',
  },
  {
    name: 'POSSettings',
    title: 'Cài đặt',
    icon: settingsIcon,
    routeName: 'POSSettings',
  },
];
// Component wrapper cho mỗi tab
const TabScreenWrapper = React.memo(({ routeName, navigation }: { routeName: string; navigation: any }) => {
  const { closeFilter, closeSidebar } = useSidebar();
  useFocusEffect(
    React.useCallback(() => {
      return () => {
        closeFilter();
        closeSidebar();
      };
    }, [closeFilter, closeSidebar]),
  );

  const Component = privateRoutes.find((r) => r.name === routeName)?.component;
  return (
    <PrivateRoute>
      <Layout
        layout={privateRoutes.find((r) => r.name === routeName)?.layout}
        back={routeName === 'HomeTabs' ? false : true}
      >
        {Component && <Component navigation={navigation} />}
        <NotificationHandler />
      </Layout>
    </PrivateRoute>
  );
});

// Sử dụng hook useTheme để lấy theme hiện tại
const BottomTabNavigator = () => {
  const theme = useTheme();
  const Tab = createBottomTabNavigator();

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        lazy: true,
        tabBarStyle: {
          backgroundColor: theme.colors.tabBar,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
        },
        tabBarActiveTintColor: theme.colors.primary,
      }}
    >
      {tabs.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          options={{
            headerShown: false,
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
          {(props) => <TabScreenWrapper routeName={tab.routeName} {...props} />}
        </Tab.Screen>
      ))}
    </Tab.Navigator>
  );
};

const RootStack = createNativeStackNavigator({
  initialRouteName: 'Login',
  screens: {
    HomeTabs: {
      screen: BottomTabNavigator,
      options: {
        headerShown: false,
      },
    },
    ...routes.reduce((acc, route) => {
      if (route.name === 'HomeTabs' || tabs.some((tab) => tab.name === route.name)) {
        return acc;
      }
      const ScreenComponent = route.component;
      const Wrapper = route.isPrivate ? PrivateRoute : PublicRoute;
      return {
        ...acc,
        [route.name]: {
          screen: (props: any) => (
            <Wrapper>
              <Layout layout={route.layout} back={route.back}>
                <ScreenComponent {...props} />
              </Layout>
            </Wrapper>
          ),
          options: route.options,
          linking: route.linking,
        },
      };
    }, {}),
  },
});

export const Navigation = createStaticNavigation(RootStack);

declare global {
  namespace ReactNavigation {
    interface RootParamList extends StaticParamList<typeof RootStack> {
      Login: undefined;
      AccessToStore: undefined;
      Settings: undefined;
      Devices: undefined;
      BarcodeScanner: undefined;
      Packages: undefined;
      Purchase: { param?: any };
      HomeTabs: undefined;
      Print: undefined;
    }
  }
}
