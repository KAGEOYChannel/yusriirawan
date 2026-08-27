import React, { useState } from "react";
import { motion } from "motion/react";
import { Scale, Sparkles, HelpCircle, CheckCircle2, ArrowRight, RotateCcw, Lightbulb, Play, Layers } from "lucide-react";
import { playCorrectSound, playWrongSound, playStarSound } from "../utils/audio";
import confetti from "canvas-confetti";

interface ExampleEquation {
  id: string;
  name: string;
  template: string;
  num1: number;
  num2: number;
  operation: "+" | "-";
  unknownPos: "first" | "second";
  correctUnknown: number;
  conceptText: string;
  inverseFormula: string;
}

const PRESET_EXAMPLES: ExampleEquation[] = [
  {
    id: "ex1",
    name: "Pengurangan (Contoh Utama)",
    template: "678 - ... = 243",
    num1: 678,
    num2: 243,
    operation: "-",
    unknownPos: "second",
    correctUnknown: 435,
    conceptText: "Awalnya ada 678, dibuang sebanyak [ ? ], sisanya harus seimbang dengan 243.",
    inverseFormula: "[ ? ] = 678 - 243 = 435",
  },
  {
    id: "ex2",
    name: "Penjumlahan Bilangan Awal",
    template: "... + 135 = 450",
    num1: 135,
    num2: 450,
    operation: "+",
    unknownPos: "first",
    correctUnknown: 315,
    conceptText: "Ada kotak misteri [ ? ] ditambah 135 agar seimbang dengan 450 di sisi kanan.",
    inverseFormula: "[ ? ] = 450 - 135 = 315",
  },
  {
    id: "ex3",
    name: "Pengurangan Bilangan Awal",
    template: "... - 85 = 120",
    num1: 85,
    num2: 120,
    operation: "-",
    unknownPos: "first",
    correctUnknown: 205,
    conceptText: "Kotak misteri [ ? ] dikurangi 85 menyisakan 120 di timbangan.",
    inverseFormula: "[ ? ] = 120 + 85 = 205",
  },
  {
    id: "ex4",
    name: "Penjumlahan Bilangan Kedua",
    template: "240 + ... = 600",
    num1: 240,
    num2: 600,
    operation: "+",
    unknownPos: "second",
    correctUnknown: 360,
    conceptText: "Beban 240 ditambah isi kotak misteri [ ? ] harus pas seimbang dengan 600.",
    inverseFormula: "[ ? ] = 600 - 240 = 360",
  },
];

