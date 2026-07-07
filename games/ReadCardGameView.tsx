import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import AudioInstruction from '../components/AudioInstruction';
import PronunciationChallenge from '../components/PronunciationChallenge';
import { ReadCardGame } from '../types';
import { COLORS, SPACING } from '../utils/theme';
import { getActiveProfile } from '../storage/profiles';

interface Props {
  game: ReadCardGame;
  levelColor: string;
  onComplete: (stars: number) => void;
}

export default function ReadCardGameView({ game, levelColor, onComplete }: Props) {
  const [index, setIndex] = useState(0);
  const [childName, setChildName] = useState('Emma');
  const current = game.cards[index];
  const isLast = index === game.cards.length - 1;

  useEffect(() => {
    getActiveProfile().then((profile) => {
      if (profile?.name) setChildName(profile.name);
    });
  }, []);

  const handleSuccess = () => {
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

      <AudioInstruction text={`Écoute puis répète : ${current}.`} audio="read_card.mp3" />

      <PronunciationChallenge
        key={`${current}-${index}`}
        expectedText={current}
        childName={childName}
        levelColor={levelColor}
        onSuccess={handleSuccess}
      />
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
});
