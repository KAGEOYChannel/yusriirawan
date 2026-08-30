import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
  Calculator,
  Layers,
  Zap,
  RotateCcw,
  Check,
} from 'lucide-react';
import { SoundEffects } from '../../utils/sound';
import { triggerConfetti } from '../../utils/confetti';

interface BelajarProps {
  onRewardScore?: (stars?: number) => void;
}

export const PerkalianModernBelajar: React.FC<BelajarProps> = ({
  onRewardScore,
}) => {
  const [activeLevel, setActiveLevel] = useState<number>(1);
  const [completedLevels, setCompletedLevels] = useState<number[]>([1]);

  // Interactive Array Matrix Simulator for Level 1
  const [gridRows, setGridRows] = useState<number>(4);
  const [gridCols, setGridCols] = useState<number>(6);

  // Interactive Carrying Simulator for Level 2
  const [stepCarry, setStepCarry] = useState<number>(0);

  // Place Value Shifter for Level 3 & 4
  const [baseVal, setBaseVal] = useState<number>(24);
  const [multiplierPower, setMultiplierPower] = useState<number>(10);

  // Step-by-Step Custom Calculator Simulator
  const [calcA, setCalcA] = useState<number>(348);
  const [calcB, setCalcB] = useState<number>(7);
  const [activeCalcStep, setActiveCalcStep] = useState<number>(0);

  const levels = [
    {
      lvl: 1,
      title: 'Level 1: Konsep Dasar & Penjumlahan Berulang',
      subtitle: 'Memahami arti perkalian sebagai gabungan kelompok sama besar',
      icon: '🌱',
      tag: 'Dasar',
    },
    {
      lvl: 2,
      title: 'Level 2: Bersusun Panjang & Pendek',
      subtitle: 'Teknik perkalian menurun dengan sistem menyimpan nilai tempat',
      icon: '📝',
      tag: 'Penting',
    },
    {
      lvl: 3,
      title: 'Level 3: Perkalian Puluhan (Kelipatan 10)',
      subtitle: 'Trik cepat: Kalikan angka depan, tambahkan 1 angka nol',
      icon: '⚡',
      tag: 'Trik Cepat',
    },
    {
      lvl: 4,
      title: 'Level 4: Perkalian Ratusan (Kelipatan 100)',
      subtitle: 'Trik cepat: Kalikan bilangan pokok, geser 2 tempat ke ratusan',
      icon: '🚀',
      tag: 'Trik Cepat',
    },
    {
      lvl: 5,
      title: 'Level 5: Bilangan Besar Ribuan s.d. 100.000',
      subtitle: 'Menghitung perkalian ribuan dengan ketelitian dan presisi',
      icon: '👑',
      tag: 'Master',
    },
  ];

  const handleLevelComplete = (lvl: number) => {
    SoundEffects.playCorrect();
    triggerConfetti();
    if (!completedLevels.includes(lvl)) {
      setCompletedLevels(prev => [...prev, lvl]);
    }
    onRewardScore?.(1);

    if (lvl < 5) {
      setActiveLevel(lvl + 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* 5-Level Stepper Progress Bar */}
      <div className="bg-slate-900/90 backdrop-blur-xl border border-indigo-500/30 rounded-3xl p-4 sm:p-6 shadow-xl shadow-indigo-950/40">
        <div className="text-xs font-black uppercase text-indigo-400 tracking-wider mb-3">
          Jalur Pembelajaran Terstruktur (5 Tahapan)
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {levels.map(l => {
            const isActive = activeLevel === l.lvl;
            const isDone = completedLevels.includes(l.lvl);
            return (
              <button
                key={l.lvl}
                onClick={() => {
                  SoundEffects.playClick();
                  setActiveLevel(l.lvl);
                }}
                className={`p-3 rounded-2xl border transition-all cursor-pointer text-left flex flex-col justify-between ${
                  isActive
                    ? 'bg-gradient-to-br from-indigo-600 to-purple-700 border-indigo-400 text-white shadow-lg shadow-indigo-600/30 scale-[1.02]'
                    : isDone
                    ? 'bg-slate-800/80 border-emerald-500/40 text-slate-200 hover:bg-slate-800'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl">{l.icon}</span>
                  {isDone ? (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded-md border border-emerald-500/30">
                      ✓ Selesai
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded-md">
                      Level {l.lvl}
                    </span>
                  )}
                </div>

                <div className="mt-2">
                  <div className="font-bold text-xs sm:text-sm text-white line-clamp-1">
                    {l.title.split(':')[1] || l.title}
                  </div>
                  <div className="text-[10px] text-slate-300 line-clamp-1 mt-0.5">{l.tag}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Stage Container */}
      <div className="bg-slate-900/90 backdrop-blur-xl border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-xl shadow-indigo-950/40 space-y-6">
        {/* Header of Active Level */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-500/20 pb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl p-2.5 bg-indigo-500/20 border border-indigo-400/40 rounded-2xl">
              {levels[activeLevel - 1].icon}
            </span>
            <div>
              <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">
                Materi {activeLevel} dari 5
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white font-heading">
                {levels[activeLevel - 1].title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                {levels[activeLevel - 1].subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Level 1 Content: Penjumlahan Berulang & Array Visualizer */}
        {activeLevel === 1 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Concept Box */}
              <div className="lg:col-span-6 bg-slate-800/60 border border-indigo-500/20 rounded-2xl p-5 space-y-4">
                <div className="text-xs font-black uppercase text-indigo-300">
                  💡 Konsep Dasar Penjumlahan Berulang
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Perkalian adalah <strong>penjumlahan berulang</strong> dari bilangan yang sama.
                </p>

                <div className="bg-slate-900/90 border border-indigo-500/30 rounded-xl p-4 text-center space-y-2">
                  <div className="text-2xl sm:text-3xl font-black text-amber-300 font-heading">
                    {gridRows} × {gridCols} = {gridRows * gridCols}
                  </div>
                  <div className="text-xs font-mono text-indigo-200">
                    Artinya: Ada {gridRows} kelompok, masing-masing berisi {gridCols} buah.
                  </div>
                  <div className="text-xs font-semibold text-slate-300 bg-slate-800/80 p-2 rounded-lg">
                    {Array.from({ length: gridRows }).map((_, i) => (
                      <span key={i}>
                        {gridCols} {i < gridRows - 1 ? '+ ' : ''}
                      </span>
                    ))}
                    {' = '}{gridRows * gridCols}
                  </div>
                </div>

                {/* Slider Adjuster */}
                <div className="space-y-3 pt-2">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                      <span>Jumlah Baris / Kelompok:</span>
                      <span className="text-indigo-400 font-mono font-black">{gridRows} Baris</span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="8"
                      value={gridRows}
                      onChange={e => setGridRows(Number(e.target.value))}
                      className="w-full accent-indigo-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                      <span>Isi Tiap Baris (Kolom):</span>
                      <span className="text-pink-400 font-mono font-black">{gridCols} Kolom</span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="10"
                      value={gridCols}
                      onChange={e => setGridCols(Number(e.target.value))}
                      className="w-full accent-pink-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Array Matrix Visualizer */}
              <div className="lg:col-span-6 bg-slate-800/60 border border-indigo-500/20 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-pink-300">
                    Visualisasi Array Dot ({gridRows} × {gridCols})
                  </span>
                  <span className="text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-md border border-indigo-500/30">
                    Total: {gridRows * gridCols} Bintang
                  </span>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex items-center justify-center min-h-[200px] overflow-auto">
                  <div className="space-y-2">
                    {Array.from({ length: gridRows }).map((_, rIdx) => (
                      <div key={rIdx} className="flex items-center gap-2 justify-center">
                        <span className="text-[10px] font-mono text-slate-500 w-4 text-right">
                          {rIdx + 1}
                        </span>
                        {Array.from({ length: gridCols }).map((_, cIdx) => (
                          <motion.div
                            key={cIdx}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: (rIdx * gridCols + cIdx) * 0.01 }}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-tr from-amber-400 to-yellow-300 border border-amber-500/50 flex items-center justify-center text-sm shadow-sm"
                          >
                            ⭐
                          </motion.div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleLevelComplete(1)}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-500/20 cursor-pointer font-heading flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Paham Konsep ➔ Lanjut Level 2</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Level 2 Content: Perkalian Bersusun & Animasi Simpanan */}
        {activeLevel === 2 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Vertical Method Step by Step */}
              <div className="lg:col-span-7 bg-slate-800/60 border border-indigo-500/20 rounded-2xl p-5 space-y-4">
                <div className="text-xs font-black uppercase text-indigo-300">
                  Langkah Perkalian Bersusun Pendek (Contoh: 147 × 6)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      step: 1,
                      title: '1. Kalikan Satuan',
                      calc: '7 × 6 = 42',
                      desc: 'Tulis digit 2 di satuan, lalu simpan 4 di atas puluhan.',
                    },
                    {
                      step: 2,
                      title: '2. Kalikan Puluhan',
                      calc: '(4 × 6) + 4 = 28',
                      desc: '24 + simpanan 4 = 28. Tulis 8 di puluhan, simpan 2 di atas ratusan.',
                    },
                    {
                      step: 3,
                      title: '3. Kalikan Ratusan',
                      calc: '(1 × 6) + 2 = 8',
                      desc: '6 + simpanan 2 = 8. Langsung tulis 8 di ratusan. Hasil akhir: 882.',
                    },
                  ].map(st => (
                    <div
                      key={st.step}
                      className="bg-slate-900/90 border border-indigo-500/30 rounded-xl p-3.5 space-y-1.5"
                    >
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-md">
                        {st.title}
                      </span>
                      <div className="text-sm font-black text-amber-300 font-mono">{st.calc}</div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">{st.desc}</p>
                    </div>
                  ))}
                </div>

                {/* Compare: Bersusun Pendek vs Panjang */}
                <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-4 space-y-2">
                  <div className="text-xs font-bold text-amber-300">
                    ⚖️ Perbedaan Bersusun Panjang vs Bersusun Pendek:
                  </div>
                  <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                    <li>
                      <strong>Bersusun Panjang</strong>: Menguraikan semua hasil (7×6=42, 40×6=240, 100×6=600), lalu menjumlahkannya ke bawah (42 + 240 + 600 = 882).
                    </li>
                    <li>
                      <strong>Bersusun Pendek</strong>: Langsung mengalikan dan menyimpan digit puluhan di atasnya sehingga lebih ringkas dan cepat!
                    </li>
                  </ul>
                </div>
              </div>

              {/* Graphic Simulator */}
              <div className="lg:col-span-5 bg-slate-800/60 border border-indigo-500/20 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                <div className="text-xs font-black uppercase text-pink-300 text-center">
                  Bentuk Bersusun Standar
                </div>

                <div className="bg-slate-950 border border-indigo-500/40 rounded-2xl p-6 flex flex-col items-center justify-center font-mono text-3xl font-black text-slate-100">
                  <div className="text-xs font-mono text-pink-400 mb-1">Simpanan: 2 4</div>
                  <div className="tracking-widest pr-4">1 4 7</div>
                  <div className="flex items-center justify-end w-full tracking-widest text-sky-400 pr-4">
                    <span className="text-xl text-slate-500 mr-4">×</span>
                    <span>6</span>
                  </div>
                  <div className="w-40 h-1 bg-indigo-500 my-2 rounded-full" />
                  <div className="tracking-widest text-emerald-400 pr-4">8 8 2</div>
                </div>

                <button
                  onClick={() => handleLevelComplete(2)}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-500/20 cursor-pointer font-heading flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Paham Bersusun ➔ Lanjut Level 3</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Level 3 Content: Perkalian Puluhan & Papan Nilai Tempat */}
        {activeLevel === 3 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 bg-slate-800/60 border border-indigo-500/20 rounded-2xl p-5 space-y-4">
                <div className="text-xs font-black uppercase text-indigo-300">
                  ⚡ Keajaiban Perkalian Kelipatan 10 (Geser Nilai Tempat)
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Jika suatu bilangan dikalikan dengan <strong>10, 20, 30, ... 90</strong>, setiap digit nilainya akan <strong>bergeser satu tingkat ke kiri</strong> (satuan menjadi puluhan, puluhan menjadi ratusan, dst) dan diakhiri dengan angka <strong>0</strong>.
                </p>

                {/* Interactive Multiplier Shifter */}
                <div className="bg-slate-900/90 border border-indigo-500/30 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                    <span>Pilih Bilangan Pokok:</span>
                    <span className="text-amber-300 font-mono font-black text-base">{baseVal}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[15, 24, 38, 75, 125].map(v => (
                      <button
                        key={v}
                        onClick={() => setBaseVal(v)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all ${
                          baseVal === v
                            ? 'bg-indigo-600 text-white ring-2 ring-indigo-400'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>

                  <div className="text-center py-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xl sm:text-2xl font-black text-white">
                    {baseVal} × 10 = <span className="text-emerald-400">{baseVal * 10}</span>
                  </div>
                  <div className="text-[11px] text-center text-slate-400">
                    💡 Cara Kilat: Cukup tulis <strong>{baseVal}</strong> lalu beri tambahan satu angka <strong>0</strong> di belakangnya!
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 bg-slate-800/60 border border-indigo-500/20 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                <div className="text-xs font-black uppercase text-pink-300">
                  Tabel Contoh Cepat:
                </div>

                <div className="space-y-2 font-mono text-xs sm:text-sm">
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-700 flex justify-between">
                    <span>35 × 10</span>
                    <span className="text-emerald-400 font-bold">= 350</span>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-700 flex justify-between">
                    <span>42 × 30 (42 × 3 × 10)</span>
                    <span className="text-emerald-400 font-bold">= 1.260</span>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-700 flex justify-between">
                    <span>120 × 50 (12 × 5 × 100)</span>
                    <span className="text-emerald-400 font-bold">= 6.000</span>
                  </div>
                </div>

                <button
                  onClick={() => handleLevelComplete(3)}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-500/20 cursor-pointer font-heading flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Paham Kelipatan 10 ➔ Lanjut Level 4</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Level 4 Content: Perkalian Ratusan */}
        {activeLevel === 4 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 bg-slate-800/60 border border-indigo-500/20 rounded-2xl p-5 space-y-4">
                <div className="text-xs font-black uppercase text-indigo-300">
                  🚀 Aturan Perkalian dengan Ratusan (Kelipatan 100)
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Ketika bilangan dikalikan dengan <strong>100, 200, 300, ... 900</strong>, nilainya bergeser <strong>dua tingkat ke kiri</strong>. Kamu cukup mengalikan angka bukan nol, lalu menambahkan <strong>dua angka nol (00)</strong> di bagian akhir.
                </p>

                <div className="bg-slate-900/90 border border-indigo-500/30 rounded-xl p-4 space-y-2">
                  <div className="text-center font-mono text-2xl font-black text-amber-300">
                    25 × 400 = (25 × 4) × 100
                  </div>
                  <div className="text-center font-mono text-xl font-black text-emerald-400">
                    = 100 × 100 = 10.000
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 bg-slate-800/60 border border-indigo-500/20 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                <div className="text-xs font-black uppercase text-pink-300">
                  Ringkasan Trik Ratusan:
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between font-mono">
                    <span>18 × 100</span>
                    <span className="text-sky-400 font-bold">= 1.800</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span>45 × 200</span>
                    <span className="text-sky-400 font-bold">= 9.000</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span>70 × 600</span>
                    <span className="text-sky-400 font-bold">= 42.000</span>
                  </div>
                </div>

                <button
                  onClick={() => handleLevelComplete(4)}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-500/20 cursor-pointer font-heading flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Paham Ratusan ➔ Lanjut Level 5</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Level 5 Content: Bilangan Besar Ribuan s.d. 100.000 */}
        {activeLevel === 5 && (
          <div className="space-y-6">
            <div className="bg-slate-800/60 border border-indigo-500/20 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs font-black uppercase text-indigo-300">
                  👑 Perkalian Bilangan Besar Ribuan Sampai 100.000
                </div>
                <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-md border border-amber-500/30">
                  Level Tertinggi
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Di kelas 5 SD, siswa diharapkan mampu mengalikan bilangan bernilai ribuan hingga puluhan ribu dengan batas hasil hingga <strong>100.000</strong>.
              </p>

              {/* Step-by-Step Simulator */}
              <div className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs font-bold text-slate-300">
                    Coba Simulator Perkalian Bebas:
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <input
                      type="number"
                      value={calcA}
                      onChange={e => setCalcA(Math.min(9999, Math.max(1, Number(e.target.value))))}
                      className="w-24 px-2 py-1 bg-slate-950 border border-indigo-500/40 rounded-lg text-center font-bold text-amber-300"
                    />
                    <span className="text-slate-400">×</span>
                    <input
                      type="number"
                      value={calcB}
                      onChange={e => setCalcB(Math.min(99, Math.max(1, Number(e.target.value))))}
                      className="w-16 px-2 py-1 bg-slate-950 border border-indigo-500/40 rounded-lg text-center font-bold text-pink-300"
                    />
                  </div>
                </div>

                <div className="text-center py-4 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-xs font-mono text-slate-400 mb-1">Hasil Perkalian:</div>
                  <div className="text-3xl sm:text-4xl font-black text-emerald-400 font-heading">
                    {(calcA * calcB).toLocaleString('id-ID')}
                  </div>
                </div>

                <button
                  onClick={() => handleLevelComplete(5)}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-pink-600 hover:from-amber-600 hover:to-pink-700 text-white font-black text-sm rounded-xl shadow-lg shadow-amber-500/20 cursor-pointer font-heading flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5 text-yellow-300" />
                  <span>Klaim Gelar Master Perkalian!</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
