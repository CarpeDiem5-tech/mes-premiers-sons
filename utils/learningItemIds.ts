import { LearningItemId, LearningItemType, ParsedLearningItemId } from '../types';

const LEARNING_ITEM_ID_PATTERN = /^(letter|syllable|word):(.+)$/;

export function normalizeLearningItemKey(value: string): string {
  return value.trim().toLocaleLowerCase('fr-FR');
}

export function createLearningItemId(type: LearningItemType, value: string): LearningItemId {
  return `${type}:${normalizeLearningItemKey(value)}` as LearningItemId;
}

export function createLetterItemId(letter: string): LearningItemId {
  return createLearningItemId('letter', letter);
}

export function createSyllableItemId(syllable: string): LearningItemId {
  return createLearningItemId('syllable', syllable);
}

export function createWordItemId(word: string): LearningItemId {
  return createLearningItemId('word', word);
}

export function parseLearningItemId(itemId: string): ParsedLearningItemId | null {
  const match = LEARNING_ITEM_ID_PATTERN.exec(itemId.trim());
  if (!match) return null;

  const type = match[1] as LearningItemType;
  const key = normalizeLearningItemKey(match[2]);
  const normalizedId = createLearningItemId(type, key);

  if (itemId !== normalizedId) return null;

  return { type, key, id: normalizedId };
}

export function isLearningItemId(value: string): value is LearningItemId {
  return parseLearningItemId(value) !== null;
}
