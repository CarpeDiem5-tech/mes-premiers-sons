import React from 'react';
import { Text, StyleSheet, TouchableOpacity, View } from 'react-native';
import { COLORS, FONT, RADIUS, SPACING } from '../utils/theme';
import { CONSONANT_COLOR, LetterFamily, VOWEL_COLOR } from '../data/letters';

interface Props {
  family: LetterFamily;
  onPress?: () => void;
  isSelected?: boolean;
  isCorrect?: boolean;
  isWrong?: boolean;
}

const FAMILY_INFO = {
  vowel: {
    title: 'Maison des voyelles',
    letters: 'A E I O U Y',
    icon: '🏠',
    color: VOWEL_COLOR,
  },
  consonant: {
    title: 'Maison des consonnes',
    letters: 'B C D F G H J K L M N P Q R S T V W X Z',
    icon: '🏡',
    color: CONSONANT_COLOR,
  },
};

export default function LetterFamilyHouse({ family, onPress, isSelected, isCorrect, isWrong }: Props) {
  const info = FAMILY_INFO[family];
  const content = (
    <View
      style={[
        styles.house,
        { borderColor: info.color, backgroundColor: `${info.color}18` },
        isSelected && { shadowColor: info.color },
        isCorrect && styles.correct,
        isWrong && styles.wrong,
      ]}
    >
      <Text style={styles.icon}>{info.icon}</Text>
      <Text style={[styles.title, { color: info.color }]}>{info.title}</Text>
      <Text style={styles.letters}>{info.letters}</Text>
    </View>
  );

  if (!onPress) return content;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.84} style={styles.touchable}>
      {content}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touchable: { flex: 1 },
  house: {
    flex: 1,
    minHeight: 180,
    borderRadius: RADIUS.xl,
    borderWidth: 4,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 5,
  },
  icon: { fontSize: 44, marginBottom: SPACING.sm },
  title: { fontFamily: FONT.extraBold, fontSize: 20, textAlign: 'center', marginBottom: SPACING.sm },
  letters: { fontFamily: FONT.bold, fontSize: 15, color: COLORS.text, textAlign: 'center', lineHeight: 22 },
  correct: { backgroundColor: '#E8FBF5', borderColor: COLORS.success },
  wrong: { backgroundColor: '#FFF8E8', borderColor: COLORS.warning },
});
