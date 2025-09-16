import { createStaticNavigation, StaticParamList, useFocusEffect } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import salesIcon from '~/assets/icons/cart.png';
import reportsIcon from '~/assets/icons/chart.png';
import settingsIcon from '~/assets/icons/menu.png';
import inventoryIcon from '~/assets/icons/order.png';
import { AdaptiveTabNavigator } from '~/components/AdaptiveTabNavigator';
import { NotificationHandler } from '~/components/NotificationHandler';
import { useSidebar } from '~/contexts/SidebarContext';
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
// Sử dụng AdaptiveTabNavigator thay vì BottomTabNavigator
const MainTabNavigator = (props: any) => {
  return <AdaptiveTabNavigator tabs={tabs} initialRouteName="Home" navigation={props.navigation} />;
};

const RootStack = createNativeStackNavigator({
  initialRouteName: 'Login',
  screens: {
    HomeTabs: {
      screen: MainTabNavigator,
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
