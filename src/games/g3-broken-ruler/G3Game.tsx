import React, { useState } from 'react';
import { Volume2, Check, ArrowRight, Ruler } from 'lucide-react';
import { g3Questions } from '../../data/questions';
import { ReflectionModal } from '../../components/ReflectionModal';
import { useGuidedScaffolding } from '../../hooks/useGuidedScaffolding';
import { soundFX } from '../../audio/soundFX';
import { tts } from '../../speech/tts';

interface G3GameProps {
  onFinishGame: (earnedStars: number) => void;
}

export const G3Game: React.FC<G3GameProps> = ({ onFinishGame }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const q = g3Questions[currentIdx];

  // 測量狀態
  const [userDiff, setUserDiff] = useState('');
  const [userRayEnd, setUserRayEnd] = useState<number>(q.objectStart);
  const [jumpSteps, setJumpSteps] = useState<number[]>([]);

  const scaleWidth = 48; // 每一公分 48px
  const targetLength = q.objectEnd - q.objectStart;

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
      if (currentIdx + 1 < g3Questions.length) {
        const nextQ = g3Questions[currentIdx + 1];
        setCurrentIdx((prev) => prev + 1);
        setUserDiff('');
        setUserRayEnd(nextQ.objectStart);
        setJumpSteps([]);
        resetScaffolding();
      } else {
        onFinishGame(3);
      }
    },
  });

  // 點擊刻度跳大格
  const handleJumpToMark = (mark: number) => {
    soundFX.playJump();
    if (!jumpSteps.includes(mark) && mark >= q.objectStart && mark <= q.objectEnd) {
      setJumpSteps((prev) => [...prev, mark].sort((a, b) => a - b));
    }
  };

  // 驗證答案
  const handleVerify = () => {
    if (q.mode === 'measure_diff') {
      const val = parseInt(userDiff, 10);
      // 若學童直讀右端刻度，立即精準阻斷
      if (val === q.objectEnd) {
        tts.speak(`注意看！緞帶左邊在刻度 ${q.objectStart}，不能直接看右邊的 ${q.objectEnd} 喔！`);
        handleMistake();
        return;
      }
      if (val === targetLength) {
        handleCorrect();
      } else {
        handleMistake();
      }
    } else if (q.mode === 'draw_line') {
      const drawnLength = userRayEnd - q.objectStart;
      if (drawnLength === q.targetDrawLength && userRayEnd === q.objectEnd) {
        handleCorrect();
      } else {
        handleMistake();
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 flex flex-col gap-6">
      {/* 關卡資訊與朗讀 */}
      <div className="bg-white rounded-3xl p-6 shadow-md border-3 border-amber-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-600 font-bold text-sm mb-1">
            <span>第 3 關：公分長度測量 (N-2-11)</span>
            <span>•</span>
            <span>第 {currentIdx + 1} / {g3Questions.length} 題</span>
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
            <span className="text-amber-700 font-black mr-2">【小精靈提示】：</span>
            {tier === 1 && q.scaffolding.tier1Perception}
            {tier === 2 && q.scaffolding.tier2Action}
            {tier === 3 && q.scaffolding.tier3Concept}
          </div>
        </div>
      )}

      {/* 斷尺與待測物體繪製區 (SVG) */}
      <div className="bg-white rounded-3xl p-6 shadow-md border-3 border-amber-100 flex flex-col items-center gap-4">
        <div className="w-full overflow-x-auto py-8 flex justify-center">
          <div
            className="relative"
            style={{ width: `${(q.rulerMax - q.rulerMin) * scaleWidth + 80}px` }}
          >
            {/* 待測物件（如彩色緞帶） */}
            {q.mode === 'measure_diff' && (
              <div
                className="absolute -top-8 h-8 bg-gradient-to-r from-pink-400 to-rose-400 rounded-xl border-2 border-pink-600 flex items-center justify-center text-xs text-white font-black shadow-md transition-all"
                style={{
                  left: `${(q.objectStart - q.rulerMin) * scaleWidth + 40}px`,
                  width: `${targetLength * scaleWidth}px`,
                }}
              >
                {q.objectName} (長度？)
              </div>
            )}

            {/* 逆向畫線模式：學童拖曳畫出的線段 */}
            {q.mode === 'draw_line' && (
              <div
                className="absolute -top-8 h-8 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-xl border-2 border-indigo-700 flex items-center justify-between px-2 text-xs text-white font-black shadow-md transition-all"
                style={{
                  left: `${(q.objectStart - q.rulerMin) * scaleWidth + 40}px`,
                  width: `${Math.max(1, userRayEnd - q.objectStart) * scaleWidth}px`,
                }}
              >
                <span>起點 7</span>
                <span>畫出 {userRayEnd - q.objectStart} 公分</span>
              </div>
            )}

            {/* 斷尺本體 SVG */}
            <svg
              className="w-full h-24 bg-gradient-to-b from-amber-100 to-yellow-100 border-4 border-amber-500 rounded-2xl shadow-inner select-none"
            >
              {/* 斷裂鋸齒紋理（若起點大於 0） */}
              {q.rulerMin > 0 && (
                <path
                  d="M 0 0 L 25 15 L 10 45 L 30 75 L 0 96 Z"
                  fill="#fef3c7"
                  stroke="#d97706"
                  strokeWidth="2"
                />
              )}

              {/* 刻度線與數字 */}
              {Array.from({ length: q.rulerMax - q.rulerMin + 1 }, (_, i) => {
                const mark = q.rulerMin + i;
                const x = i * scaleWidth + 40;
                const isMajor = mark % 5 === 0;

                return (
                  <g
                    key={mark}
                    className="cursor-pointer group"
                    onClick={() => {
                      if (q.mode === 'draw_line') {
                        soundFX.playClick();
                        setUserRayEnd(mark);
                      } else {
                        handleJumpToMark(mark);
                      }
                    }}
                  >
                    <line
                      x1={x}
                      y1="0"
                      x2={x}
                      y2={isMajor ? 40 : 25}
                      stroke="#92400e"
                      strokeWidth={isMajor ? 3 : 2}
                      className="group-hover:stroke-blue-600 transition-colors"
                    />
                    <text
                      x={x}
                      y="65"
                      textAnchor="middle"
                      fontSize="18"
                      fontWeight="bold"
                      fill="#78350f"
                      className="group-hover:fill-blue-600"
                    >
                      {mark}
                    </text>
                  </g>
                );
              })}

              {/* 跳格圓弧線展示 (Visual Scaffolding) */}
              {jumpSteps.map((step, idx) => {
                if (idx === 0) return null;
                const prevStep = jumpSteps[idx - 1];
                const x1 = (prevStep - q.rulerMin) * scaleWidth + 40;
                const x2 = (step - q.rulerMin) * scaleWidth + 40;
                const midX = (x1 + x2) / 2;
                return (
                  <path
                    key={idx}
                    d={`M ${x1} 15 Q ${midX} -10 ${x2} 15`}
                    fill="none"
                    stroke="#ec4899"
                    strokeWidth="3"
                    strokeDasharray="4 2"
                  />
                );
              })}
            </svg>
          </div>
        </div>

        {/* 提示點擊跳格 */}
        <div className="flex items-center gap-2 text-xs font-bold text-amber-800 bg-amber-50 px-4 py-2 rounded-xl border border-amber-200">
          <Ruler className="w-4 h-4 text-amber-600" />
          <span>
            {q.mode === 'draw_line'
              ? '點擊尺上的數字，將線段拉到指定的終點刻度！'
              : '提示：可以點擊尺上的刻度練習「跳大格數數」喔！'}
          </span>
        </div>
      </div>

      {/* 差量算式輸入區 (阻斷盲目填空) */}
      {q.mode === 'measure_diff' && (
        <div className="bg-white rounded-3xl p-6 shadow-md border-3 border-amber-100 flex flex-wrap items-center justify-center gap-3">
          <span className="text-xl font-black text-slate-700">{q.objectEnd} (終點)</span>
          <span className="text-2xl font-black text-red-500">-</span>
          <span className="text-xl font-black text-slate-700">{q.objectStart} (起點)</span>
          <span className="text-2xl font-black text-slate-700">=</span>
          <input
            type="number"
            value={userDiff}
            onChange={(e) => setUserDiff(e.target.value)}
            placeholder="幾"
            className="w-20 h-14 text-center text-3xl font-black text-amber-900 bg-amber-50 border-3 border-amber-400 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-300"
          />
          <span className="text-xl font-black text-slate-700">公分</span>
        </div>
      )}

      {/* 逆向推算算式區 */}
      {q.mode === 'draw_line' && (
        <div className="bg-white rounded-3xl p-6 shadow-md border-3 border-amber-100 flex flex-wrap items-center justify-center gap-3 text-lg font-black text-slate-700">
          <span>算式：起點 {q.objectStart} ＋ 想要畫的長度 {q.targetDrawLength} ＝ 終點刻度</span>
          <span className="text-2xl text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl border-2 border-indigo-200">
            {userRayEnd}
          </span>
        </div>
      )}

      {/* 送出驗證 */}
      <div className="flex justify-center mt-2">
        <button
          onClick={handleVerify}
          className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xl rounded-2xl shadow-lg border-2 border-amber-400 transition-transform active:scale-95"
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
