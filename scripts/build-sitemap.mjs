#!/usr/bin/env node
// Generates sitemap.xml from all top-level public HTML pages.
// Run before the Pages deploy so the sitemap always matches the shipped site.
import { readdirSync, writeFileSync, statSync } from "node:fs";
import { join } from "node:path";

const BASE_URL = process.env.SITEMAP_BASE_URL
  || "https://et-navigator.lovable.app";
const ROOT = process.cwd();
const TODAY = new Date().toISOString().slice(0, 10);

// Pages to publish in the sitemap (root-level HTML only).
const EXCLUDE = new Set([
  "google1e9099cf0125c333.html", // GSC verification
]);
const EXTRA = ["search.html", "xref.html", "audit.html", "sitemaps.html"];

const htmlFiles = readdirSync(ROOT)
  .filter((f) => f.endsWith(".html"))
  .filter((f) => !EXCLUDE.has(f))
  .filter((f) => {
    try { return statSync(join(ROOT, f)).isFile(); } catch { return false; }
  });

// Prioritise: index, united_* (per language), index_* (legacy), then extras
function priority(name) {
  if (name === "index.html") return "1.0";
  if (name.startsWith("united_")) return "0.8";
  if (EXTRA.includes(name)) return "0.6";
  return "0.5";
}

const urls = htmlFiles.sort().map((name) => {
  const loc = `${BASE_URL}/${name}`;
  return [
    "  <url>",
    `    <loc>${loc}</loc>`,
    `    <lastmod>${TODAY}</lastmod>`,
    "    <changefreq>weekly</changefreq>",
    `    <priority>${priority(name)}</priority>`,
    "  </url>",
  ].join("\n");
});

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls,
  "</urlset>",
  "",
].join("\n");

writeFileSync(join(ROOT, "sitemap.xml"), xml);
console.log(`sitemap.xml written (${urls.length} URLs, base=${BASE_URL})`);