import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AudioInstruction from '../../components/AudioInstruction';
import EncouragementBanner, { EncouragementBannerVariant } from '../../components/EncouragementBanner';
import LetterCard from '../../components/LetterCard';
import LetterFamilyHouse from '../../components/LetterFamilyHouse';
import { letters, LetterFamily } from '../../data/letters';
import { EncouragementService } from '../../services/EncouragementService';
import AudioService from '../../services/AudioService';
import { COLORS, FONT, RADIUS, SPACING } from '../../utils/theme';
import { GameScreenProps, GameSessionResult, LetterItem } from '../../types';

type Phase = 'intro' | 'sort' | 'find_vowel' | 'find_consonant' | 'summary';

type QuestionStats = {
  correctAnswers: number;
  totalAttempts: number;
  practicedItemIds: Set<string>;
  masteredItemIds: Set<string>;
};

const INTRO_NARRATION = 'Regarde les deux maisons. Ici habitent les voyelles. Et ici habitent les consonnes. On joue !';
const MAX_STAGE = 4;

const toItemId = (letter: LetterItem) => `letter:${letter.id}`;

function pickByIds(ids: string[]): LetterItem[] {
  return ids
    .map((id) => letters.find((letter) => letter.id === id))
    .filter((letter): letter is LetterItem => Boolean(letter));
}

function getStageLetters(stage: number): { stage: number; vowels: LetterItem[]; consonants: LetterItem[] } {
  const safeStage = Math.max(1, Math.min(MAX_STAGE, stage));
  const stageVowels = safeStage >= 4 ? pickByIds(['a', 'e', 'i', 'o', 'u', 'y']) : pickByIds(['a', 'e', 'i', 'o', 'u']);
  const consonantIds = safeStage === 1
    ? ['m', 'l', 'p', 's']
    : safeStage === 2
    ? ['m', 'l', 'p', 's', 'b', 'd', 'f', 'n', 'r', 't']
    : ['m', 'l', 'p', 's', 'b', 'd', 'f', 'n', 'r', 't', 'c', 'g', 'j', 'v', 'z'];

  return {
    stage: safeStage,
    vowels: stageVowels,
    consonants: pickByIds(consonantIds),
  };
}

