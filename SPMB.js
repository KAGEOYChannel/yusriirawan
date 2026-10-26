/* Madani Content Studio - semua data konten dibaca dari content-calendar.xlsx (read-only) */
const EXCEL_FILE = "content-calendar.xlsx";
const STATUS = ["Ide","Brief","Produksi","Review","Terjadwal","Published"];

let contents = [];
let currentView = "dashboard";
let currentMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
let calendarMode = "month";
let searchTerm = "";
let toastTimer;
let firstLoad = true;
let excelState = {status:"loading", count:0, time:null, msg:""};

/* bersihkan data lama dari versi sebelumnya (tidak dipakai lagi) */
["madaniContentCalendar2027","madaniChecklist","madaniHiddenExcelIds"].forEach(k=>{try{localStorage.removeItem(k);}catch{}});

/* ---------- Helpers ---------- */
function esc(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function pad(n){return String(n).padStart(2,"0");}
function dateKey(d){return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;}
function fmtDate(date,opts={day:"numeric",month:"short",year:"numeric"}){if(!date)return "-";const [y,m,d]=date.split("-").map(Number);return new Date(y,m-1,d).toLocaleDateString("id-ID",opts);}
function monthKey(d){return `${d.getFullYear()}-${pad(d.getMonth()+1)}`;}
function statusClass(s){return "status-"+String(s||"Ide").toLowerCase().replace(/\s+/g,"-");}
function badge(s){return `<span class="status ${statusClass(s)}">${esc(s||"Ide")}</span>`;}
function showToast(msg){const el=document.getElementById("toast");el.textContent=msg;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),2800);}
function filteredItems(){const q=searchTerm.toLowerCase();return contents.filter(c=>`${c.title} ${c.pic} ${c.brief} ${c.platform} ${c.format}`.toLowerCase().includes(q));}

/* ---------- Referensi (link) ---------- */
function safeUrl(u){
  u=String(u||"").trim().replace(/[),.;]+$/,"");
  if(/^www\./i.test(u))u="https://"+u;
  if(!/^https?:\/\//i.test(u))return "";
  try{const x=new URL(u);return /^https?:$/.test(x.protocol)?x.href:"";}catch{return "";}
}
function hostLabel(u){try{return new URL(u).hostname.replace(/^www\./,"");}catch{return u;}}
function parseRefs(text,target){
  const t=String(text||"").trim(),out=[],seen=new Set();
  const add=(url,label)=>{const s=safeUrl(url);if(s&&!seen.has(s)){seen.add(s);out.push({url:s,label:label||hostLabel(s)});}};
  if(target)add(target,t&&!/^(https?:\/\/|www\.)/i.test(t)?t:"");
  (t.match(/(?:https?:\/\/|www\.)[^\s,;]+/gi)||[]).forEach(u=>add(u,""));
  return out;
}
function refHtml(refs){
  return refs.map(r=>`<a class="ref-link" href="${esc(r.url)}" target="_blank" rel="noopener noreferrer" title="${esc(r.url)}">${esc(r.label)} <em>↗</em></a>`).join("");
}

