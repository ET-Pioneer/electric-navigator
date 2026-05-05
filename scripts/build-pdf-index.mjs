#!/usr/bin/env node
/**
 * Build a per-language full-text index of all PDFs in:
 *  - linked .pdf hrefs found inside united_*.html
 *  - the entire ET-Pioneer/Electric-Technocracy-Pioneers-Community repo
 *
 * Output:
 *   data/search_<lang>.json   (full text + excerpt)
 *   index_<lang>.html         (server-rendered list with first-500-words excerpt for SEO)
 *   data/search-index.json    (master language map)
 *
 * Usage: node scripts/build-pdf-index.mjs [--limit N] [--no-fetch]
 * Requires: pdf-parse (npm i pdf-parse)
 */
import fs from "node:fs/promises";
import fssync from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

const ROOT = process.cwd();
const REPO = "ET-Pioneer/Electric-Technocracy-Pioneers-Community";
const RAW = `https://raw.githubusercontent.com/${REPO}/main/`;
const ARGS = new Set(process.argv.slice(2));
const LIMIT = (() => { const i = process.argv.indexOf("--limit"); return i>0 ? +process.argv[i+1] : 0; })();
const NO_FETCH = ARGS.has("--no-fetch");

// Map repo folder language directories to ISO codes used by site
const FOLDER2LANG = {
  "Arabic":"ar","Armenian":"hy","Bengali":"bn","Bulgarian":"bg","Catalan":"ca",
  "Chinese":"zh","Czech":"cs","Danish":"da","Dutch":"nl","English":"en",
  "Finnish":"fi","French":"fr","German":"de","Greek":"el","Hebrew":"he",
  "Hindi":"hi","Hungarian":"hu","Indonesian":"id","Italian":"it","Japanese":"ja",
  "Korean":"ko","Malay":"ms","Norwegian":"no","Persian":"fa","Polish":"pl",
  "Portuguese":"pt","Romanian":"ro","Russian":"ru","Slovenian":"sl","Spanish":"es",
  "Swedish":"sv","Thai":"th","Turkish":"tr","Urdu":"ur","Vietnamese":"vi"
};

function langFromRepoPath(p){
  const m = p.match(/^pdf\/([A-Za-z]+)\b/);
  if (m && FOLDER2LANG[m[1]]) return FOLDER2LANG[m[1]];
  return "en"; // root preprint/presentation PDFs default to English
}

async function ghTree(){
  const r = await fetch(`https://api.github.com/repos/${REPO}/git/trees/main?recursive=1`);
  if (!r.ok) throw new Error("GH tree failed " + r.status);
  const j = await r.json();
  return j.tree.filter(t => t.path.toLowerCase().endsWith(".pdf"));
}

async function linkedPdfs(){
  const files = (await fs.readdir(ROOT)).filter(f => /^(index|united_[a-z]{2})\.html$/.test(f));
  const set = new Set();
  for (const f of files){
    const html = await fs.readFile(f, "utf8");
    for (const m of html.matchAll(/href=["']([^"']+\.pdf)["']/gi)) set.add(m[1]);
  }
  return [...set];
}

function langFromUrl(u){
  const dec = decodeURIComponent(u);
  for (const [folder, code] of Object.entries(FOLDER2LANG)){
    if (new RegExp(`/${folder}[ -]`,"i").test(dec) || new RegExp(`/${folder}/`,"i").test(dec)) return code;
  }
  return "en";
}

async function extract(buf){
  const pdfParse = require("pdf-parse");
  try {
    const r = await pdfParse(buf, { max: 0 });
    return (r.text || "").replace(/\s+/g, " ").trim();
  } catch(e){ return ""; }
}

function excerpt(text, words=500){
  const tok = text.split(/\s+/);
  return tok.slice(0, words).join(" ") + (tok.length > words ? " …" : "");
}

function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c])); }

