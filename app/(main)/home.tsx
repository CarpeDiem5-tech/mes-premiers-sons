import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { COLORS, FONT, SPACING, RADIUS } from '../../utils/theme';
import GameCatalogCard from '../../components/GameCatalogCard';
import StarCounter from '../../components/StarCounter';
import { getActiveProfile } from '../../storage/profiles';
import { getProgress } from '../../storage/progress';
import { GAME_CATALOG } from '../../data/gameCatalog';
import { ChildProfile, ChildProgress, GameId } from '../../types';

export default function HomeScreen() {
  const [profile, setProfile] = useState<ChildProfile | null>(null);
  const [progress, setProgress] = useState<ChildProgress | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const { width } = useWindowDimensions();
  const isTwoColumns = width >= 430;

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      (async () => {
        const p = await getActiveProfile();
        if (!p) { router.replace('/(onboarding)'); return; }
        if (!isActive) return;

        setProfile(p);
        try {
          const prog = await getProgress(p.id);
          if (isActive) setProgress(prog);
        } catch {
          if (isActive) setProgress(null);
        }
      })();

      return () => {
        isActive = false;
      };
    }, [])
  );

  if (!profile) return null;

  const openGame = (gameId: GameId) => {
    const game = GAME_CATALOG.find((item) => item.id === gameId);
    if (!game) return;

    if (game.availability === 'coming_soon') {
      setMessage('Ce jeu arrive bientôt.');
      return;
    }

    setMessage(null);
    router.push({ pathname: '/game/[gameId]', params: { gameId: game.id } });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => router.push('/(main)/profiles')}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Changer de profil"
          >
            <Text style={styles.avatar}>{profile.avatar}</Text>
            <View>
              <Text style={styles.greeting}>Bonjour</Text>
              <Text style={styles.name}>{profile.name}</Text>
            </View>
          </TouchableOpacity>
          <StarCounter count={progress?.totalStars ?? 0} size="md" />
        </View>

        <View style={styles.hero}>
          <Text style={styles.heroTitle}>À quoi veux-tu jouer ?</Text>
          <Text style={styles.heroSubtitle}>Choisis un jeu.</Text>
        </View>

        {message && (
          <View style={styles.messageBox}>
            <Text style={styles.messageText}>{message}</Text>
          </View>
        )}

        <View style={[styles.grid, !isTwoColumns && styles.gridSingleColumn]}>
          {GAME_CATALOG.map((game) => (
            <GameCatalogCard
              key={game.id}
              game={game}
              progress={progress?.gameProgress?.[game.id]}
              onPress={() => openGame(game.id)}
            />
          ))}
        </View>

        {progress && (
          <TouchableOpacity
            style={styles.guidedLink}
            onPress={() => router.push({ pathname: '/mission', params: { levelId: String(progress.currentLevel) } })}
            activeOpacity={0.75}
          >
            <Text style={styles.guidedLinkText}>Parcours guidé</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  profileButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.card,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 30,
    lineHeight: 54,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  greeting: { fontFamily: FONT.semiBold, fontSize: 15, color: COLORS.textLight },
  name: { fontFamily: FONT.extraBold, fontSize: 24, color: COLORS.text, marginTop: 1 },
  hero: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 6,
  },
  heroTitle: {
    fontFamily: FONT.extraBold,
    fontSize: 29,
    color: COLORS.textWhite,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontFamily: FONT.bold,
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  messageBox: {
    backgroundColor: '#FFF4D6',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#FFE4A3',
  },
  messageText: {
    fontFamily: FONT.extraBold,
    fontSize: 15,
    color: COLORS.text,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  gridSingleColumn: {
    flexDirection: 'column',
  },
  guidedLink: {
    alignSelf: 'center',
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.65)',
  },
  guidedLinkText: {
    fontFamily: FONT.bold,
    fontSize: 14,
    color: COLORS.textLight,
  },
});