/* ---------- Baca Excel ---------- */
function normalizeDate(v){
  if(v instanceof Date&&!isNaN(v))return dateKey(v);
  if(typeof v==="number"&&typeof XLSX!=="undefined"&&XLSX.SSF){const d=XLSX.SSF.parse_date_code(v);if(d)return `${d.y}-${pad(d.m)}-${pad(d.d)}`;}
  const s=String(v||"").trim();
  if(/^\d{4}-\d{1,2}-\d{1,2}$/.test(s)){const [y,m,d]=s.split("-");return `${y}-${m.padStart(2,"0")}-${d.padStart(2,"0")}`;}
  const m=s.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})$/);
  if(m)return `${m[3]}-${m[2].padStart(2,"0")}-${m[1].padStart(2,"0")}`;
  return "";
}
function parseSheet(ws){
  if(!ws||!ws["!ref"])return {items:[],skipped:0};
  const rg=XLSX.utils.decode_range(ws["!ref"]);
  const alias={date:["tanggal","date"],title:["judul","judul konten","title"],format:["format","jenis konten","tipe"],platform:["platform","kanal"],status:["status"],pic:["pic","penanggung jawab","penanggungjawab"],brief:["brief","caption","catatan"],ref:["referensi","reference","link referensi","link","tautan"]};
  const cols={};
  for(let c=rg.s.c;c<=rg.e.c;c++){
    const cell=ws[XLSX.utils.encode_cell({r:rg.s.r,c})];if(!cell||cell.v==null)continue;
    const h=String(cell.v).toLowerCase().trim();
    for(const k in alias)if(cols[k]===undefined&&alias[k].includes(h))cols[k]=c;
  }
  if(cols.title===undefined||cols.date===undefined)throw new Error("Kolom Tanggal dan Judul tidak ditemukan pada baris pertama sheet pertama.");
  const cell=(r,k)=>cols[k]===undefined?undefined:ws[XLSX.utils.encode_cell({r,c:cols[k]})];
  const txt=(r,k)=>{const x=cell(r,k);return x&&x.v!=null?String(x.v).trim():"";};
  const items=[];let skipped=0;
  for(let r=rg.s.r+1;r<=rg.e.r;r++){
    const title=txt(r,"title");if(!title)continue;
    const d=cell(r,"date"),date=d?normalizeDate(d.v):"";
    if(!date){skipped++;continue;}
    const sRaw=txt(r,"status"),status=STATUS.find(s=>s.toLowerCase()===sRaw.toLowerCase())||"Ide";
    const rc=cell(r,"ref");
    items.push({id:`row${r}`,date,title,format:txt(r,"format")||"Lainnya",platform:txt(r,"platform")||"Multi-platform",status,pic:txt(r,"pic"),brief:txt(r,"brief"),refs:parseRefs(rc&&rc.v!=null?rc.v:"",rc&&rc.l?rc.l.Target:"")});
  }
  return {items,skipped};
}
async function loadExcelFile(manual=false){
  if(typeof XLSX==="undefined"){excelState={status:"error",count:contents.length,time:new Date(),msg:"Pustaka Excel belum termuat. Periksa koneksi internet."};renderAll();return;}
  const before=JSON.stringify(contents);
  try{
    const res=await fetch(`${EXCEL_FILE}?t=${Date.now()}`,{cache:"no-store"});
    if(!res.ok)throw new Error(res.status===404?`File ${EXCEL_FILE} tidak ditemukan di folder yang sama dengan file HTML.`:`Gagal memuat file (HTTP ${res.status}).`);
    const wb=XLSX.read(await res.arrayBuffer(),{type:"array"});
    const {items,skipped}=parseSheet(wb.Sheets[wb.SheetNames[0]]);
    contents=items;
    excelState={status:"ok",count:items.length,time:new Date(),msg:skipped?`${skipped} baris dilewati karena tanggal tidak valid.`:""};
    if(firstLoad&&items.length){
      const today=dateKey(new Date()),sorted=[...items].sort((a,b)=>a.date.localeCompare(b.date));
      const target=sorted.find(c=>c.date>=today)||sorted[sorted.length-1];
      currentMonth=new Date(Number(target.date.slice(0,4)),Number(target.date.slice(5,7))-1,1);
    }
    firstLoad=false;
    if(manual)showToast(`${items.length} konten dimuat dari ${EXCEL_FILE}.`);
  }catch(err){
    const isFile=location.protocol==="file:";
    excelState={status:"error",count:contents.length,time:new Date(),msg:isFile?`Browser memblokir pembacaan file saat HTML dibuka langsung (file://). Jalankan lewat hosting atau server lokal agar ${EXCEL_FILE} terbaca.`:(err.message||"Gagal memuat file.")};
    if(manual)showToast("Gagal memuat "+EXCEL_FILE);
  }
  if(before!==JSON.stringify(contents)||manual||excelState.status==="error"||!renderedOnce)renderAll();else renderExcelStatus();
}
let renderedOnce=false;

