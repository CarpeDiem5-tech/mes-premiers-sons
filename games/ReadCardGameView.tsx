import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Speech from 'expo-speech';
import AudioInstruction from '../components/AudioInstruction';
import { ReadCardGame } from '../types';
import { COLORS, FONT, SPACING, RADIUS } from '../utils/theme';

interface Props {
  game: ReadCardGame;
  levelColor: string;
  onComplete: (stars: number) => void;
}

export default function ReadCardGameView({ game, levelColor, onComplete }: Props) {
  const [index, setIndex] = useState(0);
  const [hasListened, setHasListened] = useState(false);
  const [hasRead, setHasRead] = useState(false);
  const current = game.cards[index];
  const isLast = index === game.cards.length - 1;

  useEffect(() => {
    setHasListened(false);
    setHasRead(false);
  }, [index]);

  const speak = () => {
    Speech.speak(current, { language: 'fr-FR', rate: 0.7 });
    setHasListened(true);
  };

  const markRead = () => {
    setHasRead(true);
    Speech.speak('Bravo !', { language: 'fr-FR' });
  };

  const next = () => {
    if (!hasRead) return;
    if (isLast) {
      onComplete(3);
    } else {
      setIndex((i) => i + 1);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.progress}>
        {game.cards.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, { backgroundColor: i <= index ? levelColor : COLORS.border }]}
          />
        ))}
      </View>

      <AudioInstruction text={`Écoute puis lis : ${current}.`} audio="read_card.mp3" />

      <View style={[styles.card, { borderColor: levelColor }]}>
        <Text style={[styles.cardText, { color: levelColor }]}>{current}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={[styles.btn, styles.listenBtn]} onPress={speak} activeOpacity={0.8}>
          <Text style={styles.btnIcon}>🔊</Text>
          <Text style={[styles.btnText, { color: levelColor }]}>Écouter</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.readBtn, { backgroundColor: hasRead ? levelColor : COLORS.card, borderColor: hasRead ? levelColor : COLORS.border }]}
          onPress={markRead}
          activeOpacity={0.8}
        >
          <Text style={styles.btnIcon}>✅</Text>
          <Text style={[styles.btnText, { color: hasRead ? COLORS.textWhite : levelColor }]}>J'ai lu</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.nextBtn, { backgroundColor: hasRead ? levelColor : COLORS.border }]}
          onPress={next}
          activeOpacity={hasRead ? 0.8 : 1}
        >
          <Text style={styles.btnIcon}>➡️</Text>
          <Text style={[styles.btnText, { color: hasRead ? COLORS.textWhite : COLORS.textLight }]}>
            {isLast ? 'Terminer' : 'Suivant'}
          </Text>
        </TouchableOpacity>
      </View>

      {!hasListened && (
        <Text style={styles.hint}>Appuie sur 🔊 pour écouter</Text>
      )}
      {hasListened && !hasRead && (
        <Text style={styles.hint}>Lis la carte, puis appuie sur ✅</Text>
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
  progress: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    width: 220,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 6,
    marginBottom: SPACING.xl,
  },
  cardText: {
    fontFamily: FONT.extraBold,
    fontSize: 64,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
    gap: SPACING.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  listenBtn: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
  },
  readBtn: {},
  nextBtn: {},
  btnIcon: {
    fontSize: 20,
  },
  btnText: {
    fontFamily: FONT.bold,
    fontSize: 16,
  },
  hint: {
    fontFamily: FONT.regular,
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: SPACING.lg,
    textAlign: 'center',
  },
});
