import React from 'react';
import { ActivityIndicator, Text, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';
import { useTheme } from '~/hooks/useTheme';
import { Icon } from '../Icon';
import { useInputStyles } from './styles';
interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  close?: boolean;
  value?: string;
  setValue?: (value: string) => void;
  radius?: number;
  height?: number;
  loading?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  padding?: {
    left?: number;
    right?: number;
    top?: number;
    bottom?: number;
    horizontal?: number;
    vertical?: number;
  };
  multiline?: boolean;
  fontSize?: number;
  onFocus?: () => void;
}

export function Input({
  label,
  error,
  value,
  setValue,
  style,
  icon,
  close,
  radius,
  height,
  loading = false,
  keyboardType = 'default',
  padding,
  multiline = false,
  fontSize = 16,
  onFocus,
  ...props
}: InputProps) {
  const theme = useTheme();
  const { styles } = useInputStyles();
  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          radius && { borderRadius: radius },
          padding && {
            paddingLeft: padding.left,
            paddingRight: padding.right,
            paddingTop: padding.top,
            paddingBottom: padding.bottom,
            paddingHorizontal: padding.horizontal,
            paddingVertical: padding.vertical,
          },
        ]}
      >
        {icon && <View style={styles.icon}>{icon}</View>}
        <TextInput
          style={[
            styles.input,
            error && styles.inputError,
            height && { height },
            multiline && {
              maxHeight: 120,
              minHeight: 40,
              height: 'auto',
            },
            fontSize && { fontSize: fontSize },
          ]}
          value={value}
          onChangeText={setValue}
          placeholderTextColor={theme.colors.placeholder}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={multiline ? 4 : 1}
          onFocus={onFocus}
          {...props}
        />
        {close && loading === false && value && value.length > 0 ? (
          <TouchableOpacity onPress={() => setValue?.('')}>
            <Icon name="close-circle" type="ionicons" size={25} color={theme.colors.icon} />
          </TouchableOpacity>
        ) : (
          loading && <ActivityIndicator size="small" color={theme.colors.icon} />
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}
