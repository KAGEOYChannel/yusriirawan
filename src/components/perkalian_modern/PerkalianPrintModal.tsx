import React from 'react';
import { X, Printer, Download, Sparkles, Award } from 'lucide-react';
import { SoundEffects } from '../../utils/sound';

interface PrintProps {
  isOpen: boolean;
  onClose: () => void;
  playerName: string;
}

export const PerkalianPrintModal: React.FC<PrintProps> = ({ isOpen, onClose, playerName }) => {
  if (!isOpen) return null;

  const handleTriggerPrint = () => {
    SoundEffects.playClick();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl p-6 w-full max-w-2xl shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-black text-white font-heading">
              Cetak Lembar Latihan & Piagam
            </h3>
          </div>

          <button
            onClick={() => {
              SoundEffects.playClick();
              onClose();
            }}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate Preview */}
        <div className="bg-white text-slate-900 p-8 rounded-2xl border-4 border-amber-400 shadow-xl text-center space-y-4 font-sans">
          <div className="text-3xl font-black text-amber-600 font-heading">
            PIAGAM PENGHARGAAN MATEMATIKA
          </div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Diberikan Kepada Siswa Berprestasi
          </div>
          <div className="text-2xl font-black text-slate-900 border-b-2 border-slate-300 pb-2 max-w-xs mx-auto">
            {playerName || 'Siswa Hebat'}
          </div>
          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
            Atas ketekunan dan keberhasilan menuntaskan materi <strong>Perkalian Bilangan sampai 100.000</strong> (Trik Kelipatan 10/100, Bersusun Pendek & Panjang, serta Pemecahan Soal Cerita).
          </p>
          <div className="flex justify-between items-center text-xs font-bold text-slate-500 pt-6">
            <div>Tanggal: {new Date().toLocaleDateString('id-ID')}</div>
            <div>Guru Pengajar: Yusri Irawan</div>
          </div>
        </div>

        {/* Print Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs"
          >
            Tutup
          </button>
          <button
            onClick={handleTriggerPrint}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-black rounded-xl text-xs font-heading flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Sekarang (Print PDF)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
