import React from 'react';
import { View, Text, StyleSheet, Modal as RNModal, TouchableOpacity, ScrollView, Pressable } from 'react-native';
import { X } from 'lucide-react-native';
import { useTheme } from '@/contexts';
import { Spacing } from '@/constants';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function Modal({ visible, onClose, title, children }: ModalProps) {
  const { theme } = useTheme();

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.modal, { backgroundColor: theme.colors.surface }]} onPress={(e) => e.stopPropagation()}>
          {title && (
            <View style={styles.header}>
              <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <X size={20} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
          )}
          <ScrollView contentContainerStyle={styles.content}>
            {children}
          </ScrollView>
        </Pressable>
      </Pressable>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '90%',
    maxWidth: 400,
    borderRadius: Spacing.radius.xl,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeBtn: {
    padding: Spacing.sm,
  },
  content: {
    padding: Spacing.md,
  },
});
