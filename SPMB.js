const STORAGE_KEY = "madaniContentCalendar2027";
const STATUS = ["Ide","Brief","Produksi","Review","Terjadwal","Published"];
const CHECKLIST = [
  "Tentukan tema dan tujuan konten",
  "Kumpulkan foto, video, dan bahan pendukung",
  "Selesaikan desain dan editing",
  "Review caption, ejaan, dan identitas sekolah",
  "Pastikan jadwal tayang dan evaluasi insight"
];
const seed = [
 {id:"c1",date:"2026-10-27",title:"Foto calon model SPMB",format:"Foto",platform:"Instagram",status:"Terjadwal",pic:"Tim Foto",brief:"Foto siswa dengan baju yayasan untuk kebutuhan promosi SPMB. Pastikan izin dokumentasi."},
 {id:"c2",date:"2026-10-28",title:"Teaser SPMB 2027/2028",format:"Reels",platform:"Instagram",status:"Ide",pic:"Tim Video",brief:"Bangun rasa penasaran tentang penerimaan siswa baru."},
 {id:"c3",date:"2026-10-30",title:"Kenalan dengan SDS IT Madani",format:"Carousel",platform:"Instagram",status:"Brief",pic:"Tim Desain",brief:"Kenalkan lingkungan sekolah, program unggulan, dan nilai Islami."},
 {id:"c4",date:"2026-11-02",title:"Keseruan belajar di kelas",format:"Reels",platform:"TikTok",status:"Produksi",pic:"Tim Video",brief:"Tampilkan aktivitas belajar yang aktif dan menyenangkan."},
 {id:"c5",date:"2026-11-04",title:"Fasilitas sekolah",format:"Carousel",platform:"Instagram",status:"Ide",pic:"Tim Desain",brief:"Sorot fasilitas belajar dan lingkungan sekolah."},
 {id:"c6",date:"2026-11-06",title:"Mengapa memilih SDS IT Madani?",format:"Reels",platform:"Instagram",status:"Ide",pic:"Tim Video",brief:"Konten keunggulan sekolah dengan narasi singkat."},
 {id:"c7",date:"2026-11-09",title:"Program tahfiz dan pembiasaan Islami",format:"Carousel",platform:"Facebook",status:"Ide",pic:"Tim Copywriting",brief:"Jelaskan pembelajaran dan pembiasaan karakter Islami."},
 {id:"c8",date:"2026-11-11",title:"Testimoni orang tua",format:"Video",platform:"Instagram",status:"Ide",pic:"Tim Wawancara",brief:"Cerita pengalaman orang tua, dengan persetujuan narasumber."},
 {id:"c9",date:"2026-11-13",title:"FAQ pendaftaran siswa baru",format:"Carousel",platform:"Instagram",status:"Ide",pic:"Tim Copywriting",brief:"Jawab pertanyaan tentang persyaratan dan alur pendaftaran."},
 {id:"c10",date:"2026-11-16",title:"Sehari bersama siswa Madani",format:"Reels",platform:"TikTok",status:"Ide",pic:"Tim Video",brief:"Cerita keseharian siswa dari datang hingga kegiatan belajar."}
];
const EXCEL_FILE = "content-calendar.xlsx";
const HIDDEN_KEY = "madaniHiddenExcelIds";
let localContents = loadLocal();      // data yang diedit/ditambah di browser ini
let excelContents = [];               // data dari content-calendar.xlsx
let hiddenIds = loadHidden();         // baris Excel yang dihapus lewat aplikasi
let excelState = {status:"loading",count:0,time:null,msg:""};
let contents = [];
let excelFirstRun = true;
rebuildContents();
let currentView = "dashboard";
let currentMonth = new Date(2026,9,1);
let calendarMode = "month";
let searchTerm = "";
let toastTimer;
let checklist = loadChecklist();

