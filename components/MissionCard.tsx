import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONT, SPACING, RADIUS } from '../utils/theme';

interface Props {
  onPress: () => void;
  estimatedMinutes?: number;
  levelTitle: string;
  levelIcon: string;
}

export default function MissionCard({ onPress, estimatedMinutes = 5, levelTitle, levelIcon }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.88}>
      <View style={styles.header}>
        <Text style={styles.icon}>{levelIcon}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{estimatedMinutes} min</Text>
        </View>
      </View>
      <Text style={styles.label}>Mission du jour</Text>
      <Text style={styles.title}>{levelTitle}</Text>
      <View style={styles.startBtn}>
        <Text style={styles.startText}>Commencer !</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  icon: {
    fontSize: 36,
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  badgeText: {
    fontFamily: FONT.bold,
    fontSize: 13,
    color: COLORS.textWhite,
  },
  label: {
    fontFamily: FONT.semiBold,
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 4,
  },
  title: {
    fontFamily: FONT.extraBold,
    fontSize: 22,
    color: COLORS.textWhite,
    marginBottom: SPACING.lg,
  },
  startBtn: {
    backgroundColor: COLORS.textWhite,
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  startText: {
    fontFamily: FONT.extraBold,
    fontSize: 18,
    color: COLORS.primary,
  },
});
