import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Zap,
  Timer,
  Trophy,
  RotateCcw,
  Sparkles,
  Flame,
  ArrowRight,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { SoundEffects } from '../../utils/sound';
import { triggerConfetti } from '../../utils/confetti';

interface KilatProps {
  onRewardScore?: (stars?: number) => void;
}

interface SpeedQ {
  numA: number;
  numB: number;
  product: number;
  options: number[];
  hint: string;
}

const SPEED_QUESTIONS: SpeedQ[] = [
  { numA: 45, numB: 6, product: 270, options: [250, 270, 280, 290], hint: '(40×6) + (5×6) = 240 + 30 = 270' },
  { numA: 30, numB: 7, product: 210, options: [180, 210, 240, 270], hint: '3×7 = 21, tambah 1 nol = 210' },
  { numA: 120, numB: 4, product: 480, options: [440, 460, 480, 500], hint: '12×4 = 48, tambah 1 nol = 480' },
  { numA: 25, numB: 8, product: 200, options: [180, 200, 220, 240], hint: '25×4=100, maka 25×8=200' },
  { numA: 300, numB: 6, product: 1800, options: [1600, 1800, 2000, 2200], hint: '3×6=18, tambah 2 nol = 1.800' },
  { numA: 15, numB: 5, product: 75, options: [65, 70, 75, 80], hint: '10×5=50, 5×5=25, 50+25=75' },
  { numA: 23, numB: 4, product: 92, options: [82, 88, 92, 96], hint: '20×4=80, 3×4=12, 80+12=92' },
  { numA: 1200, numB: 3, product: 3600, options: [3200, 3400, 3600, 3800], hint: '12×3=36, tambah 2 nol = 3.600' },
  { numA: 50, numB: 9, product: 450, options: [400, 450, 500, 550], hint: '5×9=45, tambah 1 nol = 450' },
  { numA: 16, numB: 6, product: 96, options: [86, 92, 96, 102], hint: '10×6=60, 6×6=36, 60+36=96' },
];

