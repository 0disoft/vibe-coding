# Bug Bounty-program

> Senast uppdaterad: {{LAST_UPDATED}}


## Introduktion

På {{SITE_NAME}} samarbetar vi med säkerhetsforskare för att skapa en säkrare internetmiljö. Om du har hittat en säkerhetssäkerhet i vår tjänst, vänligen kontakta oss omedelbart.

Detta program fungerar för närvarande som en **kanal för avslöjande av sårbarheter** som fokuserar på ansvarsfull rapportering och samarbete snarare än monetära belöningar. Vi värdesätter och samarbetar transparent med forskare som etiskt avslöjar sårbarheter.

## Omfattning (In-Scope)

Forskare får endast testa följande domäner och tjänster:

- {{SITE_NAME}} officiella webbplats och dess underdomäner
- {{SITE_NAME}} officiella mobilapplikationer (om tillgängligt)
- API-slutpunkter som drivs direkt av {{SITE_NAME}}

Domäner och tjänster från tredje part (betalningsgateways, analysverktyg, hostingleverantörer etc.) som inte listas ovan omfattas inte av detta program. Om du är osäker på om ett mål är inom omfattningen, kontakta oss innan du testar.

## Belöningspolicy

För närvarande erbjuder {{SITE_NAME}} Bug Bounty-program inte regelbundna monetära belöningar. Men för att visa vår uppskattning för betydande bidrag har vi följande:

- **Hall of Fame**: Listar namnen på forskare som rapporterade giltiga sårbarheter (när det är i drift).
- **Offentligt erkännande**: Tillhandahålla offentligt erkännande eller ett rekommendationsbrev med forskarens samtycke.
- **Framtida prioritet**: Tillhandahålla möjligheter till prioriterat deltagande om vi övergår till ett betalt program i framtiden.

Vi kan komma att införa ett monetärt belöningssystem (Bounty) i framtiden beroende på budget och tjänstens omfattning, och vi kommer att meddela det på denna sida om det implementeras.

## Kriterier för allvarlighetsgrad

| Allvarlighetsgrad | CVSS | Exempel |
|---|---|---|
| Critical | 9.0-10.0 | Fjärrkörning av kod (RCE), fullständigt DB-läckage, massövertagande av konton |
| High | 7.0-8.9 | SQL Injection, lagrad XSS, autentiseringsförbikoppling |
| Medium | 4.0-6.9 | Reflekterad XSS, CSRF vid känsliga åtgärder, informationsavslöjande |
| Low | 0.1-3.9 | Saknade säkerhetsrubriker, versionsavslöjande |

Allvarlighetsgraden kan justeras baserat på faktisk påverkan.

## Rapportering av sårbarheter

### Rapporteringskanaler

- **E-post**: [{{EMAIL}}](mailto:{{EMAIL}})
- **Ämne**: `[Security Report] Vulnerability Summary` (Sammanfattning av sårbarhet)
- **Språk**: Vänligen skriv på koreanska, engelska eller svenska.

### Rapportformat

För att hjälpa oss att analysera och reproducera problemet, inkludera följande:

1. Typ av sårbarhet och detaljerad beskrivning.
2. Specifika steg för att reproducera problemet (inklusive skript eller kommandorader).
3. Påverkade URL:er, API-slutpunkter eller komponenter.
4. Proof of Concept (PoC)-kod eller skärmdumpar.

### Kvalitetsstandarder för rapporter

- Rapporter som inte kan reproduceras eller saknar tillräckliga detaljer kanske inte accepteras.
- Rapporter från automatiserade skannrar accepteras inte.
- **Dubbletter**: Dubbla sårbarheter krediteras endast till den första rapportören. (Baserat på e-postserverns mottagningstidstämpel)

### Process

1. **Mottagningsbekräftelse**: Vi skickar ett bekräftelsemail inom 72 timmar efter din rapport.
2. **Analys & Planering**: När sårbarheten har verifierats bedömer vi dess allvarlighetsgrad och informerar dig om den beräknade tidsplanen för åtgärd. Om vi inte kan hålla tidsfristen förklarar vi orsaken och ger ett uppdaterat schema.
3. **Lösning & Avisering**: Vi meddelar dig när patchen är klar. Lösningen kan ta tid om strukturella förändringar krävs för tjänstens stabilitet.
4. **Avslöjande & Erkännande**: När det är löst beslutar vi om avslöjande i samråd med forskaren. Giltiga rapporter kommer att erkännas i enlighet med "Belöningspolicy" ovan.
5. **CVE-utfärdande**: För betydande sårbarheter kan vi begära utfärdande av ett CVE-nummer med rapportörens samtycke.

