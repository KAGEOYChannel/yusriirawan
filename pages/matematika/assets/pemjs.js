const $ = s => document.querySelector(s);
const acak = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const prog = {1: false, 2: false};

function tandai(n) {
  prog[n] = true;
  $(`[data-s="${n}"]`).classList.add('ok');
  if (prog[1] && prog[2]) {
    $('#kunci').hidden = true;
    $('#papan3').hidden = false;
    $('#s3').classList.remove('terkunci');
    $('#pesan2').textContent += ' Bagian 3 sudah terbuka!';
    baru3();
  }
}
function pesan(id, teks, jenis) {
  const e = $(id);
  e.textContent = teks;
  e.className = 'pesan' + (jenis ? ' ' + jenis : '');
}

/* ---------- Bagian 1: bagi kue sama rata ---------- */
let kue = 12, piring = 3, sisa, tiap, putaran;

function atur(k, d) {
  if (k === 'kue') kue = Math.min(30, Math.max(4, kue + d));
  else piring = Math.min(6, Math.max(2, piring + d));
  reset1();
}
function reset1() {
  sisa = kue; tiap = Array(piring).fill(0); putaran = 0;
  $('#vKue').textContent = kue;
  $('#vPiring').textContent = piring;
  $('#bagi1').disabled = sisa < piring;
  gambar1();
  pesan('#pesan1', `Ada ${kue} kue dan ${piring} piring. Bagikan satu-satu supaya adil.`);
}
function gambar1() {
  $('#nampan').innerHTML = '<i>🍪</i>'.repeat(sisa) || 'Nampan kosong';
  $('#piringan').innerHTML = tiap.map((n, i) =>
    `<div class="piring"><span>${'🍪'.repeat(n)}</span><small>Piring ${i + 1}: ${n}</small></div>`).join('');
}
function bagi1() {
  if (sisa < piring) return;
  putaran++; sisa -= piring; tiap = tiap.map(n => n + 1);
  gambar1();
  if (sisa >= piring) {
    pesan('#pesan1', `Putaran ${putaran}: tiap piring punya ${putaran} kue. Sisa di nampan: ${sisa}.`);
    return;
  }
  $('#bagi1').disabled = true;
  let t = `Selesai! Tiap piring dapat ${putaran} kue. Itu berarti ${kue} ÷ ${piring} = ${putaran}.`;
  t += sisa ? ` Sisa ${sisa} kue tidak cukup untuk satu putaran lagi.` :
    ` Cek dengan perkalian: ${piring} × ${putaran} = ${piring * putaran}.`;
  pesan('#pesan1', t, 'benar');
  tandai(1);
}

/* ---------- Bagian 2: pembagian dicari dengan perkalian ---------- */
let fa, fb, benar2 = 0;

function soal2() {
  fa = acak(2, 9); fb = acak(2, 9);
  const p = fa * fb;
  $('#tanya2').innerHTML =
    `<p class="besar">${p} ÷ ${fa} = ?</p>` +
    `<div class="grup">${Array.from({length: fa}, () => `<div>${'●'.repeat(fb)}</div>`).join('')}</div>` +
    `<p>${fa} kelompok sama banyak, jumlah semuanya ${p}. Cari: <b>${fa} × ? = ${p}</b></p>`;
  $('#in2').value = ''; $('#in2').focus({preventScroll: true});
}
$('#form2').addEventListener('submit', e => {
  e.preventDefault();
  const p = fa * fb, j = +$('#in2').value;
  if (j === fb) {
    benar2++; $('#skor2').textContent = Math.min(benar2, 3);
    pesan('#pesan2', `Benar! ${fa} × ${fb} = ${p}, jadi ${p} ÷ ${fa} = ${fb}. Keluarga fakta: ${fb} × ${fa} = ${p}, ${p} ÷ ${fb} = ${fa}.`, 'benar');
    if (benar2 === 3 && !prog[2]) tandai(2);
    else setTimeout(soal2, 1800);
    if (benar2 >= 3) setTimeout(soal2, 1800);
  } else {
    const loncat = Array.from({length: Math.ceil(p / fa)}, (_, i) => fa * (i + 1)).join(', ');
    pesan('#pesan2', `Belum tepat. Hitung loncat ${fa}: ${loncat}. Ada berapa kali loncatan sampai ${p}?`, 'salah');
  }
});

/* ---------- Bagian 3: bagi bersusun panjang, bertahap ---------- */
const PAD = 4;
let N, D, steps, k, st, selesai;

