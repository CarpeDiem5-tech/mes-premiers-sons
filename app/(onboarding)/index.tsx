import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { COLORS, FONT, SPACING, RADIUS } from '../../utils/theme';

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.bigIcon}>🎶</Text>
        <Text style={styles.appName}>Mes Premiers Sons</Text>
        <Text style={styles.tagline}>Apprends à lire en t'amusant !</Text>

        <View style={styles.features}>
          {[
            { icon: '⭐', text: 'Séances de 5 minutes' },
            { icon: '🏆', text: 'Progression personnalisée' },
            { icon: '🎮', text: 'Jeux amusants' },
          ].map((f) => (
            <View key={f.text} style={styles.featureRow}>
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <Text style={styles.featureText}>{f.text}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.startBtn}
          onPress={() => router.push('/(onboarding)/create-profile')}
          activeOpacity={0.88}
        >
          <Text style={styles.startText}>Commencer !</Text>
        </TouchableOpacity>

        <Text style={styles.note}>Aucune publicité · Aucun achat · 100% fun</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  bigIcon: { fontSize: 80, marginBottom: SPACING.md },
  appName: {
    fontFamily: FONT.extraBold,
    fontSize: 32,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  tagline: {
    fontFamily: FONT.semiBold,
    fontSize: 17,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: SPACING.xxl,
  },
  features: { width: '100%', marginBottom: SPACING.xxl, gap: SPACING.md },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    gap: SPACING.md,
    shadowColor: 'rgba(0,0,0,0.05)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  featureIcon: { fontSize: 24 },
  featureText: { fontFamily: FONT.semiBold, fontSize: 16, color: COLORS.text, flex: 1 },
  startBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xxl,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: SPACING.lg,
  },
  startText: { fontFamily: FONT.extraBold, fontSize: 20, color: COLORS.textWhite },
  note: { fontFamily: FONT.regular, fontSize: 13, color: COLORS.textLight, textAlign: 'center' },
});
