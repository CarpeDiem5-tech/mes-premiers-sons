import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { COLORS, FONT, RADIUS, SPACING } from '../utils/theme';
import { CONSONANT_COLOR, LetterFamily, VOWEL_COLOR } from '../data/letters';

interface Props {
  family: LetterFamily;
  onPress?: () => void;
  isSelected?: boolean;
  isCorrect?: boolean;
  isWrong?: boolean;
  isHinted?: boolean;
  showTitle?: boolean;
  showLetters?: boolean;
  compact?: boolean;
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

export default function LetterFamilyHouse({
  family,
  onPress,
  isSelected,
  isCorrect,
  isWrong,
  isHinted,
  showTitle = true,
  showLetters = true,
  compact = false,
}: Props) {
  const info = FAMILY_INFO[family];
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isCorrect && !isHinted) {
      pulse.stopAnimation();
      pulse.setValue(1);
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.04, duration: 420, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 420, useNativeDriver: true }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [isCorrect, isHinted, pulse]);

  const animatedStyle: ViewStyle = {
    transform: [{ scale: pulse }],
  };

  const content = (
    <Animated.View
      style={[
        styles.house,
        compact && styles.compactHouse,
        { borderColor: info.color, backgroundColor: `${info.color}18` },
        isSelected && { shadowColor: info.color },
        isCorrect && { backgroundColor: `${info.color}28`, borderColor: info.color, shadowColor: info.color },
        isWrong && styles.wrong,
        isHinted && { shadowColor: info.color, shadowOpacity: 0.9 },
        animatedStyle,
      ]}
    >
      <Text style={[styles.icon, compact && styles.compactIcon]}>{info.icon}</Text>
      {showTitle ? (
        <Text style={[styles.title, compact && styles.compactTitle, { color: info.color }]}>{info.title}</Text>
      ) : null}
      {showLetters ? <Text style={[styles.letters, compact && styles.compactLetters]}>{info.letters}</Text> : null}
    </Animated.View>
  );

  if (!onPress) return content;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.84} style={styles.touchable}>
      {content}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touchable: { flex: 1, minWidth: 0 },
  house: {
    flex: 1,
    width: '100%',
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
  compactHouse: { minHeight: 142, padding: SPACING.sm, borderWidth: 3 },
  icon: { fontSize: 44, marginBottom: SPACING.sm },
  compactIcon: { fontSize: 36, marginBottom: 0 },
  title: { fontFamily: FONT.extraBold, fontSize: 20, textAlign: 'center', marginBottom: SPACING.sm },
  compactTitle: { fontSize: 17 },
  letters: { fontFamily: FONT.bold, fontSize: 15, color: COLORS.text, textAlign: 'center', lineHeight: 22 },
  compactLetters: { fontSize: 13, lineHeight: 18 },
  wrong: { opacity: 0.72 },
});
