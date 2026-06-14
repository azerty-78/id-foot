# Guide de démarrage — Football ID

Commandes à exécuter **depuis la racine du projet** (`id-foot/`), sauf indication contraire.

> **Important :** les commandes Prisma (`db:migrate`, `db:generate`, etc.) doivent être lancées **à la racine**, pas depuis `setup/`.  
> Si vous êtes dans `setup/`, utilisez `.\db.ps1 migrate` ou revenez à la racine.

---

## Prérequis

- [Node.js](https://nodejs.org/) 20+
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (pour PostgreSQL)
- Git

---

## Première installation (une seule fois)

### 1. Cloner le projet (si ce n’est pas déjà fait)

```powershell
git clone https://github.com/azerty-78/id-foot.git
cd id-foot
```

### 2. Installer les dépendances Node

```powershell
npm install
```

### 3. Configurer les variables d’environnement

**Fichier `.env` à la racine** (développement local — Next.js + Prisma) :

Créez ou vérifiez le fichier `.env` à la racine avec au minimum :

```env
DATABASE_URL="postgresql://idfoot:VOTRE_MOT_DE_PASSE@localhost:5433/id_foot?schema=public"
NEXTAUTH_SECRET="votre-secret-long-et-aleatoire"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Fichier `setup/.env`** (Docker Compose — base de données) :

```powershell
copy setup\.env.example setup\.env
```

Puis éditez `setup/.env` : mêmes identifiants PostgreSQL (`POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`) que dans `DATABASE_URL`.  
Pour Docker, l’hôte est `db:5432` ; pour le dev local, c’est `localhost:5433`.

> Ne commitez jamais les fichiers `.env`.

### 4. Démarrer la base de données PostgreSQL (Docker)

```powershell
npm run docker:up
```

Vérifier que le conteneur tourne :

```powershell
docker ps
```

Le conteneur `id-foot-db` doit être actif sur le port **5433**.

### 5. Appliquer les migrations Prisma

```powershell
npm run db:migrate
```

Au premier lancement, Prisma peut demander un nom de migration — validez avec Entrée ou donnez un nom (ex. `init`).

### 6. (Optionnel) Ouvrir Prisma Studio pour voir la base

```powershell
npm run db:studio
```

Interface disponible sur [http://localhost:5555](http://localhost:5555).

### 7. Lancer l’application en développement

```powershell
npm run dev
```

Ouvrir dans le navigateur :

| URL | Description |
|-----|-------------|
| [http://localhost:3000](http://localhost:3000) | Accueil |
| [http://localhost:3000/admin/dashboard](http://localhost:3000/admin/dashboard) | Administration |

---

## Lancement habituel (les fois suivantes)

À chaque session de travail, dans l’ordre :

```powershell
# 1. Aller à la racine du projet
cd "C:\Users\Ben Djibril\Desktop\KOBE CORPORATION PROJECT\ID-FOOT\id-foot"

# 2. Démarrer PostgreSQL (si Docker n’est pas déjà lancé)
npm run docker:up

# 3. Lancer Next.js
npm run dev
```

C’est tout. Les migrations ne sont à relancer **que** si le schéma Prisma a changé :

```powershell
npm run db:migrate
```

---

## Commandes utiles

### Base de données (Prisma)

| Commande | Usage |
|----------|--------|
| `npm run db:generate` | Régénérer le client Prisma |
| `npm run db:migrate` | Créer / appliquer une migration (dev) |
| `npm run db:migrate:deploy` | Appliquer les migrations (prod / CI) |
| `npm run db:studio` | Interface visuelle de la base |
| `npm run db:push` | Pousser le schéma sans migration (prototype) |

**Depuis le dossier `setup/` :**

```powershell
cd setup
.\db.ps1 migrate    # ou : generate | deploy | studio | push
```

### Docker

| Commande | Usage |
|----------|--------|
| `npm run docker:up` | Démarrer **uniquement** la base PostgreSQL |
| `npm run docker:down` | Arrêter les conteneurs |
| `npm run docker:logs` | Voir les logs Docker |
| `npm run docker:up:prod` | Build + lancer app + base en production |

### Application

| Commande | Usage |
|----------|--------|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run start` | Démarrer après un build |
| `npm run lint` | Vérification ESLint |

---

## Production Docker (optionnel)

```powershell
# 1. Configurer setup/.env pour la production
# 2. Build et démarrage complets
npm run docker:up:prod

# 3. Arrêter
npm run docker:down
```

Les migrations en prod sont appliquées automatiquement au démarrage du conteneur app (`setup/entrypoint.sh`).

---

## Dépannage rapide

| Problème | Solution |
|----------|----------|
| `Could not find Prisma Schema` | Vous êtes dans `setup/` → revenez à la racine ou utilisez `.\db.ps1 migrate` |
| Connexion refusée à PostgreSQL | `npm run docker:up` puis vérifiez `docker ps` |
| Port 5433 déjà utilisé | Arrêtez l’autre service ou changez le port dans `setup/compose.yaml` |
| Erreur après changement de schéma | `npm run db:migrate` |

---

## Récapitulatif — ordre des commandes

### Première fois

```
npm install
→ configurer .env (racine) + setup/.env
→ npm run docker:up
→ npm run db:migrate
→ npm run dev
```

### Fois suivantes

```
npm run docker:up
→ npm run dev
```
