# Register-Research — Runde 1

Datum: 2026-04-22 · Referenz: [Sub-Projekt D](../../.claude/plans/plan-mode-cuddly-feather.md) · OSINT-Zonen: grün (aus [OSINT-PLAN.md](../OSINT-PLAN.md))

## Scope

Erste strukturierte Recherche in den öffentlichen Registern und publikumsöffentlichen Seiten, die im OSINT-PLAN als grüne Zone markiert sind. Ziel: offene `TODO`s aus [HANDOFF.md](../HANDOFF.md) wo möglich schließen.

## Ergebnisse — was belegt wurde

### ✅ Neue Lebenswege GmbH — vollständig identifiziert

Bisher mit `verify: "inferred"` als „verbundenes Unternehmen" notiert, jetzt konkret gefasst:

| Feld | Wert | Quelle |
|---|---|---|
| Rechtsform | Gesellschaft mit beschränkter Haftung (gGmbH) | S49, S50 |
| Register-Nr. | **HRB 145571 B** | S49 |
| Registergericht | Amtsgericht Charlottenburg (Berlin) | S49, S50 |
| Sitz | **Kurfürstenstraße 75, 10787 Berlin** (nicht Wilhelm-Kabus-Str. wie ad e.V.) | S49 |
| Zweck (laut HR) | Integration behinderter Menschen, Wohlfahrt, Bildung, Jugend-/Altenpflege | S49 |
| Leitung | 2 Manager: 1 Prokurist, 1 Geschäftsführer*in (Namen im Auszug) | S49, S50 |

**Commit:** `NLW`-Knoten in [data.ts](../../organigramm-vercel/lib/data.ts) von `verify: "inferred"` auf `"verified"` angehoben, Role-Text + Description angereichert, `address`-Feld ergänzt, Sources S49 + S50 verknüpft.

**Wichtige Beobachtung:** Im NLW-Handelsregister-Auszug ist ad e.V. **nicht als Gesellschafter** gelistet. Die gesellschaftsrechtliche Verflechtung zwischen ad und NLW bleibt damit im Handelsregister unsichtbar — ihr gemeinsamer Bezugspunkt ist lediglich der gemeinsame Haustarifvertrag mit ver.di (siehe S16, S17). Das ändert die Natur dieser „Verbindung" in der Org-Analyse: **es ist keine Konzernstruktur, sondern eine Tarif-Parallelität**. Implication für RACI: NLW hat keine formale Accountable-Rolle gegenüber ad-Prozessen.

### ✅ LinkedIn-Unternehmensseite (gelbe Zone, manuell gesichtet)

Aus der öffentlichen About-Sektion (ohne Login):

| Feld | Wert | Status |
|---|---|---|
| Gründungsjahr | **1981** | bestätigt (stimmt mit ad-Seite überein) |
| Größe | **501–1.000 Mitarbeiter*innen** | bestätigt Größenordnung „~700" aus data.ts |
| HQ-Adresse | Wilhelm-Kabus-Straße 21-35, **Eingang II**, 10829 Berlin | kleine Präzisierung ("Eingang II" statt "Eingang 2") |
| Industry-Tag | Personal care services | — |
| Specialties | Persönliche Assistenz, Selbstbestimmtes Leben, Menschen mit Behinderung, Inklusion, Soziale Dienste | — |

Kein neuer Code-Change nötig — bestehende data.ts passt.

### ✅ adberlin.com/neu/der-verein-ambulante-dienste-e-v (Primärquelle)

Re-verifiziert: Vorstand öffentlich explizit genannt als Ursula Aurien, Dennis Jeromin, Michael Sühnel. Satzungstext zitiert: „Bei den dort durchgeführten Abstimmungen kann keine Entscheidung gegen die Mehrheit der Mitglieder mit Assistenzbedarf getroffen werden." Mitgliederzahl „knapp 100". **Kein Gründungsdatum, keine Geschäftsführungs-Nennung auf dieser Seite** — die Zuschreibung von Uta Wehde zur GF stützt sich weiterhin nur auf S16 (HTV-Unterzeichnung 2020); für einen aktuellen Stand 2026 braucht's eine Zweitbestätigung.

### ✅ adberlin.com/neu/assistenzdienst/einsatzstelle