/* ---------- Template ---------- */
function downloadTemplate(){
  if(typeof XLSX==="undefined"){showToast("Pustaka Excel belum termuat. Periksa koneksi internet.");return;}
  const rows=[{"Tanggal":"2026-11-20","Judul":"Contoh: Profil sekolah","Format":"Reels","Platform":"Instagram","Status":"Ide","PIC":"Tim Video","Brief":"Ganti baris contoh ini dengan rencana konten.","Referensi":"https://www.instagram.com/"}];
  const ws=XLSX.utils.json_to_sheet(rows,{header:["Tanggal","Judul","Format","Platform","Status","PIC","Brief","Referensi"]});
  ws["!cols"]=[{wch:14},{wch:35},{wch:15},{wch:18},{wch:15},{wch:22},{wch:55},{wch:45}];
  const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,"Content Calendar");
  XLSX.writeFile(wb,"Template_content-calendar.xlsx");showToast("Template Excel diunduh.");
}

/* ---------- Render ---------- */
function gotoView(view){
  currentView=view;
  document.querySelectorAll(".view").forEach(el=>el.classList.toggle("active",el.id===`view-${view}`));
  document.querySelectorAll(".nav-item[data-view]").forEach(el=>el.classList.toggle("active",el.dataset.view===view));
  document.getElementById("pageTitle").textContent=({dashboard:"Dashboard",calendar:"Kalender Konten",content:"Semua Konten"})[view]||"Dashboard";
  renderAll();window.scrollTo({top:0,behavior:"smooth"});
}
function renderExcelStatus(){
  const el=document.getElementById("excelSync");if(!el)return;
  const t=excelState.time?excelState.time.toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit"}):"";
  if(excelState.status==="ok"){el.className="sync-status ok";el.innerHTML=`<b>● Tersinkron</b> ${esc(EXCEL_FILE)} · ${excelState.count} konten · ${t}${excelState.msg?`<br>${esc(excelState.msg)}`:""}`;}
  else if(excelState.status==="error"){el.className="sync-status err";el.innerHTML=`<b>● Belum terbaca</b> ${esc(excelState.msg)}`;}
  else{el.className="sync-status";el.innerHTML=`<b>◷ Memuat</b> ${esc(EXCEL_FILE)}...`;}
}
function emptyMsg(){return excelState.status==="error"?`Data belum bisa dibaca dari ${esc(EXCEL_FILE)}.`:"Belum ada konten di Excel.";}
function renderStats(){
  const set=(id,v)=>document.getElementById(id).textContent=v;
  set("statTotal",contents.length);
  set("statPublished",contents.filter(c=>c.status==="Published").length);
  set("statProcess",contents.filter(c=>["Brief","Produksi","Review","Terjadwal"].includes(c.status)).length);
  set("statIdeas",contents.filter(c=>c.status==="Ide").length);
  const counts=STATUS.map(s=>({s,n:contents.filter(c=>c.status===s).length}));
  const max=Math.max(1,...counts.map(x=>x.n));
  document.getElementById("statusChart").innerHTML=counts.map(x=>`<div class="bar-row"><span>${esc(x.s)}</span><div class="bar-track"><div class="bar-fill" style="width:${x.n/max*100}%"></div></div><b>${x.n}</b></div>`).join("");
  document.getElementById("chartLegend").innerHTML=counts.filter(x=>x.n).map(x=>`<span class="legend-pill">${esc(x.s)} · ${x.n}</span>`).join("")||'<span class="legend-pill">Belum ada data</span>';
  const today=dateKey(new Date());
  const upcoming=filteredItems().filter(c=>c.date>=today).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,5);
  document.getElementById("upcomingList").innerHTML=upcoming.length?upcoming.map(c=>`<div class="upcoming-item" data-detail="${esc(c.id)}" tabindex="0"><div class="date-chip"><b>${c.date.slice(8,10)}</b><small>${fmtDate(c.date,{month:"short"}).toUpperCase()}</small></div><div><div class="upcoming-title">${esc(c.title)}</div><div class="upcoming-meta">${esc(c.format)} · ${esc(c.platform)} · ${esc(c.pic||"PIC belum ditentukan")}${c.refs.length?" · 🔗 "+c.refs.length+" referensi":""}</div></div>${badge(c.status)}</div>`).join(""):`<div class="empty-state">${contents.length?"Tidak ada jadwal konten mendatang.":emptyMsg()}</div>`;
}
function setSelectOptions(id,values){const el=document.getElementById(id),old=el.value;const first=el.options[0].outerHTML;el.innerHTML=first+values.filter(Boolean).sort().map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join("");if(values.includes(old))el.value=old;}
function renderFilters(){const platforms=[...new Set(contents.map(c=>c.platform))];["calStatus","listStatus"].forEach(id=>setSelectOptions(id,STATUS));["calPlatform","listPlatform"].forEach(id=>setSelectOptions(id,platforms));}
function renderCalendar(){
  const y=currentMonth.getFullYear(),m=currentMonth.getMonth();
  document.getElementById("monthLabel").textContent=currentMonth.toLocaleDateString("id-ID",{month:"long",year:"numeric"});
  const st=document.getElementById("calStatus").value,pl=document.getElementById("calPlatform").value;
  const all=filteredItems().filter(c=>(!st||c.status===st)&&(!pl||c.platform===pl));
  const container=document.getElementById("calendarContainer");
  if(calendarMode==="list"){
    const monthItems=all.filter(c=>c.date.startsWith(monthKey(currentMonth))).sort((a,b)=>a.date.localeCompare(b.date));
    const groups={};monthItems.forEach(c=>(groups[c.date]??=[]).push(c));
    container.innerHTML=Object.keys(groups).length?Object.keys(groups).map(d=>`<div class="list-date-group"><div class="list-date-title">${fmtDate(d,{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</div>${groups[d].map(c=>`<div class="list-event"><div><b>${esc(c.title)}</b><p>${esc(c.format)} · ${esc(c.platform)} · ${esc(c.pic||"PIC belum ditentukan")}</p>${c.refs.length?`<div class="ref-list">${refHtml(c.refs)}</div>`:""}</div><div>${badge(c.status)} <button class="small-btn" data-detail="${esc(c.id)}">Detail</button></div></div>`).join("")}</div>`).join(""):'<div class="empty-state">Tidak ada konten untuk bulan/filter ini.</div>';
    return;
  }
  const firstDay=(new Date(y,m,1).getDay()+6)%7,daysInMonth=new Date(y,m+1,0).getDate(),prevDays=new Date(y,m,0).getDate(),totalCells=Math.ceil((firstDay+daysInMonth)/7)*7;
  let out='<div class="calendar-grid">'+["SEN","SEL","RAB","KAM","JUM","SAB","MIN"].map(d=>`<div class="weekday">${d}</div>`).join("");
  const todayStr=dateKey(new Date());
  for(let i=0;i<totalCells;i++){
    let day,cellDate,other=false;
    if(i<firstDay){day=prevDays-firstDay+i+1;cellDate=new Date(y,m-1,day);other=true;}
    else if(i>=firstDay+daysInMonth){day=i-(firstDay+daysInMonth)+1;cellDate=new Date(y,m+1,day);other=true;}
    else{day=i-firstDay+1;cellDate=new Date(y,m,day);}
    const key=dateKey(cellDate),dayEvents=all.filter(c=>c.date===key);
    out+=`<div class="day-cell ${other?"other-month":""}"><div class="day-number ${key===todayStr?"today":""}"><span>${day}</span></div>${dayEvents.slice(0,3).map(c=>`<button class="event ${statusClass(c.status)}" title="${esc(c.title)}" data-detail="${esc(c.id)}">${esc(c.title)}${c.refs.length?" ↗":""}</button>`).join("")}${dayEvents.length>3?`<div class="more-events">+${dayEvents.length-3} lainnya</div>`:""}</div>`;
  }
  container.innerHTML=out+"</div>";
}
function renderTable(){
  const st=document.getElementById("listStatus").value,pl=document.getElementById("listPlatform").value;
  const arr=filteredItems().filter(c=>(!st||c.status===st)&&(!pl||c.platform===pl)).sort((a,b)=>a.date.localeCompare(b.date));
  document.getElementById("resultCount").textContent=`${arr.length} konten`;
  document.getElementById("contentTable").innerHTML=arr.length?arr.map(c=>`<tr><td>${fmtDate(c.date,{day:"2-digit",month:"short",year:"numeric"})}</td><td><button class="title-btn" data-detail="${esc(c.id)}">${esc(c.title)}</button><span class="td-sub">${esc(c.brief||"Belum ada brief")}</span></td><td>${esc(c.format)}</td><td>${esc(c.platform)}</td><td>${esc(c.pic||"—")}</td><td>${badge(c.status)}</td><td>${c.refs.length?`<div class="ref-list">${refHtml(c.refs)}</div>`:'<span class="muted">—</span>'}</td></tr>`).join(""):`<tr><td colspan="7"><div class="empty-state">${contents.length?"Belum ada konten yang sesuai filter.":emptyMsg()}</div></td></tr>`;
}
function renderAll(){renderedOnce=true;renderFilters();renderStats();renderCalendar();renderTable();renderExcelStatus();}

