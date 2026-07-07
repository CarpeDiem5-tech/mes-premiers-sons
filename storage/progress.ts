import AsyncStorage from './asyncStorage';
import { ChildProgress } from '../types';

const key = (profileId: string) => `mps_progress_${profileId}`;

const DEFAULT_PROGRESS = (profileId: string): ChildProgress => ({
  profileId,
  currentLevel: 1,
  totalStars: 0,
  completedMissionIds: [],
  lastMissionDate: null,
  lastMissionLevelId: 1,
});

export async function getProgress(profileId: string): Promise<ChildProgress> {
  try {
    const raw = await AsyncStorage.getItem(key(profileId));
    return raw ? JSON.parse(raw) : DEFAULT_PROGRESS(profileId);
  } catch {
    return DEFAULT_PROGRESS(profileId);
  }
}

export async function saveProgress(progress: ChildProgress): Promise<void> {
  await AsyncStorage.setItem(key(progress.profileId), JSON.stringify(progress));
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
