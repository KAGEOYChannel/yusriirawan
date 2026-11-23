/* Madani Content Studio - SPMB 2027/2028 */
const FALLBACK_FILE = "content-calendar.xlsx";
const REMOTE_ENDPOINT = "https://docs.google.com/spreadsheets/d/1PHu5aUJE613pu4wwItlrSwN1nCghTpUh4endboxdCHw/edit?usp=sharing";
const STATUS = ["Ide", "Brief", "Produksi", "Review", "Terjadwal", "Published"];

let contents = [];
let currentView = "dashboard";
let currentMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
let calendarMode = "month";
let searchTerm = "";
let toastTimer;
let firstLoad = true;
let syncState = { status: "loading", count: 0, time: null };
let renderedOnce = false;

/* Bersihkan cache lama */
["madaniContentCalendar2027", "madaniChecklist", "madaniHiddenExcelIds"].forEach(k => {
  try { localStorage.removeItem(k); } catch {}
});

/* ---------- Helpers ---------- */
function esc(s = "") {
  return String(s).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

function pad(n) { return String(n).padStart(2, "0"); }

function dateKey(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function fmtDate(date, opts = { day: "numeric", month: "short", year: "numeric" }) {
  if (!date) return "-";
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("id-ID", opts);
}

function monthKey(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

function statusClass(s) {
  return "status-" + String(s || "Ide").toLowerCase().replace(/\s+/g, "-");
}

function badge(s) {
  return `<span class="status ${statusClass(s)}">${esc(s || "Ide")}</span>`;
}

function showToast(msg) {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 2800);
}

function filteredItems() {
  const q = searchTerm.toLowerCase();
  return contents.filter(c =>
    `${c.title} ${c.pic} ${c.brief} ${c.platform} ${c.format}`.toLowerCase().includes(q)
  );
}

/* ---------- Referensi (Link) ---------- */
function safeUrl(u) {
  u = String(u || "").trim().replace(/[),.;]+$/, "");
  if (/^www\./i.test(u)) u = "https://" + u;
  if (!/^https?:\/\//i.test(u)) return "";
  try {
    const x = new URL(u);
    return /^https?:$/.test(x.protocol) ? x.href : "";
  } catch {
    return "";
  }
}

function hostLabel(u) {
  try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return u; }
}

function parseRefs(text, target) {
  const t = String(text || "").trim(), out = [], seen = new Set();
  const add = (url, label) => {
    const s = safeUrl(url);
    if (s && !seen.has(s)) {
      seen.add(s);
      out.push({ url: s, label: label || hostLabel(s) });
    }
  };
  if (target) add(target, t && !/^(https?:\/\/|www\.)/i.test(t) ? t : "");
  (t.match(/(?:https?:\/\/|www\.)[^\s,;]+/gi) || []).forEach(u => add(u, ""));
  return out;
}

function refHtml(refs) {
  return refs.map(r =>
    `<a class="ref-link" href="${esc(r.url)}" target="_blank" rel="noopener noreferrer" title="${esc(r.url)}" onclick="event.stopPropagation()">${esc(r.label)} <em>↗</em></a>`
  ).join("");
}

/* ---------- Parser Data ---------- */
function normalizeDate(v) {
  if (v instanceof Date && !isNaN(v)) return dateKey(v);
  if (typeof v === "number" && typeof XLSX !== "undefined" && XLSX.SSF) {
    const d = XLSX.SSF.parse_date_code(v);
    if (d) return `${d.y}-${pad(d.m)}-${pad(d.d)}`;
  }
  const s = String(v || "").trim();
  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(s)) {
    const [y, m, d] = s.split("-");
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  const m = s.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})$/);
  if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  return "";
}

