import { GameId } from '../types';

export type GameAvailability = 'available' | 'coming_soon';

export interface GameDefinition {
  id: GameId;
  title: string;
  shortDescription: string;
  icon: string;
  color: string;
  availability: GameAvailability;
  hasInternalStages: boolean;
  estimatedMinutes: number;
  skillTypes: Array<'letter_family' | 'letter' | 'syllable' | 'word'>;
}

export const GAME_CATALOG: GameDefinition[] = [
  {
    id: 'alphabet_houses',
    title: 'Les maisons de l’alphabet',
    shortDescription: 'Range les lettres dans leur maison.',
    icon: '🏠',
    color: '#FF6B6B',
    availability: 'available',
    hasInternalStages: true,
    estimatedMinutes: 5,
    skillTypes: ['letter_family', 'letter'],
  },
  {
    id: 'magic_syllable',
    title: 'La syllabe magique',
    shortDescription: 'Écoute et trouve le bon son.',
    icon: '✨',
    color: '#FF9F43',
    availability: 'available',
    hasInternalStages: true,
    estimatedMinutes: 5,
    skillTypes: ['syllable'],
  },
  {
    id: 'sound_train',
    title: 'Le train des sons',
    shortDescription: 'Assemble les lettres du train.',
    icon: '🚂',
    color: '#48DBFB',
    availability: 'coming_soon',
    hasInternalStages: true,
    estimatedMinutes: 5,
    skillTypes: ['letter', 'syllable'],
  },
  {
    id: 'memory_express',
    title: 'Memory Express',
    shortDescription: 'Retrouve les cartes qui vont ensemble.',
    icon: '🃏',
    color: '#A29BFE',
    availability: 'available',
    hasInternalStages: true,
    estimatedMinutes: 5,
    skillTypes: ['letter', 'syllable', 'word'],
  },
  {
    id: 'house_hunt',
    title: 'La chasse dans la maison',
    shortDescription: 'Cherche les cartes cachées.',
    icon: '🔎',
    color: '#1DD1A1',
    availability: 'coming_soon',
    hasInternalStages: true,
    estimatedMinutes: 5,
    skillTypes: ['letter_family', 'letter'],
  },
  {
    id: 'vowel_basket',
    title: 'Le panier des voyelles',
    shortDescription: 'Fabrique de nouveaux sons.',
    icon: '🧺',
    color: '#F7C59F',
    availability: 'coming_soon',
    hasInternalStages: true,
    estimatedMinutes: 5,
    skillTypes: ['letter_family', 'letter'],
  },
  {
    id: 'true_or_funny',
    title: 'Vrai ou rigolo',
    shortDescription: 'Écoute et trouve la blague.',
    icon: '😄',
    color: '#FD79A8',
    availability: 'coming_soon',
    hasInternalStages: true,
    estimatedMinutes: 5,
    skillTypes: ['syllable', 'word'],
  },
  {
    id: 'word_puzzle',
    title: 'Le mot puzzle',
    shortDescription: 'Assemble les syllabes du mot.',
    icon: '🧩',
    color: '#E17055',
    availability: 'coming_soon',
    hasInternalStages: true,
    estimatedMinutes: 5,
    skillTypes: ['syllable', 'word'],
  },
];

export const getGameDefinitionById = (id: GameId): GameDefinition | undefined =>
  GAME_CATALOG.find((game) => game.id === id);
