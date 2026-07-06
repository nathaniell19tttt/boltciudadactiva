import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated, Pressable, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const PRIMARY = '#1976D2';
const TEXT_PRIMARY = '#1A1A2E';
const TEXT_SECONDARY = '#5C6370';
const { width } = Dimensions.get('window');
const MAX_WIDTH = Math.min(width - 48, 400);

export default function WelcomeScreen() {
  const router = useRouter();

  const logoAnim = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const titleSlide = useRef(new Animated.Value(20)).current;
  const subtitleAnim = useRef(new Animated.Value(0)).current;
  const subtitleSlide = useRef(new Animated.Value(16)).current;
  const buttonsAnim = useRef(new Animated.Value(0)).current;
  const buttonsSlide = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(logoScale, { toValue: 1, friction: 7, tension: 50, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(titleAnim, { toValue: 1, duration: 380, useNativeDriver: true }),
        Animated.timing(titleSlide, { toValue: 0, duration: 380, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(subtitleAnim, { toValue: 1, duration: 320, useNativeDriver: true }),
        Animated.timing(subtitleSlide, { toValue: 0, duration: 320, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(buttonsAnim, { toValue: 1, duration: 380, useNativeDriver: true }),
        Animated.timing(buttonsSlide, { toValue: 0, duration: 380, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const PressableButton = ({
    label,
    onPress,
    variant,
  }: {
    label: string;
    onPress: () => void;
    variant: 'filled' | 'outline';
  }) => {
    const pressAnim = useRef(new Animated.Value(1)).current;
    return (
      <Pressable
        onPress={onPress}
        onPressIn={() =>
          Animated.spring(pressAnim, { toValue: 0.96, friction: 10, useNativeDriver: true }).start()
        }
        onPressOut={() =>
          Animated.spring(pressAnim, { toValue: 1, friction: 10, useNativeDriver: true }).start()
        }
      >
        <Animated.View
          style={[
            styles.button,
            variant === 'filled' ? styles.buttonFilled : styles.buttonOutline,
            { transform: [{ scale: pressAnim }] },
            variant === 'filled' && styles.buttonShadow,
          ]}
        >
          <Text style={[styles.buttonText, variant === 'outline' && styles.buttonTextOutline]}>
            {label}
          </Text>
        </Animated.View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.inner}>
        {/* Logo + text section - centered */}
        <View style={styles.centerSection}>
          <Animated.View
            style={[
              styles.logoWrapper,
              { opacity: logoAnim, transform: [{ scale: logoScale }] },
            ]}
          >
            <Image
              source={require('../assets/images/logo-ciudad-activa.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </Animated.View>

          <Animated.Text
            style={[
              styles.title,
              { opacity: titleAnim, transform: [{ translateY: titleSlide }] },
            ]}
          >
            Bienvenido
          </Animated.Text>

          <Animated.Text
            style={[
              styles.subtitle,
              { opacity: subtitleAnim, transform: [{ translateY: subtitleSlide }] },
            ]}
          >
            Conecta con oportunidades que{'\n'}transforman vidas.
          </Animated.Text>

          {/* Buttons right below the text with small gap */}
          <Animated.View
            style={[
              styles.buttonsSection,
              { opacity: buttonsAnim, transform: [{ translateY: buttonsSlide }] },
            ]}
          >
            <PressableButton
              label="Registrarse"
              variant="filled"
              onPress={() => router.push('/register')}
            />
            <View style={styles.buttonGap} />
            <PressableButton
              label="Iniciar sesión"
              variant="outline"
              onPress={() => router.push('/login')}
            />
            <View style={styles.buttonGap} />
            <PressableButton
              label="Explorar información"
              variant="outline"
              onPress={() => router.push('/explore')}
            />
          </Animated.View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  centerSection: {
    alignItems: 'center',
    width: '100%',
    maxWidth: MAX_WIDTH,
  },
  logoWrapper: {
    marginBottom: 28,
  },
  logo: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: TEXT_PRIMARY,
    letterSpacing: -0.5,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 25,
    marginBottom: 36,
  },
  buttonsSection: {
    width: '100%',
  },
  button: {
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  buttonFilled: {
    backgroundColor: PRIMARY,
  },
  buttonOutline: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: PRIMARY,
  },
  buttonShadow: {
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  buttonTextOutline: {
    color: PRIMARY,
  },
  buttonGap: {
    height: 12,
  },
});
