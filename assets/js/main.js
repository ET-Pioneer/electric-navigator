/* Electric Technocracy Community Navigator — shared JS */
(function(){
  "use strict";

  // Footer year
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  // RTL auto-detect
  var lang = document.documentElement.getAttribute("lang") || "en";
  var rtlLangs = ["ar","he","fa","ur"];
  if (rtlLangs.indexOf(lang) !== -1) {
    document.documentElement.setAttribute("dir","rtl");
  }

  // Mobile nav toggle
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("primary-nav");
  if (toggle && nav){
    toggle.addEventListener("click", function(){
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function(e){
      if (e.target.tagName === "A" && window.matchMedia("(max-width: 859px)").matches){
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded","false");
      }
    });
  }

  // Active nav highlight
  function setActiveHash(){
    var hash = window.location.hash;
    document.querySelectorAll(".primary-nav a").forEach(function(a){
      if (a.getAttribute("href") === hash) a.classList.add("is-active");
      else a.classList.remove("is-active");
    });
  }
  window.addEventListener("hashchange", setActiveHash);
  setActiveHash();

  // Language switcher — highlight current page and preserve section/scroll
  var sel = document.getElementById("lang-select");
  if (sel){
    // Ensure an aria-live region exists for screen reader announcements
    var live = document.getElementById("lang-live");
    if (!live){
      live = document.createElement("div");
      live.id = "lang-live";
      live.setAttribute("role", "status");
      live.setAttribute("aria-live", "polite");
      live.setAttribute("aria-atomic", "true");
      live.style.cssText = "position:absolute;left:-10000px;top:auto;width:1px;height:1px;overflow:hidden;";
      document.body.appendChild(live);
    }
    // Determine current file
    var currentFile = window.location.pathname.split("/").pop() || "index.html";
    if (currentFile === "" || currentFile === "world") currentFile = "index.html";
    // Highlight matching option
    for (var i = 0; i < sel.options.length; i++){
      if (sel.options[i].value === currentFile){
        sel.selectedIndex = i;
        break;
      }
    }
    sel.addEventListener("change", function(){
      var target = sel.value;
      if (!target) return;
      var code = sel.options[sel.selectedIndex].dataset.code || "";
      var label = sel.options[sel.selectedIndex].text || code || target;
      // Announce to screen readers
      try {
        live.textContent = "";
        setTimeout(function(){ live.textContent = "Loading language: " + label; }, 30);
      } catch(e){}
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
        if (r.ok) window.location.href = url;
        else show404(target);
      }).catch(function(){
        window.location.href = url;
      });
    });
  }

  // Also highlight active language in lang-grid
  var langLinks = document.querySelectorAll(".lang-grid .lang-link");
  langLinks.forEach(function(a){
    a.classList.remove("active");
    var href = a.getAttribute("href") || "";
    var file = href.split("/").pop() || "";
    var currentFile2 = window.location.pathname.split("/").pop() || "index.html";
    if (currentFile2 === "" || currentFile2 === "world") currentFile2 = "index.html";
    if (file === currentFile2) a.classList.add("active");
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

  // Restore scroll/focus after language switch
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

  // Graceful broken-link guard
  document.querySelectorAll("a[data-check='1']").forEach(function(a){
    a.addEventListener("click", function(e){
      var href = a.getAttribute("href");
      if (!href || href === "#") { e.preventDefault(); show404(href||"#"); }
    });
  });

  // ─── Client-side SEO Checker ───
  (function seoCheck(){
    var issues = [];
    // Check canonical
    var canon = document.querySelector('link[rel="canonical"]');
    if (!canon) issues.push("SEO: Missing <link rel='canonical'>");
    else if (!canon.getAttribute("href")) issues.push("SEO: Canonical has empty href");

    // Check hreflang
    var hreflangs = document.querySelectorAll('link[rel="alternate"][hreflang]');
    if (hreflangs.length === 0) issues.push("SEO: No hreflang tags found");
    else {
      var codes = [];
      hreflangs.forEach(function(l){ codes.push(l.getAttribute("hreflang")); });
      if (codes.indexOf("x-default") === -1) issues.push("SEO: Missing x-default hreflang");
      // Check self-referencing
      var pageLang = document.documentElement.getAttribute("lang");
      if (pageLang && codes.indexOf(pageLang) === -1) issues.push("SEO: Missing self-referencing hreflang for lang='" + pageLang + "'");
    }

    // Check JSON-LD
    var jsonld = document.querySelectorAll('script[type="application/ld+json"]');
    if (jsonld.length === 0) issues.push("SEO: No JSON-LD structured data found");
    else {
      jsonld.forEach(function(s, idx){
        try { JSON.parse(s.textContent); }
        catch(e){ issues.push("SEO: JSON-LD block #" + (idx+1) + " has invalid JSON"); }
      });
    }

    // Check OG tags
    if (!document.querySelector('meta[property="og:title"]')) issues.push("SEO: Missing og:title");
    if (!document.querySelector('meta[property="og:description"]')) issues.push("SEO: Missing og:description");
    if (!document.querySelector('meta[property="og:image"]')) issues.push("SEO: Missing og:image");

    // Check Twitter
    if (!document.querySelector('meta[name="twitter:card"]')) issues.push("SEO: Missing twitter:card");

    // Check RTL consistency
    var htmlDir = document.documentElement.getAttribute("dir");
    if (rtlLangs.indexOf(lang) !== -1 && htmlDir !== "rtl") issues.push("SEO: RTL language '" + lang + "' but dir is not 'rtl'");

    // Report
    if (issues.length === 0){
      console.log("%c✅ SEO Check passed for " + window.location.pathname, "color:green;font-weight:bold");
    } else {
      console.group("%c⚠️ SEO Issues on " + window.location.pathname + " (" + issues.length + " found)", "color:orange;font-weight:bold");
      issues.forEach(function(i){ console.warn(i); });
      console.groupEnd();
    }
  })();

  // ─── Language Content Validator (index.html / united_fr.html / united_es.html) ───
  (function langContentCheck(){
    var file = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
    if (file === "" || file === "world") file = "index.html";
    // Marker words that should NOT appear on a page of a different language
    var markers = {
      en: ["Welcome to the institutional navigator", "Community Navigator", "Mission"],
      fr: ["Navigateur communautaire", "Bienvenue sur le navigateur", "Notre mission"],
      es: ["Navegador comunitario", "Bienvenido al navegador", "Nuestra misión"]
    };
    var expected = null;
    if (file === "index.html") expected = "en";
    else if (file === "united_fr.html") expected = "fr";
    else if (file === "united_es.html") expected = "es";
    if (!expected) return;

    var main = document.getElementById("main") || document.body;
    // Get visible text only (exclude nav/footer/lang switcher)
    var clone = main.cloneNode(true);
    clone.querySelectorAll("nav, header, footer, .lang-grid, #lang-select, script, style, [hidden]").forEach(function(el){ el.remove(); });
    var text = (clone.textContent || "").replace(/\s+/g, " ");

    var leaks = [];
    Object.keys(markers).forEach(function(lng){
      if (lng === expected) return;
      markers[lng].forEach(function(m){
        if (text.indexOf(m) !== -1){
          leaks.push("Found '" + lng.toUpperCase() + "' text on " + expected.toUpperCase() + " page: \"" + m + "\"");
        }
      });
    });

    // Also confirm at least one expected marker IS present
    var hasOwn = markers[expected].some(function(m){ return text.indexOf(m) !== -1; });
    if (!hasOwn){
      leaks.push("Expected " + expected.toUpperCase() + " marker text not found on " + file);
    }

    if (leaks.length === 0){
      console.log("%c✅ Language content OK (" + expected.toUpperCase() + ") on " + file, "color:green;font-weight:bold");
    } else {
      console.group("%c⚠️ Language leakage on " + file + " (" + leaks.length + " issue(s))", "color:red;font-weight:bold");
      leaks.forEach(function(l){ console.warn(l); });
      console.groupEnd();
    }
  })();
})();
