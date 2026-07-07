export type EncouragementCategory = 'success' | 'retry' | 'missionCompleted';

export interface EncouragementEffectConfig {
  speech?: boolean;
  audioFile?: string;
  mascotAnimation?: string;
  confetti?: boolean;
  stars?: number;
}

export interface EncouragementMessage {
  id: string;
  text: string;
  category: EncouragementCategory;
  useChildName: boolean;
  effects?: EncouragementEffectConfig;
}

const createMessages = (
  category: EncouragementCategory,
  useChildName: boolean,
  texts: string[]
): EncouragementMessage[] =>
  texts.map((text, index) => ({
    id: `${category}-${index + 1}`,
    text,
    category,
    useChildName,
    effects: {},
  }));

export const successMessages = createMessages('success', true, [
  'Bravo {name} !',
  'Excellent {name} !',
  'Super {name} !',
  'Fantastique {name} !',
  'Tu progresses, {name} !',
  'Tu peux être fier(e) de toi, {name} !',
  'Encore une réussite, {name} !',
  'Tu deviens très fort(e), {name} !',
  'Formidable, {name} !',
  'Magnifique {name} !',
  'Quel beau travail, {name} !',
  "Tu m'impressionnes, {name} !",
  'Tu réussis de mieux en mieux, {name} !',
  'Tu es sur la bonne voie, {name} !',
  'Continue comme ça, {name} !',
]);

export const retryMessages = createMessages('retry', false, [
  'Presque !',
  'Essaie encore.',
  'Tu vas y arriver.',
  'Regarde bien.',
  'Prends ton temps.',
  'Réécoute la consigne.',
  'Observe bien les lettres.',
  'Tu es tout près de la bonne réponse.',
  'Continue, tu progresses.',
  "Ce n'est pas grave, on recommence.",
]);

export const missionCompletedMessages = createMessages('missionCompleted', true, [
  'Mission réussie {name} !',
  'Bravo {name}, tu as terminé ta mission !',
  'Tu peux être fier(e) de toi {name} !',
  'Encore une belle mission réussie !',
  'Quel champion !',
  'À demain pour une nouvelle mission !',
]);

export const encouragementMessagesByCategory: Record<EncouragementCategory, EncouragementMessage[]> = {
  success: successMessages,
  retry: retryMessages,
  missionCompleted: missionCompletedMessages,
};
