import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/contexts';
import { Spacing } from '@/constants';

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'neutral';

interface BadgeProps {
  text: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export function Badge({ text, variant = 'primary', size = 'md', style }: BadgeProps) {
  const { theme } = useTheme();

  const getColors = () => {
    switch (variant) {
      case 'primary':
        return { bg: theme.colors.primary[100], text: theme.colors.primary[700] };
      case 'secondary':
        return { bg: theme.colors.secondary[100], text: theme.colors.secondary[700] };
      case 'success':
        return { bg: theme.colors.success[100], text: theme.colors.success[700] };
      case 'error':
        return { bg: theme.colors.error[100], text: theme.colors.error[700] };
      case 'warning':
        return { bg: theme.colors.warning[100], text: theme.colors.warning[800] };
      case 'info':
        return { bg: theme.colors.info[100], text: theme.colors.info[700] };
      case 'neutral':
        return { bg: theme.colors.neutral[100], text: theme.colors.neutral[700] };
    }
  };

  const colors = getColors();

  const styles = StyleSheet.create({
    badge: {
      backgroundColor: colors.bg,
      paddingHorizontal: size === 'sm' ? Spacing.sm : Spacing.md,
      paddingVertical: size === 'sm' ? 2 : Spacing.xs,
      borderRadius: Spacing.radius.full,
      alignSelf: 'flex-start',
    },
    text: {
      color: colors.text,
      fontSize: size === 'sm' ? 10 : 12,
      fontWeight: '600',
    },
  });

  return (
    <View style={[styles.badge, style]}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}
