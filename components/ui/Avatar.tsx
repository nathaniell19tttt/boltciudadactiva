import React, { useMemo } from 'react';
import { View, Image, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/contexts';
import { Spacing } from '@/constants';

interface AvatarProps {
  source?: string | null;
  name?: string;
  size?: number;
  style?: ViewStyle;
  online?: boolean;
}

export function Avatar({ source, name, size = 48, style, online }: AvatarProps) {
  const { theme } = useTheme();

  const initials = useMemo(() => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  }, [name]);

  const backgroundColor = useMemo(() => {
    const colors = [
      theme.colors.primary[500],
      theme.colors.secondary[500],
      theme.colors.success[500],
      theme.colors.info[500],
    ];
    const index = (name?.charCodeAt(0) || 0) % colors.length;
    return colors[index];
  }, [name, theme]);

  const styles = StyleSheet.create({
    container: {
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: source ? 'transparent' : backgroundColor,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
    image: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    text: {
      color: '#FFFFFF',
      fontSize: size * 0.4,
      fontWeight: '700',
    },
    onlineIndicator: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: size * 0.28,
      height: size * 0.28,
      borderRadius: size * 0.14,
      backgroundColor: theme.colors.success[500],
      borderWidth: 2,
      borderColor: theme.colors.card,
    },
  });

  return (
    <View style={[styles.container, style]}>
      {source ? (
        <Image source={{ uri: source }} style={styles.image} />
      ) : (
        <Text style={styles.text}>{initials}</Text>
      )}
      {online && <View style={styles.onlineIndicator} />}
    </View>
  );
}
