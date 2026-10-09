# SantéProche — site et backend personnel

Le site React utilise le backend Node.js du projet et sa propre base SQLite. Node.js 24 minimum est requis.

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

## Stockage et sauvegarde

Vos données sont conservées dans `server/storage/santeproche.sqlite`, les images dans `server/storage/uploads` et les ordonnances dans `server/storage/prescriptions`. Sauvegardez tout le dossier `server/storage` lorsque le serveur est arrêté, y compris les éventuels fichiers SQLite annexes. Ce dossier contient les données et l’accès administrateur.

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

## Version GitHub Pages

`npm run build:pages` prépare `dist-pages` pour https://langheu.github.io/santeProche/. Cette publication utilise une navigation compatible avec GitHub Pages et un catalogue fictif en lecture seule. La recherche classique et les images publiques fonctionnent sans serveur. L’administration, les envois de formulaires et l’analyse IA des photos nécessitent le backend ; la démonstration ne simule pas leur succès. La compilation habituelle `npm run build` conserve la connexion au backend du projet.

## Profil administrateur

Le bouton « Mon profil » dans l’en-tête permet de modifier le nom, la photo, le téléphone personnel et l’email de connexion. Le téléphone du profil ne change pas le contact public du site. Pour changer l’email ou le mot de passe, le mot de passe actuel est demandé. Le nouveau mot de passe doit contenir au moins 12 caractères. Son changement déconnecte les autres sessions et conserve la session de cet appareil. Les comptes existants reçoivent les nouveaux champs sans remplacement de leurs identifiants.

## Assistant de recherche, photo et voix

La page `/assistant`, accessible depuis le menu et les médicaments, affiche une conversation et des résultats issus du catalogue local. Le micro permet de dicter une demande (vérifier la transcription avant envoi) et une case permet de lire les réponses à voix haute. La dictée dépend de la prise en charge de SpeechRecognition, des permissions du micro et du service de reconnaissance du navigateur. La lecture utilise speechSynthesis. Le navigateur peut transmettre la voix à son service de reconnaissance ; le backend ne reçoit que le texte envoyé. Le clavier reste disponible.

Sans clé IA, la page indique explicitement « Mode recherche classique » et recherche les mots saisis dans les fiches. Aucune reconnaissance photo n’est simulée. Pour activer l’IA, copiez `.env.example` dans `.env`, configurez `OPENAI_API_KEY` uniquement côté serveur et redémarrez `npm run dev`. Ne mettez jamais cette clé dans une variable VITE ou dans GitHub. Le modèle par défaut est `gpt-4.1-mini`, modifiable avec `OPENAI_MODEL`. Les analyses nécessitent un compte API actif et peuvent être facturées par le fournisseur.

Le backend utilise l’API Responses d’OpenAI avec une sortie structurée pour extraire le type de recherche, le nom, le dosage, la ville et le filtre d’ouverture. L’IA ne produit pas les prix ni les pharmacies : les résultats sont recherchés dans SQLite. Les photos JPG/PNG/WEBP de moins de 10 Mo sont envoyées à OpenAI uniquement après consentement et ne sont pas enregistrées par cette fonctionnalité. Les requêtes utilisent `store: false`. Le produit reconnu est montré dans des champs modifiables et doit être confirmé avant toute recherche. Les règles de conservation du fournisseur restent applicables.

La position est demandée uniquement en cliquant « Utiliser ma position ». Les distances sont calculées à vol d’oiseau. En cas de refus, il est possible de filtrer par ville ou quartier. L’IA n’offre ni diagnostic ni posologie. Limites initiales : 30 appels IA par IP et par heure, 4 simultanés et 200 par jour pour le serveur (`AI_DAILY_LIMIT`). Les compteurs sont en mémoire et se réinitialisent au redémarrage ; prévoir une limitation durable et un budget fournisseur pour un déploiement public.

Documentation : https://developers.openai.com/api/docs/guides/structured-outputs et https://developers.openai.com/api/docs/guides/images-vision.
