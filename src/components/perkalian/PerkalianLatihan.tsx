import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Lightbulb,
  ArrowRight,
  Star,
  Check,
  X,
  Layers,
} from 'lucide-react';
import { SoundEffects } from '../../utils/sound';
import { triggerConfetti } from '../../utils/confetti';

interface LatihanProps {
  onUnlockBadge?: (badgeId: string) => void;
  onRewardScore?: (points: number, stars: number) => void;
}

export type ExerciseDifficulty = 'mudah' | 'sedang' | 'sulit';
export type QuestionKind = 'multiple_choice' | 'number_input' | 'true_false' | 'step_order' | 'matching';

export interface ExerciseQuestion {
  id: string;
  difficulty: ExerciseDifficulty;
  type: QuestionKind;
  prompt: string;
  expression: string;
  options?: string[];
  correctAnswer: string | number | boolean | string[];
  hints: string[];
  explanation: string;
  dragItems?: { id: string; text: string; matchId: string }[];
  dropTargets?: { id: string; label: string }[];
}

const LATIHAN_SOAL_LIST: ExerciseQuestion[] = [
  // 1. 23 × 4 = ... (Pilihan Ganda)
  {
    id: 'soal-1',
    difficulty: 'mudah',
    type: 'multiple_choice',
    prompt: 'Hitunglah hasil perkalian dua digit berikut:',
    expression: '23 × 4 = ...',
    options: ['82', '92', '102', '112'],
    correctAnswer: '92',
    hints: [
      '💡 Kalikan satuannya dulu: 3 × 4 = 12 (tulis 2, simpan 1).',
      '💡 Kalikan puluhannya: 2 × 4 = 8, lalu tambahkan simpanan 1 (8 + 1 = 9).',
    ],
    explanation: '23 × 4 = (20 × 4) + (3 × 4) = 80 + 12 = 92.',
  },
  // 2. 40 × 6 = ... (Isian Angka)
  {
    id: 'soal-2',
    difficulty: 'mudah',
    type: 'number_input',
    prompt: 'Berapakah hasil perkalian bilangan puluhan berikut?',
    expression: '40 × 6 = ...',
    correctAnswer: 240,
    hints: [
      '💡 Kalikan angka dasarnya: 4 × 6 = 24.',
      '💡 Karena 40 memiliki 1 angka nol, tambahkan satu nol di belakang 24.',
    ],
    explanation: '40 × 6 = 4 puluhan × 6 = 24 puluhan = 240.',
  },
  // 3. 300 × 4 = ... (Pilihan Ganda)
  {
    id: 'soal-3',
    difficulty: 'mudah',
    type: 'multiple_choice',
    prompt: 'Tentukan hasil perkalian ratusan dengan satu angka:',
    expression: '300 × 4 = ...',
    options: ['700', '1.200', '12.000', '1.400'],
    correctAnswer: '1.200',
    hints: [
      '💡 Kalikan 3 × 4 = 12.',
      '💡 Karena ratusan (300) mempunyai dua angka nol, tambahkan 00 di belakang 12.',
    ],
    explanation: '300 × 4 = 3 ratusan × 4 = 12 ratusan = 1.200.',
  },
  // 4. 2.000 × 5 = ... (Benar atau Salah)
  {
    id: 'soal-4',
    difficulty: 'mudah',
    type: 'true_false',
    prompt: 'Apakah pernyataan nilai perkalian ribuan ini BENAR atau SALAH?',
    expression: '2.000 × 5 = 10.000',
    correctAnswer: true,
    hints: [
      '💡 2 × 5 = 10.',
      '💡 Tambahkan 3 angka nol dari 2.000 ke belakang 10.',
    ],
    explanation: 'Benar! 2 × 5 = 10, lalu 10 ribuan sama dengan 10.000.',
  },
  // 5. 177 × 8 = ... (Isian Angka)
  {
    id: 'soal-5',
    difficulty: 'sedang',
    type: 'number_input',
    prompt: 'Gunakan cara bersusun untuk menghitung:',
    expression: '177 × 8 = ...',
    correctAnswer: 1416,
    hints: [
      '💡 Langkah 1: 7 × 8 = 56 (tulis 6, simpan 5).',
      '💡 Langkah 2: (7 × 8) + 5 = 61 (tulis 1, simpan 6).',
      '💡 Langkah 3: (1 × 8) + 6 = 14 (tulis 14). Hasil = 1.416.',
    ],
    explanation: '177 × 8 = 1.416 (diuraikan: 100×8 + 70×8 + 7×8 = 800 + 560 + 56 = 1.416).',
  },
  // 6. 325 × 6 = ... (Pilihan Ganda)
  {
    id: 'soal-6',
    difficulty: 'sedang',
    type: 'multiple_choice',
    prompt: 'Hitunglah perkalian ratusan tiga angka:',
    expression: '325 × 6 = ...',
    options: ['1.850', '1.920', '1.950', '2.050'],
    correctAnswer: '1.950',
    hints: [
      '💡 5 × 6 = 30 (tulis 0, simpan 3).',
      '💡 2 × 6 = 12 + 3 = 15 (tulis 5, simpan 1).',
      '💡 3 × 6 = 18 + 1 = 19 (tulis 19).',
    ],
    explanation: '325 × 6 = 1.950.',
  },
  // 7. 42 × 30 = ... (Isian Angka)
  {
    id: 'soal-7',
    difficulty: 'sedang',
    type: 'number_input',
    prompt: 'Perkalian dua digit dengan kelipatan sepuluh:',
    expression: '42 × 30 = ...',
    correctAnswer: 1260,
    hints: [
      '💡 Kalikan 42 × 3 terlebih dahulu: (40×3) + (2×3) = 120 + 6 = 126.',
      '💡 Karena pengalinya adalah 30, tambahkan 1 angka nol di belakang 126.',
    ],
    explanation: '42 × 30 = 42 × 3 × 10 = 126 × 10 = 1.260.',
  },
  // 8. 125 × 20 = ... (Pilihan Ganda)
  {
    id: 'soal-8',
    difficulty: 'sedang',
    type: 'multiple_choice',
    prompt: 'Berapakah hasil perkalian berikut?',
    expression: '125 × 20 = ...',
    options: ['2.250', '2.500', '2.750', '3.000'],
    correctAnswer: '2.500',
    hints: [
      '💡 125 × 2 = 250.',
      '💡 Tambahkan 1 angka nol dari bilangan 20 menjadi 2.500.',
    ],
    explanation: '125 × 20 = 125 × 2 × 10 = 250 × 10 = 2.500.',
  },
  // 9. 321 × 100 = ... (Isian Angka)
  {
    id: 'soal-9',
    difficulty: 'sulit',
    type: 'number_input',
    prompt: 'Pergeseran nilai tempat ratusan:',
    expression: '321 × 100 = ...',
    correctAnswer: 32100,
    hints: [
      '💡 Ingat prinsip papan nilai tempat: mengalikan dengan 100 berarti menggeser angka 2 tempat ke kiri.',
      '💡 Tulis 321 lalu tambahkan dua angka nol (00) di belakangnya.',
    ],
    explanation: '321 × 100 = 32.100 (tiga puluh dua ribu seratus).',
  },
  // 10. 1.250 × 4 = ... (Pilihan Ganda)
  {
    id: 'soal-10',
    difficulty: 'sulit',
    type: 'multiple_choice',
    prompt: 'Hitunglah hasil perkalian ribuan berikut:',
    expression: '1.250 × 4 = ...',
    options: ['4.800', '5.000', '5.200', '6.000'],
    correctAnswer: '5.000',
    hints: [
      '💡 Uraikan: 1.000 × 4 = 4.000, dan 250 × 4 = 1.000.',
      '💡 Jumlahkan hasilnya: 4.000 + 1.000 = 5.000.',
    ],
    explanation: '1.250 × 4 = 5.000.',
  },
];