function parseDataset(ws) {
  if (!ws || !ws["!ref"]) return { items: [], skipped: 0 };
  const rg = XLSX.utils.decode_range(ws["!ref"]);
  const alias = {
    date: ["tanggal", "date"],
    title: ["judul", "judul konten", "title"],
    format: ["format", "jenis konten", "tipe"],
    platform: ["platform", "kanal"],
    status: ["status"],
    pic: ["pic", "penanggung jawab", "penanggungjawab"],
    brief: ["brief", "caption", "catatan"],
    ref: ["referensi", "reference", "link referensi", "link", "tautan"]
  };
  const cols = {};
  for (let c = rg.s.c; c <= rg.e.c; c++) {
    const cell = ws[XLSX.utils.encode_cell({ r: rg.s.r, c })];
    if (!cell || cell.v == null) continue;
    const h = String(cell.v).toLowerCase().trim();
    for (const k in alias) {
      if (cols[k] === undefined && alias[k].includes(h)) cols[k] = c;
    }
  }
  if (cols.title === undefined || cols.date === undefined) {
    throw new Error("Struktur data jadwal belum sesuai.");
  }
  const cell = (r, k) => cols[k] === undefined ? undefined : ws[XLSX.utils.encode_cell({ r, c: cols[k] })];
  const txt = (r, k) => {
    const x = cell(r, k);
    return x && x.v != null ? String(x.v).trim() : "";
  };
  const items = [];
  let skipped = 0;
  for (let r = rg.s.r + 1; r <= rg.e.r; r++) {
    const title = txt(r, "title");
    if (!title) continue;
    const d = cell(r, "date"), date = d ? normalizeDate(d.v) : "";
    if (!date) { skipped++; continue; }
    const sRaw = txt(r, "status");
    const status = STATUS.find(s => s.toLowerCase() === sRaw.toLowerCase()) || "Ide";
    const rc = cell(r, "ref");
    items.push({
      id: `row${r}`,
      date,
      title,
      format: txt(r, "format") || "Lainnya",
      platform: txt(r, "platform") || "Multi-platform",
      status,
      pic: txt(r, "pic"),
      brief: txt(r, "brief"),
      refs: parseRefs(rc && rc.v != null ? rc.v : "", rc && rc.l ? rc.l.Target : "")
    });
  }
  return { items, skipped };
}

function getEndpointUrl() {
  try {
    return (localStorage.getItem("madaniSheetUrl") || REMOTE_ENDPOINT || "").trim();
  } catch {
    return REMOTE_ENDPOINT;
  }
}

function toStreamUrl(u) {
  u = String(u || "").trim();
  if (!u) return "";
  if (/output=csv|format=csv|tqx=out:csv/i.test(u)) return u;
  let m = u.match(/\/d\/e\/([^/]+)/);
  if (m) {
    return `https://docs.google.com/spreadsheets/d/e/${m[1]}/pub?output=csv` +
      (/gid=(\d+)/.test(u) ? `&gid=${u.match(/gid=(\d+)/)[1]}` : "");
  }
  m = u.match(/\/d\/([^/]+)/);
  if (m) {
    const g = u.match(/gid=(\d+)/);
    return `https://docs.google.com/spreadsheets/d/${m[1]}/gviz/tq?tqx=out:csv` + (g ? `&gid=${g[1]}` : "");
  }
  return u;
}

