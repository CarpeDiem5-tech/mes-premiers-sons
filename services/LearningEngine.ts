import { LEARNING_CATALOG } from '../data/learningCatalog';
import {
  LearningItem,
  LearningItemId,
  LearningItemType,
  LetterFamily,
  LetterLearningItem,
  SkillId,
  SyllableLearningItem,
} from '../types';
import { createLetterItemId } from '../utils/learningItemIds';

export interface EligibilityOptions {
  mode?: 'allPrerequisitesMastered';
}

const catalogById = new Map<LearningItemId, LearningItem>(LEARNING_CATALOG.map((item) => [item.id, item]));

function normalizeMasteredIds(masteredItemIds: LearningItemId[]): Set<LearningItemId> {
  return new Set(masteredItemIds);
}

export function getItem(itemId: LearningItemId): LearningItem | null {
  return catalogById.get(itemId) ?? null;
}

export function getItemsByType(type: LearningItemType): LearningItem[] {
  return LEARNING_CATALOG.filter((item) => item.type === type);
}

export function getItemsBySkill(skillId: SkillId): LearningItem[] {
  return LEARNING_CATALOG.filter((item) => item.skillIds.includes(skillId));
}

export function getLettersByFamily(family: LetterFamily): LetterLearningItem[] {
  return LEARNING_CATALOG.filter((item): item is LetterLearningItem => item.type === 'letter' && item.family === family);
}

export function getSyllablesForConsonantsAndVowels(consonants: string[], vowels: string[]): SyllableLearningItem[] {
  const consonantIds = new Set(consonants.map(createLetterItemId));
  const vowelIds = new Set(vowels.map(createLetterItemId));

  return LEARNING_CATALOG.filter(
    (item): item is SyllableLearningItem =>
      item.type === 'syllable' && consonantIds.has(createLetterItemId(item.consonant)) && vowelIds.has(createLetterItemId(item.vowel))
  );
}

export function getPrerequisites(itemId: LearningItemId): LearningItem[] {
  const item = getItem(itemId);
  if (!item) return [];
  return item.prerequisiteItemIds.map(getItem).filter((prerequisite): prerequisite is LearningItem => prerequisite !== null);
}

export function getDependentItems(itemId: LearningItemId): LearningItem[] {
  return LEARNING_CATALOG.filter((item) => item.prerequisiteItemIds.includes(itemId));
}

export function getItemsByDifficultyRange(minDifficulty: number, maxDifficulty: number): LearningItem[] {
  return LEARNING_CATALOG.filter((item) => item.difficulty >= minDifficulty && item.difficulty <= maxDifficulty);
}

export function isItemEligible(
  itemId: LearningItemId,
  masteredItemIds: LearningItemId[],
  options: EligibilityOptions = { mode: 'allPrerequisitesMastered' }
): boolean {
  const item = getItem(itemId);
  if (!item) return false;

  switch (options.mode) {
    case 'allPrerequisitesMastered':
    default: {
      const mastered = normalizeMasteredIds(masteredItemIds);
      return item.prerequisiteItemIds.every((prerequisiteId) => mastered.has(prerequisiteId));
    }
  }
}

export function getEligibleItems(candidateItemIds: LearningItemId[], masteredItemIds: LearningItemId[]): LearningItem[] {
  return candidateItemIds
    .filter((itemId) => isItemEligible(itemId, masteredItemIds))
    .map(getItem)
    .filter((item): item is LearningItem => item !== null);
}

export const LearningEngine = {
  getItem,
  getItemsByType,
  getItemsBySkill,
  getLettersByFamily,
  getSyllablesForConsonantsAndVowels,
  getPrerequisites,
  getDependentItems,
  getItemsByDifficultyRange,
  isItemEligible,
  getEligibleItems,
};
