/* Electric Technocracy Community Navigator — shared JS */
(function(){
  "use strict";

  // Footer year
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

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

  // Language switcher — preserve current section/scroll
  var sel = document.getElementById("lang-select");
  if (sel){
    sel.addEventListener("change", function(){
      var target = sel.value;
      if (!target) return;
      var hash = window.location.hash || "";
      // Remember scroll for restore if same-section anchor
      try { sessionStorage.setItem("etcn:lastHash", hash); } catch(e){}
      var url = target + hash;
      // Graceful 404: HEAD-check the target file before navigation
      fetch(target, {method:"HEAD"}).then(function(r){
        if (r.ok) window.location.href = url;
        else show404(target);
      }).catch(function(){
        // If HEAD fails (e.g. file://), just navigate
        window.location.href = url;
      });
    });
  }

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

  // Restore hash scroll after language switch (browser handles it, but ensure smooth)
  if (window.location.hash){
    var el = document.querySelector(window.location.hash);
    if (el) setTimeout(function(){ el.scrollIntoView({behavior:"auto", block:"start"}); }, 0);
  }

  // Graceful broken-link guard for archive/PDF anchors
  document.querySelectorAll("a[data-check='1']").forEach(function(a){
    a.addEventListener("click", function(e){
      var href = a.getAttribute("href");
      if (!href || href === "#") { e.preventDefault(); show404(href||"#"); }
    });
  });
})();