export const PerkalianModernKilat: React.FC<KilatProps> = ({
  onRewardScore,
}) => {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'review' | 'finished'>('idle');
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(20);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [answersRecord, setAnswersRecord] = useState<{ isCorrect: boolean; timeTaken: number; q: SpeedQ; userChoice: number }[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);

  const timerRef = useRef<any>(null);

  const handleStartGame = () => {
    SoundEffects.playClick();
    setGameState('playing');
    setCurrentIdx(0);
    setScore(0);
    setStreak(0);
    setAnswersRecord([]);
    setTimeLeft(20);
    setSelectedOption(null);
    setQuestionStartTime(Date.now());
  };

  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleTimeOut();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [gameState, currentIdx]);

  const handleTimeOut = () => {
    SoundEffects.playWrong();
    recordAnswer(false, -1, 20);
  };

  const handleChooseOption = (opt: number) => {
    if (gameState !== 'playing' || selectedOption !== null) return;
    clearInterval(timerRef.current);
    setSelectedOption(opt);

    const q = SPEED_QUESTIONS[currentIdx];
    const isCorrect = opt === q.product;
    const timeSpent = Math.max(1, Math.round((Date.now() - questionStartTime) / 1000));

    if (isCorrect) {
      SoundEffects.playCorrect();
      setScore(prev => prev + 10);
      setStreak(prev => prev + 1);
    } else {
      SoundEffects.playWrong();
      setScore(prev => Math.max(0, prev - 2));
      setStreak(0);
    }

    recordAnswer(isCorrect, opt, timeSpent);
  };

  const recordAnswer = (isCorrect: boolean, opt: number, timeTaken: number) => {
    const q = SPEED_QUESTIONS[currentIdx];
    const newRecord = [...answersRecord, { isCorrect, timeTaken, q, userChoice: opt }];
    setAnswersRecord(newRecord);
    setGameState('review');
  };

  const handleNextQuestion = () => {
    SoundEffects.playClick();
    if (currentIdx < SPEED_QUESTIONS.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOption(null);
      setTimeLeft(20);
      setQuestionStartTime(Date.now());
      setGameState('playing');
    } else {
      setGameState('finished');
      const correctCount = answersRecord.filter(r => r.isCorrect).length;
      if (correctCount >= 8) {
        SoundEffects.playFanfare();
        triggerConfetti();
      }
      onRewardScore?.(Math.min(3, Math.floor(correctCount / 3)) || 1);
    }
  };

  const currentQ = SPEED_QUESTIONS[currentIdx];
  const correctCount = answersRecord.filter(r => r.isCorrect).length;
  const accuracyPct = answersRecord.length > 0 ? Math.round((correctCount / answersRecord.length) * 100) : 0;
  const avgTime = answersRecord.length > 0 ? (answersRecord.reduce((a, b) => a + b.timeTaken, 0) / answersRecord.length).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* Intro */}
      {gameState === 'idle' && (
        <div className="bg-slate-900/90 backdrop-blur-xl border border-indigo-500/30 rounded-3xl p-6 sm:p-10 shadow-xl shadow-indigo-950/40 text-center max-w-xl mx-auto space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-4xl mx-auto shadow-lg shadow-amber-500/30">
            ⚡
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl sm:text-3xl font-black text-white font-heading">
              Misi Kilat 20 Detik
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              Jawab 10 soal perkalian kilat dengan batas waktu <strong>20 detik</strong> per soal. Raih skor setinggi mungkin dan pertahankan streak combo!
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700">
              <div className="text-lg">⏱️ 20s</div>
              <div className="text-[10px] text-slate-400 font-bold mt-0.5">Per Soal</div>
            </div>
            <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700">
              <div className="text-lg">🎯 +10 Poin</div>
              <div className="text-[10px] text-slate-400 font-bold mt-0.5">Tiap Benar</div>
            </div>
            <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700">
              <div className="text-lg">🏆 10 Soal</div>
              <div className="text-[10px] text-slate-400 font-bold mt-0.5">Total Misi</div>
            </div>
          </div>

          <button
            onClick={handleStartGame}
            className="w-full py-4 bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 hover:from-amber-500 hover:to-pink-600 text-white font-black text-sm sm:text-base rounded-2xl shadow-lg shadow-amber-500/30 cursor-pointer font-heading flex items-center justify-center gap-2"
          >
            <Zap className="w-5 h-5 fill-white" />
            <span>Mulai Misi Kilat Sekarang!</span>
          </button>
        </div>
      )}

      {/* Playing Screen */}
      {(gameState === 'playing' || gameState === 'review') && (
        <div className="bg-slate-900/90 backdrop-blur-xl border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-xl shadow-indigo-950/40 space-y-6">
          <div className="flex items-center justify-between gap-3 border-b border-indigo-500/20 pb-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-indigo-500/20 border border-indigo-400/30 rounded-xl flex items-center justify-center font-bold text-xs text-indigo-300 font-mono">
                #{currentIdx + 1}
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Soal</span>
                <div className="text-xs font-bold text-white">
                  {currentIdx + 1} dari {SPEED_QUESTIONS.length}
                </div>
              </div>
            </div>

            {/* Timer Capsule */}
            <div
              className={`px-4 py-2 rounded-2xl font-mono font-black text-xs sm:text-sm flex items-center gap-2 border ${
                timeLeft <= 5
                  ? 'bg-rose-500/20 text-rose-300 border-rose-400/50 animate-pulse'
                  : 'bg-indigo-500/20 text-indigo-200 border-indigo-400/30'
              }`}
            >
              <Timer className="w-4 h-4" />
              <span>{timeLeft}s Tersisa</span>
            </div>

            {/* Score & Streak */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400">Skor</span>
                <div className="text-base font-black text-amber-400 font-mono">{score} Poin</div>
              </div>
              {streak >= 2 && (
                <div className="px-2.5 py-1 bg-pink-500/20 border border-pink-400/30 text-pink-300 rounded-xl text-xs font-black flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" />
                  <span>{streak}x</span>
                </div>
              )}
            </div>
          </div>

          {/* Question Box */}
          <div className="text-center py-8 bg-slate-950/80 border border-indigo-500/30 rounded-2xl">
            <span className="text-xs font-black uppercase text-indigo-400 tracking-wider">
              Hitung Cepat:
            </span>
            <div className="text-4xl sm:text-6xl font-black text-white font-heading mt-2">
              {currentQ.numA} × {currentQ.numB} = ?
            </div>
          </div>

          {/* Option Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {currentQ.options.map(opt => {
              const isSelected = selectedOption === opt;
              const isRight = opt === currentQ.product;
              let style = 'bg-slate-800/80 border-slate-700 text-white hover:bg-slate-700 hover:border-indigo-400';

              if (gameState === 'review') {
                if (isRight) {
                  style = 'bg-emerald-500/30 border-emerald-400 text-emerald-200 ring-2 ring-emerald-400';
                } else if (isSelected && !isRight) {
                  style = 'bg-rose-500/30 border-rose-400 text-rose-200 line-through opacity-70';
                } else {
                  style = 'bg-slate-900/50 border-slate-800 text-slate-500 opacity-50';
                }
              }

              return (
                <button
                  key={opt}
                  disabled={gameState === 'review'}
                  onClick={() => handleChooseOption(opt)}
                  className={`p-4 sm:p-5 rounded-2xl border font-mono text-2xl sm:text-3xl font-black transition-all cursor-pointer shadow-md ${style}`}
                >
                  {opt.toLocaleString('id-ID')}
                </button>
              );
            })}
          </div>

          {/* Review next */}
          {gameState === 'review' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-slate-950 border border-indigo-500/30 rounded-2xl space-y-3"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-300">💡 {currentQ.hint}</span>
                <span className="text-slate-400">
                  Kunci: <strong className="text-emerald-400 font-mono">{currentQ.product}</strong>
                </span>
              </div>
              <button
                onClick={handleNextQuestion}
                className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-indigo-500/30 cursor-pointer font-heading flex items-center justify-center gap-2"
              >
                <span>{currentIdx < SPEED_QUESTIONS.length - 1 ? 'Soal Berikutnya' : 'Lihat Hasil Akhir'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </div>
      )}

      {/* Finished Screen */}
      {gameState === 'finished' && (
        <div className="bg-slate-900/90 backdrop-blur-xl border border-indigo-500/30 rounded-3xl p-6 sm:p-10 shadow-xl shadow-indigo-950/40 text-center max-w-xl mx-auto space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center text-4xl mx-auto shadow-lg shadow-emerald-500/30">
            🏆
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl sm:text-3xl font-black text-white font-heading">
              Misi Kilat Selesai!
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 font-medium">
              {accuracyPct >= 80 ? '🎉 Luar biasa! Kecepatan dan ketepatanmu setingkat Master!' : 'Bagus! Terus berlatih agar semakin tangkas!'}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-2xl">
              <div className="text-[10px] uppercase font-bold text-slate-400">Skor Akhir</div>
              <div className="text-xl font-black text-amber-400 font-mono mt-0.5">{score} Poin</div>
            </div>
            <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-2xl">
              <div className="text-[10px] uppercase font-bold text-slate-400">Benar</div>
              <div className="text-xl font-black text-emerald-400 font-mono mt-0.5">{correctCount}</div>
            </div>
            <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-2xl">
              <div className="text-[10px] uppercase font-bold text-slate-400">Akurasi</div>
              <div className="text-xl font-black text-pink-400 font-mono mt-0.5">{accuracyPct}%</div>
            </div>
            <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-2xl">
              <div className="text-[10px] uppercase font-bold text-slate-400">Rata2 Waktu</div>
              <div className="text-xl font-black text-sky-400 font-mono mt-0.5">{avgTime}s</div>
            </div>
          </div>

          <button
            onClick={handleStartGame}
            className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm rounded-xl border border-slate-700 hover:border-indigo-400 transition-all cursor-pointer font-heading flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Main Ulang Misi Kilat</span>
          </button>
        </div>
      )}
    </div>
  );
};