function loadLocal(){
  try { const data = JSON.parse(localStorage.getItem(STORAGE_KEY)); return Array.isArray(data) ? data : null; }
  catch { return null; }
}
function loadHidden(){ try { const x = JSON.parse(localStorage.getItem(HIDDEN_KEY)); return Array.isArray(x) ? x : []; } catch { return []; } }
function contentKey(c){ return `${c.date}|${String(c.title||"").toLowerCase().trim()}`; }
function rebuildContents(){
  const base = localContents ?? (excelState.status === "error" ? structuredClone(seed) : []);
  const ids = new Set(base.map(c=>c.id)), keys = new Set(base.map(contentKey));
  const fromExcel = excelContents
    .filter(c=>!hiddenIds.includes(c.id) && !ids.has(c.id) && !keys.has(contentKey(c)))
    .map(c=>({...c,source:"excel"}));
  contents = [...base, ...fromExcel];
}
function ensureLocal(){ if(!localContents) localContents = contents.filter(c=>c.source!=="excel").map(c=>({...c})); }
function upsertLocal(item){
  ensureLocal();
  const {source,...clean} = item;
  const i = localContents.findIndex(c=>c.id===clean.id);
  if(i>=0) localContents[i] = clean; else localContents.push(clean);
}
function persist(){
  if(localContents) localStorage.setItem(STORAGE_KEY, JSON.stringify(localContents));
  localStorage.setItem(HIDDEN_KEY, JSON.stringify(hiddenIds));
  rebuildContents(); renderAll();
}
function loadChecklist(){ try { const x=JSON.parse(localStorage.getItem("madaniChecklist")); return Array.isArray(x)?x:[false,false,false,false,false]; } catch{return [false,false,false,false,false];} }
function saveChecklist(){localStorage.setItem("madaniChecklist",JSON.stringify(checklist));renderChecklist();}
function esc(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function fmtDate(date,opts={day:"numeric",month:"short",year:"numeric"}){if(!date)return "-";const [y,m,d]=date.split("-").map(Number);return new Date(y,m-1,d).toLocaleDateString("id-ID",opts);}
function monthKey(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;}
function statusClass(s){return "status-"+String(s||"Ide").toLowerCase().replace(/\s+/g,"-");}
function badge(s){return `<span class="status ${statusClass(s)}">${esc(s||"Ide")}</span>`;}
function filteredItems(){return contents.filter(c=>`${c.title} ${c.pic} ${c.brief} ${c.platform}`.toLowerCase().includes(searchTerm.toLowerCase()));}
function showToast(msg){const el=document.getElementById("toast");el.textContent=msg;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),2800);}
function gotoView(view){currentView=view;document.querySelectorAll(".view").forEach(el=>el.classList.toggle("active",el.id===`view-${view}`));document.querySelectorAll(".nav-item[data-view]").forEach(el=>el.classList.toggle("active",el.dataset.view===view));document.getElementById("pageTitle").textContent=({dashboard:"Dashboard",calendar:"Kalender Konten",content:"Semua Konten",checklist:"Checklist Tim"})[view]||"Dashboard";renderAll();window.scrollTo({top:0,behavior:"smooth"});}
function renderStats(){document.getElementById("statTotal").textContent=contents.length;document.getElementById("statPublished").textContent=contents.filter(c=>c.status==="Published").length;document.getElementById("statProcess").textContent=contents.filter(c=>["Brief","Produksi","Review","Terjadwal"].includes(c.status)).length;document.getElementById("statIdeas").textContent=contents.filter(c=>c.status==="Ide").length;
 const counts=STATUS.map(s=>({s,n:contents.filter(c=>c.status===s).length}));const max=Math.max(1,...counts.map(x=>x.n));document.getElementById("statusChart").innerHTML=counts.map(x=>`<div class="bar-row"><span>${esc(x.s)}</span><div class="bar-track"><div class="bar-fill" style="width:${x.n/max*100}%"></div></div><b>${x.n}</b></div>`).join("");document.getElementById("chartLegend").innerHTML=counts.filter(x=>x.n).map(x=>`<span class="legend-pill">${esc(x.s)} · ${x.n}</span>`).join("")||'<span class="legend-pill">Belum ada data</span>';
 const upcoming=filteredItems().filter(c=>c.date).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,5);document.getElementById("upcomingList").innerHTML=upcoming.length?upcoming.map(c=>`<div class="upcoming-item"><div class="date-chip"><b>${c.date.slice(8,10)}</b><small>${fmtDate(c.date,{month:"short"}).toUpperCase()}</small></div><div><div class="upcoming-title">${esc(c.title)}</div><div class="upcoming-meta">${esc(c.format)} · ${esc(c.platform)} · ${esc(c.pic||"PIC belum ditentukan")}</div></div>${badge(c.status)}</div>`).join(""):'<div class="empty-state">Belum ada konten. Tambahkan rencana pertamamu.</div>';
}
function setSelectOptions(id, values){const el=document.getElementById(id),old=el.value;const first=el.options[0].outerHTML;el.innerHTML=first+values.filter(Boolean).sort().map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join("");if(values.includes(old))el.value=old;}
function renderFilters(){const platforms=[...new Set(contents.map(c=>c.platform))];["calStatus","listStatus"].forEach(id=>setSelectOptions(id,STATUS));["calPlatform","listPlatform"].forEach(id=>setSelectOptions(id,platforms));}
function renderDashboard(){renderStats();}
function renderCalendar(){
 const y=currentMonth.getFullYear(),m=currentMonth.getMonth();document.getElementById("monthLabel").textContent=currentMonth.toLocaleDateString("id-ID",{month:"long",year:"numeric"});
 const st=document.getElementById("calStatus").value,pl=document.getElementById("calPlatform").value;
 const all=filteredItems().filter(c=>(!st||c.status===st)&&(!pl||c.platform===pl));
 const container=document.getElementById("calendarContainer");
 if(calendarMode==="list"){
   const monthItems=all.filter(c=>c.date.startsWith(monthKey(currentMonth))).sort((a,b)=>a.date.localeCompare(b.date));
   const groups={};monthItems.forEach(c=>(groups[c.date]??=[]).push(c));
   container.innerHTML=Object.keys(groups).length?Object.keys(groups).map(d=>`<div class="list-date-group"><div class="list-date-title">${fmtDate(d,{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</div>${groups[d].map(c=>`<div class="list-event"><div><b>${esc(c.title)}</b><p>${esc(c.format)} · ${esc(c.platform)} · ${esc(c.pic||"PIC belum ditentukan")}</p></div><div>${badge(c.status)} <button class="small-btn" data-edit="${esc(c.id)}">Edit</button></div></div>`).join("")}</div>`).join(""):'<div class="empty-state">Tidak ada konten untuk bulan/filter ini.</div>';
   return;
 }
 const firstDay=(new Date(y,m,1).getDay()+6)%7;const daysInMonth=new Date(y,m+1,0).getDate();const prevDays=new Date(y,m,0).getDate();const totalCells=Math.ceil((firstDay+daysInMonth)/7)*7;
 let out='<div class="calendar-grid">'+["SEN","SEL","RAB","KAM","JUM","SAB","MIN"].map(d=>`<div class="weekday">${d}</div>`).join("");
 const today=new Date();const todayStr=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
 for(let i=0;i<totalCells;i++){let day,cellDate,other=false;if(i<firstDay){day=prevDays-firstDay+i+1;cellDate=new Date(y,m-1,day);other=true;}else if(i>=firstDay+daysInMonth){day=i-(firstDay+daysInMonth)+1;cellDate=new Date(y,m+1,day);other=true;}else{day=i-firstDay+1;cellDate=new Date(y,m,day);}const key=`${cellDate.getFullYear()}-${String(cellDate.getMonth()+1).padStart(2,"0")}-${String(cellDate.getDate()).padStart(2,"0")}`;const dayEvents=all.filter(c=>c.date===key);out+=`<div class="day-cell ${other?"other-month":""}"><div class="day-number ${key===todayStr?"today":""}"><span>${day}</span></div>${dayEvents.slice(0,3).map(c=>`<button class="event ${statusClass(c.status)}" title="${esc(c.title)}" data-edit="${esc(c.id)}">${esc(c.title)}</button>`).join("")}${dayEvents.length>3?`<div class="more-events">+${dayEvents.length-3} lainnya</div>`:""}</div>`;}
 out+="</div>";container.innerHTML=out;
}
function renderTable(){const st=document.getElementById("listStatus").value,pl=document.getElementById("listPlatform").value;const arr=filteredItems().filter(c=>(!st||c.status===st)&&(!pl||c.platform===pl)).sort((a,b)=>(b.date||"").localeCompare(a.date||""));document.getElementById("resultCount").textContent=`${arr.length} konten`;document.getElementById("contentTable").innerHTML=arr.length?arr.map(c=>`<tr><td>${fmtDate(c.date,{day:"2-digit",month:"short",year:"numeric"})}</td><td><div class="td-title">${esc(c.title)}</div><span class="td-sub">${esc(c.brief||"Belum ada brief")}</span></td><td>${esc(c.format)}</td><td>${esc(c.platform)}</td><td>${esc(c.pic||"—")}</td><td><select class="inline-status" data-status-id="${esc(c.id)}" aria-label="Status ${esc(c.title)}">${STATUS.map(s=>`<option ${s===c.status?"selected":""}>${esc(s)}</option>`).join("")}</select></td><td><div class="table-actions"><button class="small-btn" data-edit="${esc(c.id)}">Edit</button></div></td></tr>`).join(""):'<tr><td colspan="7"><div class="empty-state">Belum ada konten yang sesuai filter.</div></td></tr>';
 document.querySelectorAll(".inline-status").forEach(sel=>sel.addEventListener("change",()=>{const c=contents.find(x=>x.id===sel.dataset.statusId);if(c){upsertLocal({...c,status:sel.value});persist();showToast("Status konten diperbarui.");}}));
}
function renderChecklist(){const done=checklist.filter(Boolean).length;document.getElementById("checkProgress").style.width=`${done/5*100}%`;document.getElementById("checkProgressText").textContent=`${done} dari 5 selesai`;document.getElementById("checklistItems").innerHTML=CHECKLIST.map((t,i)=>`<label class="check-row ${checklist[i]?"done":""}"><input type="checkbox" data-check="${i}" ${checklist[i]?"checked":""}><span>${esc(t)}</span></label>`).join("");document.querySelectorAll("[data-check]").forEach(el=>el.addEventListener("change",()=>{checklist[Number(el.dataset.check)]=el.checked;saveChecklist();}));}
function renderAll(){renderFilters();renderDashboard();renderCalendar();renderTable();renderChecklist();renderExcelStatus();}
function openModal(item=null){document.getElementById("contentForm").reset();document.getElementById("contentId").value=item?.id||"";document.getElementById("modalTitle").textContent=item?"Edit Konten":"Tambah Konten";document.getElementById("fTitle").value=item?.title||"";document.getElementById("fDate").value=item?.date||`${currentMonth.getFullYear()}-${String(currentMonth.getMonth()+1).padStart(2,"0")}-${String(new Date().getDate()).padStart(2,"0")}`;document.getElementById("fFormat").value=item?.format||"Reels";document.getElementById("fPlatform").value=item?.platform||"Instagram";document.getElementById("fStatus").value=item?.status||"Ide";document.getElementById("fPic").value=item?.pic||"";document.getElementById("fBrief").value=item?.brief||"";document.getElementById("deleteContent").classList.toggle("hidden",!item);document.getElementById("contentModal").classList.add("open");document.getElementById("contentModal").setAttribute("aria-hidden","false");}
function closeModal(){document.getElementById("contentModal").classList.remove("open");document.getElementById("contentModal").setAttribute("aria-hidden","true");}
function saveFromForm(e){e.preventDefault();const id=document.getElementById("contentId").value;const item={id:id||`c${Date.now()}`,date:document.getElementById("fDate").value,title:document.getElementById("fTitle").value.trim(),format:document.getElementById("fFormat").value,platform:document.getElementById("fPlatform").value,status:document.getElementById("fStatus").value,pic:document.getElementById("fPic").value.trim(),brief:document.getElementById("fBrief").value.trim()};if(!item.title||!item.date)return;upsertLocal(item);showToast(id?"Konten berhasil diperbarui.":"Konten berhasil ditambahkan.");currentMonth=new Date(Number(item.date.slice(0,4)),Number(item.date.slice(5,7))-1,1);closeModal();persist();}
function editById(id){const item=contents.find(c=>c.id===id);if(item)openModal(item);}
function deleteCurrent(){const id=document.getElementById("contentId").value;if(!id)return;if(confirm("Hapus konten ini? Tindakan ini tidak dapat dibatalkan.")){const target=contents.find(c=>c.id===id);ensureLocal();localContents=localContents.filter(c=>c.id!==id);excelContents.filter(e=>e.id===id||(target&&contentKey(e)===contentKey(target))).forEach(e=>{if(!hiddenIds.includes(e.id))hiddenIds.push(e.id);});closeModal();persist();showToast("Konten dihapus.");}}
function downloadWorkbook(templateOnly=false){if(typeof XLSX==="undefined"){showToast("Pustaka Excel belum termuat. Periksa koneksi internet.");return;}const rows=(templateOnly?[]:contents).map(c=>({"Tanggal":c.date,"Judul":c.title,"Format":c.format,"Platform":c.platform,"Status":c.status,"PIC":c.pic||"","Brief":c.brief||""}));if(templateOnly)rows.push({"Tanggal":"2026-11-20","Judul":"Contoh: Profil sekolah","Format":"Reels","Platform":"Instagram","Status":"Ide","PIC":"Tim Video","Brief":"Ganti baris contoh ini dengan rencana konten."});const ws=XLSX.utils.json_to_sheet(rows,{header:["Tanggal","Judul","Format","Platform","Status","PIC","Brief"]});ws["!cols"]=[{wch:14},{wch:35},{wch:15},{wch:18},{wch:15},{wch:22},{wch:55}];const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,"Content Calendar");XLSX.writeFile(wb,templateOnly?"Template_Content_Calendar_Madani.xlsx":"content-calendar.xlsx");showToast(templateOnly?"Template Excel diunduh.":"Data berhasil diekspor ke Excel.");}
function normalizeDate(v){if(v instanceof Date&&!isNaN(v))return `${v.getFullYear()}-${String(v.getMonth()+1).padStart(2,"0")}-${String(v.getDate()).padStart(2,"0")}`;if(typeof v==="number"&&XLSX?.SSF){const d=XLSX.SSF.parse_date_code(v);if(d)return `${d.y}-${String(d.m).padStart(2,"0")}-${String(d.d).padStart(2,"0")}`;}const s=String(v||"").trim();if(/^\d{4}-\d{1,2}-\d{1,2}$/.test(s)){const [y,m,d]=s.split("-");return `${y}-${m.padStart(2,"0")}-${d.padStart(2,"0")}`;}const m=s.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})$/);if(m)return `${m[3]}-${m[2].padStart(2,"0")}-${m[1].padStart(2,"0")}`;return s;}
function parseRows(rows){
  const find=(row,names)=>{const keys=Object.keys(row);const key=keys.find(k=>names.includes(k.toLowerCase().trim()));return key?row[key]:"";};
  return rows.filter(r=>find(r,["judul","judul konten","title"]).toString().trim()).map((r,i)=>{
    let status=String(find(r,["status"])||"Ide").trim();
    const matched=STATUS.find(s=>s.toLowerCase()===status.toLowerCase());status=matched||"Ide";
    return{id:`imp${Date.now()}${i}`,date:normalizeDate(find(r,["tanggal","date"])),title:String(find(r,["judul","judul konten","title"])).trim(),format:String(find(r,["format","jenis konten","tipe"])||"Reels").trim(),platform:String(find(r,["platform","kanal"])||"Instagram").trim(),status,pic:String(find(r,["pic","penanggung jawab","penanggungjawab"])||"").trim(),brief:String(find(r,["brief","caption","catatan"])||"").trim()};
  }).filter(c=>/^\d{4}-\d{2}-\d{2}$/.test(c.date));
}
function importWorkbook(file){
  if(!file)return;
  if(typeof XLSX==="undefined"){showToast("Pustaka Excel belum termuat. Periksa koneksi internet.");return;}
  const reader=new FileReader();
  reader.onload=e=>{try{
    const wb=XLSX.read(e.target.result,{type:"array"});
    const ws=wb.Sheets[wb.SheetNames[0]];
    const rows=XLSX.utils.sheet_to_json(ws,{defval:""});
    if(!rows.length){showToast("File kosong atau tidak memiliki baris data.");return;}
    const mapped=parseRows(rows);
    if(!mapped.length){showToast("Tidak ada baris valid. Periksa kolom Tanggal dan Judul.");return;}
    const replace=confirm(`Ditemukan ${mapped.length} konten valid. OK = ganti semua data saat ini dengan isi Excel. Cancel = gabungkan data Excel dengan data saat ini.`);
    if(replace){localContents=mapped;hiddenIds=excelContents.map(c=>c.id);}
    else{ensureLocal();const existing=new Set(contents.map(contentKey));mapped.forEach(c=>{if(!existing.has(contentKey(c))){localContents.push(c);existing.add(contentKey(c));}});}
    currentMonth=new Date(Number(mapped[0].date.slice(0,4)),Number(mapped[0].date.slice(5,7))-1,1);
    persist();gotoView("calendar");showToast(`${mapped.length} baris Excel berhasil diproses.`);
  }catch(err){console.error(err);showToast("File gagal dibaca. Gunakan template Excel yang tersedia.");}};
  reader.readAsArrayBuffer(file);
}
async function loadExcelFile(manual=false){
  if(typeof XLSX==="undefined"){excelState={status:"error",count:0,time:new Date(),msg:"Pustaka Excel belum termuat (cek internet)."};rebuildContents();renderAll();return;}
  const before=JSON.stringify(excelContents);
  try{
    const res=await fetch(`${EXCEL_FILE}?t=${Date.now()}`,{cache:"no-store"});
    if(!res.ok)throw new Error(res.status===404?`File ${EXCEL_FILE} tidak ditemukan di folder yang sama dengan HTML.`:`Gagal memuat (HTTP ${res.status}).`);
    const wb=XLSX.read(await res.arrayBuffer(),{type:"array"});
    const rows=XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{defval:""});
    excelContents=parseRows(rows).map(c=>({...c,id:`xl|${c.date}|${c.title.toLowerCase()}`}));
    excelState={status:"ok",count:excelContents.length,time:new Date(),msg:""};
    if(manual)showToast(`${excelContents.length} konten dimuat dari ${EXCEL_FILE}.`);
  }catch(err){
    const local=location.protocol==="file:";
    excelState={status:"error",count:excelContents.length,time:new Date(),msg:local?`Browser memblokir pembacaan file saat dibuka langsung (file://). Jalankan lewat server/hosting agar ${EXCEL_FILE} terbaca.`:(err.message||"Gagal memuat file.")};
    if(manual)showToast("Gagal memuat "+EXCEL_FILE);
  }
  const changed=before!==JSON.stringify(excelContents);
  rebuildContents();
  if(changed||manual||excelFirstRun||excelState.status==="error"){excelFirstRun=false;renderAll();}else{renderExcelStatus();}
}
function renderExcelStatus(){
  const el=document.getElementById("excelSync");if(!el)return;
  const t=excelState.time?excelState.time.toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit"}):"";
  if(excelState.status==="ok"){el.className="sync-status ok";el.innerHTML=`<b>● Tersinkron</b> ${esc(EXCEL_FILE)} · ${excelState.count} baris terbaca · ${t}`;}
  else if(excelState.status==="error"){el.className="sync-status err";el.innerHTML=`<b>● Belum terbaca</b> ${esc(excelState.msg)}`;}
  else{el.className="sync-status";el.innerHTML=`<b>◷ Memuat</b> ${esc(EXCEL_FILE)}...`;}
}
document.querySelectorAll("[data-view]").forEach(b=>b.addEventListener("click",()=>gotoView(b.dataset.view)));
document.querySelectorAll("[data-goto]").forEach(b=>b.addEventListener("click",()=>gotoView(b.dataset.goto)));
["addTop","addContentBtn"].forEach(id=>document.getElementById(id).addEventListener("click",()=>openModal()));
document.getElementById("closeModal").addEventListener("click",closeModal);document.getElementById("cancelModal").addEventListener("click",closeModal);document.getElementById("contentForm").addEventListener("submit",saveFromForm);document.getElementById("deleteContent").addEventListener("click",deleteCurrent);
document.getElementById("contentModal").addEventListener("click",e=>{if(e.target.id==="contentModal")closeModal();});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal();});
document.getElementById("prevMonth").addEventListener("click",()=>{currentMonth.setMonth(currentMonth.getMonth()-1);renderCalendar();});
document.getElementById("nextMonth").addEventListener("click",()=>{currentMonth.setMonth(currentMonth.getMonth()+1);renderCalendar();});
document.getElementById("todayBtn").addEventListener("click",()=>{const d=new Date();currentMonth=new Date(d.getFullYear(),d.getMonth(),1);renderCalendar();});
document.getElementById("monthViewBtn").addEventListener("click",()=>{calendarMode="month";document.getElementById("monthViewBtn").classList.add("selected");document.getElementById("listViewBtn").classList.remove("selected");renderCalendar();});
document.getElementById("listViewBtn").addEventListener("click",()=>{calendarMode="list";document.getElementById("listViewBtn").classList.add("selected");document.getElementById("monthViewBtn").classList.remove("selected");renderCalendar();});
["calStatus","calPlatform"].forEach(id=>document.getElementById(id).addEventListener("change",renderCalendar));["listStatus","listPlatform"].forEach(id=>document.getElementById(id).addEventListener("change",renderTable));
document.getElementById("globalSearch").addEventListener("input",e=>{searchTerm=e.target.value;renderAll();});
document.getElementById("templateBtn").addEventListener("click",()=>downloadWorkbook(true));document.getElementById("exportSide").addEventListener("click",()=>downloadWorkbook(false));document.getElementById("exportSide").addEventListener("click",()=>gotoView("content"));document.getElementById("importSide").addEventListener("click",()=>document.getElementById("excelInput").click());document.getElementById("importMain").addEventListener("click",()=>document.getElementById("excelInput").click());document.getElementById("excelInput").addEventListener("change",e=>{importWorkbook(e.target.files[0]);e.target.value="";});
document.getElementById("resetChecklist").addEventListener("click",()=>{if(confirm("Reset semua checklist?")){checklist=[false,false,false,false,false];saveChecklist();}});
document.addEventListener("click",e=>{const b=e.target.closest("[data-edit]");if(b)editById(b.dataset.edit);});
document.getElementById("reloadExcel").addEventListener("click",()=>loadExcelFile(true));
document.addEventListener("visibilitychange",()=>{if(!document.hidden)loadExcelFile();});
setInterval(()=>{if(!document.hidden)loadExcelFile();},60000);
renderAll();
loadExcelFile();
