# Bug Bounty-programma

> Laatst bijgewerkt: {{LAST_UPDATED}}

## Inleiding

Bij {{SITE_NAME}} werken we samen met beveiligingsonderzoekers om een veiligere internetomgeving te creëren. Als u een beveiligingskwetsbaarheid in onze service heeft gevonden, neem dan onmiddellijk contact met ons op.

Dit programma werkt momenteel als een **Kanaal voor openbaarmaking van kwetsbaarheden**, gericht op verantwoorde melding en samenwerking in plaats van geldelijke beloningen. We waarderen en werken transparant samen met onderzoekers die kwetsbaarheden ethisch openbaar maken.

## Reikwijdte (In-Scope)

Onderzoekers mogen alleen de volgende domeinen en services testen:

- {{SITE_NAME}} officiële website en subdomeinen
- {{SITE_NAME}} officiële mobiele applicaties (indien beschikbaar)
- API-eindpunten die rechtstreeks door {{SITE_NAME}} worden beheerd

Domeinen en diensten van derden (betalingsgateways, analysetools, hostingproviders, enz.) die hierboven niet worden vermeld, vallen niet onder dit programma. Als u niet zeker weet of een doel binnen de reikwijdte valt, neem dan contact met ons op voordat u gaat testen.

## Beloningsbeleid

Momenteel biedt het {{SITE_NAME}} Bug Bounty-programma geen regelmatige geldelijke beloningen. Om onze waardering voor significante bijdragen te tonen, hanteren we echter het volgende:

- **Hall of Fame**: Vermelding van de namen van onderzoekers die geldige kwetsbaarheden hebben gemeld (indien operationeel).
- **Publieke erkenning**: Het verstrekken van publieke erkenning of een aanbevelingsbrief met toestemming van de onderzoeker.
- **Toekomstige prioriteit**: Mogelijkheid tot prioritaire deelname als we in de toekomst overstappen op een betaald programma.

We kunnen in de toekomst een monetair premiesysteem (Bounty) introduceren, afhankelijk van het budget en de schaal van de dienstverlening. Als dit wordt geïmplementeerd, zullen we dit op deze pagina aankondigen.

## Criteria voor ernst

| Ernst | CVSS | Voorbeelden |
|---|---|---|
| Critical | 9.0-10.0 | Remote code execution (RCE), volledig DB-lek, massale accountovername |
| High | 7.0-8.9 | SQL-injectie, opgeslagen XSS, authenticatie-omzeiling |
| Medium | 4.0-6.9 | Gereflecteerde XSS, gevoelige actie CSRF, openbaarmaking van informatie |
| Low | 0.1-3.9 | Ontbrekende beveiligingsheaders, versie-openbaarmaking |

De ernst kan worden aangepast op basis van de werkelijke impact.

## Kwetsbaarheden melden

### Meldingskanalen

- **E-mail**: [{{EMAIL}}](mailto:{{EMAIL}})
- **Onderwerp**: [Security Report] Vulnerability Summary (Samenvatting van de kwetsbaarheid)
- **Taal**: Schrijf in het Koreaans, Engels of Nederlands.

### Rapportindeling

Om ons te helpen het probleem te analyseren en te reproduceren, verzoeken wij u het volgende op te nemen:

1. Type kwetsbaarheid en gedetailleerde beschrijving.
2. Specifieke stappen om het probleem te reproduceren (inclusief scripts of opdrachtregels).
3. Beïnvloede URL's, API-eindpunten of componenten.
4. Proof of Concept (PoC)-code of screenshots.

### Kwaliteitsnormen voor rapporten

- Rapporten die niet kunnen worden gereproduceerd of onvoldoende details bevatten, worden mogelijk niet geaccepteerd.
- Rapporten van geautomatiseerde scanneroutput worden niet geaccepteerd.
- **Duplicaten**: Dubbele kwetsbaarheden worden alleen toegeschreven aan de eerste melder. (Gebaseerd op tijdstempel ontvangst e-mailserver)

### Proces

1. **Ontvangstbevestiging**: We sturen binnen 72 uur na uw melding een bevestigingsmail.
2. **Analyse & Planning**: Zodra de kwetsbaarheid is geverifieerd, beoordelen we de ernst ervan en informeren we u over de geschatte tijdlijn voor de oplossing. Als we de deadline niet kunnen halen, leggen we de reden uit en geven we een bijgewerkt schema.
3. **Oplossing & Melding**: We brengen u op de hoogte zodra de patch is voltooid. De oplossing kan tijd kosten als structurele wijzigingen nodig zijn voor de stabiliteit van de dienst.
4. **Openbaarmaking & Erkenning**: Eenmaal opgelost, beslissen we over openbaarmaking in overleg met de onderzoeker. Geldige rapporten worden erkend in overeenstemming met het bovenstaande 'Beloningsbeleid'.
5. **CVE-uitgifte**: Voor aanzienlijke kwetsbaarheden kunnen we met toestemming van de melder verzoeken om uitgifte van een CVE-nummer.

