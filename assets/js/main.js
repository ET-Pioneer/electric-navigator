/* Electric Technocracy Community Navigator — shared JS */
(function(){
  "use strict";

  // ─── Constants ───
  var RTL_LANGS = ["ar","he","fa","ur"];
  // Page → expected language mapping
  var PAGE_LANG = {
    "index.html":"en","united_de.html":"de","united_fr.html":"fr","united_es.html":"es",
    "united_ar.html":"ar","united_hy.html":"hy","united_bn.html":"bn","united_bg.html":"bg",
    "united_ca.html":"ca","united_zh.html":"zh","united_cs.html":"cs","united_da.html":"da",
    "united_nl.html":"nl","united_fi.html":"fi","united_el.html":"el","united_he.html":"he",
    "united_hu.html":"hu","united_hi.html":"hi","united_id.html":"id","united_it.html":"it",
    "united_ja.html":"ja","united_ko.html":"ko","united_ms.html":"ms","united_no.html":"no",
    "united_fa.html":"fa","united_pl.html":"pl","united_pt.html":"pt","united_ro.html":"ro",
    "united_ru.html":"ru","united_sl.html":"sl","united_sv.html":"sv","united_th.html":"th",
    "united_tr.html":"tr","united_ur.html":"ur","united_vi.html":"vi"
  };
  // Per-language marker strings (visible heading/body words unique to that language)
  var MARKERS = {
    en: ["Welcome","Mission","Electric Technocracy","Age of Transition","Juridical Singularity","World Succession Deed","Important Links","PDF Archive"],
    de: ["Willkommen","Mission","Elektrische Technokratie","Zeitalter des Übergangs","Juristische Singularität","Weltsukzessionsurkunde","Wichtige Links","PDF-Archiv"],
    fr: ["Bienvenue","Mission","Technocratie électrique","Âge de transition","Singularité juridique","Acte de succession mondiale","Liens importants","Archive PDF"],
    es: ["Bienvenido","Misión","Tecnocracia eléctrica","Era de transición","Singularidad jurídica","Escritura de Sucesión Mundial","Enlaces importantes","Archivo PDF"],
    it: ["Benvenuto","Missione","Tecnocrazia elettrica","Era della transizione","Singolarità giuridica","Atto di successione mondiale","Collegamenti importanti","Archivio PDF"],
    pt: ["Bem-vindo","Missão","Tecnocracia elétrica","Era da Transição","Singularidade jurídica","Escritura de Sucessão Mundial","Links importantes","Arquivo PDF"],
    nl: ["Welkom","Missie","Elektrische technocratie","Tijdperk van transitie","Juridische singulariteit","Wereldopvolgingsakte","Belangrijke links","PDF-archief"],
    de_: [], // placeholder
    pl: ["Witamy","Misja","Elektryczna technokracja","Era przejścia","Osobliwość prawna","Akt sukcesji świata","Ważne linki","Archiwum PDF"],
    cs: ["Vítejte","Mise","Elektrická technokracie","Věk přechodu","Právní singularita","Listina světové sukcese","Důležité odkazy","PDF archiv"],
    sk: ["Vitajte"],
    sl: ["Dobrodošli","Poslanstvo","Električna tehnokracija","Doba prehoda","Pravna singularnost","Listina svetovnega nasledstva","Pomembne povezave","PDF arhiv"],
    hu: ["Üdvözöljük","Küldetés","Elektromos technokrácia","Az átmenet kora","Jogi szingularitás","Világöröklési okirat","Fontos hivatkozások","PDF archívum"],
    ro: ["Bun venit","Misiune","Tehnocrația electrică","Era tranziției","Singularitatea juridică","Actul succesiunii mondiale","Linkuri importante","Arhivă PDF"],
    bg: ["Добре дошли","Мисия","Електрическа технокрация","Епоха на прехода","Юридическа сингулярност","Акт за световно наследство","Важни връзки","PDF архив"],
    ru: ["Добро пожаловать","Миссия","Электрическая технократия","Эпоха перехода","Юридическая сингулярность","Акт мирового правопреемства","Важные ссылки","PDF архив"],
    el: ["Καλώς ήρθατε","Αποστολή","Ηλεκτρική τεχνοκρατία","Εποχή της μετάβασης","Νομική μοναδικότητα","Πράξη παγκόσμιας διαδοχής","Σημαντικοί σύνδεσμοι","Αρχείο PDF"],
    sv: ["Välkommen","Uppdrag","Elektrisk teknokrati","Övergångens tidsålder","Juridisk singularitet","Världsarvsakt","Viktiga länkar","PDF-arkiv"],
    no: ["Velkommen","Oppdrag","Elektrisk teknokrati","Overgangens tidsalder","Juridisk singularitet","Verdens arvedokument","Viktige lenker","PDF-arkiv"],
    da: ["Velkommen","Mission","Elektrisk teknokrati","Overgangens tidsalder","Juridisk singularitet","Verdens arvedokument","Vigtige links","PDF-arkiv"],
    fi: ["Tervetuloa","Tehtävä","Sähkötechnokratia","Siirtymän aikakausi","Juridinen singulaarisuus","Maailman perimysasiakirja","Tärkeät linkit","PDF-arkisto"],
    ca: ["Benvingut","Missió","Tecnocràcia elèctrica","Era de transició","Singularitat jurídica","Escriptura de successió mundial","Enllaços importants","Arxiu PDF"],
    hy: ["Բարի գալուստ","Առաքելություն","Էլեկտրական տեխնոկրատիա","Անցումային դարաշրջան","Իրավական եզակիություն","Համաշխարհային ժառանգության ակտ","Կարևոր հղումներ","PDF արխիվ"],
    zh: ["欢迎","使命","电力技术统治","过渡时代","法律奇点","世界继承契约","重要链接","PDF 档案"],
    ja: ["ようこそ","使命","電気テクノクラシー","移行の時代","法的特異点","世界継承証書","重要なリンク","PDFアーカイブ"],
    ko: ["환영합니다","사명","전기 기술관료제","전환의 시대","법적 특이점","세계 승계 증서","중요 링크","PDF 아카이브"],
    hi: ["स्वागत है","मिशन","विद्युत तकनीकी","संक्रमण युग","न्यायिक विलक्षणता","विश्व उत्तराधिकार विलेख","महत्वपूर्ण लिंक","पीडीएफ संग्रह"],
    bn: ["স্বাগতম","মিশন","বৈদ্যুতিক প্রযুক্তিতন্ত্র","পরিবর্তনের যুগ","আইনি একলত্ব","বিশ্ব উত্তরাধিকার দলিল","গুরুত্বপূর্ণ লিঙ্ক","পিডিএফ আর্কাইভ"],
    th: ["ยินดีต้อนรับ","ภารกิจ","เทคโนแครซีไฟฟ้า","ยุคแห่งการเปลี่ยนผ่าน","เอกฐานทางกฎหมาย","หนังสือสืบทอดโลก","ลิงก์สำคัญ","คลัง PDF"],
    vi: ["Chào mừng","Sứ mệnh","Công nghệ điện trị","Thời đại chuyển tiếp","Điểm kỳ dị pháp lý","Văn tự kế thừa thế giới","Liên kết quan trọng","Lưu trữ PDF"],
    id: ["Selamat datang","Misi","Teknokrasi listrik","Era transisi","Singularitas yuridis","Akta suksesi dunia","Tautan penting","Arsip PDF"],
    ms: ["Selamat datang","Misi","Teknokrasi elektrik","Era peralihan","Keunikan undang-undang","Surat ikatan suksesi dunia","Pautan penting","Arkib PDF"],
    tr: ["Hoş geldiniz","Görev","Elektrik teknokrasisi","Geçiş çağı","Hukuki tekillik","Dünya halefiyet senedi","Önemli bağlantılar","PDF arşivi"],
    ar: ["مرحبا","المهمة","التكنوقراطية الكهربائية","عصر الانتقال","التفرد القانوني","صك خلافة العالم","روابط مهمة","أرشيف PDF"],
    he: ["ברוך הבא","משימה","טכנוקרטיה חשמלית","עידן המעבר","ייחודיות משפטית","שטר ירושת העולם","קישורים חשובים","ארכיון PDF"],
    fa: ["خوش آمدید","ماموریت","تکنوکراسی الکتریکی","عصر گذار","تکینگی حقوقی","سند جانشینی جهانی","پیوندهای مهم","آرشیو PDF"],
    ur: ["خوش آمدید","مشن","برقی ٹیکنوکریسی","منتقلی کا دور","قانونی واحدیت","عالمی جانشینی دستاویز","اہم لنکس","پی ڈی ایف آرکائیو"]
  };

  // ─── Footer year ───
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  // ─── RTL auto-detect & apply ───
  var lang = (document.documentElement.getAttribute("lang") || "en").toLowerCase().split("-")[0];
  function applyRTL(langCode){
    var isRTL = RTL_LANGS.indexOf(langCode) !== -1;
    document.documentElement.setAttribute("dir", isRTL ? "rtl" : "ltr");
    document.documentElement.setAttribute("lang", langCode);
    if (document.body){
      if (isRTL){
        document.body.classList.add("is-rtl");
        document.body.style.textAlign = "right";
      } else {
        document.body.classList.remove("is-rtl");
        document.body.style.textAlign = "";
      }
    }
  }
  applyRTL(lang);

  // ─── Mobile nav toggle ───
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("primary-nav");
  var scrim = null;
  if (toggle && nav){
    scrim = document.createElement("div");
    scrim.className = "nav-scrim";
    document.body.appendChild(scrim);
    function setNav(open){
      nav.classList.toggle("open", open);
      scrim.classList.toggle("open", open);
      document.body.classList.toggle("nav-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    }
    toggle.addEventListener("click", function(){ setNav(!nav.classList.contains("open")); });
    scrim.addEventListener("click", function(){ setNav(false); });
    nav.addEventListener("click", function(e){
      if (e.target.tagName === "A") setNav(false);
    });
    document.addEventListener("keydown", function(e){
      if (e.key === "Escape" && nav.classList.contains("open")) setNav(false);
    });
  }

  // ─── Header hide-on-scroll-down / show-on-scroll-up ───
  (function scrollHeader(){
    var header = document.querySelector(".site-header");
    if (!header) return;
    var lastY = window.scrollY || 0, ticking = false, threshold = 80;
    function update(){
      var y = window.scrollY || 0;
      header.classList.toggle("is-scrolled", y > 4);
      // Don't hide while drawer is open
      if (document.body.classList.contains("nav-open")){ lastY = y; ticking = false; return; }
      if (y > lastY && y > threshold) header.classList.add("is-hidden");
      else if (y < lastY) header.classList.remove("is-hidden");
      lastY = y; ticking = false;
    }
    window.addEventListener("scroll", function(){
      if (!ticking){ window.requestAnimationFrame(update); ticking = true; }
    }, {passive:true});
  })();

  // ─── Back-to-top button ───
  (function backToTop(){
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "back-to-top";
    btn.setAttribute("aria-label","Back to top");
    btn.innerHTML = "↑";
    document.body.appendChild(btn);
    btn.addEventListener("click", function(){
      window.scrollTo({top:0, behavior:"smooth"});
      var skip = document.querySelector(".skip-link");
      if (skip && typeof skip.focus === "function") setTimeout(function(){ skip.focus(); }, 400);
    });
    var ticking = false;
    function update(){
      btn.classList.toggle("visible", (window.scrollY||0) > 320);
      ticking = false;
    }
    window.addEventListener("scroll", function(){
      if (!ticking){ window.requestAnimationFrame(update); ticking = true; }
    }, {passive:true});
    update();
  })();

  // ─── Active nav highlight ───
  function setActiveHash(){
    var hash = window.location.hash;
    document.querySelectorAll(".primary-nav a").forEach(function(a){
      if (a.getAttribute("href") === hash) a.classList.add("is-active");
      else a.classList.remove("is-active");
    });
  }
  window.addEventListener("hashchange", setActiveHash);
  setActiveHash();

  // ─── Language switcher ───
  var sel = document.getElementById("lang-select");
  // aria-live announcer
  var live = document.getElementById("lang-live");
  if (!live){
    live = document.createElement("div");
    live.id = "lang-live";
    live.setAttribute("role","status");
    live.setAttribute("aria-live","polite");
    live.setAttribute("aria-atomic","true");
    live.style.cssText = "position:absolute;left:-10000px;top:auto;width:1px;height:1px;overflow:hidden;";
    (document.body || document.documentElement).appendChild(live);
  }

  if (sel){
    var currentFile = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
    if (currentFile === "" || currentFile === "world") currentFile = "index.html";
    for (var i = 0; i < sel.options.length; i++){
      if (sel.options[i].value === currentFile){ sel.selectedIndex = i; break; }
    }
    sel.addEventListener("change", function(){
      var target = sel.value;
      if (!target) return;
      var code = sel.options[sel.selectedIndex].dataset.code || "";
      var label = sel.options[sel.selectedIndex].text || code || target;
      // RTL preview before navigation
      applyRTL(code);
      try { live.textContent = ""; setTimeout(function(){ live.textContent = "Loading language: " + label; }, 30); } catch(e){}
      try {
        localStorage.setItem("etcn:lang", code);
        if (window.location.hash) sessionStorage.setItem("etcn:lastHash", window.location.hash);
        sessionStorage.setItem("etcn:scrollY", String(window.scrollY || window.pageYOffset || 0));
        var af = document.activeElement;
        if (af && af.id) sessionStorage.setItem("etcn:focusId", af.id);
        else sessionStorage.removeItem("etcn:focusId");
      } catch(e){}
      var hash = window.location.hash || "";
      var url = target + hash;
      fetch(target, {method:"HEAD"}).then(function(r){
        if (r.ok) window.location.href = url; else show404(target);
      }).catch(function(){ window.location.href = url; });
    });
  }

  // ─── Highlight active language in lang-grid ───
  var langLinks = document.querySelectorAll(".lang-grid .lang-link");
  langLinks.forEach(function(a){
    a.classList.remove("active");
    var href = a.getAttribute("href") || "";
    var file = (href.split("/").pop() || "").toLowerCase();
    var cur = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
    if (cur === "" || cur === "world") cur = "index.html";
    if (file === cur) a.classList.add("active");
  });

  function show404(target){
    var n = document.getElementById("missing-file-notice");
    if (!n){
      n = document.createElement("div");
      n.id = "missing-file-notice";
      n.className = "notice";
      n.setAttribute("role","alert");
      var main = document.getElementById("main") || document.body;
      main.insertBefore(n, main.firstChild);
    }
    n.hidden = false;
    n.textContent = "The requested page (" + target + ") is not available yet. Please choose another language.";
  }

  // ─── Restore scroll/focus after language switch ───
  try {
    var savedY = sessionStorage.getItem("etcn:scrollY");
    var savedFocus = sessionStorage.getItem("etcn:focusId");
    if (window.location.hash){
      var el = document.querySelector(window.location.hash);
      if (el) setTimeout(function(){ el.scrollIntoView({behavior:"auto", block:"start"}); }, 0);
    } else if (savedY !== null){
      setTimeout(function(){ window.scrollTo(0, parseInt(savedY,10) || 0); }, 0);
    }
    if (savedFocus){
      var fEl = document.getElementById(savedFocus);
      if (fEl && typeof fEl.focus === "function") setTimeout(function(){ fEl.focus({preventScroll:true}); }, 0);
    }
    sessionStorage.removeItem("etcn:scrollY");
    sessionStorage.removeItem("etcn:focusId");
  } catch(e){}

  // ─── Broken-link guard ───
  document.querySelectorAll("a[data-check='1']").forEach(function(a){
    a.addEventListener("click", function(e){
      var href = a.getAttribute("href");
      if (!href || href === "#") { e.preventDefault(); show404(href||"#"); }
    });
  });

  // ─── OG image fallback probe ───
  (function ogFallback(){
    var meta = document.querySelector('meta[property="og:image"]');
    if (!meta) return;
    var src = meta.getAttribute("content");
    if (!src) return;
    var probe = new Image();
    probe.onload = function(){
      console.log("%c✅ OG image OK: " + src, "color:green");
    };
    probe.onerror = function(){
      console.warn("⚠️ OG image failed to load: " + src + " — applying fallback title");
      // Inject fallback alt-title meta
      var fb = document.createElement("meta");
      fb.setAttribute("property","og:image:alt");
      fb.setAttribute("content","Electric Technocracy Pioneers — Community Navigator");
      document.head.appendChild(fb);
      // Remove broken og:image so crawlers fall back to title
      meta.remove();
      var tw = document.querySelector('meta[name="twitter:image"]');
      if (tw) tw.remove();
    };
    probe.src = src;
  })();

  // ─── Visible-text DOM scanner (TreeWalker) ───
  function getVisibleText(root){
    var skipTags = {SCRIPT:1,STYLE:1,NOSCRIPT:1,TEMPLATE:1,META:1,LINK:1,HEAD:1,SVG:1,IFRAME:1};
    var skipSelectors = ["nav",".lang-grid","#lang-select","[hidden]","[aria-hidden='true']","footer .legal-meta"];
    var skipNodes = new Set();
    skipSelectors.forEach(function(sel){
      root.querySelectorAll(sel).forEach(function(n){ skipNodes.add(n); });
    });
    var text = [];
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function(node){
        var p = node.parentNode;
        while (p && p !== root){
          if (skipTags[p.nodeName]) return NodeFilter.FILTER_REJECT;
          if (skipNodes.has(p)) return NodeFilter.FILTER_REJECT;
          // CSS hidden
          if (p.nodeType === 1){
            var st = window.getComputedStyle(p);
            if (st && (st.display === "none" || st.visibility === "hidden")) return NodeFilter.FILTER_REJECT;
          }
          p = p.parentNode;
        }
        var t = node.nodeValue ? node.nodeValue.trim() : "";
        return t ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    var n;
    while ((n = walker.nextNode())) text.push(n.nodeValue);
    return text.join(" ").replace(/\s+/g, " ");
  }

  // ─── Client-side SEO Checker ───
  (function seoCheck(){
    var issues = [];
    var canon = document.querySelector('link[rel="canonical"]');
    if (!canon) issues.push("SEO: Missing <link rel='canonical'>");
    else if (!canon.getAttribute("href")) issues.push("SEO: Canonical has empty href");

    var hreflangs = document.querySelectorAll('link[rel="alternate"][hreflang]');
    if (hreflangs.length === 0) issues.push("SEO: No hreflang tags found");
    else {
      var codes = [];
      hreflangs.forEach(function(l){ codes.push(l.getAttribute("hreflang")); });
      if (codes.indexOf("x-default") === -1) issues.push("SEO: Missing x-default hreflang");
      var pageLang = document.documentElement.getAttribute("lang");
      if (pageLang && codes.indexOf(pageLang) === -1) issues.push("SEO: Missing self-referencing hreflang for lang='" + pageLang + "'");
    }

    var jsonld = document.querySelectorAll('script[type="application/ld+json"]');
    if (jsonld.length === 0) issues.push("SEO: No JSON-LD structured data found");
    else jsonld.forEach(function(s, idx){
      try { JSON.parse(s.textContent); }
      catch(e){ issues.push("SEO: JSON-LD block #" + (idx+1) + " has invalid JSON"); }
    });

    if (!document.querySelector('meta[property="og:title"]')) issues.push("SEO: Missing og:title");
    if (!document.querySelector('meta[property="og:description"]')) issues.push("SEO: Missing og:description");
    if (!document.querySelector('meta[property="og:image"]')) issues.push("SEO: Missing og:image");
    if (!document.querySelector('meta[name="twitter:card"]')) issues.push("SEO: Missing twitter:card");

    var htmlDir = document.documentElement.getAttribute("dir");
    if (RTL_LANGS.indexOf(lang) !== -1 && htmlDir !== "rtl") issues.push("SEO: RTL language '" + lang + "' but dir is not 'rtl'");

    if (issues.length === 0)
      console.log("%c✅ SEO Check passed for " + window.location.pathname, "color:green;font-weight:bold");
    else {
      console.group("%c⚠️ SEO Issues on " + window.location.pathname + " (" + issues.length + " found)", "color:orange;font-weight:bold");
      issues.forEach(function(i){ console.warn(i); });
      console.groupEnd();
    }
  })();

  // ─── Language Content Validator (all languages) ───
  (function langContentCheck(){
    var file = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
    if (file === "" || file === "world") file = "index.html";
    var expected = PAGE_LANG[file];
    if (!expected || !MARKERS[expected]) return;

    var main = document.getElementById("main") || document.body;
    var text = getVisibleText(main);
    var textLc = text.toLowerCase();

    var leaks = [];
    var matchMarker = window.__etcnMatchMarker = function(haystackLc, marker){
      if (!marker || marker.length < 4) return false;
      var mLc = marker.toLowerCase();
      // Word-boundary match for any marker containing latin word chars; substring for non-latin scripts.
      if (/[a-z0-9]/i.test(marker)){
        var esc = mLc.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
        var re = new RegExp("(^|[^\\p{L}\\p{N}])"+esc+"($|[^\\p{L}\\p{N}])","u");
        return re.test(haystackLc);
      }
      return haystackLc.indexOf(mLc) !== -1;
    };
    Object.keys(MARKERS).forEach(function(lng){
      if (lng === expected) return;
      var arr = MARKERS[lng] || [];
      arr.forEach(function(m){
        if (!matchMarker(textLc, m)) return;
        // Skip if the matched marker is also a substring of any expected marker (case-insensitive)
        var mLc = m.toLowerCase();
        var isShared = (MARKERS[expected]||[]).some(function(em){
          return em.toLowerCase().indexOf(mLc) !== -1;
        });
        if (isShared) return;
        leaks.push("Found '" + lng.toUpperCase() + "' text on " + expected.toUpperCase() + " page: \"" + m + "\"");
      });
    });

    var hasOwn = (MARKERS[expected]||[]).some(function(m){
      return textLc.indexOf(m.toLowerCase()) !== -1;
    });
    if (!hasOwn) leaks.push("Expected " + expected.toUpperCase() + " marker text not found on " + file);

    if (leaks.length === 0){
      console.log("%c✅ Language content OK (" + expected.toUpperCase() + ") on " + file, "color:green;font-weight:bold");
    } else {
      console.group("%c⚠️ Language leakage on " + file + " (" + leaks.length + " issue(s))", "color:red;font-weight:bold");
      leaks.forEach(function(l){ console.warn(l); });
      console.groupEnd();
      renderLangWarning(expected, file, leaks);
    }

    function renderLangWarning(expected, file, leaks){
      try {
        var existing = document.getElementById("lang-leak-warning");
        if (existing) existing.remove();
        var box = document.createElement("aside");
        box.id = "lang-leak-warning";
        box.setAttribute("role","alert");
        box.setAttribute("aria-live","assertive");
        box.style.cssText =
          "position:fixed;bottom:16px;right:16px;max-width:380px;z-index:9999;" +
          "background:#7a1d1d;color:#fff;padding:14px 16px;border-radius:10px;" +
          "box-shadow:0 8px 24px rgba(0,0,0,.35);font:14px/1.4 system-ui,sans-serif;";
        var title = document.createElement("strong");
        title.textContent = "⚠️ Language content issue on " + file + " (expected " + expected.toUpperCase() + ")";
        title.style.cssText = "display:block;margin-bottom:6px;font-size:14px;";
        box.appendChild(title);
        var list = document.createElement("ul");
        list.style.cssText = "margin:0 0 8px 18px;padding:0;font-size:12px;";
        leaks.slice(0, 6).forEach(function(l){
          var li = document.createElement("li");
          li.textContent = l;
          list.appendChild(li);
        });
        box.appendChild(list);
        var close = document.createElement("button");
        close.type = "button";
        close.textContent = "Dismiss";
        close.setAttribute("aria-label","Dismiss language warning");
        close.style.cssText = "background:#fff;color:#7a1d1d;border:0;border-radius:6px;padding:6px 10px;font-weight:600;cursor:pointer;";
        close.addEventListener("click", function(){ box.remove(); });
        box.appendChild(close);
        document.body.appendChild(box);
      } catch(e){}
    }
  })();

  // ─── Convert Important Links list into accordion items ───
  (function linksToAccordion(){
    var container = document.querySelector('#links .link-list, #links ul.link-list, section#links ul');
    if (!container) return;
    if (container.dataset.accordionApplied === "1") return;
    var items = Array.prototype.slice.call(container.children);
    var wrap = document.createElement("div");
    wrap.className = "links-accordion";
    items.forEach(function(li){
      if (li.tagName !== "LI") return;
      var details = document.createElement("details");
      details.className = "link-acc-item";
      var summary = document.createElement("summary");
      summary.className = "link-acc-summary";
      // Use the first text node + emoji as the title
      var firstAnchor = li.querySelector(":scope > a");
      var nestedUL = li.querySelector(":scope > ul");
      // Build heading text from li (excluding nested ul)
      var headingText = "";
      Array.prototype.forEach.call(li.childNodes, function(n){
        if (n.nodeType === 3) headingText += n.nodeValue;
        else if (n.nodeType === 1 && n.tagName !== "UL") headingText += n.textContent;
      });
      headingText = headingText.replace(/\s+/g," ").trim();
      if (!headingText && firstAnchor) headingText = firstAnchor.textContent.trim();
      summary.textContent = headingText || "Link";
      details.appendChild(summary);
      var body = document.createElement("div");
      body.className = "link-acc-body";
      // Move all children into body (preserve original anchors / nested lists)
      while (li.firstChild) body.appendChild(li.firstChild);
      details.appendChild(body);
      wrap.appendChild(details);
    });
    container.parentNode.replaceChild(wrap, container);
    wrap.dataset.accordionApplied = "1";

    // Inject minimal styles once
    if (!document.getElementById("links-accordion-style")){
      var s = document.createElement("style");
      s.id = "links-accordion-style";
      s.textContent =
        ".links-accordion{display:flex;flex-direction:column;gap:.5rem;margin:1rem 0;}" +
        ".link-acc-item{border:1px solid rgba(127,127,127,.25);border-radius:8px;background:rgba(255,255,255,.03);}" +
        ".link-acc-summary{cursor:pointer;padding:.75rem 1rem;font-weight:600;list-style:none;display:flex;align-items:center;gap:.5rem;}" +
        ".link-acc-summary::-webkit-details-marker{display:none;}" +
        ".link-acc-summary::after{content:'▸';margin-left:auto;transition:transform .2s;}" +
        "[dir='rtl'] .link-acc-summary::after{margin-left:0;margin-right:auto;content:'◂';}" +
        ".link-acc-item[open] > .link-acc-summary::after{transform:rotate(90deg);}" +
        ".link-acc-body{padding:.25rem 1rem 1rem;}" +
        ".link-acc-body ul{margin:.25rem 0 .25rem 1rem;padding:0;}" +
        ".link-acc-body a{display:inline-block;padding:.15rem 0;}";
      document.head.appendChild(s);
    }
  })();
})();
