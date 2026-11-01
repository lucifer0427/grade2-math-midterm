import React from 'react';
import { Volume2, VolumeX, ArrowLeft, Star, Award, Mic, MicOff } from 'lucide-react';
import { soundFX } from '../audio/soundFX';
import { tts } from '../speech/tts';

interface NavbarProps {
  currentTitle?: string;
  totalStars: number;
  badgeCount: number;
  soundMuted: boolean;
  ttsEnabled: boolean;
  onToggleSound: () => void;
  onToggleTTS: () => void;
  onBackToMap?: () => void;
  onOpenBadges?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTitle,
  totalStars,
  badgeCount,
  soundMuted,
  ttsEnabled,
  onToggleSound,
  onToggleTTS,
  onBackToMap,
  onOpenBadges,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b-4 border-indigo-100 shadow-sm px-4 py-3 flex items-center justify-between">
      {/* 左側：返回地圖或品牌 Logo */}
      <div className="flex items-center gap-2">
        {onBackToMap ? (
          <button
            onClick={() => {
              soundFX.playClick();
              onBackToMap();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl transition-transform active:scale-95 text-base border-2 border-indigo-200"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>地圖</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 font-black text-xl text-indigo-600 tracking-wide">
            <span className="text-2xl">🚀</span>
            <span>小二數學大冒險</span>
          </div>
        )}

        {currentTitle && (
          <span className="hidden sm:inline-block text-lg font-bold text-slate-700 ml-2 border-l-2 pl-3 border-slate-300">
            {currentTitle}
          </span>
        )}
      </div>

      {/* 右側：星星、勳章與無障礙設定 */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* 星星統計 */}
        <div className="flex items-center gap-1 bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-black text-sm border-2 border-amber-300 shadow-sm">
          <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
          <span>{totalStars}</span>
        </div>

        {/* 思維勳章 */}
        <button
          onClick={() => {
            soundFX.playClick();
            if (onOpenBadges) onOpenBadges();
          }}
          className="flex items-center gap-1 bg-purple-100 hover:bg-purple-200 text-purple-800 px-3 py-1 rounded-full font-black text-sm border-2 border-purple-300 shadow-sm transition-transform active:scale-95"
        >
          <Award className="w-4 h-4 text-purple-600" />
          <span>{badgeCount}</span>
        </button>

        {/* 語音朗讀 TTS 開關 */}
        <button
          onClick={() => {
            soundFX.playClick();
            onToggleTTS();
            tts.setEnabled(!ttsEnabled);
          }}
          title={ttsEnabled ? '語音朗讀：開啟' : '語音朗讀：靜音'}
          className={`p-2 rounded-xl border-2 transition-all active:scale-95 ${
            ttsEnabled
              ? 'bg-blue-100 border-blue-400 text-blue-700'
              : 'bg-slate-100 border-slate-300 text-slate-400'
          }`}
        >
          {ttsEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>

        {/* 程式合成音效開關 */}
        <button
          onClick={() => {
            soundFX.setMuted(!soundMuted);
            onToggleSound();
          }}
          title={soundMuted ? '音效：靜音' : '音效：開啟'}
          className={`p-2 rounded-xl border-2 transition-all active:scale-95 ${
            !soundMuted
              ? 'bg-emerald-100 border-emerald-400 text-emerald-700'
              : 'bg-slate-100 border-slate-300 text-slate-400'
          }`}
        >
          {!soundMuted ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </button>
      </div>
    </header>
  );
};
