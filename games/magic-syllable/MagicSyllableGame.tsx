import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AudioInstruction from '../../components/AudioInstruction';
import EncouragementBanner, { EncouragementBannerVariant } from '../../components/EncouragementBanner';
import SyllableCard from '../../components/SyllableCard';
import { MAX_SYLLABLE_STAGE } from '../../data/syllableCurriculum';
import { EncouragementService } from '../../services/EncouragementService';
import AudioService from '../../services/AudioService';
import { COLORS, FONT, RADIUS, SPACING } from '../../utils/theme';
import { generateMagicSyllableSession } from '../../utils/generateMagicSyllableSession';
import { GameScreenProps, GameSessionResult } from '../../types';

type BannerState = { message: string | null; variant: EncouragementBannerVariant };

const toSyllableId = (syllable: string) => `syllable:${syllable.toLowerCase()}`;

export default function MagicSyllableGame({ profile, progress, onComplete, onExit }: GameScreenProps) {
  const session = useMemo(() => generateMagicSyllableSession(progress.stage), [progress.stage, progress.totalSessions]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [banner, setBanner] = useState<BannerState>({ message: null, variant: 'success' });
  const [exitHintVisible, setExitHintVisible] = useState(false);
  const startedAt = useRef(Date.now());
  const attemptsForQuestion = useRef(0);
  const totalAttempts = useRef(0);
  const firstTryCorrect = useRef(0);
  const practicedItemIds = useRef<Set<string>>(new Set());
  const masteredItemIds = useRef<Set<string>>(new Set());
  const selectedSyllables = useRef<string[]>([]);

  const question = session.questions[questionIndex];
  const isLastQuestion = questionIndex === session.questions.length - 1;

  useEffect(() => {
    attemptsForQuestion.current = 0;
    setSelected(null);
    setLocked(false);
    practicedItemIds.current.add(toSyllableId(question.target));
  }, [question.id, question.target]);

  const playTarget = () => {
    AudioService.stopCurrent();
    AudioService.playInstruction(`Trouve ${question.target}.`);
  };

  const handleProtectedExit = () => {
    if (!exitHintVisible) {
      setExitHintVisible(true);
      setTimeout(() => setExitHintVisible(false), 2400);
      return;
    }
    onExit();
  };

  const finishSession = () => {
    const firstTryRate = firstTryCorrect.current / session.questions.length;
    const starsEarned = firstTryRate >= 0.8 ? 3 : firstTryRate >= 0.6 ? 2 : 1;
    const successfulNow = firstTryRate >= 0.8;
    // Stage rule for magic_syllable: two successful sessions at the current hidden stage are required.
    // A successful session means at least 80% of questions are solved on the first try.
    // The next stage is capped and storage persists it only if it is higher; it never regresses.
    const reachedStage = successfulNow && progress.successfulSessionsAtCurrentStage + 1 >= 2
      ? Math.min(session.stage + 1, MAX_SYLLABLE_STAGE)
      : session.stage;

    const result: GameSessionResult = {
      gameId: 'magic_syllable',
      stage: reachedStage,
      correctAnswers: firstTryCorrect.current,
      totalAttempts: totalAttempts.current,
      starsEarned,
      durationSeconds: Math.max(1, Math.round((Date.now() - startedAt.current) / 1000)),
      practicedItemIds: Array.from(practicedItemIds.current),
      masteredItemIds: Array.from(masteredItemIds.current),
      completed: true,
      completedAt: new Date().toISOString(),
    };

    onComplete(result);
  };

  const goNext = () => {
    if (isLastQuestion) {
      finishSession();
      return;
    }
    setQuestionIndex((value) => value + 1);
  };

  const handleSelect = (syllable: string) => {
    if (locked) return;

    setLocked(true);
    setSelected(syllable);
    attemptsForQuestion.current += 1;
    totalAttempts.current += 1;
    selectedSyllables.current.push(syllable);
    AudioService.stopCurrent();
    AudioService.playSyllable(syllable.toLowerCase());

    if (syllable === question.target) {
      const message = EncouragementService.getRandomSuccess(profile.name);
      if (attemptsForQuestion.current === 1) {
        firstTryCorrect.current += 1;
        masteredItemIds.current.add(toSyllableId(question.target));
      }
      setBanner({ message, variant: 'success' });
      setTimeout(() => AudioService.playFeedback(message), 420);
      setTimeout(goNext, 1100);
      return;
    }

    setBanner({ message: 'Écoute encore.', variant: 'retry' });
    setTimeout(() => AudioService.playFeedback('Écoute encore.'), 360);
    setTimeout(playTarget, 1050);
    setTimeout(() => {
      setSelected(null);
      setLocked(false);
    }, 1250);
  };

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.exitButton} onPress={handleProtectedExit} activeOpacity={0.74}>
          <Text style={styles.exitButtonText}>←</Text>
        </TouchableOpacity>
        {exitHintVisible ? <Text style={styles.exitHint}>Encore une touche pour quitter</Text> : <Text style={styles.gameTitle}>Syllabe magique</Text>}
      </View>

      <View style={styles.listenBox}>
        <Text style={styles.listenEmoji}>👂</Text>
        <Text style={styles.listenText}>Écoute bien</Text>
        <AudioInstruction key={question.id} text={`Trouve ${question.target}.`} showText={false} />
      </View>

      <EncouragementBanner message={banner.message} variant={banner.variant} onHide={() => setBanner({ message: null, variant: 'success' })} />

      <View style={styles.cards}>
        {question.choices.map((choice) => (
          <SyllableCard
            key={choice}
            text={choice}
            size="md"
            color={COLORS.primary}
            onPress={() => handleSelect(choice)}
            isCorrect={selected === choice && choice === question.target}
            isWrong={selected === choice && choice !== question.target}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.md,
  },
  topBar: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  exitButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  exitButtonText: { fontFamily: FONT.extraBold, fontSize: 22, color: COLORS.textLight },
  exitHint: { flex: 1, fontFamily: FONT.bold, fontSize: 14, color: COLORS.textLight },
  gameTitle: { flex: 1, fontFamily: FONT.extraBold, fontSize: 18, color: COLORS.text, textAlign: 'center', marginRight: 42 },
  listenBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: SPACING.sm,
  },
  listenEmoji: { fontSize: 42, marginBottom: SPACING.xs },
  listenText: {
    fontFamily: FONT.extraBold,
    fontSize: 24,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  cards: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: SPACING.md,
  },
});
