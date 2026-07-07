import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AudioService from '../services/AudioService';
import AudioInstruction from '../components/AudioInstruction';
import LetterCard from '../components/LetterCard';
import { LetterFamily, LetterItem } from '../types';
import { COLORS, FONT, RADIUS, SPACING } from '../utils/theme';

interface Props {
  choices: LetterItem[];
  targetFamily: LetterFamily;
  onComplete: (stars: number) => void;
}

const houseText = (family: LetterFamily) => family === 'vowel' ? 'la maison des voyelles' : 'la maison des consonnes';

export default function FindLetterFamilyGame({ choices, targetFamily, onComplete }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [done, setDone] = useState(false);


  const handleSelect = (letter: LetterItem) => {
    if (done) return;
    setSelectedId(letter.id);
    if (letter.type === targetFamily) {
      setDone(true);
      AudioService.playFeedback(`Bravo ! Le ${letter.text} habite dans ${houseText(letter.type)}.`);
      setTimeout(() => onComplete(3), 1200);
      return;
    }

    AudioService.playFeedback('Regarde bien. Essaie encore.');
    setTimeout(() => setSelectedId(null), 900);
  };

  return (
    <View style={styles.container}>
      <AudioInstruction text={`Trouve une lettre pour ${houseText(targetFamily)}.`} audio={`${targetFamily}_instruction.mp3`} />
      {selectedId && (
        <View style={done ? styles.bravoBox : styles.hintBox}>
          <Text style={done ? styles.bravoText : styles.hintText}>
            {done ? 'Bravo ! ⭐' : 'Regarde bien. Essaie encore.'}
          </Text>
        </View>
      )}
      <View style={styles.choices}>
        {choices.map((letter) => (
          <LetterCard
            key={letter.id}
            letter={letter}
            onPress={() => handleSelect(letter)}
            isCorrect={done && letter.type === targetFamily}
            isWrong={selectedId === letter.id && letter.type !== targetFamily}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', paddingTop: SPACING.lg },
  instruction: { fontFamily: FONT.extraBold, fontSize: 24, color: COLORS.text, textAlign: 'center', marginBottom: SPACING.lg },
  choices: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: SPACING.md, marginTop: SPACING.md },
  bravoBox: { backgroundColor: '#E8FBF5', borderRadius: RADIUS.xl, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, marginBottom: SPACING.sm },
  hintBox: { backgroundColor: '#FFF8E8', borderRadius: RADIUS.xl, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, marginBottom: SPACING.sm },
  bravoText: { fontFamily: FONT.extraBold, fontSize: 20, color: COLORS.success, textAlign: 'center' },
  hintText: { fontFamily: FONT.bold, fontSize: 17, color: COLORS.secondary, textAlign: 'center' },
});
