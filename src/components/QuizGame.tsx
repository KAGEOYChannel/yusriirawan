import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DifficultyLevel, Question } from '../types';
import { generateQuestionSet } from '../utils/questionGenerator';
import { SoundEffects } from '../utils/sound';
import { triggerConfetti, triggerGrandCelebration } from '../utils/confetti';
import {
  Heart,
  Flame,
  Star,
  Trophy,
  Sparkles,
  RefreshCw,
  HelpCircle,
  Pencil,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ShieldAlert,
  Award,
} from 'lucide-react';

interface QuizGameProps {
  onOpenScratchpad: () => void;
  onQuizCompleted: (score: number, stars: number, highestStreak: number, level: DifficultyLevel) => void;
  onUnlockBadge: (badgeId: string) => void;
}

export const QuizGame: React.FC<QuizGameProps> = ({
  onOpenScratchpad,
  onQuizCompleted,
  onUnlockBadge,
}) => {
  const [level, setLevel] = useState<DifficultyLevel>('medium');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);

  // Gamification state
  const [score, setScore] = useState<number>(0);
  const [stars, setStars] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [streak, setStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Initialize or restart quiz
  const startNewGame = (selectedLevel: DifficultyLevel = level) => {
    SoundEffects.playClick();
    setLevel(selectedLevel);
    const newQuestions = generateQuestionSet(selectedLevel, 10);
    setQuestions(newQuestions);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setIsCorrect(false);
    setScore(0);
    setStars(0);
    setLives(3);
    setStreak(0);
    setMaxStreak(0);
    setIsGameOver(false);
    setIsCompleted(false);
  };

  useEffect(() => {
    startNewGame(level);
  }, []);

  const currentQ = questions[currentIndex];

  const handleSelectOption = (option: number) => {
    if (isAnswered || isGameOver || isCompleted || !currentQ) return;

    setSelectedOption(option);
    setIsAnswered(true);

    if (option === currentQ.correctAnswer) {
      // Correct!
      setIsCorrect(true);
      SoundEffects.playCorrect();
      triggerConfetti();

      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);

      if (newStreak >= 5) {
        SoundEffects.playStreak(newStreak);
        onUnlockBadge('streak-5');
      }

      // Bonus points for streak
      const pointsEarned = 10 + Math.min(newStreak * 2, 20);
      setScore(prev => prev + pointsEarned);
      setStars(prev => prev + 1);

      // Check for 678 challenge badge
      if (currentQ.num1 === 678 && currentQ.targetResult === 243) {
        onUnlockBadge('penakluk-678');
      }
    } else {
      // Wrong!
      setIsCorrect(false);
      SoundEffects.playWrong();
      setStreak(0);
      const nextLives = lives - 1;
      setLives(nextLives);

      if (nextLives <= 0) {
        setIsGameOver(true);
      }
    }
  };

  const handleNextQuestion = () => {
    SoundEffects.playClick();
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setIsCorrect(false);
    } else {
      // Quiz finished successfully!
      setIsCompleted(true);
      SoundEffects.playFanfare();
      triggerGrandCelebration();
      onUnlockBadge('detektif-pemula');
      onQuizCompleted(score, stars, maxStreak, level);
    }
  };

  if (!currentQ && !isGameOver && !isCompleted) {
    return (
      <div className="text-center py-16">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-amber-500 mb-2" />
        <p className="font-bold text-amber-900">Menyiapkan tantangan matematika...</p>
      </div>
    );
  }

  // Level selector buttons
  const levelButtons = [
    { id: 'easy', label: 'Level 1: Pemula (1 - 99)', color: 'bg-emerald-400 text-black' },
    { id: 'medium', label: 'Level 2: Jagoan (100 - 500)', color: 'bg-yellow-400 text-black' },
    { id: 'hard', label: 'Level 3: Master (678 & Ratusan)', color: 'bg-pink-400 text-black' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Top Header: Difficulty Tiers & Stats HUD */}
      <div className="bg-white border-4 border-black rounded-3xl p-4 sm:p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Level Switcher */}
          <div className="flex flex-wrap gap-2">
            {levelButtons.map(btn => (
              <button
                key={btn.id}
                onClick={() => startNewGame(btn.id as DifficultyLevel)}
                className={`px-3 py-1.5 rounded-xl font-black text-xs sm:text-sm border-2 border-black transition-all ${
                  level === btn.id
                    ? `${btn.color} shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] scale-102`
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 shadow-none'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Action: Open Scratchpad */}
          <button
            onClick={onOpenScratchpad}
            className="px-3.5 py-1.5 bg-yellow-300 hover:bg-yellow-400 text-black border-2 border-black rounded-xl font-black text-xs flex items-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all"
          >
            <Pencil className="w-3.5 h-3.5 text-black" /> Papan Cakar
          </button>
        </div>

        {/* Bento HUD Bars: Progress, Hearts, Streak, Score */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Progress */}
          <div className="flex flex-col bg-slate-50 p-3 rounded-2xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Soal</span>
            <span className="text-base sm:text-lg font-black text-slate-900 font-heading">
              {currentIndex + 1} / {questions.length}
            </span>
          </div>

          {/* Lives / Hearts */}
          <div className="flex flex-col bg-slate-50 p-3 rounded-2xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-600">Nyawa</span>
            <div className="flex items-center gap-1 mt-0.5">
              {[...Array(3)].map((_, i) => (
                <Heart
                  key={i}
                  className={`w-5 h-5 transition-transform ${
                    i < lives ? 'text-rose-500 fill-rose-500 scale-110' : 'text-slate-300'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Streak Combo */}
          <div className="flex flex-col bg-pink-100 p-3 rounded-2xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <span className="text-[10px] font-black uppercase tracking-wider text-pink-900">Kombo Api</span>
            <div className="flex items-center gap-1 text-base sm:text-lg font-black text-pink-950 font-heading">
              <Flame className={`w-5 h-5 ${streak >= 3 ? 'text-pink-600 fill-pink-600 animate-bounce' : 'text-slate-400'}`} />
              <span>{streak}x</span>
            </div>
          </div>

          {/* Total Score & Stars */}
          <div className="flex flex-col bg-yellow-100 p-3 rounded-2xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <span className="text-[10px] font-black uppercase tracking-wider text-yellow-900">Poin & Bintang</span>
            <div className="flex items-center gap-1.5 text-base sm:text-lg font-black text-yellow-950 font-heading">
              <span>{score} XP</span>
              <span className="text-xs bg-yellow-400 border border-black text-black px-1.5 py-0.5 rounded-md flex items-center gap-0.5 font-bold">
                <Star className="w-3 h-3 fill-yellow-600 text-yellow-600" /> {stars}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Question Card (When game is active) */}
      {!isGameOver && !isCompleted && currentQ && (
        <div className="bg-white border-4 border-black rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col relative overflow-hidden space-y-6">
          {/* Top Material Badge */}
          <div className="flex items-center justify-between">
            <span className="bg-purple-100 text-purple-700 border-2 border-purple-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
              Materi: Aljabar Dasar
            </span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {level === 'easy' ? 'Level 1' : level === 'medium' ? 'Level 2' : 'Level 3'}
            </span>
          </div>

          {/* Question Title & Context */}
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
              Tebak Bilangan Misteri
            </h2>
            <p className="text-slate-600 text-sm sm:text-base font-semibold">
              {currentQ.storyText || 'Lengkapi titik-titik pada persamaan berikut ini:'}
            </p>
          </div>

          {/* Bento Equation Showcase Box */}
          <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-full max-w-lg">
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 font-black text-3xl sm:text-5xl">
                {/* Part 1 */}
                {currentQ.missingPosition === 'first' ? (
                  <div className="w-20 sm:w-24 h-14 sm:h-16 bg-yellow-100 border-4 border-yellow-400 rounded-lg flex items-center justify-center text-yellow-600 font-heading">
                    {isAnswered ? currentQ.correctAnswer : '?'}
                  </div>
                ) : (
                  <span className="text-blue-600 font-heading">{currentQ.num1}</span>
                )}

                {/* Operator */}
                <span className="text-slate-400 font-mono text-3xl sm:text-5xl font-bold">
                  {currentQ.operator}
                </span>

                {/* Part 2 */}
                {currentQ.missingPosition === 'second' ? (
                  <div className="w-20 sm:w-24 h-14 sm:h-16 bg-yellow-100 border-4 border-yellow-400 rounded-lg flex items-center justify-center text-yellow-600 font-heading">
                    {isAnswered ? currentQ.correctAnswer : '?'}
                  </div>
                ) : (
                  <span className="text-blue-600 font-heading">{currentQ.num2}</span>
                )}

                {/* Equals */}
                <span className="text-slate-400 font-mono text-3xl sm:text-5xl font-bold">=</span>

                {/* Result */}
                <span className="text-green-600 font-heading">{currentQ.targetResult}</span>
              </div>
            </div>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-2">
            {currentQ.options.map((opt, i) => {
              const isPicked = selectedOption === opt;
              const isTargetCorrect = opt === currentQ.correctAnswer;

              let btnStyle = 'bg-white hover:bg-yellow-50 border-3 border-black text-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none';
              if (isAnswered) {
                if (isTargetCorrect) {
                  btnStyle = 'bg-green-400 border-3 border-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] scale-102';
                } else if (isPicked) {
                  btnStyle = 'bg-rose-400 border-3 border-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]';
                } else {
                  btnStyle = 'bg-slate-100 border-2 border-slate-300 text-slate-400 opacity-60 shadow-none';
                }
              }

              return (
                <button
                  key={i}
                  id={`btn-quiz-option-${i}`}
                  onClick={() => handleSelectOption(opt)}
                  disabled={isAnswered}
                  className={`p-4 sm:p-5 rounded-2xl font-black text-xl sm:text-2xl transition-all flex items-center justify-between ${btnStyle}`}
                >
                  <span className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center text-sm font-black font-heading">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="font-heading tracking-wider text-2xl sm:text-3xl">{opt}</span>
                  <span className="w-8">
                    {isAnswered && isTargetCorrect && <CheckCircle2 className="w-7 h-7 text-black stroke-[3] ml-auto" />}
                    {isAnswered && isPicked && !isTargetCorrect && <XCircle className="w-7 h-7 text-black stroke-[3] ml-auto" />}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Explanation Banner after answering */}
          {isAnswered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-5 rounded-2xl border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-2 ${
                isCorrect ? 'bg-green-100' : 'bg-rose-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`font-black font-heading text-lg ${isCorrect ? 'text-green-950' : 'text-rose-950'}`}>
                  {isCorrect ? '🎉 Benar Sekali! Pintar!' : '💡 Pembahasan Detektif:'}
                </span>
                <span className="text-xs font-black text-black bg-white px-2.5 py-1 rounded-lg border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                  {currentQ.explanation.rule}
                </span>
              </div>
              <p className="text-sm font-bold text-slate-800">
                {currentQ.explanation.step1}
              </p>
              <div className="bg-white p-3 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-sm sm:text-base font-black text-slate-900 font-mono">
                👉 {currentQ.explanation.step2}
              </div>

              {/* Next Question Button */}
              <div className="pt-2 flex justify-end">
                <button
                  id="btn-next-question"
                  onClick={handleNextQuestion}
                  className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-black rounded-xl border-b-4 border-blue-800 active:translate-y-1 active:border-b-0 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2 text-sm sm:text-base"
                >
                  {currentIndex + 1 < questions.length ? (
                    <>
                      Soal Berikutnya <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Lihat Hasil Akhir <Trophy className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Game Over Screen */}
      {isGameOver && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border-4 border-black rounded-3xl p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center space-y-6 max-w-lg mx-auto"
        >
          <div className="w-20 h-20 bg-rose-200 border-2 border-black rounded-full flex items-center justify-center mx-auto text-4xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            💔
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
              Nyawa Habis! Jangan Menyerah!
            </h3>
            <p className="text-slate-600 text-sm font-medium">
              Matematika butuh latihan dan ketelitian. Kamu berhasil mengumpulkan skor <strong>{score} XP</strong>.
            </p>
          </div>

          <div className="bg-rose-50 p-4 rounded-2xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex justify-around text-slate-900 font-black">
            <div>
              <div className="text-xs text-rose-800 uppercase">Poin XP</div>
              <div className="text-xl text-rose-600 font-heading">{score}</div>
            </div>
            <div>
              <div className="text-xs text-rose-800 uppercase">Kombo Maks</div>
              <div className="text-xl text-orange-600 font-heading">{maxStreak}x</div>
            </div>
          </div>

          <button
            onClick={() => startNewGame(level)}
            className="w-full py-3.5 bg-yellow-400 hover:bg-yellow-500 text-black font-black rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 text-base font-heading"
          >
            <RefreshCw className="w-5 h-5" /> Main Lagi Sekarang
          </button>
        </motion.div>
      )}

      {/* Victory / Completed Screen */}
      {isCompleted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border-4 border-black rounded-3xl p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center space-y-6 max-w-lg mx-auto"
        >
          <div className="w-24 h-24 bg-yellow-400 border-3 border-black rounded-3xl flex items-center justify-center mx-auto text-5xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-bounce">
            🏆
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 bg-yellow-200 text-black border border-black rounded-full text-xs font-black uppercase tracking-wider">
              Misi Selesai!
            </span>
            <h3 className="text-3xl font-black text-slate-900 font-heading">
              Selamat, Detektif Cilik!
            </h3>
            <p className="text-slate-600 text-sm font-medium">
              Kamu berhasil menuntaskan 10 tantangan bilangan misteri dengan gemilang!
            </p>
          </div>

          {/* Results Summary Box */}
          <div className="grid grid-cols-3 gap-2 bg-yellow-50 p-4 rounded-2xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-slate-900 font-black">
            <div>
              <div className="text-[11px] text-yellow-900 uppercase">Total Skor</div>
              <div className="text-xl sm:text-2xl text-blue-600 font-heading">{score} XP</div>
            </div>
            <div>
              <div className="text-[11px] text-yellow-900 uppercase">Bintang</div>
              <div className="text-xl sm:text-2xl text-yellow-600 flex items-center justify-center gap-1 font-heading">
                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" /> {stars}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-yellow-900 uppercase">Kombo Maks</div>
              <div className="text-xl sm:text-2xl text-pink-600 font-heading">{maxStreak}x</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => startNewGame(level)}
              className="flex-1 py-3 bg-white hover:bg-slate-100 text-black font-black rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 text-sm"
            >
              <RefreshCw className="w-4 h-4" /> Main Level Lain
            </button>
            <button
              onClick={() => {
                SoundEffects.playClick();
                startNewGame(level);
              }}
              className="flex-1 py-3 bg-yellow-400 hover:bg-yellow-500 text-black font-black rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 text-sm font-heading"
            >
              <Sparkles className="w-4 h-4" /> Ulangi Level Ini
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
