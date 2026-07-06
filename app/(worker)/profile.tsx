import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { FileText, Award, Heart, Bookmark, Edit, Share2, Download, Settings, LogOut, Camera } from 'lucide-react-native';
import { useTheme } from '@/contexts';
import { useAuth } from '@/contexts';
import { Card, Avatar, Badge, Button } from '@/components/ui';
import { Spacing } from '@/constants';

export default function ProfileScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { user, profile, signOut } = useAuth();

  const workerProfile = profile as any;

  const handleSignOut = async () => {
    await signOut();
    router.replace('/welcome');
  };

  const menuItems = [
    {
      id: 'cv',
      label: 'Mi CV',
      description: 'Genera y descarga tu currículum',
      icon: FileText,
      route: '/(worker)/cv',
      color: theme.colors.primary[500],
    },
    {
      id: 'certifications',
      label: 'Certificaciones',
      description: 'Cursos completados y progreso',
      icon: Award,
      route: '/(worker)/certifications',
      color: theme.colors.secondary[500],
    },
    {
      id: 'favorites',
      label: 'Favoritos',
      description: 'Publicaciones con Me gusta',
      icon: Heart,
      route: '/(worker)/favorites',
      color: theme.colors.error[500],
    },
    {
      id: 'saved',
      label: 'Guardados',
      description: 'Empleos, cursos y eventos guardados',
      icon: Bookmark,
      route: '/(worker)/saved',
      color: theme.colors.success[500],
    },
  ];

  const getInitials = () => {
    if (!workerProfile) return '?';
    return `${workerProfile.first_name?.[0] || ''}${workerProfile.last_name?.[0] || ''}`;
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={[styles.headerBackground, { backgroundColor: theme.colors.primary[500] }]} />
        <View style={styles.profileInfo}>
          <View style={styles.avatarContainer}>
            <Avatar
              source={workerProfile?.photo_url}
              name={workerProfile ? `${workerProfile.first_name} ${workerProfile.last_name}` : 'Usuario'}
              size={100}
            />
            <TouchableOpacity style={[styles.cameraButton, { backgroundColor: theme.colors.primary[500] }]}>
              <Camera size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <Text style={[styles.userName, { color: theme.colors.text }]}>
            {workerProfile ? `${workerProfile.first_name} ${workerProfile.last_name}` : 'Usuario'}
          </Text>

          <Text style={[styles.userProfession, { color: theme.colors.textSecondary }]}>
            {workerProfile?.profession || 'Sin profesión definida'}
          </Text>

          {/* Rating */}
          <View style={styles.ratingContainer}>
            <Text style={[styles.ratingValue, { color: theme.colors.text }]}>
              {workerProfile?.rating?.toFixed(1) || '0.0'}
            </Text>
            <Text style={styles.ratingStars}>★★★★★</Text>
            <Text style={[styles.ratingCount, { color: theme.colors.textTertiary }]}>
              ({workerProfile?.rating_count || 0} opiniones)
            </Text>
          </View>

          {/* Location */}
          {workerProfile?.district && (
            <View style={styles.locationContainer}>
              <Text style={[styles.location, { color: theme.colors.textTertiary }]}>
                {workerProfile.district}, {workerProfile.province}
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Button
              title="Editar perfil"
              onPress={() => router.push('/(worker)/edit-profile')}
              leftIcon={<Edit size={18} color="#FFFFFF" />}
              size="sm"
            />
            <View style={styles.buttonSpacer} />
            <Button
              title="Compartir"
              variant="outline"
              onPress={() => {}}
              leftIcon={<Share2 size={18} color={theme.colors.primary[500]} />}
              size="sm"
            />
          </View>
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Mi cuenta
        </Text>
        {menuItems.map((item) => (
          <TouchableOpacity key={item.id} onPress={() => router.push(item.route as any)}>
            <Card style={styles.menuCard}>
              <View style={[styles.menuIcon, { backgroundColor: item.color + '20' }]}>
                <item.icon size={24} color={item.color} />
              </View>
              <View style={styles.menuInfo}>
                <Text style={[styles.menuLabel, { color: theme.colors.text }]}>
                  {item.label}
                </Text>
                <Text style={[styles.menuDescription, { color: theme.colors.textSecondary }]}>
                  {item.description}
                </Text>
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </View>

      {/* Actions */}
      <View style={styles.section}>
        <TouchableOpacity onPress={() => router.push('/(worker)/settings')}>
          <Card style={styles.actionCard}>
            <Settings size={22} color={theme.colors.textSecondary} />
            <Text style={[styles.actionText, { color: theme.colors.text }]}>
              Configuración
            </Text>
          </Card>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSignOut}>
          <Card style={[styles.actionCard, styles.signOutCard]}>
            <LogOut size={22} color={theme.colors.error[500]} />
            <Text style={[styles.actionText, { color: theme.colors.error[500] }]}>
              Cerrar sesión
            </Text>
          </Card>
        </TouchableOpacity>
      </View>

      {/* Version */}
      <View style={styles.footer}>
        <Text style={[styles.versionText, { color: theme.colors.textTertiary }]}>
          Ciudad Activa v2.0.0
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  headerBackground: {
    height: 100,
  },
  profileInfo: {
    alignItems: 'center',
    marginTop: -50,
    paddingHorizontal: Spacing.screenPadding,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  userProfession: {
    fontSize: 16,
    marginTop: Spacing.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  ratingValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  ratingStars: {
    fontSize: 16,
    color: '#FFA000',
  },
  ratingCount: {
    fontSize: 13,
  },
  locationContainer: {
    marginTop: Spacing.sm,
  },
  location: {
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.xl,
  },
  buttonSpacer: {
    width: Spacing.md,
  },
  section: {
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.screenPadding,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  menuDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    padding: Spacing.md,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '500',
    marginLeft: Spacing.md,
  },
  signOutCard: {
    marginTop: Spacing.md,
  },
  footer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
  },
});
