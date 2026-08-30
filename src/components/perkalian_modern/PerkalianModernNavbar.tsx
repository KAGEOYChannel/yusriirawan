import React from 'react';
import {
  Volume2,
  VolumeX,
  Pencil,
  Printer,
  Home,
  ArrowLeft,
  BookOpen,
} from 'lucide-react';
import { SoundEffects } from '../../utils/sound';

export type PerkalianTabId = 'belajar' | 'latihan' | 'kilat' | 'bersusun' | 'cerita';

interface PerkalianModernNavbarProps {
  activeTab: PerkalianTabId;
  onSelectTab: (tab: PerkalianTabId) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenScratchpad: () => void;
  onOpenPrint: () => void;
  player: {
    name: string;
    avatar: string;
    stars: number;
    streak: number;
  };
  onAvatarClick: () => void;
}

export const PerkalianModernNavbar: React.FC<PerkalianModernNavbarProps> = ({
  activeTab,
  onSelectTab,
  isMuted,
  onToggleMute,
  onOpenScratchpad,
  onOpenPrint,
  player,
  onAvatarClick,
}) => {
  const tabs = [
    { id: 'belajar' as const, label: 'Akademi Konsep', icon: '🌌', desc: '5 Level Interaktif' },
    { id: 'latihan' as const, label: 'Latihan Bertingkat', icon: '🎯', desc: 'Mudah - Sulit' },
    { id: 'kilat' as const, label: 'Misi Kilat 20s', icon: '⚡', desc: 'Tantangan Cepat' },
    { id: 'bersusun' as const, label: 'Lab Bersusun', icon: '📝', desc: 'Step by Step' },
    { id: 'cerita' as const, label: 'Misi Cerita Nyata', icon: '📖', desc: 'Konteks Kehidupan' },
  ];

  return (
    <header className="sticky top-2 z-40 mb-6 space-y-3">
      {/* Top Glass Bar */}
      <div className="bg-slate-900/90 backdrop-blur-xl border border-indigo-500/30 rounded-3xl p-3 sm:p-4 shadow-xl shadow-indigo-950/40 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Mascot */}
        <div className="flex items-center gap-3 select-none">
          <button
            onClick={onAvatarClick}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer relative group"
            title="Klik untuk Ganti Karakter"
          >
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-2xl sm:text-3xl group-hover:rotate-6 transition-transform">
              {player.avatar}
            </div>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black bg-gradient-to-r from-white via-indigo-200 to-sky-300 bg-clip-text text-transparent tracking-tight font-heading">
                GALAXY PERKALIAN SD
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                s.d. 100.000
              </span>
            </div>

            {/* Profile Subtext & Stars Indicator */}
            <div className="flex items-center gap-2.5 mt-1">
              <span className="text-xs font-bold text-slate-300">{player.name}</span>
              <span className="text-slate-600">•</span>
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                <span>⭐</span> {player.stars} Bintang
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs font-bold text-pink-400 flex items-center gap-1">
                <span>🔥</span> {player.streak}x Combo
              </span>
            </div>
          </div>
        </div>

        {/* Global Action Links & Utility Tools */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Back to Guru Link */}
          <a
            id="perkalian-nav-guru"
            href="https://kageoychannel.github.io/yusriirawan/guru"
            className="px-3 py-2 bg-slate-800/80 hover:bg-slate-700 text-emerald-300 font-bold text-xs rounded-2xl border border-emerald-500/40 shadow-sm hover:shadow-emerald-500/20 flex items-center gap-1.5 transition-all no-underline"
            title="Kembali ke Halaman Guru"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline font-bold">Guru</span>
          </a>

          {/* Home Link */}
          <a
            id="perkalian-nav-home"
            href="https://kageoychannel.github.io/yusriirawan"
            className="px-3 py-2 bg-slate-800/80 hover:bg-slate-700 text-sky-300 font-bold text-xs rounded-2xl border border-sky-500/40 shadow-sm hover:shadow-sky-500/20 flex items-center gap-1.5 transition-all no-underline"
            title="Pindah ke Halaman Home"
          >
            <Home className="w-4 h-4 text-sky-400" />
            <span className="hidden sm:inline font-bold">Home</span>
          </a>

          {/* Link back to Mystery Numbers (pembelajaranMTK.html) */}
          <a
            id="perkalian-nav-misteri"
            href="pembelajaranMTK.html"
            className="px-3 py-2 bg-indigo-950/80 hover:bg-indigo-900 text-indigo-200 font-bold text-xs rounded-2xl border border-indigo-400/50 shadow-sm hover:shadow-indigo-500/30 flex items-center gap-1.5 transition-all no-underline"
            title="Buka Materi 1: Bilangan Misteri (pembelajaranMTK.html)"
          >
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span className="font-bold">Materi 1: Bilangan Misteri</span>
          </a>

          {/* Scratchpad Button */}
          <button
            id="perkalian-nav-scratchpad"
            onClick={() => {
              SoundEffects.playClick();
              onOpenScratchpad();
            }}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold rounded-2xl border border-amber-500/30 hover:border-amber-400 transition-all cursor-pointer"
            title="Papan Oret-Oretan Matematika"
          >
            <Pencil className="w-4 h-4" />
          </button>

          {/* Print Worksheet */}
          <button
            id="perkalian-nav-print"
            onClick={() => {
              SoundEffects.playClick();
              onOpenPrint();
            }}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-2xl border border-slate-700 hover:border-indigo-400 transition-all cursor-pointer"
            title="Cetak Lembar Latihan Perkalian"
          >
            <Printer className="w-4 h-4" />
          </button>

          {/* Sound Toggle */}
          <button
            id="perkalian-nav-sound"
            onClick={onToggleMute}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-2xl border border-slate-700 hover:border-indigo-400 transition-all cursor-pointer"
            title={isMuted ? 'Nyalakan Audio' : 'Matikan Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Futuristic Floating Tabs Navigation */}
      <nav className="bg-slate-900/70 backdrop-blur-md border border-slate-800/80 p-1.5 rounded-2xl flex items-center gap-1.5 overflow-x-auto no-scrollbar shadow-lg">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`perkalian-tab-${tab.id}`}
              onClick={() => {
                SoundEffects.playClick();
                onSelectTab(tab.id);
              }}
              className={`flex-1 min-w-[130px] sm:min-w-0 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg shadow-indigo-600/30 scale-[1.02] font-black font-heading'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span className="text-base">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
};
