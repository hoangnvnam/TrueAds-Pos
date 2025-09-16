import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AdaptiveTabBar } from '~/components/AdaptiveTabBar';
import { NotificationHandler } from '~/components/NotificationHandler';
import { PrivateRoute } from '~/components/PrivateRoute';
import { Layout } from '~/components/Layout';
import { useSidebar } from '~/contexts/SidebarContext';
import { useOrientation } from '~/hooks/useOrientation';
import { privateRoutes } from '~/configs/routes';

interface Tab {
  name: string;
  title: string;
  icon: any;
  routeName: string;
}

interface AdaptiveTabNavigatorProps {
  tabs: Tab[];
  initialRouteName?: string;
  navigation?: any; // Add navigation prop
}

export const AdaptiveTabNavigator: React.FC<AdaptiveTabNavigatorProps> = ({
  tabs,
  initialRouteName = 'Home',
  navigation,
}) => {
  const [activeTab, setActiveTab] = useState(initialRouteName);
  const { isLandscape } = useOrientation();
  const { closeFilter, closeSidebar } = useSidebar();

  // Component wrapper cho mỗi tab
  const TabScreenWrapper = React.memo(({ routeName }: { routeName: string }) => {
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

  const handleTabPress = (tabName: string) => {
    setActiveTab(tabName);
  };

  const currentTab = tabs.find((tab) => tab.name === activeTab);
  const currentRouteName = currentTab?.routeName || tabs[0].routeName;

  const containerStyle = isLandscape ? styles.landscapeContainer : styles.portraitContainer;

  return (
    <View style={containerStyle}>
      {isLandscape && <AdaptiveTabBar tabs={tabs} activeTab={activeTab} onTabPress={handleTabPress} />}

      <View style={styles.contentContainer}>
        <TabScreenWrapper routeName={currentRouteName} />
      </View>

      {!isLandscape && <AdaptiveTabBar tabs={tabs} activeTab={activeTab} onTabPress={handleTabPress} />}
    </View>
  );
};

const styles = StyleSheet.create({
  portraitContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  landscapeContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  contentContainer: {
    flex: 1,
  },
});
