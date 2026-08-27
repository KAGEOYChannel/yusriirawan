import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { MathProblem } from "../types";
import { generateRandomProblem } from "../data/curriculumData";
import { playCorrectSound, playWrongSound, playStarSound, playLevelUpSound, playClickSound } from "../utils/audio";
import confetti from "canvas-confetti";
import { Timer, Zap, Trophy, Play, RotateCcw, Flame, CheckCircle2, ArrowRight } from "lucide-react";

interface SpeedChallengeProps {
  onEarnXp: (amount: number, stars: number) => void;
  onUpdateSpeedScore: (score: number) => void;
  bestSpeedScore: number;
}

export const SpeedChallenge: React.FC<SpeedChallengeProps> = ({
  onEarnXp,
  onUpdateSpeedScore,
  bestSpeedScore,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [solvedCount, setSolvedCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [currentProblem, setCurrentProblem] = useState<MathProblem>(generateRandomProblem("medium"));
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [gameOver, setGameOver] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startGame = () => {
    setIsPlaying(true);
    setGameOver(false);
    setTimeLeft(60);
    setScore(0);
    setSolvedCount(0);
    setStreak(0);
    setCurrentProblem(generateRandomProblem("medium"));
  };

  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleGameOver();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  const handleGameOver = () => {
    setIsPlaying(false);
    setGameOver(true);
    playLevelUpSound();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
    onUpdateSpeedScore(score);
    onEarnXp(score, Math.floor(score / 200));
  };

  const handleAnswer = (answer: number) => {
    if (!isPlaying) return;

    if (answer === currentProblem.missingValue) {
      playCorrectSound();
      playStarSound();
      setFeedback("correct");

      const newStreak = streak + 1;
      setStreak(newStreak);
      setSolvedCount((prev) => prev + 1);

      const multiplier = newStreak >= 5 ? 3 : newStreak >= 3 ? 2 : 1;
      const points = 50 * multiplier;
      setScore((prev) => prev + points);

      setTimeout(() => {
        setFeedback(null);
        setCurrentProblem(generateRandomProblem(newStreak > 4 ? "medium" : "easy"));
      }, 200);
    } else {
      playWrongSound();
      setFeedback("wrong");
      setStreak(0);
      setTimeout(() => {
        setFeedback(null);
        setCurrentProblem(generateRandomProblem("easy"));
      }, 300);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Header Banner - Orange Theme with border-b-8 */}
      <div className="bg-orange-500 rounded-[32px] sm:rounded-[36px] p-6 sm:p-8 text-white shadow-lg border-b-8 border-orange-700 flex items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-orange-900/25 text-white text-xs font-black tracking-wide border border-white/20 mb-2">
            <Zap size={14} className="text-yellow-300 fill-yellow-300" /> TANTANGAN KILAT 60 DETIK
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Kuis Kecepatan Berhitung</h2>
          <p className="text-orange-100 text-xs sm:text-sm mt-1 font-bold">
            Jawab sebanyak mungkin soal dalam 60 detik untuk menempati Peringkat Teratas!
          </p>
        </div>

        <div className="hidden sm:flex flex-col items-center bg-orange-600/60 backdrop-blur-md px-5 py-2.5 rounded-2xl border-2 border-white/40 shadow-xs">
          <span className="text-[10px] font-black uppercase text-orange-200 tracking-wider">Rekor Terbaik</span>
          <span className="text-2xl font-black font-mono text-white">{bestSpeedScore} XP</span>
        </div>
      </div>

      {!isPlaying && !gameOver ? (
        /* Start Screen */
        <div className="bg-white rounded-[36px] sm:rounded-[40px] p-8 sm:p-10 border-4 border-sky-200 shadow-xl text-center space-y-6">
          <div className="w-20 h-20 bg-yellow-400 text-slate-950 rounded-3xl flex items-center justify-center mx-auto text-4xl shadow-md border-2 border-yellow-200 transform -rotate-3">
            ⚡
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">Siap Menguji Kecepatanmu?</h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mt-2 font-bold leading-relaxed">
              Kamu akan diberikan berbagai soal bilangan yang hilang (contoh: <code className="bg-sky-100 text-sky-900 px-2 py-0.5 rounded-md font-mono">678 - ... = 243</code>).
              Kumpulkan kombo beruntun untuk melipatgandakan skor!
            </p>
          </div>

          <button
            id="start-speed-btn"
            onClick={startGame}
            className="px-9 py-4 bg-orange-500 hover:bg-orange-600 border-b-4 border-orange-700 active:mt-1 active:border-b-0 text-white font-black text-base rounded-2xl shadow-md transition-all cursor-pointer inline-flex items-center gap-2 transform hover:scale-105 active:scale-95"
          >
            <Play size={20} />
            <span>Mulai Sekarang (60 Detik)</span>
          </button>
        </div>
      ) : isPlaying ? (
        /* Active Game Screen */
        <div className="bg-white rounded-[36px] sm:rounded-[40px] p-6 sm:p-8 border-4 border-sky-200 shadow-xl space-y-6">
          {/* Game Stats Header */}
          <div className="flex items-center justify-between bg-sky-50 p-4 rounded-3xl border-2 border-sky-200">
            {/* Timer */}
            <div className="flex items-center gap-2">
              <Timer size={24} className={timeLeft <= 10 ? "text-pink-600 animate-spin" : "text-sky-600"} />
              <div>
                <span className="text-[10px] uppercase font-black text-slate-500 block">Sisa Waktu</span>
                <span className={`text-2xl font-black font-mono ${timeLeft <= 10 ? "text-pink-600" : "text-slate-900"}`}>
                  {timeLeft}s
                </span>
              </div>
            </div>

            {/* Streak Multiplier */}
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-orange-100 border-2 border-orange-300 text-orange-950 text-xs font-black shadow-2xs">
              <Flame size={18} className="text-orange-500 fill-orange-500 animate-bounce" />
              <span>{streak}x Combo {streak >= 3 && `(x${streak >= 5 ? 3 : 2})`}</span>
            </div>

            {/* Current Score */}
            <div className="text-right">
              <span className="text-[10px] uppercase font-black text-slate-500 block">Skor Kamu</span>
              <span className="text-2xl font-black font-mono text-sky-700">{score}</span>
            </div>
          </div>

          {/* Equation Stage */}
          <div className={`py-8 rounded-3xl text-center border-3 border-dashed transition-all ${
            feedback === "correct"
              ? "bg-emerald-100 border-emerald-400"
              : feedback === "wrong"
              ? "bg-pink-100 border-pink-400"
              : "bg-sky-50 border-sky-300"
          }`}>
            <span className="text-xs font-black text-sky-700 uppercase tracking-wider block mb-2">
              Tentukan Bilangan yang Hilang:
            </span>
            <div className="text-3xl sm:text-5xl font-black font-mono tracking-tight text-slate-900">
              {currentProblem.equation.replace("...", "[ ? ]")}
            </div>
          </div>

          {/* 4 Choices */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {currentProblem.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(opt)}
                className="py-4 rounded-2xl bg-white hover:bg-sky-50 border-3 border-sky-200 hover:border-sky-400 text-slate-900 font-mono font-black text-xl sm:text-2xl shadow-xs transition-all cursor-pointer active:scale-95"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Game Over Screen */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[36px] sm:rounded-[40px] p-8 border-4 border-yellow-300 shadow-xl text-center space-y-6"
        >
          <div className="w-20 h-20 bg-yellow-400 text-slate-950 rounded-3xl flex items-center justify-center mx-auto text-4xl shadow-lg border-2 border-yellow-200 transform -rotate-3">
            🏆
          </div>

          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">WAKTU HABIS!</h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 font-bold">Kerja bagus! Kamu berhitung sangat cepat!</p>
          </div>

          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
            <div className="p-3.5 bg-sky-50 rounded-2xl border-2 border-sky-200">
              <span className="text-[11px] text-sky-700 font-black block">Skor Akhir</span>
              <span className="text-xl sm:text-2xl font-black text-sky-950 font-mono">{score}</span>
            </div>
            <div className="p-3.5 bg-emerald-50 rounded-2xl border-2 border-emerald-200">
              <span className="text-[11px] text-emerald-700 font-black block">Soal Terjawab</span>
              <span className="text-xl sm:text-2xl font-black text-emerald-950 font-mono">{solvedCount}</span>
            </div>
            <div className="p-3.5 bg-orange-50 rounded-2xl border-2 border-orange-200">
              <span className="text-[11px] text-orange-700 font-black block">Max Combo</span>
              <span className="text-xl sm:text-2xl font-black text-orange-950 font-mono">{streak}x</span>
            </div>
          </div>

          <button
            onClick={startGame}
            className="px-8 py-3.5 bg-orange-500 hover:bg-orange-600 border-b-4 border-orange-700 active:mt-1 active:border-b-0 text-white font-black text-sm rounded-2xl shadow-md cursor-pointer inline-flex items-center gap-2"
          >
            <RotateCcw size={18} />
            <span>Main Lagi</span>
          </button>
        </motion.div>
      )}
    </div>
  );
};
