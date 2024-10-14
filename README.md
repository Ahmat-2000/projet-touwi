
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
- **npm** ou **yarn** ou **pnpm** ou **bun**
- **Docker** et **docker-compose** (optionnel)

## Installation

### Cloner le projet

Chaque membre doit cloner le dépôt et se positionner sur sa branche respective. Pour ce faire, suivez les étapes ci-dessous :

```bash
# Cloner le dépôt avec SSH
git clone https://git@github.com/Ahmat-2000/projet-touwi.git

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

### Définitions des variables d'environements
Un .env est defini dans le projet, il est nécessaire de definir un `.env.local` à la racine du projet voici à quoi il doit ressembler (données d'exemple, elles peuvent variés selon les besoins) :

```bash
BACKEND_API_URL=http://localhost:3000/api # http://chronos.touwi.fr/api
DATABASE_URL=mysql://root:root@localhost:3306/chronos
```

## Lancement

### Lancement via Docker

```bash
docker-compose up --build -d
```
Ensuite, ouvrez votre navigateur et allez à l'adresse [http://localhost:3000](http://localhost:3000) pour voir le résultat du frontent et [http://localhost:3000/api/example](http://localhost:3000/api/example) pour voir le résultat du backend.

Si un problème survient lors du developpement, vous pouvez visualiser les logs des conteneurs en utilisant la commande suivante :

```bash
docker-compose logs -f nextjs
```

Une fois fini, faite la commande suivante pour détruire tous les conteneurs :

```bash
docker-compose down
```


### Lancement du Serveur de Développement (Sans Docker et sans base de données)

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

## Déploiement

La branche `main` est automatiquement déployée sur Vercel à chaque pull request fusionnée. Vous pouvez accéder à la version live du projet ici : [https://projet-touwi.vercel.app/](https://projet-touwi.vercel.app/).

