import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Text, StyleSheet, TouchableOpacity, View } from 'react-native';
import LetterFamilyHouse from '../components/LetterFamilyHouse';
import AudioService from '../services/AudioService';
import { COLORS, FONT, RADIUS, SPACING } from '../utils/theme';
import { LetterFamily } from '../types';

interface Props {
  onComplete: (stars: number) => void;
}

const narration = [
  'Bonjour !',
  'Regarde ces deux maisons.',
  'Dans cette maison habitent les voyelles.',
  'Et dans cette maison habitent les consonnes.',
  'Maintenant...',
  'On va jouer !',
].join('\n\n');

const narrationCues: Array<{ family: LetterFamily; delay: number; duration: number }> = [
  { family: 'vowel', delay: 4200, duration: 1700 },
  { family: 'consonant', delay: 6500, duration: 1900 },
];

export default function LetterFamilyIntroGameView({ onComplete }: Props) {
  const [highlightedFamily, setHighlightedFamily] = useState<LetterFamily | null>(null);
  const cueTimers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  const clearCues = useCallback(() => {
    cueTimers.current.forEach(clearTimeout);
    cueTimers.current = [];
    setHighlightedFamily(null);
  }, []);

  const playNarration = useCallback(() => {
    clearCues();
    AudioService.playInstruction(narration);

    narrationCues.forEach(({ family, delay, duration }) => {
      cueTimers.current.push(
        setTimeout(() => {
          setHighlightedFamily(family);
          cueTimers.current.push(
            setTimeout(() => setHighlightedFamily((current) => (current === family ? null : current)), duration),
          );
        }, delay),
      );
    });
  }, [clearCues]);

  useEffect(() => {
    playNarration();

    return () => {
      clearCues();
      AudioService.stopCurrent();
    };
  }, [clearCues, playNarration]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏡 Les maisons des lettres</Text>

      <View style={styles.houses}>
        <View style={styles.houseColumn}>
          <LetterFamilyHouse
            family="vowel"
            isHinted={highlightedFamily === 'vowel'}
            showTitle={false}
            showLetters={false}
            compact
          />
          <Text style={styles.houseLabel}>Maison des voyelles</Text>
        </View>
        <View style={styles.houseColumn}>
          <LetterFamilyHouse
            family="consonant"
            isHinted={highlightedFamily === 'consonant'}
            showTitle={false}
            showLetters={false}
            compact
          />
          <Text style={styles.houseLabel}>Maison des consonnes</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.replayButton}
          onPress={playNarration}
          activeOpacity={0.78}
          accessibilityRole="button"
          accessibilityLabel="Réécouter la narration"
        >
          <Text style={styles.replayText}>🔊 Réécouter</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => onComplete(3)} activeOpacity={0.86}>
          <Text style={styles.buttonText}>🟠 On joue !</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.lg,
    gap: SPACING.md,
  },
  title: { fontFamily: FONT.extraBold, fontSize: 25, color: COLORS.text, textAlign: 'center' },
  houses: { flexDirection: 'row', gap: SPACING.md, width: '100%', maxWidth: 560, flexShrink: 0 },
  houseColumn: { flex: 1, minWidth: 0, alignItems: 'center', gap: SPACING.sm },
  houseLabel: {
    fontFamily: FONT.extraBold,
    fontSize: 16,
    lineHeight: 21,
    color: COLORS.text,
    textAlign: 'center',
  },
  actions: { alignItems: 'center', gap: SPACING.sm, width: '100%' },
  replayButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.card,
  },
  replayText: { fontFamily: FONT.extraBold, fontSize: 18, color: COLORS.primary },
  button: {
    backgroundColor: COLORS.secondary,
    borderRadius: 999,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
  },
  buttonText: { fontFamily: FONT.extraBold, fontSize: 18, color: COLORS.textWhite },
});
