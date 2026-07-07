import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Speech from 'expo-speech';
import { COLORS, FONT, RADIUS, SPACING } from '../utils/theme';

interface Props {
  text: string;
  audio?: string;
  autoPlay?: boolean;
  rate?: number;
}

export default function AudioInstruction({ text, audio: _audio, autoPlay = true, rate = 0.82 }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const playId = useRef(0);

  const stopCurrent = useCallback(() => {
    playId.current += 1;
    Speech.stop();
    setIsPlaying(false);
  }, []);

  const play = useCallback(() => {
    const currentPlay = playId.current + 1;
    playId.current = currentPlay;

    Speech.stop();
    setIsPlaying(true);
    Speech.speak(text, {
      language: 'fr-FR',
      rate,
      onDone: () => {
        if (playId.current === currentPlay) setIsPlaying(false);
      },
      onStopped: () => {
        if (playId.current === currentPlay) setIsPlaying(false);
      },
      onError: () => {
        if (playId.current === currentPlay) setIsPlaying(false);
      },
    });
  }, [rate, text]);

  useEffect(() => {
    if (autoPlay) play();
    return stopCurrent;
  }, [autoPlay, play, stopCurrent]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{text}</Text>
      <TouchableOpacity
        style={[styles.button, isPlaying && styles.buttonPlaying]}
        onPress={play}
        activeOpacity={0.78}
        accessibilityRole="button"
        accessibilityLabel={`Réécouter la consigne : ${text}`}
      >
        <Text style={styles.icon}>🔊</Text>
        <Text style={styles.buttonText}>{isPlaying ? 'Lecture...' : 'Réécouter'}</Text>
      </TouchableOpacity>
      {isPlaying ? <Text style={styles.indicator}>● Consigne en cours</Text> : null}
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
