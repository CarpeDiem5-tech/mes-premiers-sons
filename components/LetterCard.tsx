import React from 'react';
import { Text, StyleSheet, TouchableOpacity, View } from 'react-native';
import { COLORS, FONT, RADIUS, SPACING } from '../utils/theme';
import { LetterItem } from '../types';
import { CONSONANT_COLOR, VOWEL_COLOR } from '../data/letters';

interface Props {
  letter: LetterItem;
  onPress?: () => void;
  size?: 'md' | 'lg';
  isCorrect?: boolean;
  isWrong?: boolean;
}

export default function LetterCard({ letter, onPress, size = 'lg', isCorrect, isWrong }: Props) {
  const color = letter.type === 'vowel' ? VOWEL_COLOR : CONSONANT_COLOR;
  const cardSize = size === 'lg' ? 150 : 108;
  const fontSize = size === 'lg' ? 76 : 52;

  const content = (
    <View
      style={[
        styles.card,
        { width: cardSize, height: cardSize, borderColor: color, backgroundColor: `${color}18` },
        isCorrect && styles.correct,
        isWrong && styles.wrong,
      ]}
    >
      <Text style={[styles.letter, { color, fontSize }]}>{letter.text}</Text>
    </View>
  );

  if (!onPress) return content;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.82}>
      {content}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.xl,
    borderWidth: 4,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 5,
    margin: SPACING.sm,
  },
  letter: {
    fontFamily: FONT.extraBold,
    textAlign: 'center',
  },
  correct: {
    backgroundColor: '#E8FBF5',
    borderColor: COLORS.success,
  },
  wrong: {
    backgroundColor: '#FFF8E8',
    borderColor: COLORS.warning,
  },
});
