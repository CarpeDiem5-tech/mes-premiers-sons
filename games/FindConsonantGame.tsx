import React from 'react';
import FindLetterFamilyGame from './FindLetterFamilyGame';
import { FindConsonantGame as FindConsonantGameType } from '../types';

interface Props {
  game: FindConsonantGameType;
  onComplete: (stars: number) => void;
}

export default function FindConsonantGame({ game, onComplete }: Props) {
  return <FindLetterFamilyGame choices={game.choices} targetFamily="consonant" onComplete={onComplete} />;
}
