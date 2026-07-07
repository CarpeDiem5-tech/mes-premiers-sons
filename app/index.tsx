import { useEffect } from 'react';
import { router } from 'expo-router';
import { getActiveProfile } from '../storage/profiles';
import { View, ActivityIndicator } from 'react-native';
import { COLORS } from '../utils/theme';

export default function IndexScreen() {
  useEffect(() => {
    (async () => {
      const profile = await getActiveProfile();
      router.replace(profile ? '/(main)/home' : '/(onboarding)');
    })();
  }, []);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background }}>
      <ActivityIndicator color={COLORS.primary} size="large" />
    </View>
  );
}
