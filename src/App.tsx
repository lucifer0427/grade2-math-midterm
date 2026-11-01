import React, { useState } from 'react';
import { Star, Play, CheckCircle2, RotateCcw } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { BadgeModal } from './components/BadgeModal';
import { G1Game } from './games/g1-place-value/G1Game';
import { G2Game } from './games/g2-vertical-math/G2Game';
import { G3Game } from './games/g3-broken-ruler/G3Game';
import { G4Game } from './games/g4-two-step/G4Game';
import { G5Game } from './games/g5-geometry/G5Game';
import { useProgressStore } from './state/useProgressStore';
import { GameId } from './types/question';
import { soundFX } from './audio/soundFX';
import { tts } from './speech/tts';

interface IslandMeta {
  id: GameId;
  name: string;
  unit: string;
  desc: string;
  icon: string;
  color: string;
  borderColor: string;
}

const islands: IslandMeta[] = [
  {
    id: 'g1',
    name: '阿翰的零錢罐',
    unit: '單元 1：200以內的數',
    desc: '一元換十元、十元換百元，守住神秘的 0！',
    icon: '🪙',
    color: 'from-amber-400 to-yellow-500',
    borderColor: 'border-amber-300',
  },
  {
    id: 'g2',
    name: '算式破譯官',
    unit: '單元 2：二位數加減法',
    desc: '敲碎十位借 10，破解墨水污漬與抓出漏洞！',
    icon: '🔨',
    color: 'from-blue-500 to-indigo-600',
    borderColor: 'border-blue-300',
  },
  {
    id: 'g3',
    name: '小齊的斷尺大冒險',
    unit: '單元 3：公分長度測量',
    desc: '尺摔斷了別慌！跳大格數數，終點減起點！',
    icon: '📏',
    color: 'from-emerald-500 to-teal-600',
    borderColor: 'border-emerald-300',
  },
  {
    id: 'g4',
    name: '跳蚤市場採購員',
    unit: '單元 4：兩步驟加減混合',
    desc: '先算中間花費總額，再算找零與預算天平！',
    icon: '🛒',
    color: 'from-cyan-500 to-blue-600',
    borderColor: 'border-cyan-300',
  },
  {
    id: 'g5',
    name: '幾何巡邏隊',
    unit: '單元 5：平面圖形與直線',
    desc: '手持 L 型卡規破除旋轉 45 度正方形的菱形迷思！',
    icon: '📐',
    color: 'from-purple-500 to-pink-600',
    borderColor: 'border-purple-300',
  },
];

