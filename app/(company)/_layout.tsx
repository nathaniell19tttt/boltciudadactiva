import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter, Slot } from 'expo-router';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import CompanyTutorial from '@/components/tutorial/CompanyTutorial';
import {
  Home,
  FileText,
  Users,
  Inbox,
  Calendar,
  MessageCircle,
  Building2,
  BarChart3,
  Star,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  ChevronRight,
  Moon,
  Sun,
  CheckCircle,
} from 'lucide-react-native';
import { useTheme } from '@/contexts';
import { useAuth } from '@/contexts';
import { useNotifications } from '@/hooks';
import { Avatar, Badge } from '@/components/ui';
import { Spacing } from '@/constants';

const { width } = Dimensions.get('window');

const menuItems = [
  { id: 'home', label: 'Inicio', icon: Home, route: '/(company)' },
  { id: 'vacancies', label: 'Vacantes', icon: FileText, route: '/(company)/vacancies' },
  { id: 'talent', label: 'Talento', icon: Users, route: '/(company)/talent' },
  { id: 'applications', label: 'Postulaciones', icon: Inbox, route: '/(company)/applications' },
  { id: 'interviews', label: 'Entrevistas', icon: Calendar, route: '/(company)/interviews' },
  { id: 'messages', label: 'Mensajes', icon: MessageCircle, route: '/(company)/messages' },
  { id: 'company', label: 'Mi Empresa', icon: Building2, route: '/(company)/info' },
  { id: 'analytics', label: 'Estadísticas', icon: BarChart3, route: '/(company)/analytics' },
  { id: 'promotions', label: 'Promociones', icon: Star, route: '/(company)/promotions' },
];

export default function CompanyLayout() {
  const router = useRouter();
  const { theme, isDark, toggleTheme } = useTheme();
  const { user, profile, signOut } = useAuth();
  const { unreadCount } = useNotifications();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentRoute, setCurrentRoute] = useState('/(company)');

  const companyProfile = profile as any;

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

  const DrawerContent = () => (
    <View style={[styles.drawer, { backgroundColor: theme.colors.background }]}>
      {/* Drawer Header */}
      <View style={[styles.drawerHeader, { backgroundColor: theme.colors.primary[700] }]}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => setDrawerOpen(false)}
        >
          <X size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.drawerProfile}>
          <Avatar
            source={companyProfile?.logo_url}
            name={companyProfile?.name || 'Empresa'}
            size={60}
          />
          <View style={styles.drawerProfileInfo}>
            <Text style={styles.drawerName}>
              {companyProfile?.name || 'Mi Empresa'}
            </Text>
            {companyProfile?.verified && (
              <View style={styles.verifiedBadge}>
                <CheckCircle size={14} color={theme.colors.success[500]} />
                <Text style={[styles.verifiedText, { color: theme.colors.success[500] }]}>
                  Verificada
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Drawer Menu */}
      <ScrollView style={styles.drawerMenu}>
        <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>
          PANEL DE EMPRESA
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

        {/* Account Section */}
        <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>
          CUENTA
        </Text>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => handleNavigate('/(company)/settings')}
        >
          <Settings size={22} color={theme.colors.textSecondary} />
          <Text style={[styles.menuLabel, { color: theme.colors.text }]}>
            Configuración
          </Text>
          <ChevronRight size={18} color={theme.colors.textTertiary} />
        </TouchableOpacity>

        {/* Theme Toggle */}
        <TouchableOpacity style={styles.menuItem} onPress={toggleTheme}>
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
            onPress={() => router.push('/(company)/notifications')}
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
        {user && <CompanyTutorial userId={user.id} />}
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
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  verifiedText: {
    fontSize: 12,
    marginLeft: 4,
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
