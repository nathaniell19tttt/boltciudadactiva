import { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Briefcase, Building2, ArrowRight } from 'lucide-react-native';
import { useDemo } from '@/contexts/DemoContext';

const PRIMARY = '#1976D2';
const SECONDARY = '#7B1FA2';
const TEXT_PRIMARY = '#1A1A2E';
const TEXT_SECONDARY = '#5C6370';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2;

export default function ExploreScreen() {
  const router = useRouter();
  const { setDemoMode } = useDemo();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleWorkerExplore = () => {
    setDemoMode('worker');
    router.push('/(worker)');
  };

  const handleCompanyExplore = () => {
    setDemoMode('company');
    router.push('/(company)');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <Text style={styles.title}>Explorar informacion</Text>
          <Text style={styles.subtitle}>
            Elige como quieres explorar la plataforma. Navega libremente sin necesidad de crear una cuenta.
          </Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.cardsContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.card, styles.workerCard]}
            onPress={handleWorkerExplore}
            activeOpacity={0.85}
          >
            <View style={styles.cardIconWrapper}>
              <Briefcase size={40} color="#FFFFFF" />
            </View>
            <Text style={styles.cardTitle}>Explorar como Trabajador</Text>
            <Text style={styles.cardDesc}>
              Busca empleos, cursos y eventos disponibles
            </Text>
            <View style={styles.cardArrow}>
              <ArrowRight size={20} color={PRIMARY} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.card, styles.companyCard]}
            onPress={handleCompanyExplore}
            activeOpacity={0.85}
          >
            <View style={[styles.cardIconWrapper, { backgroundColor: SECONDARY }]}>
              <Building2 size={40} color="#FFFFFF" />
            </View>
            <Text style={styles.cardTitle}>Explorar como Empresa</Text>
            <Text style={styles.cardDesc}>
              Gestiona vacantes y encuentra talento
            </Text>
            <View style={styles.cardArrow}>
              <ArrowRight size={20} color={SECONDARY} />
            </View>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          style={{
            opacity: fadeAnim,
            marginTop: 40,
          }}
        >
          <Text style={styles.noteTitle}>Modo demostracion</Text>
          <Text style={styles.noteText}>
            Podras navegar y ver toda la informacion disponible. Para realizar acciones como postular, guardar o publicar, necesitaras crear una cuenta.
          </Text>
        </Animated.View>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Volver al inicio</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: TEXT_PRIMARY,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: TEXT_SECONDARY,
    lineHeight: 24,
    marginBottom: 40,
  },
  cardsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  card: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    paddingTop: 24,
    minHeight: 200,
    justifyContent: 'space-between',
  },
  workerCard: {
    backgroundColor: '#E3F2FD',
  },
  companyCard: {
    backgroundColor: '#F3E5F5',
  },
  cardIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginTop: 16,
  },
  cardDesc: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    marginTop: 6,
    lineHeight: 18,
  },
  cardArrow: {
    alignSelf: 'flex-end',
    marginTop: 12,
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    textAlign: 'center',
  },
  noteText: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  backButton: {
    marginTop: 'auto',
    marginBottom: 20,
    paddingVertical: 14,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    fontWeight: '500',
  },
});
