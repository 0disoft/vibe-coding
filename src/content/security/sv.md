# Säkerhetspolicy

> Senast uppdaterad: {{LAST_UPDATED}}

## Dataskyddstekniker och principer

Användardata behandlas säkert med skyddsåtgärder som tillämpas i flera lager, inklusive kryptering vid vila och TLS vid överföring.

### Lösenordsskydd
**Användarlösenord lagras aldrig i klartext och skyddas med den senaste hashningstekniken.**
- **Algoritm**: {{ENC_ALGO_PASSWORD}}
- **Anledning**: {{ENC_REASON_PASSWORD}}
- Ett unikt Salt tillämpas på varje lösenord för att förhindra regnbågstabellattacker.

### Datakryptering
**Känslig information krypteras omedelbart före lagring, med strikt separerad nyckelhantering.**
- **Algoritm**: {{ENC_ALGO_DATA}}
- **Anledning**: {{ENC_REASON_DATA}}
- **Nyckelderivering**: {{ENC_ALGO_KDF}} - {{ENC_REASON_KDF}}
- Vi använder kuvertkryptering (Envelope Encryption) för att skydda datakrypteringsnycklar (DEK) med separata nyckelkrypteringsnycklar (KEK).

### Dataintegritet
**Högpresterande hashfunktioner används för att verifiera att kritisk systemdata inte har manipulerats.**
- **Algoritm**: {{ENC_ALGO_INTEGRITY}}
- **Anledning**: {{ENC_REASON_INTEGRITY}}

### transportsäkerhet
**All kommunikation mellan användare och servrar skyddas av en krypterad tunnel med de senaste säkerhetsprotokollen.**
- **Protokoll**: {{ENC_ALGO_TRANSPORT}}
- **Anledning**: {{ENC_REASON_TRANSPORT}}
- HTTPS upprätthålls för all kommunikation, och HSTS tillämpas för att strikt förhindra nedgraderingsattacker.

## Administrativ och fysisk säkerhet

Utöver tekniska åtgärder hanterar vi noggrant säkerhet gällande människor och processer.

- **Åtkomstkontroll för anställda**: Åtkomst till data beviljas endast till nödvändig personal baserat på "likabehandlingsprincipen" (Principle of Least Privilege). All åtkomsthistorik loggas och granskas. Åtkomst utan legitim anledning är strängt förbjuden.
- **Fysisk säkerhet**: All molninfrastruktur från tredje part drivs i datacenter som har erhållit fysiska säkerhetscertifieringar som ISO 27001.

## Konto- och sessionssäkerhet

- **Inloggningsskydd**: Vi tillämpar inloggningsförsöksgränser och fördröjningsmekanismer för att blockera automatiserade brute-force-attacker.
- **Sessionshantering**: Sessioner löper automatiskt ut efter en period av inaktivitet, och aviseringar skickas vid viktiga kontoändringar.
- **Tvåfaktorsautentisering**: Vi planerar att införa 2FA-funktionalitet i framtiden.

## Applikationssäkerhet

Vi designar med bästa säkerhetspraxis som OWASP Top 10 i åtanke från utvecklingsstadiet.

- **Indatavalidering**: Förberedda uttalanden och ORM används för databasfrågor, och användarindata valideras både på server- och klientsidan.
- **Attackförsvar**: CSRF-tokens, SameSite-cookie-attribut och CSP (Content Security Policy) tillämpas för att mildra sessionskapning och skriptinjektionsattacker.

## Säkerhet i leveranskedjan för programvara

- **Beroendehantering**: Externa bibliotek och paket installeras endast från officiella register, och verifierade versioner säkerställs genom låsfiler.
- **Sårbarhetskontroller**: Sårbarhetsrapporter granskas regelbundet och högriskberoenden prioriteras för uppdateringar.

## Datalagring och radering

- **Kontoradering**: Vid begäran om kontoradering förstörs relaterad data permanent efter en 30-dagars frist (för återställning vid oavsiktlig radering).
- **Backupdata**: Säkerhetskopior för systemstabilitet sparas i högst 90 dagar och raderas sedan säkert. På grund av tekniska begränsningar kan fullständig radering från säkerhetskopieringssystem kräva ytterligare tid.
- **Loggdata**: Åtkomstloggar sparas i 1 år för långsiktig analys av säkerhetshot och identifiering av trender.
- **Undantag för laglig lagring**: Data som enligt lag krävs att sparas under en viss period kan lagras separat under den tillämpliga tiden.

## Incidenthantering

I händelse av en säkerhetsincident följer vi dessa procedurer för snabb respons och minimering av skada:

1. **Upptäckt och inneslutning (omedelbart)**: Isolera hot och förhindra ytterligare skada.
2. **Konsekvensanalys**: Bedöm omfattningen och allvaret så snabbt som möjligt, vanligtvis inom några timmar.
3. **Användaravisering**: För incidenter som påverkar användare (t.ex. dataläckor), meddela användare så snabbt som möjligt och följ lagstadgade tidsfrister (t.ex. 72 timmar).
4. **Transparent avslöjande**: Publicera en detaljerad rapport (orsak, åtgärder, förebyggande åtgärder) efter att incidenten har löst sig.

## Säkerhetsrevisioner och tredjepartstjänster

- **Säkerhetsrevisioner**: Vi befinner oss för närvarande i tjänststabiliseringsfasen och genomför regelbundna interna kodgranskningar och säkerhetskontroller. Vi planerar att införa regelbundna säkerhetsrevisioner av tredje part när tjänsten skalas upp.
- **Infrastruktur från tredje part**: Vi följer principen att inte lagra okrypterad känslig information direkt. För kärnfunktioner som betalningar och autentisering använder vi betrodda tjänster ({{THIRD_PARTY_PROVIDERS}}, etc.) som har erhållit internationellt erkända säkerhetscertifieringar (SOC 2, ISO 27001) eller genomgår likvärdiga säkerhetsbedömningar regelbundet.

## Säkerhetsrekommendationer för användare

Kontosäkerhet är ett delat ansvar.

- **Starka lösenord**: Använd unika och komplexa lösenord som inte används på andra webbplatser.
- **Se upp för nätfiske**: Var försiktig med meddelanden som utger sig för att vara officiella e-postmeddelanden och kontrollera adressen innan du klickar på länkar.

## Kontakt

Om du har några frågor om vår säkerhetspolicy, vänligen kontakta oss på [{{EMAIL}}](mailto:{{EMAIL}}).

För sårbarhetsrapporter och policyer för forskarskydd, se vår sida [Bug Bounty Program](/sv/bug-bounty).
