import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONT, SPACING, RADIUS } from '../utils/theme';

interface Props {
  text: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  onPress?: () => void;
  isCorrect?: boolean;
  isWrong?: boolean;
}

export default function SyllableCard({ text, color = COLORS.primary, size = 'md', onPress, isCorrect, isWrong }: Props) {
  const fontSize = size === 'sm' ? 28 : size === 'md' ? 42 : 64;
  const cardSize = size === 'sm' ? 90 : size === 'md' ? 120 : 160;

  let borderColor = 'transparent';
  let bgColor = COLORS.card;
  if (isCorrect) {
    borderColor = COLORS.success;
    bgColor = '#E8FBF5';
  } else if (isWrong) {
    borderColor = COLORS.error;
    bgColor = '#FFF0F0';
  }

  const content = (
    <View
      style={[
        styles.card,
        { width: cardSize, height: cardSize, borderColor, backgroundColor: bgColor },
        isCorrect && styles.correct,
        isWrong && styles.wrong,
      ]}
    >
      <Text style={[styles.text, { fontSize, color }]}>{text}</Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {content}
      </TouchableOpacity>
    );
  }
  return content;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
    margin: SPACING.sm,
  },
  text: {
    fontFamily: FONT.extraBold,
    textAlign: 'center',
  },
  correct: {
    shadowColor: COLORS.success,
  },
  wrong: {
    shadowColor: COLORS.error,
  },
});
