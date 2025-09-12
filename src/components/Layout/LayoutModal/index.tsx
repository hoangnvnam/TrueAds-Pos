import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientBackground } from '~/components/GradientBackground';
import { HeaderModal } from './Header';
import React from 'react';
interface LayoutProps {
  children: React.ReactNode;
  style?: ViewStyle;
  back?: boolean;
}

export function LayoutModal({ children, style, back }: LayoutProps) {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const onBackBtn = () => {
    navigation.goBack();
  };

  return (
    <GradientBackground style={style}>
      <SafeAreaView style={{ flex: 1 }}>
        <HeaderModal onBackBtn={back ? onBackBtn : undefined} />
        {children}
      </SafeAreaView>
    </GradientBackground>
  );
}
