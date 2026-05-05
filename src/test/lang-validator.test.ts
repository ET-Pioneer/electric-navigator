import { describe, it, expect } from "vitest";

/**
 * Mirror of the matcher used in assets/js/main.js — kept in sync to lock down
 * case-insensitivity and word-boundary behaviour against substring false positives.
 * The "PDF archiv" Czech marker must NOT match the English "PDF Archive" text.
 */
function matchMarker(haystackLc: string, marker: string): boolean {
  if (!marker || marker.length < 4) return false;
  const mLc = marker.toLowerCase();
  if (/[a-z0-9]/i.test(marker)) {
    const esc = mLc.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp("(^|[^\\p{L}\\p{N}])" + esc + "($|[^\\p{L}\\p{N}])", "u");
    return re.test(haystackLc);
  }
  return haystackLc.indexOf(mLc) !== -1;
}

const norm = (s: string) => s.toLowerCase();

describe("language content validator — case insensitivity", () => {
  it("matches EN marker regardless of letter case", () => {
    expect(matchMarker(norm("WELCOME to the navigator"), "Welcome")).toBe(true);
    expect(matchMarker(norm("Welcome to the navigator"), "WELCOME")).toBe(true);
  });

  it("matches DE marker with diacritics, case-insensitively", () => {
    expect(matchMarker(norm("ZEITALTER DES ÜBERGANGS"), "Zeitalter des Übergangs")).toBe(true);
  });

  it("matches non-latin scripts via direct substring", () => {
    expect(matchMarker(norm("ようこそ Electric"), "ようこそ")).toBe(true);
    expect(matchMarker(norm("Добро пожаловать!"), "Добро пожаловать")).toBe(true);
  });
});

describe("language content validator — substring false positives", () => {
  it("does NOT match Czech 'PDF archiv' inside English 'PDF Archive'", () => {
    const en = norm("Browse the multilingual PDF Archive of the community.");
    expect(matchMarker(en, "PDF archiv")).toBe(false);
  });

  it("does NOT match 'Mission' inside 'Missionary'", () => {
    const txt = norm("The Missionary report explains the program.");
    expect(matchMarker(txt, "Mission")).toBe(false);
  });

  it("DOES match 'Mission' as a standalone word", () => {
    expect(matchMarker(norm("Our Mission is clear."), "Mission")).toBe(true);
    expect(matchMarker(norm("Mission, vision, values."), "Mission")).toBe(true);
  });

  it("ignores markers shorter than 4 chars", () => {
    expect(matchMarker(norm("any text"), "abc")).toBe(false);
  });

  it("does not flag 'PDF Archive' on EN page when EN itself owns 'PDF Archive'", () => {
    // Simulates the validator's shared-token guard: even if some other lang marker
    // is a substring of the expected lang's marker, no leak should be reported.
    const expectedMarkers = ["PDF Archive"];
    const otherMarker = "PDF archiv"; // Czech
    const text = norm("Welcome to the PDF Archive.");
    const matched = matchMarker(text, otherMarker);
    const isShared = expectedMarkers.some(em => em.toLowerCase().indexOf(otherMarker.toLowerCase()) !== -1);
    // Even if matched were true, isShared guard would suppress the leak.
    expect(matched && !isShared).toBe(false);
  });
});