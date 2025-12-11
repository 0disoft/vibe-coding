# Politica di Sicurezza

> Ultimo aggiornamento: {{LAST_UPDATED}}

## Tecnologie e Principi di Protezione dei Dati

I dati degli utenti sono elaborati in modo sicuro con misure di protezione applicate su più livelli, inclusa la crittografia a riposo e TLS in transito.

### Protezione della Password
**Le password degli utenti non vengono mai memorizzate in testo in chiaro e sono protette utilizzando le più recenti tecnologie di hashing.**
- **Algoritmo**: {{ENC_ALGO_PASSWORD}}
- **Motivo**: {{ENC_REASON_PASSWORD}}
- Un Salt univoco viene applicato a ciascuna password per prevenire attacchi rainbow table.

### Crittografia dei Dati
**Le informazioni sensibili vengono crittografate immediatamente prima dell'archiviazione, con una gestione delle chiavi rigorosamente separata.**
- **Algoritmo**: {{ENC_ALGO_DATA}}
- **Motivo**: {{ENC_REASON_DATA}}
- **Derivazione della Chiave**: {{ENC_ALGO_KDF}} - {{ENC_REASON_KDF}}
- Utilizziamo la Envelope Encryption per proteggere le Data Encryption Keys (DEK) con Key Encryption Keys (KEK) separate.

### Integrità dei Dati
**Vengono utilizzate funzioni hash ad alte prestazioni per verificare che i dati critici del sistema non siano stati manomessi.**
- **Algoritmo**: {{ENC_ALGO_INTEGRITY}}
- **Motivo**: {{ENC_REASON_INTEGRITY}}

### Sicurezza del Trasporto
**Tutte le comunicazioni tra utenti e server sono protette da un tunnel crittografato utilizzando i più recenti protocolli di sicurezza.**
- **Protocollo**: {{ENC_ALGO_TRANSPORT}}
- **Motivo**: {{ENC_REASON_TRANSPORT}}
- HTTPS è imposto per tutte le comunicazioni e HSTS è applicato per prevenire rigorosamente attacchi di downgrade.

## Sicurezza Amministrativa e Fisica

Oltre alle misure tecniche, gestiamo accuratamente la sicurezza relativa alle persone e ai processi.

- **Controllo Accesso Dipendenti**: L'accesso ai dati è concesso solo al personale essenziale in base al 'Principio del Privilegio Minimo'. Tutta la cronologia degli accessi viene registrata e verificata. L'accesso senza motivo legittimo è severamente vietato.
- **Sicurezza Fisica**: Tutta l'infrastruttura cloud di terze parti opera in data center che hanno ottenuto certificazioni di sicurezza fisica come ISO 27001.

## Sicurezza Account e Sessione

- **Protezione Accesso**: Applichiamo limiti ai tentativi di accesso e meccanismi di ritardo per bloccare attacchi di forza bruta automatizzati.
- **Gestione Sessione**: Le sessioni scadono automaticamente dopo un periodo di inattività e vengono inviate notifiche per modifiche importanti all'account.
- **Autenticazione a Due Fattori**: Prevediamo di introdurre la funzionalità 2FA in futuro.

## Sicurezza Applicazione

Progettiamo tenendo presente le migliori pratiche di sicurezza come OWASP Top 10 fin dalla fase di sviluppo.

- **Convalida Input**: I Prepared Statements e gli ORM vengono utilizzati per le query del database e l'input dell'utente viene convalidato sia lato server che lato client.
- **Difesa dagli Attacchi**: Token CSRF, attributi cookie SameSite e CSP (Content Security Policy) vengono applicati per mitigare il dirottamento della sessione e gli attacchi di iniezione di script.

## Sicurezza della Supply Chain Software

- **Gestione Dipendenze**: Le librerie e i pacchetti esterni vengono installati solo da registri ufficiali e le versioni verificate sono garantite tramite file di blocco.
- **Controlli Vulnerabilità**: I report sulle vulnerabilità vengono esaminati regolarmente e le dipendenze ad alto rischio hanno la priorità per gli aggiornamenti.

## Conservazione e Cancellazione dei Dati

- **Cancellazione Account**: Su richiesta di cancellazione dell'account, i dati correlati vengono distrutti permanentemente dopo un periodo di grazia di 30 giorni (per il recupero da cancellazione accidentale).
- **Dati di Backup**: I backup per la stabilità del sistema vengono conservati per un massimo di 90 giorni e quindi cancellati in modo sicuro. A causa di limitazioni tecniche, la cancellazione completa dai sistemi di backup potrebbe richiedere ulteriore tempo.
- **Dati di Log**: I log di accesso vengono conservati per 1 anno per l'analisi delle minacce alla sicurezza a lungo termine e l'identificazione delle tendenze.
- **Eccezione Conservazione Legale**: I dati richiesti dalla legge per essere conservati per un periodo specifico possono essere archiviati separatamente per la durata applicabile.

## Risposta agli Incidenti

In caso di incidente di sicurezza, seguiamo queste procedure per una risposta rapida e la minimizzazione dei danni:

1. **Rilevamento e Contenimento (Immediato)**: Isolare le minacce e prevenire ulteriori danni.
2. **Analisi Impatto**: Valutare la portata e la gravità il più rapidamente possibile, in genere entro poche ore.
3. **Notifica Utente**: Per gli incidenti che interessano gli utenti (ad es. fughe di dati), avvisare gli utenti il più rapidamente possibile e rispettare le scadenze legali (ad es. 72 ore).
4. **Divulgazione Trasparente**: Pubblicare un report dettagliato (causa, azioni, misure preventive) dopo che l'incidente è stato risolto.

## Audit di Sicurezza e Servizi di Terze Parti

- **Audit di Sicurezza**: Attualmente siamo nella fase di stabilizzazione del servizio e conduciamo regolarmente revisioni del codice interno e controlli di sicurezza. Prevediamo di introdurre regolari audit di sicurezza di terze parti man mano che il servizio cresce.
- **Infrastruttura di Terze Parti**: Aderiamo al principio di non archiviare direttamente informazioni sensibili non crittografate. Per le funzioni principali come pagamenti e autenticazione, utilizziamo servizi affidabili ({{THIRD_PARTY_PROVIDERS}}, ecc.) che hanno ottenuto certificazioni di sicurezza riconosciute a livello internazionale (SOC 2, ISO 27001) o sono sottoposti regolarmente a valutazioni di sicurezza equivalenti.

## Raccomandazioni di Sicurezza per gli Utenti

La sicurezza dell'account è una responsabilità condivisa.

- **Password Forti**: Utilizzare password univoche e complesse non utilizzate su altri siti.
- **Attenzione al Phishing**: Diffidare dei messaggi che affermano di essere e-mail ufficiali e controllare l'indirizzo prima di fare clic sui link.

## Contatto

In caso di domande sulla nostra Politica di Sicurezza, contattaci all'indirizzo [{{EMAIL}}](mailto:{{EMAIL}}).

Per segnalazioni di vulnerabilità e politiche di protezione dei ricercatori, consultare la nostra pagina del [Bug Bounty Program](/it/bug-bounty).
