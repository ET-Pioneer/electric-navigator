#!/usr/bin/env node
import fs from "node:fs";

// Scan all per-language search indexes so cross-references work in RTL/CJK too.
const langs = fs.readdirSync("data")
  .filter(f => /^search_[a-z]{2}\.json$/.test(f))
  .map(f => f.replace(/^search_|\.json$/g,""));

const cats = {
  persons: ["Schrödinger","Tesla","Einstein","Turing","von Neumann","Musk","Putin","Kennedy"],
  places: ["Turenne","Lahr","Brussels","Berlin","Washington","Geneva","The Hague","Strasbourg","Moscow"],
  installations: ["Turenne Kaserne","CERN","ITER","Hinkley Point","Fukushima","Chernobyl","Olkiluoto"],
  cables: ["NordLink","Viking Link","NorNed","BritNed","IFA","NeuConnect","ElecLink","HVDC"],
  units: ["GW","MW","TWh","kWh","MWh","GWh","kV","MV","Hz","kA"]
};

// Heuristic: find the nearest preceding heading-ish line before a match index.
function findSection(fullText, idx){
  const pre = fullText.slice(Math.max(0, idx-2500), idx);
  const lines = pre.split(/\n|(?<=[.!?])\s{2,}/).map(s=>s.trim()).filter(Boolean);
  for (let i=lines.length-1;i>=0;i--){
    const ln = lines[i];
    if (ln.length < 4 || ln.length > 120) continue;
    if (/^(chapter|section|part|kapitel|abschnitt|teil|capítulo|chapitre|capitolo|глава|раздел|الفصل|الباب|פרק|فصل|باب|باب\s+\d+|章|节|장|절)\b[\s\d.:–-]*/i.test(ln)) return ln;
    if (/^\s*\d+(\.\d+)*\s+[A-ZÄÖÜА-ЯΑ-Ω].{3,}/.test(ln)) return ln;
    if (ln === ln.toUpperCase() && /[A-ZÄÖÜ]{4,}/.test(ln) && !/[.!?]$/.test(ln)) return ln;
  }
  return null;
}

function snippet(fullText, idx, term){
  const start = Math.max(0, idx - 90);
  const end = Math.min(fullText.length, idx + term.length + 180);
  const s = fullText.slice(start, end).replace(/\s+/g," ").trim();
  return (start>0?"…":"") + s + (end < fullText.length ? "…":"");
}

const out = {};
for (const [cat, terms] of Object.entries(cats)) {
  out[cat] = {};
  for (const t of terms) {
    const tl = t.toLowerCase();
    const hits = [];
    for (const lang of langs){
      let data;
      try { data = JSON.parse(fs.readFileSync(`data/search_${lang}.json`,"utf8")); }
      catch(e){ continue; }
      for (const d of data.docs){
        const ft = d.fullText || "";
        if (!ft) continue;
        const idx = ft.toLowerCase().indexOf(tl);
        if (idx === -1) continue;
        hits.push({
          name: d.name,
          url: d.url,
          lang,
          section: findSection(ft, idx),
          snippet: snippet(ft, idx, t),
        });
      }
    }
    if (hits.length) {
      // Stable sort: language, then doc name
      hits.sort((a,b)=> a.lang.localeCompare(b.lang) || a.name.localeCompare(b.name));
      out[cat][t] = hits;
    }
  }
}
fs.writeFileSync("data/xref.json", JSON.stringify(out,null,1));
const total = Object.values(out).reduce((a,c)=>a+Object.values(c).reduce((x,h)=>x+h.length,0),0);
console.log(`xref built — ${total} hits across ${langs.length} languages`);