import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT } from '../utils/theme';

interface Props {
  count: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function StarCounter({ count, size = 'md' }: Props) {
  const fontSize = size === 'sm' ? 16 : size === 'md' ? 22 : 30;
  const textSize = size === 'sm' ? 14 : size === 'md' ? 18 : 24;

  return (
    <View style={styles.container}>
      <Text style={[styles.star, { fontSize }]}>⭐</Text>
      <Text style={[styles.count, { fontSize: textSize }]}>{count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  star: {},
  count: {
    fontFamily: FONT.extraBold,
    color: COLORS.text,
  },
});
