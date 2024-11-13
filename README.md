
# Projet de Labellisation des Signaux

Ce projet est une web app développée avec [Next.js](https://nextjs.org/) pour la labellisation des signaux. 

## Structure des branches

Le projet est divisé en plusieurs branches correspondant aux différentes équipes :

- **team-graphique** : Responsable de la partie UI/UX et design de l'application.
- **team-graphes** : Responsable de la gestion et de la représentation des graphes de données.
- **team-fileSystem** : Responsable de la gestion du système de fichiers et de l'import/export de données.

La branche **main** est protégée contre les push et commit directs. Toute modification doit passer par une pull request (PR).

## Prérequis

- **Docker** et **docker-compose** 

## Installation

### Cloner le projet

```bash
# Cloner le dépôt
git clone https://git@github.com/Ahmat-2000/projet-touwi.git
```

### Définitions des variables d'environements
Vous devez créer un fichier `.env` à la racine du projet et y définir les variables d'environnement suivantes en fonction de votre configuration :

```bash
ENV=( ENVIRONNEMENT ) # development / production
NEXT_PUBLIC_API_URL=( URL_DE_VOTRE_API ) # Ex : http://localhost:3000/api
JWT_SECRET=( SEED_POUR_GERER_LES_JETONS ) # Ex : secret

MYSQL_ROOT_PASSWORD=( MOT_DE_PASSE_COMPLIQUÉ_POUR_ROOT ) # Ex : root (Utilisez root:root dans ce cas pour phpMyAdmin)
MYSQL_PASSWORD=( MOT_DE_PASSE_COMPLIQUÉ_POUR_CHRONOS_USER ) # Ex : chronos_password (Utilisez chronos_user:chronos_password dans ce cas pour phpMyAdmin)

# Ne pas modifier la suite :
MYSQL_DATABASE=chronos
MYSQL_USER=chronos_user

TOKEN_EXPIRATION=3h

DB_HOST=mariadb
DATABASE_URL=mysql://root:${MYSQL_ROOT_PASSWORD}@${DB_HOST}:3306/${MYSQL_DATABASE}
```

## Lancement

### Lancement via Docker

```
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

## Déploiement

La branche `main` est automatiquement déployée sur Vercel à chaque pull request fusionnée. Vous pouvez accéder à la version live du projet ici : [https://projet-touwi.vercel.app/](https://projet-touwi.vercel.app/).

