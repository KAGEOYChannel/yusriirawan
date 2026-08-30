import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Layers,
  Sparkles,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  HelpCircle,
  Check,
} from 'lucide-react';
import { SoundEffects } from '../../utils/sound';
import { triggerConfetti } from '../../utils/confetti';

interface BersusunProps {
  onRewardScore?: (stars?: number) => void;
}

interface BersusunProblem {
  top: number;
  bottom: number;
  steps: {
    unitMulti: string;
    unitCarry: number;
    unitDigit: number;
    tenMulti: string;
    tenCarry: number;
    tenDigit: number;
    hundredMulti?: string;
    hundredCarry?: number;
    hundredDigit?: number;
  };
  finalAnswer: number;
}

const PROBLEMS: BersusunProblem[] = [
  {
    top: 247,
    bottom: 6,
    steps: {
      unitMulti: '7 × 6 = 42',
      unitCarry: 4,
      unitDigit: 2,
      tenMulti: '(4 × 6) + 4 = 28',
      tenCarry: 2,
      tenDigit: 8,
      hundredMulti: '(2 × 6) + 2 = 14',
      hundredCarry: 1,
      hundredDigit: 14,
    },
    finalAnswer: 1482,
  },
  {
    top: 385,
    bottom: 4,
    steps: {
      unitMulti: '5 × 4 = 20',
      unitCarry: 2,
      unitDigit: 0,
      tenMulti: '(8 × 4) + 2 = 34',
      tenCarry: 3,
      tenDigit: 4,
      hundredMulti: '(3 × 4) + 3 = 15',
      hundredCarry: 1,
      hundredDigit: 15,
    },
    finalAnswer: 1540,
  },
];

