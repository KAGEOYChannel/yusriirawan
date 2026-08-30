import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  ArrowRight,
  Target,
  Award,
} from 'lucide-react';
import { SoundEffects } from '../../utils/sound';
import { triggerConfetti } from '../../utils/confetti';

interface CeritaProps {
  onRewardScore?: (stars?: number) => void;
}

interface StoryScenario {
  id: string;
  category: string;
  themeIcon: string;
  title: string;
  narrative: string;
  clues: { label: string; value: string }[];
  step1Question: string;
  step1Options: string[];
  step1Correct: string;
  step2Formula: string;
  step2NumA: number;
  step2NumB: number;
  step2Product: number;
  step3Unit: string;
  explanation: string;
}

const STORY_SCENARIOS: StoryScenario[] = [
  {
    id: 's1',
    category: 'Misi Koperasi Sekolah',
    themeIcon: '🏫',
    title: 'Pengadaan Buku Pelajaran Matematika',
    narrative: 'Koperasi SD Nusantara memesan 35 paket buku cerita dan matematika untuk perpustakaan. Setiap paket berisi 120 buku. Berapakah total seluruh buku yang diterima sekolah?',
    clues: [
      { label: 'Banyak Paket', value: '35 Paket' },
      { label: 'Isi per Paket', value: '120 Buku' },
      { label: 'Pertanyaan', value: 'Total Seluruh Buku' },
    ],
    step1Question: 'Operasi hitung apakah yang tepat digunakan untuk mencari total buku?',
    step1Options: ['Perkalian (35 × 120)', 'Pembagian (120 : 35)', 'Penjumlahan (120 + 35)', 'Pengurangan (120 - 35)'],
    step1Correct: 'Perkalian (35 × 120)',
    step2Formula: '35 × 120',
    step2NumA: 35,
    step2NumB: 120,
    step2Product: 4200,
    step3Unit: 'buku',
    explanation: 'Karena ada 35 paket yang masing-masing berisi 120 buku, maka totalnya adalah 35 × 120 = 4.200 buku.',
  },
  {
    id: 's2',
    category: 'Misi Panen Kebun Buah',
    themeIcon: '🍎',
    title: 'Hasil Panen Apel Malang',
    narrative: 'Pak Budi memanen buah apel malang dan mengemasnya ke dalam 250 kotak kayu. Setiap kotak kayu memuat 40 buah apel segar. Berapakah jumlah seluruh buah apel hasil panen Pak Budi?',
    clues: [
      { label: 'Banyak Kotak', value: '250 Kotak' },
      { label: 'Isi Tiap Kotak', value: '40 Buah Apel' },
      { label: 'Pertanyaan', value: 'Jumlah Seluruh Buah Apel' },
    ],
    step1Question: 'Operasi hitung apakah yang tepat digunakan untuk menghitung total panen?',
    step1Options: ['Perkalian (250 × 40)', 'Pembagian (250 : 40)', 'Penjumlahan (250 + 40)', 'Pengurangan (250 - 40)'],
    step1Correct: 'Perkalian (250 × 40)',
    step2Formula: '250 × 40',
    step2NumA: 250,
    step2NumB: 40,
    step2Product: 10000,
    step3Unit: 'buah apel',
    explanation: '250 × 40 = (25 × 4) × 100 = 100 × 100 = 10.000 buah apel.',
  },
  {
    id: 's3',
    category: 'Misi Ekspedisi Bantuan',
    themeIcon: '📦',
    title: 'Bantuan Beras untuk Korban Banjir',
    narrative: 'Sebuah yayasan sosial mengirimkan 1.250 kantong beras untuk warga terdampak bencana. Jika setiap kantong berisi 5 kg beras premium, berapa kilogram total seluruh beras bantuan tersebut?',
    clues: [
      { label: 'Jumlah Kantong', value: '1.250 Kantong' },
      { label: 'Berat per Kantong', value: '5 Kg' },
      { label: 'Pertanyaan', value: 'Total Berat Beras' },
    ],
    step1Question: 'Operasi matematika manakah yang mencari total berat beras?',
    step1Options: ['Perkalian (1.250 × 5)', 'Pembagian (1.250 : 5)', 'Penjumlahan (1.250 + 5)', 'Pengurangan (1.250 - 5)'],
    step1Correct: 'Perkalian (1.250 × 5)',
    step2Formula: '1.250 × 5',
    step2NumA: 1250,
    step2NumB: 5,
    step2Product: 6250,
    step3Unit: 'kg beras',
    explanation: '1.250 × 5 = 6.250 kg beras.',
  },
];

