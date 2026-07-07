import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Level } from '../types';
import { COLORS, FONT, SPACING, RADIUS } from '../utils/theme';

interface Props {
  level: Level;
  isUnlocked: boolean;
  isCurrent: boolean;
  starsEarned: number;
  onPress: () => void;
}

export default function LevelCard({ level, isUnlocked, isCurrent, starsEarned, onPress }: Props) {
  return (
    <TouchableOpacity
      style={[styles.card, { borderColor: level.color }, !isUnlocked && styles.locked]}
      onPress={isUnlocked ? onPress : undefined}
      activeOpacity={isUnlocked ? 0.85 : 1}
    >
      <View style={[styles.iconCircle, { backgroundColor: level.color + '22' }]}>
        <Text style={styles.icon}>{isUnlocked ? level.icon : '🔒'}</Text>
      </View>
      <View style={styles.info}>
        <Text style={[styles.title, !isUnlocked && styles.lockedText]}>
          Niveau {level.id} — {level.title}
        </Text>
        <Text style={[styles.desc, !isUnlocked && styles.lockedText]} numberOfLines={1}>
          {level.description}
        </Text>
        {isUnlocked && (
          <View style={styles.stars}>
            {[1, 2, 3].map((i) => (
              <Text key={i} style={[styles.star, i <= starsEarned && styles.starFilled]}>
                ★
              </Text>
            ))}
          </View>
        )}
      </View>
      {isCurrent && (
        <View style={[styles.currentBadge, { backgroundColor: level.color }]}>
          <Text style={styles.currentText}>En cours</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    marginBottom: SPACING.md,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  locked: {
    opacity: 0.45,
    borderColor: COLORS.border,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  icon: {
    fontSize: 28,
  },
  info: {
    flex: 1,
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: 15,
    color: COLORS.text,
    marginBottom: 2,
  },
  desc: {
    fontFamily: FONT.regular,
    fontSize: 13,
    color: COLORS.textLight,
  },
  lockedText: {
    color: COLORS.textLight,
  },
  stars: {
    flexDirection: 'row',
    marginTop: 4,
  },
  star: {
    fontSize: 16,
    color: COLORS.border,
    marginRight: 2,
  },
  starFilled: {
    color: COLORS.star,
  },
  currentBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    marginLeft: SPACING.sm,
  },
  currentText: {
    fontFamily: FONT.bold,
    fontSize: 11,
    color: COLORS.textWhite,
  },
});
