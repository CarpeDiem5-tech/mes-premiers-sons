import React from 'react';
import FindLetterFamilyGame from './FindLetterFamilyGame';
import { FindVowelGame as FindVowelGameType } from '../types';

interface Props {
  game: FindVowelGameType;
  onComplete: (stars: number) => void;
}

export default function FindVowelGame({ game, onComplete }: Props) {
  return <FindLetterFamilyGame choices={game.choices} targetFamily="vowel" onComplete={onComplete} />;
}
