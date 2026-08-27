import React, { useRef, useState, useEffect } from "react";
import { Eraser, Pen, Trash2, X, Undo2, Check } from "lucide-react";

interface ScratchpadProps {
  isOpen: boolean;
  onClose: () => void;
  initialEquation?: string;
}

export const Scratchpad: React.FC<ScratchpadProps> = ({ isOpen, onClose, initialEquation }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#2563eb");
  const [lineWidth, setLineWidth] = useState(3);
  const [isEraser, setIsEraser] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas dimensions based on container
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(2, 2);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      // Clear with clean background
      ctx.fillStyle = "#fefce8"; // light soft cream note page
      ctx.fillRect(0, 0, rect.width, rect.height);

      // Draw faint ruled lines like a math notebook
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 1;
      for (let y = 30; y < rect.height; y += 28) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(rect.width, y);
        ctx.stroke();
      }

      // Save initial blank state
      const initialData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory([initialData]);
    }
  }, [isOpen]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.strokeStyle = isEraser ? "#fefce8" : color;
    ctx.lineWidth = isEraser ? 18 : lineWidth;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const currentData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory((prev) => [...prev.slice(-10), currentData]);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = "#fefce8";
    ctx.fillRect(0, 0, rect.width, rect.height);

    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    for (let y = 30; y < rect.height; y += 28) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(rect.width, y);
      ctx.stroke();
    }
  };

  const undo = () => {
    if (history.length <= 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const newHistory = history.slice(0, -1);
    const previousState = newHistory[newHistory.length - 1];
    ctx.putImageData(previousState, 0, 0);
    setHistory(newHistory);
  };

  if (!isOpen) return null;

  return (
    <div id="scratchpad-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-amber-50 rounded-[36px] sm:rounded-[40px] shadow-2xl border-4 border-yellow-300 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-yellow-400 px-5 py-4 flex items-center justify-between border-b-4 border-yellow-500 text-slate-950">
          <div className="flex items-center gap-2.5">
            <span className="text-3xl">📝</span>
            <div>
              <h3 className="font-black text-slate-950 text-base sm:text-lg tracking-tight">Papan Oret-Oretan Hitung Susun</h3>
              <p className="text-xs text-yellow-950 font-bold">Hitung bersusun dengan jari atau mouse di sini!</p>
            </div>
          </div>
          <button
            id="close-scratchpad-btn"
            onClick={onClose}
            className="w-9 h-9 rounded-2xl bg-yellow-500/80 hover:bg-yellow-500 border-2 border-yellow-600 text-slate-950 flex items-center justify-center font-black transition-all cursor-pointer active:scale-95"
          >
            <X size={20} />
          </button>
        </div>

        {/* Math equation hint badge if provided */}
        {initialEquation && (
          <div className="bg-yellow-100 px-5 py-2.5 text-xs font-black text-slate-900 border-b-2 border-yellow-200 flex items-center justify-between">
            <span>Soal Saat Ini: <strong className="text-sky-700 text-sm font-mono">{initialEquation}</strong></span>
            <span className="text-slate-500 text-[11px] font-bold">Contoh: 678 - 243 = ?</span>
          </div>
        )}

        {/* Canvas Workspace */}
        <div className="relative flex-1 min-h-[340px] sm:min-h-[380px] bg-amber-50 touch-none">
          <canvas
            ref={canvasRef}
            className="w-full h-full cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>

        {/* Toolbar */}
        <div className="bg-white px-4 sm:px-5 py-3.5 border-t-3 border-yellow-200 flex flex-wrap items-center justify-between gap-2.5">
          {/* Pen / Eraser toggles */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEraser(false)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                !isEraser
                  ? "bg-sky-500 text-white border-b-3 border-sky-700 shadow-xs"
                  : "bg-sky-50 text-slate-700 border border-sky-200 hover:bg-sky-100"
              }`}
            >
              <Pen size={14} /> Pulpen
            </button>
            <button
              onClick={() => setIsEraser(true)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                isEraser
                  ? "bg-pink-500 text-white border-b-3 border-pink-700 shadow-xs"
                  : "bg-sky-50 text-slate-700 border border-sky-200 hover:bg-sky-100"
              }`}
            >
              <Eraser size={14} /> Penghapus
            </button>

            {/* Colors */}
            {!isEraser && (
              <div className="flex items-center gap-1.5 ml-2">
                {[
                  { name: "Biru", code: "#0284c7" },
                  { name: "Hitam", code: "#0f172a" },
                  { name: "Merah", code: "#f43f5e" },
                  { name: "Hijau", code: "#10b981" },
                ].map((c) => (
                  <button
                    key={c.code}
                    onClick={() => {
                      setColor(c.code);
                      setIsEraser(false);
                    }}
                    className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                      color === c.code && !isEraser ? "scale-125 border-slate-900 shadow-sm" : "border-white"
                    }`}
                    style={{ backgroundColor: c.code }}
                    title={c.name}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={undo}
              disabled={history.length <= 1}
              className="px-3 py-1.5 rounded-xl text-xs font-black bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
              title="Urungkan"
            >
              <Undo2 size={14} /> Undo
            </button>
            <button
              onClick={clearCanvas}
              className="px-3 py-1.5 rounded-xl text-xs font-black bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 flex items-center gap-1 cursor-pointer"
              title="Hapus Semua"
            >
              <Trash2 size={14} /> Bersihkan
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-600 border-b-3 border-emerald-700 active:mt-1 active:border-b-0 text-white flex items-center gap-1 cursor-pointer shadow-xs"
            >
              <Check size={14} /> Selesai
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
