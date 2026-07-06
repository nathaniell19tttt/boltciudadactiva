import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Edit2, Moon, Sun, Globe, Bell, Lock, HelpCircle, ChevronRight, LogOut, Trash2 } from 'lucide-react-native';
import { useTheme } from '@/contexts';
import { useAuth } from '@/contexts';
import { Card, Button } from '@/components/ui';
import { Spacing } from '@/constants';

export default function SettingsScreen() {
  const router = useRouter();
  const { theme: appTheme, isDark, toggleTheme } = useTheme();
  const { user, profile, signOut } = useAuth();

  const handleDeleteAccount = () => {
    Alert.alert(
      'Eliminar cuenta',
      '¿Estás seguro de que deseas eliminar tu cuenta permanentemente? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            if (user) {
              Alert.alert('Cuenta eliminada', 'Tu cuenta será eliminada. Gracias por usar Ciudad Activa.');
              // En producción: await supabase.auth.admin.deleteUser(user.id)
              await signOut();
              router.replace('/welcome');
            }
          }
        }
      ]
    );
  };

  const handleSignOut = async () => {
    Alert.alert('Cerrar sesión', '¿Estás seguro de que deseas cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesión',
        onPress: async () => {
          await signOut();
          router.replace('/welcome');
        }
      }
    ]);
  };

  const MenuItem = ({ icon: Icon, label, value, onPress, danger }: { icon: any; label: string; value?: string; onPress?: () => void; danger?: boolean }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Icon size={22} color={danger ? appTheme.colors.error[500] : appTheme.colors.textSecondary} />
      <Text style={[styles.menuLabel, danger && { color: appTheme.colors.error[500] }]}>{label}</Text>
      {value && <Text style={[styles.menuValue, { color: appTheme.colors.textSecondary }]}>{value}</Text>}
      <ChevronRight size={18} color={appTheme.colors.textTertiary} />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: appTheme.colors.background }]}>
      {/* Header */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <ArrowLeft size={24} color={appTheme.colors.text} />
      </TouchableOpacity>

      <Text style={[styles.title, { color: appTheme.colors.text }]}>Configuración</Text>

      {/* Appearance */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: appTheme.colors.textSecondary }]}>Aspecto</Text>
        <Card>
          <TouchableOpacity style={styles.menuItem} onPress={toggleTheme}>
            {isDark ? <Sun size={22} color={appTheme.colors.textSecondary} /> : <Moon size={22} color={appTheme.colors.textSecondary} />}
            <Text style={[styles.menuLabel, { color: appTheme.colors.text }]}>Tema</Text>
            <Text style={[styles.menuValue, { color: appTheme.colors.textSecondary }]}>
              {isDark ? 'Oscuro' : 'Claro'}
            </Text>
            <ChevronRight size={18} color={appTheme.colors.textTertiary} />
          </TouchableOpacity>
        </Card>
      </View>

      {/* Notifications */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: appTheme.colors.textSecondary }]}>Notificaciones</Text>
        <Card>
          <MenuItem
            icon={Bell}
            label="Notificaciones push"
            value="Activadas"
            onPress={() => Alert.alert('Notificaciones', 'Configurar notificaciones')}
          />
          <MenuItem
            icon={Bell}
            label="Notificaciones por email"
            value="Activadas"
            onPress={() => Alert.alert('Email', 'Configurar emails')}
          />
        </Card>
      </View>

      {/* Privacy & Security */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: appTheme.colors.textSecondary }]}>Privacidad y seguridad</Text>
        <Card>
          <MenuItem
            icon={Lock}
            label="Cambiar contraseña"
            onPress={() => router.push('/forgot-password')}
          />
          <MenuItem
            icon={Lock}
            label="Verificación de dos factores"
            value="Desactivado"
            onPress={() => Alert.alert('2FA', 'Configuración no disponible')}
          />
        </Card>
      </View>

      {/* Language */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: appTheme.colors.textSecondary }]}>Idioma</Text>
        <Card>
          <MenuItem
            icon={Globe}
            label="Idioma de la app"
            value="Español"
            onPress={() => Alert.alert('Idioma', 'Solo disponible en español')}
          />
        </Card>
      </View>

      {/* Help */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: appTheme.colors.textSecondary }]}>Ayuda</Text>
        <Card>
          <MenuItem
            icon={HelpCircle}
            label="Centro de ayuda"
            onPress={() => Alert.alert('Ayuda', 'Ir al centro de ayuda')}
          />
          <MenuItem
            icon={HelpCircle}
            label="Términos y condiciones"
            onPress={() => Alert.alert('Términos', 'Ver términos')}
          />
          <MenuItem
            icon={HelpCircle}
            label="Política de privacidad"
            onPress={() => Alert.alert('Privacidad', 'Ver política de privacidad')}
          />
        </Card>
      </View>

      {/* Account Actions */}
      <View style={styles.section}>
        <Card>
          <MenuItem
            icon={LogOut}
            label="Cerrar sesión"
            onPress={handleSignOut}
          />
        </Card>
      </View>

      <View style={styles.section}>
        <Card>
          <MenuItem
            icon={Trash2}
            label="Eliminar mi cuenta"
            onPress={handleDeleteAccount}
            danger
          />
        </Card>
      </View>

      {/* App Info */}
      <View style={styles.appInfo}>
        <Text style={[styles.appName, { color: appTheme.colors.text }]}>Ciudad Activa</Text>
        <Text style={[styles.appVersion, { color: appTheme.colors.textTertiary }]}>Versión 2.0.0</Text>
        <Text style={[styles.appCopyright, { color: appTheme.colors.textTertiary }]}>
          © 2024 Ciudad Activa. Todos los derechos reservados.
        </Text>
      </View>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backButton: { padding: Spacing.md },
  title: { fontSize: 24, fontWeight: '700', padding: Spacing.screenPadding, paddingTop: 0, marginBottom: Spacing.md },
  section: { marginBottom: Spacing.md, paddingHorizontal: Spacing.screenPadding },
  sectionTitle: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', marginBottom: Spacing.sm, marginTop: Spacing.md },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: Spacing.md },
  menuLabel: { flex: 1, fontSize: 15 },
  menuValue: { fontSize: 14, marginRight: Spacing.sm },
  appInfo: { alignItems: 'center', padding: Spacing['2xl'], marginTop: Spacing.xl },
  appName: { fontSize: 18, fontWeight: '700' },
  appVersion: { fontSize: 12, marginTop: Spacing.xs },
  appCopyright: { fontSize: 11, marginTop: Spacing.xs },
  bottomSpacing: { height: Spacing['3xl'] },
});