export const PerkalianLatihan: React.FC<LatihanProps> = ({ onUnlockBadge, onRewardScore }) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<ExerciseDifficulty | 'semua'>('semua');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [numberInputValue, setNumberInputValue] = useState<string>('');
  const [trueFalseChoice, setTrueFalseChoice] = useState<boolean | null>(null);
  const [revealedHintCount, setRevealedHintCount] = useState<number>(0);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);

  const filteredQuestions =
    selectedDifficulty === 'semua'
      ? LATIHAN_SOAL_LIST
      : LATIHAN_SOAL_LIST.filter(q => q.difficulty === selectedDifficulty);

  const currentQ = filteredQuestions[currentIndex] || filteredQuestions[0];

  const handleResetForNextQuestion = () => {
    setSelectedChoice(null);
    setNumberInputValue('');
    setTrueFalseChoice(null);
    setRevealedHintCount(0);
    setIsAnswered(false);
    setIsCorrect(false);
  };

  const handleCheckAnswer = () => {
    let userCorrect = false;

    if (currentQ.type === 'multiple_choice') {
      if (!selectedChoice) return;
      userCorrect = selectedChoice === currentQ.correctAnswer;
    } else if (currentQ.type === 'number_input') {
      const parsed = parseInt(numberInputValue, 10);
      if (isNaN(parsed)) return;
      userCorrect = parsed === currentQ.correctAnswer;
    } else if (currentQ.type === 'true_false') {
      if (trueFalseChoice === null) return;
      userCorrect = trueFalseChoice === currentQ.correctAnswer;
    }

    setIsAnswered(true);
    setIsCorrect(userCorrect);

    if (userCorrect) {
      SoundEffects.playCorrect();
      triggerConfetti();
      onRewardScore?.(15, 1);
      if (currentQ.difficulty === 'sulit') {
        onUnlockBadge?.('master-perkalian');
      }
    } else {
      SoundEffects.playWrong();
    }
  };

  const handleNext = () => {
    SoundEffects.playClick();
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      handleResetForNextQuestion();
    } else {
      // Loop or finish
      setCurrentIndex(0);
      handleResetForNextQuestion();
    }
  };

  const handleRevealHint = () => {
    SoundEffects.playClick();
    if (revealedHintCount < currentQ.hints.length) {
      setRevealedHintCount(revealedHintCount + 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tier Filter & Progress */}
      <div className="bg-white border-4 border-black rounded-3xl p-5 sm:p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-black uppercase text-slate-500">Pilih Tingkat Kesulitan:</div>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            {[
              { id: 'semua' as const, label: 'Semua Soal (10 Soal)' },
              { id: 'mudah' as const, label: '⭐ Mudah' },
              { id: 'sedang' as const, label: '⭐⭐ Sedang' },
              { id: 'sulit' as const, label: '⭐⭐⭐ Sulit' },
            ].map(tier => (
              <button
                key={tier.id}
                onClick={() => {
                  SoundEffects.playClick();
                  setSelectedDifficulty(tier.id);
                  setCurrentIndex(0);
                  handleResetForNextQuestion();
                }}
                className={`px-3 py-1.5 rounded-xl border-2 border-black font-black text-xs transition-all cursor-pointer ${
                  selectedDifficulty === tier.id
                    ? 'bg-yellow-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5'
                    : 'bg-slate-100 hover:bg-yellow-100'
                }`}
              >
                {tier.label}
              </button>
            ))}
          </div>
        </div>

        {/* Question Counter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase text-slate-500">Nomor:</span>
          <span className="px-3 py-1 bg-blue-100 border-2 border-black rounded-xl font-black text-sm text-blue-900 font-heading">
            {currentIndex + 1} dari {filteredQuestions.length}
          </span>
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-white border-4 border-black rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6">
        {/* Question Header */}
        <div className="border-b-3 border-black pb-4">
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-black uppercase px-3 py-1 rounded-full border border-black ${
                currentQ.difficulty === 'mudah'
                  ? 'bg-green-200 text-green-950'
                  : currentQ.difficulty === 'sedang'
                  ? 'bg-amber-200 text-amber-950'
                  : 'bg-rose-200 text-rose-950'
              }`}
            >
              Tingkat: {currentQ.difficulty.toUpperCase()}
            </span>
          </div>

          <p className="text-slate-600 text-sm font-semibold mt-2">{currentQ.prompt}</p>

          <div className="text-3xl sm:text-4xl font-black text-slate-900 font-heading tracking-wide mt-2">
            {currentQ.expression}
          </div>
        </div>

        {/* Answer Input Zones based on Question Type */}
        <div>
          {/* Multiple Choice Type */}
          {currentQ.type === 'multiple_choice' && currentQ.options && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {currentQ.options.map((opt, idx) => (
                <button
                  key={opt}
                  disabled={isAnswered}
                  onClick={() => {
                    SoundEffects.playClick();
                    setSelectedChoice(opt);
                  }}
                  className={`p-4 rounded-2xl border-3 border-black font-black text-xl sm:text-2xl font-heading transition-all cursor-pointer ${
                    selectedChoice === opt
                      ? 'bg-yellow-300 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] -translate-y-1 ring-2 ring-black'
                      : 'bg-slate-50 hover:bg-yellow-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                  }`}
                >
                  <div className="text-[10px] text-slate-500 uppercase font-sans mb-1 font-bold">
                    Pilihan {String.fromCharCode(65 + idx)}
                  </div>
                  {opt}
                </button>
              ))}
            </div>
          )}

          {/* Number Input Type */}
          {currentQ.type === 'number_input' && (
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <label className="text-sm font-black uppercase text-slate-700">Ketik Hasil Akhir:</label>
              <input
                type="number"
                disabled={isAnswered}
                placeholder="Misal: 240"
                value={numberInputValue}
                onChange={e => setNumberInputValue(e.target.value)}
                className="w-full sm:w-64 px-4 py-3 bg-slate-50 border-3 border-black rounded-2xl font-black text-2xl font-heading text-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] focus:outline-none"
              />
            </div>
          )}

          {/* True / False Type */}
          {currentQ.type === 'true_false' && (
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <button
                disabled={isAnswered}
                onClick={() => {
                  SoundEffects.playClick();
                  setTrueFalseChoice(true);
                }}
                className={`py-4 rounded-2xl border-3 border-black font-black text-xl font-heading flex items-center justify-center gap-2 cursor-pointer ${
                  trueFalseChoice === true
                    ? 'bg-green-300 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] -translate-y-1 ring-2 ring-black'
                    : 'bg-white hover:bg-green-50'
                }`}
              >
                <Check className="w-6 h-6 text-green-700 stroke-[3]" />
                <span>BENAR</span>
              </button>

              <button
                disabled={isAnswered}
                onClick={() => {
                  SoundEffects.playClick();
                  setTrueFalseChoice(false);
                }}
                className={`py-4 rounded-2xl border-3 border-black font-black text-xl font-heading flex items-center justify-center gap-2 cursor-pointer ${
                  trueFalseChoice === false
                    ? 'bg-rose-300 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] -translate-y-1 ring-2 ring-black'
                    : 'bg-white hover:bg-rose-50'
                }`}
              >
                <X className="w-6 h-6 text-rose-700 stroke-[3]" />
                <span>SALAH</span>
              </button>
            </div>
          )}
        </div>

        {/* Action Button Bar & Progressive Hints */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            {!isAnswered ? (
              <button
                onClick={handleCheckAnswer}
                className="px-6 py-3 bg-yellow-300 hover:bg-yellow-400 text-black font-black text-sm rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 cursor-pointer font-heading flex items-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Kirim Jawaban</span>
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-green-400 hover:bg-green-500 text-black font-black text-sm rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 cursor-pointer font-heading flex items-center gap-2"
              >
                <span>Soal Berikutnya</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Progressive Hint Button */}
          <button
            onClick={handleRevealHint}
            disabled={revealedHintCount >= currentQ.hints.length}
            className="px-3.5 py-2.5 bg-amber-100 hover:bg-amber-200 disabled:opacity-50 text-amber-950 font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1.5 cursor-pointer"
          >
            <Lightbulb className="w-4 h-4 text-amber-700" />
            <span>
              💡 Lihat Petunjuk ({revealedHintCount}/{currentQ.hints.length})
            </span>
          </button>
        </div>

        {/* Revealed Hints Box */}
        {revealedHintCount > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-amber-50 border-2 border-black rounded-2xl p-4 space-y-2"
          >
            <div className="text-xs font-black uppercase text-amber-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Bantuan Berpikir:</span>
            </div>
            {currentQ.hints.slice(0, revealedHintCount).map((hintText, hIdx) => (
              <p key={hIdx} className="text-xs sm:text-sm font-semibold text-slate-800 bg-white p-2.5 rounded-xl border border-amber-300">
                {hintText}
              </p>
            ))}
          </motion.div>
        )}

        {/* Answer Feedback & Full Discussion */}
        {isAnswered && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-5 rounded-2xl border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-3 ${
              isCorrect ? 'bg-green-100 text-green-950' : 'bg-rose-100 text-rose-950'
            }`}
          >
            <div className="font-black text-base sm:text-lg flex items-center gap-2 font-heading">
              {isCorrect ? (
                <>
                  <CheckCircle2 className="w-6 h-6 text-green-600 fill-green-200" />
                  <span>🎉 Hebat! Jawabanmu benar.</span>
                </>
              ) : (
                <>
                  <HelpCircle className="w-6 h-6 text-rose-600" />
                  <span>Belum tepat. Yuk coba periksa kembali langkah perkaliannya.</span>
                </>
              )}
            </div>

            {/* Explanation box */}
            <div className="bg-white border-2 border-black rounded-xl p-4 text-slate-900 space-y-1">
              <div className="text-xs font-black uppercase text-slate-500">Pembahasan Lengkap:</div>
              <p className="text-xs sm:text-sm font-semibold">{currentQ.explanation}</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
