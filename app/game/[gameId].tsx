import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { COLORS, FONT, RADIUS, SPACING } from '../../utils/theme';
import StarCounter from '../../components/StarCounter';
import { GAME_CATALOG, GameDefinition, getGameDefinitionById } from '../../data/gameCatalog';
import { getActiveProfile } from '../../storage/profiles';
import { getGameProgress, getProgress, recordGameSession } from '../../storage/progress';
import { GAME_COMPONENTS } from '../../games/gameRegistry';
import { ChildProfile, GameId, GameProgress, GameSessionResult } from '../../types';

type ScreenState = 'loading' | 'ready' | 'playing' | 'complete' | 'error' | 'not_found' | 'coming_soon' | 'preparing' | 'no_profile';

function isGameId(value: string): value is GameId {
  return GAME_CATALOG.some((game) => game.id === value);
}

export default function GameLaunchScreen() {
  const { gameId } = useLocalSearchParams<{ gameId?: string | string[] }>();
  const normalizedGameId = Array.isArray(gameId) ? gameId[0] : gameId;
  const [state, setState] = useState<ScreenState>('loading');
  const [game, setGame] = useState<GameDefinition | null>(null);
  const [profile, setProfile] = useState<ChildProfile | null>(null);
  const [gameProgress, setGameProgress] = useState<GameProgress | null>(null);
  const [totalStars, setTotalStars] = useState(0);
  const [result, setResult] = useState<GameSessionResult | null>(null);
  const [sessionKey, setSessionKey] = useState(0);
  const hasRecordedResult = useRef(false);

  const loadGame = useCallback(async () => {
    setState('loading');
    setResult(null);
    hasRecordedResult.current = false;

    if (!normalizedGameId || !isGameId(normalizedGameId)) {
      setState('not_found');
      return;
    }

    const foundGame = getGameDefinitionById(normalizedGameId);
    if (!foundGame) {
      setState('not_found');
      return;
    }

    setGame(foundGame);

    if (foundGame.availability !== 'available') {
      setState('coming_soon');
      return;
    }

    const GameComponent = GAME_COMPONENTS[foundGame.id];
    if (!GameComponent) {
      setState('preparing');
      return;
    }

    const activeProfile = await getActiveProfile();
    if (!activeProfile) {
      setState('no_profile');
      router.replace('/(main)/profiles');
      return;
    }

    try {
      const [profileProgress, selectedGameProgress] = await Promise.all([
        getProgress(activeProfile.id),
        getGameProgress(activeProfile.id, foundGame.id),
      ]);

      setProfile(activeProfile);
      setTotalStars(profileProgress.totalStars);
      setGameProgress(selectedGameProgress);
      setState('ready');
    } catch {
      setProfile(activeProfile);
      setState('error');
    }
  }, [normalizedGameId]);

  useEffect(() => {
    loadGame();
  }, [loadGame]);

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(main)/home');
  };

  const chooseAnotherGame = () => {
    router.replace('/(main)/home');
  };

  const startPlaying = () => {
    setResult(null);
    hasRecordedResult.current = false;
    setSessionKey((value) => value + 1);
    setState('playing');
  };

  const handleComplete = async (sessionResult: GameSessionResult) => {
    if (!profile || hasRecordedResult.current) return;
    hasRecordedResult.current = true;
    setResult(sessionResult);
    setState('complete');

    try {
      const updatedProgress = await recordGameSession(profile.id, sessionResult);
      setTotalStars(updatedProgress.totalStars);
      setGameProgress(updatedProgress.gameProgress[sessionResult.gameId] ?? null);
    } catch {
      setState('error');
    }
  };

  const replay = async () => {
    if (!profile || !game) return;
    try {
      const [profileProgress, selectedGameProgress] = await Promise.all([
        getProgress(profile.id),
        getGameProgress(profile.id, game.id),
      ]);
      setTotalStars(profileProgress.totalStars);
      setGameProgress(selectedGameProgress);
      startPlaying();
    } catch {
      setState('error');
    }
  };

  if (state === 'loading') {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <Text style={styles.loadingText}>Chargement…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (state === 'not_found') {
    return <InfoScreen title="Jeu introuvable" icon="❓" onBack={goBack} />;
  }

  if (state === 'coming_soon') {
    return <InfoScreen title="Bientôt disponible" icon={game?.icon ?? '✨'} description="Ce jeu arrive bientôt." onBack={goBack} />;
  }

  if (state === 'preparing') {
    return <InfoScreen title="Ce jeu est en préparation" icon={game?.icon ?? '✨'} description="Il arrive bientôt dans la bibliothèque." onBack={goBack} />;
  }

  if (state === 'no_profile') {
    return <InfoScreen title="Profil introuvable" icon="👋" description="Choisis un profil pour jouer." onBack={() => router.replace('/(main)/profiles')} />;
  }

  if (state === 'error') {
    return <InfoScreen title="Oups" icon="🌟" description="On réessaie dans un instant." onBack={goBack} />;
  }

  if (!game) return null;

  const GameComponent = GAME_COMPONENTS[game.id];

  if (state === 'playing') {
    if (!GameComponent || !profile || !gameProgress) {
      return <InfoScreen title="Ce jeu est en préparation" icon={game.icon} description="Il arrive bientôt dans la bibliothèque." onBack={goBack} />;
    }

    return (
      <SafeAreaView style={styles.safe}>
        <GameComponent
          key={`${game.id}-${sessionKey}`}
          profile={profile}
          progress={gameProgress}
          onComplete={handleComplete}
          onExit={() => setState('ready')}
        />
      </SafeAreaView>
    );
  }

  if (state === 'complete' && result) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <Text style={styles.completeEmoji}>🎉</Text>
          <Text style={styles.completeTitle}>Bravo !</Text>
          <Text style={styles.completeStars}>{'⭐'.repeat(result.starsEarned)}</Text>
          <Text style={styles.completeText}>+{result.starsEarned} étoiles gagnées</Text>
          <TouchableOpacity style={[styles.startButton, { backgroundColor: game.color }]} onPress={replay} activeOpacity={0.86}>
            <Text style={styles.startButtonText}>Rejouer</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={chooseAnotherGame} style={styles.secondaryButton} activeOpacity={0.75}>
            <Text style={styles.secondaryButtonText}>Choisir un autre jeu</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const sessions = gameProgress?.totalSessions ?? 0;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.backButton} activeOpacity={0.75}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <StarCounter count={totalStars} size="sm" />
        </View>

        <View style={[styles.iconCircle, { backgroundColor: `${game.color}22` }]}>
          <Text style={styles.icon}>{game.icon}</Text>
        </View>
        <Text style={styles.title}>{game.title}</Text>
        <Text style={styles.description}>{game.shortDescription}</Text>

        <View style={styles.metaRow}>
          <View style={[styles.metaPill, { backgroundColor: `${game.color}18` }]}>
            <Text style={[styles.metaText, { color: game.color }]}>{game.estimatedMinutes} min</Text>
          </View>
          <View style={styles.metaPillMuted}>
            <Text style={styles.metaTextMuted}>{sessions > 0 ? `${sessions} parties` : 'Nouveau'}</Text>
          </View>
        </View>

        {profile && <Text style={styles.childHint}>Prêt, {profile.name} ?</Text>}

        <TouchableOpacity
          style={[styles.startButton, { backgroundColor: game.color }]}
          onPress={startPlaying}
          activeOpacity={0.86}
        >
          <Text style={styles.startButtonText}>Commencer</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={goBack} style={styles.secondaryButton} activeOpacity={0.75}>
          <Text style={styles.secondaryButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function InfoScreen({
  title,
  icon,
  description,
  onBack,
}: {
  title: string;
  icon: string;
  description?: string;
  onBack: () => void;
}) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.centered}>
        <Text style={styles.infoIcon}>{icon}</Text>
        <Text style={styles.infoTitle}>{title}</Text>
        {description ? <Text style={styles.infoDescription}>{description}</Text> : null}
        <TouchableOpacity style={styles.secondaryButton} onPress={onBack} activeOpacity={0.75}>
          <Text style={styles.secondaryButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.lg,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  backText: { fontFamily: FONT.extraBold, fontSize: 24, color: COLORS.textLight },
  iconCircle: {
    width: 132,
    height: 132,
    borderRadius: 66,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  icon: { fontSize: 72 },
  title: {
    fontFamily: FONT.extraBold,
    fontSize: 30,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  description: {
    fontFamily: FONT.semiBold,
    fontSize: 17,
    lineHeight: 23,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  metaRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  metaPill: {
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  metaPillMuted: {
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.card,
  },
  metaText: { fontFamily: FONT.extraBold, fontSize: 14 },
  metaTextMuted: { fontFamily: FONT.extraBold, fontSize: 14, color: COLORS.textLight },
  childHint: {
    fontFamily: FONT.bold,
    fontSize: 18,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  startButton: {
    width: '100%',
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    marginTop: 'auto',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 6,
  },
  startButtonText: {
    fontFamily: FONT.extraBold,
    fontSize: 21,
    color: COLORS.textWhite,
  },
  secondaryButton: {
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.card,
  },
  secondaryButtonText: {
    fontFamily: FONT.bold,
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  loadingText: {
    fontFamily: FONT.bold,
    fontSize: 18,
    color: COLORS.textLight,
  },
  infoIcon: { fontSize: 76, marginBottom: SPACING.md },
  infoTitle: {
    fontFamily: FONT.extraBold,
    fontSize: 28,
    color: COLORS.text,
    textAlign: 'center',
  },
  infoDescription: {
    fontFamily: FONT.semiBold,
    fontSize: 17,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  completeEmoji: { fontSize: 80, marginTop: SPACING.xxl, marginBottom: SPACING.md },
  completeTitle: { fontFamily: FONT.extraBold, fontSize: 32, color: COLORS.text, marginBottom: SPACING.sm },
  completeStars: { fontSize: 42, marginBottom: SPACING.sm },
  completeText: { fontFamily: FONT.bold, fontSize: 19, color: COLORS.star, marginBottom: SPACING.xl },
});
