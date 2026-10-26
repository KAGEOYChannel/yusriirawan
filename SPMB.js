
const EXCEL_URL = "./content-calendar.xlsx";

// Membaca file Excel dari repository GitHub
async function loadExcelFromGitHub() {
  const status = document.getElementById("excelStatus");

  try {
    if (status) status.textContent = "Memuat data Excel...";

    // Mencegah browser menggunakan cache lama
    const response = await fetch(
      `${EXCEL_URL}?v=${Date.now()}`
    );

    if (!response.ok) {
      throw new Error(
        "File Excel tidak ditemukan. Periksa nama dan lokasi file."
      );
    }

    const buffer = await response.arrayBuffer();

    // Membaca workbook Excel
    const workbook = XLSX.read(buffer, {
      type: "array",
      cellDates: true
    });

    // Membaca sheet pertama
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Mengubah isi Excel menjadi array objek
    const data = XLSX.utils.sheet_to_json(worksheet, {
      defval: ""
    });

    console.log("Data Excel berhasil dibaca:", data);

    // Tampilkan data menggunakan fungsi website yang sudah ada
    renderCalendar(data);

    if (status) {
      status.textContent =
        `Berhasil memuat ${data.length} data dari Excel.`;
    }
  } catch (error) {
    console.error("Gagal membaca Excel:", error);

    if (status) {
      status.textContent = error.message;
    }
  }
}

// Memuat data ketika website dibuka
document.addEventListener("DOMContentLoaded", () => {
  loadExcelFromGitHub();
});
