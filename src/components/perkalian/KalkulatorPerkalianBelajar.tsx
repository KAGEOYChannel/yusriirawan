import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calculator, Play, SkipForward, RotateCcw, CheckCircle, Sparkles, ChevronRight, Layers } from 'lucide-react';
import { SoundEffects } from '../../utils/sound';

interface StepDetail {
  stepIndex: number;
  title: string;
  multiplicandDigit: number;
  placeLabel: string;
  multiplierDigit: number;
  rawProduct: number;
  carryIn: number;
  totalStepVal: number;
  digitToWrite: number;
  carryOut: number;
  explanation: string;
}

export const KalkulatorPerkalianBelajar: React.FC = () => {
  const [numA, setNumA] = useState<number>(177);
  const [numB, setNumB] = useState<number>(8);
  const [inputA, setInputA] = useState<string>('177');
  const [inputB, setInputB] = useState<string>('8');
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Generate steps for standard 1-digit or simple 2-digit multiplier
  const computeSteps = (a: number, b: number): StepDetail[] => {
    const steps: StepDetail[] = [];
    const digitsA = a.toString().split('').map(Number).reverse();
    const placeNames = ['Satuan', 'Puluhan', 'Ratusan', 'Ribuan', 'Puluh Ribuan', 'Ratus Ribuan'];

    let currentCarry = 0;

    for (let i = 0; i < digitsA.length; i++) {
      const d = digitsA[i];
      const raw = d * b;
      const total = raw + currentCarry;
      const isLastDigit = i === digitsA.length - 1;
      const write = isLastDigit ? total : total % 10;
      const carryNext = isLastDigit ? 0 : Math.floor(total / 10);

      steps.push({
        stepIndex: i + 1,
        title: `Langkah ${i + 1}: Kalikan ${placeNames[i]}`,
        multiplicandDigit: d,
        placeLabel: placeNames[i],
        multiplierDigit: b,
        rawProduct: raw,
        carryIn: currentCarry,
        totalStepVal: total,
        digitToWrite: write,
        carryOut: carryNext,
        explanation:
          currentCarry > 0
            ? `${d} × ${b} = ${raw}. Ditambah simpanan ${currentCarry} menjadi ${total}. ${
                isLastDigit
                  ? `Karena ini digit terakhir, langsung tulis ${total}.`
                  : `Tulis ${total % 10} pada ${placeNames[i]}, lalu simpan ${carryNext} ke ${placeNames[i + 1]}.`
              }`
            : `${d} × ${b} = ${raw}. ${
                isLastDigit
                  ? `Langsung tulis ${total}.`
                  : `Tulis ${total % 10} pada ${placeNames[i]}${carryNext > 0 ? `, simpan ${carryNext} ke ${placeNames[i + 1]}` : ''}.`
              }`,
      });

      currentCarry = carryNext;
    }

    return steps;
  };

  const steps = computeSteps(numA, numB);
  const finalProduct = numA * numB;

  // Autoplay effect
  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStep(prev => {
          if (prev < steps.length) {
            SoundEffects.playClick();
            return prev + 1;
          } else {
            setIsPlaying(false);
            SoundEffects.playCorrect();
            return prev;
          }
        });
      }, 1500);
    }
    return () => clearInterval(timer);
  }, [isPlaying, steps.length]);

  const handleApplyNumbers = (e: React.FormEvent) => {
    e.preventDefault();
    const valA = parseInt(inputA, 10);
    const valB = parseInt(inputB, 10);
    if (!isNaN(valA) && !isNaN(valB) && valA > 0 && valB > 0 && valA <= 99999 && valB <= 9) {
      SoundEffects.playClick();
      setNumA(valA);
      setNumB(valB);
      setCurrentStep(0);
      setIsPlaying(false);
    } else {
      SoundEffects.playWrong();
      alert('Masukkan bilangan pertama (1 - 99.999) dan pengali 1 angka (1 - 9).');
    }
  };

  return (
    <div className="bg-white border-4 border-black rounded-3xl p-5 sm:p-7 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-3 border-black pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-200 border-2 border-black rounded-full text-xs font-black uppercase tracking-wider">
            <Calculator className="w-4 h-4 text-yellow-700" />
            <span>Kalkulator Belajar Cerdas</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-heading mt-1">
            Simulasi Visual Proses Perkalian Langkah Demi Langkah
          </h3>
          <p className="text-xs sm:text-sm font-semibold text-slate-600">
            Bukan hanya memberikan hasil akhir, kalkulator ini membedah setiap langkah simpanan dan nilai tempatnya.
          </p>
        </div>

        {/* Preset quick buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { a: 177, b: 8 },
            { a: 325, b: 6 },
            { a: 428, b: 7 },
            { a: 1250, b: 4 },
          ].map(p => (
            <button
              key={`${p.a}-${p.b}`}
              onClick={() => {
                SoundEffects.playClick();
                setNumA(p.a);
                setNumB(p.b);
                setInputA(p.a.toString());
                setInputB(p.b.toString());
                setCurrentStep(0);
                setIsPlaying(false);
              }}
              className="px-2.5 py-1 bg-slate-100 hover:bg-yellow-200 border-2 border-black rounded-xl text-xs font-black transition-all cursor-pointer"
            >
              {p.a} × {p.b}
            </button>
          ))}
        </div>
      </div>

      {/* Input controls */}
      <form onSubmit={handleApplyNumbers} className="flex flex-wrap items-end gap-3 bg-yellow-50 border-2 border-black rounded-2xl p-4">
        <div>
          <label className="block text-xs font-black uppercase text-slate-700 mb-1">Bilangan (A):</label>
          <input
            type="number"
            min="1"
            max="99999"
            value={inputA}
            onChange={e => setInputA(e.target.value)}
            className="w-32 px-3 py-2 bg-white border-2 border-black rounded-xl font-black text-lg text-center"
          />
        </div>
        <div className="font-black text-2xl pb-2">×</div>
        <div>
          <label className="block text-xs font-black uppercase text-slate-700 mb-1">Pengali (1 Digit):</label>
          <input
            type="number"
            min="1"
            max="9"
            value={inputB}
            onChange={e => setInputB(e.target.value)}
            className="w-20 px-3 py-2 bg-white border-2 border-black rounded-xl font-black text-lg text-center"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2.5 bg-yellow-300 hover:bg-yellow-400 border-2 border-black rounded-xl text-xs font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer font-heading"
        >
          Hitung & Simulasikan
        </button>
      </form>

      {/* Player Controller Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-100 border-2 border-black rounded-2xl p-3.5">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              SoundEffects.playClick();
              setCurrentStep(0);
              setIsPlaying(false);
            }}
            className="p-2 bg-white hover:bg-slate-200 border-2 border-black rounded-xl cursor-pointer"
            title="Reset ke Langkah Awal"
          >
            <RotateCcw className="w-4 h-4 text-slate-800" />
          </button>
          <button
            onClick={() => {
              SoundEffects.playClick();
              setIsPlaying(!isPlaying);
            }}
            className={`px-3 py-2 border-2 border-black rounded-xl font-black text-xs flex items-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer ${
              isPlaying ? 'bg-rose-300 text-rose-950' : 'bg-green-300 text-green-950'
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{isPlaying ? 'Jeda' : 'Putar Otomatis'}</span>
          </button>
          <button
            disabled={currentStep >= steps.length}
            onClick={() => {
              SoundEffects.playClick();
              setCurrentStep(prev => Math.min(steps.length, prev + 1));
            }}
            className="px-3 py-2 bg-yellow-300 hover:bg-yellow-400 disabled:opacity-50 border-2 border-black rounded-xl font-black text-xs flex items-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
          >
            <span>Langkah Berikutnya</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="font-black text-xs text-slate-700">
          Proses Langkah: <span className="text-blue-700 font-heading text-sm">{currentStep} / {steps.length}</span>
        </div>
      </div>

      {/* Steps Visual Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Left: Vertical Multiplication Graphic Board */}
        <div className="md:col-span-5 bg-blue-50 border-3 border-black rounded-2xl p-5 flex flex-col items-center justify-center space-y-4">
          <div className="text-center font-heading">
            <div className="text-xs font-black uppercase text-blue-900 mb-2">Bentuk Bersusun</div>
            <div className="font-mono text-3xl sm:text-4xl font-black tracking-widest text-slate-900">
              <div className="pr-4">{numA.toLocaleString('id-ID')}</div>
              <div className="flex items-center justify-end gap-3">
                <span className="text-2xl text-slate-500 font-bold">×</span>
                <span className="pr-4">{numB}</span>
              </div>
              <div className="w-full h-1 bg-black my-1" />
              <div className="text-emerald-700 pr-4 font-black">
                {currentStep === steps.length ? finalProduct.toLocaleString('id-ID') : '...'}
              </div>
            </div>
          </div>

          {currentStep === steps.length && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-emerald-300 border-2 border-black rounded-xl p-3 text-center w-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              <div className="text-xs font-black uppercase text-emerald-950">Hasil Akhir Selesai:</div>
              <div className="text-2xl font-black text-emerald-950 font-heading">
                {numA.toLocaleString('id-ID')} × {numB} = {finalProduct.toLocaleString('id-ID')}
              </div>
            </motion.div>
          )}
        </div>

        {/* Right: Step Explanations Cards */}
        <div className="md:col-span-7 space-y-3">
          {steps.map((st, idx) => {
            const isRevealed = currentStep >= st.stepIndex;
            const isCurrent = currentStep === st.stepIndex;

            return (
              <motion.div
                key={st.stepIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: isRevealed ? 1 : 0.4, y: 0 }}
                className={`border-2 border-black rounded-2xl p-4 transition-all ${
                  isCurrent
                    ? 'bg-yellow-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ring-2 ring-yellow-500'
                    : isRevealed
                    ? 'bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                    : 'bg-slate-50 border-dashed opacity-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="font-black text-sm text-slate-900 font-heading flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center font-mono">
                      {st.stepIndex}
                    </span>
                    <span>{st.title}</span>
                  </div>
                  {isRevealed && (
                    <span className="text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-400 px-2 py-0.5 rounded-full">
                      ✓ Selesai
                    </span>
                  )}
                </div>

                {isRevealed ? (
                  <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed mt-1">
                    {st.explanation}
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 italic">Langkah ini akan terbuka...</p>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
