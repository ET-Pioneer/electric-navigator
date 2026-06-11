#!/usr/bin/env node
// Generates the "Pros & Cons of UBI in Electric Technocracy" guide
// as a fully-translated hreflang matrix across all supported languages.
// English master = ubi-pros-cons.html; localized stubs = ubi-pros-cons_<lang>.html.
import fs from "node:fs";
import path from "node:path";

const BASE = "https://et-pioneer.github.io/electric-navigator/";
const OG_IMAGE = BASE + "og-image.jpg";
const TWITTER_HANDLE = "@electrictechnocracy";

// Supported languages — must mirror united_*.html set + en.
const LANGS = [
  "en","ar","bg","bn","ca","cs","da","de","el","es","fa","fi","fr","he","hi",
  "hu","hy","id","it","ja","ko","ms","nl","no","pl","pt","ro","ru","sl","sv",
  "th","tr","ur","vi","zh"
];
const RTL = new Set(["ar","fa","he","ur"]);

const TITLE = "Pros & Cons of Universal Basic Income in an Electric Technocracy";
const DESCRIPTION =
  "An evidence-based guide weighing the benefits and drawbacks of Universal Basic Income (UBI) under an Electric Technocracy framework: machine-based productivity, value redistribution, automation dividends, and post-scarcity policy design.";

function fileFor(lang) {
  return lang === "en" ? "ubi-pros-cons.html" : `ubi-pros-cons_${lang}.html`;
}
function urlFor(lang) { return BASE + fileFor(lang); }

function hreflangBlock(self) {
  const lines = LANGS.map(l =>
    `  <link rel="alternate" hreflang="${l}" href="${urlFor(l)}" />`);
  lines.push(`  <link rel="alternate" hreflang="x-default" href="${urlFor("en")}" />`);
  return lines.join("\n");
}

const CONTENT = `
    <h1>Pros &amp; Cons of Universal Basic Income in an Electric Technocracy</h1>
    <p class="lead">
      Universal Basic Income (UBI) is the proposal to pay every citizen an
      unconditional, recurring cash transfer sufficient to cover basic needs.
      Within an <strong>Electric Technocracy</strong> — where machine-based
      productivity, automation, and energy abundance generate most economic
      value — UBI is no longer a redistributive charity but the natural
      mechanism for sharing the surplus produced by autonomous systems.
    </p>

    <h2>Why UBI is structurally linked to Electric Technocracy</h2>
    <p>
      Classical economies tie income to labour. Electric Technocracy
      decouples production from human work: solar, wind, fusion and
      automated grids generate value without wages. UBI becomes the
      <em>distribution layer</em> for that surplus — turning the kilowatt-hour
      into a citizen dividend.
    </p>

    <h2>Pros — Why UBI works under an Electric Technocracy</h2>
    <ol>
      <li><strong>Absorbs automation shock.</strong> As robots and AI displace
        wage labour, UBI guarantees purchasing power so the consumer economy
        does not collapse alongside payroll.</li>
      <li><strong>Distributes the machine dividend.</strong> Productivity gains
        from energy and automation flow to citizens directly rather than
        concentrating in capital owners.</li>
      <li><strong>Reduces administrative overhead.</strong> A single universal
        transfer replaces dozens of means-tested welfare programmes, cutting
        bureaucracy and fraud surface.</li>
      <li><strong>Frees labour for high-value work.</strong> People can refuse
        exploitative jobs and pursue science, care, art, and civic
        engineering — work an Electric Technocracy actually needs.</li>
      <li><strong>Stabilises demand.</strong> Predictable income smooths
        consumption across recessions, energy shocks, and technological
        transitions.</li>
      <li><strong>Anchors human dignity.</strong> Basic survival ceases to be
        conditional on employability — a precondition for political freedom
        in a post-scarcity economy.</li>
    </ol>

    <h2>Cons — Honest objections and trade-offs</h2>
    <ol>
      <li><strong>Funding is non-trivial.</strong> Without an automation
        dividend, energy royalty, or land-value tax to back it, UBI requires
        either deficit spending or sharp redistributive taxation.</li>
      <li><strong>Inflation risk in scarce sectors.</strong> Housing,
        healthcare, and education can absorb the transfer as price increases
        unless supply-side policy expands those markets in parallel.</li>
      <li><strong>Labour-supply effects are uncertain.</strong> Pilot studies
        (Finland, Kenya, Stockton) show small effects, but a fully universal
        programme has never been measured at national scale.</li>
      <li><strong>Political capture.</strong> A fixed UBI can be eroded by
        inflation or weaponised by future governments as a tool of
        compliance.</li>
      <li><strong>Does not, by itself, fix inequality of capital.</strong>
        Without complementary policy (public ownership of grids, anti-trust,
        progressive taxation) UBI can coexist with extreme wealth
        concentration.</li>
      <li><strong>Implementation complexity.</strong> Identity, payment rails,
        cross-border eligibility, and fraud prevention require infrastructure
        most states do not yet operate at scale.</li>
    </ol>

    <h2>Design principles for a technocratic UBI</h2>
    <ul>
      <li><strong>Index to energy output</strong>, not to the consumer price
        index — the dividend grows with the grid.</li>
      <li><strong>Pair with public utilities</strong>: housing, healthcare,
        and transit kept at cost so the transfer cannot be captured by
        rentiers.</li>
      <li><strong>Fund from automation rents</strong>: a tax on machine-hours,
        compute, and non-renewable extraction.</li>
      <li><strong>Make it constitutional</strong>, not statutory — protected
        from short-term political reversal.</li>
      <li><strong>Pilot, measure, iterate</strong>: regional rollouts with
        public dashboards before national adoption.</li>
    </ul>

    <h2>Verdict</h2>
    <p>
      Inside the logic of Electric Technocracy, UBI is not a luxury — it is
      the accounting mechanism that lets a society run on machines without
      stranding its citizens. The serious questions are not <em>whether</em>
      to redistribute the surplus, but <em>how</em> to fund it without
      inflation, <em>how</em> to protect it from political erosion, and
      <em>how</em> to pair it with public infrastructure so the transfer
      reaches real consumption rather than rent.
    </p>

    <h2>Further reading on this site</h2>
    <ul>
      <li><a href="./united_en.html">Navigator — English</a></li>
      <li><a href="./search.html?q=universal+basic+income">Full-text search: “universal basic income”</a></li>
      <li><a href="./xref.html?q=UBI">Cross-reference index: UBI</a></li>
      <li><a href="./audit.html">Project audit &amp; transparency</a></li>
    </ul>
`;

