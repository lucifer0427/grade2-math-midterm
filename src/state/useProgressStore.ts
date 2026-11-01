import { useState, useEffect } from 'react';
import { GameId } from '../types/question';

export interface GameProgress {
  stars: Record<GameId, number>; // 0 ~ 3 星
  unlockedBadges: string[];      // 獲得的思維徽章 ID
  soundMuted: boolean;
  ttsEnabled: boolean;
}

const STORAGE_KEY = 'grade2_math_midterm_progress_v1';

const defaultProgress: GameProgress = {
  stars: {
    g1: 0,
    g2: 0,
    g3: 0,
    g4: 0,
    g5: 0,
  },
  unlockedBadges: [],
  soundMuted: false,
  ttsEnabled: true,
};

export const useProgressStore = () => {
  const [progress, setProgress] = useState<GameProgress>(() => {
    if (typeof window === 'undefined') return defaultProgress;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : defaultProgress;
    } catch {
      return defaultProgress;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
      console.error('Failed to save game progress', e);
    }
  }, [progress]);

  const updateStars = (gameId: GameId, stars: number) => {
    setProgress((prev) => ({
      ...prev,
      stars: {
        ...prev.stars,
        [gameId]: Math.max(prev.stars[gameId] || 0, stars),
      },
    }));
  };

  const unlockBadge = (badgeId: string) => {
    setProgress((prev) => {
      if (prev.unlockedBadges.includes(badgeId)) return prev;
      return {
        ...prev,
        unlockedBadges: [...prev.unlockedBadges, badgeId],
      };
    });
  };

  const toggleSound = () => {
    setProgress((prev) => ({ ...prev, soundMuted: !prev.soundMuted }));
  };

  const toggleTTS = () => {
    setProgress((prev) => ({ ...prev, ttsEnabled: !prev.ttsEnabled }));
  };

  const resetAllProgress = () => {
    setProgress(defaultProgress);
  };

  return {
    progress,
    updateStars,
    unlockBadge,
    toggleSound,
    toggleTTS,
    resetAllProgress,
  };
};
