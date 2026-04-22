// Rendering + Interaktion für das Organigramm.
// Nimmt window.ORG_DATA entgegen, generiert Mermaid-Quelltext, rendert, verdrahtet
// Klick-Handler zum Detail-Panel und baut die Quellen-Liste unten.

const data = window.ORG_DATA;

// ── Mermaid-Quelltext generieren ─────────────────────────────────────────
function buildMermaid() {
  const lines = ["flowchart TB"];

  const nodeInGroup = new Set();
  for (const grp of data.groups) {
    lines.push(`  subgraph ${grp.id}["${grp.label}"]`);
    lines.push("    direction TB");
    for (const nid of grp.nodes) {
      const n = data.nodes.find(x => x.id === nid);
      if (!n) continue;
      nodeInGroup.add(nid);
      lines.push(`    ${n.id}["${n.label}"]`);
    }
    lines.push("  end");
  }
  // Knoten ohne Gruppe
  for (const n of data.nodes) {
    if (!nodeInGroup.has(n.id)) {
      lines.push(`  ${n.id}["${n.label}"]`);
    }
  }
  // Kanten
  for (const [a, b, lbl] of data.edges) {
    if (lbl) lines.push(`  ${a} -- ${lbl} --> ${b}`);
    else     lines.push(`  ${a} --> ${b}`);
  }
  // Styling nach verify-Status
  for (const n of data.nodes) {
    if (n.verify === "snippet") lines.push(`  class ${n.id} verify`);
    if (n.verify === "archive") lines.push(`  class ${n.id} archive`);
  }
  // Klick-Handler
  for (const n of data.nodes) {
    lines.push(`  click ${n.id} nodeClick "${n.label.replace(/<br\/>/g, " ")}"`);
  }
  // Class-Defs
  lines.push("  classDef default fill:#ffffff,stroke:#2d6a4f,stroke-width:1.3px,color:#1a1a1a;");
  lines.push("  classDef verify  fill:#fffbeb,stroke:#b45309,stroke-dasharray:4 3,color:#1a1a1a;");
  lines.push("  classDef archive fill:#eff6ff,stroke:#1e40af,color:#1a1a1a;");

  return lines.join("\n");
}

// ── Mermaid initialisieren ───────────────────────────────────────────────
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

// Expose click-handler global (Mermaid ruft im globalen Scope auf)
window.nodeClick = function (nodeId) {
  showDetails(nodeId);
};

// ── Rendern ───────────────────────────────────────────────────────────────
async function render() {
  const src = buildMermaid();
  const el = document.getElementById("chart");
  const { svg, bindFunctions } = await mermaid.render("orgchart", src);
  el.innerHTML = svg;
  if (bindFunctions) bindFunctions(el);

  // Zoom-Buttons
  let scale = 1;
  const chart = el;
  const apply = () => { chart.style.transform = `scale(${scale})`; };
  document.getElementById("zoomIn").onclick    = () => { scale = Math.min(2.4, scale + 0.1); apply(); };
  document.getElementById("zoomOut").onclick   = () => { scale = Math.max(0.4, scale - 0.1); apply(); };
  document.getElementById("zoomReset").onclick = () => { scale = 1; apply(); };
}

// ── Detail-Panel ─────────────────────────────────────────────────────────
function showDetails(nodeId) {
  const n = data.nodes.find(x => x.id === nodeId);
  if (!n) return;

  // Highlight (Mermaid vergibt IDs der Form "flowchart-<id>-<n>")
  document.querySelectorAll("#chart .node.selected").forEach(el => el.classList.remove("selected"));
  const sel = document.querySelector(`#chart g.node[id^='flowchart-${nodeId}-']`);
  if (sel) sel.classList.add("selected");

  const panel = document.getElementById("details");
  const label = n.label.replace(/<br\/>/g, " · ");
  const badge =
    n.verify === "ok"      ? '<span class="badge ok">verifiziert</span>' :
    n.verify === "archive" ? '<span class="badge archive">archiv</span>' :
                             '<span class="badge warn">verify</span>';

  const srcLis = (n.sources || []).map(sid => {
    const s = data.sources[sid];
    if (!s) return "";
    return `<li><a href="${s.url}" target="_blank" rel="noopener">${s.title}</a></li>`;
  }).join("");

  panel.innerHTML = `
    <h2>${label} ${badge}</h2>
    <div class="role">${n.role || ""}</div>
    <p>${n.description || ""}</p>
    <dl>
      <dt>Belege</dt>
      <dd><ul>${srcLis || "<li><em>keine</em></li>"}</ul></dd>
    </dl>
  `;
}

// ── Quellenliste unten ───────────────────────────────────────────────────
function buildSourcesList() {
  const ol = document.getElementById("sourcesList");
  ol.innerHTML = "";
  for (const [sid, s] of Object.entries(data.sources)) {
    const li = document.createElement("li");
    li.innerHTML = `<a id="src-${sid}" href="${s.url}" target="_blank" rel="noopener">${s.title}</a> <code style="color:#888">[${sid}]</code>`;
    ol.appendChild(li);
  }
}

// ── Start ────────────────────────────────────────────────────────────────
render().then(buildSourcesList).catch(err => {
  console.error(err);
  document.getElementById("chart").innerHTML =
    '<pre style="color:#b45309">Mermaid-Rendering fehlgeschlagen: ' + err.message + '</pre>';
});
