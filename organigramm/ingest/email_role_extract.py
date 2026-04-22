"""Email Role-Extractor — Strukturwissen aus Arbeitgeber-Email-Archiven.

Sub-Projekt B, MVP-Variante: **lokal-only**, **lesend**, **aggregate-only**.
Keine OB1-Verbindung, keine IMAP-Session — liest direkt *.eml-Dateien aus
einem gegebenen Verzeichnis.

Privacy-Architektur (strikt):
- Keine Kund*innen-Daten fließen in Output.
- Personen-Namen nur behalten, wenn im 5-Wort-Umkreis ein ROLE_TOKEN
  steht oder im Signature-Block zusammen mit einer Rolle auftritt.
- Output-Pfad MUSS innerhalb `organigramm/raw/` oder außerhalb git liegen
  — Skript weigert sich in andere Pfade zu schreiben.
- Zwei Output-Dateien:
  (a) public-Aggregate-JSON — nur Zahlen, nie Namen, ins proposals/-Verz
  (b) private-Findings-JSON  — Role-bearing Named Entities mit Counts,
      in gitignored raw/ (Paul's persönliche Integration in enrichments)

Stack: nur Python stdlib (email, pathlib, re, json, collections,
pathlib, datetime). Keine neuen Deps.

Usage:
    python -m organigramm.ingest.email_role_extract \\
        --input "/Users/p.fiedler/Desktop/Code_Projects/Marimo-ADBerlin/Mail " \\
        --public-out organigramm/proposals/2026-04-23-email-aggregate.json \\
        --private-out organigramm/raw/email-private-findings.json
"""
from __future__ import annotations

import argparse
import email
import email.policy
import json
import re
from collections import Counter, defaultdict
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Iterable

# ── Role-Token-Whitelist ──────────────────────────────────────────────────────
# Nur Personen, die in einem 5-Wort-Umkreis eines dieser Tokens auftauchen,
# werden als Rollen-Träger*innen extrahiert. Alles andere ist Rauschen oder
# Kund*innen/Angehörige.
ROLE_TOKENS: frozenset[str] = frozenset({
    # Leitungs-Rollen
    "Geschäftsführung", "Geschäftsführer", "Geschäftsführerin",
    "GF", "Leitung",
    "Pflegedienstleitung", "PDL",
    "Verwaltungsleitung", "Verwaltungsleiter", "Verwaltungsleiterin",
    "Koordination", "Koordinator", "Koordinatorin",
    "Referent", "Referentin",
    # Fachrollen
    "Pflegefachkraft", "Pflegefachkräfte", "Fachkraft",
    "Justitiar", "Justitiarin", "Rechtsabteilung", "Rechtsberatung",
    "Qualitätsmanagement", "QMB", "QM-Beauftragte", "QM-Beauftragter",
    # Gremien/Organe
    "Vorstand", "Vorsitz", "Vorsitzende", "Vorsitzender",
    "Kassenwart", "Kassenwartin", "Schriftführer", "Schriftführerin",
    "Betriebsrat", "BR-Mitglied", "BR-Vorsitz",
    "SBV", "Schwerbehindertenvertretung", "Vertrauensperson",
    # Beratung/Einsatz
    "Beratung", "Beratungsbüro", "Einsatzleitung",
    # Ausschüsse (aus Notion-Bericht)
    "Dienstplanausschuss", "Tarifkommission",
    "Arbeitsschutzausschuss", "Fortbildungsausschuss",
    # Verwaltung
    "Personalabteilung", "Personalsachbearbeitung",
    "Lohnbuchhaltung", "Finanzbuchhaltung", "Buchhaltung",
    "Sekretariat",
})

# Name-Pattern: 2-3 CapWord-Tokens hintereinander, z.B. "Max Mustermann",
# "Anna Maria Schulz", "Müller-Lüdenscheid, Peter"
NAME_RE = re.compile(
    r"\b[A-ZÄÖÜ][a-zäöüß]+(?:-[A-ZÄÖÜ][a-zäöüß]+)?(?:\s+[A-ZÄÖÜ][a-zäöüß]+(?:-[A-ZÄÖÜ][a-zäöüß]+)?){1,2}\b"
)

# Signature-Delimiter ("-- " auf eigener Zeile)
SIG_DELIM_RE = re.compile(r"^-- ?\s*$", re.MULTILINE)

