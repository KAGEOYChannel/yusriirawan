import React from 'react';
import { PlayerProfile } from '../types';
import {
  Volume2,
  VolumeX,
  Pencil,
  Printer,
  Sparkles,
  Layers,
  BookOpen,
  Scale,
  Home,
  ArrowLeft,
  ArrowRight,
  Rocket,
} from 'lucide-react';
import { SoundEffects } from '../utils/sound';

export type ActiveTabType = 'quiz' | 'story' | 'lab' | 'materi';

interface NavbarProps {
  activeTab: ActiveTabType;
  onSelectTab: (tab: ActiveTabType) => void;
  player?: PlayerProfile;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenScratchpad: () => void;
  onOpenPrint: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  isMuted,
  onToggleMute,
  onOpenScratchpad,
  onOpenPrint,
}) => {
  const tabs = [
    { id: 'quiz' as const, label: 'Kuis Aljabar', icon: Sparkles, activeBg: 'bg-yellow-400 text-black' },
    { id: 'story' as const, label: 'Soal Cerita Aljabar', icon: BookOpen, activeBg: 'bg-green-400 text-black' },
    { id: 'lab' as const, label: 'Timbangan Konsep', icon: Scale, activeBg: 'bg-purple-300 text-black' },
    { id: 'materi' as const, label: 'Susun Pendek', icon: Layers, activeBg: 'bg-blue-400 text-black' },
  ];

  return (
    <header className="sticky top-2 z-40 mb-6">
      <div className="bg-white border-4 border-black rounded-2xl p-3 sm:p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-wrap items-center justify-between gap-3">
        {/* Brand / Logo */}
        <div
          onClick={() => onSelectTab('quiz')}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="w-11 h-11 sm:w-12 sm:h-12 bg-yellow-400 border-2 border-black rounded-full flex items-center justify-center font-black text-xl sm:text-2xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover:rotate-6 transition-transform">
            Σ
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900 font-heading leading-tight flex items-center gap-1.5">
              Misteri Angka Hilang
            </h1>
            <p className="text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider">
              Matematika Aljabar Dasar SD
            </p>
          </div>
        </div>

        {/* Action Tools & Navigation Links */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {/* Back to Previous / Guru Page */}
          <a
            id="nav-btn-back-guru"
            href="https://kageoychannel.github.io/yusriirawan/guru"
            className="px-2.5 sm:px-3 py-2 bg-emerald-300 hover:bg-emerald-400 text-black font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none flex items-center gap-1.5 transition-all no-underline font-heading"
            title="Kembali ke Halaman Sebelumnya (Guru)"
          >
            <ArrowLeft className="w-4 h-4 text-black stroke-[2.5]" />
            <span>Kembali</span>
          </a>

          {/* Home Page Link */}
          <a
            id="nav-btn-home"
            href="https://kageoychannel.github.io/yusriirawan"
            className="px-2.5 sm:px-3 py-2 bg-blue-300 hover:bg-blue-400 text-black font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none flex items-center gap-1.5 transition-all no-underline font-heading"
            title="Pindah ke Halaman Home"
          >
            <Home className="w-4 h-4 text-black stroke-[2.5]" />
            <span>Home</span>
          </a>

          {/* Direct Link to New HTML Material: Perkalian (perkalian.html) */}
          <a
            id="nav-btn-next-material"
            href="perkalian.html"
            className="px-3 py-2 bg-gradient-to-r from-amber-300 to-yellow-400 hover:from-amber-400 hover:to-yellow-500 text-black font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none flex items-center gap-1.5 transition-all no-underline font-heading animate-pulse"
            title="Buka Halaman Materi Baru: Perkalian Bilangan sampai 100.000 (perkalian.html)"
          >
            <Rocket className="w-4 h-4 text-black" />
            <span className="font-extrabold">Materi Baru: Perkalian ➔</span>
          </a>

          {/* Scratchpad Button */}
          <button
            id="nav-scratchpad"
            onClick={onOpenScratchpad}
            className="px-2.5 sm:px-3 py-2 bg-yellow-300 hover:bg-yellow-400 text-black font-bold text-xs rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none flex items-center gap-1.5 transition-all cursor-pointer"
            title="Buka Papan Cakar Oret-Oretan"
          >
            <Pencil className="w-4 h-4 text-black" />
            <span className="hidden lg:inline">Papan Cakar</span>
          </button>

          {/* Printable Worksheets */}
          <button
            id="nav-print"
            onClick={onOpenPrint}
            className="px-2.5 sm:px-3 py-2 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none flex items-center gap-1.5 transition-all cursor-pointer"
            title="Cetak Lembar Latihan"
          >
            <Printer className="w-4 h-4 text-black" />
            <span className="hidden lg:inline">Cetak Soal</span>
          </button>

          {/* Sound Toggle */}
          <button
            id="nav-sound-toggle"
            onClick={onToggleMute}
            className="p-2 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
            title={isMuted ? 'Nyalakan Suara' : 'Matikan Suara'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-600" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
          </button>
        </div>
      </div>

      {/* Bento Tabs Navigation Bar */}
      <div className="mt-3">
        <nav className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-nav-${tab.id}`}
                onClick={() => {
                  SoundEffects.playClick();
                  onSelectTab(tab.id);
                }}
                className={`flex-1 min-w-[130px] sm:min-w-0 py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 whitespace-nowrap border-2 border-black ${
                  isActive
                    ? `${tab.activeBg} shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] scale-102 font-heading`
                    : 'bg-white text-slate-700 hover:bg-slate-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                }`}
              >
                <Icon className="w-4 h-4 stroke-[2.5]" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
