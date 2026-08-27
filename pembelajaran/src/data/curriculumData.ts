import { MathProblem, DifficultyLevel } from "../types";

export const PRESET_PROBLEMS: MathProblem[] = [
  // LEVEL 1: Satuan & Belasan (Mudah)
  {
    id: "p1",
    equation: "15 - ... = 8",
    displayLeft: "15 - ...",
    displayRight: "8",
    operation: "-",
    num1: 15,
    num2: 8,
    missingValue: 7,
    unknownPosition: "second",
    difficulty: "easy",
    options: [7, 6, 8, 9],
    hint: "Berapa yang harus dikurangkan dari 15 agar tersisa 8? Hitung: 15 - 8 = ?",
    explanationStep: "Untuk 15 - [?] = 8, kurangkan 15 dengan 8. Maka [?] = 15 - 8 = 7.",
    storyContext: "Kiki punya 15 wortel. Setelah dimakan kelinci, tersisa 8 wortel.",
    category: "Satuan & Belasan",
  },
  {
    id: "p2",
    equation: "... + 6 = 14",
    displayLeft: "... + 6",
    displayRight: "14",
    operation: "+",
    num1: 6,
    num2: 14,
    missingValue: 8,
    unknownPosition: "first",
    difficulty: "easy",
    options: [7, 8, 9, 10],
    hint: "Lawan dari tambah adalah kurang. Kurangkan hasil (14) dengan angka yang ada (6).",
    explanationStep: "Untuk [?] + 6 = 14, kita kurangkan: [?] = 14 - 6 = 8.",
    storyContext: "Budi mengumpulkan kelereng. Ditambah 6 kelereng lagi menjadi 14 kelereng.",
    category: "Satuan & Belasan",
  },
  {
    id: "p3",
    equation: "20 - ... = 12",
    displayLeft: "20 - ...",
    displayRight: "12",
    operation: "-",
    num1: 20,
    num2: 12,
    missingValue: 8,
    unknownPosition: "second",
    difficulty: "easy",
    options: [6, 7, 8, 10],
    hint: "Hitung selisih antara 20 dan 12: 20 - 12 = ?",
    explanationStep: "20 - [?] = 12 → [?] = 20 - 12 = 8.",
    storyContext: "Ada 20 balon di pesta. Sebagian meletus dan tersisa 12 balon.",
    category: "Satuan & Belasan",
  },

  // LEVEL 2: Puluhan (Sedang)
  {
    id: "p4",
    equation: "85 - ... = 42",
    displayLeft: "85 - ...",
    displayRight: "42",
    operation: "-",
    num1: 85,
    num2: 42,
    missingValue: 43,
    unknownPosition: "second",
    difficulty: "medium",
    options: [43, 33, 47, 53],
    hint: "Kurangkan angka awal (85) dengan angka hasil (42). Hitung puluhan dan satuannya!",
    explanationStep: "85 - [?] = 42 → [?] = 85 - 42. (80-40=40, 5-2=3, jadi 43).",
    storyContext: "Paman memanen 85 buah mangga. Dijual sebagian dan tersisa 42 mangga.",
    category: "Puluhan",
  },
  {
    id: "p5",
    equation: "... + 35 = 90",
    displayLeft: "... + 35",
    displayRight: "90",
    operation: "+",
    num1: 35,
    num2: 90,
    missingValue: 55,
    unknownPosition: "first",
    difficulty: "medium",
    options: [45, 55, 65, 50],
    hint: "Kurangkan 90 dengan 35. 90 - 35 = ?",
    explanationStep: "[?] + 35 = 90 → [?] = 90 - 35 = 55.",
    storyContext: "Di perpustakaan ada buku cerita. Ditambah 35 buku baru, total jadi 90 buku.",
    category: "Puluhan",
  },
  {
    id: "p6",
    equation: "... - 24 = 56",
    displayLeft: "... - 24",
    displayRight: "56",
    operation: "-",
    num1: 24,
    num2: 56,
    missingValue: 80,
    unknownPosition: "first",
    difficulty: "medium",
    options: [70, 78, 80, 82],
    hint: "Karena bilangan awal dikurangi 24 menghasilkan 56, maka bilangan awal adalah 56 + 24!",
    explanationStep: "[?] - 24 = 56 → Lawan pengurangan adalah penjumlahan: [?] = 56 + 24 = 80.",
    storyContext: "Sejumlah koin emas diambil 24 keping, masih tersisa 56 keping.",
    category: "Puluhan",
  },

  // LEVEL 3: Ratusan (Sesuai Contoh Soal Utama: 678 - ... = 243)
  {
    id: "p7",
    equation: "678 - ... = 243",
    displayLeft: "678 - ...",
    displayRight: "243",
    operation: "-",
    num1: 678,
    num2: 243,
    missingValue: 435,
    unknownPosition: "second",
    difficulty: "medium",
    options: [435, 425, 445, 335],
    hint: "Bentuk 678 - [?] = 243 berarti [?] = 678 - 243. Hitung susun ke bawah ratusan, puluhan, dan satuannya!",
    explanationStep: "678 - 243 = 435. (8-3=5, 7-4=3, 6-2=4). Jadi bilangan yang hilang adalah 435.",
    storyContext: "Bu Ani membuat 678 kue bolu. Setelah laris terjual, tersisa 243 kue di etalase.",
    category: "Ratusan",
  },
  {
    id: "p8",
    equation: "... + 145 = 580",
    displayLeft: "... + 145",
    displayRight: "580",
    operation: "+",
    num1: 145,
    num2: 580,
    missingValue: 435,
    unknownPosition: "first",
    difficulty: "medium",
    options: [435, 445, 425, 335],
    hint: "Kurangkan total (580) dengan bagian yang diketahui (145).",
    explanationStep: "[?] + 145 = 580 → [?] = 580 - 145 = 435.",
    storyContext: "Di kebun sekolah sudah ada bibit tanaman. Ditanam lagi 145 bibit sehingga total menjadi 580 bibit.",
    category: "Ratusan",
  },
  {
    id: "p9",
    equation: "750 - ... = 320",
    displayLeft: "750 - ...",
    displayRight: "320",
    operation: "-",
    num1: 750,
    num2: 320,
    missingValue: 430,
    unknownPosition: "second",
    difficulty: "medium",
    options: [430, 420, 440, 330],
    hint: "Hitung: 750 - 320 = ?",
    explanationStep: "750 - [?] = 320 → [?] = 750 - 320 = 430.",
    storyContext: "Ada 750 lembar kertas origami. Dipakai membuat hiasan hingga tersisa 320 lembar.",
    category: "Ratusan",
  },
  {
    id: "p10",
    equation: "... - 175 = 325",
    displayLeft: "... - 175",
    displayRight: "325",
    operation: "-",
    num1: 175,
    num2: 325,
    missingValue: 500,
    unknownPosition: "first",
    difficulty: "medium",
    options: [450, 500, 520, 550],
    hint: "Karena bilangan awal dikurangi 175 sisa 325, jumlahkan keduanya: 325 + 175 = ?",
    explanationStep: "[?] - 175 = 325 → [?] = 325 + 175 = 500.",
    storyContext: "Sejumlah tabungan diambil Rp 175 untuk beli buku, sisa tabungan Rp 325.",
    category: "Ratusan",
  },

  // LEVEL 4: Ratusan & Ribuan (Sulit/Master)
  {
    id: "p11",
    equation: "1250 - ... = 720",
    displayLeft: "1250 - ...",
    displayRight: "720",
    operation: "-",
    num1: 1250,
    num2: 720,
    missingValue: 530,
    unknownPosition: "second",
    difficulty: "hard",
    options: [530, 510, 550, 430],
    hint: "Hitung bersusun: 1250 - 720 = ?",
    explanationStep: "1250 - [?] = 720 → [?] = 1250 - 720 = 530.",
    storyContext: "Truk mengangkut 1250 bata. Diturunkan di toko pertama hingga tersisa 720 bata.",
    category: "Ribuan",
  },
  {
    id: "p12",
    equation: "... + 640 = 1500",
    displayLeft: "... + 640",
    displayRight: "1500",
    operation: "+",
    num1: 640,
    num2: 1500,
    missingValue: 860,
    unknownPosition: "first",
    difficulty: "hard",
    options: [860, 840, 880, 960],
    hint: "Kurangkan 1500 dengan 640: 1500 - 640 = ?",
    explanationStep: "[?] + 640 = 1500 → [?] = 1500 - 640 = 860.",
    storyContext: "Koleksi stiker ditambahkan 640 buah sehingga kini menjadi 1500 stiker.",
    category: "Ribuan",
  },
];

