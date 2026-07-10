import { buildSyllablesForStage, getSyllableStageDefinition } from '../data/syllableCurriculum';

export interface MagicSyllableQuestion {
  id: string;
  target: string;
  choices: string[];
}

export interface MagicSyllableSession {
  stage: number;
  questions: MagicSyllableQuestion[];
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function signature(items: string[]): string {
  return [...items].sort().join('|');
}

function farDistractors(target: string, pool: string[]): string[] {
  const [targetConsonant, targetVowel] = target.split('');
  return pool.filter((syllable) => {
    const [consonant, vowel] = syllable.split('');
    return consonant !== targetConsonant && vowel !== targetVowel;
  });
}

function closeDistractors(target: string, pool: string[]): string[] {
  const [targetConsonant, targetVowel] = target.split('');
  return pool.filter((syllable) => {
    const [consonant, vowel] = syllable.split('');
    return syllable !== target && (consonant === targetConsonant || vowel === targetVowel);
  });
}

function buildChoices(target: string, pool: string[], count: 3 | 4, useCloseDistractors: boolean, previousChoices: string[]): string[] {
  const preferred = useCloseDistractors ? closeDistractors(target, pool) : farDistractors(target, pool);
  const fallback = pool.filter((syllable) => syllable !== target);
  const candidates = shuffle([...preferred, ...fallback.filter((syllable) => !preferred.includes(syllable))]);

  let choices = [target, ...candidates].filter((syllable, index, arr) => arr.indexOf(syllable) === index).slice(0, count);
  if (choices.length < count) {
    choices = [target, ...fallback].filter((syllable, index, arr) => arr.indexOf(syllable) === index).slice(0, count);
  }

  const shuffled = shuffle(choices);
  if (signature(shuffled) !== signature(previousChoices)) return shuffled;

  const alternate = shuffle(fallback.filter((syllable) => !choices.includes(syllable)));
  if (alternate.length === 0) return shuffled;

  const adjusted = [target, ...choices.filter((syllable) => syllable !== target).slice(0, count - 2), alternate[0]];
  return shuffle(adjusted);
}

export function generateMagicSyllableSession(stage: number): MagicSyllableSession {
  const definition = getSyllableStageDefinition(stage);
  const pool = buildSyllablesForStage(definition);
  const targets = shuffle(pool);
  const questions: MagicSyllableQuestion[] = [];
  let previousTarget: string | null = null;
  let previousChoices: string[] = [];

  for (let index = 0; index < definition.questionCount; index += 1) {
    const target = targets.find((syllable) => syllable !== previousTarget) ?? targets[index % targets.length];
    const choices = buildChoices(target, pool, definition.optionCount, definition.useCloseDistractors, previousChoices);
    questions.push({ id: `${definition.stage}-${index}-${target.toLowerCase()}`, target, choices });
    previousTarget = target;
    previousChoices = choices;
    targets.push(targets.shift() ?? target);
  }

  return { stage: definition.stage, questions };
}
