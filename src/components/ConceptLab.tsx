import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Scale,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Lightbulb,
  Maximize2,
  Minimize2,
  RotateCcw,
  HelpCircle,
  Check,
} from 'lucide-react';
import { SoundEffects } from '../utils/sound';
import { triggerConfetti } from '../utils/confetti';

interface ConceptLabProps {
  onUnlockBadge?: (badgeId: string) => void;
}

export const ConceptLab: React.FC<ConceptLabProps> = ({ onUnlockBadge }) => {
  const [activeTab, setActiveTab] = useState<'timbangan' | 'jurus' | 'simulator'>('timbangan');

  // Interactive Live Balance State
  const [scaleLeftKnown, setScaleLeftKnown] = useState(243);
  const [scaleRightTotal, setScaleRightTotal] = useState(678);
  const [userScaleInput, setUserScaleInput] = useState<string>('');
  const [isExpandedScaleView, setIsExpandedScaleView] = useState<boolean>(false);

  // Simulator State
  const [simType, setSimType] = useState<'sub_subtrahend' | 'sub_minuend' | 'add'>('sub_subtrahend');
  const [numA, setNumA] = useState(678);
  const [numB, setNumB] = useState(243);
  const [userGuess, setUserGuess] = useState('');
  const [simResult, setSimResult] = useState<{ isCorrect: boolean; message: string; stepDetail: string } | null>(null);

  // Parsed live user value for the balance scale
  const parsedUserVal = userScaleInput.trim() === '' ? 0 : parseInt(userScaleInput, 10) || 0;
  const currentLeftTotal = parsedUserVal + scaleLeftKnown;
  const currentRightTotal = scaleRightTotal;
  const expectedAnswer = scaleRightTotal - scaleLeftKnown;
  const isScaleBalanced = userScaleInput.trim() !== '' && currentLeftTotal === currentRightTotal;

  // Calculate beam tilt rotation angle:
  // When Left is lighter (currentLeftTotal < currentRightTotal) -> Tilt Right (positive angle)
  // When Left is heavier (currentLeftTotal > currentRightTotal) -> Tilt Left (negative angle)
  // When exactly balanced -> 0 deg
  const diff = currentRightTotal - currentLeftTotal;
  const tiltAngle = isScaleBalanced
    ? 0
    : diff > 0
    ? Math.min(12, Math.max(5, Math.abs(diff) * 0.05 + 4)) // tilts right (clockwise)
    : -Math.min(12, Math.max(5, Math.abs(diff) * 0.05 + 4)); // tilts left (counter-clockwise)

  // Track celebration when balanced
  useEffect(() => {
    if (isScaleBalanced && expectedAnswer > 0) {
      SoundEffects.playCorrect();
      triggerConfetti();
      onUnlockBadge?.('timbangan-seimbang');
      if (scaleLeftKnown === 243 && scaleRightTotal === 678) {
        onUnlockBadge?.('penakluk-678');
      }
    }
  }, [isScaleBalanced, expectedAnswer, scaleLeftKnown, scaleRightTotal, onUnlockBadge]);

  const handleRandomizeScale = () => {
    SoundEffects.playClick();
    const presets = [
      { known: 243, total: 678 },
      { known: 150, total: 420 },
      { known: 85, total: 200 },
      { known: 320, total: 500 },
      { known: 135, total: 375 },
      { known: 210, total: 450 },
    ];
    // Pick a random preset or generate realistic SD numbers
    const randomPick = presets[Math.floor(Math.random() * presets.length)];
    setScaleLeftKnown(randomPick.known);
    setScaleRightTotal(randomPick.total);
    setUserScaleInput('');
  };

  const adjustScaleInput = (amount: number) => {
    SoundEffects.playClick();
    const next = Math.max(0, parsedUserVal + amount);
    setUserScaleInput(next === 0 ? '' : next.toString());
  };

  // Simulator Calculation
  const calculateCorrectSimAnswer = () => {
    if (simType === 'sub_subtrahend') {
      return numA - numB;
    } else if (simType === 'sub_minuend') {
      return numA + numB;
    } else {
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

  // Render the core balance scale apparatus (well-contained, responsive, no clipping)
  const renderBalanceApparatus = (isLarge: boolean) => {
    return (
      <div
        className={`bg-slate-50 rounded-3xl p-4 sm:p-6 border-4 border-black relative flex flex-col justify-between items-center transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] w-full ${
          isLarge ? 'min-h-[460px] sm:min-h-[520px]' : 'min-h-[400px] sm:min-h-[460px]'
        }`}
      >
        {/* Status indicator bar at top inside container */}
        <div className="w-full flex items-center justify-between gap-2 z-20 pb-2">
          <div
            className={`px-3 py-1.5 rounded-xl border-2 border-black font-black text-xs sm:text-sm uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
              isScaleBalanced
                ? 'bg-green-300 text-green-950 ring-2 ring-green-500'
                : diff > 0
                ? 'bg-amber-200 text-slate-900'
                : 'bg-rose-200 text-rose-950'
            }`}
          >
            {isScaleBalanced
              ? '⚖️ Seimbang Sempurna (0°)'
              : diff > 0
              ? '⬇️ Kanan Lebih Berat'
              : '⬇️ Kiri Lebih Berat'}
          </div>

          <div className="px-3 py-1.5 bg-white border-2 border-black rounded-xl text-xs font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-slate-800">
            Selisih: {Math.abs(diff)}
          </div>
        </div>

        {/* Center Stage: Pivot, Lever Beam & Hanging Pans */}
        <div className="w-full flex justify-center items-center relative my-auto py-6 sm:py-8 z-10">
          {/* Main Lever Beam */}
          <motion.div
            animate={{
              rotate: tiltAngle,
            }}
            transition={{ type: 'spring', stiffness: 150, damping: 14 }}
            className={`w-full h-5 sm:h-6 bg-slate-900 border-3 border-black rounded-full relative flex justify-between items-center px-2 sm:px-4 shadow-md ${
              isLarge ? 'max-w-xl sm:max-w-2xl' : 'max-w-md sm:max-w-lg md:max-w-xl'
            }`}
          >
            {/* Center Pointer / Level Indicator Needle */}
            <div className="absolute left-1/2 -top-8 -translate-x-1/2 w-3.5 h-10 bg-slate-900 border-x-2 border-t-2 border-black rounded-t-full flex flex-col items-center justify-start pt-1 origin-bottom">
              <div
                className={`w-2.5 h-2.5 rounded-full border-2 border-black transition-colors ${
                  isScaleBalanced ? 'bg-green-400 animate-ping' : 'bg-yellow-400'
                }`}
              />
            </div>

            {/* Left Pan (Piringan Kiri) */}
            <motion.div
              animate={{
                // Counter-rotate pan to keep it hanging vertically plumb
                rotate: -tiltAngle,
              }}
              transition={{ type: 'spring', stiffness: 150, damping: 14 }}
              className="relative top-14 sm:top-18 flex flex-col items-center origin-top -ml-2 sm:-ml-4"
            >
              {/* Pan Suspension Rods */}
              <div className="flex items-center justify-between w-24 sm:w-32 -mt-14 sm:-mt-18 h-14 sm:h-18">
                <div className="w-1 h-full bg-slate-900 border-x border-black" />
                <div className="w-1 h-full bg-slate-900 border-x border-black" />
              </div>

              {/* Pan Tray & Contents */}
              <div
                className={`w-36 sm:w-48 bg-white border-3 border-black rounded-2xl p-2.5 sm:p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center space-y-1.5 transition-all ${
                  isScaleBalanced ? 'ring-3 ring-green-400 bg-green-50' : ''
                }`}
              >
                <div className="flex items-center justify-between text-[10px] sm:text-xs font-black text-blue-900 uppercase">
                  <span>Kiri</span>
                  <span className="bg-blue-100 border border-blue-400 px-1.5 py-0.5 rounded-md text-blue-950 font-black">
                    {currentLeftTotal}
                  </span>
                </div>

                <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                  {/* Interactive Mystery Box Input inside the scale */}
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <input
                        type="number"
                        id="scale-mystery-input"
                        placeholder="?"
                        value={userScaleInput}
                        onChange={e => setUserScaleInput(e.target.value)}
                        className={`w-12 sm:w-16 h-11 sm:h-13 text-center text-base sm:text-xl font-black rounded-xl border-2 sm:border-3 border-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none ${
                          isScaleBalanced
                            ? 'bg-green-300 text-green-950 ring-2 ring-green-500'
                            : 'bg-yellow-200 text-slate-900 focus:bg-yellow-300'
                        }`}
                        title="Ketik angka kotak misteri (?)"
                      />
                      {isScaleBalanced && (
                        <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-0.5 border border-black shadow-xs">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-black text-slate-700 mt-0.5">Kotak (?)</span>
                  </div>

                  <span className="font-black text-slate-800 text-base sm:text-xl font-heading">+</span>

                  {/* Known Left Weight */}
                  <div className="flex flex-col items-center">
                    <div className="w-12 sm:w-16 h-11 sm:h-13 bg-blue-500 border-2 sm:border-3 border-black text-white rounded-xl flex items-center justify-center font-black text-xs sm:text-base shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      {scaleLeftKnown}
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-black text-slate-700 mt-0.5">Beban</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Pan (Piringan Kanan) */}
            <motion.div
              animate={{
                // Counter-rotate pan to keep it hanging vertically plumb
                rotate: -tiltAngle,
              }}
              transition={{ type: 'spring', stiffness: 150, damping: 14 }}
              className="relative top-14 sm:top-18 flex flex-col items-center origin-top -mr-2 sm:-mr-4"
            >
              {/* Pan Suspension Rods */}
              <div className="flex items-center justify-between w-24 sm:w-32 -mt-14 sm:-mt-18 h-14 sm:h-18">
                <div className="w-1 h-full bg-slate-900 border-x border-black" />
                <div className="w-1 h-full bg-slate-900 border-x border-black" />
              </div>

              {/* Pan Tray & Contents */}
              <div
                className={`w-32 sm:w-44 bg-white border-3 border-black rounded-2xl p-2.5 sm:p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center space-y-1.5 transition-all ${
                  isScaleBalanced ? 'ring-3 ring-green-400 bg-green-50' : ''
                }`}
              >
                <div className="flex items-center justify-between text-[10px] sm:text-xs font-black text-green-900 uppercase">
                  <span>Kanan</span>
                  <span className="bg-green-100 border border-green-400 px-1.5 py-0.5 rounded-md text-green-950 font-black">
                    {currentRightTotal}
                  </span>
                </div>

                <div className="flex items-center justify-center">
                  <div className="w-20 sm:w-28 h-11 sm:h-13 bg-green-400 border-2 sm:border-3 border-black text-black rounded-xl flex items-center justify-center font-black text-sm sm:text-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    {scaleRightTotal}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Central Pillar & Base Stand */}
        <div className="w-20 sm:w-24 h-32 sm:h-40 bg-gradient-to-b from-slate-800 to-slate-950 border-3 border-black rounded-t-2xl mx-auto relative flex flex-col items-center justify-between shadow-xl z-0 -mt-12 sm:-mt-16">
          {/* Top Pivot Bearing */}
          <div className="relative -top-4 flex flex-col items-center">
            <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-b-[18px] border-b-yellow-400" />
            <div className="w-8 h-8 rounded-full bg-yellow-400 border-2 border-black -mt-1.5 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-slate-900" />
            </div>
          </div>

          {/* Decorative Pillar Plate */}
          <div className="w-full px-2 space-y-1.5 my-auto">
            <div className="h-0.5 bg-yellow-400/40 rounded-full" />
            <div className="text-[8px] font-black text-yellow-300 text-center tracking-wider">TIANG</div>
            <div className="h-0.5 bg-yellow-400/40 rounded-full" />
          </div>

          {/* Solid Base Plate */}
          <div className="w-48 sm:w-64 h-6 sm:h-7 bg-slate-950 rounded-xl absolute -bottom-1 border-2 border-black shadow-[0px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-around px-3">
            <div className="w-3 h-3 rounded-full bg-yellow-400 border border-black" />
            <div className="h-1.5 w-24 bg-slate-800 rounded-full" />
            <div className="w-3 h-3 rounded-full bg-yellow-400 border border-black" />
          </div>
        </div>
      </div>
    );
  };

  // Render the interactive control console (typing, buttons, adjustments)
  const renderScaleControls = () => {
    return (
      <div className="space-y-4">
        {/* Dynamic Live Feedback Status Bento */}
        <div
          className={`p-4 sm:p-5 rounded-2xl border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all ${
            isScaleBalanced
              ? 'bg-green-100 text-green-950'
              : diff > 0
              ? 'bg-yellow-100 text-yellow-950'
              : 'bg-rose-100 text-rose-950'
          }`}
        >
          <div className="flex items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="font-black text-base sm:text-lg flex items-center gap-2 font-heading">
                {isScaleBalanced ? (
                  <>
                    <CheckCircle2 className="w-6 h-6 text-green-600 fill-green-200" />
                    <span>🎉 HEBAT! TIMBANGAN SEIMBANG SEMPURNA!</span>
                  </>
                ) : diff > 0 ? (
                  <>
                    <Scale className="w-6 h-6 text-yellow-700" />
                    <span>⚖️ Timbangan Miring ke Kanan (Kanan Lebih Berat)</span>
                  </>
                ) : (
                  <>
                    <Scale className="w-6 h-6 text-rose-600" />
                    <span>⚖️ Timbangan Miring ke Kiri (Kiri Terlalu Berat)</span>
                  </>
                )}
              </div>
              <p className="text-xs sm:text-sm font-semibold">
                {isScaleBalanced ? (
                  <>
                    Kotak misteri <strong>? = {expectedAnswer}</strong> membuat sisi kiri ({currentLeftTotal}) sama
                    persis dengan sisi kanan ({currentRightTotal})!
                  </>
                ) : diff > 0 ? (
                  <>
                    Beban kiri baru <strong>{currentLeftTotal}</strong>, sedangkan kanan <strong>{currentRightTotal}</strong>.
                    Masukkan angka lebih besar di kotak (?) agar seimbang!
                  </>
                ) : (
                  <>
                    Beban kiri sudah <strong>{currentLeftTotal}</strong>, melebihi kanan <strong>{currentRightTotal}</strong>.
                    Kurangi angka di kotak (?)!
                  </>
                )}
              </p>
            </div>

            {isScaleBalanced && (
              <span className="hidden sm:inline-block px-3 py-1 bg-green-500 text-white font-black rounded-xl text-xs uppercase shadow-xs">
                Terpecahkan!
              </span>
            )}
          </div>
        </div>

        {/* Input Controls Bento */}
        <div className="bg-white rounded-2xl p-5 border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <label htmlFor="scale-controller-input" className="block text-xs font-black text-slate-900 uppercase">
                Isi Angka Kotak Misteri (?):
              </label>
              <p className="text-xs text-slate-500 font-semibold">
                Timbangan langsung bergerak otomatis saat angka diubah!
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setUserScaleInput('')}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black rounded-xl border-2 border-black flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Kosongkan
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:w-56">
              <input
                id="scale-controller-input"
                type="number"
                min="0"
                placeholder="Masukkan angka..."
                value={userScaleInput}
                onChange={e => setUserScaleInput(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border-3 border-black rounded-xl font-black text-slate-900 text-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:bg-yellow-50"
              />
            </div>

            {/* Quick Increment/Decrement Step Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
              <span className="text-xs font-black text-slate-500 mr-1 hidden sm:inline">Ubah:</span>
              <button
                type="button"
                onClick={() => adjustScaleInput(-50)}
                className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-black rounded-xl border-2 border-black active:translate-y-0.5 transition-all cursor-pointer"
              >
                -50
              </button>
              <button
                type="button"
                onClick={() => adjustScaleInput(-10)}
                className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-black rounded-xl border-2 border-black active:translate-y-0.5 transition-all cursor-pointer"
              >
                -10
              </button>
              <button
                type="button"
                onClick={() => adjustScaleInput(-1)}
                className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-black rounded-xl border-2 border-black active:translate-y-0.5 transition-all cursor-pointer"
              >
                -1
              </button>
              <button
                type="button"
                onClick={() => adjustScaleInput(1)}
                className="px-2.5 py-2 bg-yellow-300 hover:bg-yellow-400 text-black text-xs font-black rounded-xl border-2 border-black active:translate-y-0.5 transition-all cursor-pointer"
              >
                +1
              </button>
              <button
                type="button"
                onClick={() => adjustScaleInput(10)}
                className="px-2.5 py-2 bg-yellow-300 hover:bg-yellow-400 text-black text-xs font-black rounded-xl border-2 border-black active:translate-y-0.5 transition-all cursor-pointer"
              >
                +10
              </button>
              <button
                type="button"
                onClick={() => adjustScaleInput(50)}
                className="px-2.5 py-2 bg-yellow-300 hover:bg-yellow-400 text-black text-xs font-black rounded-xl border-2 border-black active:translate-y-0.5 transition-all cursor-pointer"
              >
                +50
              </button>
            </div>
          </div>
        </div>
      </div>
    );
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
            className={`px-4 py-2.5 rounded-xl font-black text-sm sm:text-base border-2 border-black transition-all flex items-center gap-2 cursor-pointer ${
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
            className={`px-4 py-2.5 rounded-xl font-black text-sm sm:text-base border-2 border-black transition-all flex items-center gap-2 cursor-pointer ${
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
            className={`px-4 py-2.5 rounded-xl font-black text-sm sm:text-base border-2 border-black transition-all flex items-center gap-2 cursor-pointer ${
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-heading flex items-center gap-2">
                <Scale className="w-6 h-6 text-yellow-600" />
                Prinsip Keseimbangan Timbangan
              </h3>
              <p className="text-slate-600 text-sm font-semibold max-w-xl">
                Isi nilai di kotak <strong>(?)</strong> dan lihat timbangan langsung bergoyang hingga kedua sisi seimbang!
              </p>
            </div>

            {/* Tombol Tampilan Luas / Fokus */}
            <button
              id="btn-expand-scale"
              type="button"
              onClick={() => {
                SoundEffects.playClick();
                setIsExpandedScaleView(true);
              }}
              className="px-4 py-2.5 bg-yellow-300 hover:bg-yellow-400 text-black border-2 border-black rounded-xl font-black text-xs sm:text-sm shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none flex items-center gap-2 transition-all cursor-pointer font-heading shrink-0"
              title="Buka tampilan luas untuk hanya fokus pada konsep timbangan"
            >
              <Maximize2 className="w-4 h-4 text-black" />
              <span>Tampilan Luas (Fokus)</span>
            </button>
          </div>

          {/* Equation Banner */}
          <div className="bg-slate-50 border-3 border-black rounded-2xl p-4 text-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <span className="text-xs uppercase tracking-wider text-slate-500 font-black">
              Persamaan Matematika yang Sedang Diuji
            </span>
            <div className="text-2xl sm:text-4xl font-black text-slate-900 font-heading tracking-wide mt-2 flex items-center justify-center gap-3">
              <div
                className={`w-20 sm:w-28 h-12 sm:h-14 rounded-xl border-3 border-black flex items-center justify-center font-heading transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                  isScaleBalanced
                    ? 'bg-green-300 text-green-950 ring-2 ring-green-500'
                    : 'bg-yellow-200 text-slate-900'
                }`}
              >
                {userScaleInput.trim() === '' ? '?' : userScaleInput}
              </div>
              <span className="text-slate-500 font-black">+</span>
              <span className="text-blue-600 font-heading bg-blue-50 border-2 border-black px-3 py-1 rounded-xl">
                {scaleLeftKnown}
              </span>
              <span className="text-slate-500 font-black">=</span>
              <span className="text-green-600 font-heading bg-green-50 border-2 border-black px-3 py-1 rounded-xl">
                {scaleRightTotal}
              </span>
            </div>
          </div>

          {/* Animated Scale Stage (Properly contained and fully visible) */}
          <div className="space-y-3">
            {renderBalanceApparatus(false)}

            {/* Small Neat Randomize Button right below the scale */}
            <div className="flex justify-center items-center">
              <button
                type="button"
                id="btn-random-scale-small"
                onClick={handleRandomizeScale}
                className="px-3.5 py-1.5 bg-yellow-200 hover:bg-yellow-300 text-slate-900 border-2 border-black rounded-xl text-xs font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none flex items-center gap-1.5 transition-all cursor-pointer font-heading"
                title="Ganti ke kombinasi angka soal yang lain"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-900" />
                <span>Acak Soal Timbangan</span>
              </button>
            </div>
          </div>

          {/* Interactive Controls & Live Physics Engine */}
          {renderScaleControls()}
        </div>
      )}

      {/* Modal / Overlay: Tampilan Luas (Focused Full-Screen Mode) */}
      <AnimatePresence>
        {isExpandedScaleView && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-4 sm:p-6 flex items-center justify-center overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white border-4 border-black rounded-3xl max-w-5xl w-full p-6 sm:p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] space-y-6 my-auto max-h-[92vh] overflow-y-auto"
            >
              {/* Header Tampilan Luas */}
              <div className="flex items-center justify-between border-b-3 border-black pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-yellow-300 border-2 border-black rounded-2xl flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-2xl">
                    ⚖️
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
                      Laboratorium Timbangan Konsep Aljabar
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 font-bold">
                      Mode Fokus: Perhatikan interaksi gerak fisik timbangan secara langsung!
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    SoundEffects.playClick();
                    setIsExpandedScaleView(false);
                  }}
                  className="px-4 py-2 bg-rose-200 hover:bg-rose-300 text-rose-950 border-2 border-black rounded-xl font-black text-xs sm:text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 flex items-center gap-1.5 transition-all cursor-pointer font-heading"
                >
                  <Minimize2 className="w-4 h-4 text-black" />
                  <span>Tutup Tampilan Luas</span>
                </button>
              </div>

              {/* Large Equation Banner */}
              <div className="bg-slate-50 border-3 border-black rounded-2xl p-4 text-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <span className="text-xs uppercase tracking-wider text-slate-500 font-black">
                  Persamaan yang Sedang Diuji
                </span>
                <div className="text-3xl sm:text-5xl font-black text-slate-900 font-heading tracking-wide mt-2 flex items-center justify-center gap-4">
                  <div
                    className={`w-24 sm:w-32 h-14 sm:h-16 rounded-xl border-3 border-black flex items-center justify-center font-heading transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${
                      isScaleBalanced
                        ? 'bg-green-300 text-green-950 ring-4 ring-green-500'
                        : 'bg-yellow-200 text-slate-900'
                    }`}
                  >
                    {userScaleInput.trim() === '' ? '?' : userScaleInput}
                  </div>
                  <span className="text-slate-400 font-black">+</span>
                  <span className="text-blue-600 font-heading bg-blue-50 border-2 border-black px-4 py-1.5 rounded-xl">
                    {scaleLeftKnown}
                  </span>
                  <span className="text-slate-400 font-black">=</span>
                  <span className="text-green-600 font-heading bg-green-50 border-2 border-black px-4 py-1.5 rounded-xl">
                    {scaleRightTotal}
                  </span>
                </div>
              </div>

              {/* Large Balance Apparatus */}
              <div className="space-y-3">
                {renderBalanceApparatus(true)}

                {/* Small Neat Randomize Button right below the scale in expanded mode */}
                <div className="flex justify-center items-center">
                  <button
                    type="button"
                    onClick={handleRandomizeScale}
                    className="px-3.5 py-1.5 bg-yellow-200 hover:bg-yellow-300 text-slate-900 border-2 border-black rounded-xl text-xs font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none flex items-center gap-1.5 transition-all cursor-pointer font-heading"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-900" />
                    <span>Acak Soal Timbangan</span>
                  </button>
                </div>
              </div>

              {/* Controls */}
              {renderScaleControls()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
              className="px-3.5 py-2 bg-yellow-300 hover:bg-yellow-400 text-black text-xs sm:text-sm font-black rounded-xl flex items-center gap-1.5 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
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
              className={`p-3 rounded-2xl font-black text-xs sm:text-sm text-center transition-all border-2 border-black cursor-pointer ${
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
              className={`p-3 rounded-2xl font-black text-xs sm:text-sm text-center transition-all border-2 border-black cursor-pointer ${
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
              className={`p-3 rounded-2xl font-black text-xs sm:text-sm text-center transition-all border-2 border-black cursor-pointer ${
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
              className="px-8 py-3.5 bg-yellow-400 hover:bg-yellow-500 text-black font-black rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 text-base font-heading cursor-pointer"
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
