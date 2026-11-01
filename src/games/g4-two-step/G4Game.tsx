import React, { useState } from 'react';
import { Volume2, Check, ArrowRight, ShoppingCart, Scale } from 'lucide-react';
import { g4Questions } from '../../data/questions';
import { ReflectionModal } from '../../components/ReflectionModal';
import { useGuidedScaffolding } from '../../hooks/useGuidedScaffolding';
import { soundFX } from '../../audio/soundFX';
import { tts } from '../../speech/tts';

interface G4GameProps {
  onFinishGame: (earnedStars: number) => void;
}

export const G4Game: React.FC<G4GameProps> = ({ onFinishGame }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const q = g4Questions[currentIdx];

  // 兩步驟狀態
  const [step1Ans, setStep1Ans] = useState('');
  const [step2Ans, setStep2Ans] = useState('');
  const [isStep1Unlocked, setIsStep1Unlocked] = useState(false);
  const [budgetDecision, setBudgetDecision] = useState<'enough' | 'not_enough' | null>(null);

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
      if (currentIdx + 1 < g4Questions.length) {
        setCurrentIdx((prev) => prev + 1);
        setStep1Ans('');
        setStep2Ans('');
        setIsStep1Unlocked(false);
        setBudgetDecision(null);
        resetScaffolding();
      } else {
        onFinishGame(3);
      }
    },
  });

  // 驗證第一步中間量
  const handleVerifyStep1 = () => {
    const val = parseInt(step1Ans, 10);
    if (val === q.step1.expected) {
      soundFX.playSuccess();
      setIsStep1Unlocked(true);
      tts.speak(`太棒了！第一步算出來是 ${val}。現在可以進行第二步了！`);
    } else {
      handleMistake();
    }
  };

  // 驗證第二步終局解
  const handleVerifyStep2 = () => {
    if (q.scenarioType === 'budget_check' && q.budgetCheck) {
      const val = parseInt(step2Ans, 10);
      const isDecisionCorrect = budgetDecision === 'not_enough';
      if (isDecisionCorrect && val === q.budgetCheck.diff) {
        handleCorrect();
      } else {
        handleMistake();
      }
    } else {
      const val = parseInt(step2Ans, 10);
      if (val === q.step2.expected) {
        handleCorrect();
      } else {
        handleMistake();
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 flex flex-col gap-6">
      {/* 關卡資訊與朗讀 */}
      <div className="bg-white rounded-3xl p-6 shadow-md border-3 border-teal-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-600 font-bold text-sm mb-1">
            <span>第 4 關：兩步驟加減混合 (N-2-3)</span>
            <span>•</span>
            <span>第 {currentIdx + 1} / {g4Questions.length} 題</span>
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
            <span className="text-teal-700 font-black mr-2">【小精靈提示】：</span>
            {tier === 1 && q.scaffolding.tier1Perception}
            {tier === 2 && q.scaffolding.tier2Action}
            {tier === 3 && q.scaffolding.tier3Concept}
          </div>
        </div>
      )}

      {/* 條形圖 (Bar Model) 視覺鷹架展示 */}
      <div className="bg-white rounded-3xl p-6 shadow-md border-3 border-teal-100 flex flex-col items-center gap-4">
        <span className="font-black text-teal-900 text-sm flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 text-teal-600" />
          <span>思考鷹架：長條模型分析</span>
        </span>

        {/* 雙條形示意 */}
        <div className="w-full max-w-lg flex flex-col gap-2 py-2">
          <div className="flex items-center gap-2">
            <div className="w-24 text-right font-bold text-xs text-slate-500">第一步：</div>
            <div className="flex-1 flex h-10 rounded-xl overflow-hidden shadow-inner border border-teal-300">
              <div className="bg-teal-400 text-white font-black text-xs flex items-center justify-center flex-1">
                {q.step1.num1}
              </div>
              <div className="bg-indigo-400 text-white font-black text-xs flex items-center justify-center flex-1">
                {q.step1.num2}
              </div>
            </div>
            <div className="text-xs font-black text-teal-700 w-16">
              = {isStep1Unlocked ? q.step1.expected : '?'}
            </div>
          </div>
        </div>
      </div>

      {/* 分步解題區 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 第一步：中間量計算 */}
        <div className={`p-6 rounded-3xl border-3 shadow-md transition-all ${
          !isStep1Unlocked ? 'bg-white border-teal-300 shadow-teal-50' : 'bg-emerald-50/60 border-emerald-300'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className="font-black text-teal-900 text-base">{q.step1.label}</span>
            {isStep1Unlocked && <span className="text-xs bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full font-bold">已解鎖</span>}
          </div>

          <div className="flex items-center gap-3 text-2xl font-black text-slate-700 py-3">
            <span>{q.step1.num1}</span>
            <span className="text-teal-600">{q.step1.op}</span>
            <span>{q.step1.num2}</span>
            <span>=</span>
            <input
              type="number"
              disabled={isStep1Unlocked}
              value={step1Ans}
              onChange={(e) => setStep1Ans(e.target.value)}
              placeholder="幾"
              className="w-20 h-12 bg-teal-50 border-2 border-teal-400 rounded-xl text-center text-2xl font-black text-teal-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {!isStep1Unlocked && (
            <button
              onClick={handleVerifyStep1}
              className="mt-3 w-full py-2.5 bg-teal-500 hover:bg-teal-600 text-white font-black rounded-xl shadow active:scale-95 transition-transform"
            >
              完成第一步
            </button>
          )}
        </div>

        {/* 第二步：終局計算 (鎖定狀態) */}
        <div className={`p-6 rounded-3xl border-3 shadow-md transition-all ${
          isStep1Unlocked ? 'bg-white border-indigo-400' : 'bg-slate-50 border-slate-200 opacity-60'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className="font-black text-indigo-900 text-base">{q.step2.label}</span>
          </div>

          {/* 若為妹妹預算評估題 */}
          {q.scenarioType === 'budget_check' && q.budgetCheck ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-center gap-4 py-2">
                <button
                  disabled={!isStep1Unlocked}
                  onClick={() => {
                    soundFX.playClick();
                    setBudgetDecision('enough');
                  }}
                  className={`px-5 py-2.5 rounded-xl font-black text-lg border-2 shadow-sm transition-all ${
                    budgetDecision === 'enough'
                      ? 'bg-blue-600 text-white border-blue-800 scale-105'
                      : 'bg-white text-blue-700 border-blue-300'
                  }`}
                >
                  夠買
                </button>
                <button
                  disabled={!isStep1Unlocked}
                  onClick={() => {
                    soundFX.playClick();
                    setBudgetDecision('not_enough');
                  }}
                  className={`px-5 py-2.5 rounded-xl font-black text-lg border-2 shadow-sm transition-all ${
                    budgetDecision === 'not_enough'
                      ? 'bg-rose-600 text-white border-rose-800 scale-105'
                      : 'bg-white text-rose-700 border-rose-300'
                  }`}
                >
                  不夠買
                </button>
              </div>

              <div className="flex items-center gap-2 text-lg font-black text-slate-700">
                <span>相差幾元：</span>
                <input
                  type="number"
                  disabled={!isStep1Unlocked}
                  value={step2Ans}
                  onChange={(e) => setStep2Ans(e.target.value)}
                  placeholder="幾"
                  className="w-20 h-12 bg-indigo-50 border-2 border-indigo-400 rounded-xl text-center text-2xl font-black text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span>元</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-2xl font-black text-slate-700 py-3">
              <span>{q.step2.num1Custom ?? q.step1.expected}</span>
              <span className="text-indigo-600">{q.step2.op}</span>
              <span>{q.step2.num2}</span>
              <span>=</span>
              <input
                type="number"
                disabled={!isStep1Unlocked}
                value={step2Ans}
                onChange={(e) => setStep2Ans(e.target.value)}
                placeholder="幾"
                className="w-20 h-12 bg-indigo-50 border-2 border-indigo-400 rounded-xl text-center text-2xl font-black text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-base text-slate-500">{q.step2.unit}</span>
            </div>
          )}

          {isStep1Unlocked && (
            <button
              onClick={handleVerifyStep2}
              className="mt-3 w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow active:scale-95 transition-transform"
            >
              完成兩步驟結算
            </button>
          )}
        </div>
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
