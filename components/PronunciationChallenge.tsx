import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import SpeechService from '../services/SpeechService';
import { COLORS, FONT, RADIUS, SPACING } from '../utils/theme';

type ChallengeStatus = 'idle' | 'listening' | 'recording' | 'success' | 'retry';

interface Props {
  expectedText: string;
  childName?: string;
  levelColor?: string;
  onSuccess: () => void;
  onRetry?: () => void;
}

const SUCCESS_MESSAGES = ['Bravo {name} !', 'Excellent {name} !', 'Fantastique {name} !'];

export default function PronunciationChallenge({
  expectedText,
  childName = 'Emma',
  levelColor = COLORS.primary,
  onSuccess,
  onRetry,
}: Props) {
  const [status, setStatus] = useState<ChallengeStatus>('idle');
  const [message, setMessage] = useState('Appuie sur 🔊 puis répète avec moi.');
  const speakerScale = useRef(new Animated.Value(1)).current;
  const micScale = useRef(new Animated.Value(1)).current;
  const successScale = useRef(new Animated.Value(0)).current;

  useEffect(() => () => {
    SpeechService.stopListening();
  }, []);

  useEffect(() => {
    if (status === 'listening') {
      Animated.sequence([
        Animated.timing(speakerScale, { toValue: 1.16, duration: 220, useNativeDriver: true }),
        Animated.timing(speakerScale, { toValue: 1, duration: 220, useNativeDriver: true }),
      ]).start();
    }
  }, [speakerScale, status]);

  useEffect(() => {
    if (status !== 'recording') return;
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(micScale, { toValue: 1.18, duration: 520, useNativeDriver: true }),
      Animated.timing(micScale, { toValue: 1, duration: 520, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [micScale, status]);

  const listen = () => {
    setStatus('listening');
    setMessage('Écoute bien le son.');
    SpeechService.playSyllable(expectedText);
    setTimeout(() => setStatus((current) => (current === 'listening' ? 'idle' : current)), 900);
  };

  const repeat = async () => {
    setStatus('recording');
    setMessage('🎤 Je t’écoute...');
    await SpeechService.startListening();
    const result = await SpeechService.recognizeSpeech(expectedText);
    await SpeechService.stopListening();

    if (result?.transcript && SpeechService.isCloseEnough(expectedText, result.transcript)) {
      const template = SUCCESS_MESSAGES[Math.floor(Math.random() * SUCCESS_MESSAGES.length)];
      const encouragement = template.replace('{name}', childName);
      setStatus('success');
      setMessage(encouragement);
      successScale.setValue(0);
      Animated.spring(successScale, { toValue: 1, friction: 5, useNativeDriver: true }).start();
      setTimeout(onSuccess, 1200);
      return;
    }

    setStatus('retry');
    setMessage('Je te redis le son. Essaie encore.');
    onRetry?.();
    SpeechService.playSyllable(expectedText);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.card, { borderColor: levelColor }]}>
        <Text style={[styles.cardText, { color: levelColor }]}>{expectedText.toUpperCase()}</Text>
      </View>

      {status === 'success' && (
        <Animated.View style={[styles.successBurst, { transform: [{ scale: successScale }] }]}>
          <Text style={styles.confetti}>✨ ⭐ 🎉</Text>
        </Animated.View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity style={[styles.btn, styles.listenBtn]} onPress={listen} activeOpacity={0.82}>
          <Animated.Text style={[styles.btnIcon, { transform: [{ scale: speakerScale }] }]}>🔊</Animated.Text>
          <Text style={[styles.btnText, { color: levelColor }]}>Écouter</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.btn, { backgroundColor: levelColor, borderColor: levelColor }]} onPress={repeat} activeOpacity={0.82}>
          <Animated.Text style={[styles.btnIcon, { transform: [{ scale: micScale }] }]}>🎤</Animated.Text>
          <Text style={[styles.btnText, { color: COLORS.textWhite }]}>Répéter</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.message, status === 'success' && { color: levelColor }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', paddingTop: SPACING.md },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    width: 220,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 6,
    marginBottom: SPACING.xl,
  },
  cardText: { fontFamily: FONT.extraBold, fontSize: 64, textAlign: 'center' },
  successBurst: { marginTop: -SPACING.lg, marginBottom: SPACING.md },
  confetti: { fontSize: 32 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: SPACING.md },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
    gap: SPACING.sm,
    borderWidth: 2,
  },
  listenBtn: { backgroundColor: COLORS.card, borderColor: COLORS.border },
  btnIcon: { fontSize: 22 },
  btnText: { fontFamily: FONT.bold, fontSize: 16 },
  message: { fontFamily: FONT.bold, fontSize: 16, color: COLORS.textLight, marginTop: SPACING.lg, textAlign: 'center' },
});
