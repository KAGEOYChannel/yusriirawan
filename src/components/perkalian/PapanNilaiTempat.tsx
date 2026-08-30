import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Layers, ArrowRight, Sparkles, RefreshCw, HelpCircle, CheckCircle2 } from 'lucide-react';
import { SoundEffects } from '../../utils/sound';
import { triggerConfetti } from '../../utils/confetti';

interface PapanProps {
  onUnlockBadge?: (badgeId: string) => void;
}

const PLACE_COLUMNS = [
  { key: 'ratusRibu', label: 'Ratus Ribuan', val: 100000, color: 'bg-rose-400', border: 'border-rose-500' },
  { key: 'puluhRibu', label: 'Puluh Ribuan', val: 10000, color: 'bg-orange-400', border: 'border-orange-500' },
  { key: 'ribuan', label: 'Ribuan', val: 1000, color: 'bg-purple-400', border: 'border-purple-500' },
  { key: 'ratusan', label: 'Ratusan', val: 100, color: 'bg-blue-400', border: 'border-blue-500' },
  { key: 'puluhan', label: 'Puluhan', val: 10, color: 'bg-amber-400', border: 'border-amber-500' },
  { key: 'satuan', label: 'Satuan', val: 1, color: 'bg-emerald-400', border: 'border-emerald-500' },
];

