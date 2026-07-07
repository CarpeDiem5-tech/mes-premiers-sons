import { Platform } from 'react-native';
import AudioService from './AudioService';

export interface SpeechRecognitionResult {
  transcript: string;
  confidence?: number;
}

export interface SpeechRecognitionEngine {
  startListening(): Promise<void>;
  stopListening(): Promise<void>;
  recognizeSpeech(expectedText?: string): Promise<SpeechRecognitionResult | null>;
}

export interface CloseEnoughOptions {
  threshold?: number;
}

const DEFAULT_LANGUAGE = 'fr-FR';
const DEFAULT_SIMILARITY_THRESHOLD = 0.68;

type BrowserSpeechRecognition = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string; confidence?: number }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

declare global {
  interface Window {
    SpeechRecognition?: new () => BrowserSpeechRecognition;
    webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
  }
}

class WebSpeechRecognitionEngine implements SpeechRecognitionEngine {
  private recognition: BrowserSpeechRecognition | null = null;
  private lastResult: SpeechRecognitionResult | null = null;

  async startListening(): Promise<void> {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Recognition) return;

    this.lastResult = null;
    this.recognition = new Recognition();
    this.recognition.lang = DEFAULT_LANGUAGE;
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 3;
    this.recognition.start();
  }

  async stopListening(): Promise<void> {
    this.recognition?.stop();
  }

  async recognizeSpeech(): Promise<SpeechRecognitionResult | null> {
    const recognition = this.recognition;
    if (!recognition) return null;

    return new Promise((resolve) => {
      const finish = (result: SpeechRecognitionResult | null) => {
        this.lastResult = result;
        this.recognition = null;
        resolve(result);
      };

      recognition.onresult = (event) => {
        const alternative = event.results?.[0]?.[0];
        finish(alternative?.transcript ? {
          transcript: alternative.transcript,
          confidence: alternative.confidence,
        } : null);
      };
      recognition.onerror = () => finish(null);
      recognition.onend = () => finish(this.lastResult);
    });
  }
}

class SpeechService {
  private engine: SpeechRecognitionEngine;
  private similarityThreshold = DEFAULT_SIMILARITY_THRESHOLD;

  constructor(engine: SpeechRecognitionEngine = new WebSpeechRecognitionEngine()) {
    this.engine = engine;
  }

  setRecognitionEngine(engine: SpeechRecognitionEngine): void {
    this.engine = engine;
  }

  setSimilarityThreshold(threshold: number): void {
    this.similarityThreshold = Math.max(0, Math.min(1, threshold));
  }

  playSyllable(text: string): void {
    const normalizedText = text.trim().toLowerCase();
    if (!normalizedText) return;
    AudioService.stopCurrent();
    AudioService.playSyllable(normalizedText);
  }

  async startListening(): Promise<void> {
    await this.engine.startListening();
  }

  async stopListening(): Promise<void> {
    await this.engine.stopListening();
  }

  async recognizeSpeech(expectedText?: string): Promise<SpeechRecognitionResult | null> {
    return this.engine.recognizeSpeech(expectedText);
  }

  isCloseEnough(expected: string, recognized: string, options?: CloseEnoughOptions): boolean {
    const threshold = options?.threshold ?? this.similarityThreshold;
    const expectedVariants = this.getAcceptedVariants(expected);
    const normalizedRecognized = this.normalizeForComparison(recognized);

    if (!normalizedRecognized) return false;
    return expectedVariants.some((variant) => {
      if (normalizedRecognized === variant) return true;
      if (normalizedRecognized.includes(variant) && variant.length <= 3) return true;
      return this.similarity(variant, normalizedRecognized) >= threshold;
    });
  }

  private getAcceptedVariants(text: string): string[] {
    const normalized = this.normalizeForComparison(text);
    const variants = new Set([normalized]);
    if (normalized === 'ma') {
      ['maa', 'maaa', 'mah'].forEach((variant) => variants.add(variant));
    }
    return Array.from(variants);
  }

  private normalizeForComparison(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[’']/g, '')
      .replace(/[^a-z]/g, '')
      .trim();
  }

  private similarity(a: string, b: string): number {
    const longest = Math.max(a.length, b.length);
    if (longest === 0) return 1;
    return (longest - this.levenshteinDistance(a, b)) / longest;
  }

  private levenshteinDistance(a: string, b: string): number {
    const dp = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= b.length; j += 1) dp[0][j] = j;
    for (let i = 1; i <= a.length; i += 1) {
      for (let j = 1; j <= b.length; j += 1) {
        dp[i][j] = a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]) + 1;
      }
    }
    return dp[a.length][b.length];
  }
}

export { SpeechService };
export default new SpeechService();
