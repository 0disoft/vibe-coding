# Politique de Sécurité

> Dernière mise à jour : {{LAST_UPDATED}}

## Technologies et Principes de Protection des Données

Les données des utilisateurs sont traitées en toute sécurité avec des mesures de protection appliquées à plusieurs niveaux, y compris le chiffrement au repos et le TLS en transit.

### Protection des Mots de Passe
**Les mots de passe des utilisateurs ne sont jamais stockés en texte clair et sont protégés à l'aide des dernières technologies de hachage.**
- **Algorithme** : {{ENC_ALGO_PASSWORD}}
- **Raison** : {{ENC_REASON_PASSWORD}}
- Un sel (Salt) unique est appliqué à chaque mot de passe pour empêcher les attaques par table arc-en-ciel.

### Chiffrement des Données
**Les informations sensibles sont chiffrées immédiatement avant le stockage, avec une gestion des clés strictement séparée.**
- **Algorithme** : {{ENC_ALGO_DATA}}
- **Raison** : {{ENC_REASON_DATA}}
- **Dérivation de Clé** : {{ENC_ALGO_KDF}} - {{ENC_REASON_KDF}}
- Nous utilisons le chiffrement par enveloppe (Envelope Encryption) pour protéger les clés de chiffrement de données (DEK) avec des clés de chiffrement de clé (KEK) distinctes.

### Intégrité des Données
**Des fonctions de hachage haute performance sont utilisées pour vérifier que les données critiques du système n'ont pas été falsifiées.**
- **Algorithme** : {{ENC_ALGO_INTEGRITY}}
- **Raison** : {{ENC_REASON_INTEGRITY}}

### Sécurité du Transport
**Toutes les communications entre les utilisateurs et les serveurs sont protégées par un tunnel chiffré utilisant les derniers protocoles de sécurité.**
- **Protocole** : {{ENC_ALGO_TRANSPORT}}
- **Raison** : {{ENC_REASON_TRANSPORT}}
- HTTPS est imposé pour toutes les communications, et HSTS est appliqué pour empêcher strictement les attaques de déclassement.

## Sécurité Administrative et Physique

Au-delà des mesures techniques, nous gérons minutieusement la sécurité concernant les personnes et les processus.

- **Contrôle d'Accès des Employés** : L'accès aux données n'est accordé qu'au personnel essentiel sur la base du « Principe du Moindre Privilège ». Tout l'historique d'accès est enregistré et audité. L'accès sans motif légitime est strictement interdit.
- **Sécurité Physique** : Toute l'infrastructure cloud tierce fonctionne dans des centres de données qui ont obtenu des certifications de sécurité physique telles que ISO 27001.

## Sécurité des Comptes et des Sessions

- **Protection de Connexion** : Nous appliquons des limites de tentatives de connexion et des mécanismes de délai pour bloquer les attaques par force brute automatisées.
- **Gestion de Session** : Les sessions expirent automatiquement après une période d'inactivité, et des notifications sont envoyées pour les changements de compte importants.
- **Authentification à Deux Facteurs** : Nous prévoyons d'introduire la fonctionnalité 2FA à l'avenir.

## Sécurité des Applications

Nous concevons en gardant à l'esprit les meilleures pratiques de sécurité telles que OWASP Top 10 dès la phase de développement.

- **Validation des Entrées** : Des instructions préparées et des ORM sont utilisés pour les requêtes de base de données, et l'entrée de l'utilisateur est validée à la fois côté serveur et côté client.
- **Défense contre les Attaques** : Les jetons CSRF, les attributs de cookie SameSite et la CSP (Politique de Sécurité du Contenu) sont appliqués pour atténuer le détournement de session et les attaques par injection de script.

## Sécurité de la Chaîne d'Approvisionnement Logicielle

- **Gestion des Dépendances** : Les bibliothèques et paquets externes ne sont installés qu'à partir de registres officiels, et les versions vérifiées sont garanties via des fichiers de verrouillage.
- **Vérifications de Vulnérabilité** : Les rapports de vulnérabilité sont régulièrement examinés et les dépendances à haut risque sont prioritaires pour les mises à jour.

## Conservation et Suppression des Données

- **Suppression de Compte** : Lors d'une demande de suppression de compte, les données associées sont détruites définitivement après un délai de grâce de 30 jours (pour la récupération en cas de suppression accidentelle).
- **Données de Sauvegarde** : Les sauvegardes pour la stabilité du système sont conservées pendant un maximum de 90 jours, puis supprimées en toute sécurité. En raison de limitations techniques, la suppression complète des systèmes de sauvegarde peut nécessiter un temps supplémentaire.
- **Données de Journal** : Les journaux d'accès sont conservés pendant 1 an pour l'analyse des menaces de sécurité à long terme et l'identification des tendances.
- **Exception de Conservation Légale** : Les données requises par la loi pour être conservées pendant une période spécifique peuvent être stockées séparément pour la durée applicable.

## Réponse aux Incidents

En cas d'incident de sécurité, nous suivons ces procédures pour une réponse rapide et la minimisation des dommages :

1. **Détection et Confinement (Immédiat)** : Isoler les menaces et prévenir d'autres dommages.
2. **Analyse d'Impact** : Évaluer l'étendue et la gravité le plus rapidement possible, généralement en quelques heures.
3. **Notification aux Utilisateurs** : Pour les incidents affectant les utilisateurs (par exemple, fuites de données), informer les utilisateurs aussi rapidement que possible et respecter les délais légaux (par exemple, 72 heures).
4. **Divulgation Transparente** : Publier un rapport détaillé (cause, actions, mesures préventives) après la résolution de l'incident.

## Audits de Sécurité et Services Tiers

- **Audits de Sécurité** : Nous sommes actuellement en phase de stabilisation du service et effectuons régulièrement des revues de code internes et des contrôles de sécurité. Nous prévoyons d'introduire des audits de sécurité tiers réguliers à mesure que le service évolue.
- **Infrastructure Tierce** : Nous adhérons au principe de ne pas stocker directement d'informations sensibles non chiffrées. Pour les fonctions essentielles comme les paiements et l'authentification, nous utilisons des services de confiance ({{THIRD_PARTY_PROVIDERS}}, etc.) qui ont obtenu des certifications de sécurité reconnues internationalement (SOC 2, ISO 27001) ou subissent régulièrement des évaluations de sécurité équivalentes.

## Recommandations de Sécurité pour les Utilisateurs

La sécurité des comptes est une responsabilité partagée.

- **Mots de Passe Forts** : Utilisez des mots de passe uniques et complexes non utilisés sur d'autres sites.
- **Méfiez-vous du Phishing** : Soyez prudent avec les messages prétendant être des e-mails officiels et vérifiez l'adresse avant de cliquer sur les liens.

## Contact

Si vous avez des questions concernant notre Politique de Sécurité, veuillez nous contacter à [{{EMAIL}}](mailto:{{EMAIL}}).

Pour les rapports de vulnérabilité et les politiques de protection des chercheurs, veuillez consulter notre page [Programme Bug Bounty](/fr/bug-bounty).
