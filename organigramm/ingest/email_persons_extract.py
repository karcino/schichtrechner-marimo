"""Email Persons Extractor — Stage 1-3 von Sub-Projekt B (Vollversion).

Ergänzt `email_role_extract.py` um:

1. **Signature-Block-Detection** via deutscher Closing-Phrases ("Mit freundlichen
   Grüßen", "Viele Grüße", …) — RFC-`-- `-Delimiter war in den untersuchten
   Mails nicht vorhanden.
2. **Mehrzeilige Signatur-Parse**: nach Closing-Phrase werden die nächsten
   ~8 Zeilen untersucht; je Zeile wird erkannt ob Name / Rolle / Telefon /
   Email / Büro-Markierung.
3. **ASN-Kürzel-Extraction** aus Subjects + Filenames (Pattern "BeUn", "MaPu",
   "MoJa", "RaHi" = 2+2 CamelCase).
4. **Kommunikations-Log**: pro identifizierter Person Liste der Thread-Dates
   + Richtung + Subject-Hash (SHA-256 der 40 ersten Zeichen) — kein Content.

Output (alle in organigramm/raw/, gitignored):
- persons-private.json
- asn-kuerzel-private.json
- communication-log-private.json

Public-Aggregate-MD in organigramm/proposals/ (nur Zahlen, keine Namen).

Stack: Python stdlib. Keine neuen Deps.
"""
from __future__ import annotations

import argparse
import email
import email.policy
import hashlib
import json
import re
from collections import Counter, defaultdict
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path
from typing import Iterable


# ── Heuristische Marker ──────────────────────────────────────────────────────
CLOSING_PHRASES = [
    "mit freundlichen grüßen",
    "mit freundlichen grüssen",
    "mit kollegialen grüßen",
    "mit solidarischen grüßen",
    "freundliche grüße",
    "viele grüße",
    "beste grüße",
    "liebe grüße",
    "herzliche grüße",
    "solidarische grüße",
    "schöne grüße",
    "sonnige grüße",
    "grüße aus berlin",
    "grüße,",
    "gruß,",
    "in freundlicher erwartung",
]

# Short abbrevs (einzeilig)
CLOSING_ABBR = ["mfg", "vg", "lg", "bg"]

# Role-Tokens (erweitert gegenüber email_role_extract.py)
ROLE_TOKENS = frozenset({
    "Geschäftsführung", "Geschäftsführer", "Geschäftsführerin",
    "GF", "Leitung", "Verwaltungsleitung", "Verwaltungsleiter", "Verwaltungsleiterin",
    "Pflegedienstleitung", "PDL",
    "Koordination", "Koordinator", "Koordinatorin",
    "Referent", "Referentin",
    "Pflegefachkraft", "Pflegefachkräfte", "Fachkraft",
    "Justitiar", "Justitiarin", "Rechtsabteilung", "Rechtsberatung",
    "Qualitätsmanagement", "QMB", "QM-Beauftragte", "QM-Beauftragter",
    "Vorstand", "Vorsitz", "Vorsitzende", "Vorsitzender",
    "Kassenwart", "Kassenwartin", "Schriftführer", "Schriftführerin",
    "Betriebsrat", "BR-Mitglied", "BR-Vorsitz", "Betriebsratsvorsitz",
    "SBV", "Schwerbehindertenvertretung", "Vertrauensperson",
    "Beratung", "Beratungsbüro", "Einsatzleitung",
    "Dienstplanausschuss", "Tarifkommission",
    "Personalabteilung", "Personalsachbearbeitung",
    "Lohnbuchhaltung", "Finanzbuchhaltung", "Buchhaltung",
    "Sekretariat",
    "Einsatzbegleitung", "Einsatzbegleiter", "Einsatzbegleiterin",
    "Koordinator*in", "Koordinatorin", "Sachbearbeitung", "Sachbearbeiter",
    "Fortbildung", "Fortbildungsbeauftragte", "Fortbildungsreferent",
})

# Büro-Markers (vereinheitlichte Form)
BUERO_MARKERS = {
    "beratungsbüro süd": "BBS",
    "beratungsbüro west": "BBW",
    "beratungsbüro nordost": "BBN",
    "beratungsbüro nord/ost": "BBN",
    "einsatzstelle": "ES",
    "wilhelm-kabus": "ES",
    "urbanstr": "BR",
    "urbanstraße": "BR",
    "mehringhof": "BBS",
    "gneisenaustr": "BBS",
    "schöneberg": "ES",
    "kreuzberg": "BBS",
}

