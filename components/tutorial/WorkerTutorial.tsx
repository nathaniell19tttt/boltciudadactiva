import { useState, useEffect, useRef } from 'react';
import { Platform, Dimensions, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TutorialOverlay, { TutorialStep } from './TutorialOverlay';

const { width: SW, height: SH } = Dimensions.get('window');

const HEADER_H = Platform.OS === 'ios' ? 110 : 70;
const CONTENT_Y = HEADER_H + 16;
const CONTENT_H = SH * 0.38;

const WORKER_STEPS: TutorialStep[] = [
  {
    title: '¡Bienvenido a Ciudad Activa!',
    description: 'Desde este menú podrás acceder rápidamente a todas las funciones de la aplicación.',
    spotlight: { x: 8, y: Platform.OS === 'ios' ? 58 : 14, w: 52, h: 52 },
  },
  {
    title: 'Encuentra empleo',
    description: 'Aquí podrás descubrir ofertas laborales, postular fácilmente, guardar empleos y compartir oportunidades.',
    spotlight: { x: 16, y: CONTENT_Y, w: SW - 32, h: CONTENT_H },
  },
  {
    title: 'Aprende nuevas habilidades',
    description: 'Realiza cursos, obtén certificados y mejora tu perfil profesional.',
    spotlight: { x: 16, y: CONTENT_Y, w: SW - 32, h: CONTENT_H },
  },
  {
    title: 'Participa en eventos',
    description: 'Descubre ferias laborales, talleres y actividades para fortalecer tu desarrollo profesional.',
    spotlight: { x: 16, y: CONTENT_Y, w: SW - 32, h: CONTENT_H },
  },
  {
    title: 'Recicla y ayuda a tu comunidad',
    description: 'Encuentra puntos de reciclaje cercanos y obtén indicaciones mediante Google Maps.',
    spotlight: { x: 16, y: CONTENT_Y, w: SW - 32, h: CONTENT_H },
  },
  {
    title: 'Completa tu perfil',
    description: 'Mientras más completo esté tu perfil, mayores serán tus oportunidades laborales.',
    spotlight: { x: SW / 2 - 80, y: SH * 0.25, w: 160, h: 44 },
    isLast: true,
  },
];

const STEP_ROUTES: (string | null)[] = [
  null,
  '/(worker)/jobs',
  '/(worker)/courses',
  '/(worker)/events',
  '/(worker)/recycling',
  '/(worker)/profile',
];

interface Props {
  userId: string;
}

export default function WorkerTutorial({ userId }: Props) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    checkShouldShow();
    return () => { mountedRef.current = false; };
  }, [userId]);

  const checkShouldShow = async () => {
    try {
      const key = `@tutorial_worker_${userId}`;
      const seen = await AsyncStorage.getItem(key);
      if (!seen && mountedRef.current) {
        // Small delay to let the layout settle
        setTimeout(() => {
          if (mountedRef.current) setVisible(true);
        }, 800);
      }
    } catch (_) {}
  };

  const markSeen = async () => {
    try {
      await AsyncStorage.setItem(`@tutorial_worker_${userId}`, 'done');
    } catch (_) {}
  };

  const navigateToStep = (step: number) => {
    const route = STEP_ROUTES[step];
    if (route) {
      router.push(route as any);
    }
  };

  const handleNext = () => {
    if (currentStep >= WORKER_STEPS.length - 1) {
      handleComplete();
      return;
    }
    const next = currentStep + 1;
    setCurrentStep(next);
    navigateToStep(next);
  };

  const handlePrev = () => {
    if (currentStep <= 0) return;
    const prev = currentStep - 1;
    setCurrentStep(prev);
    navigateToStep(prev);
  };

  const handleSkip = () => {
    setVisible(false);
    markSeen();
    router.push('/(worker)' as any);
  };

  const handleComplete = () => {
    setVisible(false);
    markSeen();
    router.push('/(worker)' as any);
  };

  return (
    <TutorialOverlay
      visible={visible}
      steps={WORKER_STEPS}
      currentStep={currentStep}
      onNext={handleNext}
      onPrev={handlePrev}
      onSkip={handleSkip}
    />
  );
}

// Exported helper to re-start the tutorial from Settings
export async function resetWorkerTutorial(userId: string) {
  try {
    await AsyncStorage.removeItem(`@tutorial_worker_${userId}`);
  } catch (_) {}
}
