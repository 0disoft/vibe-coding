# Bug-Bounty-Programm

> Letzte Aktualisierung: {{LAST_UPDATED}}

## Einführung

Bei {{SITE_NAME}} arbeiten wir mit Sicherheitsforschern zusammen, um eine sicherere Internetumgebung zu schaffen. Wenn Sie eine Sicherheitslücke in unserem Dienst gefunden haben, kontaktieren Sie uns bitte umgehend.

Dieses Programm wird derzeit als **Kanal zur Offenlegung von Schwachstellen (Vulnerability Disclosure Channel)** betrieben, der sich auf verantwortungsvolle Meldung und Zusammenarbeit statt auf finanzielle Belohnungen konzentriert. Wir schätzen und kooperieren transparent mit Forschern, die Schwachstellen ethisch offenlegen.

## Geltungsbereich (In-Scope)

Forscher dürfen nur die folgenden Domains und Dienste testen:

- Offizielle Website von {{SITE_NAME}} und ihre Subdomains
- Offizielle mobile Anwendungen von {{SITE_NAME}} (falls verfügbar)
- API-Endpunkte, die direkt von {{SITE_NAME}} betrieben werden

Domains und Dienste von Drittanbietern (Zahlungsgateways, Analysetools, Hosting-Provider usw.), die oben nicht aufgeführt sind, sind nicht durch dieses Programm abgedeckt. Wenn Sie sich nicht sicher sind, ob ein Ziel in den Geltungsbereich fällt, kontaktieren Sie uns bitte vor dem Testen.

## Belohnungsrichtlinie

Derzeit bietet das {{SITE_NAME}} Bug-Bounty-Programm keine regulären finanziellen Belohnungen an. Um jedoch unsere Wertschätzung für bedeutende Beiträge zu zeigen, bieten wir Folgendes an:

- **Hall of Fame**: Auflistung der Namen von Forschern, die gültige Schwachstellen gemeldet haben (wenn betriebsbereit).
- **Öffentliche Anerkennung**: Bereitstellung einer öffentlichen Anerkennung oder eines Empfehlungsschreibens mit Zustimmung des Forschers.
- **Zukünftige Priorität**: Bereitstellung von vorrangigen Teilnahmemöglichkeiten, falls wir in Zukunft zu einem bezahlten Programm übergehen.

Wir können in Zukunft je nach Budget und Serviceumfang ein monetäres Kopfgeld-System (Bounty) einführen und werden dies auf dieser Seite bekannt geben, falls dies umgesetzt wird.

## Schweregrad-Kriterien

| Schweregrad | CVSS | Beispiele |
|---|---|---|
| Critical | 9.0-10.0 | Remote Code Execution (RCE), vollständiges DB-Leck, massive Kontoübernahme |
| High | 7.0-8.9 | SQL-Injection, Stored XSS, Authentifizierungsumgehung |
| Medium | 4.0-6.9 | Reflected XSS, CSRF bei sensiblen Aktionen, Offenlegung von Informationen |
| Low | 0.1-3.9 | Fehlende Sicherheits-Header, Offenlegung von Versionen |

Der Schweregrad kann je nach tatsächlicher Auswirkung angepasst werden.

## Melden von Schwachstellen

### Meldewege

- **E-Mail**: [{{EMAIL}}](mailto:{{EMAIL}})
- **Betreff**: `[Security Report] Vulnerability Summary` (Zusammenfassung der Schwachstelle)
- **Sprache**: Bitte schreiben Sie auf Koreanisch, Englisch oder Deutsch.

### Berichtsformat

Um uns bei der Analyse und Reproduktion des Problems zu helfen, geben Sie bitte Folgendes an:

1. Art der Schwachstelle und detaillierte Beschreibung.
2. Spezifische Schritte zum Reproduzieren des Problems (einschließlich Skripten oder Befehlszeilen).
3. Betroffene URLs, API-Endpunkte oder Komponenten.
4. Proof-of-Concept (PoC) Code oder Screenshots.

### Qualitätsstandards für Berichte

- Berichte, die nicht reproduziert werden können oder denen ausreichende Details fehlen, werden möglicherweise nicht akzeptiert.
- Berichte über Ausgaben automatisierter Scanner werden nicht akzeptiert.
- **Duplikate**: Doppelte Schwachstellen werden nur dem ersten Melder gutgeschrieben. (Basierend auf dem Zeitstempel des E-Mail-Server-Empfangs)

### Prozess

1. **Empfangsbestätigung**: Wir senden innerhalb von 72 Stunden nach Ihrem Bericht eine Bestätigungs-E-Mail.
2. **Analyse & Planung**: Sobald die Schwachstelle verifiziert ist, bewerten wir ihren Schweregrad und informieren Sie über den voraussichtlichen Zeitplan für die Behebung. Wenn wir die Frist nicht einhalten können, erklären wir den Grund und stellen einen aktualisierten Zeitplan zur Verfügung.
3. **Lösung & Benachrichtigung**: Wir benachrichtigen Sie, sobald der Patch abgeschlossen ist. Die Lösung kann Zeit in Anspruch nehmen, wenn strukturelle Änderungen für die Dienststabilität erforderlich sind.
4. **Offenlegung & Anerkennung**: Nach der Lösung entscheiden wir in Absprache mit dem Forscher über die Offenlegung. Gültige Berichte werden gemäß der oben genannten "Belohnungsrichtlinie" anerkannt.
5. **CVE-Ausstellung**: Bei signifikanten Schwachstellen können wir mit Zustimmung des Melders die Ausstellung einer CVE-Nummer beantragen.

