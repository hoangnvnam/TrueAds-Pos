import React from 'react';
import { Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSwitchItemStyles } from './styles';

interface SettingItemProps {
  title: string;
  rightText?: string;
  onPress?: () => void;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export const SettingItem = ({ title, rightText, onPress, icon, style }: SettingItemProps) => {
  const { styles } = useSwitchItemStyles();
  return (
    <TouchableOpacity style={[styles.container, style]} onPress={onPress}>
      <View style={styles.leftContent}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.rightContent}>
        {rightText && <Text style={styles.rightText}>{rightText}</Text>}
        <Icon name="chevron-right" size={24} color="#BDBDBD" />
      </View>
    </TouchableOpacity>
  );
};
