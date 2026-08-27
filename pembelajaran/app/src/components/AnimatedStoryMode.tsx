import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { StoryMission } from "../types";
import { STORY_MISSIONS } from "../data/storyMissions";
import { playCorrectSound, playWrongSound, playStarSound, playLevelUpSound } from "../utils/audio";
import confetti from "canvas-confetti";
import { 
  BookOpen, Sparkles, CheckCircle2, ChevronRight, RotateCcw, 
  HelpCircle, Wand2, Lightbulb, PenLine, ArrowRight, Award, Bot
} from "lucide-react";
import { Scratchpad } from "./Scratchpad";

interface AnimatedStoryModeProps {
  onEarnXp: (amount: number, stars: number) => void;
  completedStories: string[];
  studentName: string;
}

export const AnimatedStoryMode: React.FC<AnimatedStoryModeProps> = ({
  onEarnXp,
  completedStories,
  studentName,
}) => {
  const [missionsList, setMissionsList] = useState<StoryMission[]>(STORY_MISSIONS);
  const [activeMissionIndex, setActiveMissionIndex] = useState<number>(0);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1); // 1: Story, 2: Equation Building, 3: Solving, 4: Celebration
  const [userEquationChoice, setUserEquationChoice] = useState<string>("");
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [answerResult, setAnswerResult] = useState<"correct" | "wrong" | null>(null);
  const [isScratchpadOpen, setIsScratchpadOpen] = useState(false);
  const [customTheme, setCustomTheme] = useState("Toko Mainan");
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [showAiCreator, setShowAiCreator] = useState(false);

  const currentMission = missionsList[activeMissionIndex] || missionsList[0];

  const handleSelectMission = (idx: number) => {
    setActiveMissionIndex(idx);
    setCurrentStep(1);
    setUserEquationChoice("");
    setUserAnswer("");
    setAnswerResult(null);
  };

  const handleCheckEquation = (chosen: string) => {
    setUserEquationChoice(chosen);
    if (chosen === currentMission.equation) {
      playCorrectSound();
      setCurrentStep(3); // Proceed to solving
    } else {
      playWrongSound();
    }
  };

  const handleCheckAnswer = () => {
    const num = parseInt(userAnswer, 10);
    if (isNaN(num)) return;

    if (num === currentMission.missingValue) {
      setAnswerResult("correct");
      playCorrectSound();
      playLevelUpSound();
      playStarSound();
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.5 },
      });
      onEarnXp(150, 3);
      setCurrentStep(4);
    } else {
      setAnswerResult("wrong");
      playWrongSound();
    }
  };

  const handleGenerateAiStory = async () => {
    setIsGeneratingStory(true);
    try {
      const res = await fetch("/api/ai/generate-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: studentName || "Detektif Cilik",
          theme: customTheme,
          difficulty: "medium",
        }),
      });
      const data = await res.json();
      if (data && data.story) {
        const newMission: StoryMission = {
          id: `custom_${Date.now()}`,
          title: `Misi ${customTheme} Bersama ${studentName || "Detektif"}`,
          theme: "custom",
          character: studentName || "Detektif Cilik",
          characterAvatar: data.itemIcon || "🌟",
          bgGradient: "from-purple-600/20 via-pink-500/10 to-rose-500/20",
          itemEmoji: data.itemIcon || "🎁",
          storyText: data.story,
          num1: data.num1 || 678,
          num2: data.num2 || 243,
          operation: data.operation || "-",
          unknownPos: data.unknownPos || "second",
          missingValue: data.missingValue || 435,
          equation: data.equation || "678 - ... = 243",
          questionPrompt: `Berapakah bilangan misteri pada misi ${customTheme}?`,
          initialItemsCount: data.num1 || 678,
          finalItemsCount: data.num2 || 243,
          explanation: data.stepExplanation || "Hitung dengan operasi kebalikan!",
          animationType: "take_away",
        };
        setMissionsList((prev) => [newMission, ...prev]);
        setActiveMissionIndex(0);
        setCurrentStep(1);
        setUserEquationChoice("");
        setUserAnswer("");
        setAnswerResult(null);
        setShowAiCreator(false);
        playStarSound();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingStory(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Header Banner - Emerald Theme with border-b-8 */}
      <div className="bg-emerald-400 rounded-[32px] sm:rounded-[36px] p-6 sm:p-8 text-slate-900 shadow-lg border-b-8 border-emerald-600 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-900/15 text-emerald-950 text-xs font-black tracking-wide mb-2 border border-emerald-500/30">
            <BookOpen size={14} /> SOAL CERITA BERANIMASI
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Petualangan Cerita & Aljabar Dasar
          </h2>
          <p className="text-slate-800 text-xs sm:text-sm mt-1 max-w-xl font-bold">
            Selesaikan misi cerita beranimasi. Amati perubahan benda, temukan bilangan yang hilang, dan raih Bintang Prestasi!
          </p>
        </div>

        <button
          onClick={() => setShowAiCreator(!showAiCreator)}
          className="px-5 py-3 rounded-2xl bg-white text-slate-900 hover:bg-sky-50 border-2 border-emerald-300 font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center gap-2 shrink-0"
        >
          <Wand2 className="text-orange-500" size={18} />
          <span>{showAiCreator ? "Tutup Generator" : "Buat Soal AI Sendiri"}</span>
        </button>
      </div>

      {/* AI Story Generator Drawer (Collapsible) */}
      <AnimatePresence>
        {showAiCreator && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-[32px] p-6 border-4 border-emerald-300 shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Bot className="text-emerald-600" size={24} />
                <h3 className="font-black text-slate-900 text-base sm:text-lg">
                  Generator Soal Cerita AI Kustom
                </h3>
              </div>
              <span className="text-xs font-bold text-slate-500">Pilih / Ketik tema kesukaanmu!</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-xs font-black text-slate-700 block mb-1.5 uppercase tracking-wider">
                  Pilih Tema Cerita:
                </label>
                <div className="flex gap-2 flex-wrap">
                  {["Toko Kue", "Kebun Apel", "Luar Angkasa", "Dinosaurus", "Taman Bermain"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setCustomTheme(t)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-black border-2 transition-all cursor-pointer ${
                        customTheme === t
                          ? "bg-emerald-500 text-white border-emerald-700 shadow-xs"
                          : "bg-sky-50 text-slate-700 hover:bg-sky-100 border-sky-100"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleGenerateAiStory}
                  disabled={isGeneratingStory}
                  className="w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 border-b-4 border-orange-700 text-white rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md disabled:opacity-50 cursor-pointer active:mt-1 active:border-b-0"
                >
                  {isGeneratingStory ? (
                    <span>Sedang Membuat Cerita...</span>
                  ) : (
                    <>
                      <Wand2 size={16} /> Buat Cerita Sekarang!
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mission Selector Carousel */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
        {missionsList.map((m, idx) => {
          const isDone = completedStories.includes(m.id);
          const isCurrent = activeMissionIndex === idx;
          return (
            <button
              key={m.id}
              onClick={() => handleSelectMission(idx)}
              className={`flex items-center gap-3.5 px-5 py-3.5 rounded-[24px] border-3 transition-all cursor-pointer shrink-0 text-left ${
                isCurrent
                  ? "bg-sky-500 text-white border-sky-700 shadow-md border-b-4"
                  : "bg-white text-slate-700 hover:bg-sky-50 border-sky-200 shadow-2xs"
              }`}
            >
              <span className="text-3xl">{m.characterAvatar}</span>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-black uppercase tracking-wider ${isCurrent ? "text-sky-100" : "text-sky-500"}`}>
                    Misi #{idx + 1}
                  </span>
                  {isDone && <span className="text-xs">⭐</span>}
                </div>
                <h4 className="font-black text-xs sm:text-sm whitespace-nowrap">{m.title}</h4>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Story Arena Card (Matching Vibrant Palette Design Spec) */}
      <div className="bg-white rounded-[36px] sm:rounded-[40px] border-4 border-sky-200 shadow-xl overflow-hidden">
        {/* Stage Header with Step Badges */}
        <div className="bg-sky-50/80 px-6 sm:px-8 py-4 border-b-2 border-sky-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="bg-pink-500 text-white text-xs font-black px-4 py-1 rounded-full uppercase tracking-widest shadow-xs">
              Misi Cerita
            </span>
            <h3 className="font-black text-slate-900 text-base sm:text-lg">
              {currentMission.title}
            </h3>
          </div>

          {/* Stepper Indicator */}
          <div className="flex items-center gap-2 text-xs font-black">
            <span className={`px-3 py-1 rounded-full ${currentStep >= 1 ? "bg-sky-500 text-white shadow-2xs" : "bg-slate-200 text-slate-600"}`}>
              1. Cerita
            </span>
            <ChevronRight size={14} className="text-slate-400" />
            <span className={`px-3 py-1 rounded-full ${currentStep >= 2 ? "bg-sky-500 text-white shadow-2xs" : "bg-slate-200 text-slate-600"}`}>
              2. Kalimat Math
            </span>
            <ChevronRight size={14} className="text-slate-400" />
            <span className={`px-3 py-1 rounded-full ${currentStep >= 3 ? "bg-sky-500 text-white shadow-2xs" : "bg-slate-200 text-slate-600"}`}>
              3. Pecahkan
            </span>
          </div>
        </div>

        {/* Dynamic Animated Scene */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Animated Illustration Stage */}
          <div className="w-full rounded-3xl bg-sky-50/70 p-6 sm:p-8 border-2 border-sky-200 relative overflow-hidden flex flex-col md:flex-row items-center gap-6 sm:gap-8">
            {/* Character Circular Bubble */}
            <div className="w-32 h-32 sm:w-40 sm:h-40 bg-orange-100 rounded-full flex-shrink-0 flex items-center justify-center border-4 border-orange-200 shadow-inner">
              <span className="text-6xl sm:text-7xl">{currentMission.characterAvatar}</span>
            </div>

            {/* Story Text Box with Highlighted Math Clues */}
            <div className="flex-1 space-y-3">
              <p className="text-base sm:text-xl font-bold leading-relaxed text-slate-700">
                {currentMission.storyText}
              </p>

              {/* Equation Clue Pill Box */}
              <div className="bg-white p-3.5 sm:p-4 rounded-2xl border-2 border-dashed border-sky-300 inline-block shadow-2xs">
                <p className="text-xl sm:text-2xl font-black tracking-widest text-sky-800 font-mono">
                  {currentMission.num1} {currentMission.operation} <span className="text-pink-500 underline decoration-4 underline-offset-8"> ? </span> = {currentMission.num2}
                </p>
              </div>

              <div className="text-xs font-black text-sky-700 flex items-center gap-1.5">
                <Lightbulb size={16} className="text-amber-500" />
                <span>{currentMission.questionPrompt}</span>
              </div>
            </div>
          </div>

          {/* Interactive Steps Controls */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-sky-50 rounded-3xl border-2 border-sky-200"
            >
              <div>
                <h4 className="font-black text-sky-950 text-sm">Sudah membaca dan memahami ceritanya?</h4>
                <p className="text-xs text-sky-800 font-bold">
                  Mari kita susun kalimat matematikanya untuk mencari bilangan yang hilang!
                </p>
              </div>
              <button
                onClick={() => setCurrentStep(2)}
                className="px-6 py-3 bg-orange-500 hover:bg-orange-600 border-b-4 border-orange-700 active:mt-1 active:border-b-0 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md flex items-center gap-2 cursor-pointer"
              >
                <span>Lanjut ke Langkah 2</span>
                <ArrowRight size={16} />
              </button>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 p-6 bg-white rounded-3xl border-4 border-yellow-200 shadow-md"
            >
              <h4 className="font-black text-slate-800 text-sm sm:text-base">
                Langkah 2: Pilih Kalimat Matematika yang Tepat Berdasarkan Cerita:
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {[
                  currentMission.equation,
                  `${currentMission.num1} + ... = ${currentMission.num2}`,
                  `... - ${currentMission.num2} = ${currentMission.num1}`,
                ].map((eqOption, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleCheckEquation(eqOption)}
                    className={`p-4 rounded-2xl border-3 font-mono font-black text-lg transition-all cursor-pointer ${
                      userEquationChoice === eqOption
                        ? eqOption === currentMission.equation
                          ? "bg-emerald-100 border-emerald-500 text-emerald-950 shadow-md"
                          : "bg-pink-100 border-pink-500 text-pink-950"
                        : "bg-sky-50 border-sky-200 text-slate-800 hover:border-sky-400 hover:bg-sky-100"
                    }`}
                  >
                    {eqOption}
                  </button>
                ))}
              </div>

              {userEquationChoice && userEquationChoice !== currentMission.equation && (
                <div className="text-xs text-pink-600 font-black">
                  ⚠️ Pilihan tersebut belum tepat dengan jalan cerita. Perhatikan apakah jumlahnya berkurang (-) atau bertambah (+)!
                </div>
              )}
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5 p-6 bg-sky-50 rounded-3xl border-3 border-sky-300 shadow-md"
            >
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-sky-700">Langkah 3: Hitung Bilangan Misteri</span>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-sky-950 mt-0.5">
                    {currentMission.equation}
                  </div>
                </div>

                <button
                  onClick={() => setIsScratchpadOpen(true)}
                  className="px-4 py-2.5 bg-yellow-400 hover:bg-yellow-500 border-b-3 border-yellow-600 text-slate-900 font-black text-xs rounded-2xl shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <PenLine size={16} /> Buka Papan Oret-Oretan
                </button>
              </div>

              {/* Input Answer Box */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative w-full sm:w-64">
                  <input
                    id="story-answer-input"
                    type="number"
                    placeholder="Masukkan angka..."
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCheckAnswer()}
                    className="w-full px-4 py-3 bg-white border-3 border-sky-300 focus:border-sky-600 rounded-2xl text-xl font-mono font-black text-slate-800 outline-none shadow-xs"
                  />
                </div>

                <button
                  id="submit-story-answer-btn"
                  onClick={handleCheckAnswer}
                  disabled={!userAnswer}
                  className="w-full sm:w-auto px-7 py-3 bg-orange-500 hover:bg-orange-600 border-b-4 border-orange-700 active:mt-1 active:border-b-0 text-white font-black text-sm rounded-2xl shadow-md disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={18} /> Periksa Jawaban
                </button>
              </div>

              {answerResult === "wrong" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 bg-pink-100 border-2 border-pink-300 rounded-2xl text-xs text-pink-950 font-bold"
                >
                  Jawabanmu masih belum tepat. Gunakan rumus kebalikan dan papan oret-oretan untuk menghitung bersusun ya!
                </motion.div>
              )}
            </motion.div>
          )}

          {currentStep === 4 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 bg-gradient-to-r from-yellow-50 via-emerald-50 to-sky-50 rounded-[32px] border-4 border-emerald-300 space-y-4 text-center shadow-lg"
            >
              <div className="w-20 h-20 bg-emerald-500 text-white rounded-3xl flex items-center justify-center mx-auto text-4xl shadow-lg border-2 border-emerald-300 transform -rotate-3">
                🏆
              </div>
              <div>
                <h4 className="text-2xl font-black text-slate-900">LUAR BIASA! MISI BERHASIL!</h4>
                <p className="text-sm text-slate-600 max-w-md mx-auto mt-1 font-bold">
                  Bilangan yang hilang adalah <strong className="text-sky-700 text-lg font-mono">{currentMission.missingValue}</strong>! (+150 XP & ⭐ 3 Bintang)
                </p>
              </div>

              {/* Mathematical Explanation Box */}
              <div className="bg-white p-5 rounded-2xl border-2 border-emerald-200 text-xs sm:text-sm text-emerald-950 font-bold max-w-lg mx-auto text-left shadow-xs">
                <span className="font-black text-emerald-800 block mb-1">💡 Penjelasan Detektif:</span>
                <p className="leading-relaxed">{currentMission.explanation}</p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-3">
                <button
                  onClick={() => {
                    const nextIdx = (activeMissionIndex + 1) % missionsList.length;
                    handleSelectMission(nextIdx);
                  }}
                  className="px-7 py-3 bg-emerald-500 hover:bg-emerald-600 border-b-4 border-emerald-700 active:mt-1 active:border-b-0 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md cursor-pointer flex items-center gap-2"
                >
                  <span>Misi Berikutnya</span>
                  <ChevronRight size={18} />
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Digital Scratchpad Component */}
      <Scratchpad
        isOpen={isScratchpadOpen}
        onClose={() => setIsScratchpadOpen(false)}
        initialEquation={currentMission.equation}
      />
    </div>
  );
};
