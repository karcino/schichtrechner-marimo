// Rendering für die statische Organigramm-Seite.
// Datenquelle: window.ORG_DATA (vollständig unter Kontrolle dieses Repos).
// Render-Strategie: DOM-APIs + textContent — kein innerHTML ausserhalb der
// Mermaid-SVG-Ausgabe (die selbst erzeugt wird), damit versehentliche XSS
// auch bei späterem Daten-Wachstum ausgeschlossen bleibt.

const data = window.ORG_DATA;
const cit  = data.citations;
const src  = data.sources;

const VERIFY = {
  verified: { emoji: "🟢", label: "belegt",        cls: "ok" },
  inferred: { emoji: "🟡", label: "abgeleitet",    cls: "warn" },
  assumed:  { emoji: "🔴", label: "vermutet",      cls: "danger" },
  ok:       { emoji: "🟢", label: "belegt",        cls: "ok" },
  snippet:  { emoji: "🟡", label: "abgeleitet",    cls: "warn" },
  archive:  { emoji: "🟢", label: "belegt (Archiv)", cls: "ok" },
};

// ── DOM-Helpers ───────────────────────────────────────────────────────────
function el(tag, attrs, children) {
  const e = document.createElement(tag);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === "class") e.className = v;
      else if (k === "text") e.textContent = v;
      else if (k === "html") { /* explicitly not supported — use child nodes */ }
      else e.setAttribute(k, v);
    }
  }
  if (children) {
    for (const c of [].concat(children)) {
      if (c == null || c === false) continue;
      e.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    }
  }
  return e;
}

function badge(v) {
  const b = VERIFY[v] || VERIFY.inferred;
  return el("span", { class: `badge ${b.cls}`, text: `${b.emoji} ${b.label}` });
}

function sourceLinkEl(sid) {
  const s = src[sid]; if (!s) return document.createTextNode("");
  const a = el("a", { href: s.url, target: "_blank", rel: "noopener", text: s.title });
  const span = el("span", { class: "mute", text: s.accessed ? ` · abgerufen ${s.accessed}` : "" });
  const frag = document.createDocumentFragment();
  frag.appendChild(a); frag.appendChild(span);
  return frag;
}

function citationEl(cid) {
  const c = cit[cid]; if (!c) return el("span");
  const head = el("div", { class: "cite-head" }, [
    el("span", { class: "cite-ref",   text: c.ref }),
    el("span", { class: "cite-title", text: c.title }),
  ]);
  const quote = el("blockquote", { text: `„${c.quote}"` });
  const kids = [head, quote];
  if (c.implication) {
    kids.push(el("div", { class: "cite-impl" }, [
      el("strong", { text: "Im Kontext: " }),
      c.implication,
    ]));
  }
  kids.push(el("div", { class: "cite-src" }, [sourceLinkEl(c.source)]));
  if (c.source2) kids.push(el("div", { class: "cite-src" }, ["+ ", sourceLinkEl(c.source2)]));
  return el("div", { class: "citation" }, kids);
}

