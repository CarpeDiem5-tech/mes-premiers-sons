import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import AudioService from '../services/AudioService';
import { COLORS, FONT, SPACING, RADIUS } from '../utils/theme';
import GameLayout from '../components/GameLayout';
import LetterFamilyIntroGameView from '../games/LetterFamilyIntroGameView';
import ObserveLettersGameView from '../games/ObserveLettersGameView';
import SortLetterGame from '../games/SortLetterGame';
import FindVowelGame from '../games/FindVowelGame';
import FindConsonantGame from '../games/FindConsonantGame';
import LetterFamilyMemoryGame from '../games/LetterFamilyMemoryGame';
import FindSyllableGameView from '../games/FindSyllableGameView';
import ReadCardGameView from '../games/ReadCardGameView';
import MemoryGameView from '../games/MemoryGameView';
import { generateMission } from '../utils/generateMission';
import { getLevelById } from '../data/levels';
import { getActiveProfileId } from '../storage/profiles';
import { recordMissionComplete } from '../storage/progress';
import { Mission } from '../types';

type Phase = 'ready' | 'playing' | 'complete';

export default function MissionScreen() {
  const { levelId } = useLocalSearchParams<{ levelId: string }>();
  const numericLevelId = parseInt(levelId ?? '1', 10);
  const level = getLevelById(numericLevelId);

  const [mission, setMission] = useState<Mission | null>(null);
  const [gameIndex, setGameIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('ready');
  const [totalStars, setTotalStars] = useState(0);

  useEffect(() => {
    if (level) {
      setMission(generateMission(numericLevelId));
    }
  }, [numericLevelId]);

  if (!level || !mission) return null;

  const currentGame = mission.games[gameIndex];
  const totalGames = mission.games.length;

  const handleGameComplete = (stars: number) => {
    setTotalStars((s) => s + stars);
    if (gameIndex < totalGames - 1) {
      setGameIndex((i) => i + 1);
    } else {
      setPhase('complete');
      finishMission(totalStars + stars);
    }
  };

  const finishMission = async (stars: number) => {
    const id = await getActiveProfileId();
    if (id) {
      await recordMissionComplete(id, mission.id, stars);
    }
    AudioService.playFeedback('Mission accomplie !');
  };

  if (phase === 'ready') {
    return (
      <SafeAreaView style={styles.readySafe}>
        <View style={styles.readyContainer}>
          <Text style={styles.readyIcon}>{level.icon}</Text>
          <Text style={styles.readyTitle}>Mission du jour</Text>
          <Text style={[styles.readyLevel, { color: level.color }]}>{level.title}</Text>
          <Text style={styles.readyDesc}>{level.description}</Text>
          <View style={styles.readyGames}>
            {mission.games.map((g, i) => (
              <View key={i} style={[styles.readyGameChip, { backgroundColor: level.color + '22' }]}>
                <Text style={[styles.readyGameText, { color: level.color }]}>
                  {g.type === 'letter_family_intro'
                    ? '🏠 Les deux maisons'
                    : g.type === 'observe_letters'
                    ? '👀 Observe les lettres'
                    : g.type === 'sort_letter'
                    ? '🏡 Où habite la lettre ?'
                    : g.type === 'find_vowel'
                    ? '🔎 Maison des voyelles'
                    : g.type === 'find_consonant'
                    ? '🔎 Maison des consonnes'
                    : g.type === 'letter_family_memory'
                    ? '🃏 Même maison'
                    : g.type === 'find_syllable'
                    ? '🔍 Trouve la syllabe'
                    : g.type === 'read_card'
                    ? '📖 Lis la carte'
                    : '🃏 Memory'}
                </Text>
              </View>
            ))}
          </View>
          <TouchableOpacity
            style={[styles.goBtn, { backgroundColor: level.color }]}
            onPress={() => setPhase('playing')}
            activeOpacity={0.88}
          >
            <Text style={styles.goBtnText}>C'est parti ! 🚀</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
            <Text style={styles.backLinkText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (phase === 'complete') {
    return (
      <SafeAreaView style={styles.completeSafe}>
        <View style={styles.completeContainer}>
          <Text style={styles.completeEmoji}>🎉</Text>
          <Text style={styles.completeTitle}>Mission accomplie !</Text>
          <Text style={styles.completeStars}>{'⭐'.repeat(Math.min(Math.round(totalStars / totalGames), 3))}</Text>
          <Text style={styles.completePoints}>+{totalStars} étoiles gagnées !</Text>
          <TouchableOpacity
            style={[styles.goBtn, { backgroundColor: level.color }]}
            onPress={() => router.replace('/(main)/home')}
            activeOpacity={0.88}
          >
            <Text style={styles.goBtnText}>Retour à l'accueil</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (currentGame.type === 'letter_family_intro') {
    return (
      <SafeAreaView style={styles.introSafe}>
        <TouchableOpacity onPress={() => router.back()} style={styles.introBackBtn} activeOpacity={0.7}>
          <Text style={styles.introBackIcon}>✕</Text>
        </TouchableOpacity>
        <LetterFamilyIntroGameView key={`intro-${gameIndex}`} onComplete={handleGameComplete} />
      </SafeAreaView>
    );
  }

  return (
    <GameLayout
      title={
        currentGame.type === 'observe_letters'
          ? 'Observe !'
          : currentGame.type === 'sort_letter'
          ? 'Où habite la lettre ?'
          : currentGame.type === 'find_vowel'
          ? 'Maison des voyelles !'
          : currentGame.type === 'find_consonant'
          ? 'Maison des consonnes !'
          : currentGame.type === 'letter_family_memory'
          ? 'Même maison !'
          : currentGame.type === 'find_syllable'
          ? 'Trouve la syllabe !'
          : currentGame.type === 'read_card'
          ? 'Lis la carte !'
          : 'Memory !'
      }
      gameIndex={gameIndex + 1}
      totalGames={totalGames}
      levelColor={level.color}
      onBack={() => router.back()}
    >
      {currentGame.type === 'observe_letters' && (
        <ObserveLettersGameView
          key={`observe-${gameIndex}`}
          game={currentGame}
          onComplete={handleGameComplete}
        />
      )}
      {currentGame.type === 'sort_letter' && (
        <SortLetterGame
          key={`sort-${gameIndex}`}
          game={currentGame}
          onComplete={handleGameComplete}
        />
      )}
      {currentGame.type === 'find_vowel' && (
        <FindVowelGame
          key={`vowel-${gameIndex}`}
          game={currentGame}
          onComplete={handleGameComplete}
        />
      )}
      {currentGame.type === 'find_consonant' && (
        <FindConsonantGame
          key={`consonant-${gameIndex}`}
          game={currentGame}
          onComplete={handleGameComplete}
        />
      )}
      {currentGame.type === 'letter_family_memory' && (
        <LetterFamilyMemoryGame
          key={`family-memory-${gameIndex}`}
          game={currentGame}
          onComplete={handleGameComplete}
        />
      )}
      {currentGame.type === 'find_syllable' && (
        <FindSyllableGameView
          key={`find-${gameIndex}`}
          game={currentGame}
          levelColor={level.color}
          onComplete={handleGameComplete}
        />
      )}
      {currentGame.type === 'read_card' && (
        <ReadCardGameView
          key={`read-${gameIndex}`}
          game={currentGame}
          levelColor={level.color}
          onComplete={handleGameComplete}
        />
      )}
      {currentGame.type === 'memory' && (
        <MemoryGameView
          key={`memory-${gameIndex}`}
          game={currentGame}
          levelColor={level.color}
          onComplete={handleGameComplete}
        />
      )}
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  introSafe: { flex: 1, backgroundColor: COLORS.background },
  introBackBtn: {
    position: 'absolute',
    top: SPACING.lg,
    left: SPACING.lg,
    zIndex: 1,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  introBackIcon: {
    fontSize: 16,
    color: COLORS.textLight,
    fontFamily: FONT.bold,
  },
  readySafe: { flex: 1, backgroundColor: COLORS.background },
  readyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  readyIcon: { fontSize: 72, marginBottom: SPACING.md },
  readyTitle: { fontFamily: FONT.semiBold, fontSize: 18, color: COLORS.textLight, marginBottom: 4 },
  readyLevel: { fontFamily: FONT.extraBold, fontSize: 28, marginBottom: SPACING.sm },
  readyDesc: {
    fontFamily: FONT.regular,
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  readyGames: { gap: SPACING.sm, width: '100%', marginBottom: SPACING.xl },
  readyGameChip: {
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
  },
  readyGameText: { fontFamily: FONT.bold, fontSize: 15 },
  goBtn: {
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xxl,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: SPACING.md,
  },
  goBtnText: { fontFamily: FONT.extraBold, fontSize: 20, color: COLORS.textWhite },
  backLink: { padding: SPACING.sm },
  backLinkText: { fontFamily: FONT.semiBold, fontSize: 15, color: COLORS.textLight },
  completeSafe: { flex: 1, backgroundColor: COLORS.background },
  completeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  completeEmoji: { fontSize: 80, marginBottom: SPACING.md },
  completeTitle: { fontFamily: FONT.extraBold, fontSize: 30, color: COLORS.text, marginBottom: SPACING.md },
  completeStars: { fontSize: 40, marginBottom: SPACING.sm },
  completePoints: { fontFamily: FONT.bold, fontSize: 20, color: COLORS.star, marginBottom: SPACING.xl },
});