export const BalanceScaleVisualizer: React.FC = () => {
  const [selectedExample, setSelectedExample] = useState<ExampleEquation>(PRESET_EXAMPLES[0]);
  const [userGuess, setUserGuess] = useState<string>("");
  const [testResult, setTestResult] = useState<"balanced" | "left_heavier" | "right_heavier" | null>(null);
  const [activeStep, setActiveStep] = useState<number>(1);
  const [showExplanation, setShowExplanation] = useState<boolean>(true);

  const numGuess = parseInt(userGuess, 10);

  // Calculate weights
  let leftWeight = 0;
  const rightWeight = selectedExample.num2;

  if (selectedExample.operation === "-") {
    if (selectedExample.unknownPos === "second") {
      // 678 - [ ? ] vs 243
      leftWeight = !isNaN(numGuess) ? selectedExample.num1 - numGuess : selectedExample.num1;
    } else {
      // [ ? ] - 85 vs 120
      leftWeight = !isNaN(numGuess) ? numGuess - selectedExample.num1 : 0;
    }
  } else {
    // "+"
    if (selectedExample.unknownPos === "second") {
      // 240 + [ ? ] vs 600
      leftWeight = !isNaN(numGuess) ? selectedExample.num1 + numGuess : selectedExample.num1;
    } else {
      // [ ? ] + 135 vs 450
      leftWeight = !isNaN(numGuess) ? numGuess + selectedExample.num1 : selectedExample.num1;
    }
  }

  // Tilt angle in degrees (-15 to 15)
  let tiltAngle = 0;
  if (!isNaN(numGuess) && testResult !== null) {
    const diff = leftWeight - rightWeight;
    if (diff === 0) {
      tiltAngle = 0;
    } else if (diff > 0) {
      tiltAngle = Math.min(12, 3 + diff / 30); // left down
    } else {
      tiltAngle = Math.max(-12, -3 + diff / 30); // right down (left up)
    }
  }

  const handleTestBalance = () => {
    if (isNaN(numGuess)) return;

    if (leftWeight === rightWeight) {
      setTestResult("balanced");
      playCorrectSound();
      playStarSound();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    } else if (leftWeight > rightWeight) {
      setTestResult("left_heavier");
      playWrongSound();
    } else {
      setTestResult("right_heavier");
      playWrongSound();
    }
  };

  const handleSelectExample = (ex: ExampleEquation) => {
    setSelectedExample(ex);
    setUserGuess("");
    setTestResult(null);
    setActiveStep(1);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Introduction Hero Card - Vibrant Emerald Banner */}
      <div className="bg-emerald-400 rounded-[32px] sm:rounded-[36px] p-6 sm:p-8 text-slate-900 shadow-lg border-b-8 border-emerald-600 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-900/15 text-emerald-950 text-xs font-black tracking-wide mb-3 border border-emerald-500/30">
            <Scale size={14} /> KONSEP UTAMA ALJABAR SD
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Timbangan Ajaib: Menemukan Bilangan Misteri
          </h2>
          <p className="text-slate-800 text-sm sm:text-base max-w-2xl mt-2 font-bold leading-relaxed">
            Persamaan matematika sama persis seperti <span className="underline decoration-wavy decoration-emerald-700">timbangan seimbang</span>. Tanda sama dengan (<strong className="text-slate-950 font-black text-lg">=</strong>) artinya piringan kiri dan kanan harus berbobot sama persis!
          </p>
        </div>
        <div className="w-20 h-20 bg-white/30 rounded-3xl flex items-center justify-center text-4xl shadow-inner border-2 border-white/50 shrink-0">
          ⚖️
        </div>
      </div>

      {/* Example Selector Tabs */}
      <div className="flex flex-wrap gap-2.5 items-center bg-white p-3 rounded-3xl border-4 border-sky-200 shadow-sm">
        <span className="text-xs font-black text-sky-800 px-3 flex items-center gap-1.5 uppercase tracking-wider">
          <Layers size={16} className="text-sky-500" /> Pilih Contoh:
        </span>
        {PRESET_EXAMPLES.map((ex) => (
          <button
            key={ex.id}
            onClick={() => handleSelectExample(ex)}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedExample.id === ex.id
                ? "bg-sky-500 text-white border-b-4 border-sky-700 shadow-md transform -translate-y-0.5"
                : "bg-sky-50 text-slate-700 hover:bg-sky-100 border-2 border-sky-100"
            }`}
          >
            <span>{ex.template}</span>
          </button>
        ))}
      </div>

      {/* Main Interactive Stage: The Animated Scale */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* The Balance Scale Canvas & Interactive Controls (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-[36px] p-6 sm:p-8 border-4 border-sky-200 shadow-xl flex flex-col items-center relative overflow-hidden">
          {/* Header of Stage */}
          <div className="w-full flex items-center justify-between border-b-2 border-sky-100 pb-4 mb-4">
            <div>
              <span className="text-[11px] font-black uppercase tracking-widest text-sky-500">Eksperimen Keseimbangan</span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
                {selectedExample.template}
              </h3>
            </div>
            <div className="text-right">
              <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black shadow-2xs ${
                testResult === "balanced"
                  ? "bg-emerald-100 text-emerald-800 border-2 border-emerald-300"
                  : testResult === "left_heavier"
                  ? "bg-orange-100 text-orange-800 border-2 border-orange-300"
                  : testResult === "right_heavier"
                  ? "bg-orange-100 text-orange-800 border-2 border-orange-300"
                  : "bg-sky-50 text-sky-700 border-2 border-sky-200"
              }`}>
                {testResult === "balanced" && <CheckCircle2 size={16} />}
                {testResult === "balanced"
                  ? "🎉 Seimbang Sempurna!"
                  : testResult === "left_heavier"
                  ? "⚖️ Kiri Lebih Berat"
                  : testResult === "right_heavier"
                  ? "⚖️ Kanan Lebih Berat"
                  : "Menunggu Uji Coba"}
              </span>
            </div>
          </div>

          {/* SVG & Motion Scale Visualizer */}
          <div className="w-full h-64 sm:h-72 relative flex items-center justify-center my-2 select-none">
            {/* Fulcrum (Base Stand) */}
            <div className="absolute bottom-6 flex flex-col items-center">
              <div className="w-4 h-24 bg-gradient-to-b from-slate-400 to-slate-600 rounded-t-sm shadow-md" />
              <div className="w-32 h-7 bg-slate-800 rounded-t-2xl shadow-lg border-t-2 border-slate-400" />
            </div>

            {/* Tilting Balance Beam */}
            <motion.div
              animate={{ rotate: tiltAngle }}
              transition={{ type: "spring", stiffness: 120, damping: 14 }}
              className="absolute top-20 w-[86%] sm:w-[78%] h-4 bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-400 rounded-full shadow-md border-2 border-yellow-500 flex items-center justify-between px-2 origin-center"
            >
              {/* Central Pivot Pin */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-800 border-4 border-yellow-300 shadow-md flex items-center justify-center z-20">
                <div className="w-2.5 h-2.5 rounded-full bg-white" />
              </div>

              {/* Left Pan Attachment */}
              <div className="relative -ml-2">
                {/* Chains */}
                <div className="w-0.5 h-20 bg-slate-400 mx-auto" />
                {/* Left Pan */}
                <div className="w-36 sm:w-40 -ml-18 bg-gradient-to-b from-orange-50 to-orange-100 border-4 border-orange-300 rounded-b-3xl p-3 shadow-lg text-center flex flex-col items-center justify-center">
                  <span className="text-[10px] font-black text-orange-700 uppercase tracking-wider">Sisi Kiri</span>
                  <div className="mt-1 flex items-center gap-1.5 font-black text-sm text-slate-800 font-mono">
                    {selectedExample.unknownPos === "second" ? (
                      <>
                        <span className="bg-white px-2 py-1 rounded-xl shadow-2xs border border-orange-200">{selectedExample.num1}</span>
                        <span>{selectedExample.operation}</span>
                        <span className={`px-2.5 py-1 rounded-xl font-black text-white ${userGuess ? "bg-sky-600" : "bg-pink-500 animate-pulse shadow-md"}`}>
                          {userGuess || "?"}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className={`px-2.5 py-1 rounded-xl font-black text-white ${userGuess ? "bg-sky-600" : "bg-pink-500 animate-pulse shadow-md"}`}>
                          {userGuess || "?"}
                        </span>
                        <span>{selectedExample.operation}</span>
                        <span className="bg-white px-2 py-1 rounded-xl shadow-2xs border border-orange-200">{selectedExample.num1}</span>
                      </>
                    )}
                  </div>
                  {!isNaN(numGuess) && (
                    <span className="text-[10px] text-slate-600 mt-1 font-mono font-bold">
                      Bobot: <strong className="text-orange-950">{leftWeight}</strong>
                    </span>
                  )}
                </div>
              </div>

              {/* Right Pan Attachment */}
              <div className="relative -mr-2">
                {/* Chains */}
                <div className="w-0.5 h-20 bg-slate-400 mx-auto" />
                {/* Right Pan */}
                <div className="w-36 sm:w-40 -ml-18 bg-gradient-to-b from-sky-50 to-sky-100 border-4 border-sky-300 rounded-b-3xl p-3 shadow-lg text-center flex flex-col items-center justify-center">
                  <span className="text-[10px] font-black text-sky-700 uppercase tracking-wider">Sisi Kanan</span>
                  <div className="mt-1">
                    <span className="bg-white px-3 py-1 rounded-xl font-black text-sky-950 text-base font-mono shadow-2xs border border-sky-200">
                      {selectedExample.num2}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-600 mt-1 font-mono font-bold">
                    Bobot: <strong className="text-sky-950">{rightWeight}</strong>
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* User Input & Test Section */}
          <div className="w-full bg-sky-50/70 rounded-3xl p-5 border-2 border-sky-200 mt-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-sky-800 mb-2.5">
              Uji Coba Masukkan Angka Misteri [ ? ]:
            </h4>
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <div className="relative w-full sm:w-64">
                <input
                  id="balance-guess-input"
                  type="number"
                  placeholder="Ketik angka misteri..."
                  value={userGuess}
                  onChange={(e) => {
                    setUserGuess(e.target.value);
                    setTestResult(null);
                  }}
                  className="w-full px-4 py-3 bg-white border-3 border-sky-300 focus:border-sky-600 rounded-2xl text-xl font-mono font-black text-slate-800 outline-none shadow-xs transition-all"
                />
              </div>
              <button
                id="test-balance-btn"
                onClick={handleTestBalance}
                disabled={!userGuess}
                className="w-full sm:w-auto px-6 py-3 bg-orange-500 hover:bg-orange-600 border-b-4 border-orange-700 active:mt-1 active:border-b-0 text-white font-black rounded-2xl shadow-lg disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Scale size={18} /> Uji Keseimbangan
              </button>

              <button
                onClick={() => {
                  setUserGuess(selectedExample.correctUnknown.toString());
                  setTestResult(null);
                }}
                className="text-xs font-black text-sky-600 hover:text-sky-800 underline cursor-pointer"
              >
                Kunci Jawaban ({selectedExample.correctUnknown})
              </button>
            </div>

            {/* Feedback Message */}
            {testResult && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-4 p-4 rounded-2xl text-xs sm:text-sm font-bold shadow-xs ${
                  testResult === "balanced"
                    ? "bg-emerald-100 text-emerald-950 border-2 border-emerald-300"
                    : "bg-orange-100 text-orange-950 border-2 border-orange-300"
                }`}
              >
                {testResult === "balanced" ? (
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="text-emerald-600 shrink-0" size={20} />
                    <span>
                      <strong>HEBAT SEKALI!</strong> Angka <strong>{numGuess}</strong> membuat kedua sisi sama persis ({leftWeight} = {rightWeight})!
                    </span>
                  </div>
                ) : testResult === "left_heavier" ? (
                  <div>
                    Nilai di sisi kiri adalah <strong>{leftWeight}</strong>, masih lebih besar dari <strong>{rightWeight}</strong>. Kurangi tebakanmu!
                  </div>
                ) : (
                  <div>
                    Nilai di sisi kiri adalah <strong>{leftWeight}</strong>, masih lebih kecil dari <strong>{rightWeight}</strong>. Tambah tebakanmu!
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* Step-by-Step Mathematical Concept Cards (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-white rounded-[32px] p-6 border-4 border-yellow-300 shadow-xl">
            <div className="flex items-center gap-2 text-amber-900 font-black text-sm mb-2">
              <Lightbulb className="text-amber-500" size={20} />
              <span>Rahasia Detektif Angka</span>
            </div>
            <p className="text-xs text-slate-700 font-bold leading-relaxed">
              {selectedExample.conceptText}
            </p>

            <div className="mt-4 pt-3 border-t-2 border-yellow-200">
              <span className="text-[11px] font-black text-amber-900 uppercase block mb-1.5 tracking-wider">
                Rumus Operasi Kebalikan:
              </span>
              <div className="bg-yellow-50 p-3.5 rounded-2xl border-2 border-yellow-200 font-mono font-black text-sky-700 text-sm sm:text-base text-center shadow-xs">
                {selectedExample.inverseFormula}
              </div>
            </div>
          </div>

          {/* 3 Step Rule Guide for SD Kids */}
          <div className="bg-white rounded-[32px] p-6 border-4 border-sky-200 shadow-xl space-y-3.5">
            <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-sky-500 text-white text-xs flex items-center justify-center font-black">★</span>
              Panduan 3 Langkah Cepat
            </h4>

            <div className="space-y-2.5 text-xs font-medium text-slate-700">
              <div className="p-3 rounded-2xl bg-sky-50/80 border border-sky-100">
                <strong className="text-sky-900 block mb-0.5 font-black">1. Perhatikan Tanda Operasi</strong>
                Apakah penjumlahan (+) atau pengurangan (-)?
              </div>
              <div className="p-3 rounded-2xl bg-sky-50/80 border border-sky-100">
                <strong className="text-sky-900 block mb-0.5 font-black">2. Gunakan Operasi Lawan</strong>
                • Lawan tambah (+) adalah <strong>kurang (-)</strong>.
                <br />
                • Pada <code>A - ? = B</code>, cari dengan <code>? = A - B</code>.
                <br />
                • Pada <code>? - A = B</code>, cari dengan <code>? = B + A</code>.
              </div>
              <div className="p-3 rounded-2xl bg-sky-50/80 border border-sky-100">
                <strong className="text-sky-900 block mb-0.5 font-black">3. Cek Ulang dengan Timbangan</strong>
                Masukkan kembali angka yang kamu temukan ke soal awal untuk memastikan hasilnya benar!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
