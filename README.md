# SantéProche — site et backend personnel

Le site React utilise son propre backend Node.js. Il prend en charge PostgreSQL et conserve SQLite pour la compatibilité locale. Node.js 24 minimum est requis. La présence de `DATABASE_URL` sélectionne PostgreSQL ; une connexion PostgreSQL défaillante ne provoque jamais de retour silencieux vers SQLite.

## Lancer le projet

```sh
npm install
npm run dev
```

Site : http://localhost:5173 — Administration : http://localhost:5173/admin.
Le backend démarre en même temps sur http://127.0.0.1:3001. À la première visite de l’administration, créez votre compte avec votre email et un mot de passe de 12 caractères minimum. Cette création initiale est accessible uniquement depuis cet ordinateur. Aucun identifiant par défaut.

## Modifier les données

L’administration permet de créer, modifier et supprimer les pharmacies, cliniques et offres de médicaments : noms, descriptions, adresses, téléphones, horaires, garde, prix, devise, stock et fichiers image JPG/PNG/WEBP. Les médicaments reprennent l’adresse et le téléphone de leur pharmacie pour répercuter un changement partout. Les offres avec un stock nul sont retirées des résultats publics.

Les anciennes fiches sont importées une seule fois comme démonstrations, puis deviennent modifiables. Décochez « Fiche de démonstration » quand une fiche contient vos informations réelles. Le contact du site reste **+235 66566871**, défini dans `src/site.js`.

Les formulaires de contact et les ordonnances sont enregistrés dans « Demandes reçues ». Les images des ordonnances nécessitent une connexion administrateur. Aucun envoi automatique d’email ou de WhatsApp n’est configuré.

## PostgreSQL et migration

Le code est organisé en `server/database.js` (connexions, schéma versionné et transactions), `server/repository.js` (accès au catalogue et initialisation), `server/migration.js` (import vérifié), `server/catalog.js` (recherche) et `server/assistant.js` (assistant). Les routes et la sécurité HTTP restent dans `server/index.js`.

Pour une base PostgreSQL existante **vide**, définir `DATABASE_URL` dans `.env`, garder `LOCAL_POSTGRES=false`, puis arrêter le backend avant de transférer les données :

```sh
npm run db:migrate -- --check
npm run db:migrate
npm run dev
```

`SQLITE_SOURCE` permet de choisir une autre source. La migration ouvre SQLite en lecture seule, conserve les identifiants, le profil et le hash du mot de passe, les demandes et les références de fichiers. Les sessions ne sont pas copiées : reconnectez-vous. Les données sont vérifiées avant validation ; une destination contenant déjà des données est refusée. Conserver le même dossier `DATA_DIR` pour retrouver les fichiers image et les ordonnances.

Pour créer une instance PostgreSQL **locale dédiée au projet**, PostgreSQL doit être installé (`PG_BIN` si ses exécutables sont ailleurs). Arrêter le backend puis exécuter :

```sh
npm run db:local
npm run dev
```

Cette commande crée un cluster séparé dans `server/storage/postgres`, écoute uniquement sur `127.0.0.1`, génère un mot de passe, importe SQLite puis configure `.env` sans afficher les identifiants. Les démarrages suivants relancent cette instance si nécessaire. Elle ne remplace pas le service PostgreSQL déjà installé. `.env` et le stockage restent exclus de Git. Cette instance de développement reste locale : prévoir un serveur PostgreSQL hébergé et des sauvegardes pour la production.

`DB_POOL_SIZE` borne le nombre de connexions (10 par défaut). Les transactions PostgreSQL utilisent une connexion dédiée et les transactions SQLite sont isolées des autres requêtes. Le schéma conserve encore les fiches dans une colonne JSON sérialisée pour migrer sans changer l’API ; la séparation en tables produits/stocks, les requêtes filtrées côté base, les comptes des établissements et le stockage partagé sont des étapes suivantes.

## Stockage et sauvegarde

Vos données sont conservées dans `server/storage/santeproche.sqlite`, les images dans `server/storage/uploads` et les ordonnances dans `server/storage/prescriptions`. Sauvegardez tout le dossier `server/storage` lorsque le serveur est arrêté, y compris les éventuels fichiers SQLite annexes. Ce dossier contient les données et l’accès administrateur.

Avec PostgreSQL, les données actives sont dans la base indiquée par `DATABASE_URL`. Utiliser `pg_dump` pour sauvegarder cette base et sauvegarder également les dossiers `uploads` et `prescriptions`. Une copie du dossier PostgreSQL pendant son fonctionnement ne remplace pas une sauvegarde PostgreSQL cohérente. La migration conserve l’ancienne base SQLite mais elle ne reçoit plus les modifications effectuées après la bascule.

