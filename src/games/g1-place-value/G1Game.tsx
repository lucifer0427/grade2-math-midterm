import React, { useState } from 'react';
import { Volume2, Sparkles, Check } from 'lucide-react';
import { g1Questions } from '../../data/questions';
import { PlaceValueBoard } from '../../components/PlaceValueBoard';
import { ReflectionModal } from '../../components/ReflectionModal';
import { useGuidedScaffolding } from '../../hooks/useGuidedScaffolding';
import { soundFX } from '../../audio/soundFX';
import { tts } from '../../speech/tts';

interface G1GameProps {
  onFinishGame: (earnedStars: number) => void;
}

export const G1Game: React.FC<G1GameProps> = ({ onFinishGame }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const q = g1Questions[currentIdx];

  // 實體籌碼狀態
  const [hundreds, setHundreds] = useState(q.hundreds);
  const [tens, setTens] = useState(q.tens);
  const [ones, setOnes] = useState(q.ones);
  const [selectedSymbol, setSelectedSymbol] = useState<'>' | '<' | '=' | null>(null);
  const [skipInputs, setSkipInputs] = useState<string[]>(['', '']);

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
      if (currentIdx + 1 < g1Questions.length) {
        const nextQ = g1Questions[currentIdx + 1];
        setCurrentIdx((prev) => prev + 1);
        setHundreds(nextQ.hundreds);
        setTens(nextQ.tens);
        setOnes(nextQ.ones);
        setSelectedSymbol(null);
        setSkipInputs(['', '']);
        resetScaffolding();
      } else {
        onFinishGame(3);
      }
    },
  });

  // 10 個一元換 1 個十元
  const handleRegroupOnesToTen = () => {
    if (ones >= 10) {
      soundFX.playCoin();
      setOnes((prev) => prev - 10);
      setTens((prev) => prev + 1);
    } else {
      soundFX.playBounce();
      tts.speak('一元硬幣要有 10 個才能換成 1 個十元喔！');
    }
  };

  // 10 個十元換 1 張百元
  const handleRegroupTensToHundred = () => {
    if (tens >= 10) {
      soundFX.playCoin();
      setTens((prev) => prev - 10);
      setHundreds((prev) => prev + 1);
    } else {
      soundFX.playBounce();
      tts.speak('十元硬幣要有 10 個才能換成 1 張百元鈔票喔！');
    }
  };

  // 檢查答案
  const handleVerify = () => {
    if (q.mode === 'regroup') {
      const currentTotal = hundreds * 100 + tens * 10 + ones;
      // 必須化聚為最少枚數 (ones < 10 && tens < 10)
      if (currentTotal === q.targetAmount && ones < 10 && (tens < 10 || hundreds > 0)) {
        handleCorrect();
      } else {
        handleMistake();
      }
    } else if (q.mode === 'compare' && q.compareTarget) {
      const myAmount = hundreds * 100 + tens * 10 + ones;
      const target = q.compareTarget.amount;
      const correctSym = myAmount > target ? '>' : myAmount < target ? '<' : '=';

      if (selectedSymbol === correctSym) {
        handleCorrect();
      } else {
        handleMistake();
      }
    } else if (q.mode === 'skip_count' && q.skipCount) {
      const userNums = skipInputs.map((s) => parseInt(s, 10));
      const isAllCorrect = userNums.every((val, i) => val === q.skipCount?.correctAnswers[i]);
      if (isAllCorrect) {
        handleCorrect();
      } else {
        handleMistake();
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 flex flex-col gap-6">
      {/* 關卡進度與題幹語音 */}
      <div className="bg-white rounded-3xl p-6 shadow-md border-3 border-indigo-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm mb-1">
            <span>第 1 關：200以內的數 (N-2-1)</span>
            <span>•</span>
            <span>第 {currentIdx + 1} / {g1Questions.length} 題</span>
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

      {/* 蘇格拉底即時思維鷹架提示 */}
      {tier > 0 && (
        <div className="p-4 bg-amber-50 border-3 border-amber-400 rounded-2xl text-amber-900 font-bold flex items-center gap-3 animate-bounce">
          <span className="text-2xl">🧙‍♂️</span>
          <div className="flex-1 text-base">
            <span className="text-indigo-700 font-black mr-2">【小精靈提示】：</span>
            {tier === 1 && q.scaffolding.tier1Perception}
            {tier === 2 && q.scaffolding.tier2Action}
            {tier === 3 && q.scaffolding.tier3Concept}
          </div>
        </div>
      )}

      {/* 具象操作工作區 (CPA - Concrete) */}
      {q.mode === 'regroup' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* 錢幣實體教具槽 */}
          <div className="bg-amber-50/70 border-4 border-amber-200 rounded-3xl p-5 flex flex-col gap-4 shadow-inner">
            <div className="font-black text-amber-900 text-base sm:text-lg flex items-center justify-between">
              <span>🪙 阿翰的零錢托盤</span>
              <span className="text-xs text-amber-700">滿10個點擊按鈕化聚！</span>
            </div>

            {/* 百元鈔區 */}
            <div className="bg-white/80 p-3 rounded-2xl border-2 border-emerald-200">
              <div className="text-xs font-black text-emerald-700 mb-2">百元鈔票（100元）：{hundreds} 張</div>
              <div className="flex flex-wrap gap-2 min-h-12 items-center">
                {Array.from({ length: hundreds }).map((_, i) => (
                  <div key={i} className="px-3 py-1.5 bg-emerald-500 text-white font-black text-sm rounded shadow border border-emerald-600 animate-pop">
                    100
                  </div>
                ))}
                {hundreds === 0 && <span className="text-xs text-slate-400">目前沒有百元鈔</span>}
              </div>
            </div>

            {/* 十元幣區 */}
            <div className="bg-white/80 p-3 rounded-2xl border-2 border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-blue-700">十元硬幣（10元）：{tens} 枚</span>
                {tens >= 10 && (
                  <button
                    onClick={handleRegroupTensToHundred}
                    className="px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-1 active:scale-95 animate-pulse"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>滿10個換百元鈔！</span>
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2 min-h-12 items-center">
                {Array.from({ length: tens }).map((_, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-blue-500 text-white font-black text-xs flex items-center justify-center shadow border border-blue-600">
                    10
                  </div>
                ))}
                {tens === 0 && <span className="text-xs text-slate-400">目前沒有十元硬幣</span>}
              </div>
            </div>

            {/* 一元幣區 */}
            <div className="bg-white/80 p-3 rounded-2xl border-2 border-rose-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-rose-700">一元硬幣（1元）：{ones} 枚</span>
                {ones >= 10 && (
                  <button
                    onClick={handleRegroupOnesToTen}
                    className="px-3 py-1 bg-gradient-to-r from-rose-500 to-amber-500 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-1 active:scale-95 animate-pulse"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>滿10個換十元硬幣！</span>
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 min-h-12 items-center">
                {Array.from({ length: ones }).map((_, i) => (
                  <div key={i} className="w-6 h-6 rounded-full bg-rose-400 text-white font-black text-[10px] flex items-center justify-center shadow border border-rose-500">
                    1
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 定位板 (CPA - Pictorial & Abstract) */}
          <PlaceValueBoard
            hundreds={hundreds}
            tens={tens}
            ones={ones}
            showZeroPrompt={tens === 0}
          />
        </div>
      )}

      {/* 比大小天平模式 */}
      {q.mode === 'compare' && q.compareTarget && (
        <div className="bg-white rounded-3xl p-6 shadow-md border-3 border-indigo-100 flex flex-col items-center gap-6">
          <div className="grid grid-cols-3 items-center gap-4 w-full max-w-xl text-center">
            {/* 阿翰的金額 */}
            <div className="p-4 bg-indigo-50 border-3 border-indigo-300 rounded-2xl shadow-sm">
              <div className="font-black text-indigo-700 text-sm mb-1">阿翰的存款</div>
              <div className="text-3xl font-black text-indigo-900">{hundreds * 100 + tens * 10 + ones} 元</div>
              <div className="text-xs text-slate-500 mt-1">
                (1百、{tens}十、{ones}一)
              </div>
            </div>

            {/* 符號選擇天平槽 */}
            <div className="flex flex-col items-center justify-center gap-2">
              <span className="text-sm font-black text-slate-500">放上比較符號</span>
              <div className="w-20 h-20 rounded-2xl border-4 border-dashed border-purple-400 flex items-center justify-center text-4xl font-black text-purple-700 bg-purple-50 shadow-inner">
                {selectedSymbol || '?'}
              </div>
            </div>

            {/* 小婷的金額 */}
            <div className="p-4 bg-pink-50 border-3 border-pink-300 rounded-2xl shadow-sm">
              <div className="font-black text-pink-700 text-sm mb-1">小婷的存款</div>
              <div className="text-3xl font-black text-pink-900">{q.compareTarget.amount} 元</div>
              <div className="text-xs text-slate-500 mt-1">
                ({q.compareTarget.hundreds}百、{q.compareTarget.tens}十、{q.compareTarget.ones}一)
              </div>
            </div>
          </div>

          {/* 符號按鈕庫 */}
          <div className="flex gap-4">
            {(['>', '<', '='] as const).map((sym) => (
              <button
                key={sym}
                onClick={() => {
                  soundFX.playClick();
                  setSelectedSymbol(sym);
                }}
                className={`w-16 h-16 rounded-2xl font-black text-3xl border-3 shadow-md transition-all active:scale-95 ${
                  selectedSymbol === sym
                    ? 'bg-purple-600 text-white border-purple-800 scale-105'
                    : 'bg-white text-purple-700 border-purple-300 hover:bg-purple-50'
                }`}
              >
                {sym}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 跳數火車模式 */}
      {q.mode === 'skip_count' && q.skipCount && (
        <div className="bg-white rounded-3xl p-6 shadow-md border-3 border-indigo-100 flex flex-col items-center gap-6">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="text-3xl">🚂</span>
            {q.skipCount.sequence.map((val, idx) => {
              if (val !== null) {
                return (
                  <div key={idx} className="w-16 sm:w-20 h-16 sm:h-20 bg-indigo-50 border-3 border-indigo-300 rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-black text-indigo-900 shadow-sm">
                    {val}
                  </div>
                );
              }
              const inputIdx = idx === 2 ? 0 : 1;
              return (
                <input
                  key={idx}
                  type="number"
                  value={skipInputs[inputIdx]}
                  onChange={(e) => {
                    const newInputs = [...skipInputs];
                    newInputs[inputIdx] = e.target.value;
                    setSkipInputs(newInputs);
                  }}
                  placeholder="?"
                  className="w-16 sm:w-20 h-16 sm:h-20 bg-amber-50 border-4 border-amber-400 rounded-2xl text-center text-xl sm:text-2xl font-black text-amber-900 shadow-inner focus:outline-none focus:ring-4 focus:ring-amber-300"
                />
              );
            })}
          </div>
        </div>
      )}

      {/* 送出驗證按鈕 */}
      <div className="flex justify-center mt-2">
        <button
          onClick={handleVerify}
          className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xl rounded-2xl shadow-lg border-2 border-emerald-400 transition-transform active:scale-95"
        >
          <Check className="w-6 h-6" />
          <span>送出答案</span>
        </button>
      </div>

      {/* 後設認知反思彈窗 */}
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
