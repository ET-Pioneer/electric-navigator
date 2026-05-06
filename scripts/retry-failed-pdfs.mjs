import fs from "node:fs/promises";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { PDFParse } = require("pdf-parse");

function fixUrl(u){
  // github.com blob -> raw
  let n = u.replace(/^https:\/\/github\.com\/([^/]+\/[^/]+)\/blob\/([^/]+)\//, "https://raw.githubusercontent.com/$1/$2/");
  return n;
}
async function tryFetch(u){
  const candidates = [u, fixUrl(u)];
  // Add .github.io <-> raw fallback
  if (u.includes("et-pioneer.github.io/Electric-Technocracy-Pioneers-Community/")) {
    candidates.push(u.replace("https://et-pioneer.github.io/Electric-Technocracy-Pioneers-Community/",
      "https://raw.githubusercontent.com/ET-Pioneer/Electric-Technocracy-Pioneers-Community/main/"));
  }
  for (const c of [...new Set(candidates)]){
    try {
      const r = await fetch(c);
      if (!r.ok) continue;
      const buf = Buffer.from(await r.arrayBuffer());
      if (buf.length < 1000) continue;
      // sanity: PDF magic
      if (buf.slice(0,4).toString() !== "%PDF") continue;
      try {
        const p = new PDFParse({ data: buf });
        const t = (await p.getText()).text || "";
        const text = t.replace(/\s+/g," ").trim();
        if (text.length > 0) return { ok: true, urlUsed: c, text };
      } catch(e){ return { ok:false, urlUsed:c, error:"parse:"+e.message }; }
    } catch(e){}
  }
  return { ok:false, error:"all candidates failed" };
}

const failed = JSON.parse(await fs.readFile("/tmp/failed.json","utf8"));
const report = { total: failed.length, byLang: {}, items: [] };

for (const item of failed){
  const res = await tryFetch(item.url);
  const entry = { lang: item.lang, name: item.name, originalUrl: item.url, ...res };
  if (res.text) { entry.length = res.text.length; entry.words = res.text.split(/\s+/).length; delete entry.text; entry.preview = res.text.slice(0,120); }
  report.items.push(entry);
  report.byLang[item.lang] ||= { ok:0, fail:0 };
  report.byLang[item.lang][res.ok?"ok":"fail"]++;
  // If success, patch into the lang JSON
  if (res.ok){
    const path = `data/search_${item.lang}.json`;
    const j = JSON.parse(await fs.readFile(path,"utf8"));
    const doc = j.docs.find(d=>d.url===item.url);
    if (doc){
      const tok = res.text.split(/\s+/);
      doc.fullText = res.text.length < 800_000 ? res.text : tok.slice(0,500).join(" ");
      doc.excerpt = tok.slice(0,500).join(" ") + (tok.length>500?" …":"");
      doc.length = res.text.length;
      doc.words = tok.length;
      if (res.urlUsed !== item.url) doc.urlResolved = res.urlUsed;
      await fs.writeFile(path, JSON.stringify(j));
    }
  }
  console.log(`[${res.ok?"✓":"✗"}] ${item.lang} ${item.name.slice(0,60)}`);
}
await fs.writeFile("data/retry-report.json", JSON.stringify(report,null,2));
console.log("\nByLang:", JSON.stringify(report.byLang));
