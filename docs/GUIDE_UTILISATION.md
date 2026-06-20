# Guide d'utilisation — ID FOOT

**Version du document :** 1.0  
**Application :** ID FOOT — gestion de licences joueurs et contrôle d'accès par QR code  
**Public visé :** administrateurs de compétition, gestionnaires, contrôleurs (scan uniquement)

> Ce guide décrit l'utilisation fonctionnelle de l'application. Pour l'installation technique (développement, Docker, base de données), voir [DEMARRAGE.md](./DEMARRAGE.md).  
> Les captures d'écran sont à placer dans le dossier `docs/images/` en respectant la numérotation (`img_1.png`, `img_2.png`, etc.). Un inventaire complet figure en fin de document.

---

## Table des matières

1. [Présentation générale](#1-présentation-générale)
2. [Qui fait quoi ? — Les rôles](#2-qui-fait-quoi--les-rôles)
3. [Accéder à l'application](#3-accéder-à-lapplication)
4. [Le site public](#4-le-site-public)
5. [Créer une compétition](#5-créer-une-compétition)
6. [Se connecter à l'administration](#6-se-connecter-à-ladministration)
7. [Vue d'ensemble de l'interface admin](#7-vue-densemble-de-linterface-admin)
8. [Le tableau de bord (Dashboard)](#8-le-tableau-de-bord-dashboard)
9. [Gérer sa compétition](#9-gérer-sa-compétition)
10. [Gérer les équipes](#10-gérer-les-équipes)
11. [Gérer les joueurs](#11-gérer-les-joueurs)
12. [Les cartes licence et les QR codes](#12-les-cartes-licence-et-les-qr-codes)
13. [Le scanner QR (contrôle sur le terrain)](#13-le-scanner-qr-contrôle-sur-le-terrain)
14. [Le mode « Scan uniquement »](#14-le-mode-scan-uniquement)
15. [La page de vérification publique `/scan`](#15-la-page-de-vérification-publique-scan)
16. [Le profil et la gestion des utilisateurs](#16-le-profil-et-la-gestion-des-utilisateurs)
17. [Sessions, sécurité et bonnes pratiques](#17-sessions-sécurité-et-bonnes-pratiques)
18. [Utilisation sur mobile](#18-utilisation-sur-mobile)
19. [Scénarios pas à pas](#19-scénarios-pas-à-pas)
20. [Questions fréquentes](#20-questions-fréquentes)
21. [Annexes](#21-annexes)
22. [Inventaire des captures d'écran](#22-inventaire-des-captures-décran)

---

## 1. Présentation générale

**ID FOOT** est une plateforme de gestion de compétitions de football qui permet de :

- **Enregistrer** des équipes et des joueurs pour un tournoi ou un championnat ;
- **Générer** des cartes licence personnalisées (format carte bancaire) avec photo et QR code unique ;
- **Contrôler l'accès** sur le terrain en scannant le QR code de chaque joueur ;
- **Vérifier** une licence depuis un smartphone, après connexion sécurisée.

Chaque joueur possède un **QR code unique** lié à sa fiche. Lors d'un scan réussi, l'application confirme que la licence est valide et que le joueur appartient bien à la compétition concernée.

### Schéma du parcours type

```
Création compétition → Ajout équipes → Ajout joueurs → Génération cartes
                                                              ↓
                                                    Scan QR sur le terrain
```

![img_1 — Schéma ou accueil du site ID FOOT](./images/img_1.png)

---

## 2. Qui fait quoi ? — Les rôles

L'application distingue plusieurs types de comptes. Chaque personne ne voit et ne peut modifier que ce que son rôle autorise.

### 2.1 Administrateur de compétition (`ADMIN`)

C'est le **propriétaire** ou responsable principal d'une compétition.

| Peut faire | Ne peut pas faire |
|------------|-------------------|
| Tout ce qu'un gestionnaire peut faire | Gérer les compétitions des autres organisations |
| Modifier les paramètres de **sa** compétition (nom, logo, abréviation, etc.) | — |
| Créer, modifier, désactiver et supprimer des **gestionnaires** | — |
| Réinitialiser le mot de passe d'un gestionnaire | — |
| Supprimer sa compétition (action irréversible) | — |

> Un administrateur est toujours rattaché à **une seule compétition**.

![img_2 — Tableau récapitulatif des rôles (schéma ou capture admin profil)](./images/img_2.png)

### 2.2 Gestionnaire (`MANAGER`)

Personne chargée de l'exploitation quotidienne : saisie des joueurs, impression des cartes, scan sur le terrain.

| Peut faire | Ne peut pas faire |
|------------|-------------------|
| Consulter le tableau de bord | Modifier les paramètres de la compétition |
| Créer / modifier / supprimer équipes et joueurs | Créer d'autres comptes utilisateurs |
| Générer et télécharger les cartes licence | Accéder au menu « Compétitions » (modification) |
| Utiliser le scanner QR | — |
| Modifier son propre profil et mot de passe | — |

### 2.3 Gestionnaire « Scan uniquement » (`scanOnly`)

Variante du gestionnaire, conçue pour les **contrôleurs sur le terrain** (stewards, bénévoles).

| Peut faire | Ne peut pas faire |
|------------|-------------------|
| Scanner des QR codes | Voir la liste des joueurs |
| Changer son mot de passe | Voir les fiches joueurs ou les cartes détaillées |
| Se déconnecter | Modifier les équipes ou les effectifs |
| | Utiliser la recherche manuelle dans le scanner |

Après connexion, ce compte est **redirigé automatiquement** vers le scanner. L'interface est volontairement réduite : seuls **Scanner** et **Profil** sont accessibles.

![img_3 — Interface scan uniquement : navigation réduite](./images/img_3.png)

### 2.4 Super administrateur (`SUPER_ADMIN`)

Rôle réservé à la **supervision de la plateforme** (équipe technique KOBE Corporation). Accès global à toutes les compétitions. Ce rôle n'est pas destiné aux organisateurs de tournois au quotidien.

### 2.5 Tableau comparatif rapide

| Fonctionnalité | Admin | Gestionnaire | Scan uniquement |
|----------------|:-----:|:------------:|:---------------:|
| Dashboard | ✅ | ✅ | ❌ (→ scanner) |
| Compétitions (modifier) | ✅ | ❌ | ❌ |
| Équipes | ✅ | ✅ | ❌ |
| Joueurs | ✅ | ✅ | ❌ |
| Cartes licence | ✅ | ✅ | ❌ |
| Scanner QR | ✅ | ✅ | ✅ |
| Profil (nom) | ✅ | ✅ | ❌ (lecture seule) |
| Mot de passe | ✅ | ✅ | ✅ |
| Gérer les gestionnaires | ✅ | ❌ | ❌ |

---

## 3. Accéder à l'application

### URL principale

En production : **https://id-foot.kobecorporation.com**  
En développement local : **http://localhost:3000**

### Points d'entrée

| URL | Usage |
|-----|-------|
| `/` | Page d'accueil publique |
| `/[slug-competition]` | Page publique d'une compétition (ex. `/championnat-ete-2026`) |
| `/admin/signin` | Connexion à l'espace d'administration |
| `/creer-competition` | Inscription d'une nouvelle compétition |
| `/admin` | Espace d'administration (redirige vers le dashboard) |

---

## 4. Le site public

### 4.1 Page d'accueil (`/`)

La page d'accueil présente :

- Le **positionnement** d'ID FOOT (gestion de licences, QR code, contrôle d'accès) ;
- La liste des **compétitions actives** accessibles publiquement ;
- Un lien vers **Créer une compétition** ;
- Une section **Comment ça marche** expliquant le parcours en quelques étapes.

![img_4 — Page d'accueil ID FOOT](./images/img_4.png)

**Actions possibles depuis l'accueil :**

1. Cliquer sur une compétition pour accéder à sa page dédiée ;
2. Cliquer sur **Créer une compétition** pour s'inscrire comme organisateur ;
3. Cliquer sur **Connexion** (ou aller sur `/admin/signin`) si vous avez déjà un compte.

### 4.2 Page d'une compétition (`/[slug]`)

Chaque compétition dispose d'une **page publique** identifiable par son slug (adresse web courte dérivée du nom).

Exemple : une compétition nommée « Championnat Inter Village 2026 » peut être accessible via `/championnat-inter-village-2026`.

Sur cette page, un visiteur voit :

- Le nom, l'année et le lieu du tournoi ;
- Le logo de la compétition (si renseigné) ;
- Un bouton **Se connecter** qui ouvre la page de connexion **contextualisée** à cette compétition.

![img_5 — Page publique d'une compétition](./images/img_5.png)

> Si vous êtes déjà connecté avec un compte ayant accès à cette compétition, vous êtes redirigé automatiquement vers le tableau de bord admin.

---

## 5. Créer une compétition

Toute nouvelle organisation peut s'inscrire **sans intervention préalable** de l'équipe technique.

### 5.1 Accès

Menu **Créer une compétition** depuis l'accueil, ou URL directe : `/creer-competition`.

![img_6 — Formulaire de création de compétition](./images/img_6.png)

### 5.2 Informations à renseigner

#### Compétition

| Champ | Obligatoire | Description |
|-------|:-----------:|-------------|
| **Nom** | ✅ | Nom complet du tournoi ou championnat |
| **Abréviation** | ❌ | 2 à 12 caractères (ex. `CIV`). Générée automatiquement depuis le nom si laissée vide |
| **Année** | ✅ | Année de la compétition |
| **Lieu** | ✅ | Ville ou site d'accueil |
| **Image / logo** | ❌ | Logo affiché sur la page publique et les cartes licence |

#### Propriétaire (compte administrateur)

| Champ | Obligatoire | Description |
|-------|:-----------:|-------------|
| **Nom** | ✅ | Nom du responsable |
| **E-mail** | ✅ | Identifiant de connexion (unique) |
| **Mot de passe** | ✅ | Minimum 8 caractères |
| **Confirmation** | ✅ | Doit correspondre au mot de passe |

### 5.3 Après la création

1. La compétition est créée avec un **slug** unique (adresse web) ;
2. Un compte **Administrateur** est créé et lié à cette compétition ;
3. Vous êtes **connecté automatiquement** ;
4. Vous arrivez sur le **tableau de bord** admin.

> Conservez précieusement l'e-mail et le mot de passe du propriétaire : ils servent à toutes les connexions futures.

![img_7 — Redirection vers le dashboard après création](./images/img_7.png)

---

## 6. Se connecter à l'administration

### 6.1 Connexion standard

1. Ouvrir `/admin/signin` (ou cliquer **Connexion** depuis l'accueil) ;
2. Saisir **e-mail** et **mot de passe** ;
3. Cliquer **Se connecter** ;
4. Vous êtes redirigé vers le **Dashboard** (`/admin/dashboard`).

![img_8 — Page de connexion](./images/img_8.png)

### 6.2 Connexion depuis une page compétition

Depuis la page publique d'une compétition, le bouton **Se connecter** ouvre :

`/admin/signin?competition=[slug]`

L'écran affiche le **branding de la compétition** (nom, logo). Seuls les comptes rattachés à cette compétition peuvent se connecter (sauf super admin).

![img_9 — Connexion contextualisée à une compétition](./images/img_9.png)

### 6.3 Connexion après scan d'un QR code

Si quelqu'un scanne un QR code sans être connecté, il est invité à se connecter avec un message du type **« Connexion pour vérifier une licence »**. Après connexion, il revient automatiquement sur la page de vérification du joueur scanné.

![img_10 — Écran de connexion requis pour vérifier une licence](./images/img_10.png)

### 6.4 Mot de passe oublié

Il n'existe **pas** de récupération automatique par e-mail. Le message affiché est :

> *« Mot de passe oublié ? Contactez l'administrateur de votre compétition. »*

L'administrateur peut réinitialiser le mot de passe d'un gestionnaire depuis **Profil → Gestion des utilisateurs**.

### 6.5 Déconnexion

- Menu **Profil** → bouton **Se déconnecter** ;
- Ou URL directe : `/admin/signout`.

---

## 7. Vue d'ensemble de l'interface admin

L'espace d'administration partage une mise en page commune : **barre latérale** (desktop) ou **menu hamburger + barre du bas** (mobile), **en-tête** et **zone de contenu**.

### 7.1 Barre latérale (desktop)

Fond bleu marine, largeur fixe. Deux zones :

**Navigation principale :**
- Dashboard
- Compétitions *(administrateurs uniquement)*
- Équipes
- Joueurs

**Outils :**
- Profil
- Scanner QR *(mis en avant, couleur verte)*

![img_11 — Barre latérale desktop](./images/img_11.png)

La barre peut être **réduite** (icônes seules) ; la préférence est mémorisée dans le navigateur.

En bas de la sidebar : lien **Retour à l'accueil** (masqué en mode scan uniquement).

### 7.2 En-tête

- **Desktop** : titre de la page en cours + nom de la compétition ;
- **Mobile** : barre sombre avec icône et titre de la section active.

### 7.3 Navigation mobile (barre du bas)

Sur smartphone et tablette, une barre fixe en bas de l'écran donne accès aux sections principales (maximum 5 entrées). Le bouton **Scanner** est mis en avant visuellement.

![img_12 — Navigation mobile (barre du bas)](./images/img_12.png)

> Sur la page Scanner (hors mode scan uniquement), la barre du bas est masquée pour laisser plus d'espace à la caméra.

### 7.4 Codes couleur (repères visuels)

| Élément | Couleur |
|---------|---------|
| Fond général admin | Gris clair |
| Sidebar | Bleu marine |
| Boutons d'action / focus | Vert |
| Cartes et tableaux | Blanc |

---

## 8. Le tableau de bord (Dashboard)

**Chemin :** `/admin/dashboard`  
**Accessible par :** Administrateur, Gestionnaire *(pas en mode scan uniquement)*

Le dashboard affiche des **indicateurs clés** de votre compétition :

| Indicateur | Signification |
|------------|---------------|
| Compétitions / Tournois actifs | Nombre de compétitions visibles (1 pour un admin classique) |
| Équipes | Nombre de clubs enregistrés |
| Joueurs | Effectif total |
| Sans photo | Joueurs dont la photo est manquante (profils incomplets) |

![img_13 — Tableau de bord avec statistiques](./images/img_13.png)

**Utilisation :** point de départ après connexion pour évaluer l'avancement de la saisie avant un événement.

---

## 9. Gérer sa compétition

**Chemin :** `/admin/competitions`  
**Modification :** Administrateur uniquement  
**Consultation :** Un gestionnaire peut parfois accéder en lecture seule via l'URL, sans boutons d'action.

### 9.1 Paramètres modifiables

| Champ | Description |
|-------|-------------|
| **Nom** | Nom affiché partout (admin, page publique, cartes) |
| **Abréviation** | Sigle 2–12 caractères (ex. `LDF`, `CIV`). Utilisé sur les cartes si « Full control » est activé |
| **Année** | Année de l'édition |
| **Lieu** | Lieu de la compétition |
| **Image / logo** | Logo de la compétition |
| **Full control** | Option avancée de branding (voir ci-dessous) |

![img_14 — Formulaire de modification d'une compétition](./images/img_14.png)

### 9.2 L'option « Full control »

Cette option contrôle le **badge de marque** sur les cartes licence :

| Full control | Badge sur la carte |
|:------------:|-------------------|
| **Désactivé** (défaut) | **ID FOOT** — marque de la plateforme |
| **Activé** | **Abréviation** de votre compétition (ex. `CIV`) |

Activez « Full control » si vous souhaitez que vos cartes portent exclusivement l'identité visuelle de **votre** tournoi (logo compétition dans le QR, abréviation en en-tête de carte).

![img_15 — Comparaison carte avec / sans Full control](./images/img_15.png)

### 9.3 Supprimer une compétition

Action **irréversible** réservée à l'administrateur. La suppression entraîne la suppression en cascade de :

- Toutes les **équipes** ;
- Tous les **joueurs** ;
- Tous les **comptes gestionnaires** liés.

Une confirmation est demandée avant exécution. L'administrateur est ensuite déconnecté et redirigé vers l'accueil.

> ⚠️ **À n'utiliser qu'en fin de compétition ou en cas d'erreur de création.** Exportez ou archivez vos cartes PDF avant suppression.

---

## 10. Gérer les équipes

**Chemin :** `/admin/teams`  
**Accessible par :** Administrateur et Gestionnaire

### 10.1 Liste des équipes

La page affiche toutes les équipes (clubs) de la compétition. Pour chaque équipe : nom, logo, nombre de joueurs.

![img_16 — Liste des équipes](./images/img_16.png)

### 10.2 Créer une équipe

1. Cliquer sur **Nouvelle équipe** (ou équivalent) ;
2. Renseigner le **nom** du club ;
3. *(Optionnel)* Ajouter un **logo** ;
4. Enregistrer.

![img_17 — Formulaire de création d'équipe](./images/img_17.png)

### 10.3 Modifier ou supprimer une équipe

- **Modifier** : changer le nom ou le logo ;
- **Supprimer** : supprime l'équipe. Vérifiez qu'aucun joueur n'y est encore rattaché, ou réaffectez-les avant suppression.

### 10.4 Panneau des joueurs d'une équipe

En sélectionnant une équipe dans la liste, un panneau latéral (ou une section) affiche les **joueurs** de ce club pour un accès rapide à leurs fiches.

![img_18 — Détail équipe avec liste des joueurs](./images/img_18.png)

---

## 11. Gérer les joueurs

**Chemin :** `/admin/players`  
**Accessible par :** Administrateur et Gestionnaire

### 11.1 Liste des joueurs

La liste permet de :

- **Rechercher** par nom ou prénom ;
- **Filtrer** par équipe ;
- Accéder à la **fiche** d'un joueur ;
- **Télécharger** la carte PDF individuelle ;
- **Supprimer** un joueur.

**Affichage :**
- **Desktop** : tableau avec colonnes (nom, équipe, poste, n° maillot, etc.) ;
- **Mobile** : cartes empilées.

![img_19 — Liste des joueurs (vue tableau)](./images/img_19.png)

### 11.2 Ajouter un joueur

**Chemin :** `/admin/players/new`

| Champ | Obligatoire | Notes |
|-------|:-----------:|-------|
| **Prénom** | ✅ | |
| **Nom** | ✅ | |
| **Date de naissance** | ❌ | Format date |
| **Nationalité** | ❌ | |
| **Sexe** | ❌ | Masculin / Féminin (défaut : Masculin) |
| **Téléphone** | ❌ | Avec indicatif pays |
| **N° de maillot** | ❌ | Numéro sur le maillot |
| **Poste** | ❌ | Liste prédéfinie (voir annexe) |
| **Équipe** | ✅ | Sélection dans les équipes existantes |
| **Photo** | ✅ | **Obligatoire** — apparaît sur la carte licence |

![img_20 — Formulaire d'ajout d'un joueur](./images/img_20.png)

À l'enregistrement :

- Une **fiche joueur** est créée ;
- Un **QR code unique** (`qrToken`) est généré automatiquement ;
- Le joueur apparaît dans la liste et peut faire l'objet d'une carte licence.

### 11.3 Fiche joueur

**Chemin :** `/admin/players/[id]`

La fiche regroupe :

- **Identité** : photo, nom, prénom, date de naissance, nationalité, sexe, téléphone ;
- **Sportif** : poste, numéro de maillot, équipe ;
- **Carte licence** : aperçu visuel de la carte ;
- **Actions** :
  - **Modifier** la fiche ;
  - **Télécharger** la carte en PDF ;
  - **Imprimer** la carte ;
  - **Ouvrir** la carte web (`/player-card/[id]`) ;
  - **Supprimer** le joueur.

![img_21 — Fiche joueur complète](./images/img_21.png)

### 11.4 Modifier un joueur

**Chemin :** `/admin/players/[id]/edit`

Mêmes champs que la création. La photo peut être remplacée. Le QR code **ne change pas** tant que le joueur n'est pas recréé (le token reste le même).

![img_22 — Formulaire de modification joueur](./images/img_22.png)

---

## 12. Les cartes licence et les QR codes

### 12.1 À quoi sert une carte licence ?

Chaque joueur reçoit une carte au format **carte bancaire** (85,6 × 53,98 mm) contenant :

- Sa **photo** ;
- Son **nom** et **prénom** ;
- Son **club** (équipe) ;
- Son **poste** et **numéro de maillot** ;
- Un **QR code** unique ;
- Un **badge de marque** (ID FOOT ou abréviation compétition selon « Full control »).

![img_23 — Aperçu d'une carte licence](./images/img_23.png)

### 12.2 Page « Cartes licences »

**Chemin :** `/admin/players/cards`

Cette page centralise la **production des cartes** :

- Aperçu de toutes les cartes de la compétition (ou filtrées) ;
- **Téléchargement PDF** carte par carte ;
- **Export PDF en lot** (toutes les cartes sélectionnées ou l'effectif complet).

![img_24 — Page Cartes licences avec export PDF](./images/img_24.png)

**Boutons usuels :**
- **Télécharger** / **Tout PDF** (libellés raccourcis sur mobile) ;
- Filtre par équipe si disponible.

### 12.3 Carte web imprimable (lien public)

**Chemin :** `/player-card/[id]`

Page **publique** (sans connexion) affichant la carte en taille réelle, optimisée pour l'impression navigateur. Utile pour une impression rapide sans passer par le PDF.

![img_25 — Carte licence imprimable dans le navigateur](./images/img_25.png)

### 12.4 Le QR code

Chaque QR code pointe vers :

```
https://[domaine]/scan/[token-unique]
```

| Contexte | Comportement |
|----------|--------------|
| Scan avec l'appareil photo du téléphone | Ouvre la page `/scan/[token]` dans le navigateur |
| Scanner intégré admin (`/admin/scanner`) | Vérification instantanée dans l'interface admin |
| API directe (`/api/qr/[token]`) | Réponse JSON pour les intégrations techniques |

Le QR peut afficher le **logo de la compétition** au centre (si logo renseigné et full control activé), sinon le logo ID FOOT.

![img_26 — Zoom sur le QR code d'une carte](./images/img_26.png)

---

## 13. Le scanner QR (contrôle sur le terrain)

**Chemin :** `/admin/scanner`  
**Accessible par :** Tous les rôles connectés (y compris scan uniquement)

C'est l'outil principal le **jour de la compétition** pour vérifier l'identité des joueurs à l'entrée du terrain, au vestiaire ou au bureau de contrôle.

### 13.1 Démarrer une session de scan

1. Ouvrir **Scanner QR** depuis la sidebar ou la barre mobile ;
2. **Autoriser l'accès à la caméra** lorsque le navigateur le demande *(obligatoire, surtout sur mobile)* ;
3. Pointer la caméra vers le QR code sur la carte du joueur ;
4. Le scan est traité automatiquement.

![img_27 — Interface scanner avec cadre QR](./images/img_27.png)

> Sur mobile, un **geste utilisateur** (tap sur « Activer la caméra ») est souvent requis avant l'accès caméra — c'est une exigence des navigateurs, pas un bug.

### 13.2 Scan réussi (compte normal)

L'écran affiche un **overlay de succès** :

- Message : **« Accès au joueur autorisée »** / **« Licence valide · participation confirmée »** ;
- **Carte d'identité** du joueur (photo, nom, club, poste, n° maillot) ;
- Boutons :
  - **Scanner le suivant** *(raccourci clavier : Entrée)* ;
  - **Carte** / **Identité** : basculer entre aperçu carte licence et fiche identité ;
  - **Fiche** : ouvrir la fiche complète du joueur ;
- Compteur : *« X joueur(s) validé(s) cette session »*.

![img_28 — Overlay de succès après scan](./images/img_28.png)

### 13.3 Scan en erreur

Si le QR est invalide, expiré, ou le joueur n'appartient pas à votre compétition :

- Un **message d'erreur** s'affiche brièvement (~2 secondes) ;
- Un **son d'erreur** peut être émis ;
- Le scanner reste actif pour le scan suivant.

![img_29 — Message d'erreur de scan](./images/img_29.png)

### 13.4 Recherche manuelle (mode secours)

Si la caméra ne fonctionne pas ou le QR est abîmé :

1. Cliquer sur **Secours** ;
2. Rechercher le joueur **par nom** ;
3. Sélectionner le joueur dans les résultats.

> **Indisponible** en mode scan uniquement.

![img_30 — Recherche manuelle dans le scanner](./images/img_30.png)

### 13.5 Bandeau des scans récents

En bas de l'écran, un bandeau liste les **derniers joueurs scannés** pendant la session en cours. Utile pour vérifier rapidement qui vient de passer.

![img_31 — Bandeau des scans récents](./images/img_31.png)

### 13.6 Bonnes pratiques terrain

- Utiliser un **smartphone ou tablette** avec bonne connectivité ;
- Prévoir une **batterie externe** ;
- Tester la caméra **avant l'ouverture des portes** ;
- Imprimer les cartes **à l'avance** et vérifier que les QR sont lisibles ;
- Créer des comptes **scan uniquement** pour les bénévoles (pas d'accès aux données sensibles).

---

## 14. Le mode « Scan uniquement »

### 14.1 Quand l'utiliser ?

Pour les personnes qui n'ont besoin que de **valider des entrées** sans consulter les effectifs :

- Agents de sécurité ;
- Bénévoles à l'accueil ;
- Contrôleurs sur un site isolé du bureau d'organisation.

### 14.2 Comment créer un compte scan uniquement ?

1. Se connecter en tant qu'**Administrateur** ;
2. Aller dans **Profil → Gestion des utilisateurs** ;
3. Créer un nouveau gestionnaire ;
4. Cocher **« Scan uniquement »** ;
5. Enregistrer et communiquer les identifiants au contrôleur.

![img_32 — Case à cocher Scan uniquement lors de la création](./images/img_32.png)

### 14.3 Expérience du contrôleur

| Élément | Comportement |
|---------|--------------|
| Après connexion | Redirection automatique vers `/admin/scanner` |
| Navigation | Scanner + Profil uniquement |
| Overlay de succès | **Minimal** : « Joueur authentifié » — pas de photo, pas de fiche |
| Profil | Nom/e-mail en lecture seule ; changement de mot de passe possible |
| Mention | *« Compte contrôleur · accès limité au scanner QR »* |

![img_33 — Overlay minimal scan uniquement](./images/img_33.png)

![img_34 — Profil d'un compte scan uniquement](./images/img_34.png)

### 14.4 Modifier ou révoquer l'accès

L'administrateur peut à tout moment :

- **Décocher** « Scan uniquement » → le gestionnaire retrouve l'accès complet *(session actuelle déconnectée)* ;
- **Désactiver** le compte → connexion impossible ;
- **Supprimer** le compte.

---

## 15. La page de vérification publique `/scan`

**Chemin :** `/scan/[token]`  
**Usage :** Vérification d'une licence via le QR imprimé sur la carte (hors interface admin)

### 15.1 Parcours

```
Scan QR avec téléphone
        ↓
Page /scan/[token]
        ↓
   Connecté ? ──Non──→ Écran « Connexion requise »
        │
       Oui
        ↓
   Bonne compétition ? ──Non──→ « Accès refusé »
        │
       Oui
        ↓
   « Licence valide » + infos joueur
```

![img_35 — Page licence valide (/scan)](./images/img_35.png)

![img_36 — Écran connexion requise pour /scan](./images/img_36.png)

![img_37 — Accès refusé (mauvaise compétition)](./images/img_37.png)

### 15.2 Différence avec le scanner admin

| | Scanner admin | Page `/scan` |
|---|---------------|--------------|
| Contexte | Interface dédiée, caméra intégrée | Ouverture via appareil photo / lien |
| Public | Staff connecté | Toute personne connectée autorisée |
| Vitesse | Optimisé pour enchaîner les scans | Vérification ponctuelle |
| Détails affichés | Complets (sauf scan uniquement) | Résumé + lien fiche |

---

## 16. Le profil et la gestion des utilisateurs

**Chemin :** `/admin/profil`

### 16.1 Section « Mon compte »

| Champ | Modifiable par |
|-------|----------------|
| **Nom** | L'utilisateur *(sauf scan uniquement : lecture seule)* |
| **E-mail** | Lecture seule (contactez l'admin pour changer) |
| **Rôle** | Affiché (Administrateur / Gestionnaire) |
| **Statut** | Actif / Inactif (affiché) |

![img_38 — Section Mon compte](./images/img_38.png)

### 16.2 Section « Mot de passe »

Accessible à **tous** les rôles (y compris scan uniquement) :

1. Saisir le **mot de passe actuel** ;
2. Saisir le **nouveau mot de passe** (min. 8 caractères) ;
3. **Confirmer** le nouveau mot de passe ;
4. Enregistrer.

![img_39 — Changement de mot de passe](./images/img_39.png)

### 16.3 Section « Gestion des utilisateurs » (administrateurs)

Visible uniquement pour les **administrateurs** de compétition.

#### Créer un gestionnaire

1. Cliquer **Nouveau gestionnaire** ;
2. Renseigner nom, e-mail, mot de passe ;
3. *(Optionnel)* Cocher **Scan uniquement** ;
4. Enregistrer.

#### Actions sur un gestionnaire existant

| Action | Description |
|--------|-------------|
| **Modifier** | Nom, e-mail, option scan uniquement |
| **Réinitialiser le mot de passe** | Définir un nouveau mot de passe (sans connaître l'ancien) |
| **Activer / Désactiver** | Bloque la connexion si inactif |
| **Supprimer** | Supprime définitivement le compte |

> Vous ne pouvez pas vous désactiver ou vous supprimer vous-même.

![img_40 — Liste des gestionnaires](./images/img_40.png)

![img_41 — Formulaire nouveau gestionnaire](./images/img_41.png)

---

## 17. Sessions, sécurité et bonnes pratiques

### 17.1 Durée de session

- Une session reste active **1 heure** sans activité prolongée ;
- Au-delà, une nouvelle connexion est requise.

### 17.2 Un seul appareil à la fois

À chaque **nouvelle connexion** sur un appareil, les sessions précédentes sont **invalidées**. Seule la dernière connexion reste active.

> Si un gestionnaire se connecte sur un second téléphone, le premier est déconnecté automatiquement.

### 17.3 Compte désactivé

Si l'administrateur désactive un compte, l'utilisateur est **déconnecté immédiatement** et ne peut plus se reconnecter tant que le compte n'est pas réactivé.

### 17.4 Changement du mode scan uniquement

Si l'administrateur modifie le flag « Scan uniquement » d'un gestionnaire, ses sessions en cours sont **invalidées** (reconnexion nécessaire).

### 17.5 Recommandations

- Utiliser des **mots de passe forts** (8 caractères minimum, lettres + chiffres) ;
- Ne **jamais partager** le compte administrateur ;
- Créer un compte **par personne** (traçabilité) ;
- Utiliser **scan uniquement** pour les bénévoles ;
- **Désactiver** les comptes en fin de compétition plutôt que les laisser actifs.

---

## 18. Utilisation sur mobile

ID FOOT est **responsive** et utilisable sur smartphone pour le scan terrain.

| Fonction | Mobile | Desktop |
|--------|--------|---------|
| Navigation | Barre du bas + menu hamburger | Sidebar fixe |
| Liste joueurs | Cartes | Tableau |
| Scanner | Plein écran, cadre QR adapté | Cadre centré |
| Boutons | Libellés courts (« Nouveau », « Cartes ») | Libellés complets |
| Sidebar | Tiroir overlay | Toujours visible |

![img_42 — Vue mobile du scanner](./images/img_42.png)

![img_43 — Vue mobile liste joueurs](./images/img_43.png)

**Conseil :** ajoutez le site à l'**écran d'accueil** de votre téléphone (iOS : Partager → Sur l'écran d'accueil ; Android : Menu → Ajouter à l'écran d'accueil) pour un accès rapide le jour J.

---

## 19. Scénarios pas à pas

### Scénario A — Lancer une nouvelle compétition (organisateur)

1. Aller sur `/creer-competition` ;
2. Remplir les infos compétition + compte propriétaire ;
3. Valider → arrivée sur le dashboard ;
4. **Équipes** : créer tous les clubs participants ;
5. **Joueurs** : saisir les effectifs (photo obligatoire) ;
6. **Cartes licences** : exporter les PDF et imprimer ;
7. Distribuer les cartes aux joueurs ;
8. Le jour J : ouvrir **Scanner QR** et contrôler les entrées.

### Scénario B — Préparer des comptes pour le staff

1. Admin → **Profil → Gestion des utilisateurs** ;
2. Créer un gestionnaire **complet** pour le secrétariat (saisie joueurs) ;
3. Créer un ou plusieurs comptes **scan uniquement** pour les contrôleurs ;
4. Communiquer identifiants + URL de connexion ;
5. Demander à chacun de **changer son mot de passe** à la première connexion.

### Scénario C — Jour de match : contrôle d'accès

1. Contrôleur se connecte (compte scan uniquement → scanner direct) ;
2. Joueur présente sa carte licence ;
3. Scan du QR → « Joueur authentifié » ;
4. **Entrée** ou bouton **Scanner le suivant** pour le joueur suivant ;
5. En cas de QR illisible : gestionnaire avec compte complet utilise **Secours** (recherche par nom).

### Scénario D — Ajouter un joueur de dernière minute

1. **Joueurs → Nouveau** ;
2. Remplir la fiche + photo ;
3. Enregistrer ;
4. Depuis la fiche : **Télécharger PDF** ou aller dans **Cartes licences** ;
5. Imprimer et remettre la carte au joueur.

### Scénario E — Fin de compétition

1. Archiver les exports PDF si nécessaire ;
2. **Désactiver** les comptes gestionnaires dans Profil ;
3. *(Optionnel)* Supprimer la compétition si plus aucune donnée n'est à conserver.

---

## 20. Questions fréquentes

**Q : J'ai oublié mon mot de passe.**  
R : Contactez l'administrateur de votre compétition. Il peut le réinitialiser depuis Profil → Gestion des utilisateurs.

**Q : Le scanner ne démarre pas la caméra.**  
R : Vérifiez les permissions caméra du navigateur, utilisez HTTPS (ou localhost), et sur mobile appuyez sur « Activer la caméra ». Essayez Chrome ou Safari récent.

**Q : Un joueur n'a pas de photo, puis-je créer sa fiche ?**  
R : Non, la photo est **obligatoire** pour générer une carte licence conforme.

**Q : Le QR sur la carte ne fonctionne plus après modification du joueur.**  
R : Le token QR est stable ; une modification de fiche ne l'invalide pas. Si le QR ne scanne pas, vérifiez l'impression (contraste, taille) ou utilisez la recherche manuelle.

**Q : Puis-je gérer plusieurs compétitions avec un seul compte ?**  
R : Un compte admin/gestionnaire est lié à **une** compétition. Pour plusieurs tournois, créez une compétition (et donc un compte admin) par événement.

**Q : Que signifie « Full control » ?**  
R : Votre abréviation remplace « ID FOOT » sur les cartes et le branding QR devient celui de votre compétition.

**Q : Pourquoi suis-je déconnecté sans raison ?**  
R : Quelqu'un s'est connecté avec le même compte ailleurs (session unique), votre session a expiré (1 h), ou votre compte a été désactivé.

**Q : Un bénévole voit-il les données des joueurs avec un compte scan uniquement ?**  
R : Non. Il voit uniquement « Joueur authentifié » après un scan réussi.

---

## 21. Annexes

### 21.1 Liste des postes disponibles

Lors de la saisie d'un joueur, le poste est choisi dans cette liste :

Gardien · Libéro · Défenseur central · Stopper · Arrière droit · Arrière gauche · Latéral droit · Latéral gauche · Piston droit · Piston gauche · Milieu défensif · Récupérateur · Milieu relayeur · Milieu central · Milieu droit · Milieu gauche · Milieu latéral droit · Milieu latéral gauche · Intérieur droit · Intérieur gauche · Milieu offensif · Meneur de jeu · Ailier droit · Ailier gauche · Équerre droite · Équerre gauche · Second attaquant · Avant-centre · Attaquant de pointe · Attaquant · Buteur · Polyvalent

### 21.2 Glossaire

| Terme | Définition |
|-------|------------|
| **Licence** | Autorisation numérique liée à la fiche joueur |
| **Carte licence** | Support visuel PDF / imprimé avec QR |
| **QR token** | Identifiant unique encodé dans le QR |
| **Slug** | Partie de l'URL identifiant une compétition |
| **Abréviation** | Sigle court de la compétition (ex. CIV) |
| **Full control** | Mode branding où la compétition remplace ID FOOT sur les cartes |
| **Scan uniquement** | Mode compte limité au contrôle QR |
| **Effectif** | Ensemble des joueurs d'une équipe ou compétition |

### 21.3 Zone développeur (God Mode)

Réservée à l'équipe technique de la plateforme (`/god-mode`). Permet de superviser les comptes administrateurs de toutes les compétitions. **Ce n'est pas un outil destiné aux organisateurs de tournois.**

---

## 22. Inventaire des captures d'écran

Placez les fichiers dans `docs/images/`. Format recommandé : PNG, largeur min. 1280 px pour les vues desktop.

| Fichier | Section | Contenu à capturer |
|---------|---------|-------------------|
| `img_1.png` | §1 | Accueil ID FOOT ou schéma de parcours |
| `img_2.png` | §2 | Tableau des rôles (schéma ou légende visuelle) |
| `img_3.png` | §2 | Navigation réduite mode scan uniquement |
| `img_4.png` | §4 | Page d'accueil complète |
| `img_5.png` | §4 | Page publique d'une compétition |
| `img_6.png` | §5 | Formulaire créer une compétition |
| `img_7.png` | §5 | Dashboard après première connexion |
| `img_8.png` | §6 | Page de connexion standard |
| `img_9.png` | §6 | Connexion avec branding compétition |
| `img_10.png` | §6 | Connexion pour vérifier une licence |
| `img_11.png` | §7 | Sidebar desktop complète |
| `img_12.png` | §7 | Barre de navigation mobile |
| `img_13.png` | §8 | Tableau de bord avec statistiques |
| `img_14.png` | §9 | Formulaire modification compétition |
| `img_15.png` | §9 | Comparaison cartes avec/sans Full control |
| `img_16.png` | §10 | Liste des équipes |
| `img_17.png` | §10 | Création d'une équipe |
| `img_18.png` | §10 | Détail équipe + joueurs |
| `img_19.png` | §11 | Liste joueurs (tableau desktop) |
| `img_20.png` | §11 | Formulaire ajout joueur |
| `img_21.png` | §11 | Fiche joueur |
| `img_22.png` | §11 | Édition joueur |
| `img_23.png` | §12 | Aperçu carte licence |
| `img_24.png` | §12 | Page Cartes licences + export |
| `img_25.png` | §12 | Carte web imprimable |
| `img_26.png` | §12 | Détail QR code sur carte |
| `img_27.png` | §13 | Interface scanner (caméra active) |
| `img_28.png` | §13 | Overlay succès scan |
| `img_29.png` | §13 | Message erreur scan |
| `img_30.png` | §13 | Recherche manuelle (secours) |
| `img_31.png` | §13 | Bandeau scans récents |
| `img_32.png` | §14 | Case Scan uniquement (création user) |
| `img_33.png` | §14 | Overlay minimal scan uniquement |
| `img_34.png` | §14 | Profil compte scan uniquement |
| `img_35.png` | §15 | Page /scan — licence valide |
| `img_36.png` | §15 | Page /scan — connexion requise |
| `img_37.png` | §15 | Page /scan — accès refusé |
| `img_38.png` | §16 | Section Mon compte |
| `img_39.png` | §16 | Changement mot de passe |
| `img_40.png` | §16 | Liste gestionnaires |
| `img_41.png` | §16 | Formulaire nouveau gestionnaire |
| `img_42.png` | §18 | Scanner sur mobile |
| `img_43.png` | §18 | Liste joueurs sur mobile |

---

*Document rédigé pour ID FOOT — KOBE Corporation. Pour l'installation technique, voir [DEMARRAGE.md](./DEMARRAGE.md).*