async function main(){
  await fs.mkdir(path.join(ROOT, "data"), { recursive: true });

  console.log("→ Collecting linked PDFs from HTML…");
  const linked = await linkedPdfs();
  console.log(`  ${linked.length} linked PDFs`);

  console.log("→ Listing repo PDFs…");
  const tree = await ghTree();
  console.log(`  ${tree.length} repo PDFs`);

  // Build job list { url, lang, name }
  const jobs = new Map();
  for (const u of linked){
    jobs.set(u, { url: u, lang: langFromUrl(u), name: decodeURIComponent(u.split("/").pop()) });
  }
  for (const t of tree){
    const url = RAW + t.path.split("/").map(encodeURIComponent).join("/");
    if (jobs.has(url)) continue;
    jobs.set(url, { url, lang: langFromRepoPath(t.path), name: t.path.split("/").pop() });
  }
  let list = [...jobs.values()];
  if (LIMIT) list = list.slice(0, LIMIT);
  console.log(`→ ${list.length} unique PDFs to index`);

  const byLang = {};
  let done = 0, failed = 0;

  // Concurrency control
  const CONC = 8;
  let i = 0;
  async function worker(){
    while (i < list.length){
      const job = list[i++];
      try {
        let text = "";
        if (!NO_FETCH){
          const r = await fetch(job.url);
          if (r.ok){
            const buf = Buffer.from(await r.arrayBuffer());
            text = await extract(buf);
          } else { failed++; }
        }
        const ex = excerpt(text);
        (byLang[job.lang] ||= []).push({
          name: job.name, url: job.url,
          excerpt: ex, length: text.length, words: text ? text.split(/\s+/).length : 0,
          // full text only stored if reasonable size (<800 KB)
          fullText: text.length < 800_000 ? text : ex
        });
        done++;
        if (done % 25 === 0) console.log(`  …${done}/${list.length}`);
      } catch(e){ failed++; }
    }
  }
  await Promise.all(Array.from({length:CONC}, worker));
  console.log(`✓ Indexed ${done}, failed ${failed}`);

  // Write per-language JSON + HTML
  const summary = { generated: new Date().toISOString(), languages: {} };
  for (const [lang, docs] of Object.entries(byLang)){
    docs.sort((a,b)=>a.name.localeCompare(b.name));
    await fs.writeFile(path.join(ROOT, "data", `search_${lang}.json`),
      JSON.stringify({ lang, count: docs.length, generated: summary.generated, docs }, null, 0));
    summary.languages[lang] = { count: docs.length, file: `data/search_${lang}.json`, page: `index_${lang}.html` };

    // Server-rendered SEO HTML (no JS required)
    const items = docs.map(d => `
    <article class="pdf-entry">
      <h2><a href="${escapeHtml(d.url)}" rel="noopener">${escapeHtml(d.name)}</a></h2>
      <p class="meta">${d.words.toLocaleString()} words</p>
      <p>${escapeHtml(d.excerpt)}</p>
    </article>`).join("\n");
    const html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>PDF Content Index (${lang.toUpperCase()}) — Electric Technocracy</title>
<meta name="description" content="Searchable, full-text PDF content index for the ${lang.toUpperCase()} language portion of the Electric Technocracy archive."/>
<link rel="canonical" href="https://et-pioneer.github.io/electric-navigator/index_${lang}.html"/>
<link rel="stylesheet" href="./assets/css/style.css"/>
</head>
<body>
<header class="site-header"><div class="container header-inner">
  <a class="brand" href="./index.html"><span class="brand-mark">⚡</span><span class="brand-text"><span class="brand-title">Electric Technocracy</span><span class="brand-tag">PDF Index · ${lang.toUpperCase()}</span></span></a>
</div></header>
<main class="container" style="padding:1.5rem 1rem">
  <h1>PDF Content Index — ${lang.toUpperCase()} (${docs.length})</h1>
  <p><a href="./search.html?lang=${lang}">↗ Open interactive search</a> · <a href="./index.html">Home</a></p>
  ${items}
</main>
</body></html>`;
    await fs.writeFile(path.join(ROOT, `index_${lang}.html`), html);
  }
  await fs.writeFile(path.join(ROOT, "data", "search-index.json"), JSON.stringify(summary, null, 2));
  console.log("✅ wrote data/search_*.json + index_*.html for", Object.keys(byLang).length, "languages");
}

main().catch(e => { console.error(e); process.exit(1); });