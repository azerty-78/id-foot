# 🗄️ ID FOOT — Réinitialisation de la base de données

> ⚠️ **ATTENTION** : Ces commandes suppriment **toutes les données** de la base de données de manière irréversible.  
> À n'utiliser qu'en développement, ou en production si tu veux repartir de zéro.

---

## 1. Stopper et supprimer l'application

L'app doit être arrêtée avant de toucher à la DB pour éviter des erreurs de connexion.

```bash
docker stop id-foot-app && docker rm id-foot-app
```

---

## 2. Stopper et supprimer le conteneur PostgreSQL

```bash
docker stop id-foot-db && docker rm id-foot-db
```

---

## 3. Supprimer le volume PostgreSQL

C'est ici que toutes les données sont effacées définitivement.

```bash
docker volume rm id-foot-postgres-data
```

Vérifier que le volume est bien supprimé :

```bash
docker volume ls | grep id-foot
```

> Si la commande ne retourne rien, le volume est bien supprimé ✅

---

## 4. Relancer le conteneur PostgreSQL (volume vierge)

```bash
docker run -d \
  --name id-foot-db \
  --restart unless-stopped \
  --network id-foot-network \
  -e POSTGRES_USER=idfoot \
  -e POSTGRES_PASSWORD='IdFoot_Db_Prod_2026' \
  -e POSTGRES_DB=id_foot \
  -v id-foot-postgres-data:/var/lib/postgresql/data \
  postgres:16-alpine
```

Attendre quelques secondes que PostgreSQL soit prêt :

```bash
sleep 5 && docker logs id-foot-db | tail -5
```

> Tu dois voir `database system is ready to accept connections` ✅

---

## 5. Relancer l'application

L'entrypoint va automatiquement réappliquer toutes les migrations Prisma sur la DB vierge.

```bash
docker run -d \
  --name id-foot-app \
  --restart unless-stopped \
  --network id-foot-network \
  -p 127.0.0.1:4003:3000 \
  --env-file /home/deploy/id-foot/.env \
  -v id-foot-uploads:/usr/src/app/public/uploads \
  azerty78/id-foot:latest
```

---

## 6. Vérifier les logs (migrations + démarrage)

```bash
docker logs -f id-foot-app
```

Tu dois voir :

```
Application des migrations Prisma...
All migrations have been successfully applied.
Demarrage de l'application...
▲ Next.js ...
✓ Ready in 0ms
```

---

## 7. Vérifier que l'app répond

```bash
curl -I http://127.0.0.1:4003/
```

> Résultat attendu : `HTTP/1.1 200 OK` ✅

---

## Commandes en une seule fois (copier-coller rapide)

```bash
# 1. Tout stopper et supprimer
docker stop id-foot-app id-foot-db
docker rm id-foot-app id-foot-db
docker volume rm id-foot-postgres-data

# 2. Relancer la DB
docker run -d \
  --name id-foot-db \
  --restart unless-stopped \
  --network id-foot-network \
  -e POSTGRES_USER=idfoot \
  -e POSTGRES_PASSWORD='IdFoot_Db_Prod_2026' \
  -e POSTGRES_DB=id_foot \
  -v id-foot-postgres-data:/var/lib/postgresql/data \
  postgres:16-alpine

# 3. Attendre que PostgreSQL soit prêt
sleep 5

# 4. Relancer l'app
docker run -d \
  --name id-foot-app \
  --restart unless-stopped \
  --network id-foot-network \
  -p 127.0.0.1:4003:3000 \
  --env-file /home/deploy/id-foot/.env \
  -v id-foot-uploads:/usr/src/app/public/uploads \
  azerty78/id-foot:latest

# 5. Vérifier les logs
docker logs -f id-foot-app
```

---

## Notes importantes

- Le volume `id-foot-uploads` (photos joueurs) **n'est pas supprimé** par ces commandes. Les fichiers uploadés sont préservés. Si tu veux aussi les supprimer : `docker volume rm id-foot-uploads`
- Le réseau `id-foot-network` n'a pas besoin d'être recréé, il existe déjà
- Le fichier `/home/deploy/id-foot/.env` n'est pas touché, il reste en place
- Après réinitialisation, la DB est vierge : toutes les données (joueurs, équipes, etc.) sont perdues
