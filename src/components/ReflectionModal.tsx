import React from 'react';
import confetti from 'canvas-confetti';
import { Lightbulb, CheckCircle2, AlertCircle } from 'lucide-react';
import { soundFX } from '../audio/soundFX';

interface ReflectionModalProps {
  isOpen: boolean;
  question: string;
  options: string[];
  correctIndex: number;
  selectedIndex: number | null;
  hasError: boolean;
  onSelectOption: (idx: number) => void;
}

export const ReflectionModal: React.FC<ReflectionModalProps> = ({
  isOpen,
  question,
  options,
  correctIndex,
  selectedIndex,
  hasError,
  onSelectOption,
}) => {
  if (!isOpen) return null;

  const handleSelect = (idx: number) => {
    soundFX.playClick();
    if (idx === correctIndex) {
      // 施放彩色彩帶拉花特效
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore if not loaded
      }
    }
    onSelectOption(idx);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border-4 border-indigo-300 transform transition-all animate-scale-up">
        {/* 精靈標題 */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-3xl shadow-md border-2 border-amber-500">
            🧙‍♂️
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-indigo-600 font-black text-sm uppercase tracking-wider">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>思維小精靈的後設反思</span>
            </div>
            <h3 className="text-xl font-bold text-slate-800">解鎖思維勳章挑戰！</h3>
          </div>
        </div>

        {/* 思考題幹 */}
        <p className="text-lg font-bold text-slate-700 mb-6 bg-indigo-50/80 p-4 rounded-2xl border-2 border-indigo-100">
          {question}
        </p>

        {/* 選項列表 */}
        <div className="flex flex-col gap-3">
          {options.map((opt, idx) => {
            const isSelected = selectedIndex === idx;
            const isCorrect = isSelected && idx === correctIndex;
            const isWrong = isSelected && idx !== correctIndex;

            return (
              <button
                key={idx}
                disabled={selectedIndex === correctIndex}
                onClick={() => handleSelect(idx)}
                className={`w-full p-4 text-left font-bold text-base sm:text-lg rounded-2xl border-3 transition-all flex items-center justify-between ${
                  isCorrect
                    ? 'bg-emerald-100 border-emerald-500 text-emerald-900 shadow-md scale-[1.02]'
                    : isWrong
                    ? 'bg-red-50 border-red-400 text-red-800 animate-shake'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 active:scale-98 shadow-sm'
                }`}
              >
                <span>{opt}</span>
                {isCorrect && <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />}
                {isWrong && <AlertCircle className="w-6 h-6 text-red-500 shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* 錯誤回饋 */}
        {hasError && (
          <div className="mt-4 p-3 bg-amber-50 border-2 border-amber-300 rounded-xl text-amber-800 text-sm font-bold text-center">
            🧐 想一想，再觀察一次剛才的操作喔！
          </div>
        )}
      </div>
    </div>
  );
};
