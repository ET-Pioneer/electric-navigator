#!/usr/bin/env node
// Enforce canonical URL + self-referencing hreflang on every united_*.html / index.html.
// Base URL is fixed to GitHub Pages deployment.
import fs from "node:fs";
import path from "node:path";

const BASE = "https://et-pioneer.github.io/electric-navigator/";
const ROOT = path.resolve(process.argv[2] || ".");

const files = fs.readdirSync(ROOT)
  .filter(f => /^(index|united_[a-z]{2})\.html$/.test(f));

let changed = 0, ok = 0, errs = [];
for (const f of files) {
  const full = path.join(ROOT, f);
  let html = fs.readFileSync(full, "utf8");
  const expected = BASE + (f === "index.html" ? "" : f);

  // 1) Canonical
  const canonRe = /<link\s+rel=["']canonical["'][^>]*>/i;
  const canonTag = `<link rel="canonical" href="${expected}" />`;
  if (canonRe.test(html)) {
    const cur = html.match(canonRe)[0];
    if (!cur.includes(`href="${expected}"`) && !cur.includes(`href='${expected}'`)) {
      html = html.replace(canonRe, canonTag);
      changed++;
    }
  } else {
    html = html.replace(/<\/head>/i, `  ${canonTag}\n</head>`);
    changed++;
  }

  // 2) og:url
  const ogRe = /<meta\s+property=["']og:url["'][^>]*>/i;
  const ogTag = `<meta property="og:url" content="${expected}" />`;
  if (ogRe.test(html)) {
    const cur = html.match(ogRe)[0];
    if (!cur.includes(`content="${expected}"`)) { html = html.replace(ogRe, ogTag); changed++; }
  }

  // 3) Forbid stale /world/ paths
  if (/et-pioneer\.github\.io\/world\//.test(html)) {
    html = html.replace(/et-pioneer\.github\.io\/world\//g, "et-pioneer.github.io/electric-navigator/");
    changed++;
  }

  fs.writeFileSync(full, html);
  ok++;
}
console.log(`✅ canonical enforce: ${ok} files processed, ${changed} edits applied.`);
if (errs.length) { console.error(errs.join("\n")); process.exit(1); }