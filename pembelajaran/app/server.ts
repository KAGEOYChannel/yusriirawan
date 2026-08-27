import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini safely
let genAI: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!genAI && process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAI;
}

// API Health
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API: AI Math Tutor Explainer for Kids
app.post("/api/ai/explain", async (req: Request, res: Response) => {
  try {
    const { problemText, equation, unknownPosition, numbers, studentQuestion } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      // Fallback local explanation if API key is not yet set
      return res.json({
        explanation: `Halo Detektif Cilik! 🕵️‍♂️ Mari kita cari bilangan misteri pada soal "${equation || problemText}".\n\nTips Detektif:\n1. Ingat bahwa tanda sama dengan (=) seperti timbangan yang seimbang!\n2. Untuk bentuk [ A - ? = B ], cara mencari '?' adalah: ? = A - B.\n3. Contoh: 678 - ? = 243 -> kurangkan 678 dengan 243, hasilnya adalah 435!\nKamu pasti bisa! Semangat! 🌟`,
        source: "local-fallback",
      });
    }

    const prompt = `Kamu adalah "Guru Robot Kiki", asisten belajar matematika yang sangat ramah, ceria, dan penyabar untuk anak-anak Sekolah Dasar (SD) di Indonesia.
Materi pelajaran saat ini: Menentukan bilangan yang belum diketahui dalam kalimat matematika (konsep aljabar dasar penjumlahan dan pengurangan).

Konteks Soal:
Persamaan / Soal: ${equation || problemText || "678 - ... = 243"}
Posisi yang dicari: ${unknownPosition || "bilangan yang hilang (...)"}
Angka-angka: ${JSON.stringify(numbers || {})}
Pertanyaan Siswa (jika ada): ${studentQuestion || "Bagaimana cara menyelesaikannya?"}

Instruksi:
1. Jelaskan langkah demi langkah dengan analogi konkret anak SD (misal: timbangan seimbang, keranjang buah, toples permen, atau balok susun).
2. Gunakan bahasa Indonesia yang ceria, mudah dipahami anak kelas 3-5 SD, dengan emoji ramah.
3. Tunjukkan hitungan bersusun ke bawah dengan jelas.
4. Berikan pesan penyemangat di akhir.
5. Jaga penjelasan tidak terlalu panjang (maksimal 3-4 paragraf singkat).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction: "Kamu adalah Guru Robot Kiki, guru matematika SD yang ceria dan ramah anak.",
        temperature: 0.7,
      },
    });

    res.json({
      explanation: response.text,
      source: "gemini-ai",
    });
  } catch (error: any) {
    console.error("Gemini explain error:", error);
    res.status(200).json({
      explanation: `Halo Detektif Cilik! 🌟\nUntuk menyelesaikan persamaan matematika ini, kita gunakan aturan timbangan:\n- Jika bentuknya A - [?] = B, maka [?] = A - B.\n- Jika bentuknya [?] + A = B, maka [?] = B - A.\n- Jika bentuknya [?] - A = B, maka [?] = B + A.\n\nCoba hitung dengan teliti secara bersusun ya! Kamu anak hebat! 🚀`,
      source: "error-fallback",
    });
  }
});

// API: AI Custom Animated Story Problem Generator
app.post("/api/ai/generate-story", async (req: Request, res: Response) => {
  try {
    const { studentName, theme, difficulty } = req.body;
    const ai = getGeminiClient();

    const charName = studentName || "Adit";
    const chosenTheme = theme || "toko kue";
    const diff = difficulty || "medium"; // easy: <100, medium: 100-999, hard: 1000-5000

    if (!ai) {
      // Fallback generator
      const num1 = diff === "easy" ? 48 : diff === "hard" ? 1450 : 678;
      const result = diff === "easy" ? 19 : diff === "hard" ? 620 : 243;
      const missing = num1 - result;

      return res.json({
        story: `${charName} memiliki ${num1} buah roti lezat di ${chosenTheme}. Setelah beberapa roti dibeli oleh pembeli, roti yang tersisa ada ${result} buah. Berapakah jumlah roti yang dibeli?`,
        equation: `${num1} - ... = ${result}`,
        num1,
        num2: result,
        operation: "-",
        missingValue: missing,
        unknownPos: "middle", // num1 - [?] = result
        theme: chosenTheme,
        itemIcon: "🥐",
        character: charName,
        stepExplanation: `Roti mula-mula (${num1}) dikurangi sisa roti (${result}) = ${missing} roti yang terjual.`,
      });
    }

    const prompt = `Buatkan 1 buah soal cerita matematika anak SD tentang "Menentukan Bilangan Yang Belum Diketahui" (aljabar dasar).
Nama karakter utama: ${charName}
Tema cerita: ${chosenTheme} (contoh: luar angkasa, kebun binatang, petualangan bajak laut, toko kue, kebun apel, dll)
Tingkat kesulitan: ${diff} (easy: angka 10-99, medium: ratusan 100-999 seperti 678 - ... = 243, hard: ribuan 1000-5000)

Kembalikan HANYA JSON murni dengan struktur berikut:
{
  "story": "teks soal cerita yang seru dan berima/menarik untuk anak SD",
  "equation": "persamaan matematika (misal: 678 - ... = 243 atau ... + 150 = 400)",
  "num1": number,
  "num2": number,
  "operation": "+" atau "-",
  "missingValue": number,
  "unknownPos": "left" atau "middle" atau "right",
  "theme": "nama tema",
  "itemIcon": "1 emoji benda yang relevan (misal: 🍰, 🚀, 🍎, 🪙)",
  "character": "${charName}",
  "stepExplanation": "langkah pengerjaan singkat dan jelas"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.8,
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error) {
    console.error("Gemini story generator error:", error);
    res.json({
      story: `Budi membawa 550 kelereng warna-warni ke sekolah. Setelah bermain, kelerengnya tersisa 320 butir. Berapa kelereng yang hilang saat bermain?`,
      equation: "550 - ... = 320",
      num1: 550,
      num2: 320,
      operation: "-",
      missingValue: 230,
      unknownPos: "middle",
      theme: "permainan",
      itemIcon: "🔮",
      character: "Budi",
      stepExplanation: "550 - 320 = 230 kelereng.",
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