export const PerkalianModernBersusun: React.FC<BersusunProps> = ({
  onRewardScore,
}) => {
  const [problemIdx, setProblemIdx] = useState<number>(0);
  const [activeStep, setActiveStep] = useState<number>(1); // 1: Satuan, 2: Puluhan, 3: Ratusan, 4: Selesai

  const [inputUnitCarry, setInputUnitCarry] = useState<string>('');
  const [inputUnitDigit, setInputUnitDigit] = useState<string>('');

  const [inputTenCarry, setInputTenCarry] = useState<string>('');
  const [inputTenDigit, setInputTenDigit] = useState<string>('');

  const [inputHundredDigit, setInputHundredDigit] = useState<string>('');
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const cur = PROBLEMS[problemIdx];

  const handleVerifyStep1 = () => {
    const carry = Number(inputUnitCarry);
    const digit = Number(inputUnitDigit);

    if (carry === cur.steps.unitCarry && digit === cur.steps.unitDigit) {
      SoundEffects.playCorrect();
      setActiveStep(2);
    } else {
      SoundEffects.playWrong();
    }
  };

  const handleVerifyStep2 = () => {
    const carry = Number(inputTenCarry);
    const digit = Number(inputTenDigit);

    if (carry === cur.steps.tenCarry && digit === cur.steps.tenDigit) {
      SoundEffects.playCorrect();
      setActiveStep(3);
    } else {
      SoundEffects.playWrong();
    }
  };

  const handleVerifyStep3 = () => {
    const digit = Number(inputHundredDigit);

    if (digit === cur.steps.hundredDigit) {
      SoundEffects.playCorrect();
      triggerConfetti();
      setIsCompleted(true);
      setActiveStep(4);
      onRewardScore?.(2);
    } else {
      SoundEffects.playWrong();
    }
  };

  const handleNextProblem = () => {
    SoundEffects.playClick();
    if (problemIdx < PROBLEMS.length - 1) {
      setProblemIdx(prev => prev + 1);
    } else {
      setProblemIdx(0);
    }
    setActiveStep(1);
    setInputUnitCarry('');
    setInputUnitDigit('');
    setInputTenCarry('');
    setInputTenDigit('');
    setInputHundredDigit('');
    setIsCompleted(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/90 backdrop-blur-xl border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-xl shadow-indigo-950/40 space-y-6">
        <div className="flex items-center justify-between border-b border-indigo-500/20 pb-4">
          <div>
            <span className="text-xs font-black uppercase text-indigo-400">
              Lab Interaktif Perkalian Bersusun Pendek
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white font-heading">
              Isi Digit & Simpanan Langkah Demi Langkah
            </h3>
          </div>
          <div className="text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-xl border border-indigo-500/30">
            Soal #{problemIdx + 1}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Vertical Math Board */}
          <div className="lg:col-span-6 bg-slate-950 border border-indigo-500/40 rounded-2xl p-6 flex flex-col items-center justify-center font-mono">
            <div className="text-xs font-mono text-pink-400 mb-2 flex items-center gap-3">
              <span>Simpanan:</span>
              <div className="flex gap-4">
                <span className="w-8 h-8 rounded-lg bg-pink-500/20 border border-pink-500/40 flex items-center justify-center font-bold text-pink-300">
                  {inputTenCarry || (activeStep > 2 ? cur.steps.tenCarry : '?')}
                </span>
                <span className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-bold text-amber-300">
                  {inputUnitCarry || (activeStep > 1 ? cur.steps.unitCarry : '?')}
                </span>
              </div>
            </div>

            {/* Top Number */}
            <div className="text-4xl sm:text-5xl font-black text-white tracking-widest my-1">
              {cur.top}
            </div>

            {/* Bottom Multiplier */}
            <div className="flex items-center justify-end w-48 text-4xl sm:text-5xl font-black text-sky-400 tracking-widest my-1">
              <span className="text-2xl text-slate-500 mr-6">×</span>
              <span>{cur.bottom}</span>
            </div>

            {/* Divider Line */}
            <div className="w-48 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 my-3 rounded-full" />

            {/* Result Line */}
            <div className="flex items-center gap-2 text-3xl sm:text-4xl font-black text-emerald-400 tracking-widest">
              <span>
                {activeStep >= 4 ? cur.steps.hundredDigit : inputHundredDigit || '?'}
              </span>
              <span>
                {activeStep >= 3 ? cur.steps.tenDigit : inputTenDigit || '?'}
              </span>
              <span>
                {activeStep >= 2 ? cur.steps.unitDigit : inputUnitDigit || '?'}
              </span>
            </div>
          </div>

          {/* Interactive Input Form for Current Step */}
          <div className="lg:col-span-6 bg-slate-800/60 border border-indigo-500/20 rounded-2xl p-6 flex flex-col justify-between space-y-4">
            {activeStep === 1 && (
              <div className="space-y-4">
                <span className="text-xs font-black uppercase text-amber-300 bg-amber-500/20 px-2.5 py-1 rounded-md border border-amber-500/30">
                  Langkah 1: Kalikan Satuan
                </span>
                <div className="text-sm text-slate-300">
                  Hitung: <strong>{cur.top % 10} × {cur.bottom}</strong> = ?
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1">
                      Simpan di atas puluhan:
                    </label>
                    <input
                      type="number"
                      placeholder="Simpanan"
                      value={inputUnitCarry}
                      onChange={e => setInputUnitCarry(e.target.value)}
                      className="w-full p-3 bg-slate-900 border border-pink-500/50 rounded-xl text-center font-mono font-black text-xl text-pink-300"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1">
                      Digit satuan hasil:
                    </label>
                    <input
                      type="number"
                      placeholder="Digit"
                      value={inputUnitDigit}
                      onChange={e => setInputUnitDigit(e.target.value)}
                      className="w-full p-3 bg-slate-900 border border-emerald-500/50 rounded-xl text-center font-mono font-black text-xl text-emerald-300"
                    />
                  </div>
                </div>

                <button
                  onClick={handleVerifyStep1}
                  className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg cursor-pointer"
                >
                  Cek Langkah 1
                </button>
              </div>
            )}

            {activeStep === 2 && (
              <div className="space-y-4">
                <span className="text-xs font-black uppercase text-sky-300 bg-sky-500/20 px-2.5 py-1 rounded-md border border-sky-500/30">
                  Langkah 2: Kalikan Puluhan (+ Simpanan)
                </span>
                <div className="text-sm text-slate-300">
                  Hitung: <strong>(Puluhan × {cur.bottom}) + {cur.steps.unitCarry}</strong> = ?
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1">
                      Simpan di ratusan:
                    </label>
                    <input
                      type="number"
                      placeholder="Simpanan"
                      value={inputTenCarry}
                      onChange={e => setInputTenCarry(e.target.value)}
                      className="w-full p-3 bg-slate-900 border border-pink-500/50 rounded-xl text-center font-mono font-black text-xl text-pink-300"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1">
                      Digit puluhan hasil:
                    </label>
                    <input
                      type="number"
                      placeholder="Digit"
                      value={inputTenDigit}
                      onChange={e => setInputTenDigit(e.target.value)}
                      className="w-full p-3 bg-slate-900 border border-emerald-500/50 rounded-xl text-center font-mono font-black text-xl text-emerald-300"
                    />
                  </div>
                </div>

                <button
                  onClick={handleVerifyStep2}
                  className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg cursor-pointer"
                >
                  Cek Langkah 2
                </button>
              </div>
            )}

            {activeStep === 3 && (
              <div className="space-y-4">
                <span className="text-xs font-black uppercase text-pink-300 bg-pink-500/20 px-2.5 py-1 rounded-md border border-pink-500/30">
                  Langkah 3: Kalikan Ratusan (+ Simpanan)
                </span>
                <div className="text-sm text-slate-300">
                  Hitung: <strong>(Ratusan × {cur.bottom}) + {cur.steps.tenCarry}</strong> = ?
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">
                    Tulis semua digit ratusan & ribuan:
                  </label>
                  <input
                    type="number"
                    placeholder="Hasil ratusan"
                    value={inputHundredDigit}
                    onChange={e => setInputHundredDigit(e.target.value)}
                    className="w-full p-3 bg-slate-900 border border-emerald-500/50 rounded-xl text-center font-mono font-black text-xl text-emerald-300"
                  />
                </div>

                <button
                  onClick={handleVerifyStep3}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg cursor-pointer"
                >
                  Selesaikan Soal!
                </button>
              </div>
            )}

            {activeStep === 4 && (
              <div className="space-y-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center text-3xl mx-auto">
                  ✓
                </div>
                <h4 className="text-lg font-black text-white">Luar Biasa! Jawaban Tepat: {cur.finalAnswer}</h4>
                <button
                  onClick={handleNextProblem}
                  className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Coba Soal Bersusun Lainnya</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
