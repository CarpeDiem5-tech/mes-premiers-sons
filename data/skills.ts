import { SkillDefinition } from '../types';

export const SKILLS: SkillDefinition[] = [
  {
    id: 'distinguish_vowel_consonant',
    title: 'Distinguer voyelles et consonnes',
    description: 'Identifier les deux grandes familles de lettres utilisées dans les premiers jeux.',
    itemTypes: ['letter'],
    prerequisiteSkillIds: [],
  },
  {
    id: 'recognize_letter',
    title: 'Reconnaître une lettre',
    description: 'Reconnaître visuellement une lettre isolée et l’associer à son nom oral.',
    itemTypes: ['letter'],
    prerequisiteSkillIds: [],
  },
  {
    id: 'associate_letter_family',
    title: 'Associer une lettre à sa famille',
    description: 'Classer une lettre dans la maison des voyelles ou dans celle des consonnes.',
    itemTypes: ['letter'],
    prerequisiteSkillIds: ['distinguish_vowel_consonant', 'recognize_letter'],
  },
  {
    id: 'blend_consonant_vowel',
    title: 'Fusionner consonne et voyelle',
    description: 'Combiner une consonne et une voyelle pour former une syllabe simple de type CV.',
    itemTypes: ['syllable'],
    prerequisiteSkillIds: ['recognize_letter'],
  },
  {
    id: 'recognize_spoken_syllable',
    title: 'Reconnaître une syllabe entendue',
    description: 'Retrouver une syllabe écrite après l’avoir entendue.',
    itemTypes: ['syllable'],
    prerequisiteSkillIds: ['blend_consonant_vowel'],
  },
  {
    id: 'read_syllable',
    title: 'Lire une syllabe',
    description: 'Lire oralement une syllabe simple en s’appuyant sur les sons des lettres.',
    itemTypes: ['syllable'],
    prerequisiteSkillIds: ['blend_consonant_vowel'],
  },
  {
    id: 'match_identical_syllables',
    title: 'Associer deux syllabes identiques',
    description: 'Repérer deux occurrences identiques d’une même syllabe écrite.',
    itemTypes: ['syllable'],
    prerequisiteSkillIds: ['read_syllable'],
  },
  {
    id: 'identify_same_initial_consonant',
    title: 'Identifier la même consonne initiale',
    description: 'Comparer des syllabes pour repérer celles qui commencent par la même consonne.',
    itemTypes: ['syllable'],
    prerequisiteSkillIds: ['blend_consonant_vowel'],
  },
  {
    id: 'assemble_word',
    title: 'Assembler un mot',
    description: 'Construire un mot court à partir de syllabes déjà travaillées.',
    itemTypes: ['word'],
    prerequisiteSkillIds: ['read_syllable'],
  },
  {
    id: 'read_word',
    title: 'Lire un mot',
    description: 'Lire un mot court composé de syllabes simples déjà connues.',
    itemTypes: ['word'],
    prerequisiteSkillIds: ['assemble_word'],
  },
];

export const SKILL_IDS = SKILLS.map((skill) => skill.id);
