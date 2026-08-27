import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Pencil, Eraser, Trash2, X, Maximize2, Minimize2, Check } from 'lucide-react';
import { SoundEffects } from '../utils/sound';

interface ScratchpadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScratchpadModal: React.FC<ScratchpadModalProps> = ({ isOpen, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#1e293b');
  const [lineWidth, setLineWidth] = useState(4);
  const [isEraser, setIsEraser] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const colors = [
    { name: 'Hitam', value: '#1e293b' },
    { name: 'Biru', value: '#2563eb' },
    { name: 'Merah', value: '#dc2626' },
    { name: 'Hijau', value: '#16a34a' },
  ];

  // Adjust canvas resolution
  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * 2;
      canvas.height = rect.height * 2;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(2, 2);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, rect.width, rect.height);
      }
    }
  }, [isOpen, isMinimized]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.strokeStyle = isEraser ? '#ffffff' : color;
    ctx.lineWidth = isEraser ? lineWidth * 3 : lineWidth;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    SoundEffects.playClick();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 pointer-events-none flex items-end md:items-center justify-center p-2 sm:p-4">
        {/* Backdrop only if not minimized */}
        {!isMinimized && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs pointer-events-auto"
          />
        )}

        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 40 }}
          className={`pointer-events-auto bg-white rounded-3xl shadow-2xl border-4 border-amber-300 flex flex-col overflow-hidden transition-all duration-300 ${
            isMinimized
              ? 'w-72 h-14 fixed bottom-4 right-4 rounded-2xl border-2 shadow-lg'
              : 'w-full max-w-2xl h-[520px] max-h-[85vh]'
          }`}
        >
          {/* Header */}
          <div className="bg-amber-400 px-4 py-3 flex items-center justify-between select-none">
            <div className="flex items-center gap-2">
              <span className="text-xl">📝</span>
              <span className="font-bold text-amber-950 font-heading text-base sm:text-lg">
                Kertas Cakar / Oret-Oretan
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                id="btn-scratchpad-minimize"
                onClick={() => {
                  SoundEffects.playClick();
                  setIsMinimized(!isMinimized);
                }}
                className="p-1.5 rounded-full hover:bg-amber-500/50 text-amber-950 transition-colors"
                title={isMinimized ? 'Perbesar' : 'Kecilkan'}
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                id="btn-scratchpad-close"
                onClick={() => {
                  SoundEffects.playClick();
                  onClose();
                }}
                className="p-1.5 rounded-full hover:bg-amber-500/50 text-amber-950 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Toolbar */}
              <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex flex-wrap items-center justify-between gap-2 select-none">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-amber-200 shadow-xs">
                    <button
                      onClick={() => {
                        SoundEffects.playClick();
                        setIsEraser(false);
                      }}
                      className={`p-2 rounded-lg flex items-center gap-1 text-xs font-semibold transition-all ${
                        !isEraser ? 'bg-amber-400 text-amber-950 shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Pencil className="w-4 h-4" /> Pensil
                    </button>
                    <button
                      onClick={() => {
                        SoundEffects.playClick();
                        setIsEraser(true);
                      }}
                      className={`p-2 rounded-lg flex items-center gap-1 text-xs font-semibold transition-all ${
                        isEraser ? 'bg-amber-400 text-amber-950 shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Eraser className="w-4 h-4" /> Penghapus
                    </button>
                  </div>

                  {/* Colors */}
                  {!isEraser && (
                    <div className="flex items-center gap-1.5 ml-1">
                      {colors.map(c => (
                        <button
                          key={c.value}
                          onClick={() => {
                            SoundEffects.playClick();
                            setColor(c.value);
                          }}
                          className={`w-6 h-6 rounded-full transition-transform border-2 ${
                            color === c.value ? 'scale-125 border-amber-600 ring-2 ring-amber-300' : 'border-white hover:scale-110'
                          }`}
                          style={{ backgroundColor: c.value }}
                          title={c.name}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleClear}
                    className="flex items-center gap-1 px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs font-bold rounded-xl transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Hapus Semua
                  </button>
                </div>
              </div>

              {/* Grid Canvas Canvas Body */}
              <div className="flex-1 relative bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] touch-none cursor-crosshair overflow-hidden">
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-full block"
                />
              </div>

              {/* Footer Guide for Kids */}
              <div className="bg-amber-50 px-4 py-2 text-xs text-amber-900 border-t border-amber-200 flex justify-between items-center">
                <span>💡 Gunakan papan ini untuk hitung susun seperti <strong>678 - 243</strong>!</span>
                <button
                  onClick={onClose}
                  className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold flex items-center gap-1 text-xs"
                >
                  <Check className="w-3.5 h-3.5" /> Siap
                </button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
