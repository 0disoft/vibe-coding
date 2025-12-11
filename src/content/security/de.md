# Sicherheitsrichtlinie

> Letzte Aktualisierung: {{LAST_UPDATED}}

## Datenschutztechnologien & Prinzipien

Benutzerdaten werden sicher verarbeitet und mit Schutzmaßnahmen auf mehreren Ebenen versehen, einschließlich Verschlüsselung im Ruhezustand und TLS bei der Übertragung.

### Passwortschutz

**Benutzerpasswörter werden niemals im Klartext gespeichert und unter Verwendung neuester Hashing-Technologien geschützt.**

- **Algorithmus**: {{ENC_ALGO_PASSWORD}}
- **Grund**: {{ENC_REASON_PASSWORD}}
- Für jedes Passwort wird ein eindeutiges Salt verwendet, um Rainbow-Table-Angriffe zu verhindern.

### Datenverschlüsselung

**Sensible Informationen werden unmittelbar vor der Speicherung verschlüsselt, wobei das Schlüsselmanagement streng getrennt ist.**

- **Algorithmus**: {{ENC_ALGO_DATA}}
- **Grund**: {{ENC_REASON_DATA}}
- **Schlüsselableitung**: {{ENC_ALGO_KDF}} - {{ENC_REASON_KDF}}
- Wir verwenden Envelope Encryption, um Datenverschlüsselungsschlüssel (DEK) mit separaten Schlüsselverschlüsselungsschlüsseln (KEK) zu schützen.

### Datenintegrität

**Hochleistungs-Hash-Funktionen werden verwendet, um sicherzustellen, dass kritische Systemdaten nicht manipuliert wurden.**

- **Algorithmus**: {{ENC_ALGO_INTEGRITY}}
- **Grund**: {{ENC_REASON_INTEGRITY}}

### Transportsicherheit

**Die gesamte Kommunikation zwischen Benutzern und Servern ist durch einen verschlüsselten Tunnel unter Verwendung der neuesten Sicherheitsprotokolle geschützt.**

- **Protokoll**: {{ENC_ALGO_TRANSPORT}}
- **Grund**: {{ENC_REASON_TRANSPORT}}
- HTTPS wird für die gesamte Kommunikation erzwungen, und HSTS wird angewendet, um Downgrade-Angriffe strikt zu verhindern.

## Administrative & Physische Sicherheit

Über technische Maßnahmen hinaus verwalten wir die Sicherheit in Bezug auf Personen und Prozesse gründlich.

- **Mitarbeiterzugriffskontrolle**: Der Datenzugriff wird nur wesentlichem Personal auf der Grundlage des "Prinzips der geringsten Rechte" gewährt. Der gesamte Zugriffsverlauf wird protokolliert und geprüft. Zugriff ohne berechtigten Grund ist strengstens untersagt.
- **Physische Sicherheit**: Die gesamte Cloud-Infrastruktur von Drittanbietern wird in Rechenzentren betrieben, die physische Sicherheitszertifizierungen wie ISO 27001 erhalten haben.

## Konto- & Sitzungssicherheit

- **Login-Schutz**: Wir wenden Anmeldeversuchsbegrenzungen und Verzögerungsmechanismen an, um automatisierte Brute-Force-Angriffe zu blockieren.
- **Sitzungsmanagement**: Sitzungen laufen nach einer Zeit der Inaktivität automatisch ab, und bei wichtigen Kontoänderungen werden Benachrichtigungen gesendet.
- **Zwei-Faktor-Authentifizierung**: Wir planen, in Zukunft die 2FA-Funktionalität einzuführen.

## Anwendungssicherheit

Wir entwerfen von der Entwicklungsphase an unter Berücksichtigung von Sicherheits-Best-Practices wie OWASP Top 10.

- **Eingabevalidierung**: Prepared Statements und ORMs werden für Datenbankabfragen verwendet, und Benutzereingaben werden sowohl auf Server- als auch auf Clientseite validiert.
- **Angriffsabwehr**: CSRF-Token, SameSite-Cookie-Attribute und CSP (Content Security Policy) werden angewendet, um Session-Hijacking- und Skript-Injektionsangriffe zu mindern.

