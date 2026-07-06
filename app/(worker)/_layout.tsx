import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Image } from 'react-native';
import { useRouter, Slot } from 'expo-router';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import WorkerTutorial from '@/components/tutorial/WorkerTutorial';
import { DemoAlert } from '@/components/ui/DemoAlert';
import { Hop as Home, Briefcase, GraduationCap, Calendar, Recycle, Users, MessageCircle, User, Bell, Menu, X, Eye } from 'lucide-react-native';
import { useTheme } from '@/contexts';
import { useAuth } from '@/contexts';
import { useDemo } from '@/contexts/DemoContext';
import { useNotifications } from '@/hooks';
import { Avatar } from '@/components/ui';

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = 260;

const BLUE_DARK = '#173A7A';
const BLUE_MID = '#1E4D9B';
const ORANGE = '#FF8A00';
const WHITE = '#FFFFFF';

const menuItems = [
  { id: 'home', label: 'Inicio', icon: Home, route: '/(worker)' },
  { id: 'jobs', label: 'Empleos', icon: Briefcase, route: '/(worker)/jobs' },
  { id: 'courses', label: 'Capacitaciones', icon: GraduationCap, route: '/(worker)/courses' },
  { id: 'events', label: 'Eventos', icon: Calendar, route: '/(worker)/events' },
  { id: 'recycling', label: 'Reciclaje', icon: Recycle, route: '/(worker)/recycling' },
  { id: 'community', label: 'Apoyo Comunitario', icon: Users, route: '/(worker)/community' },
  { id: 'messages', label: 'Mensajes', icon: MessageCircle, route: '/(worker)/messages', requiresAuth: true },
  { id: 'profile', label: 'Perfil', icon: User, route: '/(worker)/profile', requiresAuth: true },
];