function rotatePick<T>(items: T[], count: number, offset: number): T[] {
  return Array.from({ length: count }, (_, index) => items[(offset + index) % items.length]);
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export default function AlphabetHousesGame({ profile, progress, onComplete, onExit }: GameScreenProps) {
  const stageLetters = useMemo(() => getStageLetters(progress.stage), [progress.stage]);
  const sessionOffset = progress.totalSessions % 4;
  const sortQuestions = useMemo(() => {
    const count = stageLetters.stage >= 2 ? 4 : 3;
    return shuffle([
      ...rotatePick(stageLetters.vowels, Math.ceil(count / 2), sessionOffset),
      ...rotatePick(stageLetters.consonants, Math.floor(count / 2), sessionOffset),
    ]).slice(0, count);
  }, [sessionOffset, stageLetters]);
  const vowelChoices = useMemo(() => shuffle([
    rotatePick(stageLetters.vowels, 1, sessionOffset)[0],
    ...rotatePick(stageLetters.consonants, 2, sessionOffset + 1),
  ]), [sessionOffset, stageLetters]);
  const consonantChoices = useMemo(() => shuffle([
    ...rotatePick(stageLetters.vowels, 2, sessionOffset + 2),
    rotatePick(stageLetters.consonants, 1, sessionOffset + 3)[0],
  ]), [sessionOffset, stageLetters]);

  const [phase, setPhase] = useState<Phase>('intro');
  const [sortIndex, setSortIndex] = useState(0);
  const [selectedFamily, setSelectedFamily] = useState<LetterFamily | null>(null);
  const [selectedLetterId, setSelectedLetterId] = useState<string | null>(null);
  const [hintedFamily, setHintedFamily] = useState<LetterFamily | null>(null);
  const [introHint, setIntroHint] = useState<LetterFamily | null>(null);
  const [banner, setBanner] = useState<{ message: string | null; variant: EncouragementBannerVariant }>({ message: null, variant: 'success' });
  const [exitHintVisible, setExitHintVisible] = useState(false);
  const stats = useRef<QuestionStats>({ correctAnswers: 0, totalAttempts: 0, practicedItemIds: new Set(), masteredItemIds: new Set() });
  const currentQuestionMistakes = useRef(0);
  const startedAt = useRef(Date.now());
  const introTimers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  const currentSortLetter = sortQuestions[sortIndex];

  const addPracticed = useCallback((items: LetterItem[]) => {
    items.forEach((item) => stats.current.practicedItemIds.add(toItemId(item)));
  }, []);

  const showBanner = useCallback((message: string, variant: EncouragementBannerVariant) => {
    setBanner({ message, variant });
  }, []);

  const playIntro = useCallback(() => {
    introTimers.current.forEach(clearTimeout);
    introTimers.current = [];
    setIntroHint(null);
    AudioService.stopCurrent();
    AudioService.playInstruction(INTRO_NARRATION);
    introTimers.current.push(setTimeout(() => setIntroHint('vowel'), 1900));
    introTimers.current.push(setTimeout(() => setIntroHint(null), 3300));
    introTimers.current.push(setTimeout(() => setIntroHint('consonant'), 4200));
    introTimers.current.push(setTimeout(() => setIntroHint(null), 5900));
  }, []);

  useEffect(() => {
    playIntro();
    return () => {
      introTimers.current.forEach(clearTimeout);
      AudioService.stopCurrent();
    };
  }, [playIntro]);

  useEffect(() => {
    if (phase === 'sort' && currentSortLetter) {
      addPracticed([currentSortLetter]);
      setSelectedFamily(null);
      setHintedFamily(null);
      currentQuestionMistakes.current = 0;
    }
  }, [addPracticed, currentSortLetter, phase]);

  useEffect(() => {
    if (phase === 'find_vowel') {
      addPracticed(vowelChoices);
      setSelectedLetterId(null);
      currentQuestionMistakes.current = 0;
    }
  }, [addPracticed, phase, vowelChoices]);

  useEffect(() => {
    if (phase === 'find_consonant') {
      addPracticed(consonantChoices);
      setSelectedLetterId(null);
      currentQuestionMistakes.current = 0;
    }
  }, [addPracticed, consonantChoices, phase]);

  const handleProtectedExit = () => {
    if (!exitHintVisible) {
      setExitHintVisible(true);
      setTimeout(() => setExitHintVisible(false), 2400);
      return;
    }
    onExit();
  };

  const recordCorrect = (letter?: LetterItem) => {
    stats.current.correctAnswers += 1;
    if (letter && currentQuestionMistakes.current === 0) {
      stats.current.masteredItemIds.add(toItemId(letter));
    }
    showBanner(EncouragementService.getRandomSuccess(profile.name), 'success');
  };

  const recordRetry = (hintFamily?: LetterFamily) => {
    currentQuestionMistakes.current += 1;
    showBanner(EncouragementService.getRandomRetry(), 'retry');
    if (hintFamily) {
      setHintedFamily(hintFamily);
      setTimeout(() => setHintedFamily(null), 900);
    }
  };

  const finishSession = () => {
    const { correctAnswers, totalAttempts, practicedItemIds, masteredItemIds } = stats.current;
    const accuracy = totalAttempts === 0 ? 0 : correctAnswers / totalAttempts;
    const starsEarned = accuracy >= 0.8 ? 3 : accuracy >= 0.6 ? 2 : 1;
    // Stage rule: a completed session with at least 80% accuracy proposes the next internal stage.
    // The value is capped and never goes backwards; storage persists it only when it is higher.
    const reachedStage = accuracy >= 0.8 ? Math.min(stageLetters.stage + 1, MAX_STAGE) : stageLetters.stage;
    const result: GameSessionResult = {
      gameId: 'alphabet_houses',
      stage: reachedStage,
      correctAnswers,
      totalAttempts,
      starsEarned,
      durationSeconds: Math.max(1, Math.round((Date.now() - startedAt.current) / 1000)),
      practicedItemIds: Array.from(practicedItemIds),
      masteredItemIds: Array.from(masteredItemIds),
      completed: true,
      completedAt: new Date().toISOString(),
    };
    onComplete(result);
  };

  const handleSortFamily = (family: LetterFamily) => {
    if (!currentSortLetter || selectedFamily) return;
    stats.current.totalAttempts += 1;
    setSelectedFamily(family);
    AudioService.playSyllable(currentSortLetter.text.toLowerCase());

    if (family === currentSortLetter.type) {
      recordCorrect(currentSortLetter);
      setTimeout(() => {
        if (sortIndex < sortQuestions.length - 1) {
          setSortIndex((value) => value + 1);
        } else {
          setPhase('find_vowel');
        }
      }, 900);
      return;
    }

    recordRetry(currentSortLetter.type);
    setTimeout(() => setSelectedFamily(null), 850);
  };

  const handleFindLetter = (letter: LetterItem, targetFamily: LetterFamily, nextPhase: Phase) => {
    if (selectedLetterId) return;
    stats.current.totalAttempts += 1;
    setSelectedLetterId(letter.id);
    AudioService.playSyllable(letter.text.toLowerCase());

    if (letter.type === targetFamily) {
      recordCorrect(letter);
      setTimeout(() => setPhase(nextPhase), 900);
      return;
    }

    recordRetry(targetFamily);
    setTimeout(() => setSelectedLetterId(null), 850);
  };

  if (phase === 'intro') {
    return (
      <View style={styles.screen}>
        <TopBar onExit={handleProtectedExit} exitHintVisible={exitHintVisible} />
        <View style={styles.housesRow}>
          <LetterFamilyHouse family="vowel" isHinted={introHint === 'vowel'} showLetters={false} compact />
          <LetterFamilyHouse family="consonant" isHinted={introHint === 'consonant'} showLetters={false} compact />
        </View>
        <View style={styles.introActions}>
          <TouchableOpacity style={styles.replayButton} onPress={playIntro} activeOpacity={0.78}>
            <Text style={styles.replayText}>🔊 Réécouter</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryButton} onPress={() => setPhase('sort')} activeOpacity={0.86}>
            <Text style={styles.primaryButtonText}>On joue !</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (phase === 'sort' && currentSortLetter) {
    const instruction = `Où habite le ${currentSortLetter.text} ?`;
    return (
      <View style={styles.screen}>
        <TopBar onExit={handleProtectedExit} exitHintVisible={exitHintVisible} />
        <AudioInstruction key={instruction} text={instruction} />
        <LetterCard letter={currentSortLetter} size="md" />
        <EncouragementBanner message={banner.message} variant={banner.variant} onHide={() => setBanner({ message: null, variant: 'success' })} />
        <View style={styles.housesRowInteractive}>
          <LetterFamilyHouse
            family="vowel"
            onPress={() => handleSortFamily('vowel')}
            isSelected={selectedFamily === 'vowel'}
            isCorrect={selectedFamily === 'vowel' && currentSortLetter.type === 'vowel'}
            isWrong={selectedFamily === 'vowel' && currentSortLetter.type !== 'vowel'}
            isHinted={hintedFamily === 'vowel'}
            showLetters={false}
            compact
          />
          <LetterFamilyHouse
            family="consonant"
            onPress={() => handleSortFamily('consonant')}
            isSelected={selectedFamily === 'consonant'}
            isCorrect={selectedFamily === 'consonant' && currentSortLetter.type === 'consonant'}
            isWrong={selectedFamily === 'consonant' && currentSortLetter.type !== 'consonant'}
            isHinted={hintedFamily === 'consonant'}
            showLetters={false}
            compact
          />
        </View>
      </View>
    );
  }

  if (phase === 'find_vowel') {
    return (
      <FindFamilyActivity
        title="Trouve la voyelle"
        instruction="Trouve la voyelle."
        choices={vowelChoices}
        targetFamily="vowel"
        selectedLetterId={selectedLetterId}
        banner={banner}
        onExit={handleProtectedExit}
        exitHintVisible={exitHintVisible}
        onSelect={(letter) => handleFindLetter(letter, 'vowel', 'find_consonant')}
        onHideBanner={() => setBanner({ message: null, variant: 'success' })}
      />
    );
  }

  if (phase === 'find_consonant') {
    return (
      <FindFamilyActivity
        title="Trouve la consonne"
        instruction="Trouve la consonne."
        choices={consonantChoices}
        targetFamily="consonant"
        selectedLetterId={selectedLetterId}
        banner={banner}
        onExit={handleProtectedExit}
        exitHintVisible={exitHintVisible}
        onSelect={(letter) => handleFindLetter(letter, 'consonant', 'summary')}
        onHideBanner={() => setBanner({ message: null, variant: 'success' })}
      />
    );
  }

  return (
    <View style={styles.screen}>
      <TopBar onExit={handleProtectedExit} exitHintVisible={exitHintVisible} />
      <View style={styles.summaryBox}>
        <Text style={styles.summaryEmoji}>🎉</Text>
        <Text style={styles.summaryTitle}>{EncouragementService.getRandomMissionCompleted(profile.name)}</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={finishSession} activeOpacity={0.86}>
          <Text style={styles.primaryButtonText}>Voir mes étoiles</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function TopBar({ onExit, exitHintVisible }: { onExit: () => void; exitHintVisible: boolean }) {
  return (
    <View style={styles.topBar}>
      <TouchableOpacity style={styles.exitButton} onPress={onExit} activeOpacity={0.74}>
        <Text style={styles.exitButtonText}>←</Text>
      </TouchableOpacity>
      {exitHintVisible ? <Text style={styles.exitHint}>Encore une touche pour quitter</Text> : <Text style={styles.gameTitle}>Maisons</Text>}
    </View>
  );
}

function FindFamilyActivity({
  title,
  instruction,
  choices,
  targetFamily,
  selectedLetterId,
  banner,
  onSelect,
  onExit,
  exitHintVisible,
  onHideBanner,
}: {
  title: string;
  instruction: string;
  choices: LetterItem[];
  targetFamily: LetterFamily;
  selectedLetterId: string | null;
  banner: { message: string | null; variant: EncouragementBannerVariant };
  onSelect: (letter: LetterItem) => void;
  onExit: () => void;
  exitHintVisible: boolean;
  onHideBanner: () => void;
}) {
  return (
    <View style={styles.screen}>
      <TopBar onExit={onExit} exitHintVisible={exitHintVisible} />
      <AudioInstruction key={instruction} text={instruction} />
      <Text style={styles.activityTitle}>{title}</Text>
      <EncouragementBanner message={banner.message} variant={banner.variant} onHide={onHideBanner} />
      <View style={styles.letterChoices}>
        {choices.map((letter) => (
          <LetterCard
            key={letter.id}
            letter={letter}
            size="md"
            onPress={() => onSelect(letter)}
            isCorrect={selectedLetterId === letter.id && letter.type === targetFamily}
            isWrong={selectedLetterId === letter.id && letter.type !== targetFamily}
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
  housesRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: SPACING.md,
    marginVertical: SPACING.lg,
  },
  housesRowInteractive: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: SPACING.md,
    marginTop: 'auto',
  },
  introActions: {
    gap: SPACING.md,
  },
  replayButton: {
    minHeight: 54,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.card,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  replayText: { fontFamily: FONT.extraBold, fontSize: 18, color: COLORS.primary },
  primaryButton: {
    minHeight: 58,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
  },
  primaryButtonText: { fontFamily: FONT.extraBold, fontSize: 20, color: COLORS.textWhite },
  activityTitle: {
    fontFamily: FONT.extraBold,
    fontSize: 25,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  letterChoices: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.lg,
  },
  summaryEmoji: { fontSize: 76 },
  summaryTitle: {
    fontFamily: FONT.extraBold,
    fontSize: 26,
    color: COLORS.text,
    textAlign: 'center',
  },
});
