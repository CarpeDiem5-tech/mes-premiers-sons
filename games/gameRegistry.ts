import React from 'react';
import { GameId, GameScreenProps } from '../types';
import AlphabetHousesGame from './alphabet-houses/AlphabetHousesGame';
import MagicSyllableGame from './magic-syllable/MagicSyllableGame';

export const GAME_COMPONENTS: Partial<Record<GameId, React.ComponentType<GameScreenProps>>> = {
  alphabet_houses: AlphabetHousesGame,
  magic_syllable: MagicSyllableGame,
};