### Policy för offentligt avslöjande (Public Disclosure)

- Vi rekommenderar avslöjande efter att patchen har slutförts och ber dig att dela informationen om avslöjandet med oss i förväg.
- Om lämpliga åtgärder inte vidtas inom **60 dagar** efter rapporten har rapportören rätt att avslöja sårbarhetsdetaljer på ett ömsesidigt överenskommet sätt. (Vi kan dock begära en justering av tidsplanen för komplexa problem.)
- I brådskande fall där aktivt utnyttjande observeras kan vi samordna med dig för ett tidigare avslöjande.

## Testpolicy och riktlinjer

Följ följande riktlinjer för säker sårbarhetstestning.

### Tillåtna aktiviteter

- Testa sårbarheter med konton du äger eller testkonton du skapat.
- **Minimal verifiering**: Få endast tillgång till den minsta mängd data som krävs för att bevisa sårbarheten. Om du av misstag får tillgång till andras känsliga information, sluta omedelbart och inkludera endast maskerad information i din rapport.

### Testmiljö

- **Begäran om testkonto**: Om du behöver ett testkonto kan du begära ett på [{{EMAIL}}](mailto:{{EMAIL}}).
- **Automatiserade skanningar**: Lätta skanningar är tillåtna, men skanningar med hög belastning som genererar överdrivna förfrågningar per sekund eller påverkar tjänstens kvalitet kräver förhandssamordning.

### Förbjudna aktiviteter (Utanför omfattningen)

Följande aktiviteter är strikt förbjudna och kanske inte är lagligt skyddade vid överträdelse:

- Köra **överdrivna automatiserade skanningar** (på en nivå som orsakar tjänstebelastning) utan förhandssamordning.
- Alla aktiviteter som avsiktligt tömmer serverresurser (CPU, minne, disk, nätverksbandbredd).
- Få tillgång till eller ändra andra användares konton, data eller personlig information.
- Social engineering (phishing etc.) eller fysiska säkerhetsattacker.

### Explicit utanför omfattningen (Out-of-Scope)

- Sårbarheter som hittas i tjänster eller infrastruktur från tredje part.
- Fysisk säkerhet, HR-system, interna nätverk.
- Redan offentliga sårbarheter eller dubbla rapporter.
- Problem som uteslutande orsakas av att skicka spam eller nätfiske-e-post.

### Sårbarheter med låg risk (Accepteras ej)

Följande utesluts från programmet eftersom de utgör låg säkerhetsrisk eller är avsett beteende:

- CSRF med låg påverkan, t.ex. utloggnings-CSRF
- Clickjacking på sidor utan känslig information
- Enkelt versionsavslöjande (banner grabbing)
- Saknade säkerhetsinställningar utan bevisad exploateringsväg (t.ex. saknade säkerhetsrubriker utan direkt påverkan, okonfigurerade e-postsändningspolicyer etc.)
- Autokomplettering i webbläsare aktiverat

Men även ovanstående objekt kan utvärderas om de kedjas med andra sårbarheter för att bevisa ett faktiskt attackscenario.

### Skydd för forskare (Safe Harbor)

Om du undersöker och rapporterar sårbarheter i god tro och i enlighet med denna policy lovar vi följande **i den utsträckning som tillåts enligt tillämplig lag**:

1. Vi betraktar dina forskningsaktiviteter som auktoriserad säkerhetsforskning och kommer inte att vidta några civilrättsliga eller straffrättsliga åtgärder mot dig.
2. Vi kommer inte frivilligt att rapportera dig till brottsbekämpande myndigheter eller lämna in ett klagomål.
3. Om en tredje part inleder rättsliga åtgärder gällande dina forskningsaktiviteter kommer vi att tillhandahålla stöd inom ett rimligt intervall, till exempel att tillhandahålla dokumentation som bevisar att du är en forskare som följer reglerna.

Safe Harbor gäller dock inte i följande fall:
- Uppenbar överträdelse av de förbjudna aktiviteterna i detta dokument.
- Otillåten testning av system eller infrastruktur från tredje part utanför vår kontroll.

## Kontakt

Om du har några frågor om vårt Bug Bounty-program är du välkommen att kontakta oss på [{{EMAIL}}](mailto:{{EMAIL}}).
