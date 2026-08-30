import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  PerkalianModernNavbar,
  PerkalianTabId,
} from './components/perkalian_modern/PerkalianModernNavbar';
import { PerkalianModernHero } from './components/perkalian_modern/PerkalianModernHero';
import { PerkalianModernBelajar } from './components/perkalian_modern/PerkalianModernBelajar';
import { PerkalianModernLatihan } from './components/perkalian_modern/PerkalianModernLatihan';
import { PerkalianModernKilat } from './components/perkalian_modern/PerkalianModernKilat';
import { PerkalianModernBersusun } from './components/perkalian_modern/PerkalianModernBersusun';
import { PerkalianModernCerita } from './components/perkalian_modern/PerkalianModernCerita';
import { PerkalianScratchpad } from './components/perkalian_modern/PerkalianScratchpad';
import { PerkalianPrintModal } from './components/perkalian_modern/PerkalianPrintModal';
import { SoundEffects } from './utils/sound';
import { triggerConfetti } from './utils/confetti';
import { X } from 'lucide-react';

const AVATARS = ['🚀', '👨‍🚀', '🐱‍🚀', '🦁', '🤖', '⚡', '🦉', '🦊'];

export default function PerkalianApp() {
  const [activeTab, setActiveTab] = useState<PerkalianTabId>('belajar');
  const [isScratchpadOpen, setIsScratchpadOpen] = useState(false);
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Player Profile State (Clean without XP)
  const [player, setPlayer] = useState(() => {
    try {
      const saved = localStorage.getItem('perkalian_player_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          name: parsed.name || 'Penjelajah Cilik',
          avatar: parsed.avatar || '🚀',
          stars: typeof parsed.stars === 'number' ? parsed.stars : 6,
          streak: typeof parsed.streak === 'number' ? parsed.streak : 3,
        };
      }
    } catch {}
    return {
      name: 'Penjelajah Cilik',
      avatar: '🚀',
      stars: 6,
      streak: 3,
    };
  });

  // Save to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('perkalian_player_profile', JSON.stringify(player));
    } catch {}
  }, [player]);

  const handleToggleMute = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    SoundEffects.setMuted(nextState);
    if (!nextState) SoundEffects.playClick();
  };

  const handleRewardStars = (starsCount: number = 1) => {
    setPlayer(prev => {
      const nextStars = prev.stars + starsCount;
      const nextStreak = prev.streak + 1;
      if (nextStars % 5 === 0) {
        SoundEffects.playFanfare();
        triggerConfetti();
      }
      return {
        ...prev,
        stars: nextStars,
        streak: nextStreak,
      };
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white font-sans antialiased relative overflow-x-hidden">
      {/* Background Starfield Ambient Lights */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-pink-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
        {/* Modern Navbar */}
        <PerkalianModernNavbar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onOpenScratchpad={() => setIsScratchpadOpen(true)}
          onOpenPrint={() => setIsPrintOpen(true)}
          player={player}
          onAvatarClick={() => setIsAvatarModalOpen(true)}
        />

        {/* Hero Showcase (Always visible on belajar / home) */}
        {activeTab === 'belajar' && (
          <PerkalianModernHero
            player={player}
            onStartStudy={() => setActiveTab('belajar')}
            onStartSpeedRun={() => setActiveTab('kilat')}
          />
        )}

        {/* Dynamic Tab Stage View */}
        <main>
          <AnimatePresence mode="wait">
            {activeTab === 'belajar' && (
              <motion.div
                key="belajar"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <PerkalianModernBelajar
                  onRewardScore={handleRewardStars}
                />
              </motion.div>
            )}

            {activeTab === 'latihan' && (
              <motion.div
                key="latihan"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <PerkalianModernLatihan
                  onRewardScore={handleRewardStars}
                />
              </motion.div>
            )}

            {activeTab === 'kilat' && (
              <motion.div
                key="kilat"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <PerkalianModernKilat
                  onRewardScore={handleRewardStars}
                />
              </motion.div>
            )}

            {activeTab === 'bersusun' && (
              <motion.div
                key="bersusun"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <PerkalianModernBersusun
                  onRewardScore={handleRewardStars}
                />
              </motion.div>
            )}

            {activeTab === 'cerita' && (
              <motion.div
                key="cerita"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <PerkalianModernCerita
                  onRewardScore={handleRewardStars}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Footer info */}
        <footer className="text-center py-6 border-t border-slate-800/80 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            Aplikasi Pembelajaran Matematika SD • Kurikulum Merdeka
          </div>
          <div className="flex items-center gap-4">
            <a
              href="pembelajaranMTK.html"
              className="text-indigo-400 hover:text-indigo-300 font-bold"
            >
              📘 Materi 1: Bilangan Misteri
            </a>
            <a
              href="https://kageoychannel.github.io/yusriirawan/guru"
              className="text-emerald-400 hover:text-emerald-300 font-bold"
            >
              Portal Guru
            </a>
          </div>
        </footer>
      </div>

      {/* Scratchpad Modal */}
      <PerkalianScratchpad
        isOpen={isScratchpadOpen}
        onClose={() => setIsScratchpadOpen(false)}
      />

      {/* Printable Worksheet Modal */}
      <PerkalianPrintModal
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        playerName={player.name}
      />

      {/* Avatar / Profile Chooser Modal */}
      {isAvatarModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-white font-heading">
                Pilih Karakter Penjelajah
              </h3>
              <button
                onClick={() => setIsAvatarModalOpen(false)}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 block">Nama Panggilan:</label>
              <input
                type="text"
                value={player.name}
                onChange={e => setPlayer(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 block">Pilih Avatar:</label>
              <div className="grid grid-cols-4 gap-2.5">
                {AVATARS.map(av => (
                  <button
                    key={av}
                    onClick={() => {
                      SoundEffects.playClick();
                      setPlayer(prev => ({ ...prev, avatar: av }));
                    }}
                    className={`h-14 rounded-2xl flex items-center justify-center text-2xl transition-all cursor-pointer ${
                      player.avatar === av
                        ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 ring-2 ring-indigo-400 text-white scale-105'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                SoundEffects.playClick();
                setIsAvatarModalOpen(false);
              }}
              className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg cursor-pointer font-heading mt-2"
            >
              Simpan Profil
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
