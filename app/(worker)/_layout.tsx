import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter, Slot } from 'expo-router';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import WorkerTutorial from '@/components/tutorial/WorkerTutorial';
import {
  Home,
  Briefcase,
  FileText,
  GraduationCap,
  Calendar,
  Recycle,
  Users,
  MessageCircle,
  User,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  ChevronRight,
  Moon,
  Sun,
} from 'lucide-react-native';
import { useTheme } from '@/contexts';
import { useAuth } from '@/contexts';
import { useNotifications } from '@/hooks';
import { Avatar, Badge } from '@/components/ui';
import { Spacing } from '@/constants';

const { width } = Dimensions.get('window');

const menuItems = [
  { id: 'home', label: 'Inicio', icon: Home, route: '/(worker)' },
  { id: 'jobs', label: 'Empleos', icon: Briefcase, route: '/(worker)/jobs' },
  { id: 'applications', label: 'Mis Postulaciones', icon: FileText, route: '/(worker)/applications' },
  { id: 'courses', label: 'Capacitaciones', icon: GraduationCap, route: '/(worker)/courses' },
  { id: 'events', label: 'Eventos', icon: Calendar, route: '/(worker)/events' },
  { id: 'recycling', label: 'Reciclaje', icon: Recycle, route: '/(worker)/recycling' },
  { id: 'community', label: 'Apoyo Comunitario', icon: Users, route: '/(worker)/community' },
  { id: 'messages', label: 'Mensajes', icon: MessageCircle, route: '/(worker)/messages' },
];

const accountItems = [
  { id: 'profile', label: 'Mi Perfil', icon: User, route: '/(worker)/profile' },
  { id: 'settings', label: 'Configuración', icon: Settings, route: '/(worker)/settings' },
];

export default function WorkerLayout() {
  const router = useRouter();
  const { theme, isDark, toggleTheme } = useTheme();
  const { user, profile, signOut } = useAuth();
  const { unreadCount } = useNotifications();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentRoute, setCurrentRoute] = useState('/(worker)');

  const handleNavigate = (route: string) => {
    setCurrentRoute(route);
    router.push(route as any);
    setDrawerOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/welcome');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const workerProfile = profile as any;

  const DrawerContent = () => (
    <View style={[styles.drawer, { backgroundColor: theme.colors.background }]}>
      {/* Drawer Header */}
      <View style={[styles.drawerHeader, { backgroundColor: theme.colors.primary[500] }]}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => setDrawerOpen(false)}
        >
          <X size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.drawerProfile}>
          <Avatar
            source={workerProfile?.photo_url}
            name={workerProfile ? `${workerProfile.first_name} ${workerProfile.last_name}` : user?.email}
            size={60}
          />
          <View style={styles.drawerProfileInfo}>
            <Text style={styles.drawerName}>
              {workerProfile?.first_name || 'Usuario'}
            </Text>
            <Text style={styles.drawerEmail}>{user?.email}</Text>
          </View>
        </View>
      </View>

      {/* Drawer Menu */}
      <ScrollView style={styles.drawerMenu}>
        <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>
          NAVEGACIÓN
        </Text>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.menuItem,
              currentRoute === item.route && { backgroundColor: theme.colors.primary[50] },
            ]}
            onPress={() => handleNavigate(item.route)}
          >
            <item.icon
              size={22}
              color={currentRoute === item.route ? theme.colors.primary[500] : theme.colors.textSecondary}
            />
            <Text
              style={[
                styles.menuLabel,
                { color: currentRoute === item.route ? theme.colors.primary[500] : theme.colors.text },
              ]}
            >
              {item.label}
            </Text>
            {item.id === 'messages' && unreadCount > 0 && (
              <Badge text={unreadCount.toString()} variant="error" size="sm" />
            )}
            <ChevronRight size={18} color={theme.colors.textTertiary} />
          </TouchableOpacity>
        ))}

        <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>
          CUENTA
        </Text>
        {accountItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.menuItem,
              currentRoute === item.route && { backgroundColor: theme.colors.primary[50] },
            ]}
            onPress={() => handleNavigate(item.route)}
          >
            <item.icon
              size={22}
              color={currentRoute === item.route ? theme.colors.primary[500] : theme.colors.textSecondary}
            />
            <Text
              style={[
                styles.menuLabel,
                { color: currentRoute === item.route ? theme.colors.primary[500] : theme.colors.text },
              ]}
            >
              {item.label}
            </Text>
            <ChevronRight size={18} color={theme.colors.textTertiary} />
          </TouchableOpacity>
        ))}

        {/* Theme Toggle */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={toggleTheme}
        >
          {isDark ? (
            <Sun size={22} color={theme.colors.textSecondary} />
          ) : (
            <Moon size={22} color={theme.colors.textSecondary} />
          )}
          <Text style={[styles.menuLabel, { color: theme.colors.text }]}>
            {isDark ? 'Modo claro' : 'Modo oscuro'}
          </Text>
        </TouchableOpacity>

        {/* Sign Out */}
        <TouchableOpacity
          style={[styles.menuItem, styles.signOutButton]}
          onPress={handleSignOut}
        >
          <LogOut size={22} color={theme.colors.error[500]} />
          <Text style={[styles.menuLabel, { color: theme.colors.error[500] }]}>
            Cerrar sesión
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Drawer Footer */}
      <View style={[styles.drawerFooter, { borderColor: theme.colors.border }]}>
        <Text style={[styles.footerText, { color: theme.colors.textTertiary }]}>
          Ciudad Activa v2.0
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setDrawerOpen(true)}
          >
            <Menu size={24} color={theme.colors.text} />
          </TouchableOpacity>

          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Ciudad Activa
          </Text>

          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => router.push('/(worker)/notifications')}
          >
            <Bell size={24} color={theme.colors.text} />
            {unreadCount > 0 && (
              <View style={[styles.badgeDot, { backgroundColor: theme.colors.error[500] }]}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Drawer Overlay */}
        {drawerOpen && (
          <TouchableOpacity
            style={styles.overlay}
            onPress={() => setDrawerOpen(false)}
            activeOpacity={1}
          >
            <View style={styles.drawerContainer}>
              <DrawerContent />
            </View>
          </TouchableOpacity>
        )}

        {/* Main Content - Child routes render here */}
        <Slot />

        {/* First-time tutorial */}
        {user && <WorkerTutorial userId={user.id} />}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  menuButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  notificationButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badgeDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 100,
  },
  drawerContainer: {
    width: width * 0.8,
    maxWidth: 320,
    height: '100%',
  },
  drawer: {
    flex: 1,
    borderTopRightRadius: Spacing.radius['2xl'],
    borderBottomRightRadius: Spacing.radius['2xl'],
    overflow: 'hidden',
  },
  drawerHeader: {
    padding: Spacing.lg,
    paddingTop: Spacing['2xl'],
  },
  closeButton: {
    position: 'absolute',
    top: Spacing.lg,
    right: Spacing.lg,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawerProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  drawerProfileInfo: {
    marginLeft: Spacing.md,
  },
  drawerName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  drawerEmail: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    marginTop: 2,
  },
  drawerMenu: {
    flex: 1,
    paddingVertical: Spacing.md,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  menuLabel: {
    flex: 1,
    marginLeft: Spacing.md,
    fontSize: 15,
  },
  signOutButton: {
    marginTop: Spacing.md,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  drawerFooter: {
    padding: Spacing.lg,
    borderTopWidth: 1,
  },
  footerText: {
    fontSize: 11,
    textAlign: 'center',
  },
});
