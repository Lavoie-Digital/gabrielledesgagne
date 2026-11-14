# Site de la soirée-bénéfice « Pour Clément »

Bonjour Gabrielle. Voici le site de la soirée, monté avec Next.js.

## Pour le voir

Ouvre un terminal dans ce dossier et tape :

```
npm run dev
```

Puis va sur **http://localhost:3000**. Tant que le serveur tourne, chaque
modification que tu enregistres apparaît automatiquement dans le navigateur, sans
avoir à rafraîchir. Pour arrêter le serveur : `Ctrl + C` dans le terminal.

## Les pages

| Adresse | Page |
|---|---|
| `/` | Accueil : l’histoire, la soirée, le partenaire présentateur, le bandeau Bronze, la Fondation |
| `/prix` | Les lots de l’encan avec mise actuelle, filtres par catégorie et fiche détaillée |
| `/commanditaires` | Le lien « Devenez commanditaire » vers le PDF, les trois niveaux, tous les partenaires |
| `/billets` | Ce qui est inclus, choix des billets, don supplémentaire, reçu fiscal, paiement Stripe |
| `/billets/merci` | Les numéros de billets (L101, L102…) affichés après le paiement |
| `/don` | Don en ligne par Stripe (montant, reçu fiscal), autres façons d’aider |
| `/don/merci` | Le remerciement affiché après un don |
| `/direct` | **La page à projeter le soir de la soirée** : les mises classées de la plus haute à la plus basse, mise à jour en continu |
| `/admin` | **L’espace privé** : billets et reçus, lots, commanditaires et mises du soir (accès réservé) |

---

## La page du soir : `/direct`

Ouvre **http://localhost:3000/direct** (ou `tonsite.com/direct` une fois en ligne),
puis clique sur **Plein écran** en bas à droite. La page occupe tout l’écran, sans
menu ni pied de page, avec de gros caractères lisibles du fond de la salle.

Ce qu’elle affiche : les lots classés par montant décroissant, le total des mises,
le nombre de mises reçues, l’heure, et un point vert « En direct » quand les données
arrivent bien. Un lot qui vient de recevoir une mise **s’illumine quelques secondes**,
pour que la salle voie que ça bouge.

### Pour que les montants changent vraiment pendant la soirée

Le plus simple : l’**espace privé**, page **« Mises du soir »** (voir plus bas).
Quelqu’un tape la nouvelle mise depuis un portable ou un cellulaire, appuie sur
Entrée, et l’écran projeté suit tout seul.

Autre possibilité, une feuille Google :

1. Crée une feuille avec une ligne d’en-tête : **Titre**, **Mise**, **Mises**
2. Une ligne par lot. Le titre doit reprendre celui écrit dans `lib/donnees.ts`
   (les accents et les majuscules n’ont pas d’importance)
3. Dans Google Sheets : **Fichier > Partager > Publier sur le Web**, format
   **« Valeurs séparées par des virgules (.csv) »**
4. Copie l’adresse obtenue et colle-la dans `lib/donnees.ts`, à la ligne
   **`sourceMises`**

Pendant la soirée, quelqu’un met la feuille à jour depuis un portable ou un cellulaire,
et l’écran suit tout seul, sans que personne ait à recharger la page.

Le rythme de rafraîchissement se règle avec **`intervalleSecondes`** (15 par défaut).

**Si `sourceMises` reste vide**, la page affiche les montants écrits dans
`lib/donnees.ts`. C’est parfait pour préparer et répéter, mais ça ne bougera pas
pendant la soirée. Le bandeau du bas l’indique clairement : « Montants du fichier
local » plutôt que « En direct ».

**Si la connexion tombe** en pleine soirée, la page garde les derniers montants
affichés au lieu de se vider, et l’indique en bas. Rien ne disparaît de l’écran.

**Formats de montants acceptés** dans la feuille : `425`, `1 250 $`, `1,250.50`,
`2 000,50`. Le signe de dollar et les espaces sont ignorés.

---