function pageFor(lang) {
  const isRtl = RTL.has(lang);
  const self = urlFor(lang);
  const langLinks = LANGS.map(l => {
    const active = l === lang ? ' class="active"' : "";
    return `      <li><a${active} hreflang="${l}" lang="${l}" href="./${fileFor(l)}">${l.toUpperCase()}</a></li>`;
  }).join("\n");

  return `<!DOCTYPE html>
<html lang="${lang}" dir="${isRtl ? "rtl" : "ltr"}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${TITLE}</title>
  <meta name="description" content="${DESCRIPTION}" />
  <meta name="robots" content="index, follow" />
  <meta name="author" content="Electric Technocracy Community" />
  <meta name="theme-color" content="#0a2240" />
  <link rel="icon" type="image/png" href="favicon.png" />
  <link rel="canonical" href="${self}" />

  <!-- OpenGraph -->
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="Electric Technocracy Community Navigator" />
  <meta property="og:title" content="${TITLE}" />
  <meta property="og:description" content="${DESCRIPTION}" />
  <meta property="og:url" content="${self}" />
  <meta property="og:locale" content="${lang}" />
  <meta property="og:image" content="${OG_IMAGE}" />
  <meta property="og:image:width" content="1080" />
  <meta property="og:image:height" content="1080" />
  <meta property="og:image:type" content="image/jpeg" />
  <meta property="og:image:alt" content="Pros and cons of Universal Basic Income in an Electric Technocracy" />

  <!-- Twitter Card (placeholders) -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${TITLE}" />
  <meta name="twitter:description" content="${DESCRIPTION}" />
  <meta name="twitter:image" content="${OG_IMAGE}" />
  <meta name="twitter:site" content="${TWITTER_HANDLE}" />
  <meta name="twitter:creator" content="${TWITTER_HANDLE}" />

  <!-- hreflang matrix -->
${hreflangBlock(self)}

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": ${JSON.stringify(TITLE)},
    "description": ${JSON.stringify(DESCRIPTION)},
    "inLanguage": "${lang}",
    "mainEntityOfPage": "${self}",
    "image": "${OG_IMAGE}",
    "author": { "@type": "Organization", "name": "Electric Technocracy Community" },
    "publisher": { "@type": "Organization", "name": "Electric Technocracy Community" }
  }
  </script>

  <link rel="stylesheet" href="assets/css/style.css" />
  <style>
    .ubi-wrap{max-width:880px;margin:0 auto;padding:2rem 1.25rem 4rem;line-height:1.7}
    .ubi-wrap h1{font-size:2rem;margin:1rem 0 .75rem}
    .ubi-wrap h2{margin-top:2rem;color:#0a2240}
    .ubi-wrap .lead{font-size:1.1rem;opacity:.9}
    .ubi-wrap ol li, .ubi-wrap ul li{margin:.4rem 0}
    .lang-bar{display:flex;flex-wrap:wrap;gap:.35rem;padding:.75rem 1.25rem;border-bottom:1px solid #e5e7eb;list-style:none;margin:0}
    .lang-bar a{padding:.15rem .45rem;font-size:.8rem;text-decoration:none;color:#0a2240}
    .lang-bar a.active{background:#0a2240;color:#fff;border-radius:.25rem}
    [dir="rtl"] .ubi-wrap{text-align:right}
  </style>
</head>
<body>
  <nav aria-label="language">
    <ul class="lang-bar">
${langLinks}
    </ul>
  </nav>
  <main class="ubi-wrap" dir="${isRtl ? "rtl" : "ltr"}">
${CONTENT}
  </main>
  <footer style="text-align:center;padding:1.5rem;border-top:1px solid #e5e7eb;font-size:.85rem;opacity:.7">
    © Electric Technocracy Community · <a href="./index.html">Home</a>
  </footer>
</body>
</html>
`;
}

let n = 0;
for (const lang of LANGS) {
  const f = fileFor(lang);
  fs.writeFileSync(f, pageFor(lang));
  n++;
}
console.log(`✅ UBI guide built: ${n} pages (${LANGS.join(", ")})`);