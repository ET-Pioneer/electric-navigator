#!/usr/bin/env node
// Hard CI assertion: sitemap.xml must contain the expected URL totals
// and full language coverage. Fails the build on any omission.
import fs from "node:fs";

const LANGS = [
  "en","ar","bg","bn","ca","cs","da","de","el","es","fa","fi","fr","he","hi",
  "hu","hy","id","it","ja","ko","ms","nl","no","pl","pt","ro","ru","sl","sv",
  "th","tr","ur","vi","zh"
];

const xml = fs.readFileSync("sitemap.xml", "utf8");
const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
const set = new Set(locs);

// Expected URL totals — derived from disk so the assertion auto-updates
// when pages are added/removed, but still fails if sitemap drifts.
const onDisk = fs.readdirSync(".").filter(f =>
  f.endsWith(".html") && f !== "google1e9099cf0125c333.html"
);

const errors = [];

// 1) URL count == on-disk public HTML count
if (locs.length !== onDisk.length) {
  errors.push(`URL count mismatch: sitemap has ${locs.length}, disk has ${onDisk.length}`);
}

// 2) Every on-disk page must appear in the sitemap
const missing = onDisk.filter(f => ![...set].some(u => u.endsWith("/" + f)));
if (missing.length) errors.push(`Pages missing from sitemap: ${missing.join(", ")}`);

// 3) Language coverage — both united_* and ubi-pros-cons* must have a URL per lang
for (const lang of LANGS) {
  const unitedFile = lang === "en" ? "index.html" : `united_${lang}.html`;
  const ubiFile = lang === "en" ? "ubi-pros-cons.html" : `ubi-pros-cons_${lang}.html`;
  if (![...set].some(u => u.endsWith("/" + unitedFile))) {
    errors.push(`Sitemap missing landing page for lang=${lang} (${unitedFile})`);
  }
  if (![...set].some(u => u.endsWith("/" + ubiFile))) {
    errors.push(`Sitemap missing UBI guide for lang=${lang} (${ubiFile})`);
  }
}

// 4) Minimum baseline: 35 langs × 2 surfaces = 70 + extras
const MIN = 70;
if (locs.length < MIN) errors.push(`URL total ${locs.length} below baseline ${MIN}`);

if (errors.length) {
  console.error("❌ Sitemap coverage assertion FAILED:");
  for (const e of errors) console.error("  - " + e);
  process.exit(1);
}
console.log(`✅ Sitemap coverage OK — ${locs.length} URLs, ${LANGS.length}×2 language surfaces verified`);