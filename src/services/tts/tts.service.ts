export interface TTSProvider {
  name: string;
  speak(text: string, language?: string): Promise<void>;
  stop(): void;
  isSpeaking(): boolean;
}

export class BrowserTTSService implements TTSProvider {
  name = 'BrowserWebSpeechTTS';
  private synthesis: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private nativeSpeaking = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
    }
  }

  public async speak(text: string, language = 'hi-IN'): Promise<void> {
    const cleaned = text.replace(/[*_#`]/g, '').trim();

    // Native Mobile Fallback using expo-speech (dynamic load to prevent Vite bundle crash)
    if (typeof window === 'undefined' || !this.synthesis) {
      try {
        const Speech = require('expo-speech');
        if (Speech) {
          this.stop();
          this.nativeSpeaking = true;
          return new Promise((resolve) => {
            Speech.speak(cleaned, {
              language,
              rate: 0.9,
              pitch: 1.0,
              onDone: () => {
                this.nativeSpeaking = false;
                resolve();
              },
              onError: (err: any) => {
                console.warn('Expo Speech error:', err);
                this.nativeSpeaking = false;
                resolve();
              }
            });
          });
        }
      } catch (err) {
        console.warn('SpeechSynthesis and expo-speech are both unavailable', err);
      }
      return;
    }

    this.stop();

    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(cleaned);
      this.currentUtterance = utterance;

      utterance.lang = language;
      utterance.rate = 0.95; // Slightly measured rate for low-literacy clarity
      utterance.pitch = 1.0;

      // Find best Hindi voice if available
      const voices = this.synthesis?.getVoices() || [];
      const hindiVoice = voices.find(v => v.lang.includes('hi') || v.name.includes('Hindi') || v.name.includes('India'));
      if (hindiVoice) {
        utterance.voice = hindiVoice;
      }

      utterance.onend = () => {
        this.currentUtterance = null;
        resolve();
      };

      utterance.onerror = (e) => {
        console.warn('Speech synthesis playback event:', e);
        this.currentUtterance = null;
        resolve();
      };

      this.synthesis?.speak(utterance);
    });
  }

  public stop(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
      this.currentUtterance = null;
    }
    if (typeof window === 'undefined' || !this.synthesis) {
      try {
        const Speech = require('expo-speech');
        if (Speech) {
          Speech.stop();
          this.nativeSpeaking = false;
        }
      } catch (e) {}
    }
  }

  public isSpeaking(): boolean {
    if (typeof window === 'undefined' || !this.synthesis) {
      return this.nativeSpeaking;
    }
    return !!this.synthesis?.speaking;
  }
}