export const PapanNilaiTempat: React.FC<PapanProps> = ({ onUnlockBadge }) => {
  const [inputNum, setInputNum] = useState<number>(177);
  const [multiplier, setMultiplier] = useState<1 | 10 | 100 | 1000>(1);
  const [isShifting, setIsShifting] = useState<boolean>(false);
  const [customInputText, setCustomInputText] = useState<string>('177');

  const currentResult = inputNum * multiplier;

  // Convert number to 6-digit array aligned to place value columns
  const getDigitArray = (num: number) => {
    const s = num.toString().padStart(6, ' ');
    return s.split('');
  };

  const currentDigits = getDigitArray(currentResult);
  const originalDigits = getDigitArray(inputNum);

  const handleApplyMultiplier = (mult: 1 | 10 | 100 | 1000) => {
    SoundEffects.playClick();
    setIsShifting(true);
    setMultiplier(mult);
    if (mult === 1000) {
      onUnlockBadge?.('jago-nilai-tempat');
    }
    setTimeout(() => {
      setIsShifting(false);
      SoundEffects.playCorrect();
    }, 400);
  };

  const handleSetNumber = (num: number) => {
    SoundEffects.playClick();
    setInputNum(num);
    setCustomInputText(num.toString());
    setMultiplier(1);
  };

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(customInputText, 10);
    if (!isNaN(parsed) && parsed > 0 && parsed <= 9999) {
      SoundEffects.playClick();
      setInputNum(parsed);
      setMultiplier(1);
    } else {
      SoundEffects.playWrong();
    }
  };

  return (
    <div className="bg-white border-4 border-black rounded-3xl p-5 sm:p-7 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-3 border-black pb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-200 border-2 border-black rounded-full text-xs font-black uppercase tracking-wider">
            <Layers className="w-4 h-4 text-purple-700" />
            <span>Fitur Khusus: Laboratorium Nilai Tempat</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
            Papan Interaktif Pergeseran Nilai Tempat
          </h3>
          <p className="text-xs sm:text-sm font-semibold text-slate-600">
            Perhatikan bagaimana setiap angka <strong>bergeser ke kiri</strong> dan angka <strong>0</strong> bertambah saat dikalikan dengan 10, 100, atau 1.000.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[23, 177, 345, 1250].map(val => (
            <button
              key={val}
              onClick={() => handleSetNumber(val)}
              className={`px-2.5 py-1 text-xs font-black rounded-xl border-2 border-black transition-all cursor-pointer ${
                inputNum === val && multiplier === 1
                  ? 'bg-yellow-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5'
                  : 'bg-slate-100 hover:bg-yellow-100'
              }`}
            >
              {val.toLocaleString('id-ID')}
            </button>
          ))}
        </div>
      </div>

      {/* Input Number & Custom controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-blue-50 border-2 border-black rounded-2xl p-4">
        <form onSubmit={handleApplyCustom} className="flex items-center gap-2">
          <label className="text-xs font-black uppercase text-slate-700">Angka Awal:</label>
          <input
            type="number"
            min="1"
            max="9999"
            value={customInputText}
            onChange={e => setCustomInputText(e.target.value)}
            className="w-24 sm:w-28 px-3 py-1.5 bg-white border-2 border-black rounded-xl font-black text-base text-center"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-yellow-300 hover:bg-yellow-400 border-2 border-black rounded-xl text-xs font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer font-heading"
          >
            Terapkan
          </button>
        </form>

        {/* Multiplier Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-black uppercase text-slate-700">Kalikan Dengan:</span>
          {[
            { mult: 1 as const, label: 'Semula (× 1)', bg: 'bg-white' },
            { mult: 10 as const, label: '× 10 (+1 Nol)', bg: 'bg-amber-300' },
            { mult: 100 as const, label: '× 100 (+2 Nol)', bg: 'bg-blue-300' },
            { mult: 1000 as const, label: '× 1.000 (+3 Nol)', bg: 'bg-purple-300' },
          ].map(btn => (
            <button
              key={btn.mult}
              onClick={() => handleApplyMultiplier(btn.mult)}
              className={`px-3 py-1.5 rounded-xl border-2 border-black font-black text-xs transition-all cursor-pointer ${
                multiplier === btn.mult
                  ? `${btn.bg} shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5 ring-2 ring-black`
                  : 'bg-white hover:bg-slate-100'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* THE INTERACTIVE PLACE VALUE BOARD GRID */}
      <div className="bg-slate-100 border-3 border-black rounded-2xl p-4 sm:p-6 space-y-4">
        {/* Column Headers */}
        <div className="grid grid-cols-6 gap-1.5 sm:gap-3 text-center">
          {PLACE_COLUMNS.map(col => (
            <div
              key={col.key}
              className={`p-2 sm:p-3 rounded-xl border-2 border-black ${col.color} text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}
            >
              <div className="text-[10px] sm:text-xs font-black uppercase tracking-tight truncate">
                {col.label}
              </div>
              <div className="text-[11px] sm:text-xs font-mono font-bold mt-0.5 opacity-90 hidden sm:block">
                {col.val.toLocaleString('id-ID')}
              </div>
            </div>
          ))}
        </div>

        {/* The Animated Digit Slots */}
        <div className="grid grid-cols-6 gap-1.5 sm:gap-3">
          {currentDigits.map((char, idx) => {
            const isFilled = char !== ' ';
            const isNewlyAddedZero = isFilled && char === '0' && originalDigits[idx] === ' ' && multiplier > 1;

            return (
              <AnimatePresence mode="wait" key={`slot-${idx}-${char}`}>
                <motion.div
                  initial={{ scale: 0.8, y: -8, opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  transition={{ duration: 0.25, delay: idx * 0.03 }}
                  className={`h-16 sm:h-20 rounded-2xl border-3 border-black flex items-center justify-center font-heading text-2xl sm:text-4xl font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-colors ${
                    isNewlyAddedZero
                      ? 'bg-yellow-300 text-black animate-pulse ring-2 ring-yellow-500'
                      : isFilled
                      ? 'bg-white text-blue-950'
                      : 'bg-slate-200/60 border-dashed border-slate-400 text-slate-300'
                  }`}
                >
                  {isFilled ? char : '·'}
                </motion.div>
              </AnimatePresence>
            );
          })}
        </div>

        {/* Live Equation Breakdown Summary */}
        <div className="mt-4 bg-white border-2 border-black rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 bg-blue-100 border-2 border-black rounded-lg font-black text-base sm:text-lg">
              {inputNum.toLocaleString('id-ID')}
            </span>
            <span className="font-black text-xl text-slate-600">×</span>
            <span className="px-3 py-1 bg-yellow-200 border-2 border-black rounded-lg font-black text-base sm:text-lg">
              {multiplier.toLocaleString('id-ID')}
            </span>
            <span className="font-black text-xl text-slate-600">=</span>
            <span className="px-4 py-1.5 bg-emerald-300 border-2 border-black rounded-xl font-black text-xl sm:text-2xl text-emerald-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              {currentResult.toLocaleString('id-ID')}
            </span>
          </div>

          <div className="text-right text-xs font-bold text-slate-700">
            {multiplier === 1 && 'Posisi nilai tempat bilangan asli.'}
            {multiplier === 10 && '➡️ Setiap digit bergeser 1 tempat ke kiri (+1 nol).'}
            {multiplier === 100 && '➡️ Setiap digit bergeser 2 tempat ke kiri (+2 nol).'}
            {multiplier === 1000 && '➡️ Setiap digit bergeser 3 tempat ke kiri (+3 nol).'}
          </div>
        </div>
      </div>

      {/* Deep Learning Concept Card */}
      <div className="bg-amber-50 border-2 border-black rounded-2xl p-4 sm:p-5 space-y-2">
        <div className="flex items-center gap-2 text-amber-950 font-black text-sm sm:text-base font-heading">
          <Sparkles className="w-5 h-5 text-amber-600" />
          <span>Mengapa Angka 0 Bertambah?</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
          Dalam sistem bilangan desimal, nilai tempat kelipatan 10 (satuan ➔ puluhan ➔ ratusan ➔ ribuan ➔ puluh ribuan).
          Saat kamu mengalikan dengan <strong>10</strong>, nilai setiap digit menjadi <strong>10 kali lebih besar</strong> sehingga posisinya pindah satu langkah ke kiri dan tempat satuan diisi angka <strong>0</strong> sebagai penanda nilai tempat baru!
        </p>
      </div>
    </div>
  );
};