# Regex-Patterns
PHONE_RE = re.compile(
    r"(?:\+49\s?|0)(?:[\d][\d\s\-/()]{5,18}[\d])"
)
EMAIL_RE = re.compile(
    r"[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
)

# ASN-Kürzel: z.B. "BeUn", "MoJa", "RaHi", "SchKi" — 2+2 oder 3+3 CamelCase
# Format: Cap-lower(1-2) + Cap-lower(1-2)
ASN_KUERZEL_RE = re.compile(
    r"\b[A-Z][a-zäöüß]{1,3}[A-Z][a-zäöüß]{1,3}\b"
)

# Name: 1-3 capitalized words, keine Zahlen
NAME_RE = re.compile(
    r"^[A-ZÄÖÜ][a-zäöüß]+(?:-[A-ZÄÖÜ][a-zäöüß]+)?(?:\s+[A-ZÄÖÜ][a-zäöüß]+(?:-[A-ZÄÖÜ][a-zäöüß]+)?){0,2}\.?$"
)

# Privacy-Guards (wie vorher)
IBAN_RE = re.compile(r"\bDE\d{2}(?:\s?\d{4}){5}(?:\s?\d{0,4})?\b")
SVNR_RE = re.compile(r"\b\d{2}\s?\d{6}\s?[A-Z]\s?\d{3}\b")
# Address-Matches sind hier weniger streng — wir wollen die Mails MIT Kunden-Adressen auch parsen,
# aber beim Signature-Extrakt filtern, dass Adressen nicht in Person-Records landen.
STREET_RE = re.compile(
    r"\b(?:Straße|Str\.|Str|Platz|Weg|Allee|Ring|Damm|Ufer|Gasse)\s+\d+\s*[a-z]?\b",
    re.IGNORECASE,
)


# ── Data-Classes ─────────────────────────────────────────────────────────────
@dataclass
class SignatureRecord:
    name: str | None = None
    role: str | None = None
    phone: str | None = None
    email: str | None = None
    buero_hint: str | None = None   # BBS/BBW/BBN/ES/BR-Code
    raw_lines: list[str] = field(default_factory=list)


@dataclass
class PersonRecord:
    """Aggregiert aus allen Emails, in denen eine Person erwähnt wird."""
    name: str
    role_guesses: list[str] = field(default_factory=list)
    phone_candidates: list[str] = field(default_factory=list)
    email_candidates: list[str] = field(default_factory=list)
    buero_guesses: list[str] = field(default_factory=list)
    occurrences: int = 0
    first_seen: str | None = None
    last_seen: str | None = None
    sample_closing_line: str | None = None
    # Erweiterungen (v3) für reichere UI
    in_count: int = 0                                   # von Person empfangen (du hast Mail bekommen)
    out_count: int = 0                                  # an Person gesendet (du hast Mail geschrieben)
    top_keywords: list[tuple[str, int]] = field(default_factory=list)  # [(keyword, count), ...]
    co_mentioned_with: list[tuple[str, int]] = field(default_factory=list)  # andere Personen im selben Thread


@dataclass
class ASNRecord:
    kuerzel: str
    occurrences: int = 0
    contexts_count: int = 0        # in wie vielen Mails gesehen
    associated_bueros: list[str] = field(default_factory=list)   # welche Büros erwähnen es?
    associated_persons: list[tuple[str, int]] = field(default_factory=list)   # [(Name, count)] sortiert nach count
    first_seen: str | None = None
    last_seen: str | None = None


@dataclass
class CommunicationEntry:
    date: str                # ISO-Datum (YYYY-MM-DD)
    direction: str           # "in" oder "out" oder "unknown"
    subject_hash: str        # sha256 des first-40-chars des Subjects
    subject_keyword: str     # Top-Match aus SUBJECT_KEYWORDS (oder "other")
    from_domain: str
    to_domain: str


# ── Helpers ───────────────────────────────────────────────────────────────────
def sha256_hex(text: str, n: int = 16) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()[:n]


def find_closing_phrase_position(body: str) -> int:
    """Finde letzte Closing-Phrase-Position im Body. -1 falls keine."""
    lower = body.lower()
    last_pos = -1
    for phrase in CLOSING_PHRASES:
        pos = lower.rfind(phrase)
        if pos > last_pos:
            last_pos = pos
    # Fallback auf Abbrev (auf eigener Zeile)
    if last_pos == -1:
        lines = body.split("\n")
        for i, line in enumerate(lines):
            stripped = line.strip().lower().rstrip(",.")
            if stripped in CLOSING_ABBR:
                last_pos = sum(len(l) + 1 for l in lines[:i])
                break
    return last_pos


