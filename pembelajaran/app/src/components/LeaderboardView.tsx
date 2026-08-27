import React, { useState } from "react";
import { LeaderboardEntry } from "../types";
import { Trophy, Medal, Crown, Star, Sparkles, UserPlus, Search, Flame, Award } from "lucide-react";
import { playClickSound, playStarSound } from "../utils/audio";

interface LeaderboardViewProps {
  entries: LeaderboardEntry[];
  currentUserId: string;
  onAddStudent: (entry: LeaderboardEntry) => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  entries,
  currentUserId,
  onAddStudent,
}) => {
  const [filterMode, setFilterMode] = useState<"all" | "speed" | "stars">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // New Student Form
  const [newName, setNewName] = useState("");
  const [newGrade, setNewGrade] = useState("Kelas 3 SD");
  const [newScore, setNewScore] = useState("450");
  const [newAvatar, setNewAvatar] = useState("🦊");

  const sortedEntries = [...entries].sort((a, b) => {
    if (filterMode === "speed") {
      return b.speedScore - a.speedScore;
    } else if (filterMode === "stars") {
      return b.stars - a.stars;
    }
    return b.xp - a.xp;
  });

  const filteredEntries = sortedEntries.filter((e) =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.grade.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const top1 = filteredEntries[0];
  const top2 = filteredEntries[1];
  const top3 = filteredEntries[2];

  const handleAddNewStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const scoreNum = parseInt(newScore, 10) || 300;
    const newEntry: LeaderboardEntry = {
      id: `std_${Date.now()}`,
      name: newName.trim(),
      avatar: newAvatar,
      grade: newGrade,
      xp: scoreNum,
      stars: Math.floor(scoreNum / 100),
      solvedCount: Math.floor(scoreNum / 40),
      speedScore: Math.floor(scoreNum * 0.8),
      rankTitle: scoreNum > 1000 ? "Master Aljabar" : scoreNum > 500 ? "Detektif Cilik" : "Detektif Pemula",
      isCurrentUser: false,
    };

    onAddStudent(newEntry);
    playStarSound();
    setNewName("");
    setShowAddModal(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header Banner - Pink Theme with border-b-8 */}
      <div className="bg-pink-500 rounded-[32px] sm:rounded-[36px] p-6 sm:p-8 text-white shadow-lg border-b-8 border-pink-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-pink-900/25 text-white text-xs font-black tracking-wide border border-white/20 mb-2">
            <Trophy size={14} className="text-yellow-300 fill-yellow-300" /> PAPAN PERINGKAT DETEKTIF
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Juara Matematika SD</h2>
          <p className="text-pink-100 text-xs sm:text-sm mt-1 font-bold">
            Kumpulkan XP, selesaikan soal cerita, dan jadilah Detektif Angka Nomor 1 di Kelas!
          </p>
        </div>

        <button
          id="add-friend-btn"
          onClick={() => setShowAddModal(true)}
          className="px-5 py-3 bg-white text-slate-900 hover:bg-sky-50 font-black text-xs sm:text-sm rounded-2xl shadow-md border-2 border-pink-300 transition-all cursor-pointer flex items-center gap-2 shrink-0"
        >
          <UserPlus size={16} className="text-pink-600" />
          <span>Tambah Teman Sekelas</span>
        </button>
      </div>

      {/* Top 3 Podium Visual */}
      {filteredEntries.length >= 3 && !searchQuery && (
        <div className="bg-white rounded-[36px] sm:rounded-[40px] p-6 sm:p-8 border-4 border-sky-200 shadow-xl">
          <div className="text-center mb-4">
            <span className="text-xs font-black uppercase tracking-wider text-sky-700 bg-sky-100 px-3.5 py-1 rounded-full border border-sky-200">
              Podium Juara Kelas
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end max-w-lg mx-auto pt-6">
            {/* Rank 2 (Silver) */}
            {top2 && (
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-100 border-4 border-slate-300 flex items-center justify-center text-2xl sm:text-3xl shadow-md">
                    {top2.avatar}
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-slate-300 text-slate-800 text-xs font-black flex items-center justify-center border-2 border-white shadow-xs">
                    2
                  </div>
                </div>
                <h4 className="font-black text-slate-800 text-xs sm:text-sm mt-3 truncate max-w-[90px] sm:max-w-[120px]">
                  {top2.name}
                </h4>
                <span className="text-[10px] text-slate-500 font-bold">{top2.grade}</span>
                <div className="mt-1 px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800 text-[11px] font-mono font-black">
                  {filterMode === "speed" ? `${top2.speedScore} Pts` : `${top2.xp} XP`}
                </div>
                <div className="w-full h-16 bg-slate-200 rounded-t-2xl mt-3 border-t-2 border-slate-300 flex items-center justify-center font-black text-slate-600 text-xs sm:text-sm">
                  🥈 Perak
                </div>
              </div>
            )}

            {/* Rank 1 (Gold) */}
            {top1 && (
              <div className="flex flex-col items-center text-center">
                <Crown size={26} className="text-yellow-500 animate-bounce mb-1" />
                <div className="relative">
                  <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-yellow-50 border-4 border-yellow-400 flex items-center justify-center text-3xl sm:text-4xl shadow-lg ring-4 ring-yellow-200">
                    {top1.avatar}
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-yellow-400 text-slate-950 text-xs font-black flex items-center justify-center border-2 border-white shadow-md">
                    1
                  </div>
                </div>
                <h4 className="font-black text-slate-900 text-sm sm:text-base mt-3 truncate max-w-[100px] sm:max-w-[140px]">
                  {top1.name}
                </h4>
                <span className="text-[11px] text-orange-600 font-black">{top1.rankTitle}</span>
                <div className="mt-1 px-3 py-0.5 rounded-full bg-yellow-100 text-slate-900 text-xs font-mono font-black border border-yellow-300">
                  {filterMode === "speed" ? `${top1.speedScore} Pts` : `${top1.xp} XP`}
                </div>
                <div className="w-full h-24 bg-yellow-300 rounded-t-2xl mt-3 border-t-2 border-yellow-400 flex items-center justify-center font-black text-slate-950 text-base shadow-inner">
                  🥇 Emas
                </div>
              </div>
            )}

            {/* Rank 3 (Bronze) */}
            {top3 && (
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-orange-50 border-4 border-orange-700/40 flex items-center justify-center text-2xl sm:text-3xl shadow-md">
                    {top3.avatar}
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-orange-700 text-white text-xs font-black flex items-center justify-center border-2 border-white shadow-xs">
                    3
                  </div>
                </div>
                <h4 className="font-black text-slate-800 text-xs sm:text-sm mt-3 truncate max-w-[90px] sm:max-w-[120px]">
                  {top3.name}
                </h4>
                <span className="text-[10px] text-slate-500 font-bold">{top3.grade}</span>
                <div className="mt-1 px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-950 text-[11px] font-mono font-black border border-orange-200">
                  {filterMode === "speed" ? `${top3.speedScore} Pts` : `${top3.xp} XP`}
                </div>
                <div className="w-full h-12 bg-orange-200 rounded-t-2xl mt-3 border-t-2 border-orange-300 flex items-center justify-center font-black text-orange-900 text-xs">
                  🥉 Perunggu
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filter Tabs & Search */}
      <div className="bg-white rounded-3xl p-4 border-4 border-sky-200 shadow-md flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Sort categories */}
        <div className="flex items-center gap-1.5 bg-sky-50 p-1.5 rounded-2xl border border-sky-100 w-full sm:w-auto">
          {[
            { id: "all", label: "🌟 Total XP" },
            { id: "speed", label: "⚡ Kuis Kilat" },
            { id: "stars", label: "⭐ Bintang" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterMode(tab.id as any)}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                filterMode === tab.id
                  ? "bg-sky-500 text-white border-b-3 border-sky-700 shadow-xs"
                  : "text-slate-600 hover:text-sky-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-500" />
          <input
            type="text"
            placeholder="Cari nama / kelas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-sky-50 border-2 border-sky-200 rounded-2xl text-xs font-bold text-slate-800 focus:border-sky-500 outline-none"
          />
        </div>
      </div>

      {/* Full Leaderboard List Table */}
      <div className="bg-white rounded-[36px] border-4 border-sky-200 shadow-xl overflow-hidden">
        <div className="divide-y-2 divide-sky-100">
          {filteredEntries.map((student, index) => {
            const isUser = student.id === currentUserId || student.isCurrentUser;
            return (
              <div
                key={student.id}
                className={`p-4 sm:p-5 flex items-center justify-between gap-3 transition-colors ${
                  isUser ? "bg-sky-100/70 border-l-8 border-sky-500" : "hover:bg-sky-50/50"
                }`}
              >
                {/* Left: Rank & Avatar */}
                <div className="flex items-center gap-3.5">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                    index === 0
                      ? "bg-yellow-400 text-slate-950 shadow-xs"
                      : index === 1
                      ? "bg-slate-200 text-slate-800"
                      : index === 2
                      ? "bg-orange-600 text-white"
                      : "bg-sky-50 text-slate-600 border border-sky-200"
                  }`}>
                    {index + 1}
                  </div>

                  <span className="text-3xl">{student.avatar}</span>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-slate-900 text-sm">{student.name}</h4>
                      {isUser && (
                        <span className="px-2.5 py-0.5 rounded-full bg-sky-500 text-white text-[10px] font-black uppercase tracking-wider">
                          Kamu
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-bold">
                      <span>{student.grade}</span>
                      <span>•</span>
                      <span className="text-pink-600 font-black">{student.rankTitle}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Scores */}
                <div className="text-right flex items-center gap-4 sm:gap-6">
                  <div className="hidden sm:block">
                    <span className="text-[10px] text-slate-400 uppercase font-black block">Bintang</span>
                    <span className="text-xs font-black text-yellow-600 flex items-center justify-end gap-1">
                      ⭐ {student.stars}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-black block">
                      {filterMode === "speed" ? "Skor Kilat" : "Total XP"}
                    </span>
                    <span className="text-base sm:text-lg font-black font-mono text-sky-700">
                      {filterMode === "speed" ? student.speedScore : student.xp}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Add Student */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-[36px] p-6 sm:p-8 shadow-2xl border-4 border-sky-200 space-y-4">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <UserPlus className="text-pink-600" size={22} />
              <span>Tambah Teman ke Papan Peringkat</span>
            </h3>

            <form onSubmit={handleAddNewStudent} className="space-y-3.5">
              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">Nama Siswa:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Rian Pratama"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-sky-50 border-2 border-sky-200 rounded-2xl text-sm font-bold text-slate-800 focus:border-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">Kelas:</label>
                <select
                  value={newGrade}
                  onChange={(e) => setNewGrade(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-sky-50 border-2 border-sky-200 rounded-2xl text-sm font-bold text-slate-800 focus:border-sky-500 outline-none"
                >
                  <option>Kelas 2 SD</option>
                  <option>Kelas 3 SD</option>
                  <option>Kelas 4 SD</option>
                  <option>Kelas 5 SD</option>
                  <option>Kelas 6 SD</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">Pilih Avatar:</label>
                <div className="flex gap-2 flex-wrap">
                  {["🦊", "🦁", "🐰", "🐼", "🤖", "🚀"].map((a) => (
                    <button
                      type="button"
                      key={a}
                      onClick={() => setNewAvatar(a)}
                      className={`text-2xl p-2.5 rounded-2xl border-2 transition-all cursor-pointer ${
                        newAvatar === a ? "bg-pink-100 border-pink-500 scale-110 shadow-xs" : "bg-sky-50 border-sky-200 hover:bg-sky-100"
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">Skor Awal (XP):</label>
                <input
                  type="number"
                  value={newScore}
                  onChange={(e) => setNewScore(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-sky-50 border-2 border-sky-200 rounded-2xl text-sm font-mono font-bold text-slate-800 focus:border-sky-500 outline-none"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black rounded-2xl text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-pink-500 hover:bg-pink-600 border-b-4 border-pink-700 active:mt-1 active:border-b-0 text-white font-black rounded-2xl text-xs cursor-pointer shadow-md"
                >
                  Simpan Teman
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
