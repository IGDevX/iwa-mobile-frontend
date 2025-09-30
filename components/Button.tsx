import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  style,
  textStyle,
  fullWidth = false,
}: ButtonProps) {
  const buttonStyle = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style,
  ];

  const buttonTextStyle = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={disabled ? 1 : 0.8}
    >
      <Text style={buttonTextStyle}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Variants
  primary: {
    backgroundColor: '#5E5DF0',
  },
  secondary: {
    backgroundColor: '#89A083',
  },
  accent: {
    backgroundColor: '#F7F6ED',
  },
  
  // Sizes
  small: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  medium: {
    paddingVertical: 8,
    paddingHorizontal: 18,
  },
  large: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  
  // Text styles
  text: {
    fontWeight: '700',
    textAlign: 'center',
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 24,
  },
  secondaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 24,
  },
  accentText: {
    color: '#4A4459',
    fontSize: 16,
    lineHeight: 24,
  },
  
  // Size text variants
  smallText: {
    fontSize: 14,
    lineHeight: 20,
  },
  mediumText: {
    fontSize: 16,
    lineHeight: 24,
  },
  largeText: {
    fontSize: 18,
    lineHeight: 26,
  },
  
  // States
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  disabledText: {
    opacity: 0.7,
  },
});