async function syncScheduleData(manual = false) {
  const topBtn = document.getElementById("reloadTop");
  if (topBtn && manual) topBtn.classList.add("spinning");

  if (typeof XLSX === "undefined") {
    syncState = { status: "error", count: contents.length, time: new Date() };
    renderAll();
    if (topBtn) topBtn.classList.remove("spinning");
    return;
  }

  const before = JSON.stringify(contents);
  const streamUrl = toStreamUrl(getEndpointUrl());

  try {
    let wb;
    if (streamUrl) {
      const res = await fetch(streamUrl + (streamUrl.includes("?") ? "&" : "?") + `_=${Date.now()}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Gagal menghubungkan ke server jadwal.");
      const text = await res.text();
      if (/^\s*<(!doctype|html)/i.test(text)) throw new Error("Akses jadwal membutuhkan izin publik.");
      wb = XLSX.read(text, { type: "string", raw: true });
    } else {
      const res = await fetch(`${FALLBACK_FILE}?t=${Date.now()}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Data jadwal lokal tidak ditemukan.");
      wb = XLSX.read(await res.arrayBuffer(), { type: "array" });
    }

    const { items } = parseDataset(wb.Sheets[wb.SheetNames[0]]);
    contents = items;
    syncState = { status: "ok", count: items.length, time: new Date() };

    if (firstLoad && items.length) {
      const today = dateKey(new Date());
      const sorted = [...items].sort((a, b) => a.date.localeCompare(b.date));
      const target = sorted.find(c => c.date >= today) || sorted[sorted.length - 1];
      currentMonth = new Date(Number(target.date.slice(0, 4)), Number(target.date.slice(5, 7)) - 1, 1);
    }
    firstLoad = false;
    if (manual) showToast(`Jadwal diperbarui · ${items.length} konten aktif.`);
  } catch (err) {
    syncState = { status: "error", count: contents.length, time: new Date() };
    if (manual) showToast("Belum dapat memperbarui jadwal saat ini.");
  } finally {
    if (topBtn) topBtn.classList.remove("spinning");
  }

  if (before !== JSON.stringify(contents) || manual || syncState.status === "error" || !renderedOnce) {
    renderAll();
  } else {
    renderSyncTime();
  }
}

/* ---------- Render Views ---------- */
function gotoView(view) {
  currentView = view;
  document.querySelectorAll(".view").forEach(el =>
    el.classList.toggle("active", el.id === `view-${view}`)
  );
  document.querySelectorAll(".nav-item[data-view]").forEach(el =>
    el.classList.toggle("active", el.dataset.view === view)
  );
  const titles = {
    dashboard: "Dashboard",
    calendar: "Kalender Konten",
    board: "Alur Kerja Produksi",
    content: "Katalog Konten"
  };
  document.getElementById("pageTitle").textContent = titles[view] || "Dashboard";
  renderAll();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderSyncTime() {
  const el = document.getElementById("syncTimeSide");
  if (!el) return;
  if (syncState.status === "ok" && syncState.time) {
    const t = syncState.time.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    el.textContent = `${syncState.count} agenda · Diperbarui ${t}`;
  } else if (syncState.status === "error") {
    el.textContent = "Menunggu pembaruan jaringan";
  } else {
    el.textContent = "Menyiapkan jadwal...";
  }
}

function emptyMsg() {
  return syncState.status === "error"
    ? "Jadwal konten sedang disinkronkan. Pastikan perangkat terhubung ke internet."
    : "Belum ada agenda konten yang terdaftar.";
}

function renderStats() {
  const total = contents.length;
  const pub = contents.filter(c => c.status === "Published").length;
  const proc = contents.filter(c => ["Brief", "Produksi", "Review", "Terjadwal"].includes(c.status)).length;
  const ideas = contents.filter(c => c.status === "Ide").length;
  const rate = total > 0 ? Math.round((pub / total) * 100) : 0;

  countUp(document.getElementById("statTotal"), total);
  countUp(document.getElementById("statPublished"), pub);
  countUp(document.getElementById("statProcess"), proc);
  countUp(document.getElementById("statIdeas"), ideas);

  const rateEl = document.getElementById("statRate");
  if (rateEl) rateEl.textContent = `${rate}% selesai tayang`;
  const compEl = document.getElementById("completionBadge");
  if (compEl) compEl.textContent = `${rate}% Tayang`;

  const counts = STATUS.map(s => ({ s, n: contents.filter(c => c.status === s).length }));
  const max = Math.max(1, ...counts.map(x => x.n));

  document.getElementById("statusChart").innerHTML = counts.map(x => `
    <div class="bar-row">
      <span>${esc(x.s)}</span>
      <div class="bar-track"><div class="bar-fill" style="width:${(x.n / max) * 100}%"></div></div>
      <b>${x.n}</b>
    </div>
  `).join("");

  document.getElementById("chartLegend").innerHTML = counts
    .filter(x => x.n)
    .map(x => `<span class="legend-pill">${esc(x.s)} <b>${x.n}</b></span>`)
    .join("") || '<span class="legend-pill">Belum ada data</span>';

  /* Platform & PIC Breakdown */
  const platMap = {};
  contents.forEach(c => {
    const k = c.platform || "Lainnya";
    platMap[k] = (platMap[k] || 0) + 1;
  });
  const platEntries = Object.entries(platMap).sort((a, b) => b[1] - a[1]);
  const pbEl = document.getElementById("platformBreakdown");
  if (pbEl) {
    pbEl.innerHTML = platEntries.length
      ? platEntries.map(([k, v]) => `<span class="legend-pill">${esc(k)} <b>${v}</b></span>`).join("")
      : '<span class="legend-pill">Belum ada kanal</span>';
  }

  /* Upcoming List */
  const today = dateKey(new Date());
  const upcoming = filteredItems()
    .filter(c => c.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 6);

  document.getElementById("upcomingList").innerHTML = upcoming.length
    ? upcoming.map(c => `
      <div class="upcoming-item" data-detail="${esc(c.id)}" tabindex="0">
        <div class="date-chip">
          <b>${c.date.slice(8, 10)}</b>
          <small>${fmtDate(c.date, { month: "short" }).toUpperCase()}</small>
        </div>
        <div>
          <div class="upcoming-title">${esc(c.title)}</div>
          <div class="upcoming-meta">
            <span>${esc(c.format)}</span> •
            <span>${esc(c.platform)}</span> •
            <span>${esc(c.pic || "Tim Kreatif")}</span>
            ${c.refs.length ? ` • <span>🔗 ${c.refs.length} tautan</span>` : ""}
          </div>
        </div>
        ${badge(c.status)}
      </div>
    `).join("")
    : `<div class="empty-state">${contents.length ? "Tidak ada jadwal konten mendatang." : emptyMsg()}</div>`;
}

function setSelectOptions(id, values) {
  const el = document.getElementById(id);
  if (!el) return;
  const old = el.value;
  const first = el.options[0].outerHTML;
  el.innerHTML = first + values.filter(Boolean).sort().map(v => `<option value="${esc(v)}">${esc(v)}</option>`).join("");
  if (values.includes(old)) el.value = old;
}

function renderFilters() {
  const platforms = [...new Set(contents.map(c => c.platform))];
  ["calStatus", "listStatus"].forEach(id => setSelectOptions(id, STATUS));
  ["calPlatform", "listPlatform", "boardPlatform"].forEach(id => setSelectOptions(id, platforms));
}

function renderCalendar() {
  const y = currentMonth.getFullYear(), m = currentMonth.getMonth();
  document.getElementById("monthLabel").textContent = currentMonth.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
  const st = document.getElementById("calStatus").value;
  const pl = document.getElementById("calPlatform").value;
  const all = filteredItems().filter(c => (!st || c.status === st) && (!pl || c.platform === pl));
  const container = document.getElementById("calendarContainer");

  if (calendarMode === "list") {
    const monthItems = all.filter(c => c.date.startsWith(monthKey(currentMonth))).sort((a, b) => a.date.localeCompare(b.date));
    const groups = {};
    monthItems.forEach(c => (groups[c.date] ??= []).push(c));
    container.innerHTML = Object.keys(groups).length
      ? Object.keys(groups).map(d => `
        <div class="list-date-group">
          <div class="list-date-title">${fmtDate(d, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</div>
          ${groups[d].map(c => `
            <div class="list-event" data-detail="${esc(c.id)}">
              <div>
                <b>${esc(c.title)}</b>
                <p>${esc(c.format)} · ${esc(c.platform)} · ${esc(c.pic || "Tim Kreatif")}</p>
                ${c.refs.length ? `<div class="ref-list" style="margin-top:6px">${refHtml(c.refs)}</div>` : ""}
              </div>
              <div>${badge(c.status)}</div>
            </div>
          `).join("")}
        </div>
      `).join("")
      : '<div class="empty-state">Tidak ada agenda konten untuk bulan atau filter ini.</div>';
    return;
  }

  const firstDay = (new Date(y, m, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const prevDays = new Date(y, m, 0).getDate();
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  let out = '<div class="calendar-grid">' +
    ["SEN", "SEL", "RAB", "KAM", "JUM", "SAB", "MIN"].map(d => `<div class="weekday">${d}</div>`).join("");

  const todayStr = dateKey(new Date());
  for (let i = 0; i < totalCells; i++) {
    let day, cellDate, other = false;
    if (i < firstDay) {
      day = prevDays - firstDay + i + 1;
      cellDate = new Date(y, m - 1, day);
      other = true;
    } else if (i >= firstDay + daysInMonth) {
      day = i - (firstDay + daysInMonth) + 1;
      cellDate = new Date(y, m + 1, day);
      other = true;
    } else {
      day = i - firstDay + 1;
      cellDate = new Date(y, m, day);
    }
    const key = dateKey(cellDate);
    const dayEvents = all.filter(c => c.date === key);
    out += `
      <div class="day-cell ${other ? "other-month" : ""}">
        <div class="day-number ${key === todayStr ? "today" : ""}"><span>${day}</span></div>
        ${dayEvents.slice(0, 3).map(c =>
          `<button class="event ${statusClass(c.status)}" title="${esc(c.title)}" data-detail="${esc(c.id)}">${esc(c.title)}</button>`
        ).join("")}
        ${dayEvents.length > 3 ? `<div class="more-events">+${dayEvents.length - 3} lainnya</div>` : ""}
      </div>`;
  }
  container.innerHTML = out + "</div>";
}

function renderBoard() {
  const boardEl = document.getElementById("kanbanBoard");
  if (!boardEl) return;
  const pl = document.getElementById("boardPlatform") ? document.getElementById("boardPlatform").value : "";
  const all = filteredItems().filter(c => !pl || c.platform === pl).sort((a, b) => a.date.localeCompare(b.date));

  boardEl.innerHTML = STATUS.map(st => {
    const colItems = all.filter(c => c.status === st);
    return `
      <div class="kanban-col">
        <div class="kanban-head">
          ${badge(st)}
          <span class="kanban-count">${colItems.length}</span>
        </div>
        <div class="kanban-cards">
          ${colItems.length
            ? colItems.map(c => `
              <article class="kanban-card" data-detail="${esc(c.id)}">
                <div class="kanban-date">${fmtDate(c.date, { day: "2-digit", month: "short", year: "numeric" })}</div>
                <div class="kanban-title">${esc(c.title)}</div>
                <div class="kanban-meta">
                  <span class="meta-pill">${esc(c.format)}</span>
                  <span class="meta-pill">${esc(c.platform)}</span>
                  ${c.pic ? `<span class="meta-pill">👤 ${esc(c.pic)}</span>` : ""}
                </div>
              </article>
            `).join("")
            : `<div class="empty-state" style="padding:20px 8px;font-size:11.5px">Kosong</div>`
          }
        </div>
      </div>
    `;
  }).join("");
}

function renderTable() {
  const st = document.getElementById("listStatus").value;
  const pl = document.getElementById("listPlatform").value;
  const arr = filteredItems()
    .filter(c => (!st || c.status === st) && (!pl || c.platform === pl))
    .sort((a, b) => a.date.localeCompare(b.date));

  document.getElementById("resultCount").textContent = `${arr.length} konten`;

  /* Desktop Table */
  document.getElementById("contentTable").innerHTML = arr.length
    ? arr.map(c => `
      <tr>
        <td><b>${fmtDate(c.date, { day: "2-digit", month: "short", year: "numeric" })}</b></td>
        <td>
          <button class="title-btn" data-detail="${esc(c.id)}">${esc(c.title)}</button>
          <span class="td-sub">${esc(c.brief || "Klik untuk melihat detail konten")}</span>
        </td>
        <td>${esc(c.format)}</td>
        <td>${esc(c.platform)}</td>
        <td>${esc(c.pic || "—")}</td>
        <td>${badge(c.status)}</td>
        <td>${c.refs.length ? `<div class="ref-list">${refHtml(c.refs)}</div>` : '<span class="muted">—</span>'}</td>
      </tr>
    `).join("")
    : `<tr><td colspan="7"><div class="empty-state">${contents.length ? "Tidak ada konten yang sesuai filter." : emptyMsg()}</div></td></tr>`;

  /* Mobile Cards */
  const cardsEl = document.getElementById("contentCards");
  if (cardsEl) {
    cardsEl.innerHTML = arr.length
      ? arr.map(c => `
        <article class="m-card" data-detail="${esc(c.id)}">
          <div class="m-card-top">
            <span class="m-card-date">${fmtDate(c.date, { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}</span>
            ${badge(c.status)}
          </div>
          <h4 class="m-card-title">${esc(c.title)}</h4>
          ${c.brief ? `<p class="m-card-brief">${esc(c.brief)}</p>` : ""}
          <div class="m-card-footer">
            <span class="meta-pill">${esc(c.format)}</span>
            <span class="meta-pill">${esc(c.platform)}</span>
            <span class="meta-pill">👤 ${esc(c.pic || "Tim Kreatif")}</span>
          </div>
        </article>
      `).join("")
      : `<div class="empty-state">${contents.length ? "Tidak ada konten yang sesuai filter." : emptyMsg()}</div>`;
  }
}

function renderAll() {
  renderedOnce = true;
  renderFilters();
  renderStats();
  renderCalendar();
  renderBoard();
  renderTable();
  renderSyncTime();
}

/* ---------- Detail Modal ---------- */
const STORYBOARD_MAP = {
  "2026-12-03": {
    img: "storyboards/storyboard_3_des_murajaah.jpg",
    title: "Storyboard 3 Desember: Murajaah Huruf Hijaiyah"
  },
  "2026-12-06": {
    img: "storyboards/storyboard_6_des_info_spmb.jpg",
    title: "Storyboard 6 Desember: Kode Rahasia Diskon SPMB"
  },
  "2026-12-10": {
    img: "storyboards/storyboard_10_des_hiburan.jpg",
    title: "Storyboard 10 Desember: Tebak Suara Ustadz & Ustadzah"
  }
};

function openDetail(id) {
  const c = contents.find(x => x.id === id);
  if (!c) return;
  const sb = STORYBOARD_MAP[c.date];
  document.getElementById("detailTitle").textContent = c.title;
  document.getElementById("detailBody").innerHTML = `
    <div class="detail-grid">
      <div class="detail-box">
        <span>Tanggal Tayang</span>
        <b>${esc(fmtDate(c.date, { weekday: "long", day: "numeric", month: "long", year: "numeric" }))}</b>
      </div>
      <div class="detail-box">
        <span>Status Produksi</span>
        <b>${badge(c.status)}</b>
      </div>
      <div class="detail-box">
        <span>Format Konten</span>
        <b>${esc(c.format)}</b>
      </div>
      <div class="detail-box">
        <span>Platform Distribusi</span>
        <b>${esc(c.platform)}</b>
      </div>
      <div class="detail-box full">
        <span>Penanggung Jawab (PIC)</span>
        <b>${esc(c.pic || "Tim Kreatif SPMB")}</b>
      </div>
      <div class="detail-box full">
        <span>Brief &amp; Konsep Caption</span>
        <p>${esc(c.brief || "Belum ada catatan brief untuk konten ini.").replace(/\n/g, "<br>")}</p>
      </div>
      ${sb ? `
      <div class="detail-box full">
        <span>Visual Storyboard Produksi</span>
        <a href="${esc(sb.img)}" target="_blank" rel="noopener noreferrer" style="display:block;margin-top:8px">
          <img src="${esc(sb.img)}" alt="${esc(sb.title)}" style="width:100%;border-radius:10px;border:1px solid #dce7e0;display:block">
        </a>
      </div>` : ""}
      <div class="detail-box full">
        <span>Tautan Referensi</span>
        ${c.refs.length ? `<div class="ref-list big">${refHtml(c.refs)}</div>` : '<p class="muted">Tidak ada tautan referensi.</p>'}
      </div>
    </div>`;
  const m = document.getElementById("detailModal");
  m.classList.add("open");
  m.setAttribute("aria-hidden", "false");
}

function closeDetail() {
  const m = document.getElementById("detailModal");
  m.classList.remove("open");
  m.setAttribute("aria-hidden", "true");
}

/* ---------- Event Listeners ---------- */
document.querySelectorAll("[data-view]").forEach(b =>
  b.addEventListener("click", () => gotoView(b.dataset.view))
);
document.querySelectorAll("[data-goto]").forEach(b =>
  b.addEventListener("click", () => gotoView(b.dataset.goto))
);
document.getElementById("closeDetail").addEventListener("click", closeDetail);
document.getElementById("detailModal").addEventListener("click", e => {
  if (e.target.id === "detailModal") closeDetail();
});
document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeDetail();
  if (e.key === "Enter" && e.target.matches("[data-detail]")) openDetail(e.target.dataset.detail);
});
document.addEventListener("click", e => {
  const b = e.target.closest("[data-detail]");
  if (b) openDetail(b.dataset.detail);
});

document.getElementById("prevMonth").addEventListener("click", () => {
  currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
  renderCalendar();
});
document.getElementById("nextMonth").addEventListener("click", () => {
  currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
  renderCalendar();
});
document.getElementById("todayBtn").addEventListener("click", () => {
  const d = new Date();
  currentMonth = new Date(d.getFullYear(), d.getMonth(), 1);
  renderCalendar();
});
document.getElementById("monthViewBtn").addEventListener("click", () => {
  calendarMode = "month";
  document.getElementById("monthViewBtn").classList.add("selected");
  document.getElementById("listViewBtn").classList.remove("selected");
  renderCalendar();
});
document.getElementById("listViewBtn").addEventListener("click", () => {
  calendarMode = "list";
  document.getElementById("listViewBtn").classList.add("selected");
  document.getElementById("monthViewBtn").classList.remove("selected");
  renderCalendar();
});

["calStatus", "calPlatform"].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener("change", renderCalendar);
});
["listStatus", "listPlatform"].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener("change", renderTable);
});
const boardPlatEl = document.getElementById("boardPlatform");
if (boardPlatEl) boardPlatEl.addEventListener("change", renderBoard);

