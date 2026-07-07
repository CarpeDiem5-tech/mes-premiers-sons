import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AVATARS } from '../data/avatars';
import { COLORS, FONT, SPACING, RADIUS } from '../utils/theme';

interface Props {
  selected: string;
  onSelect: (avatar: string) => void;
}

export default function AvatarPicker({ selected, onSelect }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {AVATARS.map((avatar) => (
          <TouchableOpacity
            key={avatar}
            style={[styles.item, selected === avatar && styles.itemSelected]}
            onPress={() => onSelect(avatar)}
            activeOpacity={0.8}
          >
            <Text style={styles.emoji}>{avatar}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  item: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  itemSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFF0F0',
  },
  emoji: {
    fontSize: 36,
  },
});
