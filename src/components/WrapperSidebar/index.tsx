import React, { useEffect, useRef, useState } from 'react';
import { Animated, Platform, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DIMENSIONS } from '~/constants/dimensions';
import { useWrapperSidebarStyles } from './styles';
import { useTheme } from '~/hooks/useTheme';

export function WrapperSidebar({
  children,
  closeSidebar,
  openSidebar,
  isOpen,
  slide,
  align = 'left',
  padding = {
    horizontal: 20,
    vertical: 20,
  },
}: {
  children: React.ReactNode;
  closeSidebar: () => void;
  openSidebar: () => void;
  isOpen: boolean;
  slide: boolean;
  align?: 'left' | 'right';
  padding?: {
    left?: number;
    right?: number;
    bottom?: number;
    horizontal?: number;
    vertical?: number;
  };
}) {
  const theme = useTheme();
  const slideAnim = useRef(
    new Animated.Value(align === 'left' ? -DIMENSIONS.SIDEBAR_WIDTH : DIMENSIONS.SCREEN_WIDTH),
  ).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { styles } = useWrapperSidebarStyles();
  const insets = useSafeAreaInsets();
  const [showSideBar, setShowSideBar] = useState(isOpen);
  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: isOpen
          ? align === 'left'
            ? 0
            : DIMENSIONS.SCREEN_WIDTH - DIMENSIONS.SIDEBAR_WIDTH
          : align === 'left'
            ? -DIMENSIONS.SIDEBAR_WIDTH
            : DIMENSIONS.SCREEN_WIDTH,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: isOpen ? 0.5 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
    if (isOpen) {
      setShowSideBar(true);
    } else {
      setTimeout(() => {
        setShowSideBar(false);
      }, 300);
    }
  }, [isOpen, align]);

  return (
    showSideBar && (
      <>
        <Animated.View
          style={[
            styles.overlay,
            {
              opacity: fadeAnim,
              position: 'absolute',
              left: 0,
              top: 0,
              right: 0,
              bottom: 0,
              backgroundColor: '#000',
              zIndex: Platform.OS !== 'ios' ? (isOpen ? 1000 : -1) : 1000,
            },
          ]}
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => {
              closeSidebar();
            }}
            activeOpacity={1}
          />
        </Animated.View>
        {/* Touch area for swipe gesture */}
        <View
          // {...panResponder.panHandlers}
          style={{
            position: 'absolute',
            [align]: 0,
            top: 0,
            bottom: 0,
            width: 10,
            zIndex: 1001,
          }}
        />
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ translateX: slideAnim }],
              position: 'absolute',
              [align]: 0,
              top: 0,
              bottom: 0,
              width: DIMENSIONS.SIDEBAR_WIDTH,
              paddingHorizontal: padding?.horizontal,
              paddingVertical: padding?.vertical,
              paddingLeft: padding?.left,
              paddingRight: padding?.right,
              paddingBottom: padding?.bottom,
            },
          ]}
        >
          {/* Close button */}
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: insets.top + 5,
              [align === 'left' ? 'right' : 'left']: 10,
              width: 30,
              height: 30,
              borderRadius: 15,
              backgroundColor: theme.colors.close,
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1002,
            }}
            onPress={() => {
              closeSidebar();
            }}
          >
            <Text style={{ fontSize: 20, color: theme.colors.text }}>×</Text>
          </TouchableOpacity>
          {children}
        </Animated.View>
      </>
    )
  );
}