## Sicherheit der Software-Lieferkette

- **Abhängigkeitsmanagement**: Externe Bibliotheken und Pakete werden nur aus offiziellen Registern installiert, und verifizierte Versionen werden durch Lock-Dateien sichergestellt.
- **Schwachstellenprüfungen**: Schwachstellenberichte werden regelmäßig überprüft, und Abhängigkeiten mit hohem Risiko werden bei Updates priorisiert.

## Datenaufbewahrung & -löschung

- **Kontolöschung**: Nach Anforderung einer Kontolöschung werden die zugehörigen Daten nach einer 30-tägigen Karenzzeit (für die Wiederherstellung bei versehentlicher Löschung) dauerhaft vernichtet.
- **Backup-Daten**: Backups für die Systemstabilität werden maximal 90 Tage aufbewahrt und dann sicher gelöscht. Aufgrund technischer Einschränkungen kann die vollständige Löschung aus Backup-Systemen zusätzliche Zeit erfordern.
- **Protokolldaten**: Zugriffsprotokolle werden 1 Jahr lang zur langfristigen Analyse von Sicherheitsbedrohungen und zur Erkennung von Trends aufbewahrt.
- **Ausnahme für gesetzliche Aufbewahrung**: Daten, die gesetzlich für einen bestimmten Zeitraum aufbewahrt werden müssen, können für die geltende Dauer separat gespeichert werden.

## Vorfallreaktion

Im Falle eines Sicherheitsvorfalls befolgen wir diese Verfahren für eine schnelle Reaktion und Schadensminimierung:

1. **Erkennung & Eindämmung (Sofort)**: Bedrohungen isolieren und weiteren Schaden verhindern.
2. **Auswirkungsanalyse**: Umfang und Schweregrad so schnell wie möglich bewerten, typischerweise innerhalb von Stunden.
3. **Benutzerbenachrichtigung**: Bei Vorfällen, die Benutzer betreffen (z. B. Datenlecks), Benutzer so schnell wie möglich benachrichtigen und gesetzliche Fristen (z. B. 72 Stunden) einhalten.
4. **Transparente Offenlegung**: Einen detaillierten Bericht (Ursache, Maßnahmen, vorbeugende Maßnahmen) veröffentlichen, nachdem der Vorfall gelöst ist.

## Sicherheitsaudits & Dienste von Drittanbietern

- **Sicherheitsaudits**: Wir befinden uns derzeit in der Service-Stabilisierungsphase und führen regelmäßige interne Code-Reviews und Sicherheitsüberprüfungen durch. Wir planen, regelmäßige Sicherheitsaudits durch Dritte einzuführen, wenn der Service wächst.
- **Infrastruktur von Drittanbietern**: Wir halten uns an den Grundsatz, unverschlüsselte sensible Informationen nicht direkt zu speichern. Für Kernfunktionen wie Zahlungen und Authentifizierung nutzen wir vertrauenswürdige Dienste ({{THIRD_PARTY_PROVIDERS}} usw.), die international anerkannte Sicherheitszertifizierungen (SOC 2, ISO 27001) erhalten haben oder sich regelmäßig gleichwertigen Sicherheitsbewertungen unterziehen.

## Sicherheitsempfehlungen für Benutzer

Kontosicherheit ist eine gemeinsame Verantwortung.

- **Starke Passwörter**: Verwenden Sie einzigartige und komplexe Passwörter, die nicht auf anderen Websites verwendet werden.
- **Vorsicht vor Phishing**: Seien Sie vorsichtig bei Nachrichten, die behaupten, offizielle E-Mails zu sein, und überprüfen Sie die Adresse, bevor Sie auf Links klicken.

## Kontakt

Wenn Sie Fragen zu unserer Sicherheitsrichtlinie haben, kontaktieren Sie uns bitte unter [{{EMAIL}}](mailto:{{EMAIL}}).

Für Schwachstellenberichte und Richtlinien zum Schutz von Forschern besuchen Sie bitte unsere Seite [Bug Bounty Programm](/de/bug-bounty).
