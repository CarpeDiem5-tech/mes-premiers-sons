import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONT, SPACING, RADIUS } from '../utils/theme';
import ProgressBar from './ProgressBar';

interface Props {
  title: string;
  subtitle?: string;
  gameIndex: number;
  totalGames: number;
  levelColor: string;
  onBack?: () => void;
  children: React.ReactNode;
}

export default function GameLayout({ title, subtitle, gameIndex, totalGames, levelColor, onBack, children }: Props) {
  const progress = (gameIndex) / totalGames;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
            <Text style={styles.backIcon}>✕</Text>
          </TouchableOpacity>
        )}
        <View style={styles.headerCenter}>
          <Text style={styles.gameLabel}>Jeu {gameIndex} / {totalGames}</Text>
          <ProgressBar progress={progress} color={levelColor} height={8} />
        </View>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    gap: SPACING.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  backIcon: {
    fontSize: 16,
    color: COLORS.textLight,
    fontFamily: FONT.bold,
  },
  headerCenter: {
    flex: 1,
    gap: 6,
  },
  gameLabel: {
    fontFamily: FONT.semiBold,
    fontSize: 13,
    color: COLORS.textLight,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  title: {
    fontFamily: FONT.extraBold,
    fontSize: 26,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontFamily: FONT.regular,
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
});
