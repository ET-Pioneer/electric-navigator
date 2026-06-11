#!/usr/bin/env node
// Hard SEO validator: every language page MUST have canonical, full hreflang
// matrix (incl. self + x-default), OpenGraph (title/description/url/image),
// and Twitter Card (card/title/description/image) metadata. Exits 1 on any
// failure. Writes data/seo-validation.json + data/seo-validation.md.
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const onlyUbi = process.argv.includes("--only=ubi");
const allRe = /^(index\.html|united_[a-z]{2,3}\.html|ubi-pros-cons(_[a-z]{2,3})?\.html)$/;
const ubiRe = /^ubi-pros-cons(_[a-z]{2,3})?\.html$/;
const files = fs.readdirSync(ROOT).filter(f => (onlyUbi ? ubiRe : allRe).test(f));
if (onlyUbi) console.log(`(UBI-only mode: validating ${files.length} variants)`);

const REQUIRED = [
  { id: "canonical",        re: /<link[^>]+rel=["']canonical["'][^>]*href=["'][^"']+["']/i },
  { id: "og:title",         re: /<meta[^>]+property=["']og:title["'][^>]*content=["'][^"']+["']/i },
  { id: "og:description",   re: /<meta[^>]+property=["']og:description["'][^>]*content=["'][^"']+["']/i },
  { id: "og:url",           re: /<meta[^>]+property=["']og:url["'][^>]*content=["']https?:[^"']+["']/i },
  { id: "og:image",         re: /<meta[^>]+property=["']og:image["'][^>]*content=["']https?:[^"']+["']/i },
  { id: "twitter:card",     re: /<meta[^>]+name=["']twitter:card["'][^>]*content=["'][^"']+["']/i },
  { id: "twitter:title",    re: /<meta[^>]+name=["']twitter:title["'][^>]*content=["'][^"']+["']/i },
  { id: "twitter:desc",     re: /<meta[^>]+name=["']twitter:description["'][^>]*content=["'][^"']+["']/i },
  { id: "twitter:image",    re: /<meta[^>]+name=["']twitter:image["'][^>]*content=["']https?:[^"']+["']/i },
  { id: "hreflang:x-default", re: /<link[^>]+rel=["']alternate["'][^>]*hreflang=["']x-default["']/i },
];

const MIN_HREFLANG = 30; // ≥30 language alternates required per page

const report = [];
let failed = 0;

for (const f of files) {
  const html = fs.readFileSync(path.join(ROOT, f), "utf8");
  const issues = [];

  for (const { id, re } of REQUIRED) {
    if (!re.test(html)) issues.push(`missing ${id}`);
  }

  // hreflang matrix count + self-reference
  const hreflangs = [...html.matchAll(/hreflang=["']([a-zA-Z-]+)["']/g)].map(m => m[1]);
  const unique = new Set(hreflangs);
  if (unique.size < MIN_HREFLANG) {
    issues.push(`hreflang count ${unique.size} < ${MIN_HREFLANG}`);
  }

  // noindex check
  if (/<meta[^>]+name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html)) {
    issues.push("robots=noindex set");
  }

  // self-canonical sanity: canonical URL contains the filename (or "/" for index)
  const canon = html.match(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)?.[1] || "";
  const expectSlug = f === "index.html" ? "" : f;
  if (expectSlug && !canon.endsWith(expectSlug)) {
    issues.push(`canonical does not self-reference (${canon})`);
  }

  if (issues.length) failed++;
  report.push({ file: f, ok: issues.length === 0, issues });
}

const summary = {
  generated: new Date().toISOString(),
  total: report.length,
  passing: report.filter(r => r.ok).length,
  failing: failed,
  pages: report,
};

fs.mkdirSync(path.join(ROOT, "data"), { recursive: true });
fs.writeFileSync("data/seo-validation.json", JSON.stringify(summary, null, 2));

const md = [
  `# SEO Validation Report`,
  ``,
  `- Generated: ${summary.generated}`,
  `- Pages: **${summary.total}** · Passing: **${summary.passing}** · Failing: **${summary.failing}**`,
  ``,
  `## Per-page results`,
  ``,
  `| File | Status | Issues |`,
  `|------|--------|--------|`,
  ...report.map(r =>
    `| \`${r.file}\` | ${r.ok ? "✅" : "❌"} | ${r.issues.join("; ") || "—"} |`
  ),
].join("\n");
fs.writeFileSync("data/seo-validation.md", md);

console.log(`SEO validation: ${summary.passing}/${summary.total} passing, ${summary.failing} failing`);
if (failed > 0) {
  for (const r of report.filter(x => !x.ok)) {
    console.error(`  ❌ ${r.file}: ${r.issues.join("; ")}`);
  }
  process.exit(1);
}
console.log("✅ All pages pass SEO validation");