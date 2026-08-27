import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  RefreshCw,
  RotateCcw,
  Layers,
  Calculator,
  ArrowRight,
} from 'lucide-react';
import { SoundEffects } from '../utils/sound';
import { triggerConfetti } from '../utils/confetti';

interface MateriProps {
  onUnlockBadge?: (badgeId: string) => void;
}

export type EquationType = 'A_minus_X_eq_B' | 'X_minus_A_eq_B' | 'A_plus_X_eq_B' | 'X_plus_A_eq_B';

interface SoalPreset {
  id: string;
  label: string;
  category: 'Ratusan' | 'Ribuan' | 'Puluh Ribuan';
  equationType: EquationType;
  numA: number;
  numB: number;
  description: string;
}

const PRESET_SOAL: SoalPreset[] = [
  {
    id: 'soal-900',
    label: '900 - ... = 100',
    category: 'Ratusan',
    equationType: 'A_minus_X_eq_B',
    numA: 900,
    numB: 100,
    description: 'Ratusan Bulat: 900 - ... = 100',
  },
  {
    id: 'soal-678',
    label: '678 - ... = 243',
    category: 'Ratusan',
    equationType: 'A_minus_X_eq_B',
    numA: 678,
    numB: 243,
    description: 'Ratusan Lengkap: 678 - ... = 243',
  },
  {
    id: 'soal-minuend-300',
    label: '... - 300 = 200',
    category: 'Ratusan',
    equationType: 'X_minus_A_eq_B',
    numA: 300,
    numB: 200,
    description: 'Mencari Awal: ... - 300 = 200',
  },
  {
    id: 'soal-ribuan-4500',
    label: '4.500 - ... = 1.200',
    category: 'Ribuan',
    equationType: 'A_minus_X_eq_B',
    numA: 4500,
    numB: 1200,
    description: 'Ribuan: 4.500 - ... = 1.200',
  },
  {
    id: 'soal-ribuan-minuend',
    label: '... - 2.450 = 3.120',
    category: 'Ribuan',
    equationType: 'X_minus_A_eq_B',
    numA: 2450,
    numB: 3120,
    description: 'Ribuan Mencari Awal: ... - 2.450 = 3.120',
  },
  {
    id: 'soal-puluh-ribu-50k',
    label: '50.000 - ... = 18.000',
    category: 'Puluh Ribuan',
    equationType: 'A_minus_X_eq_B',
    numA: 50000,
    numB: 18000,
    description: 'Puluhan Ribu: 50.000 - ... = 18.000',
  },
  {
    id: 'soal-puluh-ribu-87500',
    label: '87.650 - ... = 34.210',
    category: 'Puluh Ribuan',
    equationType: 'A_minus_X_eq_B',
    numA: 87650,
    numB: 34210,
    description: 'Puluhan Ribu Lengkap: 87.650 - ... = 34.210',
  },
  {
    id: 'soal-puluh-ribu-plus',
    label: '15.000 + ... = 35.000',
    category: 'Puluh Ribuan',
    equationType: 'A_plus_X_eq_B',
    numA: 15000,
    numB: 35000,
    description: 'Penjumlahan Puluh Ribuan: 15.000 + ... = 35.000',
  },
  {
    id: 'soal-puluh-ribu-minuend',
    label: '... - 12.300 = 25.400',
    category: 'Puluh Ribuan',
    equationType: 'X_minus_A_eq_B',
    numA: 12300,
    numB: 25400,
    description: 'Puluhan Ribu Awal: ... - 12.300 = 25.400',
  },
];

// Definition of place values
const PLACE_VALUES = [
  { key: 'puluhRibuan', label: 'Puluh Ribuan', unit: '10.000-an', colorBg: 'bg-rose-400', colorLight: 'bg-rose-50', textColor: 'text-rose-950', border: 'border-rose-400' },
  { key: 'ribuan', label: 'Ribuan', unit: '1.000-an', colorBg: 'bg-purple-400', colorLight: 'bg-purple-50', textColor: 'text-purple-950', border: 'border-purple-400' },
  { key: 'ratusan', label: 'Ratusan', unit: '100-an', colorBg: 'bg-blue-400', colorLight: 'bg-blue-50', textColor: 'text-blue-950', border: 'border-blue-400' },
  { key: 'puluhan', label: 'Puluhan', unit: '10-an', colorBg: 'bg-amber-400', colorLight: 'bg-amber-50', textColor: 'text-amber-950', border: 'border-amber-400' },
  { key: 'satuan', label: 'Satuan', unit: '1-an', colorBg: 'bg-emerald-400', colorLight: 'bg-emerald-50', textColor: 'text-emerald-950', border: 'border-emerald-400' },
];

