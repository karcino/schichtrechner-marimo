"""Ingestion-Pipeline für ad e.V. Organisations-Analyse.

Sub-Projekte (aus Plan):
- schichtplaner_aggregate.py — fail-closed Privacy-Filter für Schichtplaner-CSVs (C)
- register_scrape.py         — OSINT-Register-Scraper (D, später)
- fetch_emails_posteo.py     — Posteo IMAP → OB1 private (B, nach Rechts-Check)
- build_proposals.py         — OB1-Queries → Proposal-Markdowns (D, später)

Privacy-Regeln:
- Kein Kund*innen-Datum fließt ins Repo. Schichtplaner-Reader ist fail-closed.
- Email-Inhalte nur in privater OB1-Instanz, Labels generisch.
- Regex-Scans auf IBAN, SV-Nummer, Versichertennummer vor jedem OB1-Push.
"""
