import React, { useState } from 'react';
import { Volume2, Check, ArrowRight, Compass, RotateCcw } from 'lucide-react';
import { g5Questions } from '../../data/questions';
import { ReflectionModal } from '../../components/ReflectionModal';
import { useGuidedScaffolding } from '../../hooks/useGuidedScaffolding';
import { soundFX } from '../../audio/soundFX';
import { tts } from '../../speech/tts';

interface G5GameProps {
  onFinishGame: (earnedStars: number) => void;
}

export const G5Game: React.FC<G5GameProps> = ({ onFinishGame }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const q = g5Questions[currentIdx];

  // 幾何工具檢驗狀態
  const [testedCorners, setTestedCorners] = useState<number[]>([]); // 已用 L 規檢驗的角 index [0, 1, 2, 3]
  const [hasMeasuredSides, setHasMeasuredSides] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  // 引導式鷹架 Hook
  const {
    tier,
    handleMistake,
    handleCorrect,
    showReflection,
    reflectionSelected,
    reflectionError,
    submitReflection,
    resetScaffolding,
  } = useGuidedScaffolding({
    scaffolding: q.scaffolding,
    onSuccess: () => {
      if (currentIdx + 1 < g5Questions.length) {
        setCurrentIdx((prev) => prev + 1);
        setTestedCorners([]);
        setHasMeasuredSides(false);
        setSelectedAnswer(null);
        resetScaffolding();
      } else {
        onFinishGame(3);
      }
    },
  });

  // 用 L 規檢驗角
  const handleTestCorner = (cornerIdx: number) => {
    soundFX.playLock();
    if (!testedCorners.includes(cornerIdx)) {
      setTestedCorners((prev) => [...prev, cornerIdx]);
    }
  };

  // 用尺量測四邊
  const handleMeasureSides = () => {
    soundFX.playClick();
    setHasMeasuredSides(true);
    tts.speak('四條邊都量好了！看看它們長度有沒有一樣？');
  };

  // 驗證答案
  const handleVerify = () => {
    if (selectedAnswer === q.correctAnswer) {
      handleCorrect();
    } else {
      handleMistake();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 flex flex-col gap-6">
      {/* 關卡資訊與朗讀 */}
      <div className="bg-white rounded-3xl p-6 shadow-md border-3 border-purple-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-600 font-bold text-sm mb-1">
            <span>第 5 關：平面圖形與直線 (S-2-1)</span>
            <span>•</span>
            <span>第 {currentIdx + 1} / {g5Questions.length} 題</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800">{q.title}</h2>
          <p className="text-slate-600 font-bold mt-2 text-base sm:text-lg">{q.storyPrompt}</p>
        </div>

        <button
          onClick={() => {
            soundFX.playClick();
            tts.speak(q.speechText);
          }}
          className="flex items-center gap-2 px-5 py-3 bg-amber-100 hover:bg-amber-200 text-amber-800 font-black rounded-2xl border-2 border-amber-300 shadow-sm transition-transform active:scale-95 shrink-0"
        >
          <Volume2 className="w-5 h-5 text-amber-600" />
          <span>朗讀題目</span>
        </button>
      </div>

      {/* 蘇格拉底提示 */}
      {tier > 0 && (
        <div className="p-4 bg-amber-50 border-3 border-amber-400 rounded-2xl text-amber-900 font-bold flex items-center gap-3 animate-bounce">
          <span className="text-2xl">🧙‍♂️</span>
          <div className="flex-1 text-base">
            <span className="text-purple-700 font-black mr-2">【小精靈提示】：</span>
            {tier === 1 && q.scaffolding.tier1Perception}
            {tier === 2 && q.scaffolding.tier2Action}
            {tier === 3 && q.scaffolding.tier3Concept}
          </div>
        </div>
      )}

      {/* 幾何檢驗實驗室 (旋轉圖形與工具互動) */}
      <div className="bg-white rounded-3xl p-8 shadow-md border-3 border-purple-100 flex flex-col items-center gap-6">
        <div className="flex gap-3">
          <button
            onClick={handleMeasureSides}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-sm border-2 shadow-sm transition-all active:scale-95 ${
              hasMeasuredSides
                ? 'bg-emerald-100 border-emerald-400 text-emerald-800'
                : 'bg-purple-100 hover:bg-purple-200 border-purple-300 text-purple-800'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>{hasMeasuredSides ? '✅ 已量測四邊長度' : '拿直尺測量邊長'}</span>
          </button>
        </div>

        {/* 圖形畫布 */}
        <div className="relative w-72 h-72 flex items-center justify-center bg-purple-50/50 rounded-3xl border-2 border-dashed border-purple-300 select-none">
          {/* 旋轉圖形 */}
          <div
            className="relative border-4 border-indigo-600 bg-indigo-100/70 shadow-lg transition-transform"
            style={{
              width: q.shapeType === 'rectangle' ? '180px' : '140px',
              height: '140px',
              transform: `rotate(${q.rotationDeg}deg)`,
            }}
          >
            {/* 邊長標註 (測量後顯示) */}
            {hasMeasuredSides && (
              <>
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-black text-indigo-900 bg-white px-1.5 py-0.5 rounded shadow">
                  {q.sides[0]} cm
                </span>
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-black text-indigo-900 bg-white px-1.5 py-0.5 rounded shadow">
                  {q.sides[2]} cm
                </span>
                <span className="absolute top-1/2 -left-8 -translate-y-1/2 text-xs font-black text-indigo-900 bg-white px-1.5 py-0.5 rounded shadow">
                  {q.sides[3]} cm
                </span>
                <span className="absolute top-1/2 -right-8 -translate-y-1/2 text-xs font-black text-indigo-900 bg-white px-1.5 py-0.5 rounded shadow">
                  {q.sides[1]} cm
                </span>
              </>
            )}

            {/* 四個角點擊卡入 L 規 */}
            {[
              { id: 0, pos: 'top-1 left-1' },
              { id: 1, pos: 'top-1 right-1' },
              { id: 2, pos: 'bottom-1 right-1' },
              { id: 3, pos: 'bottom-1 left-1' },
            ].map((c) => {
              const isTested = testedCorners.includes(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => handleTestCorner(c.id)}
                  title="點擊拿 L 型量規卡入檢驗直角"
                  className={`absolute ${c.pos} w-7 h-7 rounded flex items-center justify-center text-xs font-black transition-all ${
                    isTested
                      ? 'bg-amber-400 text-slate-900 border-2 border-amber-600 shadow'
                      : 'bg-white/80 hover:bg-amber-200 border border-slate-400 text-slate-600 animate-pulse'
                  }`}
                >
                  {isTested ? '∟' : 'L?'}
                </button>
              );
            })}
          </div>
        </div>

        <div className="text-xs text-slate-500 font-bold">
          提示：點擊圖形四個角上的「L?」按鈕，拿出 L 型直角量規檢驗角度！
        </div>

        {/* 診斷選項按鈕 */}
        {q.options && (
          <div className="grid grid-cols-2 gap-3 w-full max-w-md">
            {q.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => {
                  soundFX.playClick();
                  setSelectedAnswer(opt);
                }}
                className={`p-3.5 rounded-2xl font-black text-base border-3 transition-all ${
                  selectedAnswer === opt
                    ? 'bg-purple-600 text-white border-purple-800 scale-102 shadow-md'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 送出答案 */}
      <div className="flex justify-center mt-2">
        <button
          onClick={handleVerify}
          className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-black text-xl rounded-2xl shadow-lg border-2 border-purple-400 transition-transform active:scale-95"
        >
          <Check className="w-6 h-6" />
          <span>送出答案</span>
        </button>
      </div>

      {/* 後設反思卡 */}
      <ReflectionModal
        isOpen={showReflection}
        question={q.scaffolding.reflection.question}
        options={q.scaffolding.reflection.options}
        correctIndex={q.scaffolding.reflection.correctIndex}
        selectedIndex={reflectionSelected}
        hasError={reflectionError}
        onSelectOption={submitReflection}
      />
    </div>
  );
};
