import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Printer, X, Sparkles, RefreshCw, FileText, CheckSquare } from 'lucide-react';
import { DifficultyLevel } from '../types';
import { generateQuestionSet } from '../utils/questionGenerator';
import { SoundEffects } from '../utils/sound';

interface PrintWorksheetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrintWorksheetModal: React.FC<PrintWorksheetModalProps> = ({ isOpen, onClose }) => {
  const [level, setLevel] = useState<DifficultyLevel>('medium');
  const [worksheetQuestions, setWorksheetQuestions] = useState(() => generateQuestionSet('medium', 10));
  const [includeAnswers, setIncludeAnswers] = useState(true);

  const handleRegenerate = (lvl: DifficultyLevel) => {
    SoundEffects.playClick();
    setLevel(lvl);
    setWorksheetQuestions(generateQuestionSet(lvl, 10));
  };

  const handlePrint = () => {
    SoundEffects.playClick();
    window.print();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border-4 border-amber-300 flex flex-col max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-amber-400 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-950">
              <Printer className="w-5 h-5" />
              <h3 className="font-extrabold text-lg sm:text-xl font-heading">
                Cetak Lembar Kerja Matematika Siswa
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-amber-500 text-amber-950 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Options Bar */}
          <div className="bg-amber-50 px-6 py-3 border-b border-amber-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-900">Pilih Tingkat:</span>
              {(['easy', 'medium', 'hard'] as const).map(lvl => (
                <button
                  key={lvl}
                  onClick={() => handleRegenerate(lvl)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    level === lvl ? 'bg-amber-500 text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-amber-100'
                  }`}
                >
                  {lvl === 'easy' ? 'Level 1 (Puluhan)' : lvl === 'medium' ? 'Level 2 (Ratusan)' : 'Level 3 (Master 678)'}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-xs font-bold text-amber-950 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeAnswers}
                  onChange={e => setIncludeAnswers(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-400"
                />
                Sertakan Kunci Jawaban
              </label>

              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95"
              >
                <Printer className="w-4 h-4" /> Cetak / Simpan PDF
              </button>
            </div>
          </div>

          {/* Printable Sheet Preview */}
          <div className="p-6 sm:p-8 overflow-y-auto space-y-6 bg-white print:p-0 print:m-0">
            {/* Header Form */}
            <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-end">
              <div>
                <h2 className="text-xl font-bold text-slate-900 font-heading">
                  LEMBAR KERJA MATEMATIKA: BILANGAN MISTERI
                </h2>
                <p className="text-xs text-slate-600">
                  Materi: Menentukan Bilangan yang Belum Diketahui | Kelas SD
                </p>
              </div>
              <div className="text-xs space-y-1 text-slate-800 font-semibold">
                <div>Nama Siswa : _______________________</div>
                <div>Kelas / No  : _______________________</div>
                <div>Nilai / Ttd : _______________________</div>
              </div>
            </div>

            {/* Questions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
              {worksheetQuestions.map((q, idx) => (
                <div key={q.id} className="p-3 border border-slate-200 rounded-xl bg-slate-50/50 space-y-2">
                  <div className="font-bold text-sm text-slate-800 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center text-xs">
                      {idx + 1}
                    </span>
                    <span>Tentukan bilangan pengganti titik-titik:</span>
                  </div>

                  <div className="text-xl font-black text-slate-900 font-mono pl-7 py-1">
                    {q.missingPosition === 'first' ? (
                      <span>...... {q.operator} {q.num2} = {q.targetResult}</span>
                    ) : (
                      <span>{q.num1} {q.operator} ...... = {q.targetResult}</span>
                    )}
                  </div>

                  <div className="text-xs text-slate-400 italic pl-7">
                    Ruang Hitung Oret-oretan:
                  </div>
                  <div className="h-10 border-b border-dashed border-slate-300 ml-7" />
                </div>
              ))}
            </div>

            {/* Answer Key Section */}
            {includeAnswers && (
              <div className="mt-8 pt-4 border-t-2 border-dashed border-slate-300 bg-amber-50/40 p-4 rounded-xl">
                <h4 className="text-xs font-bold uppercase text-amber-900 mb-2">
                  Kunci Jawaban Guru / Pembahasan:
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-semibold text-slate-700">
                  {worksheetQuestions.map((q, idx) => (
                    <div key={idx} className="bg-white p-1.5 rounded-lg border border-amber-200">
                      <strong>#{idx + 1}:</strong> {q.correctAnswer}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
