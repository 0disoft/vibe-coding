# Programma Bug Bounty

> Ultimo aggiornamento: {{LAST_UPDATED}}

## Introduzione

In {{SITE_NAME}}, collaboriamo con ricercatori di sicurezza per creare un ambiente Internet più sicuro. Se hai trovato una vulnerabilità di sicurezza nel nostro servizio, ti preghiamo di contattarci immediatamente.

Questo programma opera attualmente come un **Canale di Divulgazione delle Vulnerabilità** focalizzato sulla segnalazione responsabile e sulla collaborazione piuttosto che su ricompense in denaro. Apprezziamo e cooperiamo in modo trasparente con i ricercatori che divulgano vulnerabilità in modo etico.

## Ambito (In-Scope)

I ricercatori possono testare solo i seguenti domini e servizi:

- Sito web ufficiale di {{SITE_NAME}} e i suoi sottodomini
- Applicazioni mobili ufficiali di {{SITE_NAME}} (se disponibili)
- Endpoint API gestiti direttamente da {{SITE_NAME}}

I domini e i servizi di terze parti (gateway di pagamento, strumenti di analisi, provider di hosting, ecc.) non elencati sopra non sono coperti da questo programma. Se non sei sicuro che un obiettivo sia nell'ambito, contattaci prima di effettuare il test.

## Politica di Ricompensa

Attualmente, il Programma Bug Bounty di {{SITE_NAME}} non offre ricompense in denaro regolari. Tuttavia, per mostrare il nostro apprezzamento per contributi significativi, operiamo quanto segue:

- **Hall of Fame**: Elenco dei nomi dei ricercatori che hanno segnalato vulnerabilità valide (quando operativo).
- **Riconoscimento Pubblico**: Fornire un riconoscimento pubblico o una lettera di raccomandazione con il consenso del ricercatore.
- **Priorità Futura**: Fornire opportunità di partecipazione prioritaria se in futuro passeremo a un programma a pagamento.

Potremmo introdurre un sistema di ricompense in denaro (Bounty) in futuro a seconda del budget e della scala del servizio, e lo annunceremo su questa pagina se implementato.

## Criteri di Gravità

| Gravità | CVSS | Esempi |
|---|---|---|
| Critical | 9.0-10.0 | Esecuzione di codice remoto (RCE), fuga completa del DB, acquisizione massiva di account |
| High | 7.0-8.9 | SQL Injection, XSS memorizzato, bypass dell'autenticazione |
| Medium | 4.0-6.9 | XSS riflesso, CSRF su azioni sensibili, divulgazione di informazioni |
| Low | 0.1-3.9 | Mancanza di intestazioni di sicurezza, divulgazione della versione |

La gravità può essere modificata in base all'impatto reale.

## Segnalazione delle Vulnerabilità

### Canali di Segnalazione

- **E-mail**: [{{EMAIL}}](mailto:{{EMAIL}})
- **Oggetto**: [Security Report] Vulnerability Summary (Riepilogo della vulnerabilità)
- **Lingua**: Si prega di scrivere in coreano, inglese o italiano.

### Formato del Rapporto

Per aiutarci ad analizzare e riprodurre il problema, si prega di includere quanto segue:

1. Tipo di vulnerabilità e descrizione dettagliata.
2. Passaggi specifici per riprodurre il problema (inclusi script o righe di comando).
3. URL, endpoint API o componenti interessati.
4. Codice Proof of Concept (PoC) o screenshot.

### Standard di Qualità del Rapporto

- I rapporti che non possono essere riprodotti o mancano di dettagli sufficienti potrebbero non essere accettati.
- Non sono accettati rapporti di output di scanner automatizzati.
- **Duplicati**: Le vulnerabilità duplicate vengono accreditate solo al primo segnalatore. (Basato sul timestamp di ricezione del server di posta elettronica)

### Processo

1. **Conferma di Ricezione**: Invieremo un'e-mail di conferma entro 72 ore dalla tua segnalazione.
2. **Analisi e Pianificazione**: Una volta verificata la vulnerabilità, ne valuteremo la gravità e ti informeremo della tempistica stimata per la correzione. Se non riusciamo a rispettare la scadenza, spiegheremo il motivo e forniremo un programma aggiornato.
3. **Risoluzione e Notifica**: Ti informeremo una volta completata la patch. La risoluzione potrebbe richiedere tempo se sono necessarie modifiche strutturali per la stabilità del servizio.
4. **Divulgazione e Riconoscimento**: Una volta risolto, decideremo sulla divulgazione in consultazione con il ricercatore. I rapporti validi saranno riconosciuti in conformità con la 'Politica di Ricompensa' di cui sopra.
5. **Emissione CVE**: Per vulnerabilità significative, potremmo richiedere l'emissione di un numero CVE con il consenso del segnalatore.

