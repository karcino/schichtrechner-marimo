#!/usr/bin/env bash
# Mirror + PDF-Download für Organigramm-Recherche
# Voraussetzungen: wget, curl, pdftotext (poppler-utils)
# Lauf von innerhalb des Ordners organigramm/ aus starten.

set -euo pipefail

UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"
WAIT=1
TRIES=3

mkdir -p mirror pdfs pdf_text raw

# 1) HTML-Mirror der Hauptseiten (nur HTML + PDF, 2 Ebenen tief)
HOSTS=(
  "www.adberlin.com"
  "adberlin.com"
  "betriebsrat-ad.de"
  "betriebsrat-ad.site36.net"
  "verdiandfriends.de"
  "verdi-ad-lw.de"
)

for host in "${HOSTS[@]}"; do
  echo ">>> Mirror $host"
  wget \
    --mirror \
    --no-parent \
    --page-requisites=off \
    --convert-links \
    --adjust-extension \
    --level=3 \
    --wait="$WAIT" \
    --random-wait \
    --tries="$TRIES" \
    --user-agent="$UA" \
    --directory-prefix=mirror \
    --accept "html,htm,pdf,HTML,HTM,PDF" \
    "https://$host/" || true
done

# 2) Gezielte Einzelseiten nachladen, die vom Mirror evtl. nicht gefangen wurden
EXTRA_URLS=(
  "https://www.adberlin.com/neu/"
  "https://www.adberlin.com/neu/der-verein-ambulante-dienste-e-v"
  "https://www.adberlin.com/neu/der-verein-ambulante-dienste-e-v/mehr-uber-den-verein"
  "https://www.adberlin.com/neu/der-verein-ambulante-dienste-e-v/aktivitaeten/30-jahre-ad"
  "https://www.adberlin.com/neu/assistenzdienst"
  "https://www.adberlin.com/neu/assistenzdienst/einsatzstelle"
  "https://www.adberlin.com/neu/assistenzdienst/beratungsbueros"
  "https://www.adberlin.com/neu/assistenzdienst/qualitatsmanagement-startseite"
  "https://www.adberlin.com/neu/unser-angebot/personliche-assistenz"
  "https://www.adberlin.com/neu/unser-angebot/dienstleistungen-fur-bezieherinnen-eines-personlichen-budgets"
  "https://www.adberlin.com/neu/unsere-leistungen"
  "https://www.adberlin.com/neu/mitarbeiterinnenbereich_startseite/wichtige-telefonnummern"
  "https://www.adberlin.com/neu/themen-von-a-bis-z"
  "https://www.adberlin.com/neu/kontakt"
  "https://www.adberlin.com/neu/impressum"
  "https://www.adberlin.com/neu/stellen"
  "https://www.adberlin.com/neu/aktuelles"
  "https://betriebsrat-ad.de/"
  "https://betriebsrat-ad.de/billig-und-rechtlos/"
  "https://betriebsrat-ad.de/betriebsvereinbarungen-aktuell/"
  "https://betriebsrat-ad.site36.net/"
  "https://verdiandfriends.de/"
  "https://verdi-ad-lw.de/"
)
for u in "${EXTRA_URLS[@]}"; do
  fn="raw/$(echo "$u" | sed 's|[^A-Za-z0-9._-]|_|g').html"
  echo ">>> $u -> $fn"
  curl -sSL -A "$UA" "$u" -o "$fn" || true
done

# 3) Bekannte PDFs direkt holen
KNOWN_PDFS=(
  "http://www.adberlin.com/downloads/Flyer_persoenliche-Assistenz_web.pdf"
  "http://www.adberlin.com/downloads/Flyer_persoenliches-Budget_web.pdf"
  "http://www.adberlin.com/downloads/Leitbild_Handlungsgrundlagen.pdf"
  "http://www.adberlin.com/downloads/Leitbild_umfassende%20Positionen.pdf"
  "http://www.adberlin.com/downloads/2021-05-10%20_%2040%20Jahre%20ambulante%20Dienste%20_%20Endfassung.pdf"
)
for u in "${KNOWN_PDFS[@]}"; do
  fn="pdfs/$(basename "$u" | sed 's|%20| |g')"
  echo ">>> PDF $u"
  curl -sSL -A "$UA" "$u" -o "$fn" || true
done

# 4) PDFs aus dem Mirror nachziehen, die wget nicht direkt gespeichert hat
grep -rhoEi 'href="[^"]+\.pdf"' mirror/ raw/ 2>/dev/null \
  | sed -E 's/href="//;s/"$//' \
  | sort -u > pdfs/found_urls.txt || true

while IFS= read -r u; do
  # absolute URL aus relativem Pfad bauen, wenn nötig (nur http/https folgen)
  case "$u" in
    http*) ;;
    //*)   u="https:$u" ;;
    /*)    u="https://www.adberlin.com$u" ;;
    *)     continue ;;
  esac
  fn="pdfs/$(basename "$u" | sed 's|%20| |g')"
  [ -f "$fn" ] && continue
  echo ">>> extra PDF $u"
  curl -sSL -A "$UA" "$u" -o "$fn" || true
done < pdfs/found_urls.txt

# 5) PDFs in Text überführen
if command -v pdftotext >/dev/null 2>&1; then
  for f in pdfs/*.pdf; do
    [ -f "$f" ] || continue
    out="pdf_text/$(basename "${f%.pdf}").txt"
    [ -f "$out" ] && continue
    pdftotext -layout "$f" "$out" || true
  done
else
  echo "Hinweis: pdftotext nicht installiert – PDFs nicht textifiziert"
fi

# 6) Grobes Rohextrakt für Organigramm
{
  echo "# Treffer für Struktur-Schlüsselwörter"
  grep -rhEio \
    '(Vorstand|Vorständin|Geschäftsführung|Geschäftsführer[a-zäöüß]*|Leitung|Leiter[a-zäöüß]*|Referent[a-zäöüß]*|Beauftragte[a-zäöüß]*|Sekretariat|Beratungsbüro|Pflegedienstleitung|Verwaltungsleitung|Qualitätsmanagement|Betriebsrat|Tarifkommission)' \
    mirror/ raw/ pdf_text/ 2>/dev/null \
    | sort | uniq -c | sort -rn
} > raw/keyword_hits.txt

echo "Fertig. Ergebnisse:"
echo "  mirror/   – HTML-Spiegel"
echo "  raw/      – einzeln gezogene HTML-Seiten + Keyword-Hits"
echo "  pdfs/     – alle PDFs"
echo "  pdf_text/ – PDFs als .txt"
