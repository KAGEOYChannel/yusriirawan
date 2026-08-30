import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Layers,
  CheckCircle2,
  HelpCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Calculator,
  ChevronRight,
} from 'lucide-react';
import { SoundEffects } from '../../utils/sound';
import { triggerConfetti } from '../../utils/confetti';

interface TantanganBersusunProps {
  onUnlockBadge?: (badgeId: string) => void;
  onRewardScore?: (points: number, stars: number) => void;
}

interface StepItem {
  prompt: string;
  expectedVal: number;
  tulis: number;
  simpan: number;
  hint: string;
}

interface BersusunScenario {
  id: string;
  numA: number;
  numB: number;
  steps: StepItem[];
  finalResult: number;
}

const SCENARIOS: BersusunScenario[] = [
  {
    id: 'soal-347-6',
    numA: 347,
    numB: 6,
    finalResult: 2082,
    steps: [
      {
        prompt: 'Langkah 1 (Satuan): 7 × 6 = [ ? ]',
        expectedVal: 42,
        tulis: 2,
        simpan: 4,
        hint: '7 × 6 = 42. Tulis 2 pada satuan, lalu simpan 4 di atas puluhan.',
      },
      {
        prompt: 'Langkah 2 (Puluhan): (4 × 6) + simpanan 4 = [ ? ]',
        expectedVal: 28,
        tulis: 8,
        simpan: 2,
        hint: '4 × 6 = 24. Ditambah simpanan 4 menjadi 28. Tulis 8 pada puluhan, simpan 2 di atas ratusan.',
      },
      {
        prompt: 'Langkah 3 (Ratusan): (3 × 6) + simpanan 2 = [ ? ]',
        expectedVal: 20,
        tulis: 20,
        simpan: 0,
        hint: '3 × 6 = 18. Ditambah simpanan 2 menjadi 20. Karena sudah digit terakhir, langsung tulis 20.',
      },
    ],
  },
  {
    id: 'soal-177-8',
    numA: 177,
    numB: 8,
    finalResult: 1416,
    steps: [
      {
        prompt: 'Langkah 1 (Satuan): 7 × 8 = [ ? ]',
        expectedVal: 56,
        tulis: 6,
        simpan: 5,
        hint: '7 × 8 = 56. Tulis 6, simpan 5 di atas puluhan.',
      },
      {
        prompt: 'Langkah 2 (Puluhan): (7 × 8) + simpanan 5 = [ ? ]',
        expectedVal: 61,
        tulis: 1,
        simpan: 6,
        hint: '7 × 8 = 56. Ditambah simpanan 5 menjadi 61. Tulis 1, simpan 6.',
      },
      {
        prompt: 'Langkah 3 (Ratusan): (1 × 8) + simpanan 6 = [ ? ]',
        expectedVal: 14,
        tulis: 14,
        simpan: 0,
        hint: '1 × 8 = 8. Ditambah simpanan 6 menjadi 14. Langsung tulis 14.',
      },
    ],
  },
  {
    id: 'soal-428-5',
    numA: 428,
    numB: 5,
    finalResult: 2140,
    steps: [
      {
        prompt: 'Langkah 1 (Satuan): 8 × 5 = [ ? ]',
        expectedVal: 40,
        tulis: 0,
        simpan: 4,
        hint: '8 × 5 = 40. Tulis 0 pada satuan, simpan 4 di atas puluhan.',
      },
      {
        prompt: 'Langkah 2 (Puluhan): (2 × 5) + simpanan 4 = [ ? ]',
        expectedVal: 14,
        tulis: 4,
        simpan: 1,
        hint: '2 × 5 = 10. Ditambah simpanan 4 menjadi 14. Tulis 4, simpan 1 di atas ratusan.',
      },
      {
        prompt: 'Langkah 3 (Ratusan): (4 × 5) + simpanan 1 = [ ? ]',
        expectedVal: 21,
        tulis: 21,
        simpan: 0,
        hint: '4 × 5 = 20. Ditambah simpanan 1 menjadi 21. Langsung tulis 21.',
      },
    ],
  },
];

