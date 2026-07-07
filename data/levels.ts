import { Level } from '../types';

export const LEVELS: Level[] = [
  {
    id: 1,
    title: 'Les voyelles',
    description: 'Découvre les voyelles A E I O U',
    color: '#FF6B6B',
    icon: '🔤',
    items: ['A', 'E', 'I', 'O', 'U'],
    type: 'vowels',
  },
  {
    id: 2,
    title: 'La syllabe MA',
    description: 'Apprends MA ME MI MO MU',
    color: '#FF9F43',
    icon: '🌟',
    items: ['MA', 'ME', 'MI', 'MO', 'MU'],
    type: 'syllables',
  },
  {
    id: 3,
    title: 'La syllabe PA',
    description: 'Apprends PA PE PI PO PU',
    color: '#F7C59F',
    icon: '🎈',
    items: ['PA', 'PE', 'PI', 'PO', 'PU'],
    type: 'syllables',
  },
  {
    id: 4,
    title: 'La syllabe LA',
    description: 'Apprends LA LE LI LO LU',
    color: '#48DBFB',
    icon: '🌈',
    items: ['LA', 'LE', 'LI', 'LO', 'LU'],
    type: 'syllables',
  },
  {
    id: 5,
    title: 'La syllabe SA',
    description: 'Apprends SA SE SI SO SU',
    color: '#1DD1A1',
    icon: '🌿',
    items: ['SA', 'SE', 'SI', 'SO', 'SU'],
    type: 'syllables',
  },
  {
    id: 6,
    title: 'Mélange !',
    description: 'Reconnais toutes les syllabes',
    color: '#A29BFE',
    icon: '🎪',
    items: ['MA', 'ME', 'PA', 'PE', 'LA', 'LE', 'SA', 'SE', 'MI', 'PI', 'LI', 'SI'],
    type: 'mixed',
  },
  {
    id: 7,
    title: 'Premiers mots',
    description: 'Lis MAMAN PAPA LILI LAMA MOTO',
    color: '#FD79A8',
    icon: '📖',
    items: ['MAMAN', 'PAPA', 'LILI', 'LAMA', 'MOTO'],
    type: 'words',
  },
  {
    id: 8,
    title: 'Premières phrases',
    description: 'Lis des petites phrases',
    color: '#E17055',
    icon: '✨',
    items: ['Papa a lu.', 'Lili a ri.', 'Lama a soif.', 'Moto papi.'],
    type: 'sentences',
  },
];

export const getLevelById = (id: number): Level | undefined =>
  LEVELS.find((l) => l.id === id);

export const TOTAL_LEVELS = LEVELS.length;