# Email-Adress-Pattern für Absender-Domain-Stats
EMAIL_RE = re.compile(r"[A-Za-z0-9._+-]+@([A-Za-z0-9.-]+\.[A-Za-z]{2,})")

# ── Privacy-Guards ────────────────────────────────────────────────────────────
# Forbidden: Adressen (Straßen + PLZ), IBANs, SV-Nummern, Krankenversicherungs-IDs
IBAN_RE = re.compile(r"\bDE\d{2}(?:\s?\d{4}){5}(?:\s?\d{0,4})?\b")
SVNR_RE = re.compile(r"\b\d{2}\s?\d{6}\s?[A-Z]\s?\d{3}\b")
STREET_RE = re.compile(
    r"\b(?:Straße|Str\.|Str|Platz|Weg|Allee|Ring|Damm|Ufer|Gasse)\s+\d+\s*[a-z]?\b",
    re.IGNORECASE,
)


@dataclass
class EmailFinding:
    """Ein Rollenbezug-Fund in einer einzelnen Email."""
    name: str
    role_token: str
    context: str                 # 5-Wort-Snippet um Name+Rolle (zur Verifikation)
    from_domain: str
    date: str | None             # ISO-Datum wenn extrahierbar


@dataclass
class AggregateStats:
    """Public-safe Aggregate. Enthält KEINE Personen oder Emails."""
    total_emails: int = 0
    emails_by_year: dict[str, int] = field(default_factory=dict)
    from_domain_counts: dict[str, int] = field(default_factory=dict)
    to_domain_counts: dict[str, int] = field(default_factory=dict)
    subject_keyword_counts: dict[str, int] = field(default_factory=dict)
    emails_with_signatures: int = 0
    emails_with_role_hits: int = 0
    total_role_hits: int = 0
    emails_flagged_for_privacy: int = 0  # haben IBAN/SVNr/Adressen → nicht-inspected
    unparseable_emails: int = 0


# ── Privacy Gate ──────────────────────────────────────────────────────────────
def is_flagged_privacy(text: str) -> bool:
    """Regex-Scan auf klare Privacy-Red-Flags (IBAN, SVNr, Strassen)."""
    return bool(IBAN_RE.search(text) or SVNR_RE.search(text) or STREET_RE.search(text))


# ── Role-Token-Filter ─────────────────────────────────────────────────────────
def role_hits_in_text(text: str) -> list[tuple[str, str, str]]:
    """Findet (Name, Role-Token, Context)-Tupel — nur wo Name + Role nah sind.

    Strategie: Zerlege Text in Sätze. Pro Satz: suche alle Namen, suche alle
    Role-Token. Wenn beide im selben Satz, Nähe ≤ 5 Wörter → Treffer.
    """
    findings: list[tuple[str, str, str]] = []
    # Satzgrenzen vereinfacht: Zeilenumbruch + Punkt/Fragezeichen/Ausrufezeichen
    sentences = re.split(r"[.!?\n]+", text)
    for sent in sentences:
        sent = sent.strip()
        if not sent:
            continue
        words = sent.split()
        # Role-Token-Positionen
        role_positions = [
            (i, w) for i, w in enumerate(words)
            if w.strip(",.:;") in ROLE_TOKENS
        ]
        if not role_positions:
            continue
        # Names-Positionen (erster Token-Index pro Name)
        for match in NAME_RE.finditer(sent):
            name_text = match.group(0)
            name_start_char = match.start()
            # Berechne Wort-Position
            prefix = sent[:name_start_char]
            name_word_idx = len(prefix.split())
            # Abstand zu jedem Role-Token prüfen
            for role_idx, role_word in role_positions:
                if abs(role_idx - name_word_idx) <= 5:
                    context_start = max(0, min(role_idx, name_word_idx) - 2)
                    context_end = min(len(words), max(role_idx, name_word_idx) + 3)
                    context = " ".join(words[context_start:context_end])
                    findings.append((name_text, role_word.strip(",.:;"), context))
                    break  # Pro Name einmal reicht
    return findings


def extract_signature_block(body: str) -> str | None:
    """Extrahiert den Signature-Block nach '-- ' Delimiter."""
    match = SIG_DELIM_RE.search(body)
    if match:
        return body[match.end():].strip()
    return None


