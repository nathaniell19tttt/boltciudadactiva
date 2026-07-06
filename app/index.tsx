import { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Image, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts';

export default function SplashScreen() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [animDone, setAnimDone] = useState(false);

  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 6,
        tension: 60,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => setAnimDone(true));
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (animDone && !loading) {
      navigate();
    }
  }, [animDone, loading]);

  const navigate = () => {
    if (user) {
      if (user.role === 'trabajador') {
        router.replace('/(worker)');
      } else if (user.role === 'empresa') {
        router.replace('/(company)');
      } else {
        router.replace('/welcome');
      }
    } else {
      router.replace('/welcome');
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoContainer, { opacity, transform: [{ scale }] }]}>
        <Image
          source={require('../assets/images/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 180,
    height: 180,
  },
});
