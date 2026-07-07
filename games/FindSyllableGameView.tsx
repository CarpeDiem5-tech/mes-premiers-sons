import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import * as Speech from 'expo-speech';
import AudioInstruction from '../components/AudioInstruction';
import { FindSyllableGame } from '../types';
import SyllableCard from '../components/SyllableCard';
import { COLORS, FONT, SPACING, RADIUS } from '../utils/theme';

interface Props {
  game: FindSyllableGame;
  levelColor: string;
  onComplete: (stars: number) => void;
}

export default function FindSyllableGameView({ game, levelColor, onComplete }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [done, setDone] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 6, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleSelect = (choice: string) => {
    if (done) return;
    setSelected(choice);
    const correct = choice === game.target;
    if (correct) {
      setDone(true);
      Speech.speak('Bravo !', { language: 'fr-FR' });
      setTimeout(() => onComplete(attempts === 0 ? 3 : attempts === 1 ? 2 : 1), 1200);
    } else {
      setAttempts((a) => a + 1);
      Speech.speak('Essaie encore !', { language: 'fr-FR' });
      setTimeout(() => setSelected(null), 900);
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
      <View style={styles.targetBox}>
        <AudioInstruction text={`Trouve ${game.target}.`} audio="find_syllable.mp3" />
        <Text style={[styles.target, { color: levelColor }]}>{game.target}</Text>
      </View>

      {done && (
        <View style={styles.bravoBox}>
          <Text style={styles.bravoText}>Bravo ! ⭐</Text>
        </View>
      )}

      {!done && selected && selected !== game.target && (
        <View style={styles.hintBox}>
          <Text style={styles.hintText}>Essaie encore !</Text>
        </View>
      )}

      <View style={styles.choices}>
        {game.choices.map((choice) => (
          <SyllableCard
            key={choice}
            text={choice}
            color={choice === selected && !done ? COLORS.error : levelColor}
            size="md"
            onPress={() => handleSelect(choice)}
            isCorrect={done && choice === game.target}
            isWrong={choice === selected && choice !== game.target && !done}
          />
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: SPACING.lg,
  },
  targetBox: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  instruction: {
    fontFamily: FONT.semiBold,
    fontSize: 18,
    color: COLORS.textLight,
    marginBottom: SPACING.sm,
  },
  target: {
    fontFamily: FONT.extraBold,
    fontSize: 72,
  },
  choices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  bravoBox: {
    backgroundColor: '#E8FBF5',
    borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.md,
  },
  bravoText: {
    fontFamily: FONT.extraBold,
    fontSize: 22,
    color: COLORS.success,
    textAlign: 'center',
  },
  hintBox: {
    backgroundColor: '#FFF8E8',
    borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.md,
  },
  hintText: {
    fontFamily: FONT.bold,
    fontSize: 17,
    color: COLORS.secondary,
    textAlign: 'center',
  },
});