/* ---------- Detail (read-only) ---------- */
function openDetail(id){
  const c=contents.find(x=>x.id===id);if(!c)return;
  document.getElementById("detailTitle").textContent=c.title;
  document.getElementById("detailBody").innerHTML=`
    <div class="detail-grid">
      <div><span>Tanggal</span><b>${esc(fmtDate(c.date,{weekday:"long",day:"numeric",month:"long",year:"numeric"}))}</b></div>
      <div><span>Status</span><b>${badge(c.status)}</b></div>
      <div><span>Format</span><b>${esc(c.format)}</b></div>
      <div><span>Platform</span><b>${esc(c.platform)}</b></div>
      <div class="full"><span>PIC</span><b>${esc(c.pic||"Belum ditentukan")}</b></div>
      <div class="full"><span>Brief / ide caption</span><p>${esc(c.brief||"Belum ada brief.").replace(/\n/g,"<br>")}</p></div>
      <div class="full"><span>Referensi</span>${c.refs.length?`<div class="ref-list big">${refHtml(c.refs)}</div>`:'<p class="muted">Belum ada referensi.</p>'}</div>
    </div>`;
  const m=document.getElementById("detailModal");m.classList.add("open");m.setAttribute("aria-hidden","false");
}
function closeDetail(){const m=document.getElementById("detailModal");m.classList.remove("open");m.setAttribute("aria-hidden","true");}

