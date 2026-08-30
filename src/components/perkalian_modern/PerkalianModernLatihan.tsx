import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  ArrowRight,
  Target,
  Flame,
  Award,
} from 'lucide-react';
import { SoundEffects } from '../../utils/sound';
import { triggerConfetti } from '../../utils/confetti';

interface LatihanProps {
  onRewardScore?: (stars?: number) => void;
}

type DiffLevel = 'easy' | 'medium' | 'hard';

interface PracticeQuestion {
  id: string;
  numA: number;
  numB: number;
  correct: number;
  options: number[];
  hint: string;
  explanation: string;
}

const QUESTIONS_DATA: Record<DiffLevel, PracticeQuestion[]> = {
  easy: [
    {
      id: 'e1',
      numA: 24,
      numB: 3,
      correct: 72,
      options: [62, 72, 82, 92],
      hint: '(20×3) + (4×3) = 60 + 12 = 72',
      explanation: '24 × 3 = 72.',
    },
    {
      id: 'e2',
      numA: 40,
      numB: 5,
      correct: 200,
      options: [180, 200, 220, 250],
      hint: '4×5 = 20, tambahkan 1 nol menjadi 200',
      explanation: '40 × 5 = 200.',
    },
    {
      id: 'e3',
      numA: 15,
      numB: 6,
      correct: 90,
      options: [80, 85, 90, 95],
      hint: '(10×6) + (5×6) = 60 + 30 = 90',
      explanation: '15 × 6 = 90.',
    },
  ],
  medium: [
    {
      id: 'm1',
      numA: 125,
      numB: 8,
      correct: 1000,
      options: [900, 950, 1000, 1050],
      hint: '125 × 4 = 500, maka 125 × 8 = 1.000',
      explanation: '125 × 8 = 1.000.',
    },
    {
      id: 'm2',
      numA: 340,
      numB: 6,
      correct: 2040,
      options: [1840, 1940, 2040, 2140],
      hint: '34 × 6 = 204, tambah 1 nol menjadi 2.040',
      explanation: '340 × 6 = 2.040.',
    },
    {
      id: 'm3',
      numA: 45,
      numB: 20,
      correct: 900,
      options: [800, 850, 900, 950],
      hint: '45 × 2 = 90, tambah 1 nol menjadi 900',
      explanation: '45 × 20 = 900.',
    },
  ],
  hard: [
    {
      id: 'h1',
      numA: 1250,
      numB: 8,
      correct: 10000,
      options: [8000, 9500, 10000, 12000],
      hint: '125 × 8 = 1.000, ditambah 1 nol = 10.000',
      explanation: '1.250 × 8 = 10.000.',
    },
    {
      id: 'h2',
      numA: 320,
      numB: 50,
      correct: 16000,
      options: [15000, 16000, 17000, 18000],
      hint: '32 × 5 = 160, tambah 2 angka nol = 16.000',
      explanation: '320 × 50 = 16.000.',
    },
    {
      id: 'h3',
      numA: 750,
      numB: 40,
      correct: 30000,
      options: [28000, 30000, 32000, 35000],
      hint: '75 × 4 = 300, tambah 2 nol = 30.000',
      explanation: '750 × 40 = 30.000.',
    },
  ],
};

export const PerkalianModernLatihan: React.FC<LatihanProps> = ({
  onRewardScore,
}) => {
  const [level, setLevel] = useState<DiffLevel>('easy');
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);

  const questions = QUESTIONS_DATA[level];
  const currentQ = questions[currentIdx];

  const handleSelectOption = (opt: number) => {
    if (isAnswered) return;
    setSelectedOpt(opt);
    setIsAnswered(true);

    const isCorrect = opt === currentQ.correct;
    if (isCorrect) {
      SoundEffects.playCorrect();
      setScore(prev => prev + 10);
      onRewardScore?.(1);
    } else {
      SoundEffects.playWrong();
    }
  };

  const handleNextQuestion = () => {
    SoundEffects.playClick();
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOpt(null);
      setIsAnswered(false);
      setShowHint(false);
    } else {
      triggerConfetti();
    }
  };

  return (
    <div className="space-y-6">
      {/* Level Selector Pills */}
      <div className="bg-slate-900/90 backdrop-blur-xl border border-indigo-500/30 rounded-3xl p-4 sm:p-6 shadow-xl shadow-indigo-950/40 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs font-black uppercase text-indigo-400">Pilih Tingkat Kesulitan:</div>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {[
              { id: 'easy' as const, label: '⭐ Mudah (1-2 Angka)', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
              { id: 'medium' as const, label: '⭐⭐ Sedang (Ratusan & Puluhan)', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
              { id: 'hard' as const, label: '⭐⭐⭐ Sulit (Ribuan s.d. 100.000)', color: 'bg-pink-500/20 text-pink-300 border-pink-500/40' },
            ].map(l => (
              <button
                key={l.id}
                onClick={() => {
                  SoundEffects.playClick();
                  setLevel(l.id);
                  setCurrentIdx(0);
                  setSelectedOpt(null);
                  setIsAnswered(false);
                  setShowHint(false);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  level === l.id
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-slate-400">Progres Soal:</span>
          <div className="text-sm font-black text-amber-400 font-mono">
            {currentIdx + 1} / {questions.length} Soal
          </div>
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-slate-900/90 backdrop-blur-xl border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-xl shadow-indigo-950/40 space-y-6">
        <div className="text-center py-8 bg-slate-950/80 border border-indigo-500/30 rounded-2xl">
          <span className="text-xs font-black uppercase text-indigo-400 tracking-wider">
            Berapakah Hasil Dari:
          </span>
          <div className="text-4xl sm:text-6xl font-black text-white font-heading mt-2">
            {currentQ.numA.toLocaleString('id-ID')} × {currentQ.numB.toLocaleString('id-ID')} = ?
          </div>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {currentQ.options.map(opt => {
            const isSelected = selectedOpt === opt;
            const isRight = opt === currentQ.correct;
            let style = 'bg-slate-800/80 border-slate-700 text-white hover:bg-slate-700 hover:border-indigo-400';

            if (isAnswered) {
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
                disabled={isAnswered}
                onClick={() => handleSelectOption(opt)}
                className={`p-4 sm:p-5 rounded-2xl border font-mono text-xl sm:text-2xl font-black transition-all cursor-pointer shadow-md ${style}`}
              >
                {opt.toLocaleString('id-ID')}
              </button>
            );
          })}
        </div>

        {/* Actions & Hint */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            onClick={() => {
              SoundEffects.playClick();
              setShowHint(!showHint);
            }}
            className="px-4 py-2 bg-slate-800 text-amber-300 hover:bg-slate-700 border border-amber-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
            <span>{showHint ? 'Tutup Petunjuk' : 'Lihat Petunjuk'}</span>
          </button>

          {isAnswered && (
            <button
              onClick={handleNextQuestion}
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-indigo-500/30 cursor-pointer font-heading flex items-center gap-2"
            >
              <span>{currentIdx < questions.length - 1 ? 'Soal Selanjutnya' : 'Selesai Latihan'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {showHint && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs sm:text-sm text-amber-200"
          >
            💡 <strong>Petunjuk:</strong> {currentQ.hint}
          </motion.div>
        )}

        {isAnswered && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-slate-950 border border-indigo-500/30 rounded-xl text-xs sm:text-sm text-slate-300"
          >
            <strong>Pembahasan:</strong> {currentQ.explanation}
          </motion.div>
        )}
      </div>
    </div>
  );
};