## L’espace privé : `/admin`

Les **lots de l’encan** et les **commanditaires** se gèrent maintenant en ligne, sans
toucher au code, à l’adresse **`/admin`** (par exemple `tonsite.com/admin`). Ils sont
enregistrés dans Firestore, la base de données de Firebase.

Seules les adresses inscrites dans le fichier `.env`, à la ligne `ADMIN_COURRIELS`,
peuvent entrer : aujourd’hui **xavier@lavoiedigital.ca** et
**gabrielle@lavoiedigital.ca**. Pour en ajouter une, ajoute-la à cette ligne,
séparée par une virgule, puis redémarre le site.

On se connecte avec **Google**, ou en recevant un **lien par courriel** (aucun mot de
passe à retenir). La session dure cinq jours.

Dans l’espace privé :

- **Lots de l’encan** : ajouter, modifier, supprimer un lot, avec sa photo
- **Commanditaires** : Or, Argent, Bronze et dons matériels, avec leur logo
- **Mises du soir** : la saisie rapide des mises, pour l’écran `/direct`

Chaque enregistrement met le site public à jour immédiatement.

**Tant qu’aucun lot n’est ajouté**, le site annonce que les lots seront dévoilés
bientôt et invite les entreprises à en offrir un. Les commanditaires d’exemple
(« Votre entreprise ici ») restent affichés tant que Firestore n’en contient aucun ;
le tableau de bord propose de les importer d’un clic pour les modifier.

### Activer Firebase (une seule fois)

