import React, { useState } from 'react';
import { Volume2, Hammer, Check, ShieldAlert } from 'lucide-react';
import { g2Questions } from '../../data/questions';
import { ReflectionModal } from '../../components/ReflectionModal';
import { useGuidedScaffolding } from '../../hooks/useGuidedScaffolding';
import { soundFX } from '../../audio/soundFX';
import { tts } from '../../speech/tts';

interface G2GameProps {
  onFinishGame: (earnedStars: number) => void;
}

export const G2Game: React.FC<G2GameProps> = ({ onFinishGame }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const q = g2Questions[currentIdx];

  // 算則狀態
  const [hasRegrouped, setHasRegrouped] = useState(false); // 是否已破十退位
  const [userAnsTens, setUserAnsTens] = useState('');
  const [userAnsOnes, setUserAnsOnes] = useState('');
  const [stainJia, setStainJia] = useState('');
  const [stainYi, setStainYi] = useState('');
  const [selectedBugIdx, setSelectedBugIdx] = useState<number | null>(null);

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
      if (currentIdx + 1 < g2Questions.length) {
        setCurrentIdx((prev) => prev + 1);
        setHasRegrouped(false);
        setUserAnsTens('');
        setUserAnsOnes('');
        setStainJia('');
        setStainYi('');
        setSelectedBugIdx(null);
        resetScaffolding();
      } else {
        onFinishGame(3);
      }
    },
  });

  // 敲碎十位（破十借位）
  const handleBreakTen = () => {
    soundFX.playShatter();
    setHasRegrouped(true);
    tts.speak('十位借出 1 個十，個位多了 10！現在可以相減了！');
  };

  // 答案驗證
  const handleVerify = () => {
    if (q.mode === 'vertical') {
      const isSubtraction = q.operation === '-';
      const num1Ones = q.num1 % 10;
      const num2Ones = q.num2 % 10;
      const needsRegroup = isSubtraction && num1Ones < num2Ones;

      // 若需要退位但學童沒按破十槌，直接觸發引導阻斷反轉
      if (needsRegroup && !hasRegrouped) {
        soundFX.playBounce();
        tts.speak('個位不夠減！請先點擊十位敲碎硬幣借位喔！');
        handleMistake();
        return;
      }

      const expectedAns = isSubtraction ? q.num1 - q.num2 : q.num1 + q.num2;
      const userTotal = parseInt(userAnsTens || '0', 10) * 10 + parseInt(userAnsOnes || '0', 10);

      if (userTotal === expectedAns) {
        handleCorrect();
      } else {
        handleMistake();
      }
    } else if (q.mode === 'stain_puzzle') {
      const jiaVal = parseInt(stainJia, 10);
      const yiVal = parseInt(stainYi, 10);
      if (jiaVal === 6 && yiVal === 5) {
        handleCorrect();
      } else {
        handleMistake();
      }
    } else if (q.mode === 'bug_buster' && q.bugBuster) {
      if (selectedBugIdx === q.bugBuster.correctOptionIndex) {
        handleCorrect();
      } else {
        handleMistake();
      }
    }
  };

  const num1Tens = Math.floor(q.num1 / 10);
  const num1Ones = q.num1 % 10;
  const num2Tens = Math.floor(q.num2 / 10);
  const num2Ones = q.num2 % 10;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 flex flex-col gap-6">
      {/* 關卡資訊與朗讀 */}
      <div className="bg-white rounded-3xl p-6 shadow-md border-3 border-blue-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 font-bold text-sm mb-1">
            <span>第 2 關：二位數加減法 (N-2-2)</span>
            <span>•</span>
            <span>第 {currentIdx + 1} / {g2Questions.length} 題</span>
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
            <span className="text-blue-700 font-black mr-2">【小精靈提示】：</span>
            {tier === 1 && q.scaffolding.tier1Perception}
            {tier === 2 && q.scaffolding.tier2Action}
            {tier === 3 && q.scaffolding.tier3Concept}
          </div>
        </div>
      )}

      {/* 模式 A：標準二位數直式計算 */}
      {q.mode === 'vertical' && (
        <div className="bg-white rounded-3xl p-6 shadow-md border-3 border-blue-100 flex flex-col items-center gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-8">
            {/* 實體破十槌輔助器 */}
            {q.operation === '-' && num1Ones < num2Ones && (
              <div className="flex flex-col items-center gap-3 bg-blue-50/70 p-4 rounded-3xl border-3 border-blue-200">
                <span className="text-sm font-black text-blue-900">個位 {num1Ones} 不夠減 {num2Ones}！</span>
                <button
                  onClick={handleBreakTen}
                  disabled={hasRegrouped}
                  className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-base shadow-md transition-all active:scale-95 ${
                    !hasRegrouped
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white animate-pulse'
                      : 'bg-emerald-100 text-emerald-800 border-2 border-emerald-300'
                  }`}
                >
                  <Hammer className="w-5 h-5" />
                  <span>{hasRegrouped ? '已完成破十拆碎！' : '點擊敲碎十位借 10！'}</span>
                </button>
              </div>
            )}

            {/* 直式黑板 */}
            <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl border-4 border-slate-700 w-64 select-none font-mono">
              <div className="flex justify-between items-center text-slate-400 text-xs border-b border-slate-700 pb-1 mb-2 font-sans font-bold">
                <span>十位</span>
                <span>個位</span>
              </div>

              {/* 退位記號區 */}
              <div className="h-6 flex justify-between text-xs text-amber-400 font-bold px-2">
                {hasRegrouped && (
                  <>
                    <span className="line-through text-red-400">{num1Tens}</span>
                    <span>{num1Tens - 1}</span>
                    <span className="ml-auto bg-amber-500 text-slate-900 px-1 rounded font-black">+10</span>
                  </>
                )}
              </div>

              {/* 被減數 / 被加數 */}
              <div className="flex justify-between text-3xl font-black px-2 tracking-widest">
                <span>{hasRegrouped ? num1Tens - 1 : num1Tens}</span>
                <span>{hasRegrouped ? num1Ones + 10 : num1Ones}</span>
              </div>

              {/* 減數 / 加數 */}
              <div className="flex justify-between items-center text-3xl font-black px-2 tracking-widest mt-1 border-b-4 border-white pb-2">
                <span className="text-amber-400 font-sans text-2xl">{q.operation}</span>
                <span>{num2Tens}</span>
                <span>{num2Ones}</span>
              </div>

              {/* 計算結果輸入區 */}
              <div className="flex justify-end gap-2 mt-3 px-1">
                <input
                  type="number"
                  value={userAnsTens}
                  onChange={(e) => setUserAnsTens(e.target.value)}
                  placeholder="?"
                  className="w-12 h-14 bg-slate-800 border-2 border-blue-400 rounded-xl text-center text-3xl font-black text-amber-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <input
                  type="number"
                  value={userAnsOnes}
                  onChange={(e) => setUserAnsOnes(e.target.value)}
                  placeholder="?"
                  className="w-12 h-14 bg-slate-800 border-2 border-rose-400 rounded-xl text-center text-3xl font-black text-amber-300 focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 模式 B：墨水污漬大破譯 */}
      {q.mode === 'stain_puzzle' && (
        <div className="bg-white rounded-3xl p-6 shadow-md border-3 border-blue-100 flex flex-col items-center gap-6">
          <div className="bg-amber-50 p-6 rounded-3xl border-4 border-amber-300 shadow-inner flex flex-col items-center">
            <span className="text-amber-800 font-black text-sm mb-3">🪶 墨水遮住了兩個神秘數字</span>

            <div className="bg-white p-5 rounded-2xl border-3 border-amber-200 text-3xl font-black font-mono tracking-widest flex flex-col gap-2">
              <div className="flex justify-end items-center gap-4">
                <span className="bg-purple-200 text-purple-900 px-3 py-1 rounded-lg border-2 border-purple-400">甲</span>
                <span>3</span>
              </div>
              <div className="flex justify-end items-center gap-4 border-b-4 border-slate-800 pb-2">
                <span className="font-sans text-red-500">-</span>
                <span>2</span>
                <span className="bg-pink-200 text-pink-900 px-3 py-1 rounded-lg border-2 border-pink-400">乙</span>
              </div>
              <div className="flex justify-end items-center gap-4 pt-1 text-emerald-600">
                <span>3</span>
                <span>8</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
            <div className="p-4 bg-pink-50 border-3 border-pink-300 rounded-2xl flex items-center justify-between">
              <span className="font-black text-pink-900 text-lg">個位［乙］是多少？</span>
              <input
                type="number"
                value={stainYi}
                onChange={(e) => setStainYi(e.target.value)}
                placeholder="?"
                className="w-16 h-12 bg-white border-2 border-pink-400 rounded-xl text-center text-2xl font-black text-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div className="p-4 bg-purple-50 border-3 border-purple-300 rounded-2xl flex items-center justify-between">
              <span className="font-black text-purple-900 text-lg">十位［甲］是多少？</span>
              <input
                type="number"
                value={stainJia}
                onChange={(e) => setStainJia(e.target.value)}
                placeholder="?"
                className="w-16 h-12 bg-white border-2 border-purple-400 rounded-xl text-center text-2xl font-black text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* 模式 C：抓蟲特工模式 */}
      {q.mode === 'bug_buster' && q.bugBuster && (
        <div className="bg-white rounded-3xl p-6 shadow-md border-3 border-blue-100 flex flex-col items-center gap-6">
          <div className="p-5 bg-red-50 border-3 border-red-300 rounded-2xl flex items-center gap-4 max-w-md w-full">
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center text-3xl border-2 border-red-300 shrink-0">
              👾
            </div>
            <div>
              <div className="text-xs text-red-600 font-bold">糊塗怪獸的算式</div>
              <div className="text-2xl font-black text-red-900">52 - 27 = {q.bugBuster.wrongAnswer}</div>
              <div className="text-xs text-slate-500 font-bold mt-1">這道題目藏著一個嚴重的算則漏洞！</div>
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full max-w-lg">
            <span className="text-sm font-black text-slate-700 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-red-500" />
              <span>請特工指出他的漏洞在哪裡：</span>
            </span>

            {q.bugBuster.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => {
                  soundFX.playClick();
                  setSelectedBugIdx(idx);
                }}
                className={`p-4 text-left font-bold text-base rounded-2xl border-3 transition-all ${
                  selectedBugIdx === idx
                    ? 'bg-blue-100 border-blue-500 text-blue-900 shadow-md scale-[1.01]'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 送出驗證 */}
      <div className="flex justify-center mt-2">
        <button
          onClick={handleVerify}
          className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-black text-xl rounded-2xl shadow-lg border-2 border-blue-400 transition-transform active:scale-95"
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
