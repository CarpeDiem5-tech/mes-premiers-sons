import * as Speech from 'expo-speech';

type SpeechOptions = {
  language?: string;
  rate?: number;
};

const DEFAULT_LANGUAGE = 'fr-FR';
const INSTRUCTION_RATE = 0.82;
const SYLLABLE_RATE = 0.72;

class AudioService {
  private currentPlaybackId = 0;

  stopCurrent(): void {
    this.currentPlaybackId += 1;
    Speech.stop();
  }

  playSyllable(text: string): void {
    this.playText(text, {
      language: DEFAULT_LANGUAGE,
      rate: SYLLABLE_RATE,
    });
  }

  playInstruction(text: string): void {
    this.playText(text, {
      language: DEFAULT_LANGUAGE,
      rate: INSTRUCTION_RATE,
    });
  }

  private playText(text: string, options: SpeechOptions): void {
    const normalizedText = text.trim();
    if (!normalizedText) return;

    const playbackId = this.currentPlaybackId + 1;
    this.currentPlaybackId = playbackId;

    try {
      Speech.stop();
      Speech.speak(normalizedText, {
        language: options.language ?? DEFAULT_LANGUAGE,
        rate: options.rate,
        onDone: () => this.handlePlaybackEnd(playbackId),
        onStopped: () => this.handlePlaybackEnd(playbackId),
        onError: () => this.handlePlaybackEnd(playbackId),
      });
    } catch {
      this.handlePlaybackEnd(playbackId);
    }
  }

  private handlePlaybackEnd(playbackId: number): void {
    if (this.currentPlaybackId === playbackId) {
      this.currentPlaybackId += 1;
    }
  }
}

export default new AudioService();
