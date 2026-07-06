import { useState, useEffect, useRef } from 'react';
import { Platform, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TutorialOverlay, { TutorialStep } from './TutorialOverlay';

const { width: SW, height: SH } = Dimensions.get('window');

const HEADER_H = Platform.OS === 'ios' ? 110 : 70;
const CONTENT_Y = HEADER_H + 16;
const CONTENT_H = SH * 0.38;

const COMPANY_STEPS: TutorialStep[] = [
  {
    title: '¡Bienvenido a Ciudad Activa!',
    description: 'Desde este menú administrarás todas las funciones de tu empresa.',
    spotlight: { x: 8, y: Platform.OS === 'ios' ? 58 : 14, w: 52, h: 52 },
  },
  {
    title: 'Publica nuevas vacantes',
    description: 'Encuentra trabajadores para tu negocio de forma rápida y sencilla.',
    spotlight: { x: 16, y: CONTENT_Y, w: SW - 32, h: CONTENT_H },
  },
  {
    title: 'Encuentra talento',
    description: 'Explora perfiles, revisa experiencia y contacta candidatos.',
    spotlight: { x: 16, y: CONTENT_Y, w: SW - 32, h: CONTENT_H },
  },
  {
    title: 'Administra postulaciones',
    description: 'Visualiza candidatos, acepta postulaciones y programa entrevistas.',
    spotlight: { x: 16, y: CONTENT_Y, w: SW - 32, h: CONTENT_H },
  },
  {
    title: 'Haz crecer tu negocio',
    description: 'Promociona tu empresa para llegar a más personas y conseguir mejores candidatos.',
    spotlight: { x: 16, y: CONTENT_Y, w: SW - 32, h: CONTENT_H },
  },
  {
    title: 'Completa el perfil de tu empresa',
    description: 'Una empresa con un perfil completo genera mayor confianza entre los postulantes.',
    spotlight: { x: SW / 2 - 80, y: SH * 0.25, w: 160, h: 44 },
    isLast: true,
  },
];

const STEP_ROUTES: (string | null)[] = [
  null,
  '/(company)/vacancies',
  '/(company)/talent',
  '/(company)/applications',
  '/(company)/promotions',
  '/(company)/info',
];

interface Props {
  userId: string;
}

export default function CompanyTutorial({ userId }: Props) {
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
      const key = `@tutorial_company_${userId}`;
      const seen = await AsyncStorage.getItem(key);
      if (!seen && mountedRef.current) {
        setTimeout(() => {
          if (mountedRef.current) setVisible(true);
        }, 800);
      }
    } catch (_) {}
  };

  const markSeen = async () => {
    try {
      await AsyncStorage.setItem(`@tutorial_company_${userId}`, 'done');
    } catch (_) {}
  };

  const navigateToStep = (step: number) => {
    const route = STEP_ROUTES[step];
    if (route) router.push(route as any);
  };

  const handleNext = () => {
    if (currentStep >= COMPANY_STEPS.length - 1) {
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
    router.push('/(company)' as any);
  };

  const handleComplete = () => {
    setVisible(false);
    markSeen();
    router.push('/(company)' as any);
  };

  return (
    <TutorialOverlay
      visible={visible}
      steps={COMPANY_STEPS}
      currentStep={currentStep}
      onNext={handleNext}
      onPrev={handlePrev}
      onSkip={handleSkip}
    />
  );
}

export async function resetCompanyTutorial(userId: string) {
  try {
    await AsyncStorage.removeItem(`@tutorial_company_${userId}`);
  } catch (_) {}
}
