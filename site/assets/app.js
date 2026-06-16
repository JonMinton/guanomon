/* The Guano Guild — site shell: two modes, vault graph + note reader. */
(function () {
  "use strict";
  var DATA = window.GUANOMON_DATA || { notes: [], edges: [], generated: "" };
  var NOTES = DATA.notes;
  var BY_SLUG = {};
  NOTES.forEach(function (n) { BY_SLUG[n.slug] = n; });

  var FOLDER_COLOR = {
    "00-context": "#8d6e63", "01-world": "#3a5a40", "02-characters": "#9c4221",
    "03-structure": "#2c5d7c", "04-chapters": "#b08968", "05-theory": "#6b4fa0",
    "(root)": "#777777"
  };
  function fcolor(f) { return FOLDER_COLOR[f] || "#777777"; }

  // Story mode reads the actual drafted chapters straight from the vault
  // (folder 04-chapters, in filename order; the template _-prefixed file is skipped).
  function storyChapters() {
    return NOTES.filter(function (n) {
      return n.folder === "04-chapters" && n.slug.charAt(0) !== "_";
    }).sort(function (a, b) { return a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0; });
  }

  // Split a chapter note into title (# …), standfirst (*italic* line) and body (after the ---).
  function parseChapter(md) {
    var lines = String(md).split("\n");
    var title = "", stand = "", bodyStart = lines.length;
    for (var i = 0; i < lines.length; i++) {
      var s = lines[i].trim();
      if (!title && s.indexOf("# ") === 0) { title = s.slice(2).trim(); continue; }
      if (title && !stand && /^\*.+\*$/.test(s)) { stand = s.replace(/^\*+|\*+$/g, "").trim(); continue; }
      if (title && /^---+$/.test(s)) { bodyStart = i + 1; break; }
    }
    return { title: title, stand: stand, body: lines.slice(bodyStart).join("\n").trim() };
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  // [[target]] / [[target|alias]] / [[target\|alias]] / [[target#h|alias]] -> anchor
  function renderWikilinks(md) {
    return md.replace(/\[\[([^\]]+?)\]\]/g, function (full, inner) {
      var parts = inner.split(/\\?\|/);
      var left = parts[0];
      var alias = parts.length > 1 ? parts.slice(1).join("|") : null;
      var target = left.split("#")[0].trim();
      var text = (alias != null ? alias : left).trim();
      var slug = target.toLowerCase();
      if (BY_SLUG[slug]) {
        return '<a class="wikilink" data-note="' + slug + '" href="#experiment/notes/' +
          slug + '">' + esc(text) + "</a>";
      }
      return '<span class="wikilink dangling" title="no note: ' + esc(target) + '">' + esc(text) + "</span>";
    });
  }

  function mdToHtml(md) {
    var pre = renderWikilinks(md);
    if (window.marked && window.marked.parse) {
      try { return window.marked.parse(pre); } catch (e) { /* fall through */ }
    }
    return "<pre>" + esc(md) + "</pre>";
  }

  /* ---------------- routing ---------------- */
  function qs(id) { return document.getElementById(id); }

  function showMode(mode) {
    qs("story").hidden = mode !== "story";
    qs("experiment").hidden = mode !== "experiment";
    setActive(".modes a", mode === "story" ? "mode-story" : "mode-experiment");
  }
  function setActive(sel, id) {
    document.querySelectorAll(sel).forEach(function (a) { a.classList.remove("active"); });
    var el = qs(id); if (el) el.classList.add("active");
  }

  var graphInited = false;
  function showSub(sub, slug) {
    ["about", "graph", "notes"].forEach(function (s) {
      qs("sub-" + s).hidden = s !== sub;
    });
    document.querySelectorAll(".subnav a").forEach(function (a) {
      a.classList.toggle("active", a.getAttribute("data-sub") === sub);
    });
    if (sub === "graph") ensureGraph();
    if (sub === "notes") openNote(slug || null);
  }

  function route() {
    var h = (location.hash || "").replace(/^#/, "");
    if (!h) h = "story";
    var seg = h.split("/");
    if (seg[0] === "experiment") {
      showMode("experiment");
      showSub(seg[1] || "about", seg[2] || null);
    } else {
      showMode("story");
      openStoryChapter(seg[1] || null);
    }
  }

  /* ---------------- story: single page, side nav, auto-numbered ---------------- */
  // The running number is derived from order, not stored in the files: index 0 is the
  // prologue; indices 1..n are the numbered accounts.
  var ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX"];
  function roman(n) { return ROMAN[n] || String(n); }
  function chapterKicker(idx) { return idx === 0 ? "Prologue" : "Account " + roman(idx); }

  function buildTOC() {
    var ol = qs("toc-list"); if (!ol) return;
    ol.innerHTML = storyChapters().map(function (n, i) {
      var c = parseChapter(n.md);
      var name = i === 0 ? "Prologue — " + c.title : c.title;
      return '<li><a href="#story/' + n.slug + '" data-chap="' + n.slug + '">' +
        '<span class="ch-tag">' + esc(i === 0 ? "" : roman(i)) + "</span>" +
        '<span class="ch-name">' + esc(name) + "</span></a></li>";
    }).join("");
  }

  function setStoryActive(slug) {
    document.querySelectorAll("#toc-list a").forEach(function (a) {
      a.classList.toggle("active", a.getAttribute("data-chap") === slug);
    });
  }

  function openStoryChapter(slug) {
    var reader = qs("story-reader"); if (!reader) return;
    var chapters = storyChapters();
    if (!chapters.length) return;
    var idx = 0; // default: the prologue
    if (slug) {
      for (var i = 0; i < chapters.length; i++) { if (chapters[i].slug === slug) { idx = i; break; } }
    }
    var n = chapters[idx], c = parseChapter(n.md);
    var prev = chapters[idx - 1], next = chapters[idx + 1];
    function navlink(ch, cls, prefix, suffix) {
      if (!ch) return "<span></span>";
      return '<a class="' + cls + '" href="#story/' + ch.slug + '">' +
        (prefix || "") + esc(parseChapter(ch.md).title) + (suffix || "") + "</a>";
    }
    reader.innerHTML =
      '<header class="chapter-head"><p class="chapter-kicker">' + esc(chapterKicker(idx)) + "</p>" +
      "<h1>" + esc(c.title) + "</h1></header>" +
      '<div class="chapter-body">' + mdToHtml(c.body) + "</div>" +
      '<nav class="chapter-nav">' +
      navlink(prev, "cn-prev", "‹ ", "") +
      navlink(next, "cn-next", "", " ›") +
      "</nav>";
    var body = reader.querySelector(".chapter-body");
    if (body && body.firstElementChild && body.firstElementChild.tagName === "P") {
      body.firstElementChild.classList.add("dropcap");
    }
    setStoryActive(n.slug);
    if (typeof window.scrollTo === "function") window.scrollTo(0, 0);
  }

  /* ---------------- notes view ---------------- */
  function buildNoteIndex(filter) {
    var box = qs("note-index"); if (!box) return;
    filter = (filter || "").toLowerCase();
    var byFolder = {};
    NOTES.forEach(function (n) {
      if (filter && n.title.toLowerCase().indexOf(filter) < 0 &&
        n.slug.toLowerCase().indexOf(filter) < 0) return;
      (byFolder[n.folder] = byFolder[n.folder] || []).push(n);
    });
    var html = "";
    Object.keys(byFolder).sort().forEach(function (f) {
      html += '<div class="grp" style="color:' + fcolor(f) + '">' + esc(f) + "</div>";
      byFolder[f].forEach(function (n) {
        html += '<a href="#experiment/notes/' + n.slug + '" data-note="' + n.slug + '">' +
          esc(n.title) + "</a>";
      });
    });
    box.innerHTML = html || '<p class="muted">No matches.</p>';
  }

  function openNote(slug) {
    var reader = qs("note-reader");
    if (!slug) { if (reader) reader.innerHTML = '<p class="muted">Select a note from the list or the graph.</p>'; return; }
    var n = BY_SLUG[slug];
    if (!n) { reader.innerHTML = '<p class="muted">Unknown note: ' + esc(slug) + "</p>"; return; }
    document.querySelectorAll("#note-index a").forEach(function (a) {
      a.classList.toggle("active", a.getAttribute("data-note") === slug);
    });
    reader.classList.remove("raw");
    reader.innerHTML =
      '<div class="reader-bar"><span class="crumb">' + esc(n.folder) + " / " + esc(n.slug) +
      '.md</span><button id="raw-toggle">view raw</button></div>' +
      '<div class="rendered">' + mdToHtml(n.md) + "</div>";
    var btn = qs("raw-toggle");
    btn.addEventListener("click", function () {
      if (reader.classList.contains("raw")) {
        reader.classList.remove("raw");
        qs("note-body").outerHTML = '<div class="rendered" id="note-body">' + mdToHtml(n.md) + "</div>";
        btn.textContent = "view raw";
      } else {
        reader.classList.add("raw");
        var r = reader.querySelector(".rendered");
        r.outerHTML = '<pre id="note-body">' + esc(n.md) + "</pre>";
        btn.textContent = "view rendered";
      }
    });
    var r = reader.querySelector(".rendered"); if (r) r.id = "note-body";
  }

  /* ---------------- graph ---------------- */
  function ensureGraph() {
    if (graphInited) { return; }
    var el = qs("graph");
    if (!el || !window.vis || !window.vis.Network) {
      if (el) el.innerHTML = '<p class="muted" style="padding:1rem">Graph library unavailable (needs network access).</p>';
      return;
    }
    var nodes = NOTES.map(function (n) {
      return { id: n.slug, label: n.title, color: fcolor(n.folder), shape: "dot",
        font: { color: "#1c1a17", size: 13 }, value: 1 };
    });
    // size by degree
    var deg = {};
    DATA.edges.forEach(function (e) { deg[e.from] = (deg[e.from] || 0) + 1; deg[e.to] = (deg[e.to] || 0) + 1; });
    nodes.forEach(function (nd) { nd.value = (deg[nd.id] || 0) + 1; });
    var edges = DATA.edges.map(function (e) {
      return { from: e.from, to: e.to, color: { color: "#bdb2a0", opacity: 0.7 }, width: 0.6 };
    });
    var network = new window.vis.Network(el, {
      nodes: new window.vis.DataSet(nodes), edges: new window.vis.DataSet(edges)
    }, {
      nodes: { scaling: { min: 6, max: 26 } },
      physics: { stabilization: true, barnesHut: { gravitationalConstant: -3000, springLength: 110 } },
      interaction: { hover: true, tooltipDelay: 120 },
      edges: { smooth: { type: "continuous" } }
    });
    network.on("click", function (p) {
      if (p.nodes && p.nodes.length) location.hash = "#experiment/notes/" + p.nodes[0];
    });
    graphInited = true;
    buildLegend();
  }

  function buildLegend() {
    var folders = {};
    NOTES.forEach(function (n) { folders[n.folder] = true; });
    qs("graph-legend").innerHTML = Object.keys(folders).sort().map(function (f) {
      return '<span><i style="background:' + fcolor(f) + '"></i>' + esc(f) + "</span>";
    }).join("");
  }

  /* ---------------- init ---------------- */
  function init() {
    buildTOC();
    buildNoteIndex("");
    var search = qs("note-search");
    if (search) search.addEventListener("input", function () { buildNoteIndex(search.value); });
    var stamp = qs("build-stamp");
    if (stamp) stamp.textContent = DATA.generated ? "vault snapshot " + DATA.generated : "";
    window.addEventListener("hashchange", route);
    route();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else { init(); }
})();
