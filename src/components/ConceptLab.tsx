import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Scale, Sparkles, ArrowRight, HelpCircle, RefreshCw, CheckCircle2, Lightbulb } from 'lucide-react';
import { SoundEffects } from '../utils/sound';
import { triggerConfetti } from '../utils/confetti';

interface ConceptLabProps {
  onUnlockBadge?: (badgeId: string) => void;
}

export const ConceptLab: React.FC<ConceptLabProps> = ({ onUnlockBadge }) => {
  const [activeTab, setActiveTab] = useState<'timbangan' | 'jurus' | 'simulator'>('timbangan');

  // Interactive Balance State
  const [scaleLeftKnown, setScaleLeftKnown] = useState(150);
  const [scaleRightTotal, setScaleRightTotal] = useState(420);
  const [isBalanced, setIsBalanced] = useState(false);
  const [revealedScaleAnswer, setRevealedScaleAnswer] = useState(false);

  // Simulator State
  const [simType, setSimType] = useState<'sub_subtrahend' | 'sub_minuend' | 'add'>('sub_subtrahend');
  const [numA, setNumA] = useState(678);
  const [numB, setNumB] = useState(243);
  const [userGuess, setUserGuess] = useState('');
  const [simResult, setSimResult] = useState<{ isCorrect: boolean; message: string; stepDetail: string } | null>(null);

  const calculateCorrectSimAnswer = () => {
    if (simType === 'sub_subtrahend') {
      // numA - ? = numB => ? = numA - numB
      return numA - numB;
    } else if (simType === 'sub_minuend') {
      // ? - numA = numB => ? = numA + numB
      return numA + numB;
    } else {
      // numA + ? = numB => ? = numB - numA
      return numB - numA;
    }
  };

  const handleCheckSimulator = (e: React.FormEvent) => {
    e.preventDefault();
    const correctVal = calculateCorrectSimAnswer();
    const parsed = parseInt(userGuess.trim(), 10);

    if (isNaN(parsed)) {
      SoundEffects.playWrong();
      setSimResult({
        isCorrect: false,
        message: 'Masukkan angka jawabanmu terlebih dahulu ya!',
        stepDetail: '',
      });
      return;
    }

    if (parsed === correctVal) {
      SoundEffects.playCorrect();
      triggerConfetti();
      onUnlockBadge?.('timbangan-seimbang');
      if (numA === 678 && numB === 243 && simType === 'sub_subtrahend') {
        onUnlockBadge?.('penakluk-678');
      }
      setSimResult({
        isCorrect: true,
        message: `🎉 Hebat sekali! Jawabanmu ${parsed} TEPAT BENAR!`,
        stepDetail:
          simType === 'sub_subtrahend'
            ? `Trik: ${numA} - ${numB} = ${correctVal}`
            : simType === 'sub_minuend'
            ? `Trik: ${numB} + ${numA} = ${correctVal}`
            : `Trik: ${numB} - ${numA} = ${correctVal}`,
      });
    } else {
      SoundEffects.playWrong();
      setSimResult({
        isCorrect: false,
        message: `Yuk coba lagi! ${parsed} belum pas.`,
        stepDetail:
          simType === 'sub_subtrahend'
            ? `Ingat: Untuk mencari bilangan pengurang (${numA} - ... = ${numB}), kurangkan: ${numA} - ${numB}`
            : simType === 'sub_minuend'
            ? `Ingat: Untuk mencari bilangan yang dikurangi (... - ${numA} = ${numB}), jumlahkan: ${numB} + ${numA}`
            : `Ingat: Untuk mencari suku penjumlahan (${numA} + ... = ${numB}), kurangkan: ${numB} - ${numA}`,
      });
    }
  };

  const loadExample678 = () => {
    SoundEffects.playClick();
    setSimType('sub_subtrahend');
    setNumA(678);
    setNumB(243);
    setUserGuess('');
    setSimResult(null);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Bento Header Banner */}
      <div className="bg-yellow-300 border-4 border-black rounded-3xl p-6 sm:p-8 text-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border-2 border-black rounded-full text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Sparkles className="w-4 h-4 text-yellow-600" />
            <span>Laboratorium Konsep Aljabar SD</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black font-heading text-slate-900">
            Timbangan Ajaib & Kotak Misteri
          </h2>
          <p className="text-slate-800 text-sm sm:text-base font-bold max-w-2xl">
            Pahami rahasia matematika di balik mencari bilangan yang hilang dengan metode timbangan seimbang dan 3 jurus detektif!
          </p>
        </div>

        {/* Bento Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mt-6">
          <button
            id="tab-timbangan"
            onClick={() => {
              SoundEffects.playClick();
              setActiveTab('timbangan');
            }}
            className={`px-4 py-2.5 rounded-xl font-black text-sm sm:text-base border-2 border-black transition-all flex items-center gap-2 ${
              activeTab === 'timbangan'
                ? 'bg-white text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5'
                : 'bg-yellow-400 text-black hover:bg-yellow-200 shadow-none'
            }`}
          >
            <Scale className="w-5 h-5 text-black" /> Timbangan Interaktif
          </button>
          <button
            id="tab-jurus"
            onClick={() => {
              SoundEffects.playClick();
              setActiveTab('jurus');
            }}
            className={`px-4 py-2.5 rounded-xl font-black text-sm sm:text-base border-2 border-black transition-all flex items-center gap-2 ${
              activeTab === 'jurus'
                ? 'bg-white text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5'
                : 'bg-yellow-400 text-black hover:bg-yellow-200 shadow-none'
            }`}
          >
            <Lightbulb className="w-5 h-5 text-black" /> 3 Jurus Detektif
          </button>
          <button
            id="tab-simulator"
            onClick={() => {
              SoundEffects.playClick();
              setActiveTab('simulator');
            }}
            className={`px-4 py-2.5 rounded-xl font-black text-sm sm:text-base border-2 border-black transition-all flex items-center gap-2 ${
              activeTab === 'simulator'
                ? 'bg-white text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5'
                : 'bg-yellow-400 text-black hover:bg-yellow-200 shadow-none'
            }`}
          >
            <HelpCircle className="w-5 h-5 text-black" /> Coba Soal Sendiri
          </button>
        </div>
      </div>

      {/* Tab 1: Timbangan Interaktif */}
      {activeTab === 'timbangan' && (
        <div className="bg-white border-4 border-black rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6">
          <div className="text-center space-y-1">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
              Prinsip Keseimbangan Timbangan
            </h3>
            <p className="text-slate-600 text-sm sm:text-base font-semibold max-w-xl mx-auto">
              Persamaan matematika seperti <strong>timbangan yang harus seimbang</strong> di sisi kiri dan sisi kanan.
            </p>
          </div>

          {/* Equation Banner */}
          <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-4 text-center">
            <span className="text-xs uppercase tracking-wider text-slate-500 font-black">Persamaan yang Sedang Diuji</span>
            <div className="text-2xl sm:text-4xl font-black text-slate-900 font-heading tracking-wide mt-2 flex items-center justify-center gap-3">
              <div className="w-20 sm:w-24 h-12 sm:h-14 bg-yellow-100 border-3 border-yellow-400 rounded-xl flex items-center justify-center text-yellow-700 font-heading">
                {revealedScaleAnswer ? scaleRightTotal - scaleLeftKnown : '?'}
              </div>
              <span className="text-slate-400 font-bold">+</span>
              <span className="text-blue-600 font-heading">{scaleLeftKnown}</span>
              <span className="text-slate-400 font-bold">=</span>
              <span className="text-green-600 font-heading">{scaleRightTotal}</span>
            </div>
          </div>

          {/* Animated Scale Stage */}
          <div className="bg-slate-50 rounded-3xl p-6 border-2 border-black relative min-h-[300px] flex flex-col justify-end items-center overflow-hidden">
            {/* Center Pivot & Fulcrum */}
            <div className="w-full flex justify-center items-end relative pb-6">
              {/* Lever Beam */}
              <motion.div
                animate={{
                  rotate: revealedScaleAnswer ? 0 : -4,
                }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="w-full max-w-md h-4 bg-slate-900 border-2 border-black rounded-full relative flex justify-between items-center px-4"
              >
                {/* Center Indicator */}
                <div className="absolute left-1/2 -top-6 -translate-x-1/2 w-4 h-8 bg-black rounded-t-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                </div>

                {/* Left Pan (Piringan Kiri) */}
                <div className="relative -top-16 flex flex-col items-center">
                  <div className="w-1 h-14 bg-black" />
                  <div className="w-36 sm:w-44 bg-white border-3 border-black rounded-2xl p-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-center space-y-1">
                    <div className="text-xs font-black text-blue-900 uppercase">Sisi Kiri</div>
                    <div className="flex items-center justify-center gap-1.5">
                      <div className="w-10 h-10 bg-yellow-200 border-2 border-black rounded-xl flex items-center justify-center font-black text-black">
                        {revealedScaleAnswer ? scaleRightTotal - scaleLeftKnown : '?'}
                      </div>
                      <span className="font-bold text-black">+</span>
                      <div className="w-10 h-10 bg-blue-500 border-2 border-black text-white rounded-xl flex items-center justify-center font-black text-xs">
                        {scaleLeftKnown}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Pan (Piringan Kanan) */}
                <div className="relative -top-16 flex flex-col items-center">
                  <div className="w-1 h-14 bg-black" />
                  <div className="w-36 sm:w-44 bg-white border-3 border-black rounded-2xl p-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-center space-y-1">
                    <div className="text-xs font-black text-green-900 uppercase">Sisi Kanan</div>
                    <div className="flex items-center justify-center">
                      <div className="w-16 h-10 bg-green-400 border-2 border-black text-black rounded-xl flex items-center justify-center font-black text-sm">
                        {scaleRightTotal}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Base Stand */}
            <div className="w-16 h-24 bg-slate-900 border-2 border-black rounded-t-lg mx-auto relative flex justify-center">
              <div className="w-32 h-4 bg-black rounded-full absolute bottom-0" />
            </div>
          </div>

          {/* Interactive Controls & Explanation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-yellow-50 rounded-2xl p-4 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] space-y-3">
              <h4 className="font-black text-black flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-600" />
                Langkah Detektif:
              </h4>
              <p className="text-sm text-slate-800 font-semibold leading-relaxed">
                Agar kotak <strong>(?)</strong> sendirian di sisi kiri, kita buang beban <strong>{scaleLeftKnown}</strong>.
                Supaya timbangan tetap seimbang, sisi kanan juga harus dikurangi <strong>{scaleLeftKnown}</strong>!
              </p>
              <div className="bg-white p-3 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-sm font-black text-slate-900">
                ? = {scaleRightTotal} - {scaleLeftKnown} ={' '}
                <span className="text-blue-600 font-black text-base font-heading">
                  {scaleRightTotal - scaleLeftKnown}
                </span>
              </div>
            </div>

            <div className="flex flex-col justify-center items-center gap-3 bg-white p-4 rounded-2xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <button
                id="btn-reveal-scale"
                onClick={() => {
                  SoundEffects.playCorrect();
                  setRevealedScaleAnswer(!revealedScaleAnswer);
                  onUnlockBadge?.('timbangan-seimbang');
                }}
                className="w-full py-3 px-6 bg-yellow-400 hover:bg-yellow-500 text-black font-black rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 text-base font-heading"
              >
                <Sparkles className="w-5 h-5 text-black" />
                {revealedScaleAnswer ? 'Sembunyikan Bilangan Rahasia' : 'Buka Rahasia Kotak (?)'}
              </button>

              <button
                id="btn-randomize-scale"
                onClick={() => {
                  SoundEffects.playClick();
                  const newKnown = Math.floor(Math.random() * 200) + 50;
                  const newAns = Math.floor(Math.random() * 300) + 50;
                  setScaleLeftKnown(newKnown);
                  setScaleRightTotal(newKnown + newAns);
                  setRevealedScaleAnswer(false);
                }}
                className="text-xs font-black text-slate-700 hover:text-black flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Ganti Angka Baru
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: 3 Jurus Detektif */}
      {activeTab === 'jurus' && (
        <div className="space-y-4">
          {/* Jurus 1 */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-yellow-400 border-2 border-black text-black font-black flex items-center justify-center text-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-heading">
                1
              </span>
              <div>
                <h4 className="text-lg sm:text-xl font-black text-slate-900 font-heading">
                  Jurus Pengurang Hilang: A - ... = B
                </h4>
                <p className="text-xs sm:text-sm text-blue-700 font-bold">
                  (Contoh Utama: 678 - ... = 243)
                </p>
              </div>
            </div>

            <p className="text-slate-700 text-sm font-semibold leading-relaxed">
              Jika bilangan di tengah yang hilang pada pengurangan, kurangkan bilangan pertama dengan hasil akhir.
            </p>

            <div className="bg-blue-50 border-2 border-black rounded-2xl p-4 space-y-2">
              <div className="text-xs font-black text-blue-900 uppercase">Rumus Cepat:</div>
              <div className="text-base sm:text-lg font-black text-slate-900 font-mono">
                ... = A - B
              </div>
              <div className="text-sm text-slate-900 bg-white p-3 rounded-xl border-2 border-black font-medium">
                <strong>Contoh:</strong> 678 - ... = 243 <br />
                Maka bilangan misteri = 678 - 243 = <strong className="text-blue-600 font-black text-base">435</strong>
              </div>
            </div>
          </div>

          {/* Jurus 2 */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-pink-400 border-2 border-black text-black font-black flex items-center justify-center text-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-heading">
                2
              </span>
              <div>
                <h4 className="text-lg sm:text-xl font-black text-slate-900 font-heading">
                  Jurus Bilangan Awal Hilang: ... - A = B
                </h4>
                <p className="text-xs sm:text-sm text-pink-700 font-bold">
                  (Contoh: ... - 175 = 320)
                </p>
              </div>
            </div>

            <p className="text-slate-700 text-sm font-semibold leading-relaxed">
              Karena bilangan awal adalah jumlah terbesar yang dimiliki mula-mula sebelum dikurangi, maka kita harus <strong>menjumlahkan</strong> sisa dengan yang berkurang!
            </p>

            <div className="bg-pink-50 border-2 border-black rounded-2xl p-4 space-y-2">
              <div className="text-xs font-black text-pink-900 uppercase">Rumus Cepat:</div>
              <div className="text-base sm:text-lg font-black text-slate-900 font-mono">
                ... = B + A
              </div>
              <div className="text-sm text-slate-900 bg-white p-3 rounded-xl border-2 border-black font-medium">
                <strong>Contoh:</strong> ... - 175 = 320 <br />
                Maka bilangan misteri = 320 + 175 = <strong className="text-pink-600 font-black text-base">495</strong>
              </div>
            </div>
          </div>

          {/* Jurus 3 */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-green-400 border-2 border-black text-black font-black flex items-center justify-center text-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-heading">
                3
              </span>
              <div>
                <h4 className="text-lg sm:text-xl font-black text-slate-900 font-heading">
                  Jurus Penjumlahan Hilang: ... + A = B atau A + ... = B
                </h4>
                <p className="text-xs sm:text-sm text-green-700 font-bold">
                  (Contoh: ... + 145 = 380 atau 234 + ... = 600)
                </p>
              </div>
            </div>

            <p className="text-slate-700 text-sm font-semibold leading-relaxed">
              Kebalikan dari tambah adalah kurang. Selalu kurangkan total hasil dengan angka yang sudah diketahui.
            </p>

            <div className="bg-green-50 border-2 border-black rounded-2xl p-4 space-y-2">
              <div className="text-xs font-black text-green-900 uppercase">Rumus Cepat:</div>
              <div className="text-base sm:text-lg font-black text-slate-900 font-mono">
                ... = B - A
              </div>
              <div className="text-sm text-slate-900 bg-white p-3 rounded-xl border-2 border-black font-medium">
                <strong>Contoh:</strong> ... + 145 = 380 <br />
                Maka bilangan misteri = 380 - 145 = <strong className="text-green-600 font-black text-base">235</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Simulator Coba Soal Sendiri */}
      {activeTab === 'simulator' && (
        <div className="bg-white border-4 border-black rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
                Simulator Uji Soal Interaktif
              </h3>
              <p className="text-slate-600 text-sm font-semibold">
                Coba ubah angka sesukamu dan temukan bilangan yang hilang!
              </p>
            </div>
            <button
              onClick={loadExample678}
              className="px-3.5 py-2 bg-yellow-300 hover:bg-yellow-400 text-black text-xs sm:text-sm font-black rounded-xl flex items-center gap-1.5 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all"
            >
              <Sparkles className="w-4 h-4 text-black" /> Muat Soal 678 - ... = 243
            </button>
          </div>

          {/* Type Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              onClick={() => {
                SoundEffects.playClick();
                setSimType('sub_subtrahend');
                setSimResult(null);
              }}
              className={`p-3 rounded-2xl font-black text-xs sm:text-sm text-center transition-all border-2 border-black ${
                simType === 'sub_subtrahend'
                  ? 'bg-yellow-300 text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 shadow-none'
              }`}
            >
              A - [?] = B
            </button>
            <button
              onClick={() => {
                SoundEffects.playClick();
                setSimType('sub_minuend');
                setSimResult(null);
              }}
              className={`p-3 rounded-2xl font-black text-xs sm:text-sm text-center transition-all border-2 border-black ${
                simType === 'sub_minuend'
                  ? 'bg-yellow-300 text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 shadow-none'
              }`}
            >
              [?] - A = B
            </button>
            <button
              onClick={() => {
                SoundEffects.playClick();
                setSimType('add');
                setSimResult(null);
              }}
              className={`p-3 rounded-2xl font-black text-xs sm:text-sm text-center transition-all border-2 border-black ${
                simType === 'add'
                  ? 'bg-yellow-300 text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 shadow-none'
              }`}
            >
              A + [?] = B
            </button>
          </div>

          {/* Number Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 sm:p-6 rounded-2xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <div>
              <label className="block text-xs font-black text-slate-900 mb-1 uppercase">
                {simType === 'sub_minuend' ? 'Nilai yang Dikurang (A):' : 'Nilai Pertama (A):'}
              </label>
              <input
                type="number"
                value={numA}
                onChange={e => {
                  setNumA(Math.max(1, parseInt(e.target.value) || 0));
                  setSimResult(null);
                }}
                className="w-full px-4 py-2.5 bg-white border-2 border-black rounded-xl font-black text-slate-900 text-lg focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-900 mb-1 uppercase">
                Hasil Target (B):
              </label>
              <input
                type="number"
                value={numB}
                onChange={e => {
                  setNumB(Math.max(1, parseInt(e.target.value) || 0));
                  setSimResult(null);
                }}
                className="w-full px-4 py-2.5 bg-white border-2 border-black rounded-xl font-black text-slate-900 text-lg focus:outline-none"
              />
            </div>
          </div>

          {/* Visual Equation Formula */}
          <div className="text-center py-5 px-6 bg-white border-3 border-black text-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-heading text-2xl sm:text-4xl flex items-center justify-center gap-3">
            {simType === 'sub_subtrahend' && (
              <>
                <span className="text-blue-600 font-heading">{numA}</span>
                <span className="text-slate-400 font-bold">-</span>
                <span className="w-16 h-12 bg-yellow-100 border-2 border-black rounded-lg flex items-center justify-center text-yellow-600 font-heading text-2xl">
                  ?
                </span>
                <span className="text-slate-400 font-bold">=</span>
                <span className="text-green-600 font-heading">{numB}</span>
              </>
            )}
            {simType === 'sub_minuend' && (
              <>
                <span className="w-16 h-12 bg-yellow-100 border-2 border-black rounded-lg flex items-center justify-center text-yellow-600 font-heading text-2xl">
                  ?
                </span>
                <span className="text-slate-400 font-bold">-</span>
                <span className="text-blue-600 font-heading">{numA}</span>
                <span className="text-slate-400 font-bold">=</span>
                <span className="text-green-600 font-heading">{numB}</span>
              </>
            )}
            {simType === 'add' && (
              <>
                <span className="text-blue-600 font-heading">{numA}</span>
                <span className="text-slate-400 font-bold">+</span>
                <span className="w-16 h-12 bg-yellow-100 border-2 border-black rounded-lg flex items-center justify-center text-yellow-600 font-heading text-2xl">
                  ?
                </span>
                <span className="text-slate-400 font-bold">=</span>
                <span className="text-green-600 font-heading">{numB}</span>
              </>
            )}
          </div>

          {/* User Guess Form */}
          <form onSubmit={handleCheckSimulator} className="flex flex-col sm:flex-row gap-3">
            <input
              type="number"
              placeholder="Tebak bilangan misteri (?)..."
              value={userGuess}
              onChange={e => setUserGuess(e.target.value)}
              className="flex-1 px-5 py-3.5 bg-slate-50 border-3 border-black rounded-2xl font-black text-slate-900 text-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] focus:outline-none"
            />
            <button
              type="submit"
              className="px-8 py-3.5 bg-yellow-400 hover:bg-yellow-500 text-black font-black rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 text-base font-heading"
            >
              <CheckCircle2 className="w-5 h-5 text-black" /> Periksa Jawaban
            </button>
          </form>

          {/* Feedback Result */}
          {simResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-5 rounded-2xl border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-2 ${
                simResult.isCorrect
                  ? 'bg-green-100 text-green-950'
                  : 'bg-rose-100 text-rose-950'
              }`}
            >
              <div className="font-black text-base sm:text-lg flex items-center gap-2">
                {simResult.isCorrect ? '🌟' : '🤔'} {simResult.message}
              </div>
              <div className="text-sm font-bold opacity-90">{simResult.stepDetail}</div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};
