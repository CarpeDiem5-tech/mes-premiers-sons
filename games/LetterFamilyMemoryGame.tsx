import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AudioService from '../services/AudioService';
import { LetterFamilyMemoryGame as LetterFamilyMemoryGameType, LetterItem } from '../types';
import { CONSONANT_COLOR, VOWEL_COLOR } from '../data/letters';
import { COLORS, FONT, RADIUS, SPACING } from '../utils/theme';

interface CardState {
  id: number;
  letter: LetterItem;
  isFlipped: boolean;
  isMatched: boolean;
}

interface Props {
  game: LetterFamilyMemoryGameType;
  onComplete: (stars: number) => void;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function LetterFamilyMemoryGame({ game, onComplete }: Props) {
  const [cards, setCards] = useState<CardState[]>(() =>
    shuffle(game.cards).map((letter, index) => ({ id: index, letter, isFlipped: false, isMatched: false }))
  );
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);

  const allDone = cards.every((card) => card.isMatched);

  useEffect(() => {
    AudioService.playInstruction('Trouve deux lettres de la même famille.');
  }, []);

  useEffect(() => {
    if (allDone) {
      AudioService.playFeedback('Super ! Les familles sont ensemble !');
      setTimeout(() => onComplete(moves <= 4 ? 3 : moves <= 6 ? 2 : 1), 1000);
    }
  }, [allDone]);

  const flipCard = (id: number) => {
    if (locked) return;
    const card = cards.find((item) => item.id === id);
    if (!card || card.isFlipped || card.isMatched) return;

    const newCards = cards.map((item) => item.id === id ? { ...item, isFlipped: true } : item);
    setCards(newCards);

    const newSelected = [...selected, id];
    setSelected(newSelected);

    if (newSelected.length === 2) {
      setMoves((value) => value + 1);
      setLocked(true);
      const [firstId, secondId] = newSelected;
      const first = newCards.find((item) => item.id === firstId)!;
      const second = newCards.find((item) => item.id === secondId)!;

      if (first.letter.type === second.letter.type) {
        AudioService.playFeedback('Oui, même famille !');
        setTimeout(() => {
          setCards((previous) => previous.map((item) =>
            item.id === firstId || item.id === secondId ? { ...item, isMatched: true } : item
          ));
          setSelected([]);
          setLocked(false);
        }, 700);
      } else {
        AudioService.playFeedback('Presque ! On continue.');
        setTimeout(() => {
          setCards((previous) => previous.map((item) =>
            item.id === firstId || item.id === secondId ? { ...item, isFlipped: false } : item
          ));
          setSelected([]);
          setLocked(false);
        }, 900);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.instruction}>Trouve deux lettres de la même famille.</Text>
      <View style={styles.grid}>
        {cards.map((card) => {
          const color = card.letter.type === 'vowel' ? VOWEL_COLOR : CONSONANT_COLOR;
          return (
            <TouchableOpacity
              key={card.id}
              style={[
                styles.card,
                card.isFlipped || card.isMatched
                  ? { borderColor: color, backgroundColor: `${color}18` }
                  : styles.cardBack,
                card.isMatched && styles.matched,
              ]}
              onPress={() => flipCard(card.id)}
              activeOpacity={0.82}
            >
              {card.isFlipped || card.isMatched ? (
                <Text style={[styles.cardText, { color }]}>{card.letter.text}</Text>
              ) : (
                <Text style={styles.cardBackText}>?</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
      {allDone && (
        <View style={styles.bravoBox}>
          <Text style={styles.bravoText}>Super ! 🎉</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', paddingTop: SPACING.md },
  instruction: { fontFamily: FONT.extraBold, fontSize: 20, color: COLORS.text, textAlign: 'center', marginBottom: SPACING.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: SPACING.md, maxWidth: 360 },
  card: {
    width: 92,
    height: 92,
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    backgroundColor: COLORS.card,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardBack: { backgroundColor: '#F0EDE8', borderColor: COLORS.border },
  matched: { backgroundColor: '#E8FBF5', borderColor: COLORS.success },
  cardText: { fontFamily: FONT.extraBold, fontSize: 42 },
  cardBackText: { fontFamily: FONT.extraBold, fontSize: 34, color: COLORS.textLight },
  bravoBox: { marginTop: SPACING.xl, backgroundColor: '#E8FBF5', borderRadius: RADIUS.xl, padding: SPACING.md },
  bravoText: { fontFamily: FONT.extraBold, fontSize: 20, color: COLORS.success },
});
