import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { COLORS, FONT, SPACING, RADIUS } from '../../utils/theme';
import ChildProfileCard from '../../components/ChildProfileCard';
import { getProfiles, getActiveProfileId, setActiveProfileId, deleteProfile } from '../../storage/profiles';
import { deleteProgress } from '../../storage/progress';
import { ChildProfile } from '../../types';

export default function ProfilesScreen() {
  const [profiles, setProfiles] = useState<ChildProfile[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const load = async () => {
    const [p, id] = await Promise.all([getProfiles(), getActiveProfileId()]);
    setProfiles(p);
    setActiveId(id);
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const switchProfile = async (id: string) => {
    await setActiveProfileId(id);
    setActiveId(id);
    router.replace('/(main)/home');
  };

  const handleDelete = (profile: ChildProfile) => {
    Alert.alert(
      'Supprimer le profil',
      `Supprimer le profil de ${profile.name} ? Toute la progression sera perdue.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            await deleteProfile(profile.id);
            await deleteProgress(profile.id);
            const remaining = profiles.filter((p) => p.id !== profile.id);
            if (activeId === profile.id) {
              if (remaining.length > 0) {
                await setActiveProfileId(remaining[0].id);
              } else {
                router.replace('/(onboarding)');
                return;
              }
            }
            load();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Profils</Text>
        <Text style={styles.subtitle}>Appuie pour changer · Maintenir pour supprimer</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.profilesRow} contentContainerStyle={styles.profilesContent}>
          {profiles.map((p) => (
            <ChildProfileCard
              key={p.id}
              profile={p}
              isActive={p.id === activeId}
              onPress={() => switchProfile(p.id)}
              onLongPress={() => handleDelete(p)}
            />
          ))}
        </ScrollView>

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push('/(onboarding)/create-profile')}
          activeOpacity={0.88}
        >
          <Text style={styles.addIcon}>+</Text>
          <Text style={styles.addText}>Ajouter un profil</Text>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>💡 Bon à savoir</Text>
          <Text style={styles.infoText}>
            Chaque enfant a sa propre progression. Appuie sur un profil pour le sélectionner.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  title: { fontFamily: FONT.extraBold, fontSize: 26, color: COLORS.text, marginBottom: 4 },
  subtitle: { fontFamily: FONT.regular, fontSize: 14, color: COLORS.textLight, marginBottom: SPACING.xl },
  profilesRow: { marginBottom: SPACING.xl },
  profilesContent: { paddingRight: SPACING.lg },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  addIcon: { fontFamily: FONT.extraBold, fontSize: 22, color: COLORS.primary },
  addText: { fontFamily: FONT.bold, fontSize: 16, color: COLORS.primary },
  infoBox: {
    backgroundColor: '#FFF8E8',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  infoTitle: { fontFamily: FONT.bold, fontSize: 15, color: COLORS.text },
  infoText: { fontFamily: FONT.regular, fontSize: 14, color: COLORS.textLight },
});
