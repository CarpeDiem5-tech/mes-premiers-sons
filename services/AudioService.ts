import * as Speech from 'expo-speech';

type ExpoSpeechOptions = NonNullable<Parameters<typeof Speech.speak>[1]>;
type SpeechKind = 'instruction' | 'feedback' | 'syllable';

type VoiceProfile = {
  language: string;
  voice?: string;
  rate: number;
  pitch: number;
  shortPauseMs: number;
  longPauseMs: number;
};

type SpeechOptions = Partial<Pick<VoiceProfile, 'language' | 'voice' | 'rate' | 'pitch'>> & {
  kind?: SpeechKind;
};

const KIND_PROFILES: Record<SpeechKind, VoiceProfile> = {
  instruction: {
    language: 'fr-FR',
    rate: 0.76,
    pitch: 1.04,
    shortPauseMs: 360,
    longPauseMs: 620,
  },
  feedback: {
    language: 'fr-FR',
    rate: 0.8,
    pitch: 1.05,
    shortPauseMs: 300,
    longPauseMs: 520,
  },
  syllable: {
    language: 'fr-FR',
    rate: 0.68,
    pitch: 1.02,
    shortPauseMs: 420,
    longPauseMs: 620,
  },
};

class AudioService {
  private currentPlaybackId = 0;
  private profiles = { ...KIND_PROFILES };

  configureVoice(kind: SpeechKind, profile: Partial<VoiceProfile>): void {
    this.profiles[kind] = { ...this.profiles[kind], ...profile };
  }

  stopCurrent(): void {
    this.currentPlaybackId += 1;
    Speech.stop();
  }

  playSyllable(text: string): void {
    this.playText(text, { kind: 'syllable' });
  }

  playInstruction(text: string): void {
    this.playText(text, { kind: 'instruction' });
  }

  playFeedback(text: string): void {
    this.playText(text, { kind: 'feedback' });
  }

  playText(text: string, options: SpeechOptions = {}): void {
    const kind = options.kind ?? 'instruction';
    const profile = { ...this.profiles[kind], ...options };
    const utterances = this.prepareUtterances(text);
    if (utterances.length === 0) return;

    const playbackId = this.currentPlaybackId + 1;
    this.currentPlaybackId = playbackId;

    Speech.stop();
    this.speakUtterance(playbackId, utterances, 0, profile);
  }

  private prepareUtterances(text: string): string[] {
    return text
      .replace(/\s+/g, ' ')
      .trim()
      .split(/(?<=[.!?])\s+|\s*[;:]\s*/u)
      .map((sentence) => sentence.trim())
      .filter(Boolean)
      .flatMap((sentence) => this.splitLongSentence(sentence));
  }

  private splitLongSentence(sentence: string): string[] {
    const normalized = sentence.trim();
    const words = normalized.split(' ');
    if (words.length <= 5) return [normalized];

    const chunks: string[] = [];
    let current: string[] = [];

    words.forEach((word) => {
      current.push(word);
      const cleanWord = word.replace(/[.,!?]/g, '').toLowerCase();
      const shouldPause = current.length >= 3 && ['et', 'ou', 'dans', 'avec', 'ici', 'encore'].includes(cleanWord);
      const isLongEnough = current.length >= 5;

      if (shouldPause || isLongEnough) {
        chunks.push(current.join(' '));
        current = [];
      }
    });

    if (current.length > 0) chunks.push(current.join(' '));
    return chunks;
  }

  private speakUtterance(playbackId: number, utterances: string[], index: number, profile: VoiceProfile): void {
    if (this.currentPlaybackId !== playbackId) return;

    const text = utterances[index];
    const isLast = index >= utterances.length - 1;
    const options: ExpoSpeechOptions = {
      language: profile.language,
      rate: profile.rate,
      pitch: profile.pitch,
      voice: profile.voice,
      onDone: () => this.queueNextUtterance(playbackId, utterances, index, profile, isLast),
      onStopped: () => this.handlePlaybackEnd(playbackId),
      onError: () => this.handlePlaybackEnd(playbackId),
    };

    try {
      Speech.speak(text, options);
    } catch {
      this.handlePlaybackEnd(playbackId);
    }
  }

  private queueNextUtterance(
    playbackId: number,
    utterances: string[],
    index: number,
    profile: VoiceProfile,
    isLast: boolean,
  ): void {
    if (isLast) {
      this.handlePlaybackEnd(playbackId);
      return;
    }

    const pauseMs = utterances[index].endsWith('.') || utterances[index].endsWith('!') || utterances[index].endsWith('?')
      ? profile.longPauseMs
      : profile.shortPauseMs;

    setTimeout(() => this.speakUtterance(playbackId, utterances, index + 1, profile), pauseMs);
  }

  private handlePlaybackEnd(playbackId: number): void {
    if (this.currentPlaybackId === playbackId) {
      this.currentPlaybackId += 1;
    }
  }
}

export type { SpeechKind, VoiceProfile };
export default new AudioService();
