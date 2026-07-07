export interface ChildProfile {
  id: string;
  name: string;
  age: number;
  avatar: string;
  createdAt: string;
}

export interface ChildProgress {
  profileId: string;
  currentLevel: number;
  totalStars: number;
  completedMissionIds: string[];
  lastMissionDate: string | null;
  lastMissionLevelId: number;
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
