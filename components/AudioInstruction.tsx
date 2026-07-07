import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONT, RADIUS, SPACING } from '../utils/theme';
import AudioService from '../services/AudioService';

interface Props {
  text: string;
  audio?: string;
  autoPlay?: boolean;
  rate?: number;
  showText?: boolean;
  showStatus?: boolean;
}

// UX rule: audio instructions for non-reading children stay oral-only.
// Only pass showText when the displayed text is itself the learning object.
export default function AudioInstruction({
  text,
  audio: _audio,
  autoPlay = true,
  rate = 0.82,
  showText = false,
  showStatus = false,
}: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const playId = useRef(0);

  const stopCurrent = useCallback(() => {
    playId.current += 1;
    AudioService.stopCurrent();
    setIsPlaying(false);
  }, []);

  const play = useCallback(() => {
    const currentPlay = playId.current + 1;
    playId.current = currentPlay;

    setIsPlaying(true);
    AudioService.playInstruction(text);

    const estimatedDuration = Math.max(1200, (text.length * 65) / rate);
    setTimeout(() => {
      if (playId.current === currentPlay) setIsPlaying(false);
    }, estimatedDuration);
  }, [rate, text]);

  useEffect(() => {
    if (autoPlay) play();
    return stopCurrent;
  }, [autoPlay, play, stopCurrent]);

  return (
    <View style={styles.container}>
      {showText ? <Text style={styles.text}>{text}</Text> : null}
      <TouchableOpacity
        style={[styles.button, isPlaying && styles.buttonPlaying]}
        onPress={play}
        activeOpacity={0.78}
        accessibilityRole="button"
        accessibilityLabel={`Réécouter la consigne : ${text}`}
      >
        <Text style={styles.icon}>🔊</Text>
        <Text style={styles.buttonText}>Réécouter</Text>
      </TouchableOpacity>
      {showStatus && isPlaying ? <Text style={styles.indicator}>● Consigne en cours</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  text: {
    fontFamily: FONT.extraBold,
    fontSize: 22,
    color: COLORS.text,
    textAlign: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    minHeight: 52,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.card,
    borderWidth: 2,
    borderColor: COLORS.primary,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  buttonPlaying: {
    backgroundColor: '#FFF8E8',
  },
  icon: {
    fontSize: 24,
  },
  buttonText: {
    fontFamily: FONT.extraBold,
    fontSize: 17,
    color: COLORS.primary,
  },
  indicator: {
    fontFamily: FONT.semiBold,
    fontSize: 13,
    color: COLORS.textLight,
  },
});
