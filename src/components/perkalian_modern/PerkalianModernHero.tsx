import React from 'react';
import { Sparkles, Rocket, Zap } from 'lucide-react';
import { SoundEffects } from '../../utils/sound';

interface HeroProps {
  player: {
    name: string;
    stars: number;
    streak: number;
  };
  onStartStudy: () => void;
  onStartSpeedRun: () => void;
}

export const PerkalianModernHero: React.FC<HeroProps> = ({
  player,
  onStartStudy,
  onStartSpeedRun,
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border border-indigo-500/30 p-6 sm:p-8 shadow-2xl shadow-indigo-950/50">
      {/* Ambient background glows */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
        {/* Left Hero Pitch */}
        <div className="space-y-3 text-center lg:text-left max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-xs font-bold text-indigo-300">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-spin" />
            <span>Matematika Kelas 5 SD • Kurikulum Merdeka</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black font-heading text-white tracking-tight leading-tight">
            Kuasai Perkalian Bilangan Sampai <span className="bg-gradient-to-r from-amber-300 via-pink-400 to-indigo-300 bg-clip-text text-transparent">100.000</span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
            Eksplorasi konsep nilai tempat, cara bersusun pendek & panjang, trik kelipatan 10/100, hingga penaklukan soal cerita nyata dengan visual interaktif modern.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
            <button
              onClick={() => {
                SoundEffects.playClick();
                onStartStudy();
              }}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-black text-xs sm:text-sm shadow-lg shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer font-heading flex items-center gap-2"
            >
              <Rocket className="w-4 h-4 text-yellow-300" />
              <span>Mulai Akademi Belajar</span>
            </button>

            <button
              onClick={() => {
                SoundEffects.playClick();
                onStartSpeedRun();
              }}
              className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-black text-xs sm:text-sm border border-amber-500/30 hover:border-amber-400 hover:scale-105 active:scale-95 transition-all cursor-pointer font-heading flex items-center gap-2"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Tantangan Kilat 20s</span>
            </button>
          </div>
        </div>

        {/* Right Stats Hologram Card */}
        <div className="grid grid-cols-3 gap-3 w-full sm:w-auto min-w-[280px]">
          <div className="bg-slate-800/60 backdrop-blur-md border border-indigo-500/30 rounded-2xl p-4 text-center hover:border-indigo-400/60 transition-all">
            <div className="text-2xl mb-1">⭐</div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Total Bintang</div>
            <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono mt-0.5">
              {player.stars}
            </div>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-md border border-pink-500/30 rounded-2xl p-4 text-center hover:border-pink-400/60 transition-all">
            <div className="text-2xl mb-1">🔥</div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Streak Combo</div>
            <div className="text-xl sm:text-2xl font-black text-pink-400 font-mono mt-0.5">
              {player.streak}x
            </div>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-md border border-emerald-500/30 rounded-2xl p-4 text-center hover:border-emerald-400/60 transition-all">
            <div className="text-2xl mb-1">🎯</div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Jenjang</div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono mt-0.5">
              SD Kls 5
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
