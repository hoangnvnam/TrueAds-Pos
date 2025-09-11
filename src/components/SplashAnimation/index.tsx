import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef } from 'react';
import { Animated, Dimensions, View } from 'react-native';
import { GradientBackground } from '~/components/GradientBackground';
import logoImage from '../../../assets/logo.png';
import textImage from '../../../assets/text.png';
import logoText from '../../../assets/logotext.png';
import { styles } from './styles';
import { isMobile } from '~/utils/devices';

const { height, width } = Dimensions.get('window');
SplashScreen.preventAutoHideAsync();

export function SplashAnimation({ setIsReady }: { setIsReady: (isReady: boolean) => void }) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;
  const translateXAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const textTranslateX = useRef(new Animated.Value(width)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(0)).current;
  const scaleText = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    // Start the animation sequence
    if (isMobile()) {
      Animated.sequence([
        // Zoom in with opacity
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 3,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1.5,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        // Zoom out
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        // Move to top-left and scale down
        Animated.parallel([
          Animated.timing(translateYAnim, {
            toValue: -height * 0.73,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(translateXAnim, {
            toValue: -width * 0.33,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.5,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),

        Animated.parallel([
          Animated.timing(textTranslateX, {
            toValue: 0,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(textOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(500),
      ]).start(() => {
        setIsReady(true);
        SplashScreen.hideAsync();
      });
    } else {
      Animated.sequence([
        // Zoom in with opacity
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: isMobile() ? 3 : 5,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1.5,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        // Zoom out
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        // Move to top-left and scale down
        Animated.parallel([
          Animated.timing(translateYAnim, {
            toValue: -height - 100,
            duration: 500,
            useNativeDriver: true,
          }),

          Animated.timing(scaleAnim, {
            toValue: 0.5,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(textTranslateY, {
            toValue: height / 2,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(textOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(scaleText, {
            toValue: 2.5,
            duration: 700,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(500),
      ]).start(() => {
        setIsReady(true);
        SplashScreen.hideAsync();
      });
    }
  }, []);

  return (
    <GradientBackground>
      <View style={styles.container}>
        <Animated.Image
          source={logoImage}
          style={[
            styles.logo,
            {
              transform: [{ scale: scaleAnim }, { translateY: translateYAnim }, { translateX: translateXAnim }],
              opacity: opacityAnim,
            },
          ]}
        />
        <Animated.Image
          source={textImage}
          style={[
            styles.text,
            {
              transform: [{ translateX: textTranslateX }],
              opacity: textOpacity,
            },
          ]}
        />
        <Animated.Image
          source={logoText}
          style={[
            styles.logoText,
            { transform: [{ translateY: textTranslateY }, { scale: scaleText }], opacity: textOpacity },
          ]}
        />
      </View>
    </GradientBackground>
  );
}
