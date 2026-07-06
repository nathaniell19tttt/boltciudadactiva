import { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Animated, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, User, Building2 } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts';

const PRIMARY = '#1976D2';

export default function RegisterScreen() {
  const router = useRouter();
  const { theme, isDark } = useTheme();

  const headerAnim = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-20)).current;
  const card1Anim = useRef(new Animated.Value(0)).current;
  const card1Slide = useRef(new Animated.Value(30)).current;
  const card2Anim = useRef(new Animated.Value(0)).current;
  const card2Slide = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(headerAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(headerSlide, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(card1Anim, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.timing(card1Slide, { toValue: 0, duration: 350, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(card2Anim, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.timing(card2Slide, { toValue: 0, duration: 350, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const RoleCard = ({
    icon,
    title,
    description,
    iconBg,
    iconColor,
    accentColor,
    onPress,
    animOpacity,
    animSlide,
  }: {
    icon: React.ReactNode;
    title: string;
    description: string;
    iconBg: string;
    iconColor: string;
    accentColor: string;
    onPress: () => void;
    animOpacity: Animated.Value;
    animSlide: Animated.Value;
  }) => {
    const pressScale = useRef(new Animated.Value(1)).current;

    return (
      <Animated.View
        style={[
          { opacity: animOpacity, transform: [{ translateY: animSlide }, { scale: pressScale }] },
        ]}
      >
        <Pressable
          onPress={onPress}
          onPressIn={() =>
            Animated.spring(pressScale, { toValue: 0.97, friction: 10, useNativeDriver: true }).start()
          }
          onPressOut={() =>
            Animated.spring(pressScale, { toValue: 1, friction: 10, useNativeDriver: true }).start()
          }
        >
          <View
            style={[
              styles.card,
              {
                backgroundColor: isDark ? theme.colors.card : '#FFFFFF',
                borderColor: isDark ? theme.colors.border : '#F0F0F0',
                shadowColor: accentColor,
              },
            ]}
          >
            <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
              {icon}
            </View>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{title}</Text>
            <Text style={[styles.cardDesc, { color: theme.colors.textSecondary }]}>
              {description}
            </Text>

            <View style={[styles.cardFooter, { borderTopColor: isDark ? theme.colors.border : '#F5F5F5' }]}>
              <Text style={[styles.cardCta, { color: accentColor }]}>Comenzar registro</Text>
              <ArrowLeft
                size={16}
                color={accentColor}
                style={{ transform: [{ rotate: '180deg' }] }}
              />
            </View>
          </View>
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: isDark ? theme.colors.background : '#FFFFFF' }]}
      edges={['top', 'bottom']}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <Animated.View
          style={[
            styles.header,
            { opacity: headerAnim, transform: [{ translateY: headerSlide }] },
          ]}
        >
          <Pressable
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
            onPress={() => router.back()}
          >
            <View
              style={[
                styles.backBtnInner,
                { backgroundColor: isDark ? theme.colors.surfaceVariant : '#F5F7FA' },
              ]}
            >
              <ArrowLeft size={22} color={theme.colors.text} />
            </View>
          </Pressable>

          <Text style={[styles.title, { color: theme.colors.text }]}>
            ¿Cómo deseas usar{'\n'}Ciudad Activa?
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Selecciona el perfil que mejor representa cómo utilizarás la plataforma.
          </Text>
        </Animated.View>

        <View style={styles.cards}>
          <RoleCard
            icon={<User size={34} color={PRIMARY} strokeWidth={1.8} />}
            title="Soy trabajador"
            description="Encuentra empleo, desarrolla nuevas habilidades mediante capacitaciones, participa en eventos y accede a oportunidades para impulsar tu crecimiento profesional."
            iconBg="rgba(25, 118, 210, 0.1)"
            iconColor={PRIMARY}
            accentColor={PRIMARY}
            onPress={() => router.push('/register-worker')}
            animOpacity={card1Anim}
            animSlide={card1Slide}
          />

          <View style={styles.cardGap} />

          <RoleCard
            icon={<Building2 size={34} color="#E65100" strokeWidth={1.8} />}
            title="Soy empresa o negocio"
            description="Publica ofertas laborales, encuentra talento calificado, promociona tu negocio y gestiona tus procesos de contratación desde una sola plataforma."
            iconBg="rgba(230, 81, 0, 0.1)"
            iconColor="#E65100"
            accentColor="#E65100"
            onPress={() => router.push('/register-company')}
            animOpacity={card2Anim}
            animSlide={card2Slide}
          />
        </View>

        <View style={styles.loginRow}>
          <Text style={[styles.loginText, { color: theme.colors.textSecondary }]}>
            ¿Ya tienes cuenta?
          </Text>
          <Pressable
            style={({ pressed }) => [pressed && { opacity: 0.7 }]}
            onPress={() => router.push('/login')}
          >
            <Text style={[styles.loginLink, { color: PRIMARY }]}> Inicia sesión</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  header: {
    paddingTop: 8,
    marginBottom: 24,
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: 24,
  },
  backBtnInner: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 23,
  },
  cards: {
    flex: 1,
  },
  card: {
    borderRadius: 26,
    padding: 24,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 10,
  },
  cardDesc: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
  },
  cardCta: {
    fontSize: 14,
    fontWeight: '700',
  },
  cardGap: {
    height: 16,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
  },
  loginText: {
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '700',
  },
});
