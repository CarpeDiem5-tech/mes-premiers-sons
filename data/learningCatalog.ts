import { SYLLABLE_STAGES, buildSyllablesForStage } from './syllableCurriculum';
import { SKILL_IDS } from './skills';
import {
  LearningItem,
  LearningItemId,
  LetterFamily,
  LetterLearningItem,
  SkillId,
  SyllableLearningItem,
  WordLearningItem,
} from '../types';
import { createLetterItemId, createSyllableItemId, createWordItemId, parseLearningItemId } from '../utils/learningItemIds';

// Future source of truth: this catalog centralizes pedagogical relations for all games.
// During this foundation step, syllables are derived from data/syllableCurriculum.ts and words from data/levels.ts usage.
const VOWELS = ['A', 'E', 'I', 'O', 'U'];
const CONSONANTS = ['M', 'L', 'S', 'F', 'P', 'T', 'N', 'R', 'B', 'D', 'V', 'J', 'G', 'C'];
const ADVANCED_VOWELS = ['Y'];

function createLetter(letter: string, family: LetterFamily, difficulty: number, tags: string[] = []): LetterLearningItem {
  return {
    id: createLetterItemId(letter),
    type: 'letter',
    displayText: letter,
    audioText: letter,
    skillIds: ['distinguish_vowel_consonant', 'recognize_letter', 'associate_letter_family'],
    difficulty,
    prerequisiteItemIds: [],
    tags,
    letter,
    family,
  };
}

const syllablePool = Array.from(new Set(SYLLABLE_STAGES.flatMap(buildSyllablesForStage)));

function createSyllable(syllable: string): SyllableLearningItem {
  const [consonant, vowel] = syllable.split('');
  const stage = SYLLABLE_STAGES.find((definition) => buildSyllablesForStage(definition).includes(syllable))?.stage ?? 1;
  return {
    id: createSyllableItemId(syllable),
    type: 'syllable',
    displayText: syllable,
    audioText: syllable,
    skillIds: ['blend_consonant_vowel', 'recognize_spoken_syllable', 'read_syllable'],
    difficulty: stage,
    prerequisiteItemIds: [createLetterItemId(consonant), createLetterItemId(vowel)],
    tags: ['cv', `stage:${stage}`],
    syllable,
    consonant,
    vowel,
    pattern: 'CV',
  };
}

const USED_WORDS: Array<{ word: string; syllables: string[] }> = [
  { word: 'PAPA', syllables: ['PA', 'PA'] },
  { word: 'LILI', syllables: ['LI', 'LI'] },
  { word: 'LAMA', syllables: ['LA', 'MA'] },
  { word: 'MOTO', syllables: ['MO', 'TO'] },
];

function createWord(definition: { word: string; syllables: string[] }): WordLearningItem {
  const syllableIds = definition.syllables.map(createSyllableItemId);
  return {
    id: createWordItemId(definition.word),
    type: 'word',
    displayText: definition.word,
    audioText: definition.word,
    skillIds: ['assemble_word', 'read_word'],
    difficulty: 7,
    prerequisiteItemIds: syllableIds,
    tags: ['level:7', 'first_words'],
    word: definition.word,
    syllableIds,
  };
}

export const LETTER_LEARNING_ITEMS: LetterLearningItem[] = [
  ...VOWELS.map((letter) => createLetter(letter, 'vowel', 1)),
  ...CONSONANTS.map((letter) => createLetter(letter, 'consonant', 1)),
  ...ADVANCED_VOWELS.map((letter) => createLetter(letter, 'vowel', 3, ['advanced_vowel', 'sometimes_vowel'])),
];

export const SYLLABLE_LEARNING_ITEMS: SyllableLearningItem[] = syllablePool.map(createSyllable);
export const WORD_LEARNING_ITEMS: WordLearningItem[] = USED_WORDS.map(createWord);

export const LEARNING_CATALOG: LearningItem[] = [
  ...LETTER_LEARNING_ITEMS,
  ...SYLLABLE_LEARNING_ITEMS,
  ...WORD_LEARNING_ITEMS,
];

export interface LearningCatalogValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateLearningCatalog(catalog: LearningItem[] = LEARNING_CATALOG): LearningCatalogValidationResult {
  const errors: string[] = [];
  const ids = new Set<LearningItemId>();
  const knownSkillIds = new Set<SkillId>(SKILL_IDS);
  const byId = new Map<LearningItemId, LearningItem>();

  catalog.forEach((item) => {
    if (ids.has(item.id)) errors.push(`Duplicate learning item id: ${item.id}`);
    ids.add(item.id);
    byId.set(item.id, item);

    const parsed = parseLearningItemId(item.id);
    if (!parsed || parsed.type !== item.type) errors.push(`Invalid learning item id format: ${item.id}`);
    if (!Number.isFinite(item.difficulty) || item.difficulty < 1) errors.push(`Invalid difficulty for ${item.id}: ${item.difficulty}`);

    item.skillIds.forEach((skillId) => {
      if (!knownSkillIds.has(skillId)) errors.push(`Unknown skill ${skillId} on ${item.id}`);
    });
  });

  catalog.forEach((item) => {
    item.prerequisiteItemIds.forEach((prerequisiteId) => {
      if (!byId.has(prerequisiteId)) errors.push(`Missing prerequisite ${prerequisiteId} on ${item.id}`);
    });

    if (item.type === 'syllable') {
      if (!byId.has(createLetterItemId(item.consonant))) errors.push(`Missing consonant ${item.consonant} for ${item.id}`);
      if (!byId.has(createLetterItemId(item.vowel))) errors.push(`Missing vowel ${item.vowel} for ${item.id}`);
    }

    if (item.type === 'word') {
      item.syllableIds.forEach((syllableId) => {
        if (!byId.has(syllableId)) errors.push(`Missing word syllable ${syllableId} on ${item.id}`);
      });
    }
  });

  return { valid: errors.length === 0, errors };
}
