export interface SyllableStageDefinition {
  stage: number;
  consonants: string[];
  vowels: string[];
  optionCount: 3 | 4;
  questionCount: number;
  useCloseDistractors: boolean;
}

export const SYLLABLE_STAGES: SyllableStageDefinition[] = [
  {
    stage: 1,
    consonants: ['M', 'L', 'S', 'F'],
    vowels: ['A'],
    optionCount: 3,
    questionCount: 5,
    useCloseDistractors: false,
  },
  {
    stage: 2,
    consonants: ['M', 'L', 'S', 'F'],
    vowels: ['A', 'I', 'O'],
    optionCount: 3,
    questionCount: 6,
    useCloseDistractors: false,
  },
  {
    stage: 3,
    consonants: ['M', 'L', 'S', 'F', 'P', 'T', 'N', 'R'],
    vowels: ['A', 'I', 'O'],
    optionCount: 3,
    questionCount: 6,
    useCloseDistractors: false,
  },
  {
    stage: 4,
    consonants: ['M', 'L', 'S', 'F', 'P', 'T', 'N', 'R'],
    vowels: ['A', 'E', 'I', 'O', 'U'],
    optionCount: 4,
    questionCount: 7,
    useCloseDistractors: false,
  },
  {
    stage: 5,
    consonants: ['M', 'L', 'S', 'F', 'P', 'T', 'N', 'R', 'B'],
    vowels: ['A', 'I', 'O'],
    optionCount: 4,
    questionCount: 7,
    useCloseDistractors: true,
  },
  {
    stage: 6,
    consonants: ['M', 'L', 'S', 'F', 'P', 'T', 'N', 'R', 'B', 'D', 'V', 'J', 'G', 'C'],
    vowels: ['A', 'E', 'I', 'O', 'U'],
    optionCount: 4,
    questionCount: 8,
    useCloseDistractors: true,
  },
];

export const MAX_SYLLABLE_STAGE = SYLLABLE_STAGES.length;

export function getSyllableStageDefinition(stage: number): SyllableStageDefinition {
  const safeStage = Math.max(1, Math.min(MAX_SYLLABLE_STAGE, stage));
  return SYLLABLE_STAGES.find((definition) => definition.stage === safeStage) ?? SYLLABLE_STAGES[0];
}

export function buildSyllablesForStage(definition: SyllableStageDefinition): string[] {
  return definition.consonants.flatMap((consonant) =>
    definition.vowels.map((vowel) => `${consonant}${vowel}`)
  );
}
