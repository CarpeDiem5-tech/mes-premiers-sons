import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AudioInstruction from '../components/AudioInstruction';
import LetterFamilyHouse from '../components/LetterFamilyHouse';
import { COLORS, FONT, SPACING } from '../utils/theme';

interface Props {
  onComplete: (stars: number) => void;
}

export default function LetterFamilyIntroGameView({ onComplete }: Props) {

  return (
    <View style={styles.container}>
      <AudioInstruction text="Il y a deux familles de lettres. Regarde les deux maisons." audio="letter_families.mp3" />
      <View style={styles.houses}>
        <LetterFamilyHouse family="vowel" />
        <LetterFamilyHouse family="consonant" />
      </View>
      <TouchableOpacity style={styles.button} onPress={() => onComplete(3)} activeOpacity={0.86}>
        <Text style={styles.buttonText}>J'ai compris !</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', paddingTop: SPACING.lg },
  title: { fontFamily: FONT.extraBold, fontSize: 26, color: COLORS.text, textAlign: 'center', marginBottom: SPACING.sm },
  subtitle: { fontFamily: FONT.semiBold, fontSize: 17, color: COLORS.textLight, textAlign: 'center', marginBottom: SPACING.lg },
  houses: { flexDirection: 'row', gap: SPACING.md, width: '100%', marginBottom: SPACING.xl },
  button: { backgroundColor: COLORS.primary, borderRadius: 999, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md },
  buttonText: { fontFamily: FONT.extraBold, fontSize: 18, color: COLORS.textWhite },
});
