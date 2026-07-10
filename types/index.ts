export interface ChildProfile {
  id: string;
  name: string;
  age: number;
  avatar: string;
  createdAt: string;
}

export type GameId =
  | 'alphabet_houses'
  | 'magic_syllable'
  | 'sound_train'
  | 'memory_express'
  | 'house_hunt'
  | 'vowel_basket'
  | 'true_or_funny'
  | 'word_puzzle';

export interface GameProgress {
  gameId: GameId;

  // Progression interne invisible pour l’enfant
  stage: number;

  totalSessions: number;
  completedSessions: number;

  totalCorrectAnswers: number;
  totalAttempts: number;

  currentStreak: number;
  bestStreak: number;

  totalStarsEarned: number;
  bestStarsInSession: number;

  successfulSessionsAtCurrentStage: number;

  lastPlayedAt: string | null;

  practicedItemIds: string[];
  masteredItemIds: string[];
}

export interface GameSessionResult {
  gameId: GameId;
  stage: number;

  correctAnswers: number;
  totalAttempts: number;
  starsEarned: number;
  durationSeconds: number;

  practicedItemIds: string[];
  masteredItemIds: string[];

  completed: boolean;
  completedAt: string;
}

export interface GameScreenProps {
  profile: ChildProfile;
  progress: GameProgress;
  onComplete: (result: GameSessionResult) => void;
  onExit: () => void;
}

export interface ChildProgress {
  profileId: string;
  currentLevel: number;
  totalStars: number;
  completedMissionIds: string[];
  lastMissionDate: string | null;
  lastMissionLevelId: number;
  schemaVersion: number;
  gameProgress: Partial<Record<GameId, GameProgress>>;
  legacyStats?: {
    totalStarsBeforeGameLibrary: number;
    completedMissionCount: number;
    migratedAt: string;
  };
}

export type LetterFamily = 'vowel' | 'consonant';

export interface LetterItem {
  id: string;
  text: string;
  type: LetterFamily;
}

export type GameType =
  | 'letter_family_intro'
  | 'observe_letters'
  | 'sort_letter'
  | 'find_vowel'
  | 'find_consonant'
  | 'letter_family_memory'
  | 'find_syllable'
  | 'read_card'
  | 'memory';

export interface LetterFamilyIntroGame {
  type: 'letter_family_intro';
}

export interface ObserveLettersGame {
  type: 'observe_letters';
  examples: LetterItem[];
}

export interface SortLetterGame {
  type: 'sort_letter';
  letter: LetterItem;
}

export interface FindVowelGame {
  type: 'find_vowel';
  choices: LetterItem[];
}

export interface FindConsonantGame {
  type: 'find_consonant';
  choices: LetterItem[];
}

export interface LetterFamilyMemoryGame {
  type: 'letter_family_memory';
  cards: LetterItem[];
}

export interface SyllableItem {
  id: string;
  text: string;
  audioText: string;
}

export interface FindSyllableGame {
  type: 'find_syllable';
  target: string;
  choices: string[];
}

export interface ReadCardGame {
  type: 'read_card';
  cards: string[];
}

export interface MemoryGame {
  type: 'memory';
  cards: SyllableItem[];
}

export type Game =
  | LetterFamilyIntroGame
  | ObserveLettersGame
  | SortLetterGame
  | FindVowelGame
  | FindConsonantGame
  | LetterFamilyMemoryGame
  | FindSyllableGame
  | ReadCardGame
  | MemoryGame;

export interface Mission {
  id: string;
  levelId: number;
  games: Game[];
}

export type LevelType = 'letter_families' | 'vowels' | 'syllables' | 'mixed' | 'words' | 'sentences';

export interface Level {
  id: number;
  title: string;
  description: string;
  color: string;
  icon: string;
  items: string[];
  type: LevelType;
}

export type LearningItemType = 'letter' | 'syllable' | 'word';

export type LearningItemId =
  | `letter:${string}`
  | `syllable:${string}`
  | `word:${string}`;

export type SkillId =
  | 'distinguish_vowel_consonant'
  | 'recognize_letter'
  | 'associate_letter_family'
  | 'blend_consonant_vowel'
  | 'recognize_spoken_syllable'
  | 'read_syllable'
  | 'match_identical_syllables'
  | 'identify_same_initial_consonant'
  | 'assemble_word'
  | 'read_word';

export interface SkillDefinition {
  id: SkillId;
  title: string;
  description: string;
  itemTypes: LearningItemType[];
  prerequisiteSkillIds: SkillId[];
}

export interface ParsedLearningItemId {
  type: LearningItemType;
  key: string;
  id: LearningItemId;
}

export interface BaseLearningItem {
  id: LearningItemId;
  type: LearningItemType;
  displayText: string;
  audioText: string;
  skillIds: SkillId[];
  difficulty: number;
  prerequisiteItemIds: LearningItemId[];
  tags: string[];
}

export interface LetterLearningItem extends BaseLearningItem {
  type: 'letter';
  letter: string;
  family: LetterFamily;
}

export interface SyllableLearningItem extends BaseLearningItem {
  type: 'syllable';
  syllable: string;
  consonant: string;
  vowel: string;
  pattern: 'CV';
}

export interface WordLearningItem extends BaseLearningItem {
  type: 'word';
  word: string;
  syllableIds: LearningItemId[];
}

export type LearningItem = LetterLearningItem | SyllableLearningItem | WordLearningItem;