Re-verifiziert: die Seite listet **ausschließlich Funktionsbezeichnungen**, keine Namen. Kleine Terminologie-Unterschiede zur aktuellen data.ts:

- Seite nutzt **„Justitiar\*in"** statt „Rechtsberatung" — data.ts könnte angepasst werden
- Seite nutzt **„Personal- und Finanzverwaltung"** als Sammelbegriff; data.ts trennt `PA` (Personalabteilung) + `FB` (Finanzbuchhaltung) → das ist Analyse-Präzision, keine Korrektur-Pflicht
- Kontakt zentral: sekretariat@adberlin.org, 030/69 59 75 -410

Keine Knoten-Änderung hier nötig; Observation für spätere Verfeinerung.

## Was verworfen wurde

- **Hilfelotse-Berlin-Detail-URL** (S18): Aktuell HTTP 404. Der Eintrag scheint entweder verschoben oder neu gebaut. Ich habe die URL nicht rausgenommen — Paul sollte einmal nachschauen, ob die S18 aktualisiert werden muss. Kein Blocker.
- **Paritätischer-Berlin-Mitgliederliste** (S20): Liste ist paginiert (9 Seiten alphabetisch). „ambulante dienste" ist auf Seite 1 nicht sichtbar; müsste über Seite-A oder Suchfeld geholt werden. Nicht automatisiert — manueller Schritt.

## Offene Punkte für Paul

### Hoch-Prio

1. **VR-Nummer ad e.V.** — im Vereinsregister Charlottenburg abfragen, dann in [OSINT-PLAN.md](../OSINT-PLAN.md) G1 eintragen. Zugang: <https://www.berlin.de/gerichte/amtsgericht-charlottenburg/das-gericht/zustaendigkeiten/registergericht/online-registerauskunft/>
2. **Aktuelle Vorstands-Besetzung** — satzungsmäßig sind 3–5 Mitglieder erlaubt. Sind Aurien/Jeromin/Sühnel 2026 noch aktiv? Gibt es Nachwahlen? VR-Auszug gibt Aufschluss.
3. **Geschäftsführung 2026** — Uta Wehde stammt aus dem 2020-HTV-Unterzeichnungs-Text (S16). Ob sie noch aktiv ist: Check ad-Impressum (S3) direkt.

### Mittel-Prio

4. **Hilfelotse-Link reparieren** — neue URL für S18 finden oder Eintrag als „archive" markieren.
5. **Paritätischer-Eintrag** — Seite-A der Mitgliederliste prüfen, ob ad e.V. gelistet ist, und Mitgliedsstatus notieren.
6. **TopQM-Stammdaten** (S19) — Re-Check auf Zertifizierungsstatus 2026 (läuft alle paar Jahre aus und muss erneuert werden).

### Niedrig-Prio / optional

7. **Namen der Vorstandsmitglieder NLW** — stehen im NLW-Handelsregister-Auszug (kostenpflichtig beim AG Charlottenburg; ohne Zahlung nur HRB-Nummer öffentlich). Ob das Geld wert ist, entscheidet sich nach ad-Fokus: für ein ad-Organigramm nicht kritisch.
8. **„Bündnis aktiver Ambulanter Dienste" (bad-ad.de)** — weiterhin aus Sandbox nicht DNS-auflösbar. Paul kann manuell prüfen ob diese Seite noch existiert und was sie ist.

## Änderungen in diesem Runden-Commit

- [organigramm-vercel/lib/sources.ts](../../organigramm-vercel/lib/sources.ts): +S49 (Handelsregister-Online NLW), +S50 (NorthData NLW), +S51 (Gemeinsames Registerportal) — alle `kind: "osint-register"`.
- [organigramm-vercel/lib/data.ts](../../organigramm-vercel/lib/data.ts): `NLW`-Knoten von `inferred` → `verified`, Role-Text gibt HRB-Nummer + Registergericht, Description erklärt Struktur + Warnung zur Nicht-Gesellschafter-Beziehung, Address-Feld ergänzt.
- [organigramm/proposals/2026-04-22-register-research.md](./2026-04-22-register-research.md): dieses Dokument.

Keine Änderung an verify-Status anderer Knoten — die Research-Runde hat nichts erschüttert, nur NLW präzisiert.
