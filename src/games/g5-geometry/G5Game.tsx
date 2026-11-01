import React, { useState } from 'react';
import { Volume2, Check, Compass, Ruler, AlertCircle } from 'lucide-react';
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
  const [cornerTestFeedback, setCornerTestFeedback] = useState<string | null>(null);

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
        setCornerTestFeedback(null);
        resetScaffolding();
      } else {
        onFinishGame(3);
      }
    },
  });

  // 用 L 規檢驗角
  const handleTestCorner = (cornerIdx: number) => {
    const isRightAngle = q.shapeType === 'square' || q.shapeType === 'rectangle';

    if (isRightAngle) {
      soundFX.playLock();
      tts.speak('量規完全密合！這是標準直角！');
      setCornerTestFeedback('✅ L型量規完全密合！這個角是標準直角（90度）！');
    } else {
      soundFX.playBounce();
      tts.speak('哎呀！角不是直角，斜斜的！L型量規無法密合！');
      setCornerTestFeedback('❌ 角不是直角，斜斜的！L型直角量規無法密合！');
    }

    if (!testedCorners.includes(cornerIdx)) {
      setTestedCorners((prev) => [...prev, cornerIdx]);
    }
  };

  // 用尺量測邊長
  const handleMeasureSides = () => {
    soundFX.playClick();
    setHasMeasuredSides(true);
    if (q.shapeType === 'rhombus') {
      tts.speak('四條邊都是5公分！四條邊一樣長！');
    } else if (q.shapeType === 'square') {
      tts.speak('四條邊都是6公分！四條邊一樣長！');
    } else if (q.shapeType === 'rectangle') {
      tts.speak('上下都是8公分，左右都是5公分！對邊一樣長！');
    } else if (q.shapeType === 'triangle') {
      tts.speak('三條邊都是6公分！一共有三條邊！');
    } else {
      tts.speak('邊長都量好了！看看它們長度有沒有一樣？');
    }
  };

  // 驗證答案
  const handleVerify = () => {
    if (selectedAnswer === q.correctAnswer) {
      handleCorrect();
    } else {
      handleMistake();
    }
  };

  // 直線模式的 4 種線條定義
  const lineOptions = [
    {
      id: '直直的線（直線）',
      title: 'A. 直直的線（直線）',
      tag: '兩端有端點，平直不彎曲',
      speechPrompt: '這是直線：直直的沒有彎曲，兩端有明確的端點！',
      svg: (
        <svg viewBox="0 0 240 70" className="w-full h-16">
          <line x1="25" y1="35" x2="215" y2="35" stroke="#2563eb" strokeWidth="5" strokeLinecap="round" />
          <circle cx="25" cy="35" r="6" fill="#1d4ed8" stroke="#93c5fd" strokeWidth="2" />
          <circle cx="215" cy="35" r="6" fill="#1d4ed8" stroke="#93c5fd" strokeWidth="2" />
          <text x="25" y="55" fontSize="10" fill="#1d4ed8" textAnchor="middle" fontWeight="bold">端點</text>
          <text x="215" y="55" fontSize="10" fill="#1d4ed8" textAnchor="middle" fontWeight="bold">端點</text>
        </svg>
      ),
    },
    {
      id: '波浪線（曲線）',
      title: 'B. 波浪線（曲線）',
      tag: '彎彎曲曲、不是直尺畫出的',
      speechPrompt: '這是波浪曲線：彎彎曲曲的，不是直線！',
      svg: (
        <svg viewBox="0 0 240 70" className="w-full h-16">
          <path
            d="M 25 35 Q 55 12, 85 35 T 145 35 T 205 35"
            fill="none"
            stroke="#ef4444"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    {
      id: '折線',
      title: 'C. 折線',
      tag: '有尖銳拐角與轉折',
      speechPrompt: '這是折線：有尖銳的轉角拐彎，不是直線！',
      svg: (
        <svg viewBox="0 0 240 70" className="w-full h-16">
          <path
            d="M 25 48 L 70 20 L 115 48 L 160 20 L 205 48"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      id: '圓弧線',
      title: 'D. 圓弧線',
      tag: '弧度彎曲、非直線',
      speechPrompt: '這是圓弧線：彎曲成圓弧狀，不是直線！',
      svg: (
        <svg viewBox="0 0 240 70" className="w-full h-16">
          <path
            d="M 25 50 A 100 35 0 0 1 205 50"
            fill="none"
            stroke="#8b5cf6"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
  ];

  const isRhombus = q.shapeType === 'rhombus';
  const isStraightLine = q.shapeType === 'straight_line';
  const isTriangle = q.shapeType === 'triangle';
  const isLineTypeOption = q.options?.includes('直直的線（直線）');

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

      {/* ============================================================== */}
      {/* 情境 1：直線特徵觀察畫布 (q.shapeType === 'straight_line')     */}
      {/* ============================================================== */}
      {isStraightLine && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border-3 border-purple-100 flex flex-col items-center gap-6">
          <div className="flex items-center gap-2 text-blue-700 font-black text-base bg-blue-50 px-4 py-2 rounded-2xl border-2 border-blue-200">
            <Ruler className="w-5 h-5 text-blue-600" />
            <span>請仔細觀察下列 4 種線條，點選出真正的「直線」特徵：</span>
          </div>

          {/* 4 種線條對比卡片 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
            {lineOptions.map((item) => {
              const isSelected = selectedAnswer === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    soundFX.playClick();
                    if (isLineTypeOption) {
                      setSelectedAnswer(item.id);
                    }
                    tts.speak(item.speechPrompt);
                  }}
                  className={`p-4 rounded-3xl border-3 flex flex-col items-center gap-2 transition-all text-left ${
                    isSelected
                      ? 'bg-blue-50 border-blue-500 shadow-lg scale-[1.02] ring-2 ring-blue-300'
                      : 'bg-slate-50 hover:bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                  }`}
                >
                  <div className="w-full flex items-center justify-between">
                    <span className="font-black text-slate-800 text-base">{item.title}</span>
                    {isSelected && (
                      <span className="bg-blue-600 text-white rounded-full p-1 shadow">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>

                  {/* SVG 線條圖形 */}
                  <div className="w-full bg-white rounded-2xl border border-slate-200 p-2 flex items-center justify-center">
                    {item.svg}
                  </div>

                  <span className="text-xs font-bold text-slate-500 self-start">
                    特徵：{item.tag}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="text-xs text-blue-700 font-bold bg-blue-50/70 p-3 rounded-2xl border border-blue-200 w-full max-w-2xl text-center">
            💡 小知識：直線必須是「直直的，沒有彎曲」，並且「兩端具有明確端點」！
          </div>

          {/* 若選項不是直接對應線條名稱（例如端點數量題），在下方渲染題目的 options */}
          {!isLineTypeOption && q.options && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md mt-2">
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
      )}

      {/* ============================================================== */}
      {/* 情境 2：平面圖形實驗室 (正方形、長方形、菱形、三角形)          */}
      {/* ============================================================== */}
      {!isStraightLine && (
        <div className="bg-white rounded-3xl p-8 shadow-md border-3 border-purple-100 flex flex-col items-center gap-6">
          {/* 量測邊長按鈕 */}
          <div className="flex gap-3">
            <button
              onClick={handleMeasureSides}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-sm border-2 shadow-sm transition-all active:scale-95 ${
                hasMeasuredSides
                  ? 'bg-emerald-100 border-emerald-400 text-emerald-800'
                  : 'bg-purple-100 hover:bg-purple-200 border-purple-300 text-purple-800'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>{hasMeasuredSides ? '✅ 已量測邊長' : '拿直尺測量邊長'}</span>
            </button>
          </div>

          {/* 圖形畫布 */}
          <div className="relative w-80 h-80 flex items-center justify-center bg-purple-50/50 rounded-3xl border-2 border-dashed border-purple-300 select-none overflow-hidden">
            {/* 1. 菱形繪製區 (四邊等長，內角非 90 度) */}
            {isRhombus && (
              <div className="relative w-64 h-64 flex items-center justify-center">
                <svg viewBox="0 0 240 240" className="w-64 h-64">
                  <polygon
                    points="120,25 195,120 120,215 45,120"
                    fill="rgba(199, 210, 254, 0.7)"
                    stroke="#4f46e5"
                    strokeWidth="4"
                  />
                </svg>

                {/* 邊長標註 */}
                {hasMeasuredSides && (
                  <>
                    <span className="absolute top-12 left-14 text-xs font-black text-indigo-900 bg-white px-1.5 py-0.5 rounded shadow border border-indigo-200">
                      {q.sides[0]} cm
                    </span>
                    <span className="absolute top-12 right-14 text-xs font-black text-indigo-900 bg-white px-1.5 py-0.5 rounded shadow border border-indigo-200">
                      {q.sides[1]} cm
                    </span>
                    <span className="absolute bottom-12 right-14 text-xs font-black text-indigo-900 bg-white px-1.5 py-0.5 rounded shadow border border-indigo-200">
                      {q.sides[2]} cm
                    </span>
                    <span className="absolute bottom-12 left-14 text-xs font-black text-indigo-900 bg-white px-1.5 py-0.5 rounded shadow border border-indigo-200">
                      {q.sides[3]} cm
                    </span>
                  </>
                )}

                {/* 菱形 4 個角檢驗按鈕（無法密合直角量規） */}
                {[
                  { id: 0, pos: 'top-2 left-1/2 -translate-x-1/2' },   // 上頂點
                  { id: 1, pos: 'top-1/2 right-2 -translate-y-1/2' },  // 右頂點
                  { id: 2, pos: 'bottom-2 left-1/2 -translate-x-1/2' },// 下頂點
                  { id: 3, pos: 'top-1/2 left-2 -translate-y-1/2' },   // 左頂點
                ].map((c) => {
                  const isTested = testedCorners.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      onClick={() => handleTestCorner(c.id)}
                      title="點擊拿 L 型量規卡入檢驗直角"
                      className={`absolute ${c.pos} w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black transition-all shadow-md ${
                        isTested
                          ? 'bg-rose-500 text-white border-2 border-rose-700 animate-pulse'
                          : 'bg-white hover:bg-amber-100 border-2 border-amber-400 text-amber-800 animate-bounce'
                      }`}
                    >
                      {isTested ? '❌' : 'L?'}
                    </button>
                  );
                })}
              </div>
            )}

            {/* 2. 三角形繪製區 */}
            {isTriangle && (
              <div className="relative w-64 h-64 flex items-center justify-center">
                <svg viewBox="0 0 240 240" className="w-64 h-64">
                  <polygon
                    points="120,40 200,200 40,200"
                    fill="rgba(199, 210, 254, 0.7)"
                    stroke="#4f46e5"
                    strokeWidth="4"
                  />
                </svg>

                {hasMeasuredSides && (
                  <>
                    <span className="absolute top-20 left-10 text-xs font-black text-indigo-900 bg-white px-1.5 py-0.5 rounded shadow">
                      {q.sides[0]} cm
                    </span>
                    <span className="absolute top-20 right-10 text-xs font-black text-indigo-900 bg-white px-1.5 py-0.5 rounded shadow">
                      {q.sides[1]} cm
                    </span>
                    <span className="absolute bottom-5 left-1/2 -translate-x-1/2 text-xs font-black text-indigo-900 bg-white px-1.5 py-0.5 rounded shadow">
                      {q.sides[2]} cm
                    </span>
                  </>
                )}

                {[
                  { id: 0, pos: 'top-6 left-1/2 -translate-x-1/2' },
                  { id: 1, pos: 'bottom-6 right-6' },
                  { id: 2, pos: 'bottom-6 left-6' },
                ].map((c) => {
                  const isTested = testedCorners.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      onClick={() => handleTestCorner(c.id)}
                      className={`absolute ${c.pos} w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black transition-all shadow ${
                        isTested
                          ? 'bg-rose-500 text-white border-2 border-rose-700'
                          : 'bg-white hover:bg-amber-100 border border-slate-400 text-slate-700'
                      }`}
                    >
                      {isTested ? '❌' : 'L?'}
                    </button>
                  );
                })}
              </div>
            )}

            {/* 3. 正方形 / 長方形繪製區 (四角皆直角) */}
            {!isRhombus && !isTriangle && (
              <div
                className="relative border-4 border-indigo-600 bg-indigo-100/70 shadow-lg transition-transform"
                style={{
                  width: q.shapeType === 'rectangle' ? '180px' : '140px',
                  height: '140px',
                  transform: `rotate(${q.rotationDeg}deg)`,
                }}
              >
                {/* 邊長標註 */}
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
            )}
          </div>

          {/* 量規檢驗反饋條 */}
          {cornerTestFeedback && (
            <div
              className={`p-3 rounded-2xl text-sm font-black flex items-center gap-2 border-2 ${
                isRhombus || isTriangle
                  ? 'bg-rose-50 border-rose-300 text-rose-800'
                  : 'bg-amber-50 border-amber-300 text-amber-800'
              }`}
            >
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{cornerTestFeedback}</span>
            </div>
          )}

          <div className="text-xs text-slate-500 font-bold">
            提示：點擊圖形角上的「L?」按鈕，拿出 L 型直角量規檢驗角度能不能密合！
          </div>

          {/* 診斷選項按鈕 */}
          {q.options && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md">
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
      )}

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
