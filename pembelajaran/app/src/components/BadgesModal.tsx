import React from "react";
import { Badge, StudentProfile } from "../types";
import { Award, X, Sparkles, CheckCircle2, Lock } from "lucide-react";

interface BadgesModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile;
  onUpdateAvatar: (avatar: string) => void;
  onUpdateName: (name: string) => void;
}

const ALL_BADGES: Badge[] = [
  {
    id: "b1",
    title: "Detektif Pertama",
    description: "Menyelesaikan 1 soal bilangan misteri pertama.",
    icon: "🔍",
    unlocked: true,
    requiredXp: 50,
  },
  {
    id: "b2",
    title: "Pemberani Ratusan",
    description: "Berhasil memecahkan soal ratusan seperti 678 - ... = 243.",
    icon: "🏆",
    unlocked: true,
    requiredXp: 200,
  },
  {
    id: "b3",
    title: "Master Soal Cerita",
    description: "Menyelesaikan 3 misi cerita beranimasi.",
    icon: "📖",
    unlocked: false,
    requiredStories: 3,
  },
  {
    id: "b4",
    title: "Kilat Kecepatan",
    description: "Mencapai skor 300+ di Kuis Kilat 60 Detik.",
    icon: "⚡",
    unlocked: false,
    requiredSpeed: 300,
  },
  {
    id: "b5",
    title: "Sahabat Timbangan",
    description: "Mencoba eksperimen timbangan ajaib aljabar.",
    icon: "⚖️",
    unlocked: true,
  },
  {
    id: "b6",
    title: "Profesor Matematika Cilik",
    description: "Mengumpulkan lebih dari 1.000 XP.",
    icon: "🎓",
    unlocked: false,
    requiredXp: 1000,
  },
];

const AVAILABLE_AVATARS = [
  { emoji: "🦊", name: "Kancil Pintar" },
  { emoji: "🐱", name: "Kucing Penjelajah" },
  { emoji: "🤖", name: "Robot Bip-Bip" },
  { emoji: "🦁", name: "Singa Pemberani" },
  { emoji: "🚀", name: "Astronot Cilik" },
  { emoji: "🦉", name: "Burung Hantu Bijak" },
  { emoji: "🐼", name: "Panda Ceria" },
  { emoji: "🦖", name: "Dino Matematika" },
];

export const BadgesModal: React.FC<BadgesModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateAvatar,
  onUpdateName,
}) => {
  const [editingName, setEditingName] = React.useState(profile.name);

  if (!isOpen) return null;

  const handleSaveName = () => {
    if (editingName.trim()) {
      onUpdateName(editingName.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-xl bg-white rounded-[36px] sm:rounded-[40px] shadow-2xl border-4 border-sky-300 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-sky-500 border-b-4 border-sky-700 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Award size={24} className="text-yellow-300 fill-yellow-300" />
            <h3 className="font-black text-lg">Profil & Lencana Prestasi</h3>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-2xl bg-sky-600/60 hover:bg-sky-600 border border-white/30 text-white flex items-center justify-center cursor-pointer transition-all active:scale-95"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Profile Card */}
          <div className="p-5 rounded-3xl bg-sky-50 border-3 border-sky-200 flex flex-col sm:flex-row items-center gap-4">
            <div className="w-18 h-18 rounded-3xl bg-white border-3 border-sky-400 flex items-center justify-center text-4xl shadow-md transform -rotate-2">
              {profile.avatar}
            </div>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={handleSaveName}
                  className="font-black text-slate-900 text-base bg-transparent border-b-2 border-dashed border-sky-400 focus:border-sky-600 outline-none max-w-[180px]"
                />
                <span className="text-[11px] font-black text-sky-800 bg-sky-200/80 px-2.5 py-0.5 rounded-full border border-sky-300">
                  {profile.rankTitle}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-bold mt-0.5">{profile.grade}</p>

              <div className="flex items-center gap-3 mt-2 justify-center sm:justify-start text-xs font-black">
                <span className="text-yellow-700 bg-yellow-100 px-2.5 py-0.5 rounded-full border border-yellow-300">⭐ {profile.stars} Bintang</span>
                <span className="text-sky-800 bg-sky-200/60 px-2.5 py-0.5 rounded-full border border-sky-300">✨ {profile.xp} Total XP</span>
              </div>
            </div>
          </div>

          {/* Change Avatar */}
          <div>
            <h4 className="text-xs font-black text-sky-800 uppercase tracking-wider mb-2">
              Pilih Avatar Detektif:
            </h4>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {AVAILABLE_AVATARS.map((av) => (
                <button
                  key={av.name}
                  onClick={() => onUpdateAvatar(av.emoji)}
                  className={`p-2.5 rounded-2xl border-2 text-2xl text-center transition-all cursor-pointer ${
                    profile.avatar === av.emoji
                      ? "bg-pink-100 border-pink-500 scale-110 shadow-xs"
                      : "bg-sky-50 border-sky-200 hover:bg-sky-100"
                  }`}
                  title={av.name}
                >
                  {av.emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Badges Grid */}
          <div>
            <h4 className="text-xs font-black text-sky-800 uppercase tracking-wider mb-3">
              Lencana & Piala Prestasi:
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ALL_BADGES.map((b) => {
                const unlocked =
                  (b.requiredXp && profile.xp >= b.requiredXp) ||
                  (b.requiredStories && profile.completedStories.length >= b.requiredStories) ||
                  (b.requiredSpeed && profile.highScoreSpeed >= b.requiredSpeed) ||
                  b.unlocked;

                return (
                  <div
                    key={b.id}
                    className={`p-3.5 rounded-2xl border-2 flex items-start gap-3 ${
                      unlocked
                        ? "bg-yellow-50 border-yellow-300 shadow-xs"
                        : "bg-slate-50 border-slate-200 opacity-60"
                    }`}
                  >
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${
                      unlocked ? "bg-white shadow-xs border border-yellow-200" : "bg-slate-200"
                    }`}>
                      {unlocked ? b.icon : <Lock size={18} className="text-slate-400" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <h5 className="font-black text-xs sm:text-sm text-slate-900">{b.title}</h5>
                        {unlocked && <CheckCircle2 size={16} className="text-emerald-600 fill-emerald-100" />}
                      </div>
                      <p className="text-[11px] text-slate-600 font-bold mt-0.5">{b.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
