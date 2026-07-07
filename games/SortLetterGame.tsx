import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AudioService from '../services/AudioService';
import AudioInstruction from '../components/AudioInstruction';
import LetterCard from '../components/LetterCard';
import LetterFamilyHouse from '../components/LetterFamilyHouse';
import { SortLetterGame as SortLetterGameType, LetterFamily } from '../types';
import { COLORS, FONT, RADIUS, SPACING } from '../utils/theme';

interface Props {
  game: SortLetterGameType;
  onComplete: (stars: number) => void;
}

const familyLabel = (family: LetterFamily) => family === 'vowel' ? 'voyelle' : 'consonne';
const houseLabel = (family: LetterFamily) => family === 'vowel' ? 'voyelles' : 'consonnes';

export default function SortLetterGame({ game, onComplete }: Props) {
  const [selected, setSelected] = useState<LetterFamily | null>(null);
  const [done, setDone] = useState(false);
  const completionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    AudioService.playInstruction(`Range ${game.letter.text} dans la bonne maison.`);

    return () => {
      if (completionTimer.current) clearTimeout(completionTimer.current);
    };
  }, [game.letter.text]);

  const handleSelect = (family: LetterFamily) => {
    if (done) return;
    setSelected(family);
    const correct = family === game.letter.type;
    if (correct) {
      setDone(true);
      AudioService.playFeedback(`Bravo ! ${game.letter.text} est une ${familyLabel(game.letter.type)}.`);
      completionTimer.current = setTimeout(() => onComplete(3), 1300);
      return;
    }

    AudioService.playFeedback(`${game.letter.text} va dans la maison des ${houseLabel(game.letter.type)}.`);
    setTimeout(() => setSelected(null), 1100);
  };

  return (
    <View style={styles.container}>
      <AudioInstruction text="Range la lettre dans la bonne maison." audio="sort_letter.mp3" />
      <LetterCard letter={game.letter} />

      {selected && (
        <View style={selected === game.letter.type ? styles.bravoBox : styles.hintBox}>
          <Text style={selected === game.letter.type ? styles.bravoText : styles.hintText}>
            {selected === game.letter.type
              ? `Bravo ! ${game.letter.text} est une ${familyLabel(game.letter.type)}.`
              : `Presque ! ${game.letter.text} va dans la maison des ${houseLabel(game.letter.type)}.`}
          </Text>
        </View>
      )}

      <View style={styles.houses}>
        <LetterFamilyHouse
          family="vowel"
          onPress={() => handleSelect('vowel')}
          isSelected={selected === 'vowel'}
          isCorrect={selected === 'vowel' && game.letter.type === 'vowel'}
          isWrong={selected === 'vowel' && game.letter.type !== 'vowel'}
        />
        <LetterFamilyHouse
          family="consonant"
          onPress={() => handleSelect('consonant')}
          isSelected={selected === 'consonant'}
          isCorrect={selected === 'consonant' && game.letter.type === 'consonant'}
          isWrong={selected === 'consonant' && game.letter.type !== 'consonant'}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', paddingTop: SPACING.md },
  instruction: { fontFamily: FONT.extraBold, fontSize: 22, color: COLORS.text, textAlign: 'center', marginBottom: SPACING.md },
  houses: { gap: SPACING.md, width: '100%', maxWidth: 460, marginTop: SPACING.lg },
  bravoBox: { backgroundColor: '#E8FBF5', borderRadius: RADIUS.xl, padding: SPACING.md, marginTop: SPACING.sm },
  hintBox: { backgroundColor: '#FFF8E8', borderRadius: RADIUS.xl, padding: SPACING.md, marginTop: SPACING.sm },
  bravoText: { fontFamily: FONT.extraBold, fontSize: 18, color: COLORS.success, textAlign: 'center' },
  hintText: { fontFamily: FONT.bold, fontSize: 17, color: COLORS.secondary, textAlign: 'center' },
});