def extract_signature_block(body: str) -> str | None:
    """Block nach letzter Closing-Phrase. Rückgabe: ~15 Zeilen oder None."""
    pos = find_closing_phrase_position(body)
    if pos == -1:
        return None
    after = body[pos:]
    # Nehme maximal 15 Zeilen
    lines = after.split("\n")[:15]
    return "\n".join(lines)


def looks_like_person_name(line: str) -> bool:
    if any(c.isdigit() for c in line):
        return False
    line_stripped = line.strip().rstrip(",.")
    if len(line_stripped) < 4 or len(line_stripped) > 40:
        return False
    if "@" in line_stripped:
        return False
    words = line_stripped.split()
    if not (2 <= len(words) <= 4):
        return False
    # Jedes Wort mit Großbuchstaben beginnen
    if not all(w and w[0].isupper() for w in words):
        return False
    # Keine Rollen-Tokens (dann ist es eine Role-Zeile)
    if any(w.rstrip(",.") in ROLE_TOKENS for w in words):
        return False
    # Keine Firmen-Suffixe
    if any(suf in line_stripped.lower() for suf in ["e.v.", "gmbh", "ggmbh", "kg ", " kg,"]):
        return False
    return bool(NAME_RE.match(line_stripped))


def looks_like_role_line(line: str) -> bool:
    """Linie enthält einen Rollen-Token."""
    stripped = line.strip().rstrip(",.")
    words = re.split(r"[\s,/-]+", stripped)
    return any(w in ROLE_TOKENS for w in words)


def extract_buero_hint(line: str) -> str | None:
    lower = line.lower()
    for marker, code in BUERO_MARKERS.items():
        if marker in lower:
            return code
    return None


def parse_signature_block(sig_block: str) -> SignatureRecord:
    """Zeilenweise: versuche Name, Rolle, Tel, Email, Büro zu identifizieren."""
    record = SignatureRecord()
    raw_lines = [l.strip() for l in sig_block.split("\n") if l.strip()]
    record.raw_lines = raw_lines[:12]

    # Skip erste Zeile (= Closing-Phrase selbst)
    for line in raw_lines[1:10]:
        # Phone
        phone_match = PHONE_RE.search(line)
        if phone_match and not record.phone:
            # Bereinige Whitespace + prüfe dass es wirklich wie Telefon aussieht
            phone = re.sub(r"\s+", " ", phone_match.group(0)).strip()
            # Mindestens 7 Ziffern (sonst zu kurz)
            digits = sum(c.isdigit() for c in phone)
            if digits >= 7:
                record.phone = phone
        # Email @adberlin.org
        email_match = EMAIL_RE.search(line)
        if email_match and "@adberlin" in email_match.group(0).lower() and not record.email:
            record.email = email_match.group(0).lower()
        # Büro-Hint
        bh = extract_buero_hint(line)
        if bh and not record.buero_hint:
            record.buero_hint = bh
        # Rolle
        if looks_like_role_line(line) and not record.role:
            # Aber nicht wenn Line zu lang ist (vielleicht Fließtext)
            if len(line) < 80:
                record.role = line.strip().rstrip(",.").strip()
        # Name (nur wenn nicht schon gefunden, und Zeile nicht schon als andere Kategorie genommen wurde)
        elif looks_like_person_name(line) and not record.name:
            record.name = line.strip().rstrip(",.").strip()

    return record


def parse_year_month_day(date_header: str) -> tuple[str | None, str | None]:
    """Returns (year, YYYY-MM-DD) from RFC-2822-Date-Header."""
    if not date_header:
        return None, None
    try:
        dt = parsedate_to_datetime(date_header)
        return str(dt.year), dt.strftime("%Y-%m-%d")
    except Exception:
        m = re.search(r"\b(19|20)(\d{2})\b", date_header)
        if m:
            return m.group(0), None
        return None, None


SUBJECT_KEYWORDS = {
    "einsatz", "schicht", "vertrag", "einarbeitung", "basisqualifizierung",
    "fortbildung", "rufbereitschaft", "dienstplan", "lohn", "abrechnung",
    "urlaub", "krankheit", "kündigung", "bewerbung", "einladung",
    "betriebsrat", "betriebsversammlung", "tarif", "vorstand", "versammlung",
    "beatmung", "pflege", "qualität", "beschwerde", "petition",
}


