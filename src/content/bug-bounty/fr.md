# Programme de Bug Bounty

> Dernière mise à jour : {{LAST_UPDATED}}

## Introduction

Chez {{SITE_NAME}}, nous collaborons avec des chercheurs en sécurité pour créer un environnement Internet plus sûr. Si vous avez trouvé une vulnérabilité de sécurité dans notre service, veuillez nous contacter immédiatement.

Ce programme fonctionne actuellement comme un **Canal de Divulgation de Vulnérabilités** axé sur le signalement responsable et la collaboration plutôt que sur des récompenses monétaires. Nous valorisons et coopérons de manière transparente avec les chercheurs qui divulguent des vulnérabilités de manière éthique.

## Périmètre (In-Scope)

Les chercheurs peuvent tester uniquement les domaines et services suivants :

- Site officiel de {{SITE_NAME}} et ses sous-domaines
- Applications mobiles officielles de {{SITE_NAME}} (le cas échéant)
- Points de terminaison API directement exploités par {{SITE_NAME}}

Les domaines et services tiers (passerelles de paiement, outils d'analyse, hébergeurs, etc.) non listés ci-dessus ne sont pas couverts par ce programme. Si vous n'êtes pas sûr qu'une cible soit dans le périmètre, veuillez nous contacter avant de procéder au test.

## Politique de Récompense

Actuellement, le Programme de Bug Bounty de {{SITE_NAME}} n'offre pas de récompenses monétaires régulières. Cependant, pour montrer notre appréciation pour les contributions significatives, nous proposons ce qui suit :

- **Hall of Fame (Panthéon)** : Liste des noms des chercheurs ayant signalé des vulnérabilités valides (lorsqu'il est opérationnel).
- **Reconnaissance Publique** : Fournir une reconnaissance publique ou une lettre de recommandation avec le consentement du chercheur.
- **Priorité Future** : Offrir des opportunités de participation prioritaire si nous passons à un programme payant à l'avenir.

Nous pourrons introduire un système de primes (Bounty) à l'avenir en fonction du budget et de l'échelle du service, et nous l'annoncerons sur cette page le cas échéant.

## Critères de Sévérité

| Sévérité | CVSS | Exemples |
|---|---|---|
| Critical | 9.0-10.0 | Exécution de code à distance (RCE), fuite complète de la base de données, prise de contrôle massive de comptes |
| High | 7.0-8.9 | Injection SQL, XSS stocké, contournement de l'authentification |
| Medium | 4.0-6.9 | XSS réfléchi, CSRF sur actions sensibles, divulgation d'informations |
| Low | 0.1-3.9 | Absence d'en-têtes de sécurité, divulgation de version |

La sévérité peut être ajustée en fonction de l'impact réel.

## Signalement des Vulnérabilités

### Canaux de Signalement

- **E-mail** : [{{EMAIL}}](mailto:{{EMAIL}})
- **Objet** : `[Security Report] Vulnerability Summary` (Résumé de la vulnérabilité)
- **Langue** : Veuillez rédiger en coréen, anglais ou français.

### Format du Rapport

Pour nous aider à analyser et reproduire le problème, veuillez inclure les éléments suivants :

1. Type de vulnérabilité et description détaillée.
2. Étapes spécifiques pour reproduire le problème (y compris les scripts ou lignes de commande).
3. URL, points de terminaison API ou composants affectés.
4. Code de preuve de concept (PoC) ou captures d'écran.

### Normes de Qualité des Rapports

- Les rapports qui ne peuvent pas être reproduits ou qui manquent de détails suffisants peuvent ne pas être acceptés.
- Les rapports issus de scanners automatisés ne sont pas acceptés.
- **Doublons** : Les vulnérabilités en double ne sont créditées qu'au premier déclarant. (Basé sur l'heure de réception du serveur de messagerie)

### Processus

1. **Confirmation de Réception** : Nous enverrons un e-mail de confirmation dans les 72 heures suivant votre rapport.
2. **Analyse et Planification** : Une fois la vulnérabilité vérifiée, nous évaluerons sa sévérité et vous informerons du calendrier estimé de correction. Si nous ne pouvons pas respecter le délai, nous expliquerons la raison et fournirons un calendrier mis à jour.
3. **Résolution et Notification** : Nous vous informerons une fois le correctif terminé. La résolution peut prendre du temps si des changements structurels sont nécessaires pour la stabilité du service.
4. **Divulgation et Reconnaissance** : Une fois résolu, nous déciderons de la divulgation en consultation avec le chercheur. Les rapports valides seront reconnus conformément à la « Politique de Récompense » ci-dessus.
5. **Émission de CVE** : Pour les vulnérabilités significatives, nous pouvons demander l'émission d'un numéro CVE avec le consentement du déclarant.

### Politique de Divulgation Publique (Public Disclosure)

- Nous recommandons la divulgation une fois le correctif terminé et vous demandons de partager les détails de la divulgation avec nous à l'avance.
- Si aucune mesure appropriée n'est prise dans les **60 jours** suivant le rapport, le déclarant a le droit de divulguer les détails de la vulnérabilité de la manière convenue mutuellement. (Cependant, nous pouvons demander un ajustement de calendrier pour les problèmes complexes.)
- Dans les cas urgents où une exploitation active est observée, nous pouvons coordonner avec vous pour une divulgation plus précoce.

## Politique et Directives de Test

Veuillez respecter les directives suivantes pour des tests de vulnérabilité sécurisés.

### Activités Autorisées

- Tester les vulnérabilités en utilisant des comptes que vous possédez ou des comptes de test que vous avez créés.
- **Vérification Minimale** : Accédez uniquement aux données minimales nécessaires pour prouver la vulnérabilité. Si vous accédez accidentellement aux informations sensibles d'autrui, arrêtez immédiatement et n'incluez que des informations masquées dans votre rapport.

### Environnement de Test

- **Demande de Compte de Test** : Si vous avez besoin d'un compte de test, vous pouvez en faire la demande à [{{EMAIL}}](mailto:{{EMAIL}}).
- **Scans Automatisés** : Les scans légers sont autorisés, mais les scans à forte charge générant des requêtes excessives par seconde ou affectant la qualité du service nécessitent une coordination préalable.

### Activités Interdites (Hors Périmètre)

Les activités suivantes sont strictement interdites et peuvent ne pas être légalement protégées en cas de violation :

- Exécuter des **scans automatisés excessifs** (à un niveau causant une charge de service) sans coordination préalable.
- Toute activité épuisant intentionnellement les ressources du serveur (CPU, mémoire, disque, bande passante réseau).
- Accéder ou modifier les comptes, données ou informations personnelles d'autres utilisateurs.
- Ingénierie sociale (phishing, etc.) ou attaques de sécurité physique.

### Hors Périmètre Explicite (Out-of-Scope)

- Vulnérabilités trouvées dans des services ou infrastructures tiers.
- Sécurité physique, systèmes RH, réseaux internes.
- Vulnérabilités déjà publiques ou rapports en double.
- Problèmes causés uniquement par l'envoi de spam ou d'e-mails de phishing.

### Vulnérabilités à Faible Risque (Non Acceptées)

Les éléments suivants sont exclus du programme car ils présentent un risque de sécurité faible ou sont un comportement prévu :

- CSRF à faible impact, tel que le CSRF de déconnexion.
- Clickjacking sur des pages sans informations sensibles.
- Simple divulgation de version (banner grabbing).
- Absence de paramètres de sécurité sans chemin d'exploitation prouvé (par ex., absence d'en-têtes de sécurité sans impact direct, politiques d'envoi d'e-mails non configurées, etc.).
- Autocomplétion du navigateur activée.

Cependant, même les éléments ci-dessus peuvent être évalués s'ils sont chaînés avec d'autres vulnérabilités pour prouver un scénario d'attaque réel.

### Protection des Chercheurs (Safe Harbor)

Si vous recherchez et signalez des vulnérabilités de bonne foi et conformément à cette politique, nous promettons ce qui suit **dans la mesure permise par la loi applicable** :

1. Nous considérons vos activités de recherche comme une recherche de sécurité autorisée et n'engagerons aucune action en justice civile ou pénale contre vous.
2. Nous ne vous signalerons pas volontairement aux forces de l'ordre ni ne porterons plainte.
3. Si un tiers engage une action en justice concernant vos activités de recherche, nous fournirons un soutien dans une limite raisonnable, comme la fourniture de documents prouvant que vous êtes un chercheur conforme.

Cependant, le Safe Harbor ne s'applique pas dans les cas suivants :

- Violation manifeste des activités interdites dans ce document.
- Tests non autorisés de systèmes ou d'infrastructures tiers hors de notre contrôle.

## Contact

Si vous avez des questions concernant notre Programme de Bug Bounty, n'hésitez pas à nous contacter à [{{EMAIL}}](mailto:{{EMAIL}}).
