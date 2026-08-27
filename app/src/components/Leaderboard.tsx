import React, { useState } from 'react';
import { motion } from 'motion/react';
import { LeaderboardEntry, Badge, PlayerProfile, DifficultyLevel } from '../types';
import { Trophy, Medal, Star, Flame, Crown, User, Edit3, Award, Sparkles, Check } from 'lucide-react';
import { SoundEffects } from '../utils/sound';

interface LeaderboardProps {
  player: PlayerProfile;
  leaderboard: LeaderboardEntry[];
  badges: Badge[];
  onUpdatePlayer: (name: string, avatar: string) => void;
}

export const AVATAR_OPTIONS = [
  { id: '🐰', name: 'Kelinci Cerdas' },
  { id: '🐱', name: 'Kucing Detektif' },
  { id: '🦁', name: 'Singa Juara' },
  { id: '🦉', name: 'Burung Hantu Bijak' },
  { id: '🤖', name: 'Robot Hitung' },
  { id: '🚀', name: 'Roket Cepat' },
  { id: '🐼', name: 'Panda Pintar' },
  { id: '🦊', name: 'Rubah Lincah' },
];

export const Leaderboard: React.FC<LeaderboardProps> = ({
  player,
  leaderboard,
  badges,
  onUpdatePlayer,
}) => {
  const [filterLevel, setFilterLevel] = useState<DifficultyLevel | 'all'>('all');
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>(player.name);
  const [editAvatar, setEditAvatar] = useState<string>(player.avatar);

  const filteredLeaderboard = leaderboard
    .filter(entry => (filterLevel === 'all' ? true : entry.level === filterLevel || entry.level === 'all'))
    .sort((a, b) => b.score - a.score);

  const top3 = filteredLeaderboard.slice(0, 3);
  const restList = filteredLeaderboard.slice(3);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;
    SoundEffects.playClick();
    onUpdatePlayer(editName.trim(), editAvatar);
    setIsEditingProfile(false);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* Player Profile & Stats Bento Banner */}
      <div className="bg-yellow-300 border-4 border-black rounded-3xl p-6 sm:p-8 text-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-white rounded-3xl border-3 border-black flex items-center justify-center text-4xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative">
            <span>{player.avatar}</span>
            <button
              onClick={() => {
                SoundEffects.playClick();
                setIsEditingProfile(true);
              }}
              className="absolute -bottom-2 -right-2 bg-black text-white p-1.5 rounded-full border-2 border-white shadow-md hover:bg-slate-800 transition-transform active:scale-95 cursor-pointer"
              title="Ganti Profil"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-black font-heading text-slate-900">
                {player.name}
              </h2>
              <span className="px-2.5 py-0.5 bg-black text-white rounded-full text-xs font-black uppercase tracking-wider">
                Siswa Juara
              </span>
            </div>
            <p className="text-slate-800 text-xs sm:text-sm font-bold">
              Terus berlatih untuk menempati posisi teratas di papan juara sekolah!
            </p>
          </div>
        </div>

        {/* Player Stats Mini Bento Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <div className="bg-white px-4 py-2.5 rounded-2xl border-2 border-black text-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <span className="text-[11px] font-black uppercase text-slate-500 block">Total Poin</span>
            <span className="text-xl sm:text-2xl font-black font-heading text-slate-900">{player.totalScore}</span>
          </div>

          <div className="bg-white px-4 py-2.5 rounded-2xl border-2 border-black text-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <span className="text-[11px] font-black uppercase text-slate-500 block">Bintang</span>
            <span className="text-xl sm:text-2xl font-black font-heading text-yellow-600 flex items-center justify-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-500" /> {player.stars}
            </span>
          </div>

          <div className="bg-white px-4 py-2.5 rounded-2xl border-2 border-black text-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <span className="text-[11px] font-black uppercase text-slate-500 block">Kombo Rekor</span>
            <span className="text-xl sm:text-2xl font-black font-heading text-rose-600 flex items-center justify-center gap-1">
              <Flame className="w-4 h-4 text-rose-500 fill-rose-500" /> {player.highestStreak}x
            </span>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black space-y-5"
          >
            <h3 className="text-xl font-black text-slate-900 font-heading text-center">
              Pilih Avatar & Ganti Nama Siswa
            </h3>

            {/* Avatar picker */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 block uppercase">Pilih Karakter Favorit:</label>
              <div className="grid grid-cols-4 gap-2">
                {AVATAR_OPTIONS.map(av => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => {
                      SoundEffects.playClick();
                      setEditAvatar(av.id);
                    }}
                    className={`p-3 rounded-2xl text-2xl text-center transition-all border-2 border-black flex flex-col items-center cursor-pointer ${
                      editAvatar === av.id
                        ? 'bg-yellow-300 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5'
                        : 'bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <span>{av.id}</span>
                    <span className="text-[9px] font-black text-slate-800 mt-1 truncate w-full">
                      {av.name.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Name Input */}
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="text-xs font-black text-slate-700 block mb-1 uppercase">Nama Panggilan Siswa:</label>
                <input
                  type="text"
                  maxLength={18}
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-black rounded-xl font-bold text-slate-900 focus:outline-none"
                  placeholder="Misal: Budi Santoso"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="flex-1 py-3 rounded-xl border-2 border-black font-black text-slate-700 hover:bg-slate-100 text-sm cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-black border-2 border-black font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-sm flex items-center justify-center gap-1.5 cursor-pointer font-heading active:translate-y-0.5 active:shadow-none"
                >
                  <Check className="w-4 h-4 text-black" /> Simpan Profil
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Main Content: Podium & Full Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-black text-slate-900 font-heading flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              Papan Juara Matematika SD
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm font-semibold">
              Siswa dengan ketelitian dan kecepatan terbaik dalam mencari bilangan misteri
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border-2 border-black gap-1">
            {(['all', 'easy', 'medium', 'hard'] as const).map(lvl => (
              <button
                key={lvl}
                onClick={() => {
                  SoundEffects.playClick();
                  setFilterLevel(lvl);
                }}
                className={`px-3 py-1.5 rounded-xl font-black text-xs capitalize transition-all border border-transparent cursor-pointer ${
                  filterLevel === lvl
                    ? 'bg-yellow-300 text-black border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                    : 'text-slate-600 hover:text-black'
                }`}
              >
                {lvl === 'all' ? 'Semua' : lvl === 'easy' ? 'Pemula' : lvl === 'medium' ? 'Jagoan' : 'Master'}
              </button>
            ))}
          </div>
        </div>

        {/* Podium Top 3 */}
        <div className="pt-8 pb-4 flex items-end justify-center gap-2 sm:gap-6 max-w-2xl mx-auto">
          {/* Rank 2 (Silver) */}
          {top3[1] && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex-1 flex flex-col items-center"
            >
              <div className="text-3xl mb-1">{top3[1].avatar}</div>
              <div className="font-black text-xs sm:text-sm text-slate-900 text-center truncate max-w-[100px]">
                {top3[1].name}
              </div>
              <div className="text-xs text-slate-600 font-black mb-2">{top3[1].score} pts</div>
              <div className="w-full h-24 bg-slate-200 rounded-t-2xl border-4 border-black border-b-0 flex flex-col items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <span className="text-xl sm:text-2xl font-black text-slate-800 font-heading">🥈 2</span>
              </div>
            </motion.div>
          )}

          {/* Rank 1 (Gold Crown) */}
          {top3[0] && (
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex-1 flex flex-col items-center -mt-6"
            >
              <Crown className="w-6 h-6 text-yellow-500 animate-bounce mb-1" />
              <div className="text-4xl mb-1">{top3[0].avatar}</div>
              <div className="font-black text-sm sm:text-base text-slate-900 text-center truncate max-w-[120px]">
                {top3[0].name}
              </div>
              <div className="text-xs text-yellow-700 font-black mb-2">{top3[0].score} pts</div>
              <div className="w-full h-32 bg-yellow-300 rounded-t-2xl border-4 border-black border-b-0 flex flex-col items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <span className="text-2xl sm:text-3xl font-black text-black font-heading">🥇 1</span>
              </div>
            </motion.div>
          )}

          {/* Rank 3 (Bronze) */}
          {top3[2] && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex-1 flex flex-col items-center"
            >
              <div className="text-3xl mb-1">{top3[2].avatar}</div>
              <div className="font-black text-xs sm:text-sm text-slate-900 text-center truncate max-w-[100px]">
                {top3[2].name}
              </div>
              <div className="text-xs text-slate-600 font-black mb-2">{top3[2].score} pts</div>
              <div className="w-full h-20 bg-orange-200 rounded-t-2xl border-4 border-black border-b-0 flex flex-col items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <span className="text-xl sm:text-2xl font-black text-orange-900 font-heading">🥉 3</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Leaderboard Table List */}
        <div className="divide-y-2 divide-black border-3 border-black rounded-2xl overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          {filteredLeaderboard.map((entry, idx) => {
            const isMe = entry.name === player.name;
            return (
              <div
                key={entry.id}
                className={`p-3.5 sm:p-4 flex items-center justify-between transition-colors ${
                  isMe ? 'bg-yellow-100 font-black' : 'bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <span className="w-6 text-center font-black text-slate-900 text-sm">
                    {idx + 1}
                  </span>
                  <span className="text-2xl">{entry.avatar}</span>
                  <div>
                    <div className="font-black text-sm sm:text-base text-slate-900 flex items-center gap-1.5 font-heading">
                      <span>{entry.name}</span>
                      {isMe && (
                        <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded-full font-black uppercase">
                          Kamu
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 font-bold">{entry.date}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="font-black text-base sm:text-lg text-slate-900 font-heading block">
                      {entry.score} pts
                    </span>
                    <span className="text-xs text-yellow-600 font-black flex items-center justify-end gap-0.5">
                      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-500" /> {entry.stars}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lencana Prestasi (Badges Collection) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black text-slate-900 font-heading flex items-center gap-2">
              <Award className="w-6 h-6 text-yellow-500" />
              Lencana & Gelar Juara
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm font-semibold">
              Koleksi lencana dengan menyelesaikan kuis, soal cerita, dan eksplorasi laboratorium!
            </p>
          </div>
          <span className="text-xs font-black px-3 py-1.5 bg-yellow-300 text-black rounded-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            {badges.filter(b => b.isUnlocked).length} / {badges.length} Terbuka
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {badges.map(badge => (
            <div
              key={badge.id}
              className={`p-4 rounded-2xl border-3 border-black transition-all flex items-start gap-3.5 ${
                badge.isUnlocked
                  ? 'bg-yellow-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                  : 'bg-slate-100 opacity-60 grayscale shadow-none'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-bold shrink-0 border-2 border-black ${
                  badge.isUnlocked ? 'bg-yellow-300 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'bg-slate-200 text-slate-400'
                }`}
              >
                {badge.id === 'penakluk-678' ? '💎' : badge.id === 'streak-5' ? '🔥' : badge.id === 'detektif-pemula' ? '🔍' : badge.id === 'raja-soal-cerita' ? '📚' : badge.id === 'timbangan-seimbang' ? '⚖️' : '⭐'}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-black text-sm text-slate-900 font-heading">
                    {badge.title}
                  </h4>
                  {badge.isUnlocked && (
                    <span className="text-[10px] bg-green-300 text-green-950 border border-black px-1.5 py-0.2 rounded-md font-black">
                      Terbuka
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-700 font-medium leading-snug">
                  {badge.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
