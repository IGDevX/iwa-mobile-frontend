import React from 'react';
import { TouchableOpacity, Text, Image, StyleSheet, ViewStyle, ImageSourcePropType } from 'react-native';

interface LanguageCardProps {
  code: string;
  label: string;
  icon: ImageSourcePropType;
  isSelected: boolean;
  onPress: (code: string) => void;
  style?: ViewStyle;
  size?: number;
}

export default function LanguageCard({
  code,
  label,
  icon,
  isSelected,
  onPress,
  style,
  size = 120,
}: LanguageCardProps) {
  const cardStyle = [
    styles.langCard,
    { width: size, height: size, borderRadius: size / 2 },
    isSelected && styles.selectedLangCard,
    { transform: [{ scale: isSelected ? 1.1 : 1 }] },
    style,
  ];

  return (
    <TouchableOpacity
      style={cardStyle}
      activeOpacity={0.8}
      onPress={() => onPress(code)}
    >
      <Image source={icon} style={styles.langIcon} />
      <Text style={[styles.langText, isSelected && styles.selectedLangText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  langCard: {
    backgroundColor: '#F7F6ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  selectedLangCard: {
    borderColor: '#89A083',
    borderWidth: 0,
  },
  langIcon: {
    width: 60,
    height: 60,
    marginBottom: 12,
  },
  langText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#4A4459',
    textAlign: 'center',
  },
  selectedLangText: {
    color: '#89A083',
    fontWeight: '700',
  },
});