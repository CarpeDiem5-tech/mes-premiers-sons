import {
  EncouragementCategory,
  EncouragementMessage,
  missionCompletedMessages,
  retryMessages,
  successMessages,
} from '../data/encouragements';

const lastMessageIds: Partial<Record<EncouragementCategory, string>> = {};

const normalizeName = (name: string): string => name.trim();

const formatMessage = (message: EncouragementMessage, name?: string): string => {
  if (!message.useChildName) {
    return message.text.replace(/\s*\{name\}\s*/g, ' ').replace(/\s{2,}/g, ' ').trim();
  }

  const childName = normalizeName(name ?? '');
  return message.text.replace(/\{name\}/g, childName).replace(/\s{2,}/g, ' ').trim();
};

const pickRandomMessage = (
  category: EncouragementCategory,
  messages: EncouragementMessage[]
): EncouragementMessage => {
  if (messages.length === 0) {
    throw new Error(`Aucun message disponible pour la catégorie ${category}.`);
  }

  if (messages.length === 1) {
    lastMessageIds[category] = messages[0].id;
    return messages[0];
  }

  const previousId = lastMessageIds[category];
  const availableMessages = messages.filter((message) => message.id !== previousId);
  const selected = availableMessages[Math.floor(Math.random() * availableMessages.length)];
  lastMessageIds[category] = selected.id;
  return selected;
};

export function getRandomSuccess(name: string): string {
  return formatMessage(pickRandomMessage('success', successMessages), name);
}

export function getRandomRetry(): string {
  return formatMessage(pickRandomMessage('retry', retryMessages));
}

export function getRandomMissionCompleted(name: string): string {
  return formatMessage(pickRandomMessage('missionCompleted', missionCompletedMessages), name);
}

export const EncouragementService = {
  getRandomSuccess,
  getRandomRetry,
  getRandomMissionCompleted,
};
