import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  CheckCircle2,
  HelpCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Lightbulb,
  Check,
  Package,
  Layers,
} from 'lucide-react';
import { SoundEffects } from '../../utils/sound';
import { triggerConfetti } from '../../utils/confetti';

interface StoryProps {
  onUnlockBadge?: (badgeId: string) => void;
  onRewardScore?: (points: number, stars: number) => void;
}

interface StoryItem {
  id: string;
  category: 'pensil' | 'buku' | 'buah' | 'siswa' | 'kotak' | 'uang' | 'sekolah';
  icon: string;
  title: string;
  story: string;
  valA: number;
  valB: number;
  unit: string;
  result: number;
  formula: string;
  distractors: number[];
  hint: string;
  explanation: string;
}

const STORY_QUESTIONS: StoryItem[] = [
  {
    id: 'story-1',
    category: 'pensil',
    icon: '✏️',
    title: 'Kotak Pensil Pak Andi',
    story: 'Pak Andi memiliki 125 kotak. Setiap kotak berisi 8 pensil. Berapa jumlah pensil seluruhnya?',
    valA: 125,
    valB: 8,
    unit: 'pensil',
    result: 1000,
    formula: '125 × 8',
    distractors: [900, 950, 1000, 1100],
    hint: 'Ada 125 kelompok, masing-masing berisi 8 pensil. Gunakan operasi perkalian 125 × 8.',
    explanation: '125 × 8 = (100 × 8) + (20 × 8) + (5 × 8) = 800 + 160 + 40 = 1.000 pensil.',
  },
  {
    id: 'story-2',
    category: 'buku',
    icon: '📚',
    title: 'Buku Cerita Baru Perpustakaan',
    story: 'Sebuah perpustakaan sekolah menerima 35 paket buku cerita baru. Setiap paket berisi 24 buku. Berapa total seluruh buku yang diterima?',
    valA: 35,
    valB: 24,
    unit: 'buku',
    result: 840,
    formula: '35 × 24',
    distractors: [720, 800, 840, 890],
    hint: 'Kalikan jumlah paket (35) dengan isi per paket (24). 35 × 20 = 700 dan 35 × 4 = 140.',
    explanation: '35 × 24 = 35 × (20 + 4) = 700 + 140 = 840 buku.',
  },
  {
    id: 'story-3',
    category: 'buah',
    icon: '🍎',
    title: 'Panen Apel di Kebun',
    story: 'Seorang petani memanen 45 keranjang apel merah. Jika setiap keranjang berisi 60 buah apel, berapa total seluruh apel yang dipanen?',
    valA: 45,
    valB: 60,
    unit: 'buah apel',
    result: 2700,
    formula: '45 × 60',
    distractors: [2400, 2600, 2700, 3000],
    hint: 'Kalikan 45 × 6 = 270, lalu tambahkan 1 angka nol dari 60.',
    explanation: '45 × 60 = 45 × 6 × 10 = 270 × 10 = 2.700 buah apel.',
  },
  {
    id: 'story-4',
    category: 'siswa',
    icon: '🚌',
    title: 'Karyawisata Siswa SD',
    story: 'Ada 18 bus pariwisata yang membawa rombongan siswa SD pergi karyawisata ke museum. Setiap bus berisi 45 siswa. Berapa total siswa yang ikut wisata?',
    valA: 18,
    valB: 45,
    unit: 'orang siswa',
    result: 810,
    formula: '18 × 45',
    distractors: [750, 780, 810, 850],
    hint: '18 × 45 = (18 × 40) + (18 × 5) = 720 + 90 = 810.',
    explanation: '18 × 45 = 810 orang siswa.',
  },
  {
    id: 'story-5',
    category: 'uang',
    icon: '💰',
    title: 'Tabungan Harian Rina',
    story: 'Rina rajin menabung uang saku sebesar Rp 4.000 setiap hari selama 25 hari berturut-turut. Berapa total uang tabungan Rina sekarang?',
    valA: 4000,
    valB: 25,
    unit: 'rupiah',
    result: 100000,
    formula: '4.000 × 25',
    distractors: [80000, 90000, 100000, 120000],
    hint: 'Kalikan 4 × 25 = 100, lalu tambahkan 3 angka nol (ribuan) di belakangnya.',
    explanation: '4.000 × 25 = (4 × 25) × 1.000 = 100 × 1.000 = Rp 100.000.',
  },
];

