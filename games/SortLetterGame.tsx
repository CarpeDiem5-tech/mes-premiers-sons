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

const houseLabel = (family: LetterFamily) => family === 'vowel' ? 'voyelles' : 'consonnes';
const familyLabel = (family: LetterFamily) => family === 'vowel' ? 'voyelle' : 'consonne';
const successText = (letter: string, family: LetterFamily) =>
  family === 'vowel'
    ? `Bravo !\nLe ${letter} est bien arrivé dans la maison des voyelles.`
    : `Super !\nLe ${letter} habite dans la maison des consonnes.`;

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
      <AudioInstruction text={`Où habite le ${game.letter.text} ?`} audio="sort_letter.mp3" />
      <LetterCard letter={game.letter} size="md" />

      {selected && (
        <View style={selected === game.letter.type ? styles.bravoBox : styles.hintBox}>
          <Text style={selected === game.letter.type ? styles.bravoText : styles.hintText}>
            {selected === game.letter.type
              ? successText(game.letter.text, game.letter.type)
              : `Regarde bien...\nEssaie encore.`}
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
          isHinted={selected !== null && game.letter.type === 'vowel' && selected !== 'vowel'}
          showLetters={false}
          compact
        />
        <LetterFamilyHouse
          family="consonant"
          onPress={() => handleSelect('consonant')}
          isSelected={selected === 'consonant'}
          isCorrect={selected === 'consonant' && game.letter.type === 'consonant'}
          isWrong={selected === 'consonant' && game.letter.type !== 'consonant'}
          isHinted={selected !== null && game.letter.type === 'consonant' && selected !== 'consonant'}
          showLetters={false}
          compact
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingTop: SPACING.sm },
  instruction: { fontFamily: FONT.extraBold, fontSize: 22, color: COLORS.text, textAlign: 'center', marginBottom: SPACING.md },
  houses: { flexDirection: 'row', gap: SPACING.md, width: '100%', maxWidth: 520, marginTop: SPACING.md },
  bravoBox: { backgroundColor: '#E8FBF5', borderRadius: RADIUS.xl, padding: SPACING.md, marginTop: SPACING.sm },
  hintBox: { backgroundColor: '#FFF8E8', borderRadius: RADIUS.xl, padding: SPACING.md, marginTop: SPACING.sm },
  bravoText: { fontFamily: FONT.extraBold, fontSize: 18, color: COLORS.success, textAlign: 'center' },
  hintText: { fontFamily: FONT.bold, fontSize: 17, color: COLORS.secondary, textAlign: 'center' },
});
