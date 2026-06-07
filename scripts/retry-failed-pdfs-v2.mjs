#!/usr/bin/env node
/**
 * Retry pass v2 for the 15 still-dead PDFs from data/retry-report.json.
 *
 * Strategy: resolve each dead URL by fuzzy-matching its basename against
 * the live GitHub tree of ET-Pioneer/Electric-Technocracy-Pioneers-Community,
 * then fetch + parse via pdf-parse. Per-language success/error counts are
 * written to data/retry-report-v2.json and the per-language search_*.json
 * files are patched in place for any recovered docs.
 */
import fs from "node:fs/promises";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { PDFParse } = require("pdf-parse");

const REPO = "ET-Pioneer/Electric-Technocracy-Pioneers-Community";
const RAW = `https://raw.githubusercontent.com/${REPO}/main/`;

function norm(s){
  return decodeURIComponent(s).toLowerCase()
    .replace(/&apos;/g,"'")
    .replace(/[^a-z0-9]+/g," ")
    .trim();
}
function tokens(s){ return new Set(norm(s).split(/\s+/).filter(t => t.length >= 3)); }
function score(aTok, bTok){
  let hit = 0; for (const t of aTok) if (bTok.has(t)) hit++;
  return hit / Math.max(aTok.size, 1);
}

async function ghTree(){
  const r = await fetch(`https://api.github.com/repos/${REPO}/git/trees/main?recursive=1`);
  if (!r.ok) throw new Error("GH tree " + r.status);
  const j = await r.json();
  return j.tree.filter(t => /\.pdf$/i.test(t.path));
}

async function tryParse(url){
  const r = await fetch(url);
  if (!r.ok) return { ok:false, error:`http ${r.status}` };
  const buf = Buffer.from(await r.arrayBuffer());
  if (buf.slice(0,4).toString() !== "%PDF") return { ok:false, error:"not a pdf" };
  try {
    const p = new PDFParse({ data: buf });
    const text = ((await p.getText()).text || "").replace(/\s+/g," ").trim();
    if (!text) return { ok:false, error:"empty text" };
    return { ok:true, text };
  } catch(e){ return { ok:false, error:"parse:"+e.message }; }
}

const prev = JSON.parse(await fs.readFile("data/retry-report.json","utf8"));
const dead = prev.items.filter(i => !i.ok);
console.log(`Retrying ${dead.length} dead PDFs…`);

const tree = await ghTree();
console.log(`Repo tree: ${tree.length} PDFs`);

const report = { generated: new Date().toISOString(), total: dead.length, byLang: {}, items: [] };

for (const item of dead){
  const wanted = tokens(item.name);
  // Candidates: same language folder when possible, fall back to all
  const scored = tree
    .map(t => ({ t, s: score(wanted, tokens(t.path.split("/").pop())) }))
    .filter(x => x.s >= 0.55)
    .sort((a,b) => b.s - a.s)
    .slice(0, 5);

  let resolved = null, err = "no fuzzy match";
  for (const c of scored){
    const url = RAW + c.t.path.split("/").map(encodeURIComponent).join("/");
    const res = await tryParse(url);
    if (res.ok){ resolved = { url, score: c.s, repoPath: c.t.path, text: res.text }; break; }
    err = res.error;
  }

  const entry = { lang: item.lang, name: item.name, originalUrl: item.originalUrl };
  report.byLang[item.lang] ||= { ok:0, fail:0 };
  if (resolved){
    entry.ok = true;
    entry.resolvedUrl = resolved.url;
    entry.repoPath = resolved.repoPath;
    entry.matchScore = +resolved.score.toFixed(2);
    entry.length = resolved.text.length;
    entry.words = resolved.text.split(/\s+/).length;
    entry.preview = resolved.text.slice(0,140);
    report.byLang[item.lang].ok++;

    // Patch into per-language search index
    const path = `data/search_${item.lang}.json`;
    try {
      const j = JSON.parse(await fs.readFile(path,"utf8"));
      const tok = resolved.text.split(/\s+/);
      const doc = j.docs.find(d => d.url === item.originalUrl || d.name === item.name);
      const excerpt = tok.slice(0,500).join(" ") + (tok.length>500?" …":"");
      const newDoc = {
        name: item.name,
        url: resolved.url,
        excerpt,
        length: resolved.text.length,
        words: tok.length,
        fullText: resolved.text.length < 800_000 ? resolved.text : excerpt
      };
      if (doc) Object.assign(doc, newDoc); else j.docs.push(newDoc);
      j.count = j.docs.length;
      await fs.writeFile(path, JSON.stringify(j));
    } catch(e){ entry.patchError = e.message; }
  } else {
    entry.ok = false;
    entry.error = err;
    entry.fuzzyCandidates = scored.map(x => ({ path: x.t.path, score: +x.s.toFixed(2) }));
    report.byLang[item.lang].fail++;
  }
  report.items.push(entry);
  console.log(`[${entry.ok?"✓":"✗"}] ${item.lang} ${item.name.slice(0,70)}`);
}

await fs.writeFile("data/retry-report-v2.json", JSON.stringify(report,null,2));

const md = [
  `# PDF Retry Report v2`,
  ``,
  `Generated: ${report.generated}`,
  `Total retried: ${report.total}`,
  ``,
  `## Per language`,
  ``,
  `| Lang | Recovered | Still failed |`,
  `|------|-----------|--------------|`,
  ...Object.entries(report.byLang).sort().map(([l,v]) => `| ${l} | ${v.ok} | ${v.fail} |`),
  ``,
  `## Items`,
  ``,
  ...report.items.map(i => `- [${i.ok?"OK":"FAIL"}] **${i.lang}** — ${i.name}${i.ok?` → ${i.resolvedUrl} (score ${i.matchScore}, ${i.words} words)`:` — ${i.error}`}`)
].join("\n");
await fs.writeFile("data/retry-report-v2.md", md);

console.log("\nByLang:", JSON.stringify(report.byLang));
console.log("→ data/retry-report-v2.json, data/retry-report-v2.md");