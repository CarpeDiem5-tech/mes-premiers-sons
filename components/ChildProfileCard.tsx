import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChildProfile } from '../types';
import { COLORS, FONT, SPACING, RADIUS } from '../utils/theme';

interface Props {
  profile: ChildProfile;
  isActive?: boolean;
  onPress: () => void;
  onLongPress?: () => void;
}

export default function ChildProfileCard({ profile, isActive, onPress, onLongPress }: Props) {
  return (
    <TouchableOpacity
      style={[styles.card, isActive && styles.cardActive]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.85}
    >
      <Text style={styles.avatar}>{profile.avatar}</Text>
      <Text style={styles.name}>{profile.name}</Text>
      <Text style={styles.age}>{profile.age} ans</Text>
      {isActive && <View style={styles.activeDot} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    width: 130,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 2,
    borderColor: 'transparent',
    marginHorizontal: SPACING.sm,
  },
  cardActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFF0F0',
  },
  avatar: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  name: {
    fontFamily: FONT.bold,
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
  },
  age: {
    fontFamily: FONT.regular,
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: 2,
  },
  activeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
    marginTop: SPACING.sm,
  },
});
