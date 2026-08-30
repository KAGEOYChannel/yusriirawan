import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Rocket,
  BookOpen,
  Edit3,
  Zap,
  Layers,
  FileText,
  Star,
  Award,
  Flame,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import { SoundEffects } from '../../utils/sound';
import { PerkalianBelajar } from './PerkalianBelajar';
import { PerkalianLatihan } from './PerkalianLatihan';
import { PerkalianGameCepat } from './PerkalianGameCepat';
import { PerkalianTantanganBersusun } from './PerkalianTantanganBersusun';
import { PerkalianSoalCerita } from './PerkalianSoalCerita';

interface PetualanganPerkalianProps {
  onUnlockBadge?: (badgeId: string) => void;
  onRewardScore?: (points: number, stars: number) => void;
}

type MainMenuId = 'belajar' | 'latihan' | 'tantangan' | 'bersusun' | 'cerita';

export const PetualanganPerkalian: React.FC<PetualanganPerkalianProps> = ({
  onUnlockBadge,
  onRewardScore,
}) => {
  const [activeMenu, setActiveMenu] = useState<MainMenuId>('belajar');
  const [completedModules, setCompletedModules] = useState<string[]>(['belajar-1']);
  const [sessionPoints, setSessionPoints] = useState<number>(120);
  const [sessionStars, setSessionStars] = useState<number>(4);

  const handleScoreGain = (pts: number, stars: number) => {
    setSessionPoints(prev => prev + pts);
    setSessionStars(prev => prev + stars);
    onRewardScore?.(pts, stars);
  };

  const navMenuItems = [
    { id: 'belajar' as const, label: '📚 Belajar', sub: '5 Level & Visual', color: 'bg-yellow-300' },
    { id: 'latihan' as const, label: '✏️ Latihan', sub: 'Mudah, Sedang, Sulit', color: 'bg-blue-300' },
    { id: 'tantangan' as const, label: '🎮 Tantangan Cepat', sub: 'Timer 20s Kilat', color: 'bg-pink-300' },
    { id: 'bersusun' as const, label: '📝 Tantangan Bersusun', sub: 'Isi Langkah Per Langkah', color: 'bg-purple-300' },
    { id: 'cerita' as const, label: '📖 Soal Cerita', sub: 'Konteks Kehidupan', color: 'bg-emerald-300' },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-yellow-300 via-amber-300 to-orange-300 border-4 border-black rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-white rounded-full text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>Materi Baru Matematika Kelas 5 SD</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-black font-heading tracking-tight">
              🚀 PETUALANGAN PERKALIAN
            </h2>
            <p className="text-sm sm:text-base md:text-lg font-bold text-black/90">
              Belajar perkalian jadi lebih mudah dan menyenangkan! Kuasai perkalian bersusun panjang, bersusun pendek, hingga bilangan sampai <strong>100.000</strong>.
            </p>
          </div>

          {/* Player Progress Stats Card */}
          <div className="bg-white border-3 border-black rounded-2xl p-4 sm:p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-row md:flex-col justify-around gap-4 min-w-[220px]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-400 border-2 border-black rounded-xl flex items-center justify-center text-xl shadow-xs">
                ⭐
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-slate-500">Bintang Kamu</span>
                <div className="text-xl font-black text-slate-900 font-heading">{sessionStars} Bintang</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-400 border-2 border-black rounded-xl flex items-center justify-center text-xl shadow-xs">
                🏆
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-slate-500">Poin Belajar</span>
                <div className="text-xl font-black text-slate-900 font-heading">{sessionPoints} XP</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main 5-Menu Navigation Bar */}
      <div className="bg-white border-4 border-black rounded-3xl p-3 sm:p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {navMenuItems.map(item => {
            const isActive = activeMenu === item.id;
            return (
              <button
                key={item.id}
                id={`menu-btn-${item.id}`}
                onClick={() => {
                  SoundEffects.playClick();
                  setActiveMenu(item.id);
                }}
                className={`p-3 rounded-2xl border-2 border-black transition-all cursor-pointer text-left flex flex-col justify-between ${
                  isActive
                    ? `${item.color} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-y-1 font-heading`
                    : 'bg-slate-50 hover:bg-slate-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                }`}
              >
                <div className="font-black text-sm sm:text-base text-slate-900 font-heading">
                  {item.label}
                </div>
                <div className="text-[10px] sm:text-xs font-bold text-slate-600 mt-1">
                  {item.sub}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Section Content Display */}
      <main>
        <AnimatePresence mode="wait">
          {activeMenu === 'belajar' && (
            <motion.div
              key="belajar"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <PerkalianBelajar onUnlockBadge={onUnlockBadge} onRewardScore={handleScoreGain} />
            </motion.div>
          )}

          {activeMenu === 'latihan' && (
            <motion.div
              key="latihan"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <PerkalianLatihan onUnlockBadge={onUnlockBadge} onRewardScore={handleScoreGain} />
            </motion.div>
          )}

          {activeMenu === 'tantangan' && (
            <motion.div
              key="tantangan"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <PerkalianGameCepat onUnlockBadge={onUnlockBadge} onRewardScore={handleScoreGain} />
            </motion.div>
          )}

          {activeMenu === 'bersusun' && (
            <motion.div
              key="bersusun"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <PerkalianTantanganBersusun onUnlockBadge={onUnlockBadge} onRewardScore={handleScoreGain} />
            </motion.div>
          )}

          {activeMenu === 'cerita' && (
            <motion.div
              key="cerita"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <PerkalianSoalCerita onUnlockBadge={onUnlockBadge} onRewardScore={handleScoreGain} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Badges / Penghargaan Section */}
      <div className="bg-white border-4 border-black rounded-3xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-6 h-6 text-yellow-600" />
            <h4 className="font-black text-lg text-slate-900 font-heading">
              Lencana Penghargaan Perkalian
            </h4>
          </div>
          <span className="text-xs font-black text-slate-500 uppercase">Sistem Prestasi Belajar</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { id: 'pemula-perkalian', title: 'Pemula Perkalian', icon: '🌱', color: 'bg-yellow-100 border-yellow-400' },
            { id: 'jago-nilai-tempat', title: 'Jago Nilai Tempat', icon: '🎯', color: 'bg-blue-100 border-blue-400' },
            { id: 'ahli-bersusun', title: 'Ahli Bersusun', icon: '📝', color: 'bg-purple-100 border-purple-400' },
            { id: 'master-perkalian', title: 'Master Perkalian', icon: '⚡', color: 'bg-orange-100 border-orange-400' },
            { id: 'raja-perkalian', title: 'Raja Perkalian', icon: '👑', color: 'bg-emerald-100 border-emerald-400' },
          ].map(badge => (
            <div
              key={badge.id}
              className={`p-3 rounded-2xl border-2 border-black ${badge.color} text-center space-y-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}
            >
              <div className="text-2xl">{badge.icon}</div>
              <div className="text-xs font-black text-slate-900 leading-tight">{badge.title}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
