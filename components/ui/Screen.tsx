import React from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ViewStyle,
  ActivityIndicator,
  Text,
} from 'react-native';
import { useTheme } from '@/contexts';
import { Spacing } from '@/constants';

interface ScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
  scroll?: boolean;
  loading?: boolean;
  error?: string | null;
}

export function Screen({ children, style, scroll, loading, error }: ScreenProps) {
  const { theme, isDark } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
      padding: Spacing.screenPadding,
    },
    centerContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorText: {
      color: theme.colors.error[500],
      fontSize: 14,
      textAlign: 'center',
      marginTop: Spacing.md,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={[styles.content, style]}>
        {loading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={theme.colors.primary[500]} />
          </View>
        ) : error ? (
          <View style={styles.centerContent}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          children
        )}
      </View>
    </SafeAreaView>
  );
}