/* ---------- Events ---------- */
document.querySelectorAll("[data-view]").forEach(b=>b.addEventListener("click",()=>gotoView(b.dataset.view)));
document.querySelectorAll("[data-goto]").forEach(b=>b.addEventListener("click",()=>gotoView(b.dataset.goto)));
document.getElementById("closeDetail").addEventListener("click",closeDetail);
document.getElementById("detailModal").addEventListener("click",e=>{if(e.target.id==="detailModal")closeDetail();});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeDetail();if(e.key==="Enter"&&e.target.matches(".upcoming-item[data-detail]"))openDetail(e.target.dataset.detail);});
document.addEventListener("click",e=>{const b=e.target.closest("[data-detail]");if(b)openDetail(b.dataset.detail);});
document.getElementById("prevMonth").addEventListener("click",()=>{currentMonth=new Date(currentMonth.getFullYear(),currentMonth.getMonth()-1,1);renderCalendar();});
document.getElementById("nextMonth").addEventListener("click",()=>{currentMonth=new Date(currentMonth.getFullYear(),currentMonth.getMonth()+1,1);renderCalendar();});
document.getElementById("todayBtn").addEventListener("click",()=>{const d=new Date();currentMonth=new Date(d.getFullYear(),d.getMonth(),1);renderCalendar();});
document.getElementById("monthViewBtn").addEventListener("click",()=>{calendarMode="month";document.getElementById("monthViewBtn").classList.add("selected");document.getElementById("listViewBtn").classList.remove("selected");renderCalendar();});
document.getElementById("listViewBtn").addEventListener("click",()=>{calendarMode="list";document.getElementById("listViewBtn").classList.add("selected");document.getElementById("monthViewBtn").classList.remove("selected");renderCalendar();});
["calStatus","calPlatform"].forEach(id=>document.getElementById(id).addEventListener("change",renderCalendar));
["listStatus","listPlatform"].forEach(id=>document.getElementById(id).addEventListener("change",renderTable));
document.getElementById("globalSearch").addEventListener("input",e=>{searchTerm=e.target.value;renderAll();});
["reloadExcel","reloadSide"].forEach(id=>document.getElementById(id).addEventListener("click",()=>loadExcelFile(true)));
["templateBtn","templateSide"].forEach(id=>document.getElementById(id).addEventListener("click",downloadTemplate));
document.addEventListener("visibilitychange",()=>{if(!document.hidden)loadExcelFile();});
setInterval(()=>{if(!document.hidden)loadExcelFile();},60000);
renderAll();
loadExcelFile();
