import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Crown, Star, Check, X, Zap, TrendingUp, Eye, Megaphone, Clock, ChevronRight } from 'lucide-react-native';
import { useTheme } from '@/contexts';
import { useAuth } from '@/contexts';
import { Card, Badge, Button, Screen } from '@/components/ui';
import { Spacing } from '@/constants';

export default function PromotionsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { profile } = useAuth();
  const companyProfile = profile as any;

  const [selectedPlan, setSelectedPlan] = useState('gratuito');

  const plans = [
    {
      id: 'gratuito',
      name: 'Gratuito',
      price: 0,
      period: 'para siempre',
      features: [
        { text: '3 vacantes activas', included: true },
        { text: 'Postulaciones ilimitadas', included: true },
        { text: 'Mensajería básica', included: true },
        { text: 'Estadísticas básicas', included: true },
        { text: 'Vacantes destacadas', included: false },
        { text: 'Perfil verificado', included: false },
        { text: 'Soporte prioritario', included: false },
      ],
      popular: false,
    },
    {
      id: 'profesional',
      name: 'Profesional',
      price: 49.90,
      period: '/mes',
      features: [
        { text: '10 vacantes activas', included: true },
        { text: 'Postulaciones ilimitadas', included: true },
        { text: 'Mensajería avanzada', included: true },
        { text: 'Estadísticas completas', included: true },
        { text: '5 vacantes destacadas', included: true },
        { text: 'Perfil verificado', included: true },
        { text: 'Soporte prioritario', included: false },
      ],
      popular: true,
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 99.90,
      period: '/mes',
      features: [
        { text: 'Vacantes ilimitadas', included: true },
        { text: 'Postulaciones ilimitadas', included: true },
        { text: 'Mensajería avanzada', included: true },
        { text: 'Estadísticas avanzadas', included: true },
        { text: 'Vacantes destacadas ilimitadas', included: true },
        { text: 'Perfil verificado + destacado', included: true },
        { text: 'Soporte prioritario 24/7', included: true },
      ],
      popular: false,
    },
  ];

  const promoServices = [
    {
      id: 'featured_job',
      title: 'Vacante Destacada',
      description: 'Tu vacante aparecerá primero en los resultados de búsqueda',
      price: 19.90,
      duration: '7 días',
      icon: Star,
      color: theme.colors.warning[500],
    },
    {
      id: 'highlighted_company',
      title: 'Empresa Destacada',
      description: 'Tu perfil aparecerá destacado en la sección de empresas',
      price: 29.90,
      duration: '30 días',
      icon: Crown,
      color: theme.colors.primary[500],
    },
    {
      id: 'boost_post',
      title: 'Impulsar Publicación',
      description: 'Aumenta la visibilidad de tus vacantes hasta 5x',
      price: 9.90,
      duration: '3 días',
      icon: TrendingUp,
      color: theme.colors.success[500],
    },
    {
      id: 'urgent_job',
      title: 'Vacante Urgente',
      description: 'Badge de urgencia y notificación push a candidatos',
      price: 14.90,
      duration: '5 días',
      icon: Zap,
      color: theme.colors.error[500],
    },
  ];

  const handleSubscribe = (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan || planId === 'gratuito') return;

    // For now, just show an alert - in production, integrate RevenueCat
    Alert.alert(
      'Suscribirse',
      `¿Deseas suscribirte al plan ${plan.name} por S/${plan.price}${plan.period}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Suscribirse',
          onPress: () => {
            Alert.alert('Próximamente', 'La integración de pagos estará disponible pronto. Para activar pagos, exporta el proyecto y usa RevenueCat.');
          },
        },
      ]
    );
  };

  const handlePurchaseService = (service: typeof promoServices[0]) => {
    Alert.alert(
      'Comprar promoción',
      `¿Deseas adquirir "${service.title}" por S/${service.price}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Comprar',
          onPress: () => {
            Alert.alert('Próximamente', 'Las promociones individuales estarán disponibles pronto.');
          },
        },
      ]
    );
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Crown size={32} color={theme.colors.warning[500]} />
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Promociona tu empresa
          </Text>
          <Text style={[styles.headerDesc, { color: theme.colors.textSecondary }]}>
            Aumenta la visibilidad de tus vacantes y encuentra talento más rápido
          </Text>
        </View>

        {/* Plans */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Planes de suscripción</Text>
        <View style={styles.plansRow}>
          {plans.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planCard,
                { borderColor: selectedPlan === plan.id ? theme.colors.primary[500] : 'transparent' },
                plan.popular && { borderColor: theme.colors.warning[500] },
              ]}
              onPress={() => setSelectedPlan(plan.id)}
            >
              {plan.popular && (
                <View style={[styles.popularBadge, { backgroundColor: theme.colors.warning[500] }]}>
                  <Text style={styles.popularText}>Popular</Text>
                </View>
              )}

              <Text style={[styles.planName, { color: theme.colors.text }]}>{plan.name}</Text>

              <View style={styles.priceRow}>
                <Text style={[styles.planPrice, { color: theme.colors.text }]}>
                  {plan.price === 0 ? 'Gratis' : `S/${plan.price}`}
                </Text>
                <Text style={[styles.planPeriod, { color: theme.colors.textSecondary }]}>
                  {plan.price > 0 ? plan.period : ''}
                </Text>
              </View>

              <View style={styles.featuresList}>
                {plan.features.slice(0, 4).map((feature, idx) => (
                  <View key={idx} style={styles.featureItem}>
                    {feature.included ? (
                      <Check size={14} color={theme.colors.success[500]} />
                    ) : (
                      <X size={14} color={theme.colors.textTertiary} />
                    )}
                    <Text style={[styles.featureText, { color: feature.included ? theme.colors.text : theme.colors.textTertiary }]}>
                      {feature.text}
                    </Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={[
                  styles.selectBtn,
                  selectedPlan === plan.id ? { backgroundColor: theme.colors.primary[500] } : { backgroundColor: '#E0E0E0' },
                ]}
                onPress={() => handleSubscribe(plan.id)}
              >
                <Text style={[styles.selectBtnText, selectedPlan === plan.id && { color: '#FFFFFF' }]}>
                  {plan.price === 0 ? 'Plan actual' : 'Elegir'}
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>

        {/* Promo Services */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text, marginTop: Spacing.xl }]}>
          Promociones individuales
        </Text>
        <Text style={[styles.sectionDesc, { color: theme.colors.textSecondary }]}>
          Potencia tus vacantes sin necesidad de una suscripción
        </Text>

        <View style={styles.servicesList}>
          {promoServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onPress={() => handlePurchaseService(service)}
              theme={theme}
            />
          ))}
        </View>

        {/* Current Plan */}
        <Card style={styles.currentPlanCard}>
          <View style={styles.currentPlanHeader}>
            <Text style={[styles.currentPlanTitle, { color: theme.colors.text }]}>Tu plan actual</Text>
            <Badge text="Gratuito" variant="neutral" />
          </View>
          <View style={styles.currentPlanStats}>
            <View style={styles.currentStat}>
              <Text style={[styles.currentStatValue, { color: theme.colors.text }]}>3</Text>
              <Text style={[styles.currentStatLabel, { color: theme.colors.textSecondary }]}>Vacantes activas</Text>
            </View>
            <View style={styles.currentStat}>
              <Text style={[styles.currentStatValue, { color: theme.colors.text }]}>0</Text>
              <Text style={[styles.currentStatLabel, { color: theme.colors.textSecondary }]}>Vacantes destacadas</Text>
            </View>
          </View>
          <Text style={[styles.upgradeHint, { color: theme.colors.textSecondary }]}>
            Mejora tu plan para más beneficios
          </Text>
        </Card>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </Screen>
  );
}

