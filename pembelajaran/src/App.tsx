import React, { useState, useEffect } from "react";
import { GameMode, StudentProfile, LeaderboardEntry } from "./types";
import { Navbar } from "./components/Navbar";
import { BalanceScaleVisualizer } from "./components/BalanceScaleVisualizer";
import { AnimatedStoryMode } from "./components/AnimatedStoryMode";
import { QuizAdventure } from "./components/QuizAdventure";
import { SpeedChallenge } from "./components/SpeedChallenge";
import { LeaderboardView } from "./components/LeaderboardView";
import { BadgesModal } from "./components/BadgesModal";
import { motion, AnimatePresence } from "motion/react";
import { playLevelUpSound, playStarSound } from "./utils/audio";
import confetti from "canvas-confetti";

const INITIAL_PROFILE: StudentProfile = {
  id: "student_me",
  name: "Detektif Cilik",
  avatar: "🦊",
  grade: "Kelas 3 SD",
  xp: 450,
  stars: 12,
  level: 2,
  rankTitle: "Penyelidik Angka",
  highScoreSpeed: 280,
  completedStories: ["misi_toko_kue"],
  completedLevels: [1, 2],
  streakDays: 3,
  badges: ["b1", "b2", "b5"],
};

const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
  {
    id: "std_1",
    name: "Rian Aditya",
    avatar: "🦁",
    grade: "Kelas 4 SD",
    xp: 1250,
    stars: 34,
    solvedCount: 48,
    speedScore: 520,
    rankTitle: "Master Aljabar",
    isCurrentUser: false,
  },
  {
    id: "std_2",
    name: "Siti Nurhaliza",
    avatar: "🐰",
    grade: "Kelas 3 SD",
    xp: 980,
    stars: 26,
    solvedCount: 35,
    speedScore: 430,
    rankTitle: "Penyelidik Angka",
    isCurrentUser: false,
  },
  {
    id: "student_me",
    name: "Detektif Cilik",
    avatar: "🦊",
    grade: "Kelas 3 SD",
    xp: 450,
    stars: 12,
    solvedCount: 15,
    speedScore: 280,
    rankTitle: "Penyelidik Angka",
    isCurrentUser: true,
  },
  {
    id: "std_3",
    name: "Budi Santoso",
    avatar: "🐼",
    grade: "Kelas 3 SD",
    xp: 410,
    stars: 10,
    solvedCount: 14,
    speedScore: 210,
    rankTitle: "Detektif Pemula",
    isCurrentUser: false,
  },
  {
    id: "std_4",
    name: "Dewi Lestari",
    avatar: "🦉",
    grade: "Kelas 4 SD",
    xp: 350,
    stars: 9,
    solvedCount: 12,
    speedScore: 190,
    rankTitle: "Detektif Pemula",
    isCurrentUser: false,
  },
];

export default function App() {
  const [currentMode, setCurrentMode] = useState<GameMode>("learn");
  const [profile, setProfile] = useState<StudentProfile>(() => {
    const saved = localStorage.getItem("detektif_profile_sd");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_PROFILE;
  });

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => {
    const saved = localStorage.getItem("detektif_leaderboard_sd");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_LEADERBOARD;
  });

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Sync profile to localStorage
  useEffect(() => {
    localStorage.setItem("detektif_profile_sd", JSON.stringify(profile));
    // Also sync current user in leaderboard
    setLeaderboard((prev) =>
      prev.map((entry) =>
        entry.isCurrentUser || entry.id === profile.id
          ? {
              ...entry,
              name: profile.name,
              avatar: profile.avatar,
              grade: profile.grade,
              xp: profile.xp,
              stars: profile.stars,
              speedScore: Math.max(entry.speedScore, profile.highScoreSpeed),
              rankTitle: profile.rankTitle,
            }
          : entry
      )
    );
  }, [profile]);

  useEffect(() => {
    localStorage.setItem("detektif_leaderboard_sd", JSON.stringify(leaderboard));
  }, [leaderboard]);

  const handleEarnXp = (amount: number, starsAmount: number) => {
    setProfile((prev) => {
      const newXp = prev.xp + amount;
      const newStars = prev.stars + starsAmount;
      const newLevel = Math.floor(newXp / 300) + 1;
      let newRank = prev.rankTitle;

      if (newLevel >= 5) newRank = "Profesor Matematika";
      else if (newLevel >= 4) newRank = "Master Aljabar";
      else if (newLevel >= 3) newRank = "Penyelidik Angka";
      else if (newLevel >= 2) newRank = "Detektif Cilik";

      if (newLevel > prev.level) {
        playLevelUpSound();
        confetti({
          particleCount: 100,
          spread: 90,
          origin: { y: 0.5 },
        });
      }

      return {
        ...prev,
        xp: newXp,
        stars: newStars,
        level: newLevel,
        rankTitle: newRank,
      };
    });
  };

  const handleUpdateSpeedScore = (speedScore: number) => {
    setProfile((prev) => ({
      ...prev,
      highScoreSpeed: Math.max(prev.highScoreSpeed, speedScore),
    }));
  };

  const handleAddLeaderboardStudent = (entry: LeaderboardEntry) => {
    setLeaderboard((prev) => [entry, ...prev]);
  };

  return (
    <div className="min-h-screen bg-sky-50 text-slate-800 flex flex-col font-sans selection:bg-orange-200">
      {/* Top Navbar */}
      <Navbar
        currentMode={currentMode}
        onSelectMode={setCurrentMode}
        profile={profile}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <AnimatePresence mode="wait">
          {currentMode === "learn" && (
            <motion.div
              key="learn"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              <BalanceScaleVisualizer />
            </motion.div>
          )}

          {currentMode === "story" && (
            <motion.div
              key="story"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              <AnimatedStoryMode
                onEarnXp={handleEarnXp}
                completedStories={profile.completedStories}
                studentName={profile.name}
              />
            </motion.div>
          )}

          {currentMode === "adventure" && (
            <motion.div
              key="adventure"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              <QuizAdventure
                onEarnXp={handleEarnXp}
                studentLevel={profile.level}
              />
            </motion.div>
          )}

          {currentMode === "speed" && (
            <motion.div
              key="speed"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              <SpeedChallenge
                onEarnXp={handleEarnXp}
                onUpdateSpeedScore={handleUpdateSpeedScore}
                bestSpeedScore={profile.highScoreSpeed}
              />
            </motion.div>
          )}

          {currentMode === "leaderboard" && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              <LeaderboardView
                entries={leaderboard}
                currentUserId={profile.id}
                onAddStudent={handleAddLeaderboardStudent}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Vibrant Dark Footer */}
      <footer className="bg-slate-800 text-slate-300 py-4 px-6 sm:px-8 border-t-4 border-slate-900 shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-bold">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-emerald-400 font-extrabold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              ● Online Sekarang: 1,402 Teman Detektif
            </span>
            <span className="text-slate-400">● Materi: Menentukan Bilangan yang Belum Diketahui</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <span className="bg-slate-700 text-sky-300 px-2.5 py-0.5 rounded-full font-mono">678 - [ ? ] = 243</span>
            <span>•</span>
            <span className="text-orange-400">Matematika SD</span>
          </div>
        </div>
      </footer>

      {/* Profile & Badges Modal */}
      <BadgesModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        onUpdateAvatar={(newAvatar) => setProfile((p) => ({ ...p, avatar: newAvatar }))}
        onUpdateName={(newName) => setProfile((p) => ({ ...p, name: newName }))}
      />
    </div>
  );
}
