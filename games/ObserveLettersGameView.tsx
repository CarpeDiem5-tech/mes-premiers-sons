import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AudioInstruction from '../components/AudioInstruction';
import LetterCard from '../components/LetterCard';
import { ObserveLettersGame } from '../types';
import { COLORS, FONT, SPACING } from '../utils/theme';

interface Props {
  game: ObserveLettersGame;
  onComplete: (stars: number) => void;
}

const familyLabel = (type: string) => type === 'vowel' ? 'une voyelle' : 'une consonne';

export default function ObserveLettersGameView({ game, onComplete }: Props) {
  const [index, setIndex] = useState(0);
  const current = game.examples[index];
  const isLast = index === game.examples.length - 1;


  const handleNext = () => {
    if (isLast) {
      onComplete(3);
      return;
    }
    setIndex((value) => value + 1);
  };

  return (
    <View style={styles.container}>
      <AudioInstruction text={`Observe la lettre. ${current.text} est ${familyLabel(current.type)}.`} audio="observe_letter.mp3" />
      <LetterCard letter={current} />
      <Text style={styles.sentence}>{current.text} est {familyLabel(current.type)}.</Text>
      <TouchableOpacity style={styles.button} onPress={handleNext} activeOpacity={0.86}>
        <Text style={styles.buttonText}>{isLast ? 'À toi de jouer !' : 'Encore une lettre'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', paddingTop: SPACING.lg },
  instruction: { fontFamily: FONT.extraBold, fontSize: 24, color: COLORS.text, textAlign: 'center', marginBottom: SPACING.lg },
  sentence: { fontFamily: FONT.extraBold, fontSize: 26, color: COLORS.text, textAlign: 'center', marginVertical: SPACING.lg },
  button: { backgroundColor: COLORS.primary, borderRadius: 999, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md },
  buttonText: { fontFamily: FONT.extraBold, fontSize: 18, color: COLORS.textWhite },
});
