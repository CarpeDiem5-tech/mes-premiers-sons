import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { COLORS, FONT, SPACING, RADIUS } from '../../utils/theme';
import AvatarPicker from '../../components/AvatarPicker';
import { createProfile } from '../../storage/profiles';
import { ChildProfile } from '../../types';

const AGES = [3, 4, 5, 6];

export default function CreateProfileScreen() {
  const [name, setName] = useState('');
  const [age, setAge] = useState(4);
  const [avatar, setAvatar] = useState('🐝');
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Entre le prénom !');
      return;
    }
    setIsCreating(true);
    const profile: ChildProfile = {
      id: Date.now().toString(),
      name: name.trim(),
      age,
      avatar,
      createdAt: new Date().toISOString(),
    };
    try {
      await createProfile(profile);
      router.replace('/(main)/home');
    } catch {
      setError("Impossible de créer le profil. Réessaie dans un instant.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.emoji}>✨</Text>
          <Text style={styles.title}>Crée ton profil !</Text>
          <Text style={styles.subtitle}>Qui apprend aujourd'hui ?</Text>

          <View style={styles.section}>
            <Text style={styles.label}>Choisis ton avatar</Text>
            <AvatarPicker selected={avatar} onSelect={setAvatar} />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Ton prénom</Text>
            <TextInput
              style={[styles.input, error ? styles.inputError : null]}
              placeholder="Ex : Léa"
              placeholderTextColor={COLORS.textLight}
              value={name}
              onChangeText={(t) => { setName(t); setError(''); }}
              maxLength={20}
              autoCapitalize="words"
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Ton âge</Text>
            <View style={styles.ageRow}>
              {AGES.map((a) => (
                <TouchableOpacity
                  key={a}
                  style={[styles.ageBtn, age === a && styles.ageBtnActive]}
                  onPress={() => setAge(a)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.ageText, age === a && styles.ageTextActive]}>{a} ans</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.createBtn, isCreating && styles.createBtnDisabled]}
            onPress={handleCreate}
            activeOpacity={0.88}
            disabled={isCreating}
          >
            <Text style={styles.createText}>{isCreating ? 'Création...' : "C'est parti ! 🚀"}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: SPACING.lg, alignItems: 'center', paddingBottom: SPACING.xxl },
  emoji: { fontSize: 56, marginTop: SPACING.lg, marginBottom: SPACING.sm },
  title: { fontFamily: FONT.extraBold, fontSize: 30, color: COLORS.text, textAlign: 'center' },
  subtitle: { fontFamily: FONT.regular, fontSize: 17, color: COLORS.textLight, marginBottom: SPACING.xl, textAlign: 'center' },
  section: { width: '100%', marginBottom: SPACING.xl },
  label: { fontFamily: FONT.bold, fontSize: 16, color: COLORS.text, marginBottom: SPACING.md },
  input: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    fontFamily: FONT.semiBold,
    fontSize: 18,
    color: COLORS.text,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  inputError: { borderColor: COLORS.error },
  error: { fontFamily: FONT.semiBold, fontSize: 13, color: COLORS.error, marginTop: 4 },
  ageRow: { flexDirection: 'row', gap: SPACING.sm },
  ageBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  ageBtnActive: { borderColor: COLORS.primary, backgroundColor: '#FFF0F0' },
  ageText: { fontFamily: FONT.bold, fontSize: 16, color: COLORS.textLight },
  ageTextActive: { color: COLORS.primary },
  createBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xxl,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
    marginTop: SPACING.md,
  },
  createBtnDisabled: { opacity: 0.7 },
  createText: { fontFamily: FONT.extraBold, fontSize: 20, color: COLORS.textWhite },
});
