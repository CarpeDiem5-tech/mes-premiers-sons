import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, TouchableOpacity, View } from 'react-native';
import AudioInstruction from '../components/AudioInstruction';
import LetterFamilyHouse from '../components/LetterFamilyHouse';
import { COLORS, FONT, RADIUS, SPACING } from '../utils/theme';

interface Props {
  onComplete: (stars: number) => void;
}

const narration = [
  'Bonjour !',
  'Regarde ces deux maisons.',
  'Dans cette maison habitent les voyelles.',
  'Et dans cette maison habitent les consonnes.',
  'Maintenant, allons jouer avec les lettres !',
].join('\n\n');

const sentences = [
  'Regarde !',
  'Les lettres ont deux maisons.',
  'Les voyelles habitent ici.',
  'Les consonnes habitent là.',
];

export default function LetterFamilyIntroGameView({ onComplete }: Props) {
  const fadeValues = useRef(sentences.map(() => new Animated.Value(0))).current;
  const translateValues = useRef(sentences.map(() => new Animated.Value(8))).current;

  useEffect(() => {
    const animations = sentences.map((_, index) =>
      Animated.parallel([
        Animated.timing(fadeValues[index], {
          toValue: 1,
          duration: 420,
          delay: index * 850,
          useNativeDriver: true,
        }),
        Animated.timing(translateValues[index], {
          toValue: 0,
          duration: 420,
          delay: index * 850,
          useNativeDriver: true,
        }),
      ])
    );

    Animated.stagger(120, animations).start();
  }, [fadeValues, translateValues]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏡 Les maisons des lettres</Text>
      <AudioInstruction text={narration} audio="letter_houses.mp3" />
      <View style={styles.sentences}>
        {sentences.map((sentence, index) => (
          <Animated.Text
            key={sentence}
            style={[
              styles.sentence,
              {
                opacity: fadeValues[index],
                transform: [{ translateY: translateValues[index] }],
              },
            ]}
          >
            {sentence}
          </Animated.Text>
        ))}
      </View>
      <View style={styles.houses}>
        <LetterFamilyHouse family="vowel" />
        <LetterFamilyHouse family="consonant" />
      </View>
      <TouchableOpacity style={styles.button} onPress={() => onComplete(3)} activeOpacity={0.86}>
        <Text style={styles.buttonText}>On joue !</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', paddingTop: SPACING.md },
  title: { fontFamily: FONT.extraBold, fontSize: 26, color: COLORS.text, textAlign: 'center', marginBottom: SPACING.md },
  sentences: { width: '100%', backgroundColor: COLORS.card, borderRadius: RADIUS.xl, padding: SPACING.md, marginBottom: SPACING.md, gap: SPACING.xs },
  sentence: { fontFamily: FONT.bold, fontSize: 18, color: COLORS.text, textAlign: 'center', lineHeight: 24 },
  houses: { flexDirection: 'row', gap: SPACING.md, width: '100%', marginBottom: SPACING.xl },
  button: { backgroundColor: COLORS.primary, borderRadius: 999, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md },
  buttonText: { fontFamily: FONT.extraBold, fontSize: 18, color: COLORS.textWhite },
});
