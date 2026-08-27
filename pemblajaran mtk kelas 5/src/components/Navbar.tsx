import React from "react";
import { GameMode, StudentProfile } from "../types";
import { Scale, BookOpen, Sparkles, Zap, Trophy, Volume2, VolumeX, Award, Shield } from "lucide-react";
import { isSoundEnabled, setSoundEnabled, playClickSound } from "../utils/audio";

interface NavbarProps {
  currentMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  profile: StudentProfile;
  onOpenProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMode,
  onSelectMode,
  profile,
  onOpenProfile,
}) => {
  const [soundOn, setSoundOn] = React.useState(isSoundEnabled());

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) playClickSound();
  };

  const navItems = [
    { id: "learn" as GameMode, label: "Timbangan Ajaib", icon: Scale, emoji: "⚖️" },
    { id: "story" as GameMode, label: "Soal Cerita", icon: BookOpen, emoji: "📖" },
    { id: "adventure" as GameMode, label: "Kuis Petualangan", icon: Sparkles, emoji: "🌟" },
    { id: "speed" as GameMode, label: "Kuis Kilat", icon: Zap, emoji: "⚡" },
    { id: "leaderboard" as GameMode, label: "Papan Peringkat", icon: Trophy, emoji: "🏆" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b-4 border-sky-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Upper Top Bar */}
        <div className="flex items-center justify-between py-3.5 gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-orange-400 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3 text-white font-black text-2xl border-2 border-orange-300 select-none">
              M+
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-sky-600 tracking-tight">
                  DETEKTIF<span className="text-orange-500">ANGKA</span>
                </h1>
                <span className="bg-pink-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest shadow-xs">
                  SD MATEMATIKA
                </span>
              </div>
              <p className="text-xs text-sky-700/80 font-bold hidden sm:block">Misteri Bilangan Hilang • 678 - ? = 243</p>
            </div>
          </div>

          {/* User Profile Pill, Level, Star Count & Sound Button */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Level Pill */}
            <div className="bg-sky-100 rounded-full px-3.5 py-1.5 border-2 border-sky-300 flex items-center gap-1.5 shadow-2xs">
              <span className="text-[10px] font-black text-sky-500 uppercase tracking-widest">Level</span>
              <span className="text-base sm:text-lg font-black text-sky-700">{profile.level}</span>
            </div>

            {/* Star Counter */}
            <div className="flex items-center gap-1.5 bg-yellow-50 px-3 py-1.5 rounded-full border-2 border-yellow-200 shadow-2xs">
              <span className="text-lg">⭐</span>
              <span className="text-xs sm:text-sm font-black text-slate-800 font-mono">{profile.xp.toLocaleString()} XP</span>
            </div>

            {/* Audio Toggle */}
            <button
              onClick={toggleSound}
              className="p-2 rounded-2xl bg-sky-50 hover:bg-sky-100 border-2 border-sky-200 text-sky-700 transition-colors cursor-pointer"
              title={soundOn ? "Matikan Suara" : "Nyalakan Suara"}
            >
              {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>

            {/* Profile Avatar Button */}
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2 bg-orange-100 hover:bg-orange-200 border-2 border-orange-300 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl transition-all cursor-pointer shadow-xs group"
              title="Buka Profil & Lencana"
            >
              <div className="w-8 h-8 rounded-full bg-white border-2 border-orange-300 flex items-center justify-center text-lg shadow-2xs group-hover:scale-110 transition-transform">
                {profile.avatar}
              </div>
              <div className="text-left hidden md:block">
                <span className="font-extrabold text-xs text-slate-800 block truncate max-w-[100px]">{profile.name}</span>
                <span className="text-[10px] text-orange-700 font-black">{profile.rankTitle}</span>
              </div>
            </button>
          </div>
        </div>

        {/* Lower Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto py-2 border-t-2 border-sky-100 scrollbar-none">
          {navItems.map((item) => {
            const isActive = currentMode === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  playClickSound();
                  onSelectMode(item.id);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-sky-500 text-white border-b-4 border-sky-700 shadow-md transform -translate-y-0.5"
                    : "bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-700 border-2 border-sky-100 shadow-2xs"
                }`}
              >
                <span className="text-base">{item.emoji}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