### Politica di Divulgazione Pubblica (Public Disclosure)

- Raccomandiamo la divulgazione dopo che la patch è stata completata e chiediamo di condividere i dettagli della divulgazione con noi in anticipo.
- Se non viene intrapresa alcuna azione appropriata entro **60 giorni** dalla segnalazione, il segnalatore ha il diritto di divulgare i dettagli della vulnerabilità in un modo concordato reciprocamente. (Tuttavia, potremmo richiedere un adeguamento della pianificazione per problemi complessi.)
- In casi urgenti in cui viene osservato uno sfruttamento attivo, potremmo coordinarci con te per una divulgazione anticipata.

## Politica e Linee Guida per i Test

Si prega di attenersi alle seguenti linee guida per test di vulnerabilità sicuri.

### Attività Consentite

- Testare le vulnerabilità utilizzando account di tua proprietà o account di test creati da te.
- **Verifica Minima**: Accedi solo ai dati minimi necessari per dimostrare la vulnerabilità. Se accedi accidentalmente alle informazioni sensibili di altri, fermati immediatamente e includi solo informazioni mascherate nel tuo rapporto.

### Ambiente di Test

- **Richiesta Account di Test**: Se hai bisogno di un account di test, puoi richiederne uno a [{{EMAIL}}](mailto:{{EMAIL}}).
- **Scansioni Automatizzate**: Sono consentite scansioni leggere, ma scansioni ad alto carico che generano richieste eccessive al secondo o influiscono sulla qualità del servizio richiedono un coordinamento preventivo.

### Attività Proibite (Fuori Ambito)

Le seguenti attività sono severamente vietate e potrebbero non essere legalmente protette in caso di violazione:

- Eseguire **scansioni automatizzate eccessive** (a un livello che causa carico di servizio) senza coordinamento preventivo.
- Qualsiasi attività che esaurisca intenzionalmente le risorse del server (CPU, memoria, disco, larghezza di banda di rete).
- Accesso o modifica di account, dati o informazioni personali di altri utenti.
- Ingegneria sociale (phishing, ecc.) o attacchi di sicurezza fisica.

### Esplicitamente Fuori Ambito (Out-of-Scope)

- Vulnerabilità trovate in servizi o infrastrutture di terze parti.
- Sicurezza fisica, sistemi HR, reti interne.
- Vulnerabilità già pubbliche o rapporti duplicati.
- Problemi causati esclusivamente dall'invio di spam o e-mail di phishing.

### Vulnerabilità a Basso Rischio (Non Accettate)

I seguenti elementi sono esclusi dal programma in quanto presentano un basso rischio di sicurezza o sono un comportamento previsto:

- CSRF a basso impatto come logout CSRF
- Clickjacking su pagine senza informazioni sensibili
- Semplice divulgazione della versione (banner grabbing)
- Mancanza di impostazioni di sicurezza senza percorso di sfruttamento comprovato (ad es. mancanza di intestazioni di sicurezza senza impatto diretto, politiche di invio e-mail non configurate, ecc.)
- Completamento automatico del browser abilitato

Tuttavia, anche gli elementi sopra indicati possono essere valutati se concatenati con altre vulnerabilità per dimostrare uno scenario di attacco reale.

### Protezione del Ricercatore (Safe Harbor)

Se cerchi e segnali vulnerabilità in buona fede e in conformità con questa politica, promettiamo quanto segue **nella misura consentita dalla legge applicabile**:

1. Consideriamo le tue attività di ricerca come ricerca di sicurezza autorizzata e non intraprenderemo alcuna azione legale civile o penale contro di te.
2. Non ti segnaleremo volontariamente alle forze dell'ordine né sporgeremo denuncia.
3. Se una terza parte avvia un'azione legale in merito alle tue attività di ricerca, forniremo supporto entro un intervallo ragionevole, come fornire documentazione che dimostri che sei un ricercatore conforme.

Tuttavia, il Safe Harbor non si applica nei seguenti casi:

- Chiara violazione delle attività proibite in questo documento.
- Test non autorizzati di sistemi o infrastrutture di terze parti al di fuori del nostro controllo.

## Contatto

Se hai domande sul nostro Programma Bug Bounty, non esitare a contattarci a [{{EMAIL}}](mailto:{{EMAIL}}).
