import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GameDefinition } from '../data/gameCatalog';
import { GameProgress } from '../types';
import { COLORS, FONT, RADIUS, SPACING } from '../utils/theme';
import ProgressBar from './ProgressBar';

interface GameCatalogCardProps {
  game: GameDefinition;
  progress?: GameProgress;
  onPress: () => void;
}

export default function GameCatalogCard({ game, progress, onPress }: GameCatalogCardProps) {
  const isComingSoon = game.availability === 'coming_soon';
  const hasPlayed = (progress?.totalSessions ?? 0) > 0;
  const progressRatio = Math.min((progress?.completedSessions ?? 0) / 5, 1);

  return (
    <TouchableOpacity
      style={[styles.card, isComingSoon && styles.cardComingSoon]}
      onPress={onPress}
      activeOpacity={0.86}
      accessibilityRole="button"
      accessibilityLabel={isComingSoon ? `${game.title}, bientôt disponible` : `Jouer à ${game.title}`}
    >
      <View style={[styles.iconCircle, { backgroundColor: `${game.color}22` }]}>
        <Text style={styles.icon}>{game.icon}</Text>
      </View>

      {isComingSoon && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Bientôt</Text>
        </View>
      )}

      <Text style={styles.title} numberOfLines={2}>{game.title}</Text>
      <Text style={styles.description} numberOfLines={2}>{game.shortDescription}</Text>

      <View style={styles.footer}>
        <View style={[styles.minutePill, { backgroundColor: `${game.color}18` }]}>
          <Text style={[styles.minuteText, { color: game.color }]}>{game.estimatedMinutes} min</Text>
        </View>
        <Text style={styles.progressText}>{hasPlayed ? `${progress?.totalSessions} parties` : 'Nouveau'}</Text>
      </View>

      {hasPlayed && <ProgressBar progress={progressRatio} color={game.color} height={7} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexGrow: 1,
    flexBasis: 156,
    minHeight: 230,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    gap: SPACING.sm,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 3,
  },
  cardComingSoon: {
    opacity: 0.72,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  icon: {
    fontSize: 34,
  },
  badge: {
    position: 'absolute',
    right: SPACING.md,
    top: SPACING.md,
    backgroundColor: COLORS.warning,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
  },
  badgeText: {
    fontFamily: FONT.extraBold,
    fontSize: 11,
    color: COLORS.text,
  },
  title: {
    fontFamily: FONT.extraBold,
    fontSize: 17,
    color: COLORS.text,
    textAlign: 'center',
    minHeight: 44,
  },
  description: {
    fontFamily: FONT.semiBold,
    fontSize: 13,
    lineHeight: 17,
    color: COLORS.textLight,
    textAlign: 'center',
    minHeight: 36,
  },
  footer: {
    marginTop: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  minutePill: {
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 5,
  },
  minuteText: {
    fontFamily: FONT.extraBold,
    fontSize: 12,
  },
  progressText: {
    flex: 1,
    fontFamily: FONT.bold,
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: 'right',
  },
});
