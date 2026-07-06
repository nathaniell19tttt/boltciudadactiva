import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity, StyleProp } from 'react-native';
import { useTheme } from '@/contexts';
import { Spacing } from '@/constants';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padding?: number;
  shadow?: 'sm' | 'md' | 'lg' | 'none';
  variant?: 'default' | 'outlined' | 'elevated';
  onPress?: () => void;
}

export function Card({
  children,
  style,
  padding = Spacing.base,
  shadow = 'sm',
  variant = 'default',
  onPress,
}: CardProps) {
  const { theme } = useTheme();

  const getShadow = () => {
    if (shadow === 'none' || variant === 'outlined') return {};
    return Spacing.shadows[shadow];
  };

  const cardStyle = {
    backgroundColor: theme.colors.card,
    borderRadius: Spacing.radius.xl,
    padding,
    borderWidth: variant === 'outlined' ? 1 : 0,
    borderColor: theme.colors.border,
    ...getShadow(),
  };

  if (onPress) {
    return (
      <TouchableOpacity style={[cardStyle, style]} onPress={onPress} activeOpacity={0.8}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[cardStyle, style]}>{children}</View>;
}
