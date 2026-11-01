/**
 * 原生 Web Speech API 語音朗讀模組
 * 專為低年級學童識字輔助與引導式蘇格拉底提問設計
 */

class TextToSpeech {
  private isEnabled: boolean = true;
  private selectedVoice: SpeechSynthesisVoice | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.initVoice();
      window.speechSynthesis.onvoiceschanged = () => this.initVoice();
    }
  }

  private initVoice() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();
    // 優先尋找臺灣繁體中文 (zh-TW)，若無則退回任意繁體或中文
    const twVoice = voices.find(v => v.lang === 'zh-TW' || v.lang === 'cmn-Hant-TW');
    const zhVoice = voices.find(v => v.lang.startsWith('zh'));
    this.selectedVoice = twVoice || zhVoice || null;
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (!enabled) {
      this.stop();
    }
  }

  public getEnabled(): boolean {
    return this.isEnabled;
  }

  public speak(text: string, onEnd?: () => void) {
    if (!this.isEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }

    // 取消當前未播完的語音
    window.speechSynthesis.cancel();

    // 清除特殊 LaTeX 符號以確保自然口語播報
    const cleanText = text
      .replace(/\\times/g, '乘以')
      .replace(/\\implies/g, '所以')
      .replace(/\\text\{([^}]+)\}/g, '$1')
      .replace(/[\$\\\[\]]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }
    utterance.lang = 'zh-TW';
    utterance.rate = 0.92; // 稍微放慢語速，貼合 7-8 歲學童聽覺理解
    utterance.pitch = 1.1; // 輕快親切的女聲/小精靈聲調

    utterance.onend = () => {
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  }

  public stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const tts = new TextToSpeech();
