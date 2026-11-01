import { useState } from 'react';
import { SocraticScaffolding } from '../types/question';
import { soundFX } from '../audio/soundFX';
import { tts } from '../speech/tts';

export type ScaffoldTier = 0 | 1 | 2 | 3;

interface UseGuidedScaffoldingProps {
  scaffolding: SocraticScaffolding;
  onSuccess: () => void;
}

export const useGuidedScaffolding = ({ scaffolding, onSuccess }: UseGuidedScaffoldingProps) => {
  const [tier, setTier] = useState<ScaffoldTier>(0);
  const [showReflection, setShowReflection] = useState(false);
  const [reflectionSelected, setReflectionSelected] = useState<number | null>(null);
  const [reflectionError, setReflectionError] = useState(false);

  // 學童操作偏誤時觸發
  const handleMistake = () => {
    soundFX.playBounce(); // 溫柔回彈音
    const nextTier = Math.min(tier + 1, 3) as ScaffoldTier;
    setTier(nextTier);

    let prompt = '';
    if (nextTier === 1) prompt = scaffolding.tier1Perception;
    else if (nextTier === 2) prompt = scaffolding.tier2Action;
    else if (nextTier === 3) prompt = scaffolding.tier3Concept;

    tts.speak(prompt);
  };

  // 學童答對時觸發，開啟後設認知反思
  const handleCorrect = () => {
    soundFX.playSuccess();
    setShowReflection(true);
    setReflectionSelected(null);
    setReflectionError(false);
    tts.speak(`太棒了！想一想：${scaffolding.reflection.question}`);
  };

  // 提交後設認知反思答案
  const submitReflection = (optionIndex: number) => {
    setReflectionSelected(optionIndex);
    if (optionIndex === scaffolding.reflection.correctIndex) {
      soundFX.playUnlockBadge();
      setReflectionError(false);
      tts.speak(`答對了！${scaffolding.reflection.explanation}`);
      setTimeout(() => {
        setShowReflection(false);
        onSuccess();
      }, 1800);
    } else {
      soundFX.playBounce();
      setReflectionError(true);
      tts.speak('再仔細想一想剛才的動作喔！');
    }
  };

  const resetScaffolding = () => {
    setTier(0);
    setShowReflection(false);
    setReflectionSelected(null);
    setReflectionError(false);
  };

  return {
    tier,
    handleMistake,
    handleCorrect,
    showReflection,
    reflectionSelected,
    reflectionError,
    submitReflection,
    resetScaffolding,
  };
};
