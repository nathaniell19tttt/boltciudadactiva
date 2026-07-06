import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Moon, Sun, Bell, Lock, Trash2, LogOut, ChevronRight, Shield, Info, HelpCircle, FileText, Smartphone, AlertTriangle } from 'lucide-react-native';
import { useTheme } from '@/contexts';
import { useAuth } from '@/contexts';
import { Card, Button, Modal, Screen, Input } from '@/components/ui';
import { Spacing } from '@/constants';
import { supabase } from '@/lib/supabase';

export default function CompanySettingsScreen() {
  const router = useRouter();
  const { theme, isDark, toggleTheme } = useTheme();
  const { user, profile, signOut } = useAuth();

  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'ELIMINAR') {
      Alert.alert('Error', 'Debes escribir ELIMINAR para confirmar');
      return;
    }

    try {
      // Delete company profile data first
      await supabase
        .from('company_profiles')
        .delete()
        .eq('user_id', user?.id ?? '');

      // Remove user record from public users table
      await supabase
        .from('users')
        .delete()
        .eq('id', user?.id ?? '');

      // Sign out — auth user deletion requires a server-side function;
      // profile data is removed and session is terminated.
      await signOut();
      Alert.alert('Cuenta eliminada', 'Tu información ha sido eliminada y tu sesión ha sido cerrada.');
    } catch (err) {
      Alert.alert('Error', 'No se pudo eliminar la cuenta. Por favor contacta soporte.');
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar sesión', style: 'destructive', onPress: signOut },
      ]
    );
  };

  const SettingItem = ({ icon: Icon, title, subtitle, onPress, rightComponent, danger }: { icon: any; title: string; subtitle?: string; onPress?: () => void; rightComponent?: React.ReactNode; danger?: boolean }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress} disabled={!onPress}>
      <View style={[styles.settingIcon, { backgroundColor: danger ? theme.colors.error[100] : theme.colors.primary[100] }]}>
        <Icon size={20} color={danger ? theme.colors.error[500] : theme.colors.primary[500]} />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: danger ? theme.colors.error[500] : theme.colors.text }]}>{title}</Text>
        {subtitle && <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>{subtitle}</Text>}
      </View>
      {rightComponent || (onPress && <ChevronRight size={20} color={theme.colors.textTertiary} />)}
    </TouchableOpacity>
  );

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Ajustes</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Account */}
        <Card style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Cuenta</Text>
          <SettingItem
            icon={Bell}
            title="Notificaciones push"
            subtitle="Recibir alertas en tiempo real"
            rightComponent={
              <Switch
                value={pushNotifications}
                onValueChange={setPushNotifications}
                trackColor={{ false: '#CCCCCC', true: theme.colors.primary[200] }}
                thumbColor={pushNotifications ? theme.colors.primary[500] : '#F4F4F4'}
              />
            }
          />
          <SettingItem
            icon={Info}
            title="Notificaciones por email"
            subtitle="Resumen de actividad semanal"
            rightComponent={
              <Switch
                value={emailNotifications}
                onValueChange={setEmailNotifications}
                trackColor={{ false: '#CCCCCC', true: theme.colors.primary[200] }}
                thumbColor={emailNotifications ? theme.colors.primary[500] : '#F4F4F4'}
              />
            }
          />
          <SettingItem
            icon={Lock}
            title="Cambiar contraseña"
            subtitle="Actualiza tu contraseña"
            onPress={() => Alert.alert('Próximamente', 'Función disponible en la próxima versión')}
          />
        </Card>

        {/* Appearance */}
        <Card style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Aspecto</Text>
          <SettingItem
            icon={isDark ? Moon : Sun}
            title="Tema oscuro"
            subtitle={isDark ? 'Activado' : 'Desactivado'}
            rightComponent={
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: '#CCCCCC', true: theme.colors.primary[200] }}
                thumbColor={isDark ? theme.colors.primary[500] : '#F4F4F4'}
              />
            }
          />
        </Card>

        {/* About */}
        <Card style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Acerca de</Text>
          <SettingItem
            icon={Shield}
            title="Política de privacidad"
            onPress={() => Alert.alert('Política de privacidad', 'Consulta nuestra política en ciudadactiva.pe/privacidad')}
          />
          <SettingItem
            icon={FileText}
            title="Términos de servicio"
            onPress={() => Alert.alert('Términos', 'Consulta los términos en ciudadactiva.pe/terminos')}
          />
          <SettingItem
            icon={HelpCircle}
            title="Centro de ayuda"
            onPress={() => Alert.alert('Ayuda', 'Visita ciudadactiva.pe/ayuda')}
          />
          <SettingItem
            icon={Smartphone}
            title="Versión de la app"
            subtitle="1.0.0"
          />
        </Card>

        {/* Danger Zone */}
        <Card style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: theme.colors.error[500] }]}>Zona de peligro</Text>
          <SettingItem
            icon={LogOut}
            title="Cerrar sesión"
            subtitle="Salir de tu cuenta"
            onPress={handleSignOut}
          />
          <SettingItem
            icon={Trash2}
            title="Eliminar mi cuenta"
            subtitle="Esta acción es irreversible"
            onPress={() => setShowDeleteModal(true)}
            danger
          />
        </Card>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.textTertiary }]}>
            Ciudad Activa 2.0
          </Text>
          <Text style={[styles.footerTextSmall, { color: theme.colors.textTertiary }]}>
            Hecho con amor en Collique, Lima Norte
          </Text>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Delete Account Modal */}
      <Modal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Eliminar cuenta"
      >
        <View style={styles.deleteModal}>
          <View style={[styles.deleteWarningIcon, { backgroundColor: theme.colors.error[100] }]}>
            <AlertTriangle size={40} color={theme.colors.error[500]} />
          </View>
          <Text style={[styles.deleteModalTitle, { color: theme.colors.text }]}>
            ¿Estás seguro?
          </Text>
          <Text style={[styles.deleteModalDesc, { color: theme.colors.textSecondary }]}>
            Esta acción eliminará permanentemente tu cuenta, perfil de empresa y todos los datos asociados. Esta acción no se puede deshacer.
          </Text>

          <View style={styles.deleteWarningBox}>
            <Text style={[styles.deleteWarningText, { color: theme.colors.error[600] }]}>
              Escribe ELIMINAR para confirmar
            </Text>
          </View>

          <View style={{ backgroundColor: '#E0E0E0', borderRadius: 8, marginBottom: Spacing.lg }}>
            <Input
              value={deleteConfirmation}
              onChangeText={setDeleteConfirmation}
              placeholder="ELIMINAR"
              style={{ textAlign: 'center', fontWeight: '700', fontSize: 16 }}
            />
          </View>

          <Button title="Cancelar" variant="outline" onPress={() => { setShowDeleteModal(false); setDeleteConfirmation(''); }} fullWidth />
          <View style={{ height: Spacing.sm }} />
          <Button title="Eliminar mi cuenta" variant="danger" onPress={handleDeleteAccount} fullWidth />
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { padding: Spacing.screenPadding, paddingBottom: 0 },
  headerTitle: { fontSize: 24, fontWeight: '700' },
  scrollContent: { padding: Spacing.screenPadding },
  sectionCard: { marginBottom: Spacing.md },
  sectionTitle: { fontSize: 14, fontWeight: '600', marginBottom: Spacing.sm },
  settingItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md },
  settingIcon: { width: 40, height: 40, borderRadius: Spacing.radius.md, justifyContent: 'center', alignItems: 'center' },
  settingContent: { flex: 1, marginLeft: Spacing.md },
  settingTitle: { fontSize: 15, fontWeight: '500' },
  settingSubtitle: { fontSize: 12, marginTop: 2 },
  footer: { alignItems: 'center', marginTop: Spacing.xl, paddingVertical: Spacing.lg },
  footerText: { fontSize: 14, fontWeight: '500' },
  footerTextSmall: { fontSize: 11, marginTop: 4 },
  bottomSpacing: { height: Spacing['3xl'] },
  deleteModal: { alignItems: 'center', padding: Spacing.lg },
  deleteWarningIcon: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center' },
  deleteModalTitle: { fontSize: 20, fontWeight: '700', marginTop: Spacing.lg, textAlign: 'center' },
  deleteModalDesc: { fontSize: 14, marginTop: Spacing.md, textAlign: 'center', lineHeight: 22 },
  deleteWarningBox: { backgroundColor: '#FFEBEE', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Spacing.radius.sm, marginTop: Spacing.lg, marginBottom: Spacing.md },
  deleteWarningText: { fontSize: 13, fontWeight: '600' },
});
