#!/usr/bin/env node
// Inject a prominent "UBI Pros & Cons" link into the primary nav of every
// language landing page (index.html + united_*.html). Idempotent.
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const files = fs.readdirSync(ROOT).filter(f =>
  /^(index\.html|united_[a-z]{2,3}\.html)$/.test(f)
);

const LABELS = {
  en: "💡 UBI Pros & Cons", de: "💡 UBI Pro & Contra", fr: "💡 RBU pour/contre",
  es: "💡 RBU pros y contras", it: "💡 RBU pro e contro", pt: "💡 RBI prós e contras",
  nl: "💡 UBI voor & tegen", sv: "💡 UBI för & emot", no: "💡 UBI for & imot",
  da: "💡 UBI for og imod", fi: "💡 UBI plussat & miinukset",
  pl: "💡 UBI za i przeciw", cs: "💡 UBI pro a proti",
  ru: "💡 БОД за и против", uk: "💡 БУД за і проти", bg: "💡 БУД за и против",
  ro: "💡 VBU pro/contra", hu: "💡 UBI mellette/ellene",
  el: "💡 ΚΒΕ υπέρ/κατά", tr: "💡 TVG artıları/eksileri",
  ar: "💡 الدخل الأساسي: مزايا وعيوب", he: "💡 הכנסה בסיסית: יתרונות וחסרונות",
  fa: "💡 درآمد پایه: مزایا و معایب", ur: "💡 یو بی آئی: فوائد و نقصانات",
  hi: "💡 यूबीआई: फायदे/नुकसान", bn: "💡 ইউবিআই: ভালো-মন্দ",
  zh: "💡 UBI 利弊", ja: "💡 UBI の長所と短所", ko: "💡 UBI 장단점",
  th: "💡 UBI ข้อดี-ข้อเสีย", vi: "💡 UBI ưu/nhược",
  id: "💡 UBI pro & kontra", ms: "💡 UBI baik & buruk",
  ca: "💡 RBU pros i contres", sl: "💡 UBI za in proti",
  hy: "💡 ՀԲԵ կողմ ու դեմ",
};

function langOf(file) {
  if (file === "index.html") return "en";
  const m = file.match(/^united_([a-z]{2,3})\.html$/);
  return m ? m[1] : "en";
}
function targetHref(lang) {
  return lang === "en" ? "./ubi-pros-cons.html" : `./ubi-pros-cons_${lang}.html`;
}

let changed = 0, skipped = 0;
for (const f of files) {
  const lang = langOf(f);
  const label = LABELS[lang] || LABELS.en;
  const href = targetHref(lang);
  let html = fs.readFileSync(path.join(ROOT, f), "utf8");

  // Find primary-nav <ul>...</ul>
  const navStart = html.search(/<nav[^>]*id=["']primary-nav["'][^>]*>/i);
  if (navStart < 0) { skipped++; continue; }
  const ulOpen = html.indexOf("<ul>", navStart);
  const ulClose = html.indexOf("</ul>", ulOpen);
  if (ulOpen < 0 || ulClose < 0) { skipped++; continue; }

  const navUl = html.slice(ulOpen, ulClose);
  if (navUl.includes("ubi-pros-cons")) { skipped++; continue; }

  const li = `\n          <li class="ubi-nav"><a href="${href}">${label}</a></li>\n        `;
  html = html.slice(0, ulClose) + li + html.slice(ulClose);
  fs.writeFileSync(path.join(ROOT, f), html);
  changed++;
}
console.log(`✅ UBI nav inject: ${changed} updated, ${skipped} already had it / no nav`);