export const App: React.FC = () => {
  const { progress, updateStars, unlockBadge, toggleSound, toggleTTS, resetAllProgress } =
    useProgressStore();
  const [activeGame, setActiveGame] = useState<GameId | null>(null);
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);

  // 計算總星星數
  const totalStars = Object.values(progress.stars).reduce((acc, curr) => acc + curr, 0);

  // 關卡完成回呼
  const handleGameComplete = (gameId: GameId, stars: number) => {
    updateStars(gameId, stars);
    // 解鎖對應勳章
    const badgeMap: Record<GameId, string> = {
      g1: 'g1_regroup_master',
      g2: 'g2_break_ten',
      g3: 'g3_ruler_explorer',
      g4: 'g4_twostep_courier',
      g5: 'g5_geometry_expert',
    };
    unlockBadge(badgeMap[gameId]);
    setActiveGame(null);
    tts.speak('太棒了！順利通關，獲得了 3 顆星星與思維勳章！');
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar
        currentTitle={activeGame ? islands.find((i) => i.id === activeGame)?.name : undefined}
        totalStars={totalStars}
        badgeCount={progress.unlockedBadges.length}
        soundMuted={progress.soundMuted}
        ttsEnabled={progress.ttsEnabled}
        onToggleSound={toggleSound}
        onToggleTTS={toggleTTS}
        onBackToMap={activeGame ? () => setActiveGame(null) : undefined}
        onOpenBadges={() => setIsBadgeModalOpen(true)}
      />

      <main className="flex-1 p-4 sm:p-6 max-w-5xl mx-auto w-full">
        {/* 關卡遊戲畫面 */}
        {activeGame === 'g1' && <G1Game onFinishGame={(s) => handleGameComplete('g1', s)} />}
        {activeGame === 'g2' && <G2Game onFinishGame={(s) => handleGameComplete('g2', s)} />}
        {activeGame === 'g3' && <G3Game onFinishGame={(s) => handleGameComplete('g3', s)} />}
        {activeGame === 'g4' && <G4Game onFinishGame={(s) => handleGameComplete('g4', s)} />}
        {activeGame === 'g5' && <G5Game onFinishGame={(s) => handleGameComplete('g5', s)} />}

        {/* 主畫面：關卡探險地圖 */}
        {!activeGame && (
          <div className="flex flex-col gap-8 py-4">
            {/* 橫幅歡迎卡 */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <div className="inline-block bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase mb-2">
                  臺灣 108 課綱 • 翰林二上期中複習
                </div>
                <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
                  小二數學大冒險 🚀
                </h1>
                <p className="text-indigo-100 font-bold mt-2 text-base sm:text-lg max-w-xl">
                  拒絕死記刷題！透過敲碎硬幣、斷尺跳格與 L 型量規，啟發你的數學大腦！
                </p>
              </div>

              <div className="flex flex-col items-center gap-2 bg-white/10 p-4 rounded-2xl border border-white/20">
                <span className="text-xs font-bold text-indigo-100">探險進度總星數</span>
                <div className="flex items-center gap-2 text-3xl font-black text-amber-300">
                  <Star className="w-8 h-8 fill-amber-300 text-amber-300 animate-spin-slow" />
                  <span>{totalStars} / 15</span>
                </div>
              </div>
            </div>

            {/* 五大島嶼地圖卡片 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {islands.map((island, idx) => {
                const stars = progress.stars[island.id] || 0;
                const isCleared = stars > 0;

                return (
                  <div
                    key={island.id}
                    onClick={() => {
                      soundFX.playClick();
                      setActiveGame(island.id);
                    }}
                    className={`group bg-white rounded-3xl p-6 shadow-md hover:shadow-2xl border-4 ${island.borderColor} cursor-pointer transition-all transform hover:-translate-y-1.5 active:scale-98 flex flex-col justify-between relative overflow-hidden`}
                  >
                    {/* 頂部序號與狀態 */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-black px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">
                          第 {idx + 1} 關
                        </span>
                        {isCleared && (
                          <div className="flex items-center gap-1 text-emerald-600 text-xs font-black bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>已通關</span>
                          </div>
                        )}
                      </div>

                      {/* 圖標與名稱 */}
                      <div className="flex items-center gap-4 mb-3">
                        <div
                          className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${island.color} text-white flex items-center justify-center text-3xl shadow-md group-hover:scale-110 transition-transform`}
                        >
                          {island.icon}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-400">{island.unit}</div>
                          <h3 className="text-xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors">
                            {island.name}
                          </h3>
                        </div>
                      </div>

                      <p className="text-slate-500 font-bold text-xs sm:text-sm line-clamp-2 mt-1">
                        {island.desc}
                      </p>
                    </div>

                    {/* 底部星星與進入按鈕 */}
                    <div className="mt-6 pt-4 border-t-2 border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3].map((s) => (
                          <Star
                            key={s}
                            className={`w-5 h-5 ${
                              s <= stars
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-200 fill-slate-100'
                            }`}
                          />
                        ))}
                      </div>

                      <div className="flex items-center gap-1 text-sm font-black text-indigo-600 group-hover:translate-x-1 transition-transform">
                        <span>開始挑戰</span>
                        <Play className="w-4 h-4 fill-indigo-600" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 底部重置與家長提示 */}
            <div className="flex items-center justify-between text-xs text-slate-400 px-2 pt-4">
              <span>💡 平板/觸控螢幕友善 • 支援中文語音朗讀</span>
              <button
                onClick={() => {
                  if (confirm('確定要重新開始所有關卡進度嗎？')) {
                    resetAllProgress();
                  }
                }}
                className="flex items-center gap-1 hover:text-slate-600 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>重新開始進度</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* 思維勳章彈窗 */}
      <BadgeModal
        isOpen={isBadgeModalOpen}
        unlockedBadges={progress.unlockedBadges}
        onClose={() => setIsBadgeModalOpen(false)}
      />
    </div>
  );
};