const ServiceCard = ({ service, onPress, theme }: { service: any; onPress: () => void; theme: any }) => {
  const Icon = service.icon;

  return (
    <Card style={styles.serviceCard} onPress={onPress}>
      <View style={[styles.serviceIcon, { backgroundColor: service.color + '20' }]}>
        <Icon size={22} color={service.color} />
      </View>
      <View style={styles.serviceContent}>
        <Text style={[styles.serviceTitle, { color: theme.colors.text }]}>{service.title}</Text>
        <Text style={[styles.serviceDesc, { color: theme.colors.textSecondary }]} numberOfLines={2}>
          {service.description}
        </Text>
        <View style={styles.serviceFooter}>
          <Text style={[styles.serviceDuration, { color: theme.colors.textTertiary }]}>
            <Clock size={12} color={theme.colors.textTertiary} /> {service.duration}
          </Text>
          <Text style={[styles.servicePrice, { color: theme.colors.primary[600] }]}>
            S/{service.price}
          </Text>
        </View>
      </View>
      <ChevronRight size={20} color={theme.colors.textTertiary} />
    </Card>
  );
};

const styles = StyleSheet.create({
  scrollContent: { padding: Spacing.screenPadding },
  header: { alignItems: 'center', marginBottom: Spacing.xl },
  headerTitle: { fontSize: 22, fontWeight: '700', textAlign: 'center', marginTop: Spacing.md },
  headerDesc: { fontSize: 14, textAlign: 'center', marginTop: Spacing.sm, paddingHorizontal: Spacing.xl },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: Spacing.sm },
  sectionDesc: { fontSize: 13, marginBottom: Spacing.md },
  plansRow: { gap: Spacing.md },
  planCard: { borderWidth: 2, borderRadius: Spacing.radius.xl, padding: Spacing.md, position: 'relative' },
  popularBadge: { position: 'absolute', top: -10, left: '50%', transform: [{ translateX: -40 }], paddingHorizontal: Spacing.md, paddingVertical: 2, borderRadius: Spacing.radius.full },
  popularText: { color: '#FFFFFF', fontSize: 11, fontWeight: '600' },
  planName: { fontSize: 18, fontWeight: '700' },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: Spacing.sm },
  planPrice: { fontSize: 28, fontWeight: '700' },
  planPeriod: { fontSize: 14, marginLeft: 4 },
  featuresList: { marginTop: Spacing.md },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.xs },
  featureText: { fontSize: 13 },
  selectBtn: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Spacing.radius.full, alignItems: 'center', marginTop: Spacing.md },
  selectBtnText: { fontSize: 14, fontWeight: '500' },
  servicesList: { gap: Spacing.sm },
  serviceCard: { flexDirection: 'row', alignItems: 'center' },
  serviceIcon: { width: 48, height: 48, borderRadius: Spacing.radius.lg, justifyContent: 'center', alignItems: 'center' },
  serviceContent: { flex: 1, marginLeft: Spacing.md },
  serviceTitle: { fontSize: 15, fontWeight: '600' },
  serviceDesc: { fontSize: 12, marginTop: 2 },
  serviceFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.sm },
  serviceDuration: { fontSize: 11 },
  servicePrice: { fontSize: 15, fontWeight: '700' },
  currentPlanCard: { marginTop: Spacing.xl },
  currentPlanHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  currentPlanTitle: { fontSize: 16, fontWeight: '600' },
  currentPlanStats: { flexDirection: 'row', justifyContent: 'space-around', marginTop: Spacing.lg, paddingVertical: Spacing.md, borderTopWidth: 1, borderBottomWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)', borderBottomColor: 'rgba(0,0,0,0.05)' },
  currentStat: { alignItems: 'center' },
  currentStatValue: { fontSize: 24, fontWeight: '700' },
  currentStatLabel: { fontSize: 12, marginTop: 2 },
  upgradeHint: { fontSize: 13, textAlign: 'center', marginTop: Spacing.md },
  bottomSpacing: { height: Spacing['3xl'] },
});
