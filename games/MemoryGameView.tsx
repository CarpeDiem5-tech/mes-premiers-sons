import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Speech from 'expo-speech';
import AudioInstruction from '../components/AudioInstruction';
import { MemoryGame } from '../types';
import { COLORS, FONT, SPACING, RADIUS } from '../utils/theme';

interface CardState {
  id: number;
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface Props {
  game: MemoryGame;
  levelColor: string;
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

export default function MemoryGameView({ game, levelColor, onComplete }: Props) {
  const [cards, setCards] = useState<CardState[]>(() =>
    shuffle(game.cards).map((v, i) => ({ id: i, value: v, isFlipped: false, isMatched: false }))
  );
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);

  const matchedCount = cards.filter((c) => c.isMatched).length;
  const totalPairs = cards.length / 2;
  const allDone = matchedCount === cards.length;

  useEffect(() => {
    if (allDone) {
      const stars = moves <= totalPairs + 1 ? 3 : moves <= totalPairs + 3 ? 2 : 1;
      Speech.speak('Excellent !', { language: 'fr-FR' });
      setTimeout(() => onComplete(stars), 1000);
    }
  }, [allDone]);

  const flipCard = (id: number) => {
    if (locked) return;
    const card = cards.find((c) => c.id === id);
    if (!card || card.isFlipped || card.isMatched) return;
    if (selected.length === 1 && selected[0] === id) return;

    const newCards = cards.map((c) => (c.id === id ? { ...c, isFlipped: true } : c));
    setCards(newCards);

    const newSelected = [...selected, id];
    setSelected(newSelected);

    if (newSelected.length === 2) {
      setMoves((m) => m + 1);
      setLocked(true);
      const [a, b] = newSelected;
      const cardA = newCards.find((c) => c.id === a)!;
      const cardB = newCards.find((c) => c.id === b)!;

      if (cardA.value === cardB.value) {
        Speech.speak('Oui !', { language: 'fr-FR' });
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) => (c.id === a || c.id === b ? { ...c, isMatched: true } : c))
          );
          setSelected([]);
          setLocked(false);
        }, 600);
      } else {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) => (c.id === a || c.id === b ? { ...c, isFlipped: false } : c))
          );
          setSelected([]);
          setLocked(false);
        }, 900);
      }
    }
  };

  return (
    <View style={styles.container}>
      <AudioInstruction text="Trouve les paires !" audio="find_pairs.mp3" />
      <View style={styles.grid}>
        {cards.map((card) => (
          <TouchableOpacity
            key={card.id}
            style={[
              styles.card,
              card.isFlipped || card.isMatched
                ? { backgroundColor: card.isMatched ? '#E8FBF5' : COLORS.card, borderColor: card.isMatched ? COLORS.success : levelColor }
                : styles.cardBack,
            ]}
            onPress={() => flipCard(card.id)}
            activeOpacity={0.8}
          >
            {card.isFlipped || card.isMatched ? (
              <Text style={[styles.cardText, { color: card.isMatched ? COLORS.success : levelColor }]}>
                {card.value}
              </Text>
            ) : (
              <Text style={styles.cardBackText}>?</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
      {allDone && (
        <View style={styles.bravo}>
          <Text style={styles.bravoText}>Excellent ! 🎉</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: SPACING.md,
  },
  info: {
    fontFamily: FONT.semiBold,
    fontSize: 16,
    color: COLORS.textLight,
    marginBottom: SPACING.xl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.md,
    maxWidth: 360,
  },
  card: {
    width: 100,
    height: 100,
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    backgroundColor: COLORS.card,
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardBack: {
    backgroundColor: '#F0EDE8',
    borderColor: COLORS.border,
  },
  cardText: {
    fontFamily: FONT.extraBold,
    fontSize: 30,
  },
  cardBackText: {
    fontFamily: FONT.extraBold,
    fontSize: 36,
    color: COLORS.textLight,
  },
  bravo: {
    marginTop: SPACING.xl,
    backgroundColor: '#E8FBF5',
    borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
  },
  bravoText: {
    fontFamily: FONT.extraBold,
    fontSize: 22,
    color: COLORS.success,
  },
});
