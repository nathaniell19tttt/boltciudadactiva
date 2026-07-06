import { useRef, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
  Dimensions, Platform,
} from 'react-native';
import { ChevronLeft, ChevronRight, X } from 'lucide-react-native';

const { width: SW, height: SH } = Dimensions.get('window');

const PRIMARY = '#1976D2';
const ORANGE = '#E65100';

export interface TutorialStep {
  title: string;
  description: string;
  spotlight: { x: number; y: number; w: number; h: number };
  isLast?: boolean;
}

interface Props {
  visible: boolean;
  steps: TutorialStep[];
  currentStep: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}

export default function TutorialOverlay({ visible, steps, currentStep, onNext, onPrev, onSkip }: Props) {
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(60)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const spotlightPulse = useRef(new Animated.Value(1)).current;
  const [displayed, setDisplayed] = useState(false);

  useEffect(() => {
    if (visible) {
      setDisplayed(true);
      Animated.parallel([
        Animated.timing(overlayOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.timing(cardSlide, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(cardOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
      ]).start();
      startPulse();
    } else {
      Animated.parallel([
        Animated.timing(overlayOpacity, { toValue: 0, duration: 250, useNativeDriver: true }),
        Animated.timing(cardSlide, { toValue: 60, duration: 250, useNativeDriver: true }),
        Animated.timing(cardOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start(() => setDisplayed(false));
    }
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    Animated.parallel([
      Animated.timing(cardSlide, { toValue: 20, duration: 100, useNativeDriver: true }),
      Animated.timing(cardOpacity, { toValue: 0.6, duration: 100, useNativeDriver: true }),
    ]).start(() => {
      Animated.parallel([
        Animated.timing(cardSlide, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(cardOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    });
  }, [currentStep]);

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(spotlightPulse, { toValue: 1.08, duration: 900, useNativeDriver: true }),
        Animated.timing(spotlightPulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  };

  if (!displayed) return null;

  const step = steps[currentStep];
  if (!step) return null;

  const sp = step.spotlight;
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;

  // Compute the 4 mask rectangles around the spotlight
  const top = sp.y;
  const bottom = SH - (sp.y + sp.h);
  const left = sp.x;
  const right = SW - (sp.x + sp.w);

  // Determine if tooltip should go above or below spotlight
  const spotlightBottom = sp.y + sp.h;
  const tooltipBelow = spotlightBottom < SH * 0.55;
  const tooltipTop = tooltipBelow ? spotlightBottom + 16 : sp.y - 200;

  return (
    <Animated.View style={[styles.container, { opacity: overlayOpacity }]} pointerEvents="box-none">
      {/* 4-panel spotlight mask */}
      <View style={[styles.maskTop, { height: Math.max(0, top) }]} />
      <View style={[styles.maskRow, { top: Math.max(0, top), height: Math.max(0, sp.h) }]}>
        <View style={[styles.maskLeft, { width: Math.max(0, left) }]} />
        {/* Transparent spotlight hole with animated border */}
        <Animated.View
          style={[
            styles.spotlightHole,
            {
              width: sp.w,
              height: sp.h,
              transform: [{ scale: spotlightPulse }],
            },
          ]}
        />
        <View style={[styles.maskRight, { width: Math.max(0, right) }]} />
      </View>
      <View style={[styles.maskBottom, { top: Math.max(0, sp.y + sp.h), bottom: 0 }]} />

      {/* Tooltip card */}
      <Animated.View
        style={[
          styles.card,
          {
            opacity: cardOpacity,
            transform: [{ translateY: cardSlide }],
            top: tooltipBelow ? sp.y + sp.h + 16 : undefined,
            bottom: tooltipBelow ? undefined : SH - sp.y + 16,
          },
        ]}
      >
        {/* Progress dots */}
        <View style={styles.progressDots}>
          {steps.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === currentStep && styles.dotActive,
              ]}
            />
          ))}
        </View>

        {/* Step counter */}
        <Text style={styles.stepCounter}>Paso {currentStep + 1} de {steps.length}</Text>

        {/* Content */}
        <Text style={styles.cardTitle}>{step.title}</Text>
        <Text style={styles.cardDesc}>{step.description}</Text>

        {/* Navigation buttons */}
        <View style={styles.navRow}>
          <TouchableOpacity style={styles.skipBtn} onPress={onSkip}>
            <Text style={styles.skipText}>Omitir recorrido</Text>
          </TouchableOpacity>
          <View style={styles.navBtns}>
            {!isFirst && (
              <TouchableOpacity style={styles.prevBtn} onPress={onPrev}>
                <ChevronLeft size={20} color={PRIMARY} />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.nextBtn, isLast && styles.nextBtnLast]}
              onPress={onNext}
            >
              {isLast ? (
                <Text style={styles.nextBtnLastText}>Comenzar</Text>
              ) : (
                <ChevronRight size={20} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 999,
  },
  maskTop: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.78)',
  },
  maskRow: {
    position: 'absolute',
    left: 0, right: 0,
    flexDirection: 'row',
  },
  maskLeft: {
    backgroundColor: 'rgba(0,0,0,0.78)',
  },
  maskRight: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.78)',
  },
  maskBottom: {
    position: 'absolute',
    left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.78)',
  },
  spotlightHole: {
    borderRadius: 12,
    borderWidth: 2.5,
    borderColor: ORANGE,
    shadowColor: ORANGE,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 12,
    elevation: 0,
  },
  card: {
    position: 'absolute',
    left: 16, right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 16,
    maxWidth: 480,
    alignSelf: 'center',
    width: SW - 32,
  },
  progressDots: {
    flexDirection: 'row', gap: 6, marginBottom: 10,
  },
  dot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: '#E0E0E0',
  },
  dotActive: {
    width: 18, backgroundColor: PRIMARY,
  },
  stepCounter: {
    fontSize: 11, fontWeight: '600', color: ORANGE,
    letterSpacing: 0.5, marginBottom: 6, textTransform: 'uppercase',
  },
  cardTitle: {
    fontSize: 18, fontWeight: '800', color: '#1A1A2E', marginBottom: 8,
  },
  cardDesc: {
    fontSize: 14, lineHeight: 21, color: '#5C6370', marginBottom: 20,
  },
  navRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  skipBtn: { paddingVertical: 8 },
  skipText: { fontSize: 13, color: '#9E9E9E' },
  navBtns: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  prevBtn: {
    width: 40, height: 40, borderRadius: 20,
    borderWidth: 1.5, borderColor: PRIMARY,
    justifyContent: 'center', alignItems: 'center',
  },
  nextBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: PRIMARY,
    justifyContent: 'center', alignItems: 'center',
  },
  nextBtnLast: {
    width: 'auto', paddingHorizontal: 20,
    backgroundColor: PRIMARY,
  },
  nextBtnLastText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
});
