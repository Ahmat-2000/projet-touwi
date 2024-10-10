
# Projet de Labellisation des Signaux

Ce projet est une web app développée avec [Next.js](https://nextjs.org/) pour la labellisation des signaux. 

## Structure des branches

Le projet est divisé en plusieurs branches correspondant aux différentes équipes :

- **team-graphique** : Responsable de la partie UI/UX et design de l'application.
- **team-graphes** : Responsable de la gestion et de la représentation des graphes de données.
- **team-fileSystem** : Responsable de la gestion du système de fichiers et de l'import/export de données.

La branche **main** est protégée contre les push et commit directs. Toute modification doit passer par une pull request (PR).

## Prérequis

- **Next.js** dernière version
- **Node.js 18.18** ou supérieur

## Installation

### Cloner le projet

Chaque membre doit cloner le dépôt et se positionner sur sa branche respective. Pour ce faire, suivez les étapes ci-dessous :

```bash
# Cloner le dépôt avec SSH
git clone https://git@github.com:Ahmat-2000/projet-touwi.git

# Se positionner sur la branche de votre équipe
git checkout team-graphique   # Pour l'équipe graphique
# ou
git checkout team-graphes     # Pour l'équipe graphes
# ou
git checkout team-fileSystem  # Pour l'équipe fileSystem
```

### Installation des dépendances

Une fois sur votre branche, installez les dépendances en utilisant l'une des commandes suivantes selon votre gestionnaire de paquets :

```bash
# Avec npm
npm install

# ou avec yarn
yarn install

# ou avec pnpm
pnpm install

# ou avec bun
bun install
```

## Lancement du Serveur de Développement

Pour démarrer le serveur de développement, utilisez l'une des commandes ci-dessous :

```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
# ou
bun dev
```

Ensuite, ouvrez votre navigateur et allez à l'adresse [http://localhost:3000](http://localhost:3000) pour voir le résultat.

## Lancement via Docker

```bash
docker-compose up -d
```
docker compose up --build --force-recreate --no-dep
Ensuite, ouvrez votre navigateur et allez à l'adresse [http://localhost:3000](http://localhost:3000) pour voir le résultat.

## Déploiement

La branche `main` est automatiquement déployée sur Vercel à chaque pull request fusionnée. Vous pouvez accéder à la version live du projet ici : [https://projet-touwi.vercel.app/](https://projet-touwi.vercel.app/).

