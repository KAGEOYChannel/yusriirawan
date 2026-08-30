import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlayerProfile, LeaderboardEntry, Badge, DifficultyLevel } from './types';
import { INITIAL_BADGES } from './data/badges';
import { Navbar, ActiveTabType } from './components/Navbar';
import { QuizGame } from './components/QuizGame';
import { AnimatedStory } from './components/AnimatedStory';
import { ConceptLab } from './components/ConceptLab';
import { MateriSusunPendek } from './components/MateriSusunPendek';
import { ScratchpadModal } from './components/ScratchpadModal';
import { PrintWorksheetModal } from './components/PrintWorksheetModal';
import { SoundEffects } from './utils/sound';
import { triggerConfetti } from './utils/confetti';
import { Sparkles, BookOpen, Scale, Layers, Heart, Star, CheckCircle, ShieldCheck } from 'lucide-react';

const DEFAULT_LEADERBOARD: LeaderboardEntry[] = [
  { id: '1', name: 'Alif Pratama', avatar: '🦁', score: 380, stars: 28, level: 'hard', date: 'Hari Ini' },
  { id: '2', name: 'Zahra Aulia', avatar: '🦉', score: 340, stars: 24, level: 'hard', date: 'Hari Ini' },
  { id: '3', name: 'Budi Santoso', avatar: '🐱', score: 290, stars: 20, level: 'medium', date: 'Kemarin' },
  { id: '4', name: 'Maya Rahayu', avatar: '🐰', score: 250, stars: 18, level: 'medium', date: 'Kemarin' },
  { id: '5', name: 'Rian Saputra', avatar: '🚀', score: 210, stars: 15, level: 'easy', date: '2 hari lalu' },
  { id: '6', name: 'Dimas Nugraha', avatar: '🤖', score: 180, stars: 12, level: 'easy', date: '3 hari lalu' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTabType>('quiz');
  const [isScratchpadOpen, setIsScratchpadOpen] = useState<boolean>(false);
  const [isPrintOpen, setIsPrintOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Player Profile State
  const [player, setPlayer] = useState<PlayerProfile>(() => {
    try {
      const saved = localStorage.getItem('mtk_player_profile');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return {
      id: 'player-1',
      name: 'Detektif Cilik',
      avatar: '🐱',
      totalScore: 0,
      stars: 0,
      quizzesCompleted: 0,
      storiesCompleted: 0,
      highestStreak: 0,
      unlockedBadges: [],
    };
  });

  // Leaderboard State
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => {
    try {
      const saved = localStorage.getItem('mtk_leaderboard');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return DEFAULT_LEADERBOARD;
  });

  // Badges State
  const [badges, setBadges] = useState<Badge[]>(() => {
    try {
      const saved = localStorage.getItem('mtk_badges');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return INITIAL_BADGES;
  });

  // Init sound state
  useEffect(() => {
    SoundEffects.initFromStorage();
    setIsMuted(SoundEffects.isMuted());
  }, []);

  // Save Player to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('mtk_player_profile', JSON.stringify(player));
    } catch {
      // ignore
    }
  }, [player]);

  // Save Leaderboard to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('mtk_leaderboard', JSON.stringify(leaderboard));
    } catch {
      // ignore
    }
  }, [leaderboard]);

  // Save Badges to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('mtk_badges', JSON.stringify(badges));
    } catch {
      // ignore
    }
  }, [badges]);

  // Toggle Sound Mute
  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    SoundEffects.setMuted(next);
  };

  // Unlock Badge helper
  const handleUnlockBadge = (badgeId: string) => {
    setBadges(prev => {
      const alreadyUnlocked = prev.find(b => b.id === badgeId)?.isUnlocked;
      if (alreadyUnlocked) return prev;

      SoundEffects.playFanfare();
      triggerConfetti();

      return prev.map(b => {
        if (b.id === badgeId) {
          return { ...b, isUnlocked: true, unlockedAt: new Date().toLocaleDateString('id-ID') };
        }
        return b;
      });
    });

    setPlayer(prev => {
      if (prev.unlockedBadges.includes(badgeId)) return prev;
      return {
        ...prev,
        unlockedBadges: [...prev.unlockedBadges, badgeId],
      };
    });
  };

  // Reward points and stars from story or other activities
  const handleRewardScore = (points: number, starsCount: number) => {
    setPlayer(prev => {
      const updatedScore = prev.totalScore + points;
      const updatedStars = prev.stars + starsCount;

      if (updatedStars >= 10) {
        handleUnlockBadge('bintang-emas');
      }

      // Sync player into leaderboard
      syncPlayerToLeaderboard(prev.name, prev.avatar, updatedScore, updatedStars, 'all');

      return {
        ...prev,
        totalScore: updatedScore,
        stars: updatedStars,
        storiesCompleted: prev.storiesCompleted + 1,
      };
    });
  };

  // Sync to Leaderboard
  const syncPlayerToLeaderboard = (
    name: string,
    avatar: string,
    score: number,
    stars: number,
    level: DifficultyLevel | 'all'
  ) => {
    setLeaderboard(prev => {
      const filtered = prev.filter(entry => entry.name !== name);
      const newEntry: LeaderboardEntry = {
        id: `user-${Date.now()}`,
        name,
        avatar,
        score,
        stars,
        level,
        date: 'Baru saja',
        isCurrentPlayer: true,
      };
      return [...filtered, newEntry];
    });
  };

  // Handle Quiz Completion
  const handleQuizCompleted = (
    scoreEarned: number,
    starsEarned: number,
    streakMax: number,
    level: DifficultyLevel
  ) => {
    setPlayer(prev => {
      const newScore = prev.totalScore + scoreEarned;
      const newStars = prev.stars + starsEarned;
      const newStreak = Math.max(prev.highestStreak, streakMax);
      const newQuizzes = prev.quizzesCompleted + 1;

      if (newStars >= 10) {
        handleUnlockBadge('bintang-emas');
      }

      syncPlayerToLeaderboard(prev.name, prev.avatar, newScore, newStars, level);

      return {
        ...prev,
        totalScore: newScore,
        stars: newStars,
        highestStreak: newStreak,
        quizzesCompleted: newQuizzes,
      };
    });
  };

  // Update Player Name / Avatar
  const handleUpdatePlayer = (name: string, avatar: string) => {
    setPlayer(prev => {
      const oldName = prev.name;
      // Also update name in leaderboard
      setLeaderboard(lPrev =>
        lPrev.map(entry => {
          if (entry.name === oldName || entry.isCurrentPlayer) {
            return { ...entry, name, avatar };
          }
          return entry;
        })
      );
      return { ...prev, name, avatar };
    });
  };

  return (
    <div className="min-h-screen bg-blue-50 text-slate-900 font-sans p-3 sm:p-6 flex flex-col selection:bg-yellow-300 selection:text-black">
      <div className="max-w-6xl w-full mx-auto flex flex-col flex-1">
        {/* Top Bento Navigation */}
        <Navbar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          player={player}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onOpenScratchpad={() => setIsScratchpadOpen(true)}
          onOpenPrint={() => setIsPrintOpen(true)}
        />

        {/* Bento Quick-Metrics Trio Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
          {/* Bento Card 1: Progress Level (Green) */}
          <div className="md:col-span-4 bg-green-400 border-4 border-black rounded-3xl p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-xs uppercase tracking-wider text-black opacity-90">Progress Belajar</h4>
              <span className="text-xs font-black bg-black text-white px-2 py-0.5 rounded-full">
                {player.quizzesCompleted + player.storiesCompleted} Misi
              </span>
            </div>
            <div className="my-2">
              <div className="flex items-end gap-1 mb-1.5">
                <span className="text-3xl sm:text-4xl font-black font-heading text-black leading-none">
                  {Math.min(20, player.quizzesCompleted * 2 + player.storiesCompleted * 3 + 1)}
                </span>
                <span className="text-xs font-black text-black opacity-80 mb-0.5">/ 20 Level</span>
              </div>
              <div className="w-full bg-black/20 h-3.5 rounded-full overflow-hidden border border-black/30">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, Math.max(15, (player.quizzesCompleted * 2 + player.storiesCompleted * 3 + 1) * 5))}%`,
                  }}
                />
              </div>
            </div>
            <p className="text-xs font-bold text-black leading-tight">
              {player.stars >= 10 ? '⭐ Detektif Teladan Sekolah!' : '✨ Kumpulkan 10 bintang untuk lencana emas!'}
            </p>
          </div>

          {/* Bento Card 2: Daily Streak (Pink) */}
          <div className="md:col-span-4 bg-pink-400 border-4 border-black rounded-3xl p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between">
            <div>
              <h4 className="font-black text-xs uppercase tracking-wider text-black opacity-90 mb-1">
                Rekor Kombo Api
              </h4>
              <p className="text-2xl sm:text-3xl font-black font-heading text-black">
                {Math.max(player.highestStreak, 1)} KOMBO
              </p>
              <p className="text-xs font-bold text-black mt-0.5">
                {player.highestStreak >= 5 ? '🔥 Api tak terkalahkan!' : 'Jawab benar berturut-turut!'}
              </p>
            </div>
            <div className="text-5xl sm:text-6xl animate-bounce">🔥</div>
          </div>

          {/* Bento Card 3: Next Task / Shortcut (White) */}
          <div className="md:col-span-4 bg-white border-4 border-black rounded-3xl p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-yellow-300 border-2 border-black rounded-2xl flex items-center justify-center text-2xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                🎯
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase text-slate-500">Target Materi Pokok</span>
                <span className="text-sm font-black text-slate-900 font-heading">678 - ... = 243</span>
              </div>
            </div>
            <button
              onClick={() => {
                SoundEffects.playClick();
                setActiveTab('lab');
              }}
              className="w-full py-2 bg-slate-900 hover:bg-black text-white rounded-xl font-black text-xs uppercase tracking-wider mt-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all"
            >
              Eksplor Timbangan Konsep
            </button>
          </div>
        </div>

        {/* Main Bento Dynamic Screen Area */}
        <main className="flex-1 w-full">
          <AnimatePresence mode="wait">
            {activeTab === 'quiz' && (
              <motion.div
                key="quiz"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.18 }}
              >
                <QuizGame
                  onOpenScratchpad={() => setIsScratchpadOpen(true)}
                  onQuizCompleted={handleQuizCompleted}
                  onUnlockBadge={handleUnlockBadge}
                />
              </motion.div>
            )}

            {activeTab === 'story' && (
              <motion.div
                key="story"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.18 }}
              >
                <AnimatedStory
                  onOpenScratchpad={() => setIsScratchpadOpen(true)}
                  onRewardScore={handleRewardScore}
                  onUnlockBadge={handleUnlockBadge}
                />
              </motion.div>
            )}

            {activeTab === 'lab' && (
              <motion.div
                key="lab"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.18 }}
              >
                <ConceptLab onUnlockBadge={handleUnlockBadge} />
              </motion.div>
            )}

            {activeTab === 'materi' && (
              <motion.div
                key="materi"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.18 }}
              >
                <MateriSusunPendek onUnlockBadge={handleUnlockBadge} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Interactive Scratchpad Canvas Modal */}
        <ScratchpadModal
          isOpen={isScratchpadOpen}
          onClose={() => setIsScratchpadOpen(false)}
        />

        {/* Printable Worksheet Modal */}
        <PrintWorksheetModal
          isOpen={isPrintOpen}
          onClose={() => setIsPrintOpen(false)}
        />

        {/* Bento Footer */}
        <footer className="mt-8 bg-white border-4 border-black rounded-2xl p-4 sm:p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center text-xs text-slate-700 space-y-2">
          <div className="flex flex-wrap items-center justify-center gap-3 font-black text-slate-900">
            <span className="bg-yellow-300 border border-black px-2.5 py-0.5 rounded-md">🎯 Contoh Soal: 678 - ... = 243</span>
            <span>•</span>
            <span className="bg-green-300 border border-black px-2.5 py-0.5 rounded-md">⚖️ Timbangan Aljabar Dasar SD</span>
            <span>•</span>
            <span className="bg-pink-300 border border-black px-2.5 py-0.5 rounded-md">📄 pembelajaranMTK.html</span>
          </div>
          <p className="max-w-md mx-auto text-slate-500 font-medium">
            Dirancang khusus untuk pembelajaran interaktif aljabar dasar SD dengan tema Bento Grid. Kompatibel dengan GitHub Pages.
          </p>
        </footer>
      </div>
    </div>
  );
}