### Beleid voor openbare openbaarmaking (Public Disclosure)

- We raden openbaarmaking aan nadat de patch is voltooid en vragen u de details van de openbaarmaking vooraf met ons te delen.
- Als er binnen **60 dagen** na de melding geen passende actie wordt ondernomen, heeft de melder het recht om details over de kwetsbaarheid openbaar te maken op een wederzijds overeengekomen manier. (We kunnen echter om een aanpassing van de planning vragen voor complexe problemen.)
- In urgente gevallen waarin actieve uitbuiting in het wild wordt waargenomen, kunnen we met u coördineren voor een eerdere openbaarmaking.

## Testbeleid en richtlijnen

Houd u aan de volgende richtlijnen voor veilig testen op kwetsbaarheden.

### Toegestane activiteiten

- Testen op kwetsbaarheden met behulp van accounts die u bezit of testaccounts die u hebt gemaakt.
- **Minimale verificatie**: Krijg alleen toegang tot de minimale gegevens die nodig zijn om de kwetsbaarheid te bewijzen. Als u per ongeluk toegang krijgt tot gevoelige informatie van anderen, stop dan onmiddellijk en neem alleen gemaskeerde informatie op in uw rapport.

### Testomgeving

- **Aanvraag testaccount**: Als u een testaccount nodig heeft, kunt u deze aanvragen via [{{EMAIL}}](mailto:{{EMAIL}}).
- **Geautomatiseerde scans**: Lichte scans zijn toegestaan, maar scans met een hoge belasting die overmatige verzoeken per seconde genereren of de servicekwaliteit beïnvloeden, vereisen voorafgaande coördinatie.

### Verboden activiteiten (Buiten bereik)

De volgende activiteiten zijn ten strengste verboden en worden mogelijk niet wettelijk beschermd bij overtreding:

- Uitvoeren van **overmatige geautomatiseerde scans** (op een niveau dat servicebelasting veroorzaakt) zonder voorafgaande coördinatie.
- Elke activiteit die opzettelijk serverbronnen (CPU, geheugen, schijf, netwerkbandbreedte) uitput.
- Toegang krijgen tot of wijzigen van accounts, gegevens of persoonlijke informatie van andere gebruikers.
- Social engineering (phishing, enz.) of fysieke beveiligingsaanvallen.

### Expliciet buiten bereik (Out-of-Scope)

- Kwetsbaarheden gevonden in services of infrastructuur van derden.
- Fysieke beveiliging, HR-systemen, interne netwerken.
- Reeds openbare kwetsbaarheden of dubbele rapporten.
- Problemen die uitsluitend worden veroorzaakt door het verzenden van spam of phishing-e-mails.

### Kwetsbaarheden met laag risico (Niet geaccepteerd)

De volgende zaken zijn uitgesloten van het programma omdat ze een laag beveiligingsrisico vormen of bedoeld gedrag zijn:

- CSRF met lage impact, zoals uitlog-CSRF
- Clickjacking op pagina's zonder gevoelige informatie
- Eenvoudige versie-openbaarmaking (banner grabbing)
- Ontbrekende beveiligingsinstellingen zonder bewezen exploitatiepad (bijv. ontbrekende beveiligingsheaders zonder directe impact, niet-geconfigureerd e-mailverzendbeleid, enz.)
- Browser automatisch aanvullen ingeschakeld

Zelfs de bovenstaande items kunnen echter worden geëvalueerd als ze worden gekoppeld aan andere kwetsbaarheden om een daadwerkelijk aanvalsscenario te bewijzen.

### Bescherming van onderzoekers (Safe Harbor)

Als u te goeder trouw en in overeenstemming met dit beleid onderzoek doet naar kwetsbaarheden en deze meldt, beloven wij het volgende **voor zover toegestaan door de toepasselijke wetgeving**:

1. Wij beschouwen uw onderzoeksactiviteiten als geautoriseerd beveiligingsonderzoek en zullen geen civiele of strafrechtelijke juridische stappen tegen u ondernemen.
2. Wij zullen u niet vrijwillig aangeven bij wetshandhavingsinstanties of een klacht indienen.
3. Als een derde partij juridische stappen onderneemt met betrekking tot uw onderzoeksactiviteiten, zullen wij binnen een redelijk bereik ondersteuning bieden, zoals het verstrekken van documentatie waaruit blijkt dat u een conforme onderzoeker bent.

Safe Harbor is echter niet van toepassing in de volgende gevallen:

- Duidelijke schending van de verboden activiteiten in dit document.
- Ongeautoriseerd testen van systemen of infrastructuur van derden buiten onze controle.

## Contact

Als u vragen heeft over ons Bug Bounty-programma, neem dan gerust contact met ons op via [{{EMAIL}}](mailto:{{EMAIL}}).