# ── Email-Parsing ─────────────────────────────────────────────────────────────
def parse_eml(path: Path) -> tuple[dict, str] | None:
    """Liest eine .eml-Datei, gibt (headers, body_text) zurück. None bei Fehler."""
    try:
        with open(path, "rb") as f:
            msg = email.message_from_binary_file(f, policy=email.policy.default)
    except Exception:
        return None

    headers = {
        "from": str(msg.get("From", "")),
        "to": str(msg.get("To", "")),
        "cc": str(msg.get("Cc", "")),
        "subject": str(msg.get("Subject", "")),
        "date": str(msg.get("Date", "")),
    }

    # Body: bevorzugt text/plain, fallback zu text/html (stripped)
    body = ""
    if msg.is_multipart():
        for part in msg.walk():
            ctype = part.get_content_type()
            if ctype == "text/plain":
                try:
                    body = part.get_content()
                    break
                except Exception:
                    continue
        if not body:
            for part in msg.walk():
                if part.get_content_type() == "text/html":
                    try:
                        html = part.get_content()
                        # Simple HTML-Strip
                        body = re.sub(r"<[^>]+>", " ", html)
                        break
                    except Exception:
                        continue
    else:
        try:
            body = msg.get_content()
        except Exception:
            body = ""

    return headers, body or ""


def extract_domain(email_field: str) -> str | None:
    """Aus 'Foo Bar <foo@example.org>' → 'example.org'"""
    match = EMAIL_RE.search(email_field)
    return match.group(1).lower() if match else None


def parse_year(date_str: str) -> str | None:
    """Aus Date-Header das Jahr extrahieren."""
    if not date_str:
        return None
    # Versuche RFC-2822-Parse
    try:
        from email.utils import parsedate_to_datetime
        dt = parsedate_to_datetime(date_str)
        return str(dt.year)
    except Exception:
        m = re.search(r"\b(19|20)\d{2}\b", date_str)
        return m.group(0) if m else None


# ── Keyword-Heuristik ─────────────────────────────────────────────────────────
# Subject-Keywords sind nicht-sensibel (Meta-Themen). Helfen bei Kategorisierung.
SUBJECT_KEYWORDS = {
    "einsatz", "schicht", "vertrag", "einarbeitung", "basisqualifizierung",
    "fortbildung", "rufbereitschaft", "dienstplan", "lohn", "abrechnung",
    "urlaub", "krankheit", "kündigung", "bewerbung", "einladung",
    "betriebsrat", "betriebsversammlung", "tarif", "vorstand", "versammlung",
    "beatmung", "pflege", "qualität", "beschwerde", "petition",
}


def count_keywords(text: str) -> Counter:
    counter: Counter = Counter()
    lower = text.lower()
    for kw in SUBJECT_KEYWORDS:
        if kw in lower:
            counter[kw] += 1
    return counter


# ── Main-Loop ─────────────────────────────────────────────────────────────────
def analyze_directory(input_dir: Path) -> tuple[AggregateStats, list[EmailFinding]]:
    """Liest alle *.eml aus input_dir, liefert Aggregate + Role-Findings."""
    stats = AggregateStats()
    findings: list[EmailFinding] = []

    eml_files = sorted(input_dir.glob("*.eml"))
    if not eml_files:
        raise FileNotFoundError(f"Keine *.eml-Dateien in {input_dir}")

    for eml_path in eml_files:
        stats.total_emails += 1
        parsed = parse_eml(eml_path)
        if not parsed:
            stats.unparseable_emails += 1
            continue
        headers, body = parsed

        # Year-Bucket
        year = parse_year(headers["date"])
        if year:
            stats.emails_by_year[year] = stats.emails_by_year.get(year, 0) + 1

        # Domain-Counts (nur Domain-Namen, keine lokalen Parts)
        from_domain = extract_domain(headers["from"])
        to_domain = extract_domain(headers["to"])
        if from_domain:
            stats.from_domain_counts[from_domain] = stats.from_domain_counts.get(from_domain, 0) + 1
        if to_domain:
            stats.to_domain_counts[to_domain] = stats.to_domain_counts.get(to_domain, 0) + 1

        # Subject-Keyword-Heuristik (NICHT die Subject-Texte selbst speichern)
        subj_kws = count_keywords(headers["subject"])
        for kw, n in subj_kws.items():
            stats.subject_keyword_counts[kw] = stats.subject_keyword_counts.get(kw, 0) + n

        # Privacy-Gate: wenn im Body klare PII-Indikatoren, Email überspringen
        if is_flagged_privacy(body):
            stats.emails_flagged_for_privacy += 1
            continue

        # Signature-Block-Parsing
        sig = extract_signature_block(body)
        sig_findings = role_hits_in_text(sig) if sig else []
        if sig:
            stats.emails_with_signatures += 1

        # Role-Hits in Signature + Body
        body_findings = role_hits_in_text(body[:5000])  # erste 5000 chars
        all_hits = sig_findings + body_findings
        if all_hits:
            stats.emails_with_role_hits += 1
            stats.total_role_hits += len(all_hits)
            for name, role, context in all_hits:
                findings.append(EmailFinding(
                    name=name,
                    role_token=role,
                    context=context[:200],
                    from_domain=from_domain or "",
                    date=year,
                ))

    return stats, findings


