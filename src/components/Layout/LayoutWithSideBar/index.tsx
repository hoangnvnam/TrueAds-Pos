import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientBackground } from '~/components/GradientBackground';
import { Header } from '~/components/Header';
import { SideBar } from '~/components/SideBar';
interface LayoutProps {
  children: React.ReactNode;
  style?: ViewStyle;
  back?: boolean;
}

export function LayoutSidebar({ children, style, back }: LayoutProps) {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const onBackBtn = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      const isServiceSelection = navigation.getState().routes[0].name === 'ServiceSelection';
      if (isServiceSelection) {
        navigation.replace('AccessToStore');
      }
    }
  };
  return (
    <GradientBackground style={style}>
      <SideBar />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <Header onBackBtn={back ? onBackBtn : undefined} />
        {children}
      </SafeAreaView>
    </GradientBackground>
  );
}
