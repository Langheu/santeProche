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

## Profil administrateur

Le bouton « Mon profil » dans l’en-tête permet de modifier le nom, la photo, le téléphone personnel et l’email de connexion. Le téléphone du profil ne change pas le contact public du site. Pour changer l’email ou le mot de passe, le mot de passe actuel est demandé. Le nouveau mot de passe doit contenir au moins 12 caractères. Son changement déconnecte les autres sessions et conserve la session de cet appareil. Les comptes existants reçoivent les nouveaux champs sans remplacement de leurs identifiants.
