import React from 'react';
import {
  Platform,
  StyleProp,
  TouchableHighlight,
  TouchableNativeFeedback,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

interface ButtonRippleProps {
  onPress?: () => void;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  rippleColor?: string;
  activeOpacity?: number;
  touchableComponent?: 'TouchableOpacity' | 'TouchableHighlight';
  onLongPress?: () => void;
}

export function ButtonRipple({
  onPress,
  onLongPress,
  children,
  style,
  rippleColor = '#f0f0f0',
  activeOpacity = 0.7,
  touchableComponent = 'TouchableOpacity',
}: ButtonRippleProps) {
  const TouchableComponent = touchableComponent === 'TouchableOpacity' ? TouchableOpacity : TouchableHighlight;
  if (Platform.OS === 'android') {
    return (
      <TouchableNativeFeedback
        onPress={onPress}
        onLongPress={onLongPress}
        background={TouchableNativeFeedback.Ripple(rippleColor, false)}
      >
        <View style={style}>{children}</View>
      </TouchableNativeFeedback>
    );
  }

  return (
    <TouchableComponent
      onPress={onPress}
      activeOpacity={activeOpacity}
      underlayColor={rippleColor}
      onLongPress={onLongPress}
      style={[
        {
          backgroundColor: 'transparent',
        },
      ]}
    >
      <View style={style}>{children}</View>
    </TouchableComponent>
  );
}