## Version compilée

```sh
npm run build
npm start
```

Le backend sert alors le site et l’administration sur http://127.0.0.1:3001. Le serveur local n’est pas publié sur Internet. Pour héberger, prévoir HTTPS et un stockage persistant. Créez le compte initial localement avant la mise en ligne. Utilisez `NODE_ENV=production` pour les cookies sécurisés, `HOST` et `PORT` pour l’écoute, `DATA_DIR` pour le stockage et `APP_ORIGIN` si le site est sur une autre origine. `SEED_DEMO=false` initialise une nouvelle base vide ; cela ne supprime pas une base déjà créée.

## Vérifier

```sh
npm test
npm run build
```

Les tests utilisent une base temporaire distincte des données du projet.

`npm run test:postgres` crée un cluster temporaire distinct, teste les mêmes parcours HTTP et la migration avec une vraie base PostgreSQL, puis arrête et supprime ce cluster. Il utilise PostgreSQL installé (`PG_BIN` si nécessaire), sans modifier le service local ni le catalogue réel. `npm test` couvre SQLite et l’assistant sans nécessiter PostgreSQL.

## Version GitHub Pages

`npm run build:pages` prépare `dist-pages` pour https://langheu.github.io/santeProche/. Cette publication utilise une navigation compatible avec GitHub Pages et un catalogue fictif en lecture seule. La recherche classique et les images publiques fonctionnent sans serveur. L’administration, les envois de formulaires et l’analyse IA des photos nécessitent le backend ; la démonstration ne simule pas leur succès. La compilation habituelle `npm run build` conserve la connexion au backend du projet.

## Application mobile installable (PWA)

Le bouton « Installer SantéProche », avant le pied de page, utilise l’invite d’installation quand le navigateur la propose. Sinon il affiche les instructions. Sur iPhone/iPad, utiliser Safari → Partager → Sur l’écran d’accueil → Ajouter. L’application utilise le logo du projet et s’ouvre en mode autonome. Aucune APK n’est produite par cette installation.

Les deux commandes de compilation produisent un manifeste et un service worker adaptés à leur adresse (racine pour le backend, `/santeProche/` pour GitHub). Tester une version compilée, servie en HTTPS ou sur localhost : le service worker est désactivé dans le serveur de développement pour éviter de figer les fichiers pendant les modifications. Sur un téléphone, le lien GitHub HTTPS permet l’installation de la démonstration ; localhost désigne le téléphone lui-même.

Après une première ouverture connectée, les fichiers essentiels de l’application peuvent s’ouvrir sans Internet. Un message indique la perte de connexion. Les données API, images des ordonnances et réponses de l’administration ne sont jamais mises en cache par le service worker. Les stocks réels, la localisation distante, les formulaires et l’IA nécessitent leurs services en ligne ; aucun envoi différé n’est simulé. Les photos publiques non précachées peuvent manquer hors connexion. Le catalogue embarqué de GitHub reste explicitement fictif.

Une nouvelle version est signalée avec « Mettre à jour » ; la page ne se recharge qu’après cette action, pour préserver les saisies en cours. L’installation physique dépend du navigateur et de ses critères d’éligibilité.

## Inscription et espace des pharmacies

`/inscription-pharmacie` permet de créer un compte (responsable, email, mot de passe de 12 caractères minimum), de transmettre la fiche et une photo de justificatif professionnel JPG/PNG/WEBP de 4 Mo maximum. La photo publique de l’établissement est optionnelle. Les coordonnées GPS et les horaires sont modifiables ; l’adresse, la ville, le pays et le téléphone sont obligatoires. Les comptes sont stockés dans `partners`, avec des sessions séparées de l’administration (`sp_partner`, cookie HttpOnly, 8 heures). Aucun mot de passe en clair ni clé administrateur n’est transmis au client.

Dans `/admin`, l’onglet « Inscriptions pharmacies » affiche les dossiers et leurs justificatifs privés. Une demande reste invisible dans le catalogue avant approbation. L’administrateur peut approuver, demander des corrections avec un motif, suspendre et réactiver. Une pharmacie suspendue et ses offres sont masquées dans le catalogue, les fiches et l’assistant ; les écritures sont bloquées même si une session existante reste ouverte. La fiche est conservée pour permettre la réactivation. Une pharmacie possédant un compte ne peut pas être supprimée par le formulaire général : utiliser la suspension.

`/espace-pharmacie` permet de se connecter, suivre le statut, corriger et renvoyer un dossier, puis gérer le profil, les horaires, la garde et ses seuls médicaments/prix/stocks/images après validation. Le backend impose l’établissement du compte et refuse les accès aux médicaments d’un autre compte. Les justificatifs sont dans `server/storage/partner-documents` et restent hors du cache PWA ; inclure ce dossier dans les sauvegardes. La migration SQLite → PostgreSQL conserve aussi ces comptes et références, mais ne copie pas leurs sessions.

