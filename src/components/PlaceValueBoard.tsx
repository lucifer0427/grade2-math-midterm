import React from 'react';

interface PlaceValueBoardProps {
  hundreds: number;
  tens: number;
  ones: number;
  highlightPosition?: 'hundreds' | 'tens' | 'ones';
  showZeroPrompt?: boolean;
}

export const PlaceValueBoard: React.FC<PlaceValueBoardProps> = ({
  hundreds,
  tens,
  ones,
  highlightPosition,
  showZeroPrompt,
}) => {
  return (
    <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-xl border-4 border-slate-200 max-w-md w-full mx-auto select-none">
      <div className="text-center font-black text-slate-700 text-lg sm:text-xl mb-4 tracking-wider flex items-center justify-center gap-2">
        <span>📊</span>
        <span>位值定位板</span>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
        {/* 百位欄 (綠色) */}
        <div
          className={`rounded-2xl p-3 sm:p-4 border-3 transition-all ${
            highlightPosition === 'hundreds'
              ? 'bg-emerald-100 border-emerald-500 scale-105 shadow-md'
              : 'bg-emerald-50/60 border-emerald-300'
          }`}
        >
          <div className="font-black text-emerald-800 text-sm sm:text-base mb-1">百位</div>
          <div className="text-xs text-emerald-600 font-bold mb-2">(百元鈔)</div>
          <div className="text-3xl sm:text-5xl font-black text-emerald-700 h-12 sm:h-16 flex items-center justify-center">
            {hundreds}
          </div>
        </div>

        {/* 十位欄 (藍色) */}
        <div
          className={`rounded-2xl p-3 sm:p-4 border-3 transition-all ${
            highlightPosition === 'tens'
              ? 'bg-blue-100 border-blue-500 scale-105 shadow-md'
              : 'bg-blue-50/60 border-blue-300'
          }`}
        >
          <div className="font-black text-blue-800 text-sm sm:text-base mb-1">十位</div>
          <div className="text-xs text-blue-600 font-bold mb-2">(十元幣)</div>
          <div className="text-3xl sm:text-5xl font-black text-blue-700 h-12 sm:h-16 flex items-center justify-center relative">
            {tens}
            {tens === 0 && showZeroPrompt && (
              <span className="absolute -bottom-2 text-[10px] text-red-500 font-bold animate-pulse">
                要寫 0 喔！
              </span>
            )}
          </div>
        </div>

        {/* 個位欄 (紅色) */}
        <div
          className={`rounded-2xl p-3 sm:p-4 border-3 transition-all ${
            highlightPosition === 'ones'
              ? 'bg-rose-100 border-rose-500 scale-105 shadow-md'
              : 'bg-rose-50/60 border-rose-300'
          }`}
        >
          <div className="font-black text-rose-800 text-sm sm:text-base mb-1">個位</div>
          <div className="text-xs text-rose-600 font-bold mb-2">(一元幣)</div>
          <div className="text-3xl sm:text-5xl font-black text-rose-700 h-12 sm:h-16 flex items-center justify-center">
            {ones}
          </div>
        </div>
      </div>

      {/* 總結合成數值 */}
      <div className="mt-4 pt-3 border-t-2 border-slate-100 flex items-center justify-between px-2 text-slate-600 font-bold text-sm sm:text-base">
        <span>合起來是：</span>
        <span className="text-2xl font-black text-indigo-600 tracking-wide">
          {hundreds * 100 + tens * 10 + ones} 元
        </span>
      </div>
    </div>
  );
};
