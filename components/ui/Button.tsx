import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import { useTheme } from '@/contexts';
import { Spacing } from '@/constants';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
}: ButtonProps) {
  const { theme } = useTheme();
  const isDisabled = disabled || loading;

  const getBackgroundColor = () => {
    if (disabled) return theme.colors.neutral[300];
    switch (variant) {
      case 'primary':
        return theme.colors.primary[500];
      case 'secondary':
        return theme.colors.secondary[500];
      case 'outline':
      case 'ghost':
        return 'transparent';
      case 'danger':
        return theme.colors.error[500];
      default:
        return theme.colors.primary[500];
    }
  };

  const getTextColor = () => {
    if (disabled) return theme.colors.neutral[500];
    switch (variant) {
      case 'outline':
        return theme.colors.primary[500];
      case 'ghost':
        return theme.colors.text;
      default:
        return '#FFFFFF';
    }
  };

  const getBorderColor = () => {
    if (variant === 'outline') {
      return disabled ? theme.colors.neutral[300] : theme.colors.primary[500];
    }
    return 'transparent';
  };

  const getPadding = () => {
    switch (size) {
      case 'sm':
        return { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md };
      case 'lg':
        return { paddingVertical: Spacing.lg, paddingHorizontal: Spacing['2xl'] };
      default:
        return { paddingVertical: Spacing.base, paddingHorizontal: Spacing.xl };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'sm':
        return 13;
      case 'lg':
        return 17;
      default:
        return 15;
    }
  };

  const buttonStyle: ViewStyle = {
    backgroundColor: getBackgroundColor(),
    borderColor: getBorderColor(),
    borderWidth: variant === 'outline' ? 1.5 : 0,
    borderRadius: Spacing.radius.lg,
    ...getPadding(),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...(fullWidth && { width: '100%' }),
  };

  const styles = StyleSheet.create({
    button: buttonStyle,
    text: {
      color: getTextColor(),
      fontSize: getFontSize(),
      fontWeight: '600',
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
    },
  });

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={getTextColor()} size="small" />
        ) : (
          <>
            {leftIcon}
            <Text style={[styles.text, textStyle]}>{title}</Text>
            {rightIcon}
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}