export const PerkalianTantanganBersusun: React.FC<TantanganBersusunProps> = ({
  onUnlockBadge,
  onRewardScore,
}) => {
  const [selectedScenarioIdx, setSelectedScenarioIdx] = useState<number>(0);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [userValInput, setUserValInput] = useState<string>('');
  const [completedSteps, setCompletedSteps] = useState<{ stepNum: number; answer: number }[]>([]);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string; hint?: string } | null>(null);

  const scenario = SCENARIOS[selectedScenarioIdx];
  const step = scenario.steps[currentStepIdx];
  const isAllDone = completedSteps.length === scenario.steps.length;

  const handleSelectScenario = (idx: number) => {
    SoundEffects.playClick();
    setSelectedScenarioIdx(idx);
    setCurrentStepIdx(0);
    setUserValInput('');
    setCompletedSteps([]);
    setFeedback(null);
  };

  const handleCheckStep = () => {
    const parsed = parseInt(userValInput, 10);
    if (isNaN(parsed)) return;

    if (parsed === step.expectedVal) {
      SoundEffects.playCorrect();
      const updated = [...completedSteps, { stepNum: currentStepIdx + 1, answer: parsed }];
      setCompletedSteps(updated);
      setUserValInput('');
      setFeedback({
        isCorrect: true,
        message: `🎉 Tepat! Hasilnya ${parsed} (Tulis ${step.tulis}${step.simpan > 0 ? `, simpan ${step.simpan}` : ''}).`,
      });

      if (currentStepIdx < scenario.steps.length - 1) {
        setCurrentStepIdx(prev => prev + 1);
      } else {
        triggerConfetti();
        onUnlockBadge?.('ahli-bersusun');
        onRewardScore?.(25, 2);
      }
    } else {
      SoundEffects.playWrong();
      setFeedback({
        isCorrect: false,
        message: 'Belum tepat. Coba periksa perkalian dan penjumlahan simpanannya.',
        hint: step.hint,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Selector Card */}
      <div className="bg-white border-4 border-black rounded-3xl p-5 sm:p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-black uppercase text-slate-500">Pilih Soal Tantangan Bersusun:</div>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            {SCENARIOS.map((sc, idx) => (
              <button
                key={sc.id}
                onClick={() => handleSelectScenario(idx)}
                className={`px-3 py-1.5 rounded-xl border-2 border-black font-black text-xs transition-all cursor-pointer ${
                  selectedScenarioIdx === idx
                    ? 'bg-yellow-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5'
                    : 'bg-slate-100 hover:bg-yellow-100'
                }`}
              >
                {sc.numA} × {sc.numB}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase text-slate-500">Proses:</span>
          <span className="px-3 py-1 bg-purple-100 border-2 border-black rounded-xl font-black text-sm text-purple-900 font-heading">
            {completedSteps.length} / {scenario.steps.length} Langkah
          </span>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="bg-white border-4 border-black rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: Vertical Form Graphic */}
          <div className="md:col-span-5 bg-yellow-50 border-3 border-black rounded-2xl p-6 flex flex-col items-center justify-center space-y-4">
            <div className="font-heading text-center">
              <div className="text-xs font-black uppercase text-slate-500 mb-2">Bentuk Bersusun</div>
              <div className="font-mono text-4xl font-black tracking-widest text-slate-900">
                <div className="pr-4">{scenario.numA}</div>
                <div className="flex items-center justify-end gap-3">
                  <span className="text-2xl text-slate-400">×</span>
                  <span className="pr-4 text-blue-600">{scenario.numB}</span>
                </div>
                <div className="w-full h-1.5 bg-black my-1" />
                <div className="text-emerald-700 pr-4">
                  {isAllDone ? scenario.finalResult.toLocaleString('id-ID') : '...'}
                </div>
              </div>
            </div>

            {isAllDone && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-emerald-300 border-2 border-black rounded-xl p-3.5 text-center w-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                <div className="text-xs font-black uppercase text-emerald-950">Hasil Akhir Selesai:</div>
                <div className="text-2xl font-black text-emerald-950 font-heading mt-0.5">
                  {scenario.finalResult.toLocaleString('id-ID')}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column: Step Completion Steps */}
          <div className="md:col-span-7 space-y-4">
            <div className="text-xs font-black uppercase text-slate-500">
              Selesaikan Langkah Per Langkah:
            </div>

            {/* List of steps */}
            <div className="space-y-3">
              {scenario.steps.map((st, sIdx) => {
                const isStepCompleted = completedSteps.some(c => c.stepNum === sIdx + 1);
                const isCurrentActive = currentStepIdx === sIdx && !isAllDone;

                return (
                  <div
                    key={sIdx}
                    className={`border-2 border-black rounded-2xl p-4 transition-all ${
                      isCurrentActive
                        ? 'bg-purple-100 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ring-2 ring-purple-400'
                        : isStepCompleted
                        ? 'bg-green-50'
                        : 'bg-slate-50 opacity-40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-sm text-slate-900 font-heading flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center">
                          {sIdx + 1}
                        </span>
                        <span>{st.prompt}</span>
                      </span>
                      {isStepCompleted && (
                        <span className="text-xs font-black bg-green-200 text-green-950 border border-green-500 px-2 py-0.5 rounded-md">
                          ✓ Selesai ({st.expectedVal})
                        </span>
                      )}
                    </div>

                    {isCurrentActive && (
                      <div className="mt-3 flex items-center gap-2">
                        <input
                          type="number"
                          value={userValInput}
                          onChange={e => setUserValInput(e.target.value)}
                          placeholder="Isi Hasil"
                          className="w-32 px-3 py-2 bg-white border-2 border-black rounded-xl font-black text-lg text-center"
                          autoFocus
                        />
                        <button
                          onClick={handleCheckStep}
                          className="px-4 py-2 bg-yellow-300 hover:bg-yellow-400 border-2 border-black rounded-xl font-black text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer font-heading flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Simpan Langkah</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Feedback box */}
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-xl border-2 border-black ${
                  feedback.isCorrect ? 'bg-green-100 text-green-950' : 'bg-rose-100 text-rose-950'
                }`}
              >
                <div className="font-bold text-xs sm:text-sm">{feedback.message}</div>
                {feedback.hint && (
                  <p className="text-xs font-semibold text-slate-800 bg-white/80 p-2.5 rounded-lg border border-black/10 mt-1.5">
                    💡 <strong>Petunjuk:</strong> {feedback.hint}
                  </p>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
