# Organigramm-Recherche: ambulante dienste e.V. + Betriebsrat

## Inhalt dieses Ordners

| Datei | Zweck |
|-------|-------|
| `HANDOFF.md` | Übergabedokument – warum das nicht in der aktuellen Session fertig wurde, alle URLs, offene Punkte |
| `scrape.sh` | Shell-Skript: Mirror + PDF-Download + Text-Extraktion (lokal ausführen) |
| `data.yaml` | Strukturierte Rohdaten, aktuell nur aus Search-Snippets befüllt |
| `organigramm_draft.mmd` | Erster Mermaid-Entwurf des Organigramms |
| `raw/`, `pdfs/`, `pdf_text/` | (leer) werden von `scrape.sh` befüllt |

## Quick-Start auf einer Maschine mit Netz

```bash
cd organigramm
sudo apt install -y wget curl poppler-utils        # pdftotext
chmod +x scrape.sh
./scrape.sh
# → mirror/, pdfs/, pdf_text/, raw/keyword_hits.txt werden erzeugt

# Mermaid rendern (optional)
npm i -g @mermaid-js/mermaid-cli
mmdc -i organigramm_draft.mmd -o organigramm.svg
```

Danach `data.yaml` mit den echten Namen aus `raw/keyword_hits.txt`,
`mirror/` und `pdf_text/` anreichern, und den Mermaid-Entwurf aktualisieren.
