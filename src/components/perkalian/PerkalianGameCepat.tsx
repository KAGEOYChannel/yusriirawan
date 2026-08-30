import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Zap,
  Timer,
  Trophy,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Sparkles,
  Flame,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { SoundEffects } from '../../utils/sound';
import { triggerConfetti } from '../../utils/confetti';

interface GameProps {
  onUnlockBadge?: (badgeId: string) => void;
  onRewardScore?: (points: number, stars: number) => void;
}

interface SpeedQuestion {
  numA: number;
  numB: number;
  product: number;
  options: number[];
  hint: string;
}

const SPEED_QUESTIONS: SpeedQuestion[] = [
  { numA: 45, numB: 6, product: 270, options: [260, 270, 280, 290], hint: '(40×6) + (5×6) = 240 + 30 = 270' },
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

export const PerkalianGameCepat: React.FC<GameProps> = ({ onUnlockBadge, onRewardScore }) => {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'review' | 'finished'>('idle');
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(20);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [answersRecord, setAnswersRecord] = useState<{ isCorrect: boolean; timeTaken: number; q: SpeedQuestion; userChoice: number }[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);

  const timerRef = useRef<any>(null);

  // Start the game
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

  // Timer Tick
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
      setStreak(prev => {
        const next = prev + 1;
        if (next >= 5) onUnlockBadge?.('streak-5');
        return next;
      });
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
      // Finished
      setGameState('finished');
      const correctCount = answersRecord.filter(r => r.isCorrect).length;
      if (correctCount >= 8) {
        SoundEffects.playFanfare();
        triggerConfetti();
        onUnlockBadge?.('master-perkalian');
      }
      onRewardScore?.(score, Math.min(3, Math.floor(correctCount / 3)));
    }
  };

  const currentQ = SPEED_QUESTIONS[currentIdx];

  // Stats calculation
  const totalAnswers = answersRecord.length;
  const correctAnswers = answersRecord.filter(r => r.isCorrect).length;
  const wrongAnswers = totalAnswers - correctAnswers;
  const accuracyPct = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;
  const avgTime =
    totalAnswers > 0
      ? (answersRecord.reduce((acc, r) => acc + r.timeTaken, 0) / totalAnswers).toFixed(1)
      : '0';

  return (
    <div className="space-y-6">
      {/* Intro Screen */}
      {gameState === 'idle' && (
        <div className="bg-white border-4 border-black rounded-3xl p-6 sm:p-10 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6 max-w-2xl mx-auto">
          <div className="w-20 h-20 bg-yellow-400 border-3 border-black rounded-3xl flex items-center justify-center text-4xl mx-auto shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-bounce">
            ⚡
          </div>
          <div className="space-y-2">
            <h3 className="text-3xl sm:text-4xl font-black text-slate-900 font-heading">
              Tantangan Perkalian Cepat
            </h3>
            <p className="text-sm sm:text-base font-semibold text-slate-700 max-w-lg mx-auto">
              Jawab 10 soal perkalian kilat dengan batas waktu <strong>20 detik</strong> per soal. Raih poin maksimal dan buktikan kecepatan berhitungmu!
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto text-center font-bold text-xs">
            <div className="bg-yellow-100 border-2 border-black p-3 rounded-2xl">
              <div className="text-lg">⏱️ 20s</div>
              <div className="text-slate-600 mt-0.5">Per Soal</div>
            </div>
            <div className="bg-green-100 border-2 border-black p-3 rounded-2xl">
              <div className="text-lg">🎯 +10 Poin</div>
              <div className="text-slate-600 mt-0.5">Jawaban Benar</div>
            </div>
            <div className="bg-pink-100 border-2 border-black p-3 rounded-2xl">
              <div className="text-lg">🏆 10 Soal</div>
              <div className="text-slate-600 mt-0.5">Total Misi</div>
            </div>
          </div>

          <button
            onClick={handleStartGame}
            className="px-8 py-4 bg-yellow-300 hover:bg-yellow-400 text-black font-black text-lg rounded-2xl border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none cursor-pointer font-heading flex items-center justify-center gap-2 mx-auto"
          >
            <Zap className="w-6 h-6 fill-black" />
            <span>Mulai Tantangan Kilat!</span>
          </button>
        </div>
      )}

      {/* Playing / Review Screen */}
      {(gameState === 'playing' || gameState === 'review') && (
        <div className="bg-white border-4 border-black rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6">
          {/* Top Bar: Timer, Progress & Streak */}
          <div className="flex items-center justify-between gap-3 border-b-3 border-black pb-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-yellow-300 border-2 border-black rounded-xl flex items-center justify-center font-black text-sm">
                #{currentIdx + 1}
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-slate-500">Soal</span>
                <div className="text-xs font-black text-slate-800">
                  {currentIdx + 1} dari {SPEED_QUESTIONS.length}
                </div>
              </div>
            </div>

            {/* Timer Capsule */}
            <div
              className={`px-4 py-2 border-2 border-black rounded-2xl font-black text-sm flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                timeLeft <= 5 ? 'bg-rose-300 text-rose-950 animate-pulse' : 'bg-blue-200 text-blue-950'
              }`}
            >
              <Timer className="w-4 h-4" />
              <span>{timeLeft} Detik</span>
            </div>

            {/* Score & Streak */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] font-black uppercase text-slate-500">Skor</span>
                <div className="text-base font-black text-yellow-600 font-heading">{score} Poin</div>
              </div>
              {streak >= 2 && (
                <div className="px-2.5 py-1 bg-pink-400 border-2 border-black rounded-xl text-xs font-black text-black flex items-center gap-1 shadow-xs animate-bounce">
                  <Flame className="w-4 h-4" />
                  <span>{streak}x</span>
                </div>
              )}
            </div>
          </div>

          {/* Question Expression Box */}
          <div className="text-center py-6 bg-slate-50 border-3 border-black rounded-3xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="text-xs font-black uppercase text-slate-500 mb-1">Berapakah Hasilnya?</div>
            <div className="text-4xl sm:text-6xl font-black text-slate-900 font-heading tracking-wide">
              {currentQ.numA} × {currentQ.numB} = <span className="text-yellow-600">?</span>
            </div>
          </div>

          {/* Option Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {currentQ.options.map(opt => {
              const isSelected = selectedOption === opt;
              const isRightAnswer = opt === currentQ.product;
              let btnStyle = 'bg-white hover:bg-yellow-100';

              if (gameState === 'review') {
                if (isRightAnswer) {
                  btnStyle = 'bg-green-300 text-green-950 ring-2 ring-green-600 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]';
                } else if (isSelected && !isRightAnswer) {
                  btnStyle = 'bg-rose-300 text-rose-950 line-through opacity-70';
                } else {
                  btnStyle = 'bg-slate-100 opacity-50';
                }
              }

              return (
                <button
                  key={opt}
                  disabled={gameState === 'review'}
                  onClick={() => handleChooseOption(opt)}
                  className={`p-4 sm:p-5 rounded-2xl border-3 border-black font-heading text-2xl sm:text-3xl font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer ${btnStyle}`}
                >
                  {opt.toLocaleString('id-ID')}
                </button>
              );
            })}
          </div>

          {/* Review Explanation & Next Button */}
          {gameState === 'review' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-yellow-50 border-3 border-black rounded-2xl p-5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="font-black text-sm text-yellow-950 font-heading flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-600" />
                  <span>Pembahasan Cepat:</span>
                </div>
                <div className="text-xs font-black text-slate-700">
                  Kunci Jawaban: <strong className="text-emerald-700">{currentQ.product.toLocaleString('id-ID')}</strong>
                </div>
              </div>

              <p className="text-xs sm:text-sm font-semibold text-slate-800 bg-white p-3 rounded-xl border border-yellow-300">
                💡 {currentQ.hint}
              </p>

              <button
                onClick={handleNextQuestion}
                className="w-full py-3 bg-yellow-300 hover:bg-yellow-400 text-black font-black text-sm rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 cursor-pointer font-heading flex items-center justify-center gap-2"
              >
                <span>{currentIdx < SPEED_QUESTIONS.length - 1 ? 'Soal Berikutnya' : 'Lihat Hasil Akhir'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </div>
      )}

      {/* Finished Summary Screen */}
      {gameState === 'finished' && (
        <div className="bg-white border-4 border-black rounded-3xl p-6 sm:p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6 max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 bg-emerald-400 border-3 border-black rounded-3xl flex items-center justify-center text-4xl mx-auto shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            🏆
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
              Tantangan Perkalian Selesai!
            </h3>
            <p className="text-sm font-semibold text-slate-600">
              {accuracyPct >= 80 ? '🎉 Luar biasa! Kecepatan dan ketepatanmu sangat hebat!' : 'Kerja bagus! Teruslah berlatih agar semakin tangkas!'}
            </p>
          </div>

          {/* Metrics Trio Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-yellow-100 border-2 border-black p-3.5 rounded-2xl">
              <div className="text-xs font-black uppercase text-slate-500">Skor Akhir</div>
              <div className="text-2xl font-black text-yellow-700 font-heading mt-0.5">{score}</div>
            </div>
            <div className="bg-green-100 border-2 border-black p-3.5 rounded-2xl">
              <div className="text-xs font-black uppercase text-slate-500">Benar</div>
              <div className="text-2xl font-black text-green-700 font-heading mt-0.5">{correctAnswers}</div>
            </div>
            <div className="bg-rose-100 border-2 border-black p-3.5 rounded-2xl">
              <div className="text-xs font-black uppercase text-slate-500">Salah</div>
              <div className="text-2xl font-black text-rose-700 font-heading mt-0.5">{wrongAnswers}</div>
            </div>
            <div className="bg-purple-100 border-2 border-black p-3.5 rounded-2xl">
              <div className="text-xs font-black uppercase text-slate-500">Rata-rata Waktu</div>
              <div className="text-2xl font-black text-purple-700 font-heading mt-0.5">{avgTime}s</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={handleStartGame}
              className="w-full sm:w-auto px-6 py-3.5 bg-yellow-300 hover:bg-yellow-400 text-black font-black text-sm rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 cursor-pointer font-heading flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Main Ulang Tantangan</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