# ── Output-Writers ────────────────────────────────────────────────────────────
def write_public_aggregate(stats: AggregateStats, out_path: Path) -> None:
    """Public-safe Aggregate — nur Zahlen, keine Namen."""
    data = {
        "generated_at": datetime.utcnow().isoformat(timespec="seconds") + "Z",
        "total_emails": stats.total_emails,
        "emails_by_year": dict(sorted(stats.emails_by_year.items())),
        "top_from_domains": dict(Counter(stats.from_domain_counts).most_common(10)),
        "top_to_domains": dict(Counter(stats.to_domain_counts).most_common(10)),
        "subject_keyword_frequency": dict(Counter(stats.subject_keyword_counts).most_common(20)),
        "emails_with_signatures": stats.emails_with_signatures,
        "emails_with_role_hits": stats.emails_with_role_hits,
        "total_role_hits": stats.total_role_hits,
        "emails_flagged_for_privacy": stats.emails_flagged_for_privacy,
        "unparseable_emails": stats.unparseable_emails,
    }
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")


def write_private_findings(findings: list[EmailFinding], out_path: Path) -> None:
    """Private Findings — Namen + Rollen-Token. Gehört in gitignored raw/."""
    # Deduplicate by (name, role) — count frequencies
    by_pair: dict[tuple[str, str], dict] = {}
    for f in findings:
        key = (f.name, f.role_token)
        if key not in by_pair:
            by_pair[key] = {
                "name": f.name,
                "role_token": f.role_token,
                "occurrences": 0,
                "years": set(),
                "domains": set(),
                "sample_contexts": [],
            }
        b = by_pair[key]
        b["occurrences"] += 1
        if f.date:
            b["years"].add(f.date)
        if f.from_domain:
            b["domains"].add(f.from_domain)
        if len(b["sample_contexts"]) < 3:
            b["sample_contexts"].append(f.context)

    out = sorted(
        [
            {**v, "years": sorted(v["years"]), "domains": sorted(v["domains"])}
            for v in by_pair.values()
        ],
        key=lambda x: -x["occurrences"],
    )
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps({
        "generated_at": datetime.utcnow().isoformat(timespec="seconds") + "Z",
        "total_distinct_name_role_pairs": len(out),
        "pairs": out,
    }, indent=2, ensure_ascii=False), encoding="utf-8")


def _cli() -> None:
    p = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    p.add_argument("--input", required=True, type=Path, help="Verzeichnis mit *.eml-Dateien")
    p.add_argument("--public-out", required=True, type=Path, help="JSON-Pfad für Aggregate-Output (safe für Repo)")
    p.add_argument("--private-out", required=True, type=Path, help="JSON-Pfad für Named-Entity-Findings (gitignored raw/)")
    args = p.parse_args()

    # Guard: private-out MUSS in raw/ oder außerhalb Repo liegen
    priv_str = str(args.private_out.resolve())
    if ("organigramm/raw" not in priv_str) and ("/Desktop/ADBerlin" not in priv_str):
        raise SystemExit(
            f"private-out muss in organigramm/raw/ oder ~/Desktop/ADBerlin/ liegen. "
            f"Gegeben: {priv_str}"
        )

    stats, findings = analyze_directory(args.input)

    write_public_aggregate(stats, args.public_out)
    write_private_findings(findings, args.private_out)

    print(f"OK — {stats.total_emails} Emails analysiert, {stats.total_role_hits} Role-Treffer, "
          f"{stats.emails_flagged_for_privacy} wegen Privacy-Flag übersprungen.")
    print(f"  Public: {args.public_out}")
    print(f"  Private: {args.private_out}")


if __name__ == "__main__":
    _cli()
