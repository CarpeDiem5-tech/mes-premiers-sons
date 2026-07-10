import AsyncStorage from './asyncStorage';
import { ChildProgress, GameId, GameProgress, GameSessionResult } from '../types';

const key = (profileId: string) => `mps_progress_${profileId}`;

const CURRENT_PROGRESS_SCHEMA_VERSION = 2;

const DEFAULT_PROGRESS = (profileId: string): ChildProgress => ({
  profileId,
  currentLevel: 1,
  totalStars: 0,
  completedMissionIds: [],
  lastMissionDate: null,
  lastMissionLevelId: 1,
  schemaVersion: CURRENT_PROGRESS_SCHEMA_VERSION,
  gameProgress: {},
});

const DEFAULT_GAME_PROGRESS = (gameId: GameId): GameProgress => ({
  gameId,
  stage: 1,
  totalSessions: 0,
  completedSessions: 0,
  totalCorrectAnswers: 0,
  totalAttempts: 0,
  currentStreak: 0,
  bestStreak: 0,
  totalStarsEarned: 0,
  bestStarsInSession: 0,
  successfulSessionsAtCurrentStage: 0,
  lastPlayedAt: null,
  practicedItemIds: [],
  masteredItemIds: [],
});

function unique(items: string[]): string[] {
  return Array.from(new Set(items));
}

function withGameProgressDefaults(gameId: GameId, progress?: Partial<GameProgress>): GameProgress {
  return {
    ...DEFAULT_GAME_PROGRESS(gameId),
    ...progress,
    gameId,
    practicedItemIds: Array.isArray(progress?.practicedItemIds) ? progress.practicedItemIds : [],
    masteredItemIds: Array.isArray(progress?.masteredItemIds) ? progress.masteredItemIds : [],
    successfulSessionsAtCurrentStage: progress?.successfulSessionsAtCurrentStage ?? 0,
  };
}

function normalizeGameProgress(gameProgress: ChildProgress['gameProgress'] = {}): ChildProgress['gameProgress'] {
  return Object.entries(gameProgress).reduce<ChildProgress['gameProgress']>((acc, [gameId, progress]) => {
    acc[gameId as GameId] = withGameProgressDefaults(gameId as GameId, progress);
    return acc;
  }, {});
}

function migrateProgress(profileId: string, rawProgress: Partial<ChildProgress>): ChildProgress {
  const fallback = DEFAULT_PROGRESS(profileId);
  const completedMissionIds = Array.isArray(rawProgress.completedMissionIds)
    ? rawProgress.completedMissionIds
    : fallback.completedMissionIds;
  const hadSchemaVersion = typeof rawProgress.schemaVersion === 'number';

  const progress: ChildProgress = {
    ...fallback,
    ...rawProgress,
    profileId: rawProgress.profileId ?? profileId,
    currentLevel: rawProgress.currentLevel ?? fallback.currentLevel,
    totalStars: rawProgress.totalStars ?? fallback.totalStars,
    completedMissionIds,
    lastMissionDate: rawProgress.lastMissionDate ?? fallback.lastMissionDate,
    lastMissionLevelId: rawProgress.lastMissionLevelId ?? fallback.lastMissionLevelId,
    schemaVersion: CURRENT_PROGRESS_SCHEMA_VERSION,
    gameProgress: normalizeGameProgress(rawProgress.gameProgress),
  };

  if (!hadSchemaVersion && !progress.legacyStats) {
    progress.legacyStats = {
      totalStarsBeforeGameLibrary: progress.totalStars,
      completedMissionCount: completedMissionIds.length,
      migratedAt: new Date().toISOString(),
    };
  }

  return progress;
}

export async function getProgress(profileId: string): Promise<ChildProgress> {
  try {
    const raw = await AsyncStorage.getItem(key(profileId));
    if (!raw) return DEFAULT_PROGRESS(profileId);

    const parsed = JSON.parse(raw) as Partial<ChildProgress>;
    const migrated = migrateProgress(profileId, parsed);

    if (JSON.stringify(parsed) !== JSON.stringify(migrated)) {
      await saveProgress(migrated);
    }

    return migrated;
  } catch {
    return DEFAULT_PROGRESS(profileId);
  }
}

export async function saveProgress(progress: ChildProgress): Promise<void> {
  await AsyncStorage.setItem(key(progress.profileId), JSON.stringify(progress));
}

export async function getGameProgress(
  profileId: string,
  gameId: GameId
): Promise<GameProgress> {
  const progress = await getProgress(profileId);
  return withGameProgressDefaults(gameId, progress.gameProgress[gameId]);
}

export async function recordGameSession(
  profileId: string,
  result: GameSessionResult
): Promise<ChildProgress> {
  const progress = await getProgress(profileId);
  const existingGameProgress = withGameProgressDefaults(result.gameId, progress.gameProgress[result.gameId]);

  // Une série représente ici le nombre de sessions complétées consécutives.
  // Une session non complétée remet la série courante à zéro, sans modifier la meilleure série.
  const currentStreak = result.completed ? existingGameProgress.currentStreak + 1 : 0;
  const nextStage = Math.max(existingGameProgress.stage, result.stage);
  const completedWithStrongResult = result.completed && result.starsEarned >= 3;
  const successfulSessionsAtCurrentStage = nextStage > existingGameProgress.stage
    ? 0
    : completedWithStrongResult
    ? existingGameProgress.successfulSessionsAtCurrentStage + 1
    : 0;

  const updatedGameProgress: GameProgress = {
    ...existingGameProgress,
    stage: nextStage,
    totalSessions: existingGameProgress.totalSessions + 1,
    completedSessions: existingGameProgress.completedSessions + (result.completed ? 1 : 0),
    totalCorrectAnswers: existingGameProgress.totalCorrectAnswers + result.correctAnswers,
    totalAttempts: existingGameProgress.totalAttempts + result.totalAttempts,
    currentStreak,
    bestStreak: Math.max(existingGameProgress.bestStreak, currentStreak),
    totalStarsEarned: existingGameProgress.totalStarsEarned + result.starsEarned,
    bestStarsInSession: Math.max(existingGameProgress.bestStarsInSession, result.starsEarned),
    successfulSessionsAtCurrentStage,
    lastPlayedAt: result.completedAt,
    practicedItemIds: unique([...existingGameProgress.practicedItemIds, ...result.practicedItemIds]),
    masteredItemIds: unique([...existingGameProgress.masteredItemIds, ...result.masteredItemIds]),
  };

  progress.totalStars += result.starsEarned;
  progress.gameProgress = {
    ...progress.gameProgress,
    [result.gameId]: updatedGameProgress,
  };

  await saveProgress(progress);
  return progress;
}

export async function recordMissionComplete(
  profileId: string,
  missionId: string,
  starsEarned: number
): Promise<ChildProgress> {
  const progress = await getProgress(profileId);
  if (!progress.completedMissionIds.includes(missionId)) {
    progress.completedMissionIds.push(missionId);
    progress.totalStars += starsEarned;
  }
  progress.lastMissionDate = new Date().toISOString();
  progress.lastMissionLevelId = progress.currentLevel;

  const missionsForLevel = progress.completedMissionIds.filter((id) =>
    id.startsWith(`${progress.currentLevel}-`)
  ).length;

  if (missionsForLevel >= 3 && progress.currentLevel < 8) {
    progress.currentLevel += 1;
  }

  await saveProgress(progress);
  return progress;
}

export async function deleteProgress(profileId: string): Promise<void> {
  await AsyncStorage.removeItem(key(profileId));
}
