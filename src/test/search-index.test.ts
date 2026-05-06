import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

function load(lang: string) {
  const p = path.join(process.cwd(), "data", `search_${lang}.json`);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

describe("PDF search index smoke", () => {
  const cases: Array<[string, string]> = [
    ["en", "technocracy"],
    ["de", "technokratie"],
    ["fr", "technocratie"],
  ];
  for (const [lang, term] of cases) {
    it(`${lang}: finds "${term}" in at least one doc`, () => {
      const j = load(lang);
      expect(j, `data/search_${lang}.json missing — run npm run build:pdf-index`).toBeTruthy();
      const hits = j.docs.filter((d: any) =>
        (d.fullText || d.excerpt || "").toLowerCase().includes(term)
      );
      expect(hits.length).toBeGreaterThan(0);
    });
  }

  it("manifest covers EN/DE/FR", () => {
    const m = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), "data", "search-index.json"), "utf8")
    );
    for (const l of ["en", "de", "fr"]) {
      expect(m.languages[l], `language ${l} missing in manifest`).toBeTruthy();
      expect(m.languages[l].count).toBeGreaterThan(0);
    }
  });
});