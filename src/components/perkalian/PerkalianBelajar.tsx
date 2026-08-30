import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  RotateCcw,
  Layers,
  ArrowRight,
  Calculator,
  Compass,
  Lightbulb,
  Check,
} from 'lucide-react';
import { SoundEffects } from '../../utils/sound';
import { triggerConfetti } from '../../utils/confetti';
import { PapanNilaiTempat } from './PapanNilaiTempat';
import { KalkulatorPerkalianBelajar } from './KalkulatorPerkalianBelajar';

interface BelajarProps {
  onUnlockBadge?: (badgeId: string) => void;
  onRewardScore?: (points: number, stars: number) => void;
}

export const PerkalianBelajar: React.FC<BelajarProps> = ({ onUnlockBadge, onRewardScore }) => {
  const [activeLevel, setActiveLevel] = useState<1 | 2 | 3 | 4 | 5 | 'papan' | 'kalkulator'>(1);

  // LEVEL 1 State (Interactive Click on Steps)
  const [l1ActiveStep, setL1ActiveStep] = useState<number>(1);

  // LEVEL 2 State (Interactive Bersusun Pendek inputs)
  const [l2SatuanInput, setL2SatuanInput] = useState<string>('');
  const [l2Simpanan1, setL2Simpanan1] = useState<string>('');
  const [l2PuluhanInput, setL2PuluhanInput] = useState<string>('');
  const [l2Simpanan2, setL2Simpanan2] = useState<string>('');
  const [l2RatusanInput, setL2RatusanInput] = useState<string>('');
  const [l2RibuanInput, setL2RibuanInput] = useState<string>('');
  const [l2Feedback, setL2Feedback] = useState<{ isCorrect: boolean; message: string; hint?: string } | null>(null);

  // LEVEL 3 State (Puluhan Interactive practice)
  const [l3Selected, setL3Selected] = useState<{ a: number; b: number }>({ a: 3, b: 40 });
  const [l3Answer, setL3Answer] = useState<string>('');
  const [l3Feedback, setL3Feedback] = useState<boolean | null>(null);

  // LEVEL 4 State (Ratusan Interactive practice)
  const [l4Selected, setL4Selected] = useState<{ a: number; b: number }>({ a: 4, b: 300 });
  const [l4Answer, setL4Answer] = useState<string>('');
  const [l4Feedback, setL4Feedback] = useState<boolean | null>(null);

  // LEVEL 5 State (Ribuan Interactive practice)
  const [l5Selected, setL5Selected] = useState<{ a: number; b: number }>({ a: 3, b: 4000 });
  const [l5Answer, setL5Answer] = useState<string>('');
  const [l5Feedback, setL5Feedback] = useState<boolean | null>(null);

  // Level 2 Validation Handler
  const handleCheckLevel2 = () => {
    // Expected:
    // 177 × 8
    // Satuan: 7 × 8 = 56 -> write 6, carry 5
    // Puluhan: 7 × 8 = 56 + 5 = 61 -> write 1, carry 6
    // Ratusan: 1 × 8 = 8 + 6 = 14 -> write 4, carry 1 (or write 14)
    if (l2SatuanInput !== '6') {
      SoundEffects.playWrong();
      setL2Feedback({
        isCorrect: false,
        message: 'Coba perhatikan tempat satuan.',
        hint: '7 × 8 = 56. Angka satuan dari 56 adalah 6, simpan 5 di atas puluhan.',
      });
      return;
    }
    if (l2Simpanan1 !== '5') {
      SoundEffects.playWrong();
      setL2Feedback({
        isCorrect: false,
        message: 'Periksa angka yang disimpan pada puluhan.',
        hint: 'Dari 56 (7 × 8), angka yang disimpan adalah 5 puluhan.',
      });
      return;
    }
    if (l2PuluhanInput !== '1') {
      SoundEffects.playWrong();
      setL2Feedback({
        isCorrect: false,
        message: 'Periksa hasil pada tempat puluhan.',
        hint: '7 × 8 = 56, ditambah simpanan 5 menjadi 61. Tulis 1 pada puluhan dan simpan 6.',
      });
      return;
    }
    if (l2Simpanan2 !== '6') {
      SoundEffects.playWrong();
      setL2Feedback({
        isCorrect: false,
        message: 'Periksa angka yang disimpan ke ratusan.',
        hint: 'Dari 61 (56 + 5), kita menulis 1 dan menyimpan 6 ratusan.',
      });
      return;
    }
    if (l2RatusanInput !== '4' || (l2RibuanInput !== '1' && l2RibuanInput !== '')) {
      SoundEffects.playWrong();
      setL2Feedback({
        isCorrect: false,
        message: 'Periksa perkalian ratusan.',
        hint: '1 × 8 = 8. Ditambah simpanan 6 menjadi 14. Tulis 4 di ratusan dan 1 di ribuan (1.416).',
      });
      return;
    }

    SoundEffects.playCorrect();
    triggerConfetti();
    onUnlockBadge?.('ahli-bersusun');
    onRewardScore?.(25, 2);
    setL2Feedback({
      isCorrect: true,
      message: '🎉 Luar biasa! Kamu berhasil menyusun perkalian 177 × 8 = 1.416 dengan sempurna!',
    });
  };

  return (
    <div className="space-y-6">
      {/* Sub-Level Navigation Chips */}
      <div className="bg-white border-4 border-black rounded-3xl p-4 sm:p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <div className="text-xs font-black uppercase text-slate-500 mb-2">Pilih Level Pembelajaran:</div>
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 1 as const, label: 'Level 1: Bersusun Panjang (1 Angka)', badge: '1 Angka' },
            { id: 2 as const, label: 'Level 2: Bersusun Pendek Interaktif', badge: 'Simulasi' },
            { id: 3 as const, label: 'Level 3: Perkalian Puluhan', badge: '× 10' },
            { id: 4 as const, label: 'Level 4: Perkalian Ratusan', badge: '× 100' },
            { id: 5 as const, label: 'Level 5: Perkalian Ribuan', badge: '× 1.000' },
            { id: 'papan' as const, label: '🎯 Papan Nilai Tempat', badge: 'Alat Visual' },
            { id: 'kalkulator' as const, label: '🤖 Kalkulator Belajar', badge: 'Step-by-Step' },
          ].map(lvl => (
            <button
              key={lvl.id}
              onClick={() => {
                SoundEffects.playClick();
                setActiveLevel(lvl.id);
                if (lvl.id === 1) onUnlockBadge?.('pemula-perkalian');
              }}
              className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-black border-2 border-black transition-all cursor-pointer flex items-center gap-1.5 ${
                activeLevel === lvl.id
                  ? 'bg-yellow-300 text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5 font-heading'
                  : 'bg-white text-slate-700 hover:bg-yellow-100'
              }`}
            >
              <span>{lvl.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* LEVEL 1: Perkalian 1 Angka Bersusun Panjang */}
      {activeLevel === 1 && (
        <div className="bg-white border-4 border-black rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6">
          <div className="border-b-3 border-black pb-4">
            <span className="text-xs font-black bg-blue-100 border border-black px-3 py-1 rounded-full uppercase tracking-wider">
              Level 1 Pembelajaran
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading mt-2">
              Perkalian dengan Bilangan Satu Angka (Contoh: 177 × 8)
            </h3>
            <p className="text-slate-600 text-sm font-semibold mt-1">
              Klik setiap kotak langkah di bawah ini untuk melihat bagaimana perkalian bersusun bekerja dari satuan, puluhan, hingga ratusan!
            </p>
          </div>

          {/* Interactive Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                step: 1,
                title: 'Langkah 1: Satuan',
                calc: '7 × 8 = 56',
                action1: 'Tulis 6 pada satuan',
                action2: 'Simpan 5 pada puluhan',
                color: 'bg-emerald-100 border-emerald-400',
                headerColor: 'bg-emerald-300',
              },
              {
                step: 2,
                title: 'Langkah 2: Puluhan',
                calc: '7 × 8 = 56 (+ 5) = 61',
                action1: 'Tulis 1 pada puluhan',
                action2: 'Simpan 6 pada ratusan',
                color: 'bg-amber-100 border-amber-400',
                headerColor: 'bg-amber-300',
              },
              {
                step: 3,
                title: 'Langkah 3: Ratusan',
                calc: '1 × 8 = 8 (+ 6) = 14',
                action1: 'Tulis 4 pada ratusan',
                action2: 'Simpan 1 pada ribuan',
                color: 'bg-blue-100 border-blue-400',
                headerColor: 'bg-blue-300',
              },
            ].map(item => (
              <div
                key={item.step}
                onClick={() => {
                  SoundEffects.playClick();
                  setL1ActiveStep(item.step);
                }}
                className={`border-3 border-black rounded-2xl p-4 transition-all cursor-pointer ${
                  l1ActiveStep === item.step
                    ? `${item.color} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-y-1 ring-2 ring-black`
                    : 'bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <div className={`text-xs font-black uppercase px-2.5 py-1 rounded-lg border border-black inline-block mb-2 ${item.headerColor}`}>
                  {item.title}
                </div>
                <div className="font-mono text-xl font-black text-slate-900 mb-2">{item.calc}</div>
                <ul className="text-xs font-bold text-slate-700 space-y-1">
                  <li className="flex items-center gap-1.5">
                    <span className="text-emerald-600 font-black">➔</span> {item.action1}
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-amber-600 font-black">➔</span> {item.action2}
                  </li>
                </ul>
              </div>
            ))}
          </div>

          {/* Detailed Visual Display for the active step */}
          <div className="bg-slate-100 border-3 border-black rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-black text-sm uppercase">
              <Lightbulb className="w-5 h-5 text-yellow-600" />
              <span>Detail Penjelasan Langkah {l1ActiveStep}:</span>
            </div>

            {l1ActiveStep === 1 && (
              <div className="bg-white border-2 border-black rounded-xl p-4 space-y-2">
                <div className="font-black text-base text-slate-900 font-heading">
                  1. Mengalikan Nilai Tempat Satuan: 7 × 8 = 56
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  Angka <strong>7 satuan</strong> dikalikan dengan <strong>8</strong> menghasilkan <strong>56</strong>.
                  Karena 56 terdiri dari <strong>5 puluhan</strong> dan <strong>6 satuan</strong>, kita menuliskan angka <strong>6</strong> di tempat satuan pada hasil bawah, lalu angka <strong>5</strong> disimpan di atas angka puluhan untuk dijumlahkan pada langkah berikutnya.
                </p>
              </div>
            )}

            {l1ActiveStep === 2 && (
              <div className="bg-white border-2 border-black rounded-xl p-4 space-y-2">
                <div className="font-black text-base text-slate-900 font-heading">
                  2. Mengalikan Nilai Tempat Puluhan & Menambahkan Simpanan: (7 × 8) + 5 = 61
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  Angka <strong>7 puluhan</strong> dikalikan <strong>8</strong> menghasilkan <strong>56</strong>. Jangan lupa ditambahkan angka simpanan <strong>5</strong> dari langkah sebelumnya: 56 + 5 = <strong>61</strong>.
                  Tuliskan angka <strong>1</strong> pada tempat puluhan hasil bawah, lalu simpan angka <strong>6</strong> di atas angka ratusan.
                </p>
              </div>
            )}

            {l1ActiveStep === 3 && (
              <div className="bg-white border-2 border-black rounded-xl p-4 space-y-2">
                <div className="font-black text-base text-slate-900 font-heading">
                  3. Mengalikan Nilai Tempat Ratusan & Menambahkan Simpanan: (1 × 8) + 6 = 14
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  Angka <strong>1 ratusan</strong> dikalikan <strong>8</strong> menghasilkan <strong>8</strong>. Ditambah angka simpanan <strong>6</strong>: 8 + 6 = <strong>14</strong>.
                  Karena tidak ada angka perkalian lagi di sebelah kiri, kita langsung menuliskan angka <strong>14</strong> (4 ratusan dan 1 ribuan).
                </p>
              </div>
            )}

            <div className="bg-emerald-300 border-2 border-black rounded-xl p-3.5 flex items-center justify-between">
              <span className="text-xs font-black uppercase text-emerald-950">Hasil Akhir:</span>
              <span className="text-xl font-black font-heading text-emerald-950">177 × 8 = 1.416</span>
            </div>
          </div>
        </div>
      )}

      {/* LEVEL 2: Cara Bersusun Pendek (Interactive Simulation) */}
      {activeLevel === 2 && (
        <div className="bg-white border-4 border-black rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6">
          <div className="border-b-3 border-black pb-4">
            <span className="text-xs font-black bg-purple-100 border border-black px-3 py-1 rounded-full uppercase tracking-wider">
              Level 2: Simulasi Interaktif
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading mt-2">
              Cara Bersusun Pendek (Ketik Angka Hasil & Simpanan)
            </h3>
            <p className="text-slate-600 text-sm font-semibold mt-1">
              Cobalah mengisi kotak simpanan dan kotak digit hasil perkalian berikut secara mandiri!
            </p>
          </div>

          {/* Interactive Calculation Form */}
          <div className="bg-slate-50 border-4 border-black rounded-3xl p-6 flex flex-col items-center justify-center max-w-lg mx-auto shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <div className="w-full space-y-3 font-mono">
              {/* Row Simpanan (Carry) */}
              <div className="flex items-center justify-end gap-2 pr-4 text-xs font-bold text-slate-500">
                <span className="text-[10px] uppercase font-sans font-black mr-2">Simpanan:</span>
                {/* Carry above Ratusan */}
                <input
                  type="text"
                  maxLength={1}
                  placeholder="?"
                  value={l2Simpanan2}
                  onChange={e => setL2Simpanan2(e.target.value.slice(-1))}
                  className="w-10 h-10 text-center text-sm font-black bg-amber-200 border-2 border-black rounded-lg shadow-xs focus:outline-none"
                  title="Simpanan ke Ratusan"
                />
                {/* Carry above Puluhan */}
                <input
                  type="text"
                  maxLength={1}
                  placeholder="?"
                  value={l2Simpanan1}
                  onChange={e => setL2Simpanan1(e.target.value.slice(-1))}
                  className="w-10 h-10 text-center text-sm font-black bg-amber-200 border-2 border-black rounded-lg shadow-xs focus:outline-none"
                  title="Simpanan ke Puluhan"
                />
                <div className="w-10 h-10" />
              </div>

              {/* Number 177 */}
              <div className="flex items-center justify-end gap-2 pr-4 text-3xl font-black text-slate-900 font-heading">
                <div className="w-10 text-center">1</div>
                <div className="w-10 text-center">7</div>
                <div className="w-10 text-center">7</div>
              </div>

              {/* Multiplier 8 */}
              <div className="flex items-center justify-end gap-2 pr-4 text-3xl font-black text-slate-900 font-heading">
                <span className="text-xl text-slate-400 font-bold mr-auto pl-4">×</span>
                <div className="w-10 text-center text-slate-400"> </div>
                <div className="w-10 text-center text-slate-400"> </div>
                <div className="w-10 text-center text-blue-600">8</div>
              </div>

              {/* Dividing line */}
              <div className="w-full h-1.5 bg-black rounded-full" />

              {/* User Digit Inputs */}
              <div className="flex items-center justify-end gap-2 pr-4 pt-1">
                {/* Ribuan */}
                <input
                  type="text"
                  maxLength={1}
                  placeholder="?"
                  value={l2RibuanInput}
                  onChange={e => setL2RibuanInput(e.target.value.slice(-1))}
                  className="w-10 h-12 text-center text-2xl font-black bg-yellow-200 border-2 border-black rounded-xl font-heading shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none"
                  title="Ribuan"
                />
                {/* Ratusan */}
                <input
                  type="text"
                  maxLength={1}
                  placeholder="?"
                  value={l2RatusanInput}
                  onChange={e => setL2RatusanInput(e.target.value.slice(-1))}
                  className="w-10 h-12 text-center text-2xl font-black bg-yellow-200 border-2 border-black rounded-xl font-heading shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none"
                  title="Ratusan"
                />
                {/* Puluhan */}
                <input
                  type="text"
                  maxLength={1}
                  placeholder="?"
                  value={l2PuluhanInput}
                  onChange={e => setL2PuluhanInput(e.target.value.slice(-1))}
                  className="w-10 h-12 text-center text-2xl font-black bg-yellow-200 border-2 border-black rounded-xl font-heading shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none"
                  title="Puluhan"
                />
                {/* Satuan */}
                <input
                  type="text"
                  maxLength={1}
                  placeholder="?"
                  value={l2SatuanInput}
                  onChange={e => setL2SatuanInput(e.target.value.slice(-1))}
                  className="w-10 h-12 text-center text-2xl font-black bg-yellow-200 border-2 border-black rounded-xl font-heading shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none"
                  title="Satuan"
                />
              </div>
            </div>

            {/* Check button */}
            <div className="mt-6 flex items-center gap-3 w-full">
              <button
                onClick={handleCheckLevel2}
                className="flex-1 py-3 bg-yellow-300 hover:bg-yellow-400 text-black font-black text-sm rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 cursor-pointer font-heading flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Periksa Jawaban Bersusun</span>
              </button>
              <button
                onClick={() => {
                  SoundEffects.playClick();
                  setL2SatuanInput('');
                  setL2Simpanan1('');
                  setL2PuluhanInput('');
                  setL2Simpanan2('');
                  setL2RatusanInput('');
                  setL2RibuanInput('');
                  setL2Feedback(null);
                }}
                className="p-3 bg-white hover:bg-slate-100 border-2 border-black rounded-xl cursor-pointer"
                title="Kosongkan Kotak"
              >
                <RotateCcw className="w-5 h-5 text-slate-800" />
              </button>
            </div>
          </div>

          {/* Feedback result */}
          {l2Feedback && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-5 rounded-2xl border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-2 ${
                l2Feedback.isCorrect ? 'bg-green-100 text-green-950' : 'bg-amber-100 text-amber-950'
              }`}
            >
              <div className="font-black text-base font-heading flex items-center gap-2">
                {l2Feedback.isCorrect ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <HelpCircle className="w-5 h-5 text-amber-600" />}
                <span>{l2Feedback.message}</span>
              </div>
              {l2Feedback.hint && (
                <p className="text-xs sm:text-sm font-semibold text-slate-800 bg-white/80 p-3 rounded-xl border border-black/20">
                  💡 <strong>Petunjuk:</strong> {l2Feedback.hint}
                </p>
              )}
            </motion.div>
          )}
        </div>
      )}

      {/* LEVEL 3: Perkalian dengan Puluhan */}
      {activeLevel === 3 && (
        <div className="bg-white border-4 border-black rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6">
          <div className="border-b-3 border-black pb-4">
            <span className="text-xs font-black bg-amber-100 border border-black px-3 py-1 rounded-full uppercase tracking-wider">
              Level 3: Perkalian dengan Puluhan
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading mt-2">
              Konsep Nilai Tempat: 2 × 70 = 140
            </h3>
            <p className="text-slate-600 text-sm font-semibold mt-1">
              Memahami mengapa satu angka 0 ditambahkan pada hasil perkalian puluhan.
            </p>
          </div>

          {/* Visual Concept explanation */}
          <div className="bg-amber-50 border-3 border-black rounded-2xl p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
              <div className="bg-white border-2 border-black rounded-xl p-4 shadow-xs">
                <div className="text-xs font-black text-slate-500 uppercase">Tahap 1: Uraikan Puluhan</div>
                <div className="text-2xl font-black text-slate-900 font-heading mt-1">70 = 7 puluhan</div>
              </div>
              <div className="bg-white border-2 border-black rounded-xl p-4 shadow-xs">
                <div className="text-xs font-black text-slate-500 uppercase">Tahap 2: Kalikan Angka Dasar</div>
                <div className="text-2xl font-black text-amber-700 font-heading mt-1">2 × 7 = 14 puluhan</div>
              </div>
              <div className="bg-emerald-300 border-2 border-black rounded-xl p-4 shadow-xs">
                <div className="text-xs font-black text-emerald-950 uppercase">Tahap 3: Ubah ke Satuan</div>
                <div className="text-2xl font-black text-emerald-950 font-heading mt-1">14 puluhan = 140</div>
              </div>
            </div>

            <div className="p-4 bg-white border-2 border-black rounded-xl text-xs sm:text-sm text-slate-800 font-medium">
              💡 <strong>Intisari:</strong> Karena 70 mempunyai <strong>satu angka 0</strong> di belakangnya, kita cukup mengalikan 2 × 7 = 14, lalu menambahkan 1 angka 0 di belakangnya menjadi <strong>140</strong>!
            </div>
          </div>

          {/* Interactive practice selector */}
          <div className="bg-slate-50 border-2 border-black rounded-2xl p-5 space-y-4">
            <div className="font-black text-sm uppercase text-slate-800">Coba Latihan Interaktif:</div>
            <div className="flex flex-wrap items-center gap-2">
              {[
                { a: 3, b: 40 },
                { a: 5, b: 60 },
                { a: 7, b: 80 },
                { a: 9, b: 30 },
              ].map(item => (
                <button
                  key={`${item.a}x${item.b}`}
                  onClick={() => {
                    SoundEffects.playClick();
                    setL3Selected(item);
                    setL3Answer('');
                    setL3Feedback(null);
                  }}
                  className={`px-3 py-1.5 rounded-xl border-2 border-black font-black text-xs cursor-pointer ${
                    l3Selected.a === item.a && l3Selected.b === item.b
                      ? 'bg-yellow-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                      : 'bg-white hover:bg-yellow-100'
                  }`}
                >
                  {item.a} × {item.b}
                </button>
              ))}
            </div>

            {/* Answer form */}
            <div className="flex items-center gap-3 pt-2">
              <span className="font-black text-2xl font-heading">
                {l3Selected.a} × {l3Selected.b} =
              </span>
              <input
                type="number"
                value={l3Answer}
                onChange={e => setL3Answer(e.target.value)}
                placeholder="Jawabanmu"
                className="w-36 px-3 py-2 bg-white border-2 border-black rounded-xl font-black text-lg text-center"
              />
              <button
                onClick={() => {
                  const correct = l3Selected.a * l3Selected.b;
                  const isOk = parseInt(l3Answer, 10) === correct;
                  if (isOk) {
                    SoundEffects.playCorrect();
                    setL3Feedback(true);
                    onRewardScore?.(10, 1);
                  } else {
                    SoundEffects.playWrong();
                    setL3Feedback(false);
                  }
                }}
                className="px-4 py-2.5 bg-yellow-300 hover:bg-yellow-400 border-2 border-black rounded-xl font-black text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
              >
                Cek
              </button>
            </div>

            {l3Feedback !== null && (
              <div className={`p-3 rounded-xl border-2 border-black text-xs font-bold ${l3Feedback ? 'bg-green-100 text-green-950' : 'bg-rose-100 text-rose-950'}`}>
                {l3Feedback
                  ? `🎉 Tepat sekali! ${l3Selected.a} × ${l3Selected.b / 10} = ${l3Selected.a * (l3Selected.b / 10)}, ditambah 1 nol menjadi ${l3Selected.a * l3Selected.b}.`
                  : `Belum tepat. Coba kalikan ${l3Selected.a} × ${l3Selected.b / 10} dulu, lalu tambahkan 1 angka nol.`}
              </div>
            )}
          </div>
        </div>
      )}

      {/* LEVEL 4: Perkalian dengan Ratusan */}
      {activeLevel === 4 && (
        <div className="bg-white border-4 border-black rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6">
          <div className="border-b-3 border-black pb-4">
            <span className="text-xs font-black bg-blue-100 border border-black px-3 py-1 rounded-full uppercase tracking-wider">
              Level 4: Perkalian dengan Ratusan
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading mt-2">
              Pergeseran Nilai Tempat Ratusan: 5 × 100 = 500
            </h3>
            <p className="text-slate-600 text-sm font-semibold mt-1">
              Ketika mengalikan dengan 100, nilai tempat bergeser <strong>dua tempat ke kiri</strong> dan menambahkan <strong>dua angka 0</strong>.
            </p>
          </div>

          {/* Visual Shift Demonstration */}
          <div className="bg-blue-50 border-3 border-black rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
              <div className="bg-white border-2 border-black rounded-2xl p-4 w-32 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <div className="text-xs font-black uppercase text-slate-500">Angka Asli</div>
                <div className="text-4xl font-black text-slate-900 font-heading mt-1">5</div>
              </div>
              <div className="text-2xl font-black text-blue-700">➔ Dikali 100 (Geser 2 Kolom) ➔</div>
              <div className="bg-yellow-300 border-2 border-black rounded-2xl p-4 w-40 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <div className="text-xs font-black uppercase text-black">Hasil Akhir</div>
                <div className="text-4xl font-black text-black font-heading mt-1">
                  5<span className="text-blue-700 underline">00</span>
                </div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-800 font-medium text-center max-w-xl mx-auto">
              5 × 100 = 5 × 1 ratusan = <strong>5 ratusan = 500</strong>. Dua angka nol berasal dari pergeseran nilai tempat ratusan!
            </p>
          </div>

          {/* Interactive practice selector */}
          <div className="bg-slate-50 border-2 border-black rounded-2xl p-5 space-y-4">
            <div className="font-black text-sm uppercase text-slate-800">Latihan Interaktif Ratusan:</div>
            <div className="flex flex-wrap items-center gap-2">
              {[
                { a: 2, b: 100 },
                { a: 4, b: 300 },
                { a: 6, b: 200 },
                { a: 7, b: 400 },
                { a: 8, b: 500 },
              ].map(item => (
                <button
                  key={`${item.a}x${item.b}`}
                  onClick={() => {
                    SoundEffects.playClick();
                    setL4Selected(item);
                    setL4Answer('');
                    setL4Feedback(null);
                  }}
                  className={`px-3 py-1.5 rounded-xl border-2 border-black font-black text-xs cursor-pointer ${
                    l4Selected.a === item.a && l4Selected.b === item.b
                      ? 'bg-yellow-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                      : 'bg-white hover:bg-yellow-100'
                  }`}
                >
                  {item.a} × {item.b}
                </button>
              ))}
            </div>

            {/* Answer form */}
            <div className="flex items-center gap-3 pt-2">
              <span className="font-black text-2xl font-heading">
                {l4Selected.a} × {l4Selected.b} =
              </span>
              <input
                type="number"
                value={l4Answer}
                onChange={e => setL4Answer(e.target.value)}
                placeholder="Jawabanmu"
                className="w-36 px-3 py-2 bg-white border-2 border-black rounded-xl font-black text-lg text-center"
              />
              <button
                onClick={() => {
                  const correct = l4Selected.a * l4Selected.b;
                  const isOk = parseInt(l4Answer, 10) === correct;
                  if (isOk) {
                    SoundEffects.playCorrect();
                    setL4Feedback(true);
                    onRewardScore?.(10, 1);
                  } else {
                    SoundEffects.playWrong();
                    setL4Feedback(false);
                  }
                }}
                className="px-4 py-2.5 bg-yellow-300 hover:bg-yellow-400 border-2 border-black rounded-xl font-black text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
              >
                Cek
              </button>
            </div>

            {l4Feedback !== null && (
              <div className={`p-3 rounded-xl border-2 border-black text-xs font-bold ${l4Feedback ? 'bg-green-100 text-green-950' : 'bg-rose-100 text-rose-950'}`}>
                {l4Feedback
                  ? `🎉 Luar biasa! ${l4Selected.a} × ${l4Selected.b / 100} = ${l4Selected.a * (l4Selected.b / 100)}, ditambah 2 nol menjadi ${(l4Selected.a * l4Selected.b).toLocaleString('id-ID')}.`
                  : `Belum tepat. Coba kalikan ${l4Selected.a} × ${l4Selected.b / 100} terlebih dahulu, lalu tambahkan dua angka nol (00).`}
              </div>
            )}
          </div>
        </div>
      )}

      {/* LEVEL 5: Perkalian dengan Ribuan */}
      {activeLevel === 5 && (
        <div className="bg-white border-4 border-black rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6">
          <div className="border-b-3 border-black pb-4">
            <span className="text-xs font-black bg-purple-100 border border-black px-3 py-1 rounded-full uppercase tracking-wider">
              Level 5: Perkalian dengan Ribuan
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading mt-2">
              Pergeseran Nilai Tempat Ribuan: 3 × 4.000 = 12.000
            </h3>
            <p className="text-slate-600 text-sm font-semibold mt-1">
              4.000 = 4 ribuan. Karena 4.000 mempunyai <strong>tiga angka 0</strong>, maka 3 × 4 = 12, hasilnya menjadi <strong>12.000</strong>.
            </p>
          </div>

          {/* Place Value Shift Visual */}
          <div className="bg-purple-50 border-3 border-black rounded-2xl p-6 space-y-4">
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-purple-300 border-2 border-black p-2.5 rounded-xl font-black text-xs">Ribuan</div>
              <div className="bg-blue-300 border-2 border-black p-2.5 rounded-xl font-black text-xs">Ratusan</div>
              <div className="bg-amber-300 border-2 border-black p-2.5 rounded-xl font-black text-xs">Puluhan</div>
              <div className="bg-emerald-300 border-2 border-black p-2.5 rounded-xl font-black text-xs">Satuan</div>
            </div>

            <div className="bg-white border-2 border-black rounded-xl p-4 text-center">
              <div className="text-xs font-black uppercase text-slate-500">Perhitungan Cepat:</div>
              <div className="text-2xl sm:text-3xl font-black text-purple-900 font-heading mt-1">
                3 × 4 = 12 ➔ 12 ribuan = 12.000
              </div>
            </div>
          </div>

          {/* Interactive practice selector */}
          <div className="bg-slate-50 border-2 border-black rounded-2xl p-5 space-y-4">
            <div className="font-black text-sm uppercase text-slate-800">Latihan Interaktif Ribuan:</div>
            <div className="flex flex-wrap items-center gap-2">
              {[
                { a: 2, b: 3000 },
                { a: 4, b: 2000 },
                { a: 5, b: 6000 },
                { a: 7, b: 3000 },
                { a: 8, b: 4000 },
              ].map(item => (
                <button
                  key={`${item.a}x${item.b}`}
                  onClick={() => {
                    SoundEffects.playClick();
                    setL5Selected(item);
                    setL5Answer('');
                    setL5Feedback(null);
                  }}
                  className={`px-3 py-1.5 rounded-xl border-2 border-black font-black text-xs cursor-pointer ${
                    l5Selected.a === item.a && l5Selected.b === item.b
                      ? 'bg-yellow-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                      : 'bg-white hover:bg-yellow-100'
                  }`}
                >
                  {item.a} × {item.b.toLocaleString('id-ID')}
                </button>
              ))}
            </div>

            {/* Answer form */}
            <div className="flex items-center gap-3 pt-2">
              <span className="font-black text-2xl font-heading">
                {l5Selected.a} × {l5Selected.b.toLocaleString('id-ID')} =
              </span>
              <input
                type="number"
                value={l5Answer}
                onChange={e => setL5Answer(e.target.value)}
                placeholder="Jawabanmu"
                className="w-40 px-3 py-2 bg-white border-2 border-black rounded-xl font-black text-lg text-center"
              />
              <button
                onClick={() => {
                  const correct = l5Selected.a * l5Selected.b;
                  const isOk = parseInt(l5Answer, 10) === correct;
                  if (isOk) {
                    SoundEffects.playCorrect();
                    setL5Feedback(true);
                    onRewardScore?.(15, 1);
                  } else {
                    SoundEffects.playWrong();
                    setL5Feedback(false);
                  }
                }}
                className="px-4 py-2.5 bg-yellow-300 hover:bg-yellow-400 border-2 border-black rounded-xl font-black text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
              >
                Cek
              </button>
            </div>

            {l5Feedback !== null && (
              <div className={`p-3 rounded-xl border-2 border-black text-xs font-bold ${l5Feedback ? 'bg-green-100 text-green-950' : 'bg-rose-100 text-rose-950'}`}>
                {l5Feedback
                  ? `🎉 Tepat sekali! ${l5Selected.a} × ${l5Selected.b / 1000} = ${l5Selected.a * (l5Selected.b / 1000)}, ditambah 3 nol menjadi ${(l5Selected.a * l5Selected.b).toLocaleString('id-ID')}.`
                  : `Belum tepat. Coba kalikan ${l5Selected.a} × ${l5Selected.b / 1000} terlebih dahulu, lalu tambahkan tiga angka nol (000).`}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Papan Nilai Tempat Feature */}
      {activeLevel === 'papan' && <PapanNilaiTempat onUnlockBadge={onUnlockBadge} />}

      {/* Kalkulator Belajar Feature */}
      {activeLevel === 'kalkulator' && <KalkulatorPerkalianBelajar />}
    </div>
  );
};
