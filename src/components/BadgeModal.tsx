import React from 'react';
import { Award, X, CheckCircle2, Lock } from 'lucide-react';
import { soundFX } from '../audio/soundFX';

interface BadgeModalProps {
  isOpen: boolean;
  unlockedBadges: string[];
  onClose: () => void;
}

interface BadgeDef {
  id: string;
  title: string;
  description: string;
  icon: string;
}

const allBadges: BadgeDef[] = [
  { id: 'g1_regroup_master', title: '十進位魔術師', description: '掌握一元換十元、十元換百元的化聚守恆', icon: '🪙' },
  { id: 'g1_zero_guardian', title: '零的守護者', description: '在定位板上守住十位的 0，不讓三位數縮水', icon: '🛡️' },
  { id: 'g2_break_ten', title: '破十勇者', description: '個位不夠減時，果斷敲碎十位借 1 當 10', icon: '🔨' },
  { id: 'g2_bug_detective', title: '算則抓蟲特工', description: '成功抓出「以大減小」的直式邏輯漏洞', icon: '🕵️‍♂️' },
  { id: 'g3_ruler_explorer', title: '斷尺神探', description: '破解非零起點，學會終點減起點求差量', icon: '📏' },
  { id: 'g4_twostep_courier', title: '兩步驟採購王', description: '先算中間消費總額，再算找零與預算天平', icon: '🛒' },
  { id: 'g5_geometry_expert', title: '直角特警', description: '手持 L 型量規破除旋轉 45 度正方形的菱形迷思', icon: '📐' },
];

export const BadgeModal: React.FC<BadgeModalProps> = ({
  isOpen,
  unlockedBadges,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border-4 border-purple-300 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center text-2xl border-2 border-purple-300">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-800">我的思維勳章館</h3>
              <p className="text-xs text-slate-500 font-bold">通關後設認知反思即可解鎖！</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundFX.playClick();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {allBadges.map((badge) => {
            const isUnlocked = unlockedBadges.includes(badge.id);

            return (
              <div
                key={badge.id}
                className={`p-4 rounded-2xl border-2 flex items-center gap-4 transition-all ${
                  isUnlocked
                    ? 'bg-purple-50/70 border-purple-300 shadow-sm'
                    : 'bg-slate-50 border-slate-200 opacity-60'
                }`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 ${
                  isUnlocked ? 'bg-white shadow border-2 border-purple-200' : 'bg-slate-200 text-slate-400'
                }`}>
                  {isUnlocked ? badge.icon : <Lock className="w-6 h-6" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className={`font-black text-base ${isUnlocked ? 'text-purple-900' : 'text-slate-500'}`}>
                      {badge.title}
                    </h4>
                    {isUnlocked && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                  </div>
                  <p className="text-xs text-slate-600 font-bold mt-1 line-clamp-2">
                    {badge.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