// ── Mermaid ───────────────────────────────────────────────────────────────
function buildMermaid() {
  const lines = ["flowchart TB"];
  const seen = new Set();
  for (const grp of data.groups) {
    lines.push(`  subgraph ${grp.id}["${grp.label}"]`);
    lines.push("    direction TB");
    for (const nid of grp.nodes) {
      const n = data.nodes.find(x => x.id === nid); if (!n) continue;
      seen.add(nid);
      lines.push(`    ${n.id}["${n.label}"]`);
    }
    lines.push("  end");
  }
  for (const n of data.nodes) if (!seen.has(n.id)) lines.push(`  ${n.id}["${n.label}"]`);
  for (const [a, b, lbl] of data.edges) {
    lines.push(lbl ? `  ${a} -- ${lbl} --> ${b}` : `  ${a} --> ${b}`);
  }
  for (const n of data.nodes) {
    if (n.verify === "inferred" || n.verify === "snippet") lines.push(`  class ${n.id} verifyInferred`);
    else if (n.verify === "assumed")                        lines.push(`  class ${n.id} verifyAssumed`);
  }
  for (const n of data.nodes) {
    const lbl = n.label.replace(/<br\/>/g, " ").replace(/&shy;/g, "").replace(/"/g, "'");
    lines.push(`  click ${n.id} nodeClick "${lbl}"`);
  }
  lines.push("  classDef default fill:#ffffff,stroke:#2d6a4f,stroke-width:1.3px,color:#1a1a1a;");
  lines.push("  classDef verifyInferred fill:#fffbeb,stroke:#b45309,stroke-dasharray:4 3,color:#1a1a1a;");
  lines.push("  classDef verifyAssumed  fill:#fff5f5,stroke:#b91c1c,stroke-dasharray:2 3,color:#1a1a1a;");
  return lines.join("\n");
}

mermaid.initialize({
  startOnLoad: false,
  theme: "base",
  securityLevel: "loose",
  themeVariables: {
    primaryColor: "#ffffff",
    primaryTextColor: "#1a1a1a",
    primaryBorderColor: "#2d6a4f",
    lineColor: "#2d6a4f",
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Helvetica Neue, Arial, sans-serif",
    fontSize: "14px",
  },
});

window.nodeClick = (id) => showNodeDetails(id);

async function renderChart() {
  const host = document.getElementById("chart");
  const { svg, bindFunctions } = await mermaid.render("orgchart", buildMermaid());
  // Mermaid gibt reines SVG zurück — Einfügen via DOMParser, nicht innerHTML.
  const parsed = new DOMParser().parseFromString(svg, "image/svg+xml");
  while (host.firstChild) host.removeChild(host.firstChild);
  host.appendChild(document.importNode(parsed.documentElement, true));
  if (bindFunctions) bindFunctions(host);

  let scale = 1;
  const apply = () => { host.style.transform = `scale(${scale})`; };
  document.getElementById("zoomIn").onclick    = () => { scale = Math.min(2.4, scale + 0.1); apply(); };
  document.getElementById("zoomOut").onclick   = () => { scale = Math.max(0.4, scale - 0.1); apply(); };
  document.getElementById("zoomReset").onclick = () => { scale = 1; apply(); };
}

// ── Node-Details ──────────────────────────────────────────────────────────
function showNodeDetails(nodeId) {
  const n = data.nodes.find(x => x.id === nodeId); if (!n) return;

  document.querySelectorAll("#chart .node.selected").forEach(x => x.classList.remove("selected"));
  const sel = document.querySelector(`#chart g.node[id^='flowchart-${nodeId}-']`);
  if (sel) sel.classList.add("selected");

  const panel = document.getElementById("details");
  while (panel.firstChild) panel.removeChild(panel.firstChild);

  const label = n.label.replace(/<br\/>/g, " · ").replace(/&shy;/g, "");
  const h2 = el("h2", {}, [label + " ", badge(n.verify)]);
  panel.appendChild(h2);
  panel.appendChild(el("div", { class: "role", text: n.role || "" }));
  panel.appendChild(el("p", { text: n.description || "" }));

  if (n.verify === "assumed") {
    panel.appendChild(el("div", { class: "warning",
      text: "Diese Angabe ist nicht öffentlich belegt. Vor Zitation intern bestätigen lassen." }));
  }

  if (n.citations && n.citations.length) {
    panel.appendChild(el("h3", { text: "Rechtliche Grundlagen" }));
    for (const cid of n.citations) panel.appendChild(citationEl(cid));
  }

  panel.appendChild(el("h3", { text: "Belege" }));
  const ul = el("ul", { class: "srclist" });
  if (n.sources && n.sources.length) {
    for (const sid of n.sources) ul.appendChild(el("li", {}, [sourceLinkEl(sid)]));
  } else {
    ul.appendChild(el("li", {}, [el("em", { text: "keine" })]));
  }
  panel.appendChild(ul);
}

// ── Prozesse ──────────────────────────────────────────────────────────────
function renderProcesses() {
  const host = document.getElementById("processes");
  if (!host) return;
  while (host.firstChild) host.removeChild(host.firstChild);

  for (const p of data.processes) {
    const header = el("header", {}, [
      el("h3", { text: "▶ " + p.label }),
      el("div", { class: "proc-meta" }, [
        el("span", { class: "role", text: p.role + " " }),
        badge(p.verify),
      ]),
    ]);

    const table = el("table", { class: "steps" });
    const thead = el("thead", {}, [
      el("tr", {}, [
        el("th", { text: "#" }),
        el("th", { text: "Schritt" }),
        el("th", { text: "Akteure" }),
        el("th", { text: "Kanal" }),
        el("th", { text: "Status" }),
      ]),
    ]);
    const tbody = el("tbody");
    for (const s of p.steps) {
      const stepLabelCell = el("td", { class: "step-label" }, [
        el("strong", { text: s.label }),
        s.detail ? el("div", { class: "step-detail", text: s.detail }) : null,
      ]);
      tbody.appendChild(el("tr", {}, [
        el("td", { class: "step-n", text: String(s.n) }),
        stepLabelCell,
        el("td", { class: "step-who", text: s.who || "" }),
        el("td", { class: "step-via" }, s.via ? [el("code", { text: s.via })] : []),
        el("td", { class: "step-verify" }, [badge(s.verify)]),
      ]));
    }
    table.appendChild(thead);
    table.appendChild(tbody);

    const kids = [header, el("p", { text: p.description }), table];
    if (p.citations && p.citations.length) {
      const citBox = el("div", { class: "proc-citations" }, [
        el("h4", { text: "Rechtliche Grundlagen dieses Prozesses" }),
      ]);
      for (const cid of p.citations) citBox.appendChild(citationEl(cid));
      kids.push(citBox);
    }
    host.appendChild(el("article", { class: "process" }, kids));
  }
}

// ── Kanäle ────────────────────────────────────────────────────────────────
function renderChannels() {
  const host = document.getElementById("channels");
  if (!host) return;
  while (host.firstChild) host.removeChild(host.firstChild);
  for (const ch of data.channels) {
    host.appendChild(el("article", { class: "channel" }, [
      el("header", {}, [
        el("h3", { text: "✉ " + ch.label }),
        el("div", { class: "role" }, [ch.role + " ", badge(ch.verify)]),
      ]),
      el("p", { text: ch.note }),
    ]));
  }
}

// ── Zitate-Liste ──────────────────────────────────────────────────────────
function renderCitationsList() {
  const host = document.getElementById("citations");
  if (!host) return;
  while (host.firstChild) host.removeChild(host.firstChild);
  for (const [id, c] of Object.entries(cit)) {
    const node = citationEl(id);
    node.id = "cit-" + id;
    host.appendChild(node);
  }
}

// ── Quellen-Liste ─────────────────────────────────────────────────────────
function renderSourcesList() {
  const ol = document.getElementById("sourcesList");
  while (ol.firstChild) ol.removeChild(ol.firstChild);
  for (const [sid, s] of Object.entries(src)) {
    const li = el("li", {}, [
      el("a", { href: s.url, target: "_blank", rel: "noopener", id: "src-" + sid, text: s.title }),
      s.accessed ? el("span", { class: "mute", text: " · " + s.accessed }) : "",
      " ",
      el("code", { class: "sid", text: "[" + sid + "]" }),
    ]);
    ol.appendChild(li);
  }
}

// ── Start ─────────────────────────────────────────────────────────────────
renderChart()
  .then(() => {
    renderProcesses();
    renderChannels();
    renderCitationsList();
    renderSourcesList();
  })
  .catch(err => {
    console.error(err);
    const host = document.getElementById("chart");
    while (host.firstChild) host.removeChild(host.firstChild);
    host.appendChild(el("pre", { style: "color:#b45309", text: "Mermaid-Rendering fehlgeschlagen: " + err.message }));
  });