export const MateriSusunPendek: React.FC<MateriProps> = ({ onUnlockBadge }) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('soal-900');
  const [equationType, setEquationType] = useState<EquationType>('A_minus_X_eq_B');
  const [numA, setNumA] = useState<number>(900);
  const [numB, setNumB] = useState<number>(100);

  // Custom Form
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [customA, setCustomA] = useState<string>('900');
  const [customB, setCustomB] = useState<string>('100');

  // Interactive inputs per digit (array of strings, length matches digit count)
  const [userDigitInputs, setUserDigitInputs] = useState<string[]>([]);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'Semua' | 'Ratusan' | 'Ribuan' | 'Puluh Ribuan'>('Semua');

  const [verificationResult, setVerificationResult] = useState<{
    isComplete: boolean;
    isCorrect: boolean;
    message: string;
    correctUnknownValue: number;
  } | null>(null);

  // Calculate correct unknown value based on equation type
  // A_minus_X_eq_B: A - ? = B => ? = A - B
  // X_minus_A_eq_B: ? - A = B => ? = B + A
  // A_plus_X_eq_B:  A + ? = B => ? = B - A
  // X_plus_A_eq_B:  ? + A = B => ? = B - A
  const calculateCorrectUnknown = (): number => {
    switch (equationType) {
      case 'A_minus_X_eq_B':
        return numA - numB;
      case 'X_minus_A_eq_B':
        return numB + numA;
      case 'A_plus_X_eq_B':
      case 'X_plus_A_eq_B':
        return numB - numA;
      default:
        return numA - numB;
    }
  };

  const correctUnknownValue = calculateCorrectUnknown();

  // Determine which row is which in the vertical equation:
  // Row 1 (Top)
  // Row 2 (Middle)
  // Line & Operator
  // Row 3 (Bottom Result)
  // Position of Unknown:
  // 'A_minus_X_eq_B': Top = numA, Middle = [Unknown], Operator = '-', Bottom = numB
  // 'X_minus_A_eq_B': Top = [Unknown], Middle = numA, Operator = '-', Bottom = numB
  // 'A_plus_X_eq_B':  Top = numA, Middle = [Unknown], Operator = '+', Bottom = numB
  // 'X_plus_A_eq_B':  Top = [Unknown], Middle = numA, Operator = '+', Bottom = numB

  const isUnknownOnTop = equationType === 'X_minus_A_eq_B' || equationType === 'X_plus_A_eq_B';
  const operator = equationType.includes('minus') ? '-' : '+';

  // Determine maximum digits among all involved numbers (Top, Middle, Bottom)
  const maxNumber = Math.max(
    Math.abs(numA),
    Math.abs(numB),
    Math.abs(correctUnknownValue)
  );

  // Calculate digit count: 3 (hundreds), 4 (thousands), or 5 (ten-thousands)
  const digitCount = Math.max(3, Math.min(5, maxNumber.toString().length));

  // Active place values slice (take last `digitCount` elements of PLACE_VALUES)
  const activePlaceValues = PLACE_VALUES.slice(PLACE_VALUES.length - digitCount);

  // Initialize or resize user inputs array when digit count changes
  useEffect(() => {
    setUserDigitInputs(new Array(digitCount).fill(''));
    setVerificationResult(null);
    setShowExplanation(false);
  }, [digitCount, selectedPresetId, numA, numB, equationType]);

  // Helper to split a number into an array of single digit strings of length `digitCount`
  const getPaddedDigits = (val: number): string[] => {
    const str = Math.abs(val).toString().padStart(digitCount, '0');
    // If str is longer than digitCount, take the end
    return str.slice(-digitCount).split('');
  };

  const topGivenDigits = !isUnknownOnTop ? getPaddedDigits(numA) : [];
  const middleGivenDigits = isUnknownOnTop ? getPaddedDigits(numA) : [];
  const bottomResultDigits = getPaddedDigits(numB);
  const correctUnknownDigits = getPaddedDigits(correctUnknownValue);

  // Change preset
  const handleSelectPreset = (preset: SoalPreset) => {
    SoundEffects.playClick();
    setSelectedPresetId(preset.id);
    setIsCustomMode(false);
    setEquationType(preset.equationType);
    setNumA(preset.numA);
    setNumB(preset.numB);
    setVerificationResult(null);
    setShowExplanation(false);
  };

  // Randomize preset
  const handleRandomize = () => {
    SoundEffects.playClick();
    const filtered =
      activeCategoryFilter === 'Semua'
        ? PRESET_SOAL
        : PRESET_SOAL.filter(p => p.category === activeCategoryFilter);
    const pool = filtered.length > 0 ? filtered : PRESET_SOAL;
    const remaining = pool.filter(p => p.id !== selectedPresetId);
    const pick = remaining[Math.floor(Math.random() * remaining.length)] || pool[0];
    handleSelectPreset(pick);
  };

  // Custom Submit
  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const valA = parseInt(customA, 10);
    const valB = parseInt(customB, 10);

    if (isNaN(valA) || isNaN(valB) || valA < 0 || valB < 0) {
      SoundEffects.playWrong();
      alert('Masukkan angka positif yang valid!');
      return;
    }

    if (valA > 99999 || valB > 99999) {
      SoundEffects.playWrong();
      alert('Maksimal angka adalah puluhan ribu (hingga 99.999).');
      return;
    }

    if (equationType === 'A_minus_X_eq_B' && valA <= valB) {
      SoundEffects.playWrong();
      alert('Untuk bentuk A - ... = B, angka A harus lebih besar dari angka B.');
      return;
    }

    if ((equationType === 'A_plus_X_eq_B' || equationType === 'X_plus_A_eq_B') && valB <= valA) {
      SoundEffects.playWrong();
      alert('Untuk penjumlahan, hasil akhir B harus lebih besar dari angka A.');
      return;
    }

    SoundEffects.playClick();
    setNumA(valA);
    setNumB(valB);
    setSelectedPresetId('custom');
  };

  // Update a digit input
  const handleDigitChange = (index: number, val: string) => {
    // Only accept last digit if multiple entered
    const sanitized = val.replace(/[^0-9]/g, '');
    const char = sanitized.length > 0 ? sanitized.slice(-1) : '';

    const newInputs = [...userDigitInputs];
    newInputs[index] = char;
    setUserDigitInputs(newInputs);

    // Auto focus next input (right to left or left to right)
    if (char !== '' && index < digitCount - 1) {
      const nextInput = document.getElementById(`digit-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  // Check answer
  const handleCheckAnswer = () => {
    const hasEmpty = userDigitInputs.some(d => d.trim() === '');
    if (hasEmpty) {
      SoundEffects.playWrong();
      setVerificationResult({
        isComplete: false,
        isCorrect: false,
        message: 'Mohon isi semua kotak nilai tempat pada barisan bilangan misteri!',
        correctUnknownValue,
      });
      return;
    }

    const userNumberStr = userDigitInputs.join('');
    const userNumberVal = parseInt(userNumberStr, 10);
    const isCorrect = userNumberVal === correctUnknownValue;

    if (isCorrect) {
      SoundEffects.playCorrect();
      triggerConfetti();
      onUnlockBadge?.('susun-pendek-ahli');
      if (digitCount >= 4) {
        onUnlockBadge?.('ribuan-master');
      }
      setVerificationResult({
        isComplete: true,
        isCorrect: true,
        message: `🎉 TEPAT SEKALI! Bilangan misteri yang kamu susun bernilai ${userNumberVal.toLocaleString('id-ID')}. Perhitungan susun pendek sangat sesuai!`,
        correctUnknownValue,
      });
      setShowExplanation(true);
    } else {
      SoundEffects.playWrong();
      setVerificationResult({
        isComplete: true,
        isCorrect: false,
        message: `Masih belum tepat. Kamu menyusun angka ${userNumberVal.toLocaleString('id-ID')}. Ayo periksa kembali operasi nilai tempat per kolomnya!`,
        correctUnknownValue,
      });
    }
  };

  // Reset inputs
  const handleResetInputs = () => {
    SoundEffects.playClick();
    setUserDigitInputs(new Array(digitCount).fill(''));
    setVerificationResult(null);
    setShowExplanation(false);
  };

  // Filter presets
  const filteredPresets =
    activeCategoryFilter === 'Semua'
      ? PRESET_SOAL
      : PRESET_SOAL.filter(p => p.category === activeCategoryFilter);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Banner Header */}
      <div className="bg-blue-400 border-4 border-black rounded-3xl p-6 sm:p-8 text-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border-2 border-black rounded-full text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>Materi Interaktif Nilai Tempat (Hingga Puluhan Ribu)</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black font-heading text-slate-900">
            Metode Susun Pendek: Menentukan Nilai Misteri
          </h2>
          <p className="text-slate-900 text-sm sm:text-base font-bold max-w-2xl">
            Isi langsung <strong>kotak interaktif pada barisan bilangan yang belum diketahui</strong> per nilai tempat (Satuan, Puluhan, Ratusan, Ribuan, hingga Puluh Ribuan).
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-2 mt-6">
          <span className="text-xs font-black uppercase tracking-wider text-slate-900 bg-white/80 px-2.5 py-1 rounded-lg border border-black">
            Tingkat:
          </span>
          {(['Semua', 'Ratusan', 'Ribuan', 'Puluh Ribuan'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => {
                SoundEffects.playClick();
                setActiveCategoryFilter(cat);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-black border-2 border-black transition-all cursor-pointer ${
                activeCategoryFilter === cat
                  ? 'bg-yellow-300 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5'
                  : 'bg-white text-slate-800 hover:bg-yellow-100'
              }`}
            >
              {cat}
            </button>
          ))}
          <button
            onClick={() => {
              SoundEffects.playClick();
              setIsCustomMode(!isCustomMode);
              if (!isCustomMode) {
                setSelectedPresetId('custom');
              }
            }}
            className={`px-3 py-1 rounded-xl text-xs font-black border-2 border-black transition-all cursor-pointer ${
              isCustomMode
                ? 'bg-purple-300 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5'
                : 'bg-white text-slate-800 hover:bg-purple-100'
            }`}
          >
            ✏️ Buat Soal Bebas
          </button>
        </div>

        {/* Preset Chips */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          {filteredPresets.map(preset => (
            <button
              key={preset.id}
              onClick={() => handleSelectPreset(preset)}
              className={`px-3 py-1.5 rounded-xl font-black text-xs sm:text-sm border-2 border-black transition-all cursor-pointer ${
                selectedPresetId === preset.id
                  ? 'bg-yellow-300 text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5'
                  : 'bg-white text-slate-800 hover:bg-yellow-100'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Form Drawer */}
      <AnimatePresence>
        {isCustomMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-purple-100 border-4 border-black rounded-3xl p-5 sm:p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="font-black text-base sm:text-lg text-slate-900 font-heading flex items-center gap-2">
                <Calculator className="w-5 h-5 text-purple-700" />
                Buat Soal Kustom (Maksimal 5 Digit / Puluhan Ribu)
              </h3>

              {/* Equation Type Picker */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { type: 'A_minus_X_eq_B', label: 'A - ... = B' },
                  { type: 'X_minus_A_eq_B', label: '... - A = B' },
                  { type: 'A_plus_X_eq_B', label: 'A + ... = B' },
                  { type: 'X_plus_A_eq_B', label: '... + A = B' },
                ].map(item => (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => setEquationType(item.type as EquationType)}
                    className={`px-2.5 py-1 text-xs font-black rounded-lg border-2 border-black ${
                      equationType === item.type ? 'bg-yellow-300' : 'bg-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleApplyCustom} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div>
                <label className="block text-xs font-black text-slate-900 uppercase mb-1">
                  {isUnknownOnTop ? 'Angka Pengurang / Penambah (A):' : 'Angka Awal (A):'}
                </label>
                <input
                  type="number"
                  min="0"
                  max="99999"
                  value={customA}
                  onChange={e => setCustomA(e.target.value)}
                  className="w-full px-3 py-2 bg-white border-2 border-black rounded-xl font-black text-lg focus:outline-none"
                  placeholder="Misal: 900 atau 45000"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-900 uppercase mb-1">
                  Hasil Akhir (B):
                </label>
                <input
                  type="number"
                  min="0"
                  max="99999"
                  value={customB}
                  onChange={e => setCustomB(e.target.value)}
                  className="w-full px-3 py-2 bg-white border-2 border-black rounded-xl font-black text-lg focus:outline-none"
                  placeholder="Misal: 100 atau 18000"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-yellow-300 hover:bg-yellow-400 text-black border-2 border-black rounded-xl font-black text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 cursor-pointer font-heading"
              >
                Terapkan Soal Kustom
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Interactive Stage */}
      <div className="bg-white border-4 border-black rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6">
        {/* Header Display of the equation */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b-3 border-black pb-5">
          <div>
            <div className="text-xs font-black text-slate-500 uppercase tracking-wider">
              Persamaan Soal yang Akan Diselesaikan:
            </div>
            <div className="text-2xl sm:text-4xl font-black text-slate-900 font-heading tracking-wide mt-1 flex items-center gap-2 sm:gap-3 flex-wrap">
              {equationType === 'A_minus_X_eq_B' && (
                <>
                  <span className="text-blue-600 bg-blue-50 border-2 border-black px-3 py-1 rounded-xl">
                    {numA.toLocaleString('id-ID')}
                  </span>
                  <span className="text-slate-500">-</span>
                  <span className="bg-yellow-200 border-2 border-black px-3 py-1 rounded-xl text-slate-900 animate-pulse">
                    ?
                  </span>
                  <span className="text-slate-500">=</span>
                  <span className="text-green-600 bg-green-50 border-2 border-black px-3 py-1 rounded-xl">
                    {numB.toLocaleString('id-ID')}
                  </span>
                </>
              )}
              {equationType === 'X_minus_A_eq_B' && (
                <>
                  <span className="bg-yellow-200 border-2 border-black px-3 py-1 rounded-xl text-slate-900 animate-pulse">
                    ?
                  </span>
                  <span className="text-slate-500">-</span>
                  <span className="text-blue-600 bg-blue-50 border-2 border-black px-3 py-1 rounded-xl">
                    {numA.toLocaleString('id-ID')}
                  </span>
                  <span className="text-slate-500">=</span>
                  <span className="text-green-600 bg-green-50 border-2 border-black px-3 py-1 rounded-xl">
                    {numB.toLocaleString('id-ID')}
                  </span>
                </>
              )}
              {equationType === 'A_plus_X_eq_B' && (
                <>
                  <span className="text-blue-600 bg-blue-50 border-2 border-black px-3 py-1 rounded-xl">
                    {numA.toLocaleString('id-ID')}
                  </span>
                  <span className="text-slate-500">+</span>
                  <span className="bg-yellow-200 border-2 border-black px-3 py-1 rounded-xl text-slate-900 animate-pulse">
                    ?
                  </span>
                  <span className="text-slate-500">=</span>
                  <span className="text-green-600 bg-green-50 border-2 border-black px-3 py-1 rounded-xl">
                    {numB.toLocaleString('id-ID')}
                  </span>
                </>
              )}
              {equationType === 'X_plus_A_eq_B' && (
                <>
                  <span className="bg-yellow-200 border-2 border-black px-3 py-1 rounded-xl text-slate-900 animate-pulse">
                    ?
                  </span>
                  <span className="text-slate-500">+</span>
                  <span className="text-blue-600 bg-blue-50 border-2 border-black px-3 py-1 rounded-xl">
                    {numA.toLocaleString('id-ID')}
                  </span>
                  <span className="text-slate-500">=</span>
                  <span className="text-green-600 bg-green-50 border-2 border-black px-3 py-1 rounded-xl">
                    {numB.toLocaleString('id-ID')}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <button
              type="button"
              onClick={handleRandomize}
              className="px-3.5 py-2 bg-yellow-300 hover:bg-yellow-400 text-black border-2 border-black rounded-xl text-xs font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 flex items-center gap-1.5 transition-all cursor-pointer font-heading"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Acak Soal</span>
            </button>
            <button
              type="button"
              onClick={handleResetInputs}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border-2 border-black rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Kosongkan</span>
            </button>
          </div>
        </div>

        {/* Key Instructions Banner */}
        <div className="bg-yellow-50 border-3 border-black rounded-2xl p-4 sm:p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-2">
          <div className="flex items-center gap-2 font-black text-sm sm:text-base text-yellow-950 font-heading">
            <Sparkles className="w-5 h-5 text-yellow-600" />
            <span>FOKUS: Tentukan Nilai Tempat Bilangan Misteri (?)</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-800 font-semibold leading-relaxed">
            Isi kotak kuning <strong className="bg-yellow-200 px-1.5 py-0.5 rounded border border-black">[ ? ]</strong> pada barisan bilangan yang belum diketahui agar operasi matematika susun pendek di bawah ini menjadi seimbang dan benar!
          </p>
        </div>

        {/* THE VERTICAL INTERACTIVE SUSUN PENDEK BOARD */}
        <div className="bg-slate-50 border-4 border-black rounded-3xl p-5 sm:p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center">
          <div className="w-full max-w-xl space-y-3">
            {/* Header Columns: Place Values (Dynamic for 3, 4, or 5 digits) */}
            <div
              className="grid gap-2 sm:gap-3 text-center items-center"
              style={{ gridTemplateColumns: `repeat(${digitCount}, minmax(0, 1fr))` }}
            >
              {activePlaceValues.map((pv, idx) => (
                <div
                  key={pv.key}
                  className={`p-2 sm:p-2.5 rounded-2xl border-3 border-black text-center transition-all ${pv.colorBg} text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}
                >
                  <div className="text-[10px] sm:text-xs font-black uppercase tracking-wider truncate">
                    {pv.label}
                  </div>
                  <div className="text-[11px] sm:text-xs font-black font-mono mt-0.5 opacity-90">
                    {pv.unit}
                  </div>
                </div>
              ))}
            </div>

            {/* BARIS 1: TOP ROW */}
            <div
              className="grid gap-2 sm:gap-3 items-center"
              style={{ gridTemplateColumns: `repeat(${digitCount}, minmax(0, 1fr))` }}
            >
              {isUnknownOnTop
                ? // UNKNOWN INPUTS ON TOP ROW
                  userDigitInputs.map((val, idx) => (
                    <div key={`top-input-${idx}`} className="flex flex-col items-center">
                      <input
                        id={`digit-input-${idx}`}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        placeholder="?"
                        value={val}
                        onChange={e => handleDigitChange(idx, e.target.value)}
                        className={`w-full h-14 sm:h-16 text-center text-2xl sm:text-3xl font-black rounded-2xl border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-heading transition-all focus:outline-none ${
                          val !== ''
                            ? val === correctUnknownDigits[idx]
                              ? 'bg-green-200 text-green-950 ring-2 ring-green-500'
                              : 'bg-rose-200 text-rose-950'
                            : 'bg-yellow-200 text-slate-900 focus:bg-yellow-300'
                        }`}
                        title={`Ketik digit untuk ${activePlaceValues[idx].label}`}
                      />
                    </div>
                  ))
                : // GIVEN NUMBER ON TOP ROW
                  topGivenDigits.map((digit, idx) => (
                    <div
                      key={`top-digit-${idx}`}
                      className="h-14 sm:h-16 bg-white border-3 border-black rounded-2xl flex items-center justify-center font-heading text-2xl sm:text-3xl font-black text-blue-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    >
                      {digit}
                    </div>
                  ))}
            </div>

            {/* BARIS 2: MIDDLE ROW */}
            <div
              className="grid gap-2 sm:gap-3 items-center"
              style={{ gridTemplateColumns: `repeat(${digitCount}, minmax(0, 1fr))` }}
            >
              {!isUnknownOnTop
                ? // UNKNOWN INPUTS ON MIDDLE ROW
                  userDigitInputs.map((val, idx) => (
                    <div key={`mid-input-${idx}`} className="flex flex-col items-center">
                      <input
                        id={`digit-input-${idx}`}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        placeholder="?"
                        value={val}
                        onChange={e => handleDigitChange(idx, e.target.value)}
                        className={`w-full h-14 sm:h-16 text-center text-2xl sm:text-3xl font-black rounded-2xl border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-heading transition-all focus:outline-none ${
                          val !== ''
                            ? val === correctUnknownDigits[idx]
                              ? 'bg-green-200 text-green-950 ring-2 ring-green-500'
                              : 'bg-rose-200 text-rose-950'
                            : 'bg-yellow-200 text-slate-900 focus:bg-yellow-300'
                        }`}
                        title={`Ketik digit untuk ${activePlaceValues[idx].label}`}
                      />
                    </div>
                  ))
                : // GIVEN NUMBER ON MIDDLE ROW
                  middleGivenDigits.map((digit, idx) => (
                    <div
                      key={`mid-digit-${idx}`}
                      className="h-14 sm:h-16 bg-white border-3 border-black rounded-2xl flex items-center justify-center font-heading text-2xl sm:text-3xl font-black text-blue-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    >
                      {digit}
                    </div>
                  ))}
            </div>

            {/* NEAT HORIZONTAL SEPARATOR LINE WITH OPERATOR (+ / -) AT THE RIGHT END */}
            <div className="flex items-center gap-2 pt-1 pb-1">
              <div className="flex-1 h-1.5 bg-black rounded-full" />
              <div className="w-10 h-10 bg-yellow-300 border-3 border-black rounded-xl flex items-center justify-center text-2xl font-black font-mono shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0">
                {operator}
              </div>
            </div>

            {/* BARIS 3: BOTTOM ROW (GIVEN RESULT) */}
            <div
              className="grid gap-2 sm:gap-3 items-center"
              style={{ gridTemplateColumns: `repeat(${digitCount}, minmax(0, 1fr))` }}
            >
              {bottomResultDigits.map((digit, idx) => (
                <div
                  key={`bot-digit-${idx}`}
                  className="h-14 sm:h-16 bg-emerald-100 border-3 border-black rounded-2xl flex items-center justify-center font-heading text-2xl sm:text-3xl font-black text-emerald-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  {digit}
                </div>
              ))}
            </div>

            {/* Legend Labels for the rows */}
            <div className="pt-3 flex flex-wrap items-center justify-between text-xs font-bold text-slate-600 px-1">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-yellow-300 border border-black inline-block" />
                Kotak Kuning = Barisan Bilangan Misteri yang Dicari
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-300 border border-black inline-block" />
                Kotak Hijau = Hasil Operasi
              </span>
            </div>
          </div>

          {/* Action Check Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full max-w-xl">
            <button
              type="button"
              onClick={handleCheckAnswer}
              className="w-full sm:flex-1 py-3.5 bg-yellow-300 hover:bg-yellow-400 text-black font-black text-base rounded-2xl border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none flex items-center justify-center gap-2 transition-all cursor-pointer font-heading"
            >
              <CheckCircle2 className="w-5 h-5 text-black" />
              <span>Periksa Jawaban Susun Pendek</span>
            </button>
            <button
              type="button"
              onClick={() => setShowExplanation(!showExplanation)}
              className="w-full sm:w-auto px-4 py-3.5 bg-white hover:bg-slate-100 text-slate-900 font-black text-sm rounded-2xl border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-purple-600" />
              <span>{showExplanation ? 'Tutup Penjelasan' : 'Lihat Pembuktian'}</span>
            </button>
          </div>
        </div>

        {/* Verification Result Feedback */}
        {verificationResult && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-5 rounded-2xl border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-2 ${
              verificationResult.isCorrect
                ? 'bg-green-100 text-green-950'
                : 'bg-rose-100 text-rose-950'
            }`}
          >
            <div className="font-black text-base sm:text-lg flex items-center gap-2 font-heading">
              {verificationResult.isCorrect ? (
                <>
                  <CheckCircle2 className="w-6 h-6 text-green-600 fill-green-200" />
                  <span>LUAR BIASA! JAWABAN TEPAT!</span>
                </>
              ) : (
                <>
                  <HelpCircle className="w-6 h-6 text-rose-600" />
                  <span>AYO TELITI LAGI</span>
                </>
              )}
            </div>
            <p className="text-sm font-semibold">{verificationResult.message}</p>
          </motion.div>
        )}

        {/* Step-by-Step Explanation & Place Value Breakdown */}
        {showExplanation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-blue-50 border-3 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4"
          >
            <h4 className="font-black text-base sm:text-lg text-blue-950 font-heading flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-700" />
              Pembedahan Cara Susun Pendek per Nilai Tempat:
            </h4>

            {/* Grid of columns */}
            <div
              className="grid gap-3"
              style={{
                gridTemplateColumns:
                  digitCount <= 3 ? 'repeat(3, minmax(0, 1fr))' : 'repeat(auto-fit, minmax(140px, 1fr))',
              }}
            >
              {activePlaceValues.map((pv, idx) => {
                const topD = isUnknownOnTop ? parseInt(correctUnknownDigits[idx], 10) : parseInt(topGivenDigits[idx], 10);
                const midD = isUnknownOnTop ? parseInt(middleGivenDigits[idx], 10) : parseInt(correctUnknownDigits[idx], 10);
                const botD = parseInt(bottomResultDigits[idx], 10);
                const unknownDigit = parseInt(correctUnknownDigits[idx], 10);

                let explanationFormula = '';
                if (equationType === 'A_minus_X_eq_B') {
                  explanationFormula = `${topD} - [ ? ] = ${botD}  ➔  [ ? ] = ${topD} - ${botD} = ${unknownDigit}`;
                } else if (equationType === 'X_minus_A_eq_B') {
                  explanationFormula = `[ ? ] - ${midD} = ${botD}  ➔  [ ? ] = ${botD} + ${midD} = ${unknownDigit}`;
                } else if (equationType === 'A_plus_X_eq_B') {
                  explanationFormula = `${topD} + [ ? ] = ${botD}  ➔  [ ? ] = ${botD} - ${topD} = ${unknownDigit}`;
                } else {
                  explanationFormula = `[ ? ] + ${midD} = ${botD}  ➔  [ ? ] = ${botD} - ${midD} = ${unknownDigit}`;
                }

                return (
                  <div key={pv.key} className="bg-white border-2 border-black rounded-xl p-3.5 space-y-1.5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] font-black uppercase px-2 py-0.5 rounded border border-black ${pv.colorBg}`}>
                        {pv.label}
                      </span>
                    </div>
                    <div className="text-xs font-black font-mono text-slate-800 pt-1">
                      {explanationFormula}
                    </div>
                    <p className="text-[11px] text-slate-600 font-medium">
                      Digit {pv.label} adalah <strong className="text-slate-900">{unknownDigit}</strong> ({unknownDigit} × {pv.unit}).
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Combined Final Verification Banner */}
            <div className="bg-white border-2 border-black rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div>
                <div className="text-xs font-black text-slate-500 uppercase">
                  Bilangan Misteri yang Ditemukan:
                </div>
                <div className="text-xl font-black text-slate-900 font-heading">
                  <span className="text-blue-600">{correctUnknownValue.toLocaleString('id-ID')}</span>
                </div>
              </div>

              {/* Equation Proof */}
              <div className="bg-green-100 border-2 border-green-500 px-3.5 py-2 rounded-xl text-green-950 font-bold text-xs space-y-0.5">
                <div className="font-black text-green-900 uppercase">✅ Pembuktian Persamaan:</div>
                <div className="font-mono text-sm">
                  {equationType === 'A_minus_X_eq_B' && `${numA.toLocaleString('id-ID')} - ${correctUnknownValue.toLocaleString('id-ID')} = ${numB.toLocaleString('id-ID')}`}
                  {equationType === 'X_minus_A_eq_B' && `${correctUnknownValue.toLocaleString('id-ID')} - ${numA.toLocaleString('id-ID')} = ${numB.toLocaleString('id-ID')}`}
                  {equationType === 'A_plus_X_eq_B' && `${numA.toLocaleString('id-ID')} + ${correctUnknownValue.toLocaleString('id-ID')} = ${numB.toLocaleString('id-ID')}`}
                  {equationType === 'X_plus_A_eq_B' && `${correctUnknownValue.toLocaleString('id-ID')} + ${numA.toLocaleString('id-ID')} = ${numB.toLocaleString('id-ID')}`}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