export const PerkalianSoalCerita: React.FC<StoryProps> = ({ onUnlockBadge, onRewardScore }) => {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  // 4 Guided Steps:
  // Step 1: Tentukan operasi (+, -, ×, ÷)
  // Step 2: Tentukan kalimat matematika (formula)
  // Step 3: Pilih jawaban akhir
  const [selectedOperation, setSelectedOperation] = useState<string | null>(null);
  const [selectedFormula, setSelectedFormula] = useState<string | null>(null);
  const [selectedFinalAnswer, setSelectedFinalAnswer] = useState<number | null>(null);
  const [revealedHint, setRevealedHint] = useState<boolean>(false);
  const [isDone, setIsDone] = useState<boolean>(false);

  const currentStory = STORY_QUESTIONS[currentIdx];

  const handleResetForNext = () => {
    setSelectedOperation(null);
    setSelectedFormula(null);
    setSelectedFinalAnswer(null);
    setRevealedHint(false);
    setIsDone(false);
  };

  const handleFinishStory = () => {
    if (selectedFinalAnswer === currentStory.result) {
      SoundEffects.playCorrect();
      triggerConfetti();
      setIsDone(true);
      onRewardScore?.(20, 2);
      if (currentIdx === STORY_QUESTIONS.length - 1) {
        onUnlockBadge?.('raja-soal-cerita');
        onUnlockBadge?.('raja-perkalian');
      }
    } else {
      SoundEffects.playWrong();
    }
  };

  return (
    <div className="space-y-6">
      {/* Category selector */}
      <div className="bg-white border-4 border-black rounded-3xl p-5 sm:p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-black uppercase text-slate-500">Pilih Cerita Kontekstual:</div>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            {STORY_QUESTIONS.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => {
                  SoundEffects.playClick();
                  setCurrentIdx(idx);
                  handleResetForNext();
                }}
                className={`px-3 py-1.5 rounded-xl border-2 border-black font-black text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                  currentIdx === idx
                    ? 'bg-yellow-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5'
                    : 'bg-slate-100 hover:bg-yellow-100'
                }`}
              >
                <span>{s.icon}</span>
                <span>{s.title}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase text-slate-500">Misi:</span>
          <span className="px-3 py-1 bg-emerald-100 border-2 border-black rounded-xl font-black text-sm text-emerald-900 font-heading">
            {currentIdx + 1} dari {STORY_QUESTIONS.length}
          </span>
        </div>
      </div>

      {/* Main Story Card */}
      <div className="bg-white border-4 border-black rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6">
        {/* Story Title & Text */}
        <div className="bg-emerald-50 border-3 border-black rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl p-2 bg-white border-2 border-black rounded-xl shadow-xs">
              {currentStory.icon}
            </span>
            <div>
              <span className="text-xs font-black uppercase bg-emerald-200 border border-black px-2.5 py-0.5 rounded-md">
                Soal Cerita Kehidupan Sehari-hari
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-heading mt-1">
                {currentStory.title}
              </h3>
            </div>
          </div>

          <p className="text-base sm:text-lg font-bold text-slate-800 leading-relaxed bg-white p-4 rounded-xl border-2 border-black">
            "{currentStory.story}"
          </p>
        </div>

        {/* 4 Guided Interactive Stages */}
        <div className="space-y-4">
          {/* Step 1: Menentukan Operasi */}
          <div className="border-2 border-black rounded-2xl p-4 bg-slate-50 space-y-2">
            <div className="text-xs font-black uppercase text-slate-700 font-heading">
              1. Tentukan Operasi Matematika yang Tepat:
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'perkalian', label: '✖️ Perkalian', correct: true },
                { id: 'penjumlahan', label: '➕ Penjumlahan', correct: false },
                { id: 'pengurangan', label: '➖ Pengurangan', correct: false },
                { id: 'pembagian', label: '➗ Pembagian', correct: false },
              ].map(op => (
                <button
                  key={op.id}
                  onClick={() => {
                    SoundEffects.playClick();
                    setSelectedOperation(op.id);
                  }}
                  className={`px-3.5 py-2 rounded-xl border-2 border-black font-black text-xs transition-all cursor-pointer ${
                    selectedOperation === op.id
                      ? op.correct
                        ? 'bg-green-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ring-2 ring-black'
                        : 'bg-rose-300'
                      : 'bg-white hover:bg-slate-100'
                  }`}
                >
                  {op.label}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Kalimat Matematika (Unlocked once Step 1 is chosen) */}
          {selectedOperation === 'perkalian' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-2 border-black rounded-2xl p-4 bg-yellow-50 space-y-2"
            >
              <div className="text-xs font-black uppercase text-slate-700 font-heading">
                2. Tuliskan Kalimat Matematikanya:
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  currentStory.formula,
                  `${currentStory.valA} + ${currentStory.valB}`,
                  `${currentStory.valA} - ${currentStory.valB}`,
                ].map(form => (
                  <button
                    key={form}
                    onClick={() => {
                      SoundEffects.playClick();
                      setSelectedFormula(form);
                    }}
                    className={`px-4 py-2 rounded-xl border-2 border-black font-black text-sm transition-all cursor-pointer ${
                      selectedFormula === form
                        ? form === currentStory.formula
                          ? 'bg-yellow-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ring-2 ring-black'
                          : 'bg-rose-200'
                        : 'bg-white hover:bg-yellow-100'
                    }`}
                  >
                    {form}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 3: Memilih Jawaban Akhir (Unlocked once Step 2 is correct) */}
          {selectedFormula === currentStory.formula && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-2 border-black rounded-2xl p-4 bg-blue-50 space-y-3"
            >
              <div className="text-xs font-black uppercase text-slate-700 font-heading">
                3. Hitung & Pilih Hasil Akhir:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {currentStory.distractors.map(val => (
                  <button
                    key={val}
                    onClick={() => {
                      SoundEffects.playClick();
                      setSelectedFinalAnswer(val);
                    }}
                    className={`p-3.5 rounded-2xl border-2 border-black font-black text-lg font-heading transition-all cursor-pointer ${
                      selectedFinalAnswer === val
                        ? 'bg-emerald-300 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ring-2 ring-black'
                        : 'bg-white hover:bg-blue-100'
                    }`}
                  >
                    {val.toLocaleString('id-ID')} {currentStory.unit}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Buttons & Hints */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            {!isDone ? (
              <button
                disabled={!selectedFinalAnswer}
                onClick={handleFinishStory}
                className="px-6 py-3 bg-yellow-300 hover:bg-yellow-400 disabled:opacity-50 text-black font-black text-sm rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 cursor-pointer font-heading flex items-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Periksa Jawaban Cerita</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  SoundEffects.playClick();
                  if (currentIdx < STORY_QUESTIONS.length - 1) {
                    setCurrentIdx(currentIdx + 1);
                    handleResetForNext();
                  } else {
                    setCurrentIdx(0);
                    handleResetForNext();
                  }
                }}
                className="px-6 py-3 bg-green-400 hover:bg-green-500 text-black font-black text-sm rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 cursor-pointer font-heading flex items-center gap-2"
              >
                <span>Misi Cerita Berikutnya</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>

          <button
            onClick={() => {
              SoundEffects.playClick();
              setRevealedHint(!revealedHint);
            }}
            className="px-3.5 py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-950 font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1.5 cursor-pointer"
          >
            <Lightbulb className="w-4 h-4 text-amber-700" />
            <span>💡 {revealedHint ? 'Tutup Petunjuk' : 'Lihat Petunjuk'}</span>
          </button>
        </div>

        {/* Hint Box */}
        {revealedHint && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-amber-50 border-2 border-black rounded-2xl p-4 text-xs sm:text-sm font-semibold text-slate-800"
          >
            💡 <strong>Petunjuk Cerita:</strong> {currentStory.hint}
          </motion.div>
        )}

        {/* Completion Explanation */}
        {isDone && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-100 border-3 border-black rounded-2xl p-5 space-y-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            <div className="font-black text-base text-green-950 font-heading flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              <span>🎉 Hebat Sekali! Kamu berhasil menyelesaikan cerita ini!</span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-800 bg-white p-3 rounded-xl border border-green-300">
              <strong>Pembahasan:</strong> {currentStory.explanation}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};
