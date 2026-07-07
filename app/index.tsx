import { useEffect } from 'react';
import { router } from 'expo-router';
import { getActiveProfileId, getProfiles } from '../storage/profiles';
import { View, ActivityIndicator } from 'react-native';
import { COLORS } from '../utils/theme';

export default function IndexScreen() {
  useEffect(() => {
    (async () => {
      const id = await getActiveProfileId();
      if (!id) { router.replace('/(onboarding)'); return; }
      const profiles = await getProfiles();
      if (!profiles.find((p) => p.id === id)) {
        router.replace('/(onboarding)');
      } else {
        router.replace('/(main)/home');
      }
    })();
  }, []);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background }}>
      <ActivityIndicator color={COLORS.primary} size="large" />
    </View>
  );
}
