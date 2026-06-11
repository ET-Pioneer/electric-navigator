#!/usr/bin/env node
// Adds the UBI Pros & Cons guide as an entry in every per-language
// search index (data/search_<lang>.json) AND in data/xref.json under
// a new "topics" category. Idempotent.
import fs from "node:fs";
import path from "node:path";

const BASE = "https://et-pioneer.github.io/electric-navigator/";
const NAME = "UBI Pros & Cons in an Electric Technocracy";
const SECTION = "Pros & Cons of Universal Basic Income";
const EXCERPT =
  "Universal Basic Income (UBI) is an unconditional, recurring cash transfer to every citizen. Under an Electric Technocracy — where machine-based productivity and energy abundance generate most value — UBI becomes the distribution layer for the automation dividend. This guide weighs the pros (automation-shock absorption, machine dividend, lower bureaucracy, demand stabilisation, human dignity) and cons (funding pressure, inflation risk in scarce sectors, uncertain labour-supply effects, political capture, capital inequality, implementation complexity), and outlines design principles for a technocratic UBI.";
const FULL = EXCERPT + " Pros: absorbs automation shock; distributes the machine dividend; cuts welfare bureaucracy; frees labour for high-value work; stabilises demand; anchors dignity. Cons: non-trivial funding; inflation risk in housing/health/education; uncertain labour effects; political capture; does not by itself cure capital inequality; implementation complexity. Design: index dividend to energy output, pair with public utilities, fund from automation rents, constitutionalise the transfer, pilot regionally before national rollout.";

const LANGS = [
  "en","ar","bg","bn","ca","cs","da","de","el","es","fa","fi","fr","he","hi",
  "hu","hy","id","it","ja","ko","ms","nl","no","pl","pt","ro","ru","sl","sv",
  "th","tr","ur","vi","zh"
];

function urlFor(lang) {
  const slug = lang === "en" ? "ubi-pros-cons.html" : `ubi-pros-cons_${lang}.html`;
  return BASE + slug;
}

// ---- 1) Update per-language search indices ----
let searchUpdated = 0, searchSkipped = 0;
for (const lang of LANGS) {
  const f = path.join("data", `search_${lang}.json`);
  if (!fs.existsSync(f)) continue;
  // Skip files externalized via lovable-assets (have a sibling .asset.json
  // or themselves exceed the 10MB repo commit limit). The UBI entry will
  // need to be re-added when those indices are next rebuilt.
  const ext = f + ".asset.json";
  if (fs.existsSync(ext)) continue;
  const st = fs.statSync(f);
  if (st.size > 9 * 1024 * 1024) { searchSkipped++; continue; }
  const idx = JSON.parse(fs.readFileSync(f, "utf8"));
  const docs = Array.isArray(idx) ? idx : (idx.docs || []);
  const url = urlFor(lang);

  if (docs.some(d => d.url === url || d.name === NAME)) { searchSkipped++; continue; }

  const doc = {
    name: NAME,
    url,
    excerpt: EXCERPT,
    length: FULL.length,
    words: FULL.split(/\s+/).length,
    fullText: FULL,
    section: SECTION,
    lang,
    kind: "guide",
  };

  if (Array.isArray(idx)) idx.push(doc);
  else {
    idx.docs = [doc, ...docs];
    if (typeof idx.count === "number") idx.count = idx.docs.length;
    idx.generated = new Date().toISOString();
  }

  fs.writeFileSync(f, JSON.stringify(idx, null, 0));
  searchUpdated++;
}
console.log(`✅ search indices: ${searchUpdated} updated, ${searchSkipped} already had UBI guide`);

// ---- 2) Update data/xref.json with a `topics` category ----
const XREF = "data/xref.json";
const xref = JSON.parse(fs.readFileSync(XREF, "utf8"));
xref.topics = xref.topics || {};
const key = "Universal Basic Income";
const existing = xref.topics[key] || [];
const existingUrls = new Set(existing.map(e => e.url));

let xrefAdded = 0;
for (const lang of LANGS) {
  const url = urlFor(lang);
  if (existingUrls.has(url)) continue;
  existing.push({
    name: NAME,
    url,
    lang,
    section: SECTION,
    snippet: EXCERPT.slice(0, 220) + "…",
  });
  xrefAdded++;
}
xref.topics[key] = existing;
fs.writeFileSync(XREF, JSON.stringify(xref, null, 2));
console.log(`✅ xref.json: topics.${key} now has ${existing.length} entries (+${xrefAdded})`);