// Helper to dynamically generate endless unique math problems on the fly
export function generateRandomProblem(difficulty: DifficultyLevel): MathProblem {
  let num1 = 0;
  let num2 = 0;
  let missing = 0;
  let op: "+" | "-" = Math.random() > 0.5 ? "+" : "-";
  let pos: "first" | "second" = Math.random() > 0.5 ? "first" : "second";

  if (difficulty === "easy") {
    if (op === "-") {
      num1 = Math.floor(Math.random() * 40) + 15; // 15..55
      missing = Math.floor(Math.random() * (num1 - 5)) + 3;
      num2 = num1 - missing;
    } else {
      missing = Math.floor(Math.random() * 30) + 5;
      num1 = Math.floor(Math.random() * 30) + 5;
      num2 = missing + num1;
    }
  } else if (difficulty === "medium") {
    if (op === "-") {
      num1 = Math.floor(Math.random() * 700) + 200; // 200..900 (e.g. 678)
      missing = Math.floor(Math.random() * (num1 - 100)) + 50;
      num2 = num1 - missing; // e.g. 243
    } else {
      missing = Math.floor(Math.random() * 400) + 100;
      num1 = Math.floor(Math.random() * 400) + 100;
      num2 = missing + num1;
    }
  } else {
    // hard
    if (op === "-") {
      num1 = Math.floor(Math.random() * 3000) + 1000;
      missing = Math.floor(Math.random() * (num1 - 400)) + 200;
      num2 = num1 - missing;
    } else {
      missing = Math.floor(Math.random() * 1500) + 500;
      num1 = Math.floor(Math.random() * 1500) + 500;
      num2 = missing + num1;
    }
  }

  let equation = "";
  let hint = "";
  let explanationStep = "";

  if (op === "-") {
    if (pos === "second") {
      // num1 - [?] = num2
      equation = `${num1} - ... = ${num2}`;
      hint = `Kurangkan ${num1} dengan ${num2} untuk mencari bilangan yang hilang.`;
      explanationStep = `${num1} - [?] = ${num2} → [?] = ${num1} - ${num2} = ${missing}.`;
    } else {
      // [?] - num1 = num2  => missing = num2 + num1
      missing = num1 + num2;
      equation = `... - ${num1} = ${num2}`;
      hint = `Lawan dari pengurangan adalah penjumlahan! Tambahkan ${num2} + ${num1}.`;
      explanationStep = `[?] - ${num1} = ${num2} → [?] = ${num2} + ${num1} = ${missing}.`;
    }
  } else {
    if (pos === "first") {
      // [?] + num1 = num2
      equation = `... + ${num1} = ${num2}`;
      hint = `Lawan dari penjumlahan adalah pengurangan. Kurangkan ${num2} - ${num1}.`;
      explanationStep = `[?] + ${num1} = ${num2} → [?] = ${num2} - ${num1} = ${missing}.`;
    } else {
      // num1 + [?] = num2
      equation = `${num1} + ... = ${num2}`;
      hint = `Kurangkan hasil akhir (${num2}) dengan angka awal (${num1}).`;
      explanationStep = `${num1} + [?] = ${num2} → [?] = ${num2} - ${num1} = ${missing}.`;
    }
  }

  // Generate 4 plausible options including correct missing value
  const optionsSet = new Set<number>();
  optionsSet.add(missing);
  const deltas = [10, -10, 100, -100, 1, -1, 20, -20];
  let attempt = 0;
  while (optionsSet.size < 4 && attempt < 20) {
    attempt++;
    const delta = deltas[Math.floor(Math.random() * deltas.length)];
    const fake = missing + delta;
    if (fake > 0 && fake !== missing) {
      optionsSet.add(fake);
    }
  }
  while (optionsSet.size < 4) {
    const fake = missing + (optionsSet.size * 5 + 3);
    optionsSet.add(fake);
  }

  const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

  return {
    id: `dyn_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    equation,
    displayLeft: equation.split("=")[0].trim(),
    displayRight: equation.split("=")[1].trim(),
    operation: op,
    num1,
    num2,
    missingValue: missing,
    unknownPosition: pos,
    difficulty,
    options,
    hint,
    explanationStep,
    category: difficulty === "easy" ? "Satuan/Puluhan" : difficulty === "medium" ? "Ratusan" : "Ribuan",
  };
}
