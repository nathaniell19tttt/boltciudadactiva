import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Lock, X } from 'lucide-react-native';
import { useDemo } from '@/contexts/DemoContext';

const PRIMARY = '#1976D2';
const TEXT_PRIMARY = '#1A1A2E';
const TEXT_SECONDARY = '#5C6370';

export function DemoAlert() {
  const router = useRouter();
  const { isDemoAlertVisible, hideDemoAlert, exitDemoMode } = useDemo();

  const handleRegister = () => {
    hideDemoAlert();
    exitDemoMode();
    router.replace('/register');
  };

  const handleLogin = () => {
    hideDemoAlert();
    exitDemoMode();
    router.replace('/login');
  };

  const handleClose = () => {
    hideDemoAlert();
  };

  return (
    <Modal
      visible={isDemoAlertVisible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <X size={20} color={TEXT_SECONDARY} />
          </TouchableOpacity>

          <View style={styles.iconWrapper}>
            <Lock size={32} color={PRIMARY} />
          </View>

          <Text style={styles.title}>Accion no disponible</Text>
          <Text style={styles.message}>
            Para realizar esta accion necesitas crear una cuenta o iniciar sesion.
            {'\n\n'}
            Registrate gratis para acceder a todas las funciones.
          </Text>

          <View style={styles.buttons}>
            <TouchableOpacity style={styles.primaryButton} onPress={handleRegister}>
              <Text style={styles.primaryButtonText}>Crear cuenta gratis</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={handleLogin}>
              <Text style={styles.secondaryButtonText}>Iniciar sesion</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelButtonText}>Seguir explorando</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    paddingTop: 24,
    width: '100%',
    maxWidth: 340,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 4,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 15,
    color: TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  buttons: {
    gap: 10,
  },
  primaryButton: {
    backgroundColor: PRIMARY,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButton: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: TEXT_PRIMARY,
  },
  cancelButton: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    fontWeight: '500',
  },
});
