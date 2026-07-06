import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter, Slot } from 'expo-router';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import WorkerTutorial from '@/components/tutorial/WorkerTutorial';
import { DemoAlert } from '@/components/ui/DemoAlert';
import { Hop as Home, Briefcase, FileText, GraduationCap, Calendar, Recycle, Users, MessageCircle, User, Settings, LogOut, Bell, Menu, X, ChevronRight, Moon, Sun, Eye } from 'lucide-react-native';
import { useTheme } from '@/contexts';
import { useAuth } from '@/contexts';
import { useDemo } from '@/contexts/DemoContext';
import { useNotifications } from '@/hooks';
import { Avatar, Badge } from '@/components/ui';
import { Spacing } from '@/constants';

const { width } = Dimensions.get('window');

const menuItems = [
  { id: 'home', label: 'Inicio', icon: Home, route: '/(worker)' },
  { id: 'jobs', label: 'Empleos', icon: Briefcase, route: '/(worker)/jobs' },
  { id: 'applications', label: 'Mis Postulaciones', icon: FileText, route: '/(worker)/applications', requiresAuth: true },
  { id: 'courses', label: 'Capacitaciones', icon: GraduationCap, route: '/(worker)/courses' },
  { id: 'events', label: 'Eventos', icon: Calendar, route: '/(worker)/events' },
  { id: 'recycling', label: 'Reciclaje', icon: Recycle, route: '/(worker)/recycling' },
  { id: 'community', label: 'Apoyo Comunitario', icon: Users, route: '/(worker)/community' },
  { id: 'messages', label: 'Mensajes', icon: MessageCircle, route: '/(worker)/messages', requiresAuth: true },
];

const accountItems = [
  { id: 'profile', label: 'Mi Perfil', icon: User, route: '/(worker)/profile', requiresAuth: true },
  { id: 'settings', label: 'Configuración', icon: Settings, route: '/(worker)/settings', requiresAuth: true },
];

export default function WorkerLayout() {
  const router = useRouter();
  const { theme, isDark, toggleTheme } = useTheme();
  const { user, profile, signOut } = useAuth();
  const { isDemo, exitDemoMode, showDemoAlert } = useDemo();
  const { unreadCount } = useNotifications();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentRoute, setCurrentRoute] = useState('/(worker)');

  const handleNavigate = (route: string, requiresAuth?: boolean) => {
    if (isDemo && requiresAuth) {
      showDemoAlert();
      setDrawerOpen(false);
      return;
    }
    setCurrentRoute(route);
    router.push(route as any);
    setDrawerOpen(false);
  };

  const handleSignOut = async () => {
    if (isDemo) {
      exitDemoMode();
      router.replace('/welcome');
      return;
    }
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

  // Demo mode mock data
  const displayName = isDemo ? 'Usuario Demo' : (workerProfile?.first_name || 'Usuario');
  const displayEmail = isDemo ? 'demo@ejemplo.com' : user?.email;
  const displayPhoto = isDemo ? null : workerProfile?.photo_url;

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

        {/* Demo Badge */}
        {isDemo && (
          <View style={styles.demoBadge}>
            <Eye size={12} color="#FFFFFF" />
            <Text style={styles.demoBadgeText}>MODO DEMO</Text>
          </View>
        )}

        <View style={styles.drawerProfile}>
          <Avatar
            source={displayPhoto}
            name={isDemo ? 'Demo' : (workerProfile ? `${workerProfile.first_name} ${workerProfile.last_name}` : user?.email)}
            size={60}
          />
          <View style={styles.drawerProfileInfo}>
            <Text style={styles.drawerName}>{displayName}</Text>
            <Text style={styles.drawerEmail}>{displayEmail}</Text>
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
            onPress={() => handleNavigate(item.route, item.requiresAuth)}
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
            {item.requiresAuth && isDemo && (
              <View style={styles.lockIcon}>
                <Text style={styles.lockIconText}>({item.requiresAuth && isDemo ? '🔒' : ''})</Text>
              </View>
            )}
            {item.id === 'messages' && unreadCount > 0 && !isDemo && (
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
            onPress={() => handleNavigate(item.route, item.requiresAuth)}
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
            {item.requiresAuth && isDemo && (
              <View style={styles.lockIcon}>
                <Text style={styles.lockIconText}>🔒</Text>
              </View>
            )}
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
            {isDemo ? 'Salir del modo demo' : 'Cerrar sesión'}
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
        {/* Demo Mode Banner */}
        {isDemo && (
          <View style={styles.demoBanner}>
            <Eye size={14} color="#FFFFFF" />
            <Text style={styles.demoBannerText}>Modo demostración - Algunas acciones requieren registro</Text>
          </View>
        )}

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
            {unreadCount > 0 && !isDemo && (
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
        {user && !isDemo && <WorkerTutorial userId={user.id} />}

        {/* Demo Alert Modal */}
        <DemoAlert />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  demoBanner: {
    backgroundColor: '#7B1FA2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 6,
  },
  demoBannerText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
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
  demoBadge: {
    position: 'absolute',
    top: Spacing.lg,
    left: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  demoBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
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
  lockIcon: {
    marginRight: 4,
  },
  lockIconText: {
    fontSize: 10,
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
