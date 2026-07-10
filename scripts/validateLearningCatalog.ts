import { validateLearningCatalog } from '../data/learningCatalog';
import { LearningEngine } from '../services/LearningEngine';
import { createLetterItemId, createSyllableItemId, createWordItemId } from '../utils/learningItemIds';

const result = validateLearningCatalog();

console.log(JSON.stringify({
  valid: result.valid,
  errors: result.errors,
  prerequisites: {
    MA: LearningEngine.getPrerequisites(createSyllableItemId('MA')).map((item) => item.id),
    MI: LearningEngine.getPrerequisites(createSyllableItemId('MI')).map((item) => item.id),
    MOTO: LearningEngine.getPrerequisites(createWordItemId('MOTO')).map((item) => item.id),
    PAPA: LearningEngine.getPrerequisites(createWordItemId('PAPA')).map((item) => item.id),
  },
  vowels: LearningEngine.getLettersByFamily('vowel').map((item) => item.id),
  mSyllables: LearningEngine.getSyllablesForConsonantsAndVowels(['M'], ['A', 'I', 'O']).map((item) => item.id),
  eligibility: {
    maWithoutLetters: LearningEngine.isItemEligible(createSyllableItemId('MA'), []),
    maWithLetters: LearningEngine.isItemEligible(createSyllableItemId('MA'), [createLetterItemId('M'), createLetterItemId('A')]),
  },
}, null, 2));

if (!result.valid) {
  throw new Error('Learning catalog validation failed');
}
