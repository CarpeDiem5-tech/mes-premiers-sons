import { Mission, Game, FindSyllableGame, ReadCardGame, MemoryGame, SyllableItem } from '../types';
import { consonants, letters, vowels } from '../data/letters';
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

function toSyllableItem(text: string): SyllableItem {
  return {
    id: text.toLowerCase(),
    text,
    audioText: text.toLowerCase(),
  };
}

function buildMemoryGame(items: string[]): MemoryGame {
  const base = pickRandom(items, 3).map(toSyllableItem);
  return { type: 'memory', cards: [...base, ...base] };
}

function buildLetterFamilyGames(): Game[] {
  const vowel = pickRandom(vowels, 1)[0];
  const consonant = pickRandom(consonants, 1)[0];
  const sortLetter = pickRandom(letters, 1)[0];
  const vowelChoices = shuffle([pickRandom(vowels, 1)[0], ...pickRandom(consonants, 2)]);
  const consonantChoices = shuffle([...pickRandom(vowels, 2), pickRandom(consonants, 1)[0]]);
  const memoryCards = [
    ...pickRandom(vowels, 2),
    ...pickRandom(consonants, 2),
  ];

  return [
    { type: 'letter_family_intro' },
    { type: 'observe_letters', examples: [vowel, consonant] },
    { type: 'sort_letter', letter: sortLetter },
    { type: 'find_vowel', choices: vowelChoices },
    { type: 'find_consonant', choices: consonantChoices },
    { type: 'letter_family_memory', cards: memoryCards },
  ];
}

export function generateMission(levelId: number): Mission {
  const level = getLevelById(levelId);
  if (!level) throw new Error(`Level ${levelId} not found`);

  const { items } = level;
  const games: Game[] = level.type === 'letter_families'
    ? buildLetterFamilyGames()
    : [
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