### Richtlinie zur öffentlichen Offenlegung (Public Disclosure)

- Wir empfehlen die Offenlegung nach Abschluss des Patches und bitten Sie, die Einzelheiten der Offenlegung im Voraus mit uns zu teilen.
- Wenn innerhalb von **60 Tagen** nach der Meldung keine geeigneten Maßnahmen ergriffen werden, hat der Melder das Recht, Details zur Schwachstelle einvernehmlich offenzulegen. (Wir können jedoch bei komplexen Problemen um eine Zeitplananpassung bitten.)
- In dringenden Fällen, in denen eine aktive Ausnutzung beobachtet wird, können wir uns mit Ihnen für eine frühere Offenlegung abstimmen.

## Testrichtlinien

Bitte beachten Sie die folgenden Richtlinien für sichere Schwachstellentests.

### Erlaubte Aktivitäten

- Testen von Schwachstellen unter Verwendung von Konten, die Sie besitzen, oder von Testkonten, die Sie erstellt haben.
- **Minimale Überprüfung**: Greifen Sie nur auf die minimal erforderlichen Daten zu, um die Schwachstelle zu beweisen. Wenn Sie versehentlich auf sensible Informationen anderer zugreifen, stoppen Sie sofort und nehmen Sie nur maskierte Informationen in Ihren Bericht auf.

### Testumgebung

- **Anfrage für Testkonto**: Wenn Sie ein Testkonto benötigen, können Sie dieses unter [{{EMAIL}}](mailto:{{EMAIL}}) anfordern.
- **Automatisierte Scans**: Leichte Scans sind erlaubt, aber Scans mit hoher Last, die übermäßige Anfragen pro Sekunde generieren oder die Servicequalität beeinträchtigen, erfordern eine vorherige Abstimmung.

### Verbotene Aktivitäten (Außerhalb des Geltungsbereichs)

Die folgenden Aktivitäten sind strengstens untersagt und werden bei Verstößen möglicherweise nicht rechtlich geschützt:

- Durchführen von **übermäßigen automatisierten Scans** (in einem Ausmaß, das eine Dienstbelastung verursacht) ohne vorherige Abstimmung.
- Jede Aktivität, die absichtlich Serverressourcen (CPU, Speicher, Festplatte, Netzwerkbandbreite) erschöpft.
- Zugreifen auf oder Ändern von Konten, Daten oder persönlichen Informationen anderer Benutzer.
- Social Engineering (Phishing usw.) oder physische Sicherheitsangriffe.

### Ausdrücklich außerhalb des Geltungsbereichs (Out-of-Scope)

- Schwachstellen in Diensten oder Infrastrukturen von Drittanbietern.
- Physische Sicherheit, HR-Systeme, interne Netzwerke.
- Bereits öffentliche Schwachstellen oder doppelte Berichte.
- Probleme, die nur durch das Senden von Spam- oder Phishing-E-Mails verursacht werden.

### Schwachstellen mit geringem Risiko (Nicht akzeptiert)

Folgendes ist vom Programm ausgeschlossen, da es ein geringes Sicherheitsrisiko darstellt oder ein beabsichtigtes Verhalten ist:

- CSRF mit geringer Auswirkung wie Logout-CSRF
- Clickjacking auf Seiten ohne sensible Informationen
- Einfache Offenlegung von Versionen (Banner Grabbing)
- Fehlende Sicherheitseinstellungen ohne nachgewiesenen Ausnutzungspfad (z. B. fehlende Sicherheits-Header ohne direkte Auswirkung, nicht konfigurierte E-Mail-Versandrichtlinien usw.)
- Browser-Autovervollständigung aktiviert

Selbst die oben genannten Punkte können jedoch bewertet werden, wenn sie mit anderen Schwachstellen verkettet sind, um ein tatsächliches Angriffsszenario zu beweisen.

### Schutz der Forscher (Safe Harbor)

Wenn Sie Schwachstellen in gutem Glauben und in Übereinstimmung mit dieser Richtlinie untersuchen und melden, versprechen wir **im gesetzlich zulässigen Rahmen** Folgendes:

1. Wir betrachten Ihre Forschungsaktivitäten als autorisierte Sicherheitsforschung und werden keine zivil- oder strafrechtlichen Schritte gegen Sie einleiten.
2. Wir werden Sie nicht freiwillig bei den Strafverfolgungsbehörden melden oder Anzeige erstatten.
3. Wenn ein Dritter rechtliche Schritte bezüglich Ihrer Forschungsaktivitäten einleitet, werden wir im angemessenen Rahmen Unterstützung leisten, z. B. durch Bereitstellung von Dokumenten, die beweisen, dass Sie ein konformer Forscher sind.

Safe Harbor gilt jedoch nicht in folgenden Fällen:

- Eindeutiger Verstoß gegen die in diesem Dokument verbotenen Aktivitäten.
- Unbefugtes Testen von Systemen oder Infrastrukturen von Drittanbietern außerhalb unserer Kontrolle.

## Kontakt

Wenn Sie Fragen zu unserem Bug-Bounty-Programm haben, können Sie uns gerne unter [{{EMAIL}}](mailto:{{EMAIL}}) kontaktieren.
