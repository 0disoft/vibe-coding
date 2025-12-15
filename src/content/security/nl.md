# Beveiligingsbeleid

> Laatst bijgewerkt: {{LAST_UPDATED}}

## Gegevensbeschermingstechnologieën & Principes

Gebruikersgegevens worden veilig verwerkt met beschermingsmaatregelen die op meerdere lagen worden toegepast, inclusief encryptie in rust en TLS tijdens transport.

### Wachtwoordbeveiliging

**Gebruikerswachtwoorden worden nooit in platte tekst opgeslagen en worden beschermd met behulp van de nieuwste hashing-technologieën.**

- **Algoritme**: {{ENC_ALGO_PASSWORD}}
- **Reden**: {{ENC_REASON_PASSWORD}}
- Een unieke Salt wordt toegepast op elk wachtwoord om regenboogtabelaanvallen te voorkomen.

### Gegevensencryptie

**Gevoelige informatie wordt onmiddellijk vóór opslag versleuteld, met strikt gescheiden sleutelbeheer.**

- **Algoritme**: {{ENC_ALGO_DATA}}
- **Reden**: {{ENC_REASON_DATA}}
- **Sleutelafleiding**: {{ENC_ALGO_KDF}} - {{ENC_REASON_KDF}}
- We gebruiken Envelope Encryption om Data Encryption Keys (DEK) te beschermen met afzonderlijke Key Encryption Keys (KEK).

### Gegevensingriteit

**Hoogwaardige hashfuncties worden gebruikt om te verifiëren dat er niet met kritieke systeemgegevens is geknoeid.**

- **Algoritme**: {{ENC_ALGO_INTEGRITY}}
- **Reden**: {{ENC_REASON_INTEGRITY}}

### Transportbeveiliging

**Alle communicatie tussen gebruikers en servers wordt beschermd door een versleutelde tunnel met behulp van de nieuwste beveiligingsprotocollen.**

- **Protocol**: {{ENC_ALGO_TRANSPORT}}
- **Reden**: {{ENC_REASON_TRANSPORT}}
- HTTPS wordt afgedwongen voor alle communicatie en HSTS wordt toegepast om downgrade-aanvallen strikt te voorkomen.

## Administratieve & Fysieke Beveiliging

Naast technische maatregelen beheren we de beveiliging met betrekking tot mensen en processen grondig.

- **Toegangscontrole Medewerkers**: Gegevenstoegang wordt alleen verleend aan essentieel personeel op basis van het 'Principe van de Minste Bevoegdheid'. Alle toegangsgeschiedenis wordt geregistreerd en gecontroleerd. Toegang zonder legitieme reden is ten strengste verboden.
- **Fysieke Beveiliging**: Alle cloudinfrastructuur van derden werkt in datacenters die fysieke beveiligingscertificeringen hebben verkregen, zoals ISO 27001.

## Account- & Sessiebeveiliging

- **Inlogbeveiliging**: We passen limieten voor inlogpogingen en vertragingsmechanismen toe om geautomatiseerde brute-force-aanvallen te blokkeren.
- **Sessiebeheer**: Sessies verlopen automatisch na een periode van inactiviteit en er worden meldingen verzonden voor belangrijke accountwijzigingen.
- **Tweefactorauthenticatie**: We zijn van plan om in de toekomst 2FA-functionaliteit te introduceren.

## Applicatiebeveiliging

We ontwerpen vanaf de ontwikkelingsfase met beveiligingsbest practices zoals OWASP Top 10 in gedachten.

- **Invoervalidatie**: Prepared Statements en ORM's worden gebruikt voor databasequery's en gebruikersinvoer wordt zowel aan de server- als aan de clientzijde gevalideerd.
- **Aanvalsverdediging**: CSRF-tokens, SameSite-cookie-attributen en CSP (Content Security Policy) worden toegepast om sessiekaping en scriptinjectie-aanvallen te beperken.

## Software Supply Chain Beveiliging

- **Afhankelijkheidsbeheer**: Externe bibliotheken en pakketten worden alleen geïnstalleerd vanuit officiële registers en geverifieerde versies worden gegarandeerd via lock-bestanden.
- **Kwetsbaarheidscontroles**: Kwetsbaarheidsrapporten worden regelmatig beoordeeld en afhankelijkheden met een hoog risico krijgen prioriteit voor updates.

## Gegevensbewaring & Verwijdering

- **Accountverwijdering**: Na een verzoek tot accountverwijdering worden gerelateerde gegevens permanent vernietigd na een respijtperiode van 30 dagen (voor herstel na onbedoelde verwijdering).
- **Back-upgegevens**: Back-ups voor systeemstabiliteit worden maximaal 90 dagen bewaard en vervolgens veilig verwijderd. Vanwege technische beperkingen kan volledige verwijdering uit back-upsystemen extra tijd vergen.
- **Loggegevens**: Toegangslogboeken worden 1 jaar bewaard voor langdurige analyse van beveiligingsbedreigingen en identificatie van trends.
- **Uitzondering Wettelijke Bewaring**: Gegevens die wettelijk gedurende een bepaalde periode moeten worden bewaard, kunnen voor de toepasselijke duur afzonderlijk worden opgeslagen.

## Incidentrespons

In geval van een beveiligingsincident volgen we deze procedures voor snelle respons en minimalisering van schade:

1. **Detectie & Insluiting (Onmiddellijk)**: Bedreigingen isoleren en verdere schade voorkomen.
2. **Impactanalyse**: De omvang en ernst zo snel mogelijk beoordelen, meestal binnen enkele uren.
3. **Gebruikersmelding**: Voor incidenten die gebruikers treffen (bijv. datalekken), gebruikers zo snel mogelijk op de hoogte stellen en voldoen aan wettelijke termijnen (bijv. 72 uur).
4. **Transparante Openbaarmaking**: Een gedetailleerd rapport (oorzaak, acties, preventieve maatregelen) publiceren nadat het incident is opgelost.

## Beveiligingsaudits & Diensten van Derden

- **Beveiligingsaudits**: We bevinden ons momenteel in de servicestabilisatiefase en voeren regelmatig interne codebeoordelingen en beveiligingscontroles uit. We zijn van plan om regelmatige beveiligingsaudits door derden te introduceren naarmate de service schaalt.
- **Infrastructuur van Derden**: We houden ons aan het principe om niet-versleutelde gevoelige informatie niet rechtstreeks op te slaan. Voor kernfuncties zoals betalingen en authenticatie maken we gebruik van vertrouwde diensten ({{THIRD_PARTY_PROVIDERS}}, enz.) die internationaal erkende beveiligingscertificeringen hebben verkregen (SOC 2, ISO 27001) of regelmatig gelijkwaardige beveiligingsbeoordelingen ondergaan.

## Beveiligingsaanbevelingen voor Gebruikers

Accountbeveiliging is een gedeelde verantwoordelijkheid.

- **Sterke Wachtwoorden**: Gebruik unieke en complexe wachtwoorden die niet op andere sites worden gebruikt.
- **Pas op voor Phishing**: Wees voorzichtig met berichten die beweren officiële e-mails te zijn en controleer het adres voordat u op links klikt.

## Contact

Als u vragen heeft over ons Beveiligingsbeleid, neem dan contact met ons op via [{{EMAIL}}](mailto:{{EMAIL}}).

Raadpleeg onze [Bug Bounty Program](/nl/bug-bounty)-pagina voor kwetsbaarheidsrapporten en beleid voor onderzoekersbescherming.