def top_subject_keyword(subject: str) -> str:
    lower = subject.lower()
    for kw in SUBJECT_KEYWORDS:
        if kw in lower:
            return kw
    return "other"


def extract_asn_kuerzel(text: str) -> list[str]:
    """Findet Client-Kürzel (2+2 CamelCase). Gefiltert gegen bekannte False-Positives."""
    candidates = ASN_KUERZEL_RE.findall(text)
    # Filter: bekannte Nicht-ASN-Wörter ausschließen
    excluded = {
        # Wochentags-Kombinationen
        "MoDi", "DiMi", "MiDo", "DoFr", "FrSa", "SaSo", "SoMo",
        # Bekannte Labels
        "ReFe", "VoAb", "NaMi",
    }
    return [k for k in candidates if k not in excluded]


def parse_eml(path: Path) -> tuple[dict, str] | None:
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
    body = ""
    if msg.is_multipart():
        for part in msg.walk():
            if part.get_content_type() == "text/plain":
                try:
                    body = part.get_content()
                    break
                except Exception:
                    pass
        if not body:
            for part in msg.walk():
                if part.get_content_type() == "text/html":
                    try:
                        html = part.get_content()
                        body = re.sub(r"<[^>]+>", " ", html)
                        break
                    except Exception:
                        pass
    else:
        try:
            body = msg.get_content()
        except Exception:
            body = ""
    return headers, body or ""


def extract_domain(email_field: str) -> str | None:
    m = EMAIL_RE.search(email_field)
    return m.group(0).split("@")[1].lower() if m else None


# ── Main Orchestration ────────────────────────────────────────────────────────
@dataclass
class AnalysisResult:
    persons: dict[str, PersonRecord] = field(default_factory=dict)
    asns: dict[str, ASNRecord] = field(default_factory=dict)
    comm_log_per_person: dict[str, list[CommunicationEntry]] = field(default_factory=lambda: defaultdict(list))
    stats: dict = field(default_factory=dict)


def direction_from_path(p: Path) -> str:
    """Liest Richtung aus Pfad-Bestandteilen (aus/ein) — überschreibt Domain-Heuristik.

    Paul's Ordner-Konvention: Mail/aus/ = gesendete, Mail/ein/ = empfangene.
    Mail/ein / (mit Trailing-Space) wird auch erkannt.
    """
    for part in p.parts:
        normalized = part.strip().lower()
        if normalized == "aus":
            return "out"
        if normalized == "ein":
            return "in"
    return ""