Dans la [console Firebase](https://console.firebase.google.com/project/gabrielle-488d0),
projet **gabrielle-488d0** :

1. **Firestore Database > Créer une base de données.** Emplacement conseillé :
   `northamerica-northeast1 (Montréal)`, qu’on ne peut plus changer ensuite.
   Choisis le **mode production** : tout est fermé aux navigateurs, et c’est voulu,
   car le site passe par son serveur (les règles sont dans `firestore.rules`).
2. **Authentication > Commencer**, puis dans **Méthode de connexion**, active
   **Google** et **Adresse e-mail/Mot de passe** avec l’option **Lien envoyé par
   e-mail (connexion sans mot de passe)**.
3. **Authentication > Paramètres > Domaines autorisés** : ajoute le domaine du site
   une fois en ligne (`localhost` y est déjà).
4. **Storage > Commencer**, pour pouvoir téléverser les photos et les logos. Firebase
   demande pour cela le forfait **Blaze** (paiement à l’usage ; pour un site comme
   celui-ci, la facture reste normalement dans la partie gratuite). Sans Storage,
   tout fonctionne, sauf l’envoi d’images.

### Le fichier `.env`

Il contient les clés de Firebase. La clé privée est **secrète** : ce fichier ne doit
jamais être envoyé par courriel ni publié (il est exclu de GitHub). Le modèle à suivre
est dans `.env.example`. Une fois en ligne (Vercel par exemple), recopie les mêmes
variables dans les réglages du projet, section « Environment Variables ».

---

## Le fichier `lib/donnees.ts`

Il garde la configuration générale : date, lieu, prix du billet, liens de paiement,
et les catégories de lots. Les lots et commanditaires qui s’y trouvent ne servent
plus que d’exemples et de solution de repli.

### Les liens de paiement (le plus important)

```
liens: {
  encan: "",         ← adresse de ta plateforme de mises
}
```

Tant qu’un lien reste vide, le site affiche poliment « bientôt disponible » plutôt
qu’un bouton brisé. Personne ne tombera dans le vide.

Les billets et les dons, eux, se paient directement sur le site par Stripe : voir
plus bas.

## Les dons : Stripe

La page **Faire un don** (`/don`) sert **uniquement aux dons** : la personne choisit
un montant (20, 50, 100, 250 $ ou un autre), peut cocher **« Je souhaite un reçu
fiscal »**, puis paie sur la page Stripe. Stripe lui demande seulement son prénom,
son nom, son courriel et, si elle veut un reçu, son adresse. Pas de billet, pas
d’allergies.

Elle revient sur une page de remerciement et reçoit un courriel de remerciement
(SendGrid). Le reçu fiscal porte sur le **montant complet du don** et est émis par
la Fondation après la soirée.

Dans l’espace privé, **« Billets, dons et reçus »** liste les dons en ligne (nom,
montant, reçu demandé), et l’export **des reçus** regroupe billets et dons. Un
export **des dons** existe aussi. Les montants proposés se changent dans
`lib/donnees.ts`, section `don`.

Le webhook Stripe est le même que pour les billets : rien de plus à configurer.

## La billetterie : Stripe

Les billets se paient directement sur le site, par **Stripe**.

**Le parcours :**

1. Sur `/billets`, la personne choisit le nombre de billets, peut **ajouter un don**
   à la Fondation, et peut cocher **« Je souhaite un reçu fiscal »**.
2. Elle paie sur la page sécurisée de Stripe. Si elle a demandé un reçu, Stripe
   lui demande son adresse. Elle peut aussi y indiquer une allergie.
3. Dès que le paiement passe, Stripe prévient le site (le **webhook**), qui
   attribue les **numéros de billets** : L101, L102, L103… La personne revient sur
   une page qui affiche ses numéros, à imprimer ou à garder sur son téléphone, et
   **reçoit ses billets par courriel** (SendGrid). Stripe lui envoie aussi son reçu
   de paiement.

**La limite de 300 billets :** pendant que quelqu’un paie, ses places sont mises de
côté 30 minutes. S’il abandonne, elles se libèrent toutes seules. Une fois les 300
billets vendus, la billetterie affiche « complet ». Le nombre se change dans
`lib/donnees.ts`, section `billet` (`limite`).

**Le reçu fiscal :** 90 $ par billet, plus le don supplémentaire. Il n’est
**pas** émis par le site : la Fondation En Cœur l’émet **après la soirée**, une fois
les fonds remis. Dans l’espace privé, la page **« Billets et reçus »** donne la liste
à lui transmettre (nom, adresse, montant), avec un bouton **Exporter les reçus
(CSV)** qui s’ouvre dans Excel. On y trouve aussi le nombre de dons supplémentaires
avec le nom des personnes, et toutes les commandes avec leurs numéros de billets et
leurs allergies.

### Brancher Stripe (une seule fois)

1. Crée le compte sur [dashboard.stripe.com](https://dashboard.stripe.com) au nom
   de l’organisation qui reçoit l’argent.
2. **Développeurs > Clés API** : copie la **clé secrète** dans `.env`, ligne
   `STRIPE_SECRET_KEY` (`sk_test_…` pour les essais, `sk_live_…` pour de vrai).
3. **Développeurs > Webhooks > Ajouter une destination** :
   - adresse : `https://TON-SITE/api/stripe/webhook`
   - événements : `checkout.session.completed`,
     `checkout.session.async_payment_succeeded`,
     `checkout.session.async_payment_failed`, `checkout.session.expired`
   - copie le **secret de signature** (`whsec_…`) dans `STRIPE_WEBHOOK_SECRET`.
4. En ligne (App Hosting), les deux clés vont dans Secret Manager, pas dans
   `apphosting.yaml` :
   ```
   firebase apphosting:secrets:set STRIPE_SECRET_KEY
   firebase apphosting:secrets:set STRIPE_WEBHOOK_SECRET
   ```
5. **Paramètres > Courriels clients** : active « Paiements réussis » pour que
   chaque acheteur reçoive son reçu de paiement.

**Pour tester en local**, avec la [Stripe CLI](https://docs.stripe.com/stripe-cli) :

```
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copie le `whsec_…` affiché dans `.env`, redémarre `npm run dev`, puis paie avec la
carte d’essai `4242 4242 4242 4242` (n’importe quelle date future, n’importe quel CVC).

Tant que `STRIPE_SECRET_KEY` est vide, le bouton affiche « Billetterie bientôt ouverte ».

### Brancher SendGrid (courriel des billets)

1. Sur [sendgrid.com](https://sendgrid.com), **Settings > Sender Authentication** :
   authentifie le domaine du site (le mieux, les courriels arrivent moins souvent
   dans les indésirables) ou au minimum vérifie une adresse d’expédition.
2. **Settings > API Keys > Create API Key**, accès restreint avec seulement
   **Mail Send**. Copie la clé (`SG.…`) dans `.env`, ligne `SENDGRID_API_KEY`.
3. Mets l’adresse vérifiée à la ligne `SENDGRID_FROM` (dans `.env` et dans
   `apphosting.yaml`). Les réponses des acheteurs arrivent à l’adresse de contact
   de `lib/donnees.ts`.
4. En ligne : `firebase apphosting:secrets:set SENDGRID_API_KEY`.

Si un envoi échoue, Stripe redemande au site un peu plus tard et le courriel repart
tout seul. Dans **Billets et reçus**, la colonne « Courriel des billets » montre
l’état de chaque envoi, avec un bouton **Envoyer / Renvoyer** (pratique si quelqu’un
ne trouve plus son courriel).

## Les photos, le logo et les animations

- **Le logo de l’ourson** est dessiné d’après l’urne de Clément. Le fichier seul
  est dans `public/logo-ourson.svg` : il s’agrandit sans perte et peut servir pour
  l’imprimé (programme, cartons de table, affiches).
- **Les photos des lots** s’envoient depuis l’espace privé, avec chaque lot.
- **Les photos de la soirée** (`public/images/soiree/`) sont des images libres de
  droits (Unsplash), choisies pour illustrer en attendant.
- **La vidéo de l’accueil** (`public/videos/`) est un montage de quatre plans libres
  de droits (Pexels) : lumières de salle, champagne, lustre, flûte de rosé. Une
  version allégée est servie aux téléphones.
- **Les photos de l’ourson** (`public/images/clement-*.jpg`) sont des recadrages
  de `clement.jpg`.
- **Les animations** (GSAP) se règlent dans `app/(public)/template.tsx`. Si la
  personne a demandé à son appareil de réduire les animations, le site s’affiche
  sans aucun mouvement.

---

## Mettre le site en ligne

Le plus simple avec Next.js est [Vercel](https://vercel.com), gratuit pour ce genre de
projet : tu connectes le dossier, et chaque modification se publie toute seule.

Avant de publier, tu peux vérifier que tout compile :

```
npm run build
```

---

## À valider avant de publier

- **Le logo de la Fondation En Cœur** apparaît sur toutes les pages : confirme avec la
  Fondation que tu peux l’utiliser ainsi.
- **La mention sur les reçus fiscaux**, page « Faire un don », est volontairement
  prudente. Ajuste-la selon ce que la Fondation te confirmera.
- **L’heure (accueil 17 h, souper 18 h 30) est confirmée ; l’adresse de l’hôtel** reste une supposition.
  Corrige-la dans `lib/donnees.ts`.
- **Firebase** : les quatre étapes d’activation plus haut, et les variables du
  fichier `.env` recopiées chez l’hébergeur.

---

## Où se trouve quoi

```
frontend/
├── app/
│   ├── layout.tsx           En-tête, polices, structure commune
│   ├── globals.css          Toute l’apparence
│   ├── page.tsx             Accueil
│   ├── prix/page.tsx        Les prix
│   ├── commanditaires/page.tsx
│   ├── billets/page.tsx
│   └── don/page.tsx
├── components/              Les morceaux réutilisables
├── app/admin/               L’espace privé (lots, commanditaires, mises)
├── lib/donnees.ts           Configuration : date, lieu, liens, catégories
├── lib/catalogue.ts         Lecture des lots et commanditaires dans Firestore
└── public/                  Logos, photos et le PDF de commandite
```

Si l’écran devient rouge après une modification de `donnees.ts`, c’est presque
toujours une virgule manquante ou un guillemet oublié. Le message indique la ligne.