export default function WorkerLayout() {
  const router = useRouter();
  const { theme } = useTheme();
  const { user, profile, signOut } = useAuth();
  const { isDemo, isDevMode, exitDemoMode, showDemoAlert } = useDemo();
  const { unreadCount } = useNotifications();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentRoute, setCurrentRoute] = useState('/(worker)');

  const workerProfile = profile as any;
  const displayName = (isDemo || isDevMode) ? 'Usuario Demo' : (workerProfile ? `${workerProfile.first_name || ''} ${workerProfile.last_name || ''}`.trim() : 'Usuario');
  const displayEmail = (isDemo || isDevMode) ? 'demo@ejemplo.com' : (user?.email ?? '');
  const displayPhoto = (isDemo || isDevMode) ? null : workerProfile?.photo_url;

  const handleNavigate = (route: string, requiresAuth?: boolean) => {
    if (isDemo && requiresAuth && !isDevMode) {
      showDemoAlert();
      setDrawerOpen(false);
      return;
    }
    setCurrentRoute(route);
    router.push(route as any);
    setDrawerOpen(false);
  };

  const handleSignOut = async () => {
    if (isDemo || isDevMode) {
      exitDemoMode();
      router.replace('/welcome');
      return;
    }
    await signOut();
    router.replace('/welcome');
  };

  const SidebarContent = () => (
    <View style={styles.sidebar}>
      {/* Logo area */}
      <View style={styles.sidebarLogo}>
        <View style={styles.logoCircle}>
          <Image
            source={require('../../assets/images/logo-ciudad-activa.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        <View style={styles.logoTextContainer}>
          <Text style={styles.logoTitle}>Ciudad</Text>
          <Text style={styles.logoSubtitle}>Activa</Text>
          <Text style={styles.logoRole}>TRABAJADOR</Text>
        </View>
        {drawerOpen && (
          <TouchableOpacity onPress={() => setDrawerOpen(false)} style={styles.closeBtn}>
            <X size={20} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        )}
      </View>

      {/* Demo/Dev badge */}
      {(isDemo || isDevMode) && (
        <View style={styles.demoBadgeContainer}>
          <Eye size={12} color={WHITE} />
          <Text style={styles.demoBadgeText}>{isDevMode ? 'MODO DEV' : 'MODO DEMO'}</Text>
        </View>
      )}

      {/* Menu items */}
      <ScrollView style={styles.menuScroll} showsVerticalScrollIndicator={false}>
        {menuItems.map((item) => {
          const active = currentRoute === item.route;
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.menuItem, active && styles.menuItemActive]}
              onPress={() => handleNavigate(item.route, item.requiresAuth)}
              activeOpacity={0.75}
            >
              <item.icon
                size={20}
                color={active ? WHITE : 'rgba(255,255,255,0.72)'}
              />
              <Text style={[styles.menuLabel, active && styles.menuLabelActive]}>
                {item.label}
              </Text>
              {item.id === 'messages' && unreadCount > 0 && !isDemo && !isDevMode && (
                <View style={styles.unreadDot}>
                  <Text style={styles.unreadText}>{unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        <View style={styles.menuDivider} />

        {/* Sign out */}
        <TouchableOpacity style={styles.menuItem} onPress={handleSignOut} activeOpacity={0.75}>
          <User size={20} color="rgba(255,255,255,0.5)" />
          <Text style={[styles.menuLabel, { color: 'rgba(255,255,255,0.5)' }]}>
            {(isDemo || isDevMode) ? 'Salir del modo' : 'Cerrar sesión'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* User card at bottom */}
      <View style={styles.userCard}>
        <Avatar
          source={displayPhoto}
          name={displayName || 'U'}
          size={40}
        />
        <View style={styles.userCardInfo}>
          <Text style={styles.userCardName} numberOfLines={1}>{displayName || 'Usuario'}</Text>
          <Text style={styles.userCardEmail} numberOfLines={1}>{displayEmail}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Dev Mode Banner */}
        {isDevMode && (
          <View style={styles.devBanner}>
            <Text style={styles.devBannerText}>MODO DESARROLLO — Acceso completo habilitado</Text>
          </View>
        )}

        <View style={styles.body}>
          {/* Sidebar overlay (mobile) */}
          {drawerOpen && (
            <TouchableOpacity
              style={styles.overlay}
              onPress={() => setDrawerOpen(false)}
              activeOpacity={1}
            >
              <View style={styles.sidebarContainer}>
                <SidebarContent />
              </View>
            </TouchableOpacity>
          )}

          {/* Main content */}
          <View style={styles.mainContent}>
            {/* Top mini-header for hamburger on mobile */}
            <View style={styles.topBar}>
              <TouchableOpacity onPress={() => setDrawerOpen(true)} style={styles.hamburger}>
                <Menu size={22} color={BLUE_DARK} />
              </TouchableOpacity>
              <Text style={styles.topBarTitle}>Ciudad Activa</Text>
              <TouchableOpacity
                style={styles.topBarBell}
                onPress={() => router.push('/(worker)/notifications')}
              >
                <Bell size={22} color={BLUE_DARK} />
                {unreadCount > 0 && !isDemo && !isDevMode && (
                  <View style={styles.bellDot} />
                )}
              </TouchableOpacity>
            </View>

            <Slot />
          </View>
        </View>

        {user && !isDemo && !isDevMode && <WorkerTutorial userId={user.id} />}
        <DemoAlert />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },
  devBanner: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 6,
    alignItems: 'center',
  },
  devBannerText: {
    color: WHITE,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  body: {
    flex: 1,
    flexDirection: 'row',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    zIndex: 100,
  },
  sidebarContainer: {
    width: SIDEBAR_WIDTH,
    height: '100%',
  },
  sidebar: {
    flex: 1,
    backgroundColor: BLUE_DARK,
    paddingTop: 20,
  },
  sidebarLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.12)',
    marginBottom: 8,
  },
  logoCircle: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  logoImage: {
    width: 36,
    height: 36,
  },
  logoTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  logoTitle: {
    color: WHITE,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 17,
  },
  logoSubtitle: {
    color: ORANGE,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 17,
  },
  logoRole: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  demoBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 6,
  },
  demoBadgeText: {
    color: WHITE,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  menuScroll: {
    flex: 1,
    paddingTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginHorizontal: 10,
    borderRadius: 10,
    marginBottom: 2,
    gap: 12,
  },
  menuItemActive: {
    backgroundColor: ORANGE,
  },
  menuLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.72)',
  },
  menuLabelActive: {
    color: WHITE,
    fontWeight: '700',
  },
  unreadDot: {
    backgroundColor: '#EF4444',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  unreadText: {
    color: WHITE,
    fontSize: 10,
    fontWeight: '700',
  },
  menuDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 18,
    marginVertical: 8,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    gap: 10,
  },
  userCardInfo: {
    flex: 1,
  },
  userCardName: {
    color: WHITE,
    fontSize: 13,
    fontWeight: '700',
  },
  userCardEmail: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 11,
    marginTop: 1,
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: WHITE,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  hamburger: {
    padding: 6,
    marginRight: 8,
  },
  topBarTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: BLUE_DARK,
  },
  topBarBell: {
    padding: 6,
    position: 'relative',
  },
  bellDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: WHITE,
  },
});
