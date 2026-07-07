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

export type GameType = 'find_syllable' | 'read_card' | 'memory';

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
  cards: string[];
}

export type Game = FindSyllableGame | ReadCardGame | MemoryGame;

export interface Mission {
  id: string;
  levelId: number;
  games: Game[];
}

export type LevelType = 'vowels' | 'syllables' | 'mixed' | 'words' | 'sentences';

export interface Level {
  id: number;
  title: string;
  description: string;
  color: string;
  icon: string;
  items: string[];
  type: LevelType;
}