La validation est manuelle : aucune vérification d’email ni notification automatique n’est simulée. Les statuts se consultent dans l’espace pharmacie avec « Actualiser le statut ». Les limites d’inscription et connexion sont par IP et en mémoire, comme les limites existantes du serveur. En production prévoir une limitation partagée, les sauvegardes et l’hébergement HTTPS du backend. GitHub Pages affiche une notice sans formulaire actif pour éviter des inscriptions fictives. Les liens d’accès sont dans le pied de page et la page « Pour les pharmacies ».

## Profil administrateur

Le bouton « Mon profil » dans l’en-tête permet de modifier le nom, la photo, le téléphone personnel et l’email de connexion. Le téléphone du profil ne change pas le contact public du site. Pour changer l’email ou le mot de passe, le mot de passe actuel est demandé. Le nouveau mot de passe doit contenir au moins 12 caractères. Son changement déconnecte les autres sessions et conserve la session de cet appareil. Les comptes existants reçoivent les nouveaux champs sans remplacement de leurs identifiants.

## Assistant de recherche, photo et voix

La page `/assistant`, accessible depuis le menu et les médicaments, affiche une conversation et des résultats issus du catalogue local. Le micro permet de dicter une demande (vérifier la transcription avant envoi) et une case permet de lire les réponses à voix haute. La dictée dépend de la prise en charge de SpeechRecognition, des permissions du micro et du service de reconnaissance du navigateur. La lecture utilise speechSynthesis. Le navigateur peut transmettre la voix à son service de reconnaissance ; le backend ne reçoit que le texte envoyé. Le clavier reste disponible.

Sans clé IA, la page indique explicitement « Mode recherche classique » et recherche les mots saisis dans les fiches. Aucune reconnaissance photo n’est simulée. Pour activer l’IA, copiez `.env.example` dans `.env`, configurez `OPENAI_API_KEY` uniquement côté serveur et redémarrez `npm run dev`. Ne mettez jamais cette clé dans une variable VITE ou dans GitHub. Le modèle par défaut est `gpt-4.1-mini`, modifiable avec `OPENAI_MODEL`. Les analyses nécessitent un compte API actif et peuvent être facturées par le fournisseur.

Le backend utilise l’API Responses d’OpenAI avec une sortie structurée pour extraire le type de recherche, le nom, le dosage, la ville et le filtre d’ouverture. L’IA ne produit pas les prix ni les pharmacies : les résultats sont recherchés dans la base du projet. Les photos JPG/PNG/WEBP de moins de 10 Mo sont envoyées à OpenAI uniquement après consentement et ne sont pas enregistrées par cette fonctionnalité. Les requêtes utilisent `store: false`. Le produit reconnu est montré dans des champs modifiables et doit être confirmé avant toute recherche. Les règles de conservation du fournisseur restent applicables.

La position est demandée uniquement en cliquant « Utiliser ma position ». Les distances sont calculées à vol d’oiseau. En cas de refus, il est possible de filtrer par ville ou quartier. L’IA n’offre ni diagnostic ni posologie. Limites initiales : 30 appels IA par IP et par heure, 4 simultanés et 200 par jour pour le serveur (`AI_DAILY_LIMIT`). Les compteurs sont en mémoire et se réinitialisent au redémarrage ; prévoir une limitation durable et un budget fournisseur pour un déploiement public.

Documentation : https://developers.openai.com/api/docs/guides/structured-outputs et https://developers.openai.com/api/docs/guides/images-vision.

## Listes géographiques et visibilité des mots de passe

Les formulaires pharmacie proposent Pays → Ville → Quartier, avec des choix lus depuis `GET /api/locations`. « Autre… » permet une saisie libre et les anciennes valeurs restent modifiables. Changer le pays efface la ville et le quartier ; changer la ville efface le quartier. Le quartier est optionnel et enregistré dans la fiche.

L’onglet administrateur « Localisations » ajoute ou retire les choix de référence (`locations`, schéma version 3). Les fiches publiées non fictives complètent également la liste ; retirer un choix ne modifie pas ces fiches. Un premier répertoire partiel du Tchad est initialisé une seule fois, sans imposer de pays par défaut. Sources : https://www.beac.int/pays/tchad/ et https://www.dgi.td/docs/circulaire/circulaire2023.pdf. Les lieux et leur indicateur d’initialisation sont conservés par la migration PostgreSQL.

Chaque champ de mot de passe possède un bouton œil indépendant : le mot de passe est masqué initialement, le bouton affiche ou masque la valeur sans soumettre le formulaire.
