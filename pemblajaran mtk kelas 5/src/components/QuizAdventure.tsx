import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MathProblem, DifficultyLevel } from "../types";
import { PRESET_PROBLEMS, generateRandomProblem } from "../data/curriculumData";
import { playCorrectSound, playWrongSound, playStarSound, playLevelUpSound, playClickSound } from "../utils/audio";
import confetti from "canvas-confetti";
import { 
  Trophy, Flame, Heart, Lightbulb, Bot, PenLine, 
  RotateCcw, ArrowRight, CheckCircle2, XCircle, Sparkles, HelpCircle, Delete
} from "lucide-react";
import { Scratchpad } from "./Scratchpad";

interface QuizAdventureProps {
  onEarnXp: (amount: number, stars: number) => void;
  studentLevel: number;
}

export const QuizAdventure: React.FC<QuizAdventureProps> = ({ onEarnXp, studentLevel }) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>("medium");
  const [problemIndex, setProblemIndex] = useState(0);
  const [currentProblem, setCurrentProblem] = useState<MathProblem>(PRESET_PROBLEMS[6]); // 678 - ... = 243
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [inputKeypadValue, setInputKeypadValue] = useState<string>("");
  const [inputMode, setInputMode] = useState<"choice" | "keypad">("choice");
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  
  // Gamification state
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [roundCompleted, setRoundCompleted] = useState(false);
  const [questionsAnsweredInRound, setQuestionsAnsweredInRound] = useState(0);

  // Modals / Tools
  const [isScratchpadOpen, setIsScratchpadOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  // Initialize questions
  const loadNextQuestion = () => {
    setIsAnswered(false);
    setIsCorrect(false);
    setSelectedAnswer(null);
    setInputKeypadValue("");
    setShowHint(false);
    setAiExplanation(null);

    // Generate or fetch next question
    const newProblem = generateRandomProblem(selectedDifficulty);
    setCurrentProblem(newProblem);
    setProblemIndex((prev) => prev + 1);
  };

  const handleDifficultyChange = (diff: DifficultyLevel) => {
    setSelectedDifficulty(diff);
    setStreak(0);
    setLives(3);
    setScore(0);
    setQuestionsAnsweredInRound(0);
    setRoundCompleted(false);
    const newProblem = generateRandomProblem(diff);
    setCurrentProblem(newProblem);
  };

  const handleAnswer = (answer: number) => {
    if (isAnswered) return;
    setIsAnswered(true);
    setSelectedAnswer(answer);

    const correct = answer === currentProblem.missingValue;
    setIsCorrect(correct);

    if (correct) {
      playCorrectSound();
      playStarSound();
      const newStreak = streak + 1;
      setStreak(newStreak);
      
      // Calculate XP with combo
      const multiplier = newStreak >= 5 ? 3 : newStreak >= 3 ? 2 : 1;
      setComboMultiplier(multiplier);
      const earnedXp = 50 * multiplier;
      setScore((prev) => prev + earnedXp);
      onEarnXp(earnedXp, 1);

      if (newStreak % 3 === 0) {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.6 },
        });
      }
    } else {
      playWrongSound();
      setStreak(0);
      setComboMultiplier(1);
      setLives((prev) => Math.max(0, prev - 1));
    }

    setQuestionsAnsweredInRound((prev) => prev + 1);
    if (questionsAnsweredInRound + 1 >= 5) {
      setTimeout(() => {
        setRoundCompleted(true);
        playLevelUpSound();
      }, 1200);
    }
  };

  const handleKeypadSubmit = () => {
    const val = parseInt(inputKeypadValue, 10);
    if (!isNaN(val)) {
      handleAnswer(val);
    }
  };

  const handleAskAiTutor = async () => {
    setIsLoadingAi(true);
    try {
      const res = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          equation: currentProblem.equation,
          problemText: currentProblem.storyContext,
          unknownPosition: currentProblem.unknownPosition,
          numbers: { num1: currentProblem.num1, num2: currentProblem.num2 },
        }),
      });
      const data = await res.json();
      setAiExplanation(data.explanation);
    } catch (e) {
      setAiExplanation(currentProblem.explanationStep);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const restartRound = () => {
    setLives(3);
    setStreak(0);
    setScore(0);
    setQuestionsAnsweredInRound(0);
    setRoundCompleted(false);
    loadNextQuestion();
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Gamification HUD Bar */}
      <div className="bg-white rounded-3xl p-4 border-4 border-sky-200 shadow-lg flex flex-wrap items-center justify-between gap-4">
        {/* Difficulty level selector */}
        <div className="flex items-center gap-1.5 bg-sky-50 p-1.5 rounded-2xl border border-sky-100">
          {(["easy", "medium", "hard"] as DifficultyLevel[]).map((d) => (
            <button
              key={d}
              onClick={() => handleDifficultyChange(d)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                selectedDifficulty === d
                  ? "bg-sky-500 text-white border-b-3 border-sky-700 shadow-xs transform -translate-y-0.5"
                  : "text-slate-600 hover:text-sky-800"
              }`}
            >
              {d === "easy" ? "🟢 Puluhan" : d === "medium" ? "🟡 Ratusan (678)" : "🔴 Ribuan"}
            </button>
          ))}
        </div>

        {/* Status Badges: Hearts, Streak, XP */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Hearts */}
          <div className="flex items-center gap-1 bg-pink-50 px-3 py-1.5 rounded-full border border-pink-200">
            {[1, 2, 3].map((h) => (
              <Heart
                key={h}
                size={18}
                className={h <= lives ? "text-pink-500 fill-pink-500 animate-pulse" : "text-slate-300"}
              />
            ))}
          </div>

          {/* Streak Combo */}
          <div className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black border-2 ${
            streak > 0 ? "bg-orange-100 border-orange-300 text-orange-900 animate-bounce" : "bg-sky-50 border-sky-100 text-slate-500"
          }`}>
            <Flame size={16} className={streak > 0 ? "text-orange-500 fill-orange-500" : "text-slate-400"} />
            <span>Streak {streak}x {comboMultiplier > 1 && `(x${comboMultiplier})`}</span>
          </div>

          {/* Round Score */}
          <div className="px-3.5 py-1.5 rounded-full bg-yellow-50 text-slate-900 text-xs font-black border-2 border-yellow-300">
            ⭐ {score} XP
          </div>
        </div>
      </div>

      {/* Main Question Arena */}
      {!roundCompleted ? (
        <div className="bg-white rounded-[36px] sm:rounded-[40px] p-6 sm:p-8 border-4 border-sky-200 shadow-xl space-y-6 relative overflow-hidden">
          {/* Top category label & Tools */}
          <div className="flex items-center justify-between border-b-2 border-sky-100 pb-3 flex-wrap gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-sky-800 bg-sky-100 px-3.5 py-1 rounded-full border border-sky-200">
              Tantangan #{questionsAnsweredInRound + 1}/5 • {currentProblem.category}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setInputMode(inputMode === "choice" ? "keypad" : "choice")}
                className="text-xs font-black text-sky-700 hover:text-sky-900 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-xl border border-sky-200 transition-all cursor-pointer"
              >
                {inputMode === "choice" ? "🔢 Mode Papan Angka" : "🔘 Mode Pilihan Ganda"}
              </button>

              <button
                onClick={() => setIsScratchpadOpen(true)}
                className="px-3.5 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-slate-900 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs border-b-2 border-yellow-600"
              >
                <PenLine size={14} /> Papan Oret-Oretan
              </button>
            </div>
          </div>

          {/* Big Equation Card - Vibrant Dashed Box */}
          <div className="py-8 bg-sky-50/80 rounded-3xl border-3 border-dashed border-sky-300 text-center flex flex-col items-center justify-center">
            <span className="text-xs font-black uppercase text-sky-700 tracking-wider mb-3">
              Tentukan Bilangan yang Hilang:
            </span>

            <div className="text-3xl sm:text-5xl font-black font-mono tracking-tight text-slate-900 flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
              {currentProblem.unknownPosition === "first" ? (
                <>
                  <span className="px-4 py-1.5 bg-pink-500 text-white rounded-2xl shadow-md animate-pulse underline decoration-4 underline-offset-8">
                    ?
                  </span>
                  <span className="text-sky-700 font-bold">{currentProblem.operation}</span>
                  <span className="bg-white px-4 py-1.5 rounded-2xl shadow-xs border-2 border-sky-200">
                    {currentProblem.num1}
                  </span>
                  <span className="text-sky-700 font-bold">=</span>
                  <span className="bg-white px-4 py-1.5 rounded-2xl shadow-xs border-2 border-sky-200 text-sky-700">
                    {currentProblem.num2}
                  </span>
                </>
              ) : currentProblem.unknownPosition === "second" ? (
                <>
                  <span className="bg-white px-4 py-1.5 rounded-2xl shadow-xs border-2 border-sky-200">
                    {currentProblem.num1}
                  </span>
                  <span className="text-sky-700 font-bold">{currentProblem.operation}</span>
                  <span className="px-4 py-1.5 bg-pink-500 text-white rounded-2xl shadow-md animate-pulse underline decoration-4 underline-offset-8">
                    ?
                  </span>
                  <span className="text-sky-700 font-bold">=</span>
                  <span className="bg-white px-4 py-1.5 rounded-2xl shadow-xs border-2 border-sky-200 text-sky-700">
                    {currentProblem.num2}
                  </span>
                </>
              ) : (
                <>
                  <span className="bg-white px-4 py-1.5 rounded-2xl shadow-xs border-2 border-sky-200">
                    {currentProblem.num1}
                  </span>
                  <span className="text-sky-700 font-bold">{currentProblem.operation}</span>
                  <span className="bg-white px-4 py-1.5 rounded-2xl shadow-xs border-2 border-sky-200">
                    {currentProblem.num2}
                  </span>
                  <span className="text-sky-700 font-bold">=</span>
                  <span className="px-4 py-1.5 bg-pink-500 text-white rounded-2xl shadow-md animate-pulse underline decoration-4 underline-offset-8">
                    ?
                  </span>
                </>
              )}
            </div>

            {currentProblem.storyContext && (
              <p className="text-xs sm:text-sm text-slate-600 mt-4 max-w-md px-4 font-bold italic">
                "{currentProblem.storyContext}"
              </p>
            )}
          </div>

          {/* Input Answer Section */}
          {inputMode === "choice" ? (
            /* 4 Multiple Choice Grid */
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {currentProblem.options.map((opt, idx) => {
                let btnStyle = "bg-white hover:bg-sky-50 border-3 border-sky-200 text-slate-800";
                if (isAnswered) {
                  if (opt === currentProblem.missingValue) {
                    btnStyle = "bg-emerald-100 border-3 border-emerald-500 text-emerald-950 font-black shadow-md";
                  } else if (selectedAnswer === opt) {
                    btnStyle = "bg-pink-100 border-3 border-pink-500 text-pink-950";
                  } else {
                    btnStyle = "opacity-40 bg-slate-50 border-slate-200";
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswered}
                    onClick={() => handleAnswer(opt)}
                    className={`py-4 px-2 rounded-2xl text-xl sm:text-2xl font-mono font-black transition-all transform hover:scale-[1.02] active:scale-95 cursor-pointer shadow-xs ${btnStyle}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          ) : (
            /* Kids Numeric Keypad */
            <div className="max-w-xs mx-auto space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={inputKeypadValue}
                  placeholder="Ketik angka..."
                  className="w-full text-center py-3 bg-sky-50 border-3 border-sky-300 rounded-2xl text-2xl font-mono font-black text-slate-800 shadow-inner"
                />
                <button
                  onClick={() => setInputKeypadValue((prev) => prev.slice(0, -1))}
                  className="p-3 bg-pink-100 hover:bg-pink-200 text-pink-700 border-2 border-pink-300 rounded-2xl cursor-pointer font-bold"
                >
                  <Delete size={22} />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
                  <button
                    key={num}
                    onClick={() => {
                      playClickSound();
                      setInputKeypadValue((prev) => prev + num.toString());
                    }}
                    disabled={isAnswered}
                    className="py-3 bg-white hover:bg-sky-50 border-2 border-slate-200 text-xl font-black rounded-2xl shadow-xs cursor-pointer active:scale-95"
                  >
                    {num}
                  </button>
                ))}
                <button
                  onClick={handleKeypadSubmit}
                  disabled={isAnswered || !inputKeypadValue}
                  className="col-span-2 py-3 bg-orange-500 hover:bg-orange-600 border-b-4 border-orange-700 active:mt-1 active:border-b-0 text-white font-black rounded-2xl shadow-md disabled:opacity-40 cursor-pointer"
                >
                  KIRIM JAWABAN
                </button>
              </div>
            </div>
          )}

          {/* Feedback Card & Next Question Trigger */}
          {isAnswered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-5 rounded-3xl border-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md ${
                isCorrect
                  ? "bg-emerald-100 border-emerald-400 text-emerald-950"
                  : "bg-pink-100 border-pink-400 text-pink-950"
              }`}
            >
              <div className="flex items-center gap-3">
                {isCorrect ? (
                  <CheckCircle2 size={32} className="text-emerald-600 shrink-0" />
                ) : (
                  <XCircle size={32} className="text-pink-600 shrink-0" />
                )}
                <div>
                  <h4 className="font-black text-base">
                    {isCorrect ? "Benar Sekali! Kamu Detektif Hebat!" : "Yah, Belum Tepat!"}
                  </h4>
                  <p className="text-xs font-bold opacity-90">{currentProblem.explanationStep}</p>
                </div>
              </div>

              <button
                onClick={loadNextQuestion}
                className="w-full sm:w-auto px-7 py-3 bg-orange-500 hover:bg-orange-600 border-b-4 border-orange-700 active:mt-1 active:border-b-0 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <span>Soal Berikutnya</span>
                <ArrowRight size={16} />
              </button>
            </motion.div>
          )}

          {/* Bottom Action Bar: Hints & AI Tutor */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t-2 border-sky-100">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowHint(!showHint)}
                className="px-3.5 py-2 bg-yellow-50 hover:bg-yellow-100 text-amber-900 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer border border-yellow-200"
              >
                <Lightbulb size={16} className="text-amber-500" />
                <span>{showHint ? "Sembunyikan Petunjuk" : "Lihat Petunjuk"}</span>
              </button>

              <button
                onClick={handleAskAiTutor}
                disabled={isLoadingAi}
                className="px-3.5 py-2 bg-sky-50 hover:bg-sky-100 text-sky-800 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer border border-sky-200"
              >
                <Bot size={16} className="text-sky-600" />
                <span>{isLoadingAi ? "Robot Kiki Berpikir..." : "Tanya Robot Kiki"}</span>
              </button>
            </div>

            <span className="text-xs font-black text-sky-600">Detektif Angka SD</span>
          </div>

          {/* Clue / Hint Box */}
          {showHint && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="p-4 bg-yellow-50 border-2 border-yellow-300 rounded-2xl text-xs text-amber-950 font-bold"
            >
              <strong>💡 Petunjuk Detektif:</strong> {currentProblem.hint}
            </motion.div>
          )}

          {/* AI Tutor Explanation Box */}
          {aiExplanation && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-5 bg-sky-50 border-3 border-sky-300 rounded-3xl text-xs sm:text-sm text-sky-950 space-y-2 shadow-sm"
            >
              <div className="flex items-center justify-between font-black text-sky-900">
                <span className="flex items-center gap-2">
                  <Bot size={18} className="text-sky-600" /> Penjelasan Guru Robot Kiki:
                </span>
                <button
                  onClick={() => setAiExplanation(null)}
                  className="text-slate-400 hover:text-slate-700 text-xs font-bold"
                >
                  Tutup
                </button>
              </div>
              <p className="whitespace-pre-line leading-relaxed font-medium">{aiExplanation}</p>
            </motion.div>
          )}
        </div>
      ) : (
        /* Round Completed Summary */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[36px] p-8 border-4 border-yellow-300 shadow-xl text-center space-y-6 max-w-lg mx-auto"
        >
          <div className="w-20 h-20 bg-yellow-400 text-slate-900 rounded-3xl flex items-center justify-center mx-auto text-4xl shadow-lg border-2 border-yellow-200 transform -rotate-3">
            ⭐
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900">Ronde Selesai!</h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 font-bold">
              Kamu berhasil menyelesaikan tantangan bilangan misteri ini!
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div className="p-4 bg-sky-50 rounded-2xl border-2 border-sky-200">
              <span className="text-xs text-sky-700 font-black">Total Skor</span>
              <div className="text-2xl font-black text-sky-950 mt-0.5">+{score} XP</div>
            </div>
            <div className="p-4 bg-orange-50 rounded-2xl border-2 border-orange-200">
              <span className="text-xs text-orange-700 font-black">Streak Terbaik</span>
              <div className="text-2xl font-black text-orange-950 mt-0.5">{streak}x 🔥</div>
            </div>
          </div>

          <button
            onClick={restartRound}
            className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 border-b-4 border-orange-700 active:mt-1 active:border-b-0 text-white font-black text-sm rounded-2xl shadow-md cursor-pointer flex items-center justify-center gap-2"
          >
            <RotateCcw size={18} />
            <span>Main Ronde Baru</span>
          </button>
        </motion.div>
      )}

      {/* Scratchpad Whiteboard */}
      <Scratchpad
        isOpen={isScratchpadOpen}
        onClose={() => setIsScratchpadOpen(false)}
        initialEquation={currentProblem.equation}
      />
    </div>
  );
};
