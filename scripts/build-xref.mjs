#!/usr/bin/env node
import fs from "node:fs";
const en = JSON.parse(fs.readFileSync("data/search_en.json","utf8"));
const cats = {
  persons: ["Schrödinger","Tesla","Einstein","Turing","von Neumann","Musk","Putin","Kennedy"],
  places: ["Turenne","Lahr","Brussels","Berlin","Washington","Geneva","The Hague","Strasbourg","Moscow"],
  installations: ["Turenne Kaserne","CERN","ITER","Hinkley Point","Fukushima","Chernobyl","Olkiluoto"],
  cables: ["NordLink","Viking Link","NorNed","BritNed","IFA","NeuConnect","ElecLink","HVDC"],
  units: ["GW","MW","TWh","kWh","MWh","GWh","kV","MV","Hz","kA"]
};
const out = {};
for (const [cat, terms] of Object.entries(cats)) {
  out[cat] = {};
  for (const t of terms) {
    const hits = en.docs.filter(d => (d.fullText||"").toLowerCase().includes(t.toLowerCase()))
      .map(d => ({ name: d.name, url: d.url }));
    if (hits.length) out[cat][t] = hits;
  }
}
fs.writeFileSync("data/xref.json", JSON.stringify(out,null,1));
console.log("xref built");