export type LetterFamily = 'vowel' | 'consonant';

export interface LetterItem {
  id: string;
  text: string;
  type: LetterFamily;
}

export const VOWEL_COLOR = '#FF6B6B';
export const CONSONANT_COLOR = '#48DBFB';

export const letters: LetterItem[] = [
  { id: 'a', text: 'A', type: 'vowel' },
  { id: 'e', text: 'E', type: 'vowel' },
  { id: 'i', text: 'I', type: 'vowel' },
  { id: 'o', text: 'O', type: 'vowel' },
  { id: 'u', text: 'U', type: 'vowel' },
  { id: 'y', text: 'Y', type: 'vowel' },

  { id: 'b', text: 'B', type: 'consonant' },
  { id: 'c', text: 'C', type: 'consonant' },
  { id: 'd', text: 'D', type: 'consonant' },
  { id: 'f', text: 'F', type: 'consonant' },
  { id: 'g', text: 'G', type: 'consonant' },
  { id: 'h', text: 'H', type: 'consonant' },
  { id: 'j', text: 'J', type: 'consonant' },
  { id: 'k', text: 'K', type: 'consonant' },
  { id: 'l', text: 'L', type: 'consonant' },
  { id: 'm', text: 'M', type: 'consonant' },
  { id: 'n', text: 'N', type: 'consonant' },
  { id: 'p', text: 'P', type: 'consonant' },
  { id: 'q', text: 'Q', type: 'consonant' },
  { id: 'r', text: 'R', type: 'consonant' },
  { id: 's', text: 'S', type: 'consonant' },
  { id: 't', text: 'T', type: 'consonant' },
  { id: 'v', text: 'V', type: 'consonant' },
  { id: 'w', text: 'W', type: 'consonant' },
  { id: 'x', text: 'X', type: 'consonant' },
  { id: 'z', text: 'Z', type: 'consonant' },
];

export const vowels = letters.filter((letter) => letter.type === 'vowel');
export const consonants = letters.filter((letter) => letter.type === 'consonant');