def analyze(input_dir: Path) -> AnalysisResult:
    result = AnalysisResult()
    # Rekursiv — alle *.eml in input_dir und Unterordnern
    eml_files = sorted(input_dir.rglob("*.eml"))
    if not eml_files:
        raise FileNotFoundError(f"Keine *.eml-Dateien in {input_dir}")

    stats = {
        "total_emails": len(eml_files),
        "emails_with_signature_found": 0,
        "emails_with_parsed_name": 0,
        "emails_unparseable": 0,
        "emails_by_year": Counter(),
        "asn_occurrences": 0,
    }

    for eml_path in eml_files:
        parsed = parse_eml(eml_path)
        if not parsed:
            stats["emails_unparseable"] += 1
            continue
        headers, body = parsed

        year, date_iso = parse_year_month_day(headers["date"])
        if year:
            stats["emails_by_year"][year] += 1

        from_domain = extract_domain(headers["from"]) or ""
        to_domain = extract_domain(headers["to"]) or ""
        # Richtung: bevorzugt aus Ordner-Path (aus/ein), Fallback auf Domain-Heuristik
        path_dir = direction_from_path(eml_path)
        if path_dir:
            direction = path_dir
        else:
            direction = "in" if "adberlin" in from_domain else ("out" if "adberlin" in to_domain else "unknown")

        subject = headers["subject"]
        subj_hash = sha256_hex(subject[:40])
        subj_kw = top_subject_keyword(subject)

        # ── Signature-Parse ───────────────────────────────────────────────
        sig_block = extract_signature_block(body)
        sig_record: SignatureRecord | None = None
        if sig_block:
            stats["emails_with_signature_found"] += 1
            sig_record = parse_signature_block(sig_block)
            if sig_record.name:
                stats["emails_with_parsed_name"] += 1
                # Aggregate PersonRecord
                key = sig_record.name
                if key not in result.persons:
                    result.persons[key] = PersonRecord(
                        name=key,
                        first_seen=date_iso,
                        last_seen=date_iso,
                        sample_closing_line=sig_record.raw_lines[0] if sig_record.raw_lines else None,
                    )
                p = result.persons[key]
                p.occurrences += 1
                if sig_record.role and sig_record.role not in p.role_guesses:
                    p.role_guesses.append(sig_record.role)
                if sig_record.phone and sig_record.phone not in p.phone_candidates:
                    p.phone_candidates.append(sig_record.phone)
                if sig_record.email and sig_record.email not in p.email_candidates:
                    p.email_candidates.append(sig_record.email)
                if sig_record.buero_hint and sig_record.buero_hint not in p.buero_guesses:
                    p.buero_guesses.append(sig_record.buero_hint)
                if date_iso:
                    if not p.first_seen or date_iso < p.first_seen:
                        p.first_seen = date_iso
                    if not p.last_seen or date_iso > p.last_seen:
                        p.last_seen = date_iso
                # Kommunikations-Log
                result.comm_log_per_person[key].append(CommunicationEntry(
                    date=date_iso or "",
                    direction=direction,
                    subject_hash=subj_hash,
                    subject_keyword=subj_kw,
                    from_domain=from_domain,
                    to_domain=to_domain,
                ))
                # Erweiterte Per-Person-Stats
                if direction == "in":
                    p.in_count += 1
                elif direction == "out":
                    p.out_count += 1

        # ── ASN-Kürzel ────────────────────────────────────────────────────
        # Suche Kürzel sowohl im Subject als auch im Body (begrenzt)
        kuerzel_candidates = extract_asn_kuerzel(subject)
        # Body nur in den ersten 800 Chars scannen — Signaturen am Ende könnten
        # zu False-Positives führen (Nachnamen, Adressen mit CamelCase-Teilen)
        kuerzel_candidates += extract_asn_kuerzel(body[:800])
        unique_kuerzel_this_email = set(kuerzel_candidates)
        signer_name = sig_record.name if sig_record and sig_record.name else None
        for k in unique_kuerzel_this_email:
            if k not in result.asns:
                result.asns[k] = ASNRecord(
                    kuerzel=k,
                    first_seen=date_iso,
                    last_seen=date_iso,
                )
            a = result.asns[k]
            a.occurrences += 1
            a.contexts_count += 1
            if sig_record and sig_record.buero_hint and sig_record.buero_hint not in a.associated_bueros:
                a.associated_bueros.append(sig_record.buero_hint)
            # ASN ↔ Person Association: wenn Email-Signer bekannt + Kürzel im Body/Subject
            if signer_name:
                # associated_persons ist list[tuple(name, count)], wir nutzen dict-Aggregation
                # und serialisieren am Ende
                if not hasattr(a, "_person_counter"):
                    a._person_counter = Counter()  # type: ignore[attr-defined]
                a._person_counter[signer_name] += 1  # type: ignore[attr-defined]
            if date_iso:
                if not a.first_seen or date_iso < a.first_seen:
                    a.first_seen = date_iso
                if not a.last_seen or date_iso > a.last_seen:
                    a.last_seen = date_iso
            stats["asn_occurrences"] += 1

    # Post-Processing: top_keywords + co_mentioned_with pro Person
    # Sammle Keywords + Co-Mentions pro Person aus comm_log
    for person_name, entries in result.comm_log_per_person.items():
        if person_name not in result.persons:
            continue
        kw_counter: Counter[str] = Counter()
        for e in entries:
            if e.subject_keyword != "other":
                kw_counter[e.subject_keyword] += 1
        result.persons[person_name].top_keywords = kw_counter.most_common(5)

    # Co-Mentions: wenn zwei Personen im selben Subject_hash auftauchen (same thread)
    # → Subject_hash-basierte Gruppierung
    thread_to_persons: dict[str, list[str]] = defaultdict(list)
    for person_name, entries in result.comm_log_per_person.items():
        for e in entries:
            key = f"{e.date}::{e.subject_hash}"
            thread_to_persons[key].append(person_name)
    co_mention_counter: dict[str, Counter[str]] = defaultdict(Counter)
    for _thread_id, people in thread_to_persons.items():
        unique = list(set(people))
        for i, person_a in enumerate(unique):
            for person_b in unique[i+1:]:
                co_mention_counter[person_a][person_b] += 1
                co_mention_counter[person_b][person_a] += 1
    for person_name, counter in co_mention_counter.items():
        if person_name in result.persons:
            result.persons[person_name].co_mentioned_with = counter.most_common(5)

    # Serialize ASN._person_counter to ASNRecord.associated_persons
    for a in result.asns.values():
        counter = getattr(a, "_person_counter", None)
        if counter:
            a.associated_persons = counter.most_common(5)
            # Entferne das private Attribut vor Serialisierung
            delattr(a, "_person_counter")

    # stats: emails_by_year als Dict
    stats["emails_by_year"] = dict(sorted(stats["emails_by_year"].items()))
    result.stats = stats
    return result


