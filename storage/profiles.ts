import AsyncStorage from './asyncStorage';
import { ChildProfile } from '../types';

const PROFILES_KEY = 'mps_profiles';
const ACTIVE_PROFILE_KEY = 'mps_active_profile';

export async function getProfiles(): Promise<ChildProfile[]> {
  try {
    const raw = await AsyncStorage.getItem(PROFILES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveProfile(profile: ChildProfile): Promise<void> {
  const profiles = await getProfiles();
  const idx = profiles.findIndex((p) => p.id === profile.id);
  if (idx >= 0) {
    profiles[idx] = profile;
  } else {
    profiles.push(profile);
  }
  await AsyncStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

export async function deleteProfile(id: string): Promise<void> {
  const profiles = await getProfiles();
  await AsyncStorage.setItem(
    PROFILES_KEY,
    JSON.stringify(profiles.filter((p) => p.id !== id))
  );
}

export async function getActiveProfileId(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(ACTIVE_PROFILE_KEY);
  } catch {
    return null;
  }
}

export async function setActiveProfileId(id: string): Promise<void> {
  await AsyncStorage.setItem(ACTIVE_PROFILE_KEY, id);
}

export async function createProfile(profile: ChildProfile): Promise<void> {
  await saveProfile(profile);
  await setActiveProfileId(profile.id);
}

export async function getActiveProfile(): Promise<ChildProfile | null> {
  const profiles = await getProfiles();
  if (profiles.length === 0) return null;

  const activeId = await getActiveProfileId();
  const activeProfile = profiles.find((profile) => profile.id === activeId);
  if (activeProfile) return activeProfile;

  const [firstProfile] = profiles;
  await setActiveProfileId(firstProfile.id);
  return firstProfile;
}