export const PerkalianModernCerita: React.FC<CeritaProps> = ({
  onRewardScore,
}) => {
  const [scenarioIdx, setScenarioIdx] = useState<number>(0);
  const [phase, setPhase] = useState<1 | 2 | 3 | 4>(1); // 1: identify, 2: solve, 3: result
  const [selectedStep1, setSelectedStep1] = useState<string | null>(null);
  const [userCalcInput, setUserCalcInput] = useState<string>('');
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const scenario = STORY_SCENARIOS[scenarioIdx];

  const handleSelectStep1 = (opt: string) => {
    setSelectedStep1(opt);
    if (opt === scenario.step1Correct) {
      SoundEffects.playCorrect();
      setPhase(2);
    } else {
      SoundEffects.playWrong();
    }
  };

  const handleVerifyCalc = () => {
    const val = Number(userCalcInput.replace(/\./g, ''));
    if (val === scenario.step2Product) {
      SoundEffects.playCorrect();
      triggerConfetti();
      setPhase(3);
      setIsFinished(true);
      onRewardScore?.(2);
    } else {
      SoundEffects.playWrong();
    }
  };

  const handleNextStory = () => {
    SoundEffects.playClick();
    if (scenarioIdx < STORY_SCENARIOS.length - 1) {
      setScenarioIdx(prev => prev + 1);
    } else {
      setScenarioIdx(0);
    }
    setPhase(1);
    setSelectedStep1(null);
    setUserCalcInput('');
    setIsFinished(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/90 backdrop-blur-xl border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-xl shadow-indigo-950/40 space-y-6">
        {/* Story Header */}
        <div className="flex items-center justify-between border-b border-indigo-500/20 pb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl p-2 bg-indigo-500/20 border border-indigo-400/30 rounded-2xl">
              {scenario.themeIcon}
            </span>
            <div>
              <span className="text-[10px] font-black uppercase text-indigo-400">
                {scenario.category}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white font-heading">
                {scenario.title}
              </h3>
            </div>
          </div>
          <span className="text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-xl border border-indigo-500/30">
            Kasus #{scenarioIdx + 1}
          </span>
        </div>

        {/* Narrative Card */}
        <div className="bg-slate-950/80 border border-indigo-500/30 rounded-2xl p-5 space-y-4">
          <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-medium">
            "{scenario.narrative}"
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
            {scenario.clues.map((c, i) => (
              <div key={i} className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <div className="text-[10px] uppercase font-bold text-indigo-400">{c.label}</div>
                <div className="text-xs font-black text-white font-mono mt-0.5">{c.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Guided Step 1 */}
        {phase === 1 && (
          <div className="bg-slate-800/60 border border-indigo-500/20 rounded-2xl p-5 space-y-4">
            <div className="text-xs font-black uppercase text-amber-300">
              Langkah 1: Identifikasi Hubungan & Operasi Hitung
            </div>
            <div className="text-sm font-bold text-white">{scenario.step1Question}</div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {scenario.step1Options.map(opt => {
                const isChosen = selectedStep1 === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => handleSelectStep1(opt)}
                    className="p-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-indigo-400 text-left rounded-xl text-xs sm:text-sm font-bold text-slate-200 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <span>{opt}</span>
                    <ArrowRight className="w-4 h-4 text-indigo-400" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Guided Step 2 */}
        {phase === 2 && (
          <div className="bg-slate-800/60 border border-indigo-500/20 rounded-2xl p-5 space-y-4">
            <div className="text-xs font-black uppercase text-sky-300">
              Langkah 2: Menghitung Hasil Perkalian
            </div>
            <div className="text-sm font-bold text-white">
              Berapakah hasil dari: <strong className="text-amber-300 font-mono">{scenario.step2Formula}</strong> ?
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <input
                type="number"
                placeholder="Ketik hasil angka..."
                value={userCalcInput}
                onChange={e => setUserCalcInput(e.target.value)}
                className="px-4 py-3 bg-slate-950 border border-indigo-500/40 rounded-xl text-lg font-mono font-black text-white w-60"
              />
              <span className="text-sm font-bold text-slate-400">{scenario.step3Unit}</span>

              <button
                onClick={handleVerifyCalc}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg cursor-pointer font-heading"
              >
                Verifikasi Jawaban
              </button>
            </div>
          </div>
        )}

        {/* Guided Step 3 (Completed) */}
        {phase === 3 && (
          <div className="bg-slate-950 border border-emerald-500/40 rounded-2xl p-6 space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center text-3xl mx-auto">
              ✓
            </div>
            <div className="space-y-1">
              <h4 className="text-xl font-black text-white font-heading">
                Kesimpulan Tepat!
              </h4>
              <p className="text-sm text-emerald-300 font-mono font-bold">
                Total = {scenario.step2Product.toLocaleString('id-ID')} {scenario.step3Unit}
              </p>
              <p className="text-xs text-slate-300 max-w-lg mx-auto pt-1">
                {scenario.explanation}
              </p>
            </div>

            <button
              onClick={handleNextStory}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg cursor-pointer font-heading flex items-center gap-2 mx-auto"
            >
              <span>Kasus Soal Cerita Selanjutnya</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
