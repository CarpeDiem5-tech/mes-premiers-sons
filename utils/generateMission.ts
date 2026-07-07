import { Mission, Game, FindSyllableGame, ReadCardGame, MemoryGame } from '../types';
import { getLevelById } from '../data/levels';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRandom<T>(arr: T[], count: number): T[] {
  return shuffle(arr).slice(0, count);
}

function buildFindSyllableGame(items: string[]): FindSyllableGame {
  const pool = items.length >= 3 ? items : [...items, ...items].slice(0, 6);
  const shuffled = shuffle(pool);
  const target = shuffled[0];
  const wrongCandidates = shuffled.filter((s) => s !== target).slice(0, 2);
  const choices = shuffle([target, ...wrongCandidates]);
  return { type: 'find_syllable', target, choices };
}

function buildReadCardGame(items: string[]): ReadCardGame {
  const cards = pickRandom(items, Math.min(4, items.length));
  return { type: 'read_card', cards };
}

function buildMemoryGame(items: string[]): MemoryGame {
  const base = pickRandom(items, 3);
  return { type: 'memory', cards: [...base, ...base] };
}

export function generateMission(levelId: number): Mission {
  const level = getLevelById(levelId);
  if (!level) throw new Error(`Level ${levelId} not found`);

  const { items } = level;
  const games: Game[] = [
    buildFindSyllableGame(items),
    buildReadCardGame(items),
    buildMemoryGame(items),
  ];

  return {
    id: `${levelId}-${Date.now()}`,
    levelId,
    games,
  };
}