function hitung(n, d) {
  const dg = String(n).split('').map(Number);
  let i = 0, cur = dg[0], rem = 0, out = [];
  while (cur < d && i < dg.length - 1) cur = cur * 10 + dg[++i];
  for (let p = i; p < dg.length; p++) {
    if (p > i) cur = rem * 10 + dg[p];
    const q = Math.floor(cur / d), prod = q * d;
    rem = cur - prod;
    out.push({p, cur, q, prod, rem});
  }
  return {dg, out};
}
function baru3() {
  D = acak(2, 9);
  do { N = acak(100, 999); } while (N < D * 10);
  const h = hitung(N, D);
  steps = h.out; k = 0; st = 0; selesai = false;
  $('#tabel3').hidden = true;
  pesan('#pesan3', '');
  gambar3();
}
const spasi = n => ' '.repeat(Math.max(0, n));
const kolom = (s, p) => spasi(PAD + p + 1 - s.length) + s;

function gambar3() {
  const n = String(N).length, L = [];
  const qs = Array(n).fill(' ');
  steps.forEach((s, j) => {
    if (j < k || (j === k && (st >= 1 || selesai))) qs[s.p] = `<span class="q">${s.q}</span>`;
    else if (j === k && st === 0) qs[s.p] = '<span class="tanya">?</span>';
  });
  L.push(spasi(PAD) + qs.join(''));
  L.push(spasi(PAD) + '─'.repeat(n));
  L.push(`${D} ) ${N}`);
  const last = steps.length - 1;
  steps.forEach((s, j) => {
    if (j > k) return;
    const cs = String(s.cur), ps = String(s.prod), rs = String(s.rem);
    if (j > 0) L.push(kolom(cs, s.p));
    if (j < k || st >= 1 || selesai) {
      const asking = j === k && st === 1 && !selesai;
      const t = asking ? '?'.repeat(Math.max(1, ps.length)) : ps;
      L.push(spasi(PAD + s.p - t.length) + '−' + t);
      L.push(kolom('─'.repeat(cs.length), s.p));
    }
    const showRem = (j === k && st >= 2) || (j === last && selesai);
    if (showRem) {
      const asking = j === k && st === 2 && !selesai;
      L.push(kolom(asking ? '?' : rs, s.p));
    }
  });
  $('#susun').innerHTML = L.map((x, i) => i === 0 ? x : x.replace(/\?+/g, m => `<span class="tanya">${m}</span>`)).join('\n');
  tugas3();
}
function tugas3() {
  const s = steps[k], form = $('#form3');
  const turun = $('#turun3'), cek = $('#cek3'), inp = $('#in3');
  if (selesai) {
    const Q = steps.map(x => x.q).join(''), R = steps[steps.length - 1].rem;
    $('#tugas3').textContent = `Hasil: ${N} ÷ ${D} = ${+Q}${R ? ' sisa ' + R : ''}. Cek dengan perkalian: ${D} × ${+Q}${R ? ' + ' + R : ''} = ${N}. Cocok!`;
    form.hidden = true; return;
  }
  form.hidden = false;
  const harusTurun = st === 3;
  turun.hidden = !harusTurun; cek.hidden = harusTurun; inp.hidden = harusTurun;
  form.querySelector('label').hidden = harusTurun;
  inp.value = '';
  if (!harusTurun) inp.focus({preventScroll: true});
  $('#tugas3').textContent = [
    `BAGI: Berapa kali ${D} masuk ke ${s.cur}? Pikirkan ${D} × ? yang paling dekat dengan ${s.cur}, tapi tidak lebih.`,
    `KALI: ${D} × ${s.q} = ?`,
    `KURANG: ${s.cur} − ${s.prod} = ?`,
    `TURUNKAN: Ada angka berikutnya di ${N}. Turunkan di samping sisa ${s.rem}.`
  ][st];
  turun.textContent = `Turunkan angka ${String(N)[s.p + 1]}`;
}
$('#form3').addEventListener('submit', e => {
  e.preventDefault();
  const s = steps[k], j = +$('#in3').value;
  const kunci = [s.q, s.prod, s.rem][st];
  if (j !== kunci) {
    let t = 'Belum tepat, coba lagi.';
    if (st === 0) t = j * D > s.cur ? `Terlalu besar: ${D} × ${j} = ${j * D}, lebih dari ${s.cur}.` :
      `Masih bisa lebih besar: ${D} × ${j} = ${j * D}, sisanya masih cukup untuk ${D} lagi.`;
    if (st === 1) t = `Hitung ${D} × ${s.q}. Pakai perkalian yang kamu hafal.`;
    if (st === 2) t = `Kurangkan ${s.cur} dengan ${s.prod}.`;
    pesan('#pesan3', t, 'salah'); return;
  }
  pesan('#pesan3', 'Tepat!', 'benar');
  if (st === 2 && k === steps.length - 1) selesai = true; else st++;
  gambar3();
});
$('#turun3').addEventListener('click', () => {
  k++; st = 0; pesan('#pesan3', ''); gambar3();
});
function tabelKali() {
  const t = $('#tabel3');
  t.innerHTML = Array.from({length: 9}, (_, i) => `<span>${D} × ${i + 1} = ${D * (i + 1)}</span>`).join('');
  t.hidden = !t.hidden;
}

reset1();
soal2();