document.getElementById("globalSearch").addEventListener("input", e => {
  searchTerm = e.target.value;
  renderAll();
});

["reloadSide", "reloadTop"].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener("click", () => syncScheduleData(true));
});

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) syncScheduleData();
});
setInterval(() => {
  if (!document.hidden) syncScheduleData();
}, 60000);

renderAll();
syncScheduleData();

/* ================= Visual Motion & Effects ================= */
function prefersReduced() {
  return window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function countUp(el, to) {
  if (!el) return;
  to = Number(to) || 0;
  const from = Number(el.dataset.v || 0);
  el.dataset.v = to;
  if (prefersReduced() || from === to) {
    el.textContent = to;
    return;
  }
  const t0 = performance.now(), dur = 850;
  cancelAnimationFrame(el._raf);
  const step = t => {
    const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(from + (to - from) * e);
    if (p < 1) el._raf = requestAnimationFrame(step);
  };
  el._raf = requestAnimationFrame(step);
}

/* Top Scroll Progress Bar */
(function () {
  const bar = document.createElement("div");
  bar.className = "scroll-progress";
  document.body.appendChild(bar);
  const f = () => {
    const h = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`;
  };
  addEventListener("scroll", f, { passive: true });
  f();
})();

/* Cursor Spotlight & Subtle Card Tilt */
document.addEventListener("pointermove", e => {
  const c = e.target.closest && e.target.closest(".stat-card, .panel, .welcome, .quick-links");
  if (!c) return;
  const r = c.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
  c.style.setProperty("--mx", x + "px");
  c.style.setProperty("--my", y + "px");
  if (c.classList.contains("stat-card") && !prefersReduced() && window.innerWidth > 820) {
    const rx = ((y / r.height) - 0.5) * -8;
    const ry = ((x / r.width) - 0.5) * 8;
    c.style.transform = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
  }
});

document.addEventListener("pointerout", e => {
  const c = e.target.closest && e.target.closest(".stat-card");
  if (c && !c.contains(e.relatedTarget)) c.style.transform = "";
});

/* Button Ripple Effect */
document.addEventListener("click", e => {
  const b = e.target.closest(".btn, .nav-item, .icon-btn, .view-toggle button");
  if (!b || prefersReduced()) return;
  const r = b.getBoundingClientRect(), s = Math.max(r.width, r.height);
  const d = document.createElement("span");
  d.className = "ripple";
  d.style.cssText = `width:${s}px;height:${s}px;left:${e.clientX - r.left - s / 2}px;top:${e.clientY - r.top - s / 2}px`;
  b.appendChild(d);
  setTimeout(() => d.remove(), 620);
});

/* Hero Constellation Particles */
(function () {
  const host = document.querySelector(".welcome");
  if (!host || prefersReduced()) return;
  const cv = document.createElement("canvas");
  cv.className = "particles";
  host.prepend(cv);
  const ctx = cv.getContext("2d");
  let w, h, ps = [];

  function size() {
    w = cv.width = host.clientWidth;
    h = cv.height = host.clientHeight;
    ps = Array.from({ length: Math.max(16, Math.floor(w / 36)) }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 2 + 0.6,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35
    }));
  }
  size();
  addEventListener("resize", size);

  let mx = -999, my = -999;
  host.addEventListener("pointermove", e => {
    const r = host.getBoundingClientRect();
    mx = e.clientX - r.left;
    my = e.clientY - r.top;
  });
  host.addEventListener("pointerleave", () => { mx = my = -999; });

  (function loop() {
    if (!document.hidden) {
      ctx.clearRect(0, 0, w, h);
      ps.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        const dx = p.x - mx, dy = p.y - my, dist = Math.hypot(dx, dy);
        if (dist < 85) {
          p.x += (dx / dist) * 1.1;
          p.y += (dy / dist) * 1.1;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 7);
        ctx.fillStyle = "rgba(235, 208, 137, 0.7)";
        ctx.fill();
      });
      for (let i = 0; i < ps.length; i++) {
        for (let j = i + 1; j < ps.length; j++) {
          const d = Math.hypot(ps[i].x - ps[j].x, ps[i].y - ps[j].y);
          if (d < 92) {
            ctx.strokeStyle = `rgba(235, 208, 137, ${0.2 * (1 - d / 92)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(ps[i].x, ps[i].y);
            ctx.lineTo(ps[j].x, ps[j].y);
            ctx.stroke();
          }
        }
      }
    }
    requestAnimationFrame(loop);
  })();
})();
