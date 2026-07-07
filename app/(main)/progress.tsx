import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { COLORS, FONT, SPACING, RADIUS } from '../../utils/theme';
import LevelCard from '../../components/LevelCard';
import StarCounter from '../../components/StarCounter';
import ProgressBar from '../../components/ProgressBar';
import { getActiveProfileId } from '../../storage/profiles';
import { getProgress } from '../../storage/progress';
import { LEVELS, TOTAL_LEVELS } from '../../data/levels';
import { ChildProgress } from '../../types';

export default function ProgressScreen() {
  const [progress, setProgress] = useState<ChildProgress | null>(null);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const id = await getActiveProfileId();
        if (!id) return;
        const prog = await getProgress(id);
        setProgress(prog);
      })();
    }, [])
  );

  if (!progress) return null;

  const overallProgress = (progress.currentLevel - 1) / TOTAL_LEVELS;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Ma progression</Text>
          <StarCounter count={progress.totalStars} size="md" />
        </View>

        <View style={styles.overallCard}>
          <Text style={styles.overallLabel}>Avancement global</Text>
          <ProgressBar progress={overallProgress} color={COLORS.primary} height={14} />
          <Text style={styles.overallSub}>
            Niveau {progress.currentLevel} sur {TOTAL_LEVELS}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Tous les niveaux</Text>

        {LEVELS.map((level) => {
          const isUnlocked = level.id <= progress.currentLevel;
          const isCurrent = level.id === progress.currentLevel;
          const missions = progress.completedMissionIds.filter((id) =>
            id.startsWith(`${level.id}-`)
          ).length;
          const stars = Math.min(missions, 3);
          return (
            <LevelCard
              key={level.id}
              level={level}
              isUnlocked={isUnlocked}
              isCurrent={isCurrent}
              starsEarned={stars}
              onPress={() => {}}
            />
          );
        })}
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
    marginBottom: SPACING.xl,
  },
  title: { fontFamily: FONT.extraBold, fontSize: 26, color: COLORS.text },
  overallCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    gap: SPACING.sm,
    shadowColor: 'rgba(0,0,0,0.05)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  overallLabel: { fontFamily: FONT.bold, fontSize: 16, color: COLORS.text },
  overallSub: { fontFamily: FONT.regular, fontSize: 14, color: COLORS.textLight },
  sectionTitle: {
    fontFamily: FONT.bold,
    fontSize: 17,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
});
