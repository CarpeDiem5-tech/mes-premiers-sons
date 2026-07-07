import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { COLORS, FONT, SPACING, RADIUS } from '../../utils/theme';
import MissionCard from '../../components/MissionCard';
import StarCounter from '../../components/StarCounter';
import ProgressBar from '../../components/ProgressBar';
import { getActiveProfile } from '../../storage/profiles';
import { getProgress } from '../../storage/progress';
import { getLevelById, TOTAL_LEVELS } from '../../data/levels';
import { ChildProfile, ChildProgress } from '../../types';

export default function HomeScreen() {
  const [profile, setProfile] = useState<ChildProfile | null>(null);
  const [progress, setProgress] = useState<ChildProgress | null>(null);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const p = await getActiveProfile();
        if (!p) { router.replace('/(onboarding)'); return; }
        setProfile(p);
        const prog = await getProgress(p.id);
        setProgress(prog);
      })();
    }, [])
  );

  if (!profile || !progress) return null;

  const level = getLevelById(progress.currentLevel);
  const lastMissionLevel = getLevelById(progress.lastMissionLevelId);
  if (!level) return null;

  const missionsDoneThisLevel = progress.completedMissionIds.filter((id) =>
    id.startsWith(`${progress.currentLevel}-`)
  ).length;
  const levelProgress = Math.min(missionsDoneThisLevel / 3, 1);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bonjour {profile.name}</Text>
            <Text style={styles.name}>{profile.avatar} Mission du jour</Text>
          </View>
          <StarCounter count={progress.totalStars} size="md" />
        </View>

        <MissionCard
          onPress={() => router.push({ pathname: '/mission', params: { levelId: String(progress.currentLevel) } })}
          levelTitle={level.title}
          levelIcon={level.icon}
          estimatedMinutes={5}
        />

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🎯</Text>
            <Text style={styles.statValue}>{progress.completedMissionIds.length}</Text>
            <Text style={styles.statLabel}>Missions</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>📚</Text>
            <Text style={styles.statValue}>{progress.currentLevel}/{TOTAL_LEVELS}</Text>
            <Text style={styles.statLabel}>Niveau</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🕐</Text>
            <Text style={styles.statValue}>{progress.lastMissionDate ? lastMissionLevel?.title ?? 'Mission' : 'Aucune'}</Text>
            <Text style={styles.statLabel}>Dernière mission</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Niveau en cours</Text>
            <Text style={styles.sectionSub}>{level.title}</Text>
          </View>
          <View style={styles.levelProgressBox}>
            <View style={[styles.levelIconCircle, { backgroundColor: level.color + '22' }]}>
              <Text style={styles.levelIcon}>{level.icon}</Text>
            </View>
            <View style={styles.levelInfo}>
              <Text style={styles.levelDesc}>{level.description}</Text>
              <ProgressBar progress={levelProgress} color={level.color} height={10} />
              <Text style={styles.levelSub}>{missionsDoneThisLevel}/3 missions pour avancer</Text>
            </View>
          </View>
        </View>

        <View style={styles.syllablesBox}>
          <Text style={styles.syllablesTitle}>Ce qu'on apprend :</Text>
          <View style={styles.syllablesRow}>
            {level.items.slice(0, 6).map((item) => (
              <View key={item} style={[styles.syllablePill, { backgroundColor: level.color + '22' }]}>
                <Text style={[styles.syllableText, { color: level.color }]}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
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
    alignItems: 'flex-start',
    marginBottom: SPACING.xl,
  },
  greeting: { fontFamily: FONT.semiBold, fontSize: 16, color: COLORS.textLight },
  name: { fontFamily: FONT.extraBold, fontSize: 26, color: COLORS.text, marginTop: 2 },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    shadowColor: 'rgba(0,0,0,0.05)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  statEmoji: { fontSize: 22, marginBottom: 4 },
  statValue: { fontFamily: FONT.extraBold, fontSize: 15, color: COLORS.text, textAlign: 'center' },
  statLabel: { fontFamily: FONT.regular, fontSize: 11, color: COLORS.textLight, marginTop: 2, textAlign: 'center' },
  section: { marginBottom: SPACING.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  sectionTitle: { fontFamily: FONT.bold, fontSize: 17, color: COLORS.text },
  sectionSub: { fontFamily: FONT.semiBold, fontSize: 13, color: COLORS.textLight },
  levelProgressBox: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    shadowColor: 'rgba(0,0,0,0.05)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  levelIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelIcon: { fontSize: 28 },
  levelInfo: { flex: 1, gap: 6 },
  levelDesc: { fontFamily: FONT.semiBold, fontSize: 14, color: COLORS.text },
  levelSub: { fontFamily: FONT.regular, fontSize: 12, color: COLORS.textLight },
  syllablesBox: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    shadowColor: 'rgba(0,0,0,0.05)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  syllablesTitle: { fontFamily: FONT.bold, fontSize: 15, color: COLORS.text, marginBottom: SPACING.sm },
  syllablesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  syllablePill: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.full },
  syllableText: { fontFamily: FONT.extraBold, fontSize: 18 },
});
