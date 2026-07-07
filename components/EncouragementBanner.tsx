import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { COLORS, FONT, RADIUS, SPACING } from '../utils/theme';

export type EncouragementBannerVariant = 'success' | 'retry' | 'missionCompleted';

interface Props {
  message: string | null;
  visible?: boolean;
  durationMs?: number;
  variant?: EncouragementBannerVariant;
  onHide?: () => void;
}

const variantStyles: Record<EncouragementBannerVariant, { backgroundColor: string; textColor: string }> = {
  success: { backgroundColor: '#E8FBF5', textColor: COLORS.success },
  retry: { backgroundColor: '#FFF8E8', textColor: COLORS.secondary },
  missionCompleted: { backgroundColor: '#FFF3C4', textColor: COLORS.text },
};

export default function EncouragementBanner({
  message,
  visible = Boolean(message),
  durationMs = 2400,
  variant = 'success',
  onHide,
}: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.96)).current;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (!visible || !message) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0.96, duration: 180, useNativeDriver: true }),
      ]).start();
      return;
    }

    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 260, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 7, tension: 80, useNativeDriver: true }),
    ]).start();

    timeoutRef.current = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0.98, duration: 220, useNativeDriver: true }),
      ]).start(() => onHide?.());
    }, durationMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [durationMs, message, onHide, opacity, scale, visible]);

  if (!message) return null;

  const colors = variantStyles[variant];

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.banner,
        { backgroundColor: colors.backgroundColor, opacity, transform: [{ scale }] },
      ]}
      accessibilityLiveRegion="polite"
    >
      <Text style={[styles.message, { color: colors.textColor }]}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    alignSelf: 'center',
    borderRadius: RADIUS.xl,
    marginVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  message: {
    fontFamily: FONT.extraBold,
    fontSize: 20,
    textAlign: 'center',
  },
});
