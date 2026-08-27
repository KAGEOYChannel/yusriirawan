import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { STORY_PROBLEMS } from '../data/storyProblems';
import { StoryScenario } from '../types';
import { SoundEffects } from '../utils/sound';
import { triggerConfetti } from '../utils/confetti';
import {
  Sparkles,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  HelpCircle,
  Pencil,
  RotateCcw,
  Star,
  Flame,
} from 'lucide-react';

interface AnimatedStoryProps {
  onOpenScratchpad: () => void;
  onRewardScore: (points: number, stars: number) => void;
  onUnlockBadge: (badgeId: string) => void;
}

export const AnimatedStory: React.FC<AnimatedStoryProps> = ({
  onOpenScratchpad,
  onRewardScore,
  onUnlockBadge,
}) => {
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number>(0);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [completedStories, setCompletedStories] = useState<string[]>([]);

  const story: StoryScenario = STORY_PROBLEMS[selectedStoryIndex];

  const handleSelectStory = (index: number) => {
    SoundEffects.playClick();
    setSelectedStoryIndex(index);
    setCurrentStep(0);
    setUserAnswer('');
    setIsAnswerSubmitted(false);
    setIsCorrect(false);
    setShowHint(false);
  };

  const handleNextStep = () => {
    SoundEffects.playClick();
    if (currentStep < story.storySteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    SoundEffects.playClick();
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmitAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(userAnswer.trim(), 10);
    if (isNaN(parsed)) {
      SoundEffects.playWrong();
      return;
    }

    setIsAnswerSubmitted(true);
    if (parsed === story.correctAnswer) {
      setIsCorrect(true);
      SoundEffects.playCorrect();
      triggerConfetti();

      // Check for story-specific badges
      if (story.id === 'kelereng-budi') {
        onUnlockBadge('penakluk-678');
      }

      if (!completedStories.includes(story.id)) {
        const nextCompleted = [...completedStories, story.id];
        setCompletedStories(nextCompleted);
        onRewardScore(50, 2); // 50 points + 2 stars

        if (nextCompleted.length === STORY_PROBLEMS.length) {
          onUnlockBadge('raja-soal-cerita');
        }
      }
    } else {
      setIsCorrect(false);
      SoundEffects.playWrong();
    }
  };

  const handleResetStory = () => {
    SoundEffects.playClick();
    setCurrentStep(0);
    setUserAnswer('');
    setIsAnswerSubmitted(false);
    setIsCorrect(false);
    setShowHint(false);
  };

  // Dynamic visual animation stage for each story type
  const renderVisualStage = () => {
    switch (story.visualType) {
      case 'marbles':
        return (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-6 px-4 bg-gradient-to-b from-amber-100 to-orange-100 rounded-3xl border-2 border-amber-300">
            {/* Toples Besar Budi */}
            <div className="flex flex-col items-center">
              <span className="text-xs font-bold text-amber-900 mb-1">Toples Kelereng</span>
              <div className="w-32 h-44 bg-white/80 border-4 border-amber-400 rounded-b-3xl rounded-t-lg relative flex flex-col justify-end p-2 shadow-inner overflow-hidden">
                <div className="w-full h-3 bg-amber-500 rounded-t-md absolute top-0 left-0" />
                <div className="grid grid-cols-4 gap-1 p-1">
                  {[...Array(16)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ y: [0, -3, 0] }}
                      transition={{ duration: 2, delay: i * 0.1, repeat: Infinity }}
                      className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 shadow-xs border border-white"
                    />
                  ))}
                </div>
                <div className="bg-amber-900/80 text-white text-xs font-bold rounded-lg py-1 text-center mt-1">
                  {currentStep >= 2 ? `${story.finalValue} butir` : `${story.initialValue} butir`}
                </div>
              </div>
            </div>

            {/* Transition Arrow / Mystery Pouch */}
            <div className="flex flex-col items-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-24 h-24 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl border-4 border-purple-300 flex flex-col items-center justify-center text-white shadow-lg p-2"
              >
                <span className="text-2xl">🎒</span>
                <span className="text-xs font-black uppercase mt-1">Saku Rahasia</span>
                <span className="text-sm font-bold bg-white/20 px-2 py-0.5 rounded-md mt-0.5">
                  {isCorrect ? story.correctAnswer : '? butir'}
                </span>
              </motion.div>
            </div>

            {/* Target equation badge */}
            <div className="bg-white/90 p-4 rounded-2xl border-2 border-amber-300 shadow-md text-center">
              <div className="text-xs font-bold text-amber-800 uppercase">Bentuk Persamaan:</div>
              <div className="text-2xl font-black text-amber-950 font-heading mt-1">
                678 - <span className="text-purple-600 underline">...</span> = 243
              </div>
            </div>
          </div>
        );

      case 'apples':
        return (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-6 px-4 bg-gradient-to-b from-emerald-100 to-teal-100 rounded-3xl border-2 border-emerald-300">
            <div className="flex flex-col items-center">
              <span className="text-xs font-bold text-emerald-900 mb-1">Keranjang Awal</span>
              <div className="w-28 h-28 bg-amber-700/80 rounded-2xl border-4 border-amber-800 flex items-center justify-center text-white font-black text-2xl shadow-md">
                {isCorrect ? story.correctAnswer : '? Apel'}
              </div>
            </div>
            <div className="text-3xl font-black text-emerald-800">+</div>
            <div className="flex flex-col items-center">
              <span className="text-xs font-bold text-emerald-900 mb-1">Dipetik Kakek</span>
              <div className="w-28 h-28 bg-rose-500 rounded-2xl border-4 border-rose-600 flex flex-col items-center justify-center text-white font-black text-xl shadow-md">
                <span className="text-2xl">🍎</span>
                <span>+{story.initialValue}</span>
              </div>
            </div>
            <div className="text-3xl font-black text-emerald-800">=</div>
            <div className="flex flex-col items-center">
              <span className="text-xs font-bold text-emerald-900 mb-1">Total Apel</span>
              <div className="w-28 h-28 bg-emerald-600 rounded-2xl border-4 border-emerald-700 flex flex-col items-center justify-center text-white font-black text-xl shadow-md">
                <span className="text-2xl">🧺</span>
                <span>{story.finalValue}</span>
              </div>
            </div>
          </div>
        );

      case 'donuts':
        return (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-6 px-4 bg-gradient-to-b from-pink-100 to-rose-100 rounded-3xl border-2 border-pink-300">
            <div className="flex flex-col items-center">
              <span className="text-xs font-bold text-pink-900 mb-1">Dipanggang Chef</span>
              <div className="w-28 h-28 bg-amber-800 rounded-2xl border-4 border-amber-900 flex flex-col items-center justify-center text-white font-black text-xl shadow-md">
                <span className="text-2xl">🍩</span>
                <span>{story.initialValue}</span>
              </div>
            </div>
            <div className="text-3xl font-black text-pink-800">-</div>
            <div className="flex flex-col items-center">
              <span className="text-xs font-bold text-pink-900 mb-1">Terjual</span>
              <div className="w-28 h-28 bg-rose-500 rounded-2xl border-4 border-rose-600 flex items-center justify-center text-white font-black text-xl shadow-md">
                {isCorrect ? story.correctAnswer : '? Donat'}
              </div>
            </div>
            <div className="text-3xl font-black text-pink-800">=</div>
            <div className="flex flex-col items-center">
              <span className="text-xs font-bold text-pink-900 mb-1">Sisa di Etalase</span>
              <div className="w-28 h-28 bg-pink-600 rounded-2xl border-4 border-pink-700 flex flex-col items-center justify-center text-white font-black text-xl shadow-md">
                <span className="text-2xl">🏬</span>
                <span>{story.finalValue}</span>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-6 px-4 bg-gradient-to-b from-blue-100 to-indigo-100 rounded-3xl border-2 border-blue-300">
            <div className="bg-white p-4 rounded-2xl border-2 border-blue-400 text-center shadow-md">
              <div className="text-xs font-bold text-blue-900 uppercase">Model Matematika:</div>
              <div className="text-2xl sm:text-3xl font-black text-blue-950 font-heading mt-1">
                {story.equationFormula}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Story Selector Bento Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-lg sm:text-xl font-black text-slate-900 font-heading flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-yellow-500" />
            Pilih Petualangan Cerita Matematika:
          </h3>
          <span className="text-xs font-black px-3 py-1 bg-yellow-300 text-black border-2 border-black rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            {completedStories.length}/{STORY_PROBLEMS.length} Selesai
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
          {STORY_PROBLEMS.map((s, idx) => {
            const isCompleted = completedStories.includes(s.id);
            const isSelected = selectedStoryIndex === idx;
            return (
              <button
                key={s.id}
                onClick={() => handleSelectStory(idx)}
                className={`p-3 rounded-2xl text-left transition-all border-2 border-black flex flex-col justify-between h-24 relative overflow-hidden ${
                  isSelected
                    ? 'bg-yellow-300 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-y-1'
                    : 'bg-white text-slate-700 hover:bg-yellow-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-black uppercase">Misi {idx + 1}</span>
                  {isCompleted && (
                    <span className="text-black bg-green-400 border border-black p-0.5 rounded-full">
                      <CheckCircle className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
                <div className="font-black text-xs line-clamp-2 leading-tight font-heading text-slate-900">
                  {s.title}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Story Bento Card */}
      <div className="bg-white border-4 border-black rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col relative overflow-hidden space-y-6">
        {/* Story Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b-2 border-slate-200">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-100 text-purple-800 border-2 border-purple-700 rounded-full text-xs font-black uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{story.character}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
              {story.title}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenScratchpad}
              className="px-3.5 py-2 bg-yellow-300 hover:bg-yellow-400 text-black border-2 border-black rounded-xl font-black text-xs flex items-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all"
            >
              <Pencil className="w-4 h-4 text-black" /> Buka Papan Cakar
            </button>
            <button
              onClick={handleResetStory}
              className="p-2 text-slate-700 bg-white border-2 border-black rounded-xl hover:bg-slate-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all"
              title="Ulangi Cerita"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Narrative Box */}
        <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-5 sm:p-6 text-slate-900 text-base sm:text-lg leading-relaxed font-semibold">
          <div className="bg-white p-5 rounded-2xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            {story.story}
          </div>
        </div>

        {/* Visual Animated Stage */}
        {renderVisualStage()}

        {/* Story Steps Navigator */}
        <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-600">
              Alur Penalaran Konsep (Langkah {currentStep + 1} dari {story.storySteps.length})
            </span>
            <div className="flex gap-1.5">
              {story.storySteps.map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full border border-black transition-all ${
                    currentStep === i ? 'bg-yellow-400 scale-125' : 'bg-white'
                  }`}
                />
              ))}
            </div>
          </div>

          <p className="text-slate-900 font-bold text-sm sm:text-base">
            {story.storySteps[currentStep].text}
          </p>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handlePrevStep}
              disabled={currentStep === 0}
              className="px-3.5 py-1.5 rounded-xl border-2 border-black bg-white text-xs font-black disabled:opacity-30 flex items-center gap-1 text-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Sebelumnya
            </button>
            <button
              onClick={handleNextStep}
              disabled={currentStep === story.storySteps.length - 1}
              className="px-4 py-1.5 rounded-xl bg-yellow-300 hover:bg-yellow-400 text-black border-2 border-black text-xs font-black disabled:opacity-30 flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all"
            >
              Lanjut Langkah <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Interactive Answer Box */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-black text-slate-900 font-heading text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              Mari Cari Bilangan Misterinya!
            </h4>
            <button
              onClick={() => {
                SoundEffects.playClick();
                setShowHint(!showHint);
              }}
              className="text-xs font-black text-slate-900 bg-yellow-100 hover:bg-yellow-200 border border-black px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all"
            >
              <HelpCircle className="w-4 h-4 text-yellow-700" /> {showHint ? 'Tutup Petunjuk' : 'Lihat Petunjuk Trik'}
            </button>
          </div>

          {showHint && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-yellow-100 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-2xl p-4 text-xs sm:text-sm text-slate-900 space-y-1"
            >
              <div className="font-black">💡 Petunjuk Detektif Matematika:</div>
              <div className="font-medium">{story.explanation}</div>
            </motion.div>
          )}

          <form onSubmit={handleSubmitAnswer} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="number"
                placeholder={`Berapakah isi bilangan misteri (${story.equationFormula})?`}
                value={userAnswer}
                onChange={e => setUserAnswer(e.target.value)}
                disabled={isCorrect}
                className="w-full px-5 py-3.5 bg-slate-50 border-3 border-black focus:border-black rounded-2xl font-black text-slate-900 text-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={isCorrect}
              className={`px-8 py-3.5 rounded-2xl font-black text-base transition-all border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2 ${
                isCorrect
                  ? 'bg-green-400 text-black cursor-default'
                  : 'bg-yellow-400 hover:bg-yellow-500 text-black active:translate-y-1 active:shadow-none'
              }`}
            >
              {isCorrect ? (
                <>
                  <CheckCircle className="w-5 h-5 text-black" /> Tepat & Benar!
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-black" /> Jawab Soal Cerita
                </>
              )}
            </button>
          </form>

          {/* Submission Result Announcement */}
          {isAnswerSubmitted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-6 rounded-2xl border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-3 ${
                isCorrect
                  ? 'bg-green-100 text-green-950'
                  : 'bg-rose-100 text-rose-950'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="font-black text-lg sm:text-xl font-heading flex items-center gap-2">
                  {isCorrect ? '🏆 LUAR BIASA! JAWABANMU BENAR!' : '❌ Oops! Belum Tepat'}
                </div>
                {isCorrect && (
                  <div className="flex items-center gap-1 text-black font-black bg-yellow-300 px-3 py-1 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-sm">
                    <Star className="w-4 h-4 fill-yellow-600 text-yellow-600" /> +50 Poin & +2 Bintang!
                  </div>
                )}
              </div>

              <p className="text-sm font-bold leading-relaxed">
                {isCorrect
                  ? `Keren! Kamu berhasil memecahkan misteri ${story.title} dengan nilai ${story.correctAnswer}.`
                  : `Jawaban ${userAnswer} masih belum tepat. Gunakan papan cakar untuk menghitung secara teliti.`}
              </p>

              <div className="bg-white p-3.5 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs sm:text-sm font-black text-slate-900">
                🔍 Pembahasan: {story.explanation}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