# ── Output-Writer ─────────────────────────────────────────────────────────────
def assert_private_path(path: Path) -> None:
    resolved = str(path.resolve())
    allowed = [
        "organigramm/raw/",
        "/Desktop/ADBerlin/",
    ]
    if not any(allowed_prefix in resolved for allowed_prefix in allowed):
        raise SystemExit(
            f"Private-Output muss in organigramm/raw/ oder ~/Desktop/ADBerlin/ liegen. "
            f"Gegeben: {resolved}"
        )


def write_persons(result: AnalysisResult, path: Path) -> None:
    assert_private_path(path)
    persons_sorted = sorted(result.persons.values(), key=lambda p: -p.occurrences)
    data = {
        "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "count": len(persons_sorted),
        "persons": [asdict(p) for p in persons_sorted],
    }
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")


def write_asns(result: AnalysisResult, path: Path) -> None:
    assert_private_path(path)
    asns_sorted = sorted(result.asns.values(), key=lambda a: -a.occurrences)
    data = {
        "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "count": len(asns_sorted),
        "asns": [asdict(a) for a in asns_sorted],
    }
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")


def write_comm_log(result: AnalysisResult, path: Path) -> None:
    assert_private_path(path)
    data = {
        "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "persons_count": len(result.comm_log_per_person),
        "total_entries": sum(len(v) for v in result.comm_log_per_person.values()),
        "per_person": {
            name: [asdict(e) for e in sorted(entries, key=lambda x: x.date or "")]
            for name, entries in result.comm_log_per_person.items()
        },
    }
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")


def write_public_report(result: AnalysisResult, path: Path) -> None:
    """Public-safe Report — nur Zahlen."""
    stats = result.stats
    data = {
        "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "total_emails": stats.get("total_emails", 0),
        "emails_with_signature_found": stats.get("emails_with_signature_found", 0),
        "emails_with_parsed_name": stats.get("emails_with_parsed_name", 0),
        "distinct_persons_identified": len(result.persons),
        "distinct_asn_kuerzel_identified": len(result.asns),
        "total_asn_occurrences": stats.get("asn_occurrences", 0),
        "emails_by_year": stats.get("emails_by_year", {}),
        "persons_with_known_role": sum(1 for p in result.persons.values() if p.role_guesses),
        "persons_with_known_phone": sum(1 for p in result.persons.values() if p.phone_candidates),
        "persons_with_known_buero": sum(1 for p in result.persons.values() if p.buero_guesses),
        "unparseable_emails": stats.get("emails_unparseable", 0),
    }
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")


def _cli() -> None:
    p = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    p.add_argument("--input", required=True, type=Path, help="Verzeichnis mit *.eml-Dateien")
    p.add_argument("--persons-out", required=True, type=Path, help="Private JSON für Personen (muss in organigramm/raw/ oder ~/Desktop/ADBerlin/)")
    p.add_argument("--asns-out", required=True, type=Path, help="Private JSON für ASN-Kürzel")
    p.add_argument("--comm-log-out", required=True, type=Path, help="Private JSON für Kommunikations-Log")
    p.add_argument("--public-out", required=True, type=Path, help="Public-Aggregate JSON (darf ins Repo)")
    args = p.parse_args()

    result = analyze(args.input)
    write_persons(result, args.persons_out)
    write_asns(result, args.asns_out)
    write_comm_log(result, args.comm_log_out)
    write_public_report(result, args.public_out)

    s = result.stats
    print(f"OK — {s['total_emails']} Emails, {s['emails_with_signature_found']} mit Signature-Block, "
          f"{len(result.persons)} Personen, {len(result.asns)} ASN-Kürzel.")
    print(f"  persons:    {args.persons_out}")
    print(f"  asns:       {args.asns_out}")
    print(f"  comm-log:   {args.comm_log_out}")
    print(f"  public:     {args.public_out}")


if __name__ == "__main__":
    _cli()
