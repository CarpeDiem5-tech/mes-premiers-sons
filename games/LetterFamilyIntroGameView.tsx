import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Speech from 'expo-speech';
import LetterFamilyHouse from '../components/LetterFamilyHouse';
import { COLORS, FONT, SPACING } from '../utils/theme';

interface Props {
  onComplete: (stars: number) => void;
}

export default function LetterFamilyIntroGameView({ onComplete }: Props) {
  useEffect(() => {
    Speech.speak('Il y a deux familles de lettres.', { language: 'fr-FR', rate: 0.82 });
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Deux familles de lettres</Text>
      <Text style={styles.subtitle}>Regarde les deux maisons.</Text>
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
