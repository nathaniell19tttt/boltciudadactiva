import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { useTheme } from '@/contexts';
import { Spacing } from '@/constants';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  style?: ViewStyle;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Buscar...',
  onClear,
  style,
}: SearchBarProps) {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: Spacing.radius.xl,
      paddingHorizontal: Spacing.base,
      height: 48,
    },
    input: {
      flex: 1,
      fontSize: 15,
      color: theme.colors.text,
      marginLeft: Spacing.sm,
    },
    clearButton: {
      padding: Spacing.xs,
    },
  });

  return (
    <View style={[styles.container, style]}>
      <Search size={20} color={theme.colors.textSecondary} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textTertiary}
      />
      {value.length > 0 && onClear && (
        <TouchableOpacity style={styles.clearButton} onPress={onClear}>
          <X size={18} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );
}
