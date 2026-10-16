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

## Les 5 pages

| Adresse | Page |
|---|---|
| `/` | Accueil : l’histoire, la soirée, le partenaire présentateur, le bandeau Bronze, la Fondation |
| `/prix` | Les 20 lots avec mise actuelle, filtres par catégorie et fiche détaillée |
| `/commanditaires` | Le lien « Devenez commanditaire » vers le PDF, les trois niveaux, tous les partenaires |
| `/billets` | Ce qui est inclus, calculateur de billets, bouton vers la billetterie |
| `/don` | Formulaire Zeffy intégré, montants suggérés, autres façons d’aider |
| `/direct` | **La page à projeter le soir de la soirée** : les mises classées de la plus haute à la plus basse, mise à jour en continu |

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

Il faut une source que quelqu’un peut modifier sans toucher au code. Le plus simple
est une feuille Google :

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

## Le seul fichier à modifier : `lib/donnees.ts`

Tout le contenu vivant du site est là : tes liens de paiement, tes 20 lots et tes
commanditaires. Tu peux l’ouvrir avec n’importe quel éditeur de texte.

### 1. Les liens (le plus important)

```
liens: {
  billetterie: "",   ← adresse de ton formulaire de billetterie Zeffy
  don: "",           ← adresse de ton formulaire de don Zeffy
  donIntegre: "",    ← même formulaire, version « intégrée » (embed)
  encan: "",         ← adresse de ta plateforme de mises
}
```

Tant qu’un lien reste vide, le site affiche poliment « bientôt disponible » plutôt
qu’un bouton brisé. Personne ne tombera dans le vide.

Pour les obtenir : crée un compte gratuit sur [zeffy.com](https://www.zeffy.com/fr-CA),
crée un formulaire de billetterie et un formulaire de don, puis copie l’adresse de
chacun. Pour `donIntegre`, cherche l’option « intégrer » ou « embed » dans Zeffy.

### 2. Les lots

Les 20 lots actuels sont des exemples. Remplace le texte, les valeurs et les mises.

Pour ajouter une photo à un lot : dépose l’image dans le dossier **`public/`**, puis
écris son nom précédé d’une barre oblique, par exemple `image: "/lot-01.jpg"`. Sans
photo, le site affiche une vignette verte élégante avec le numéro du lot.

La `categorie` doit être écrite exactement comme dans la liste `CATEGORIES` un peu
plus haut dans le fichier. Les filtres se construisent tout seuls.

**Pour ouvrir l’encan :** change `ouvert: false` en `ouvert: true`. Les boutons
« Voir le lot » deviennent alors des boutons **« Miser »** vers ta plateforme.

### 3. Les commanditaires

- `principal` : le partenaire Or, la grande vitrine de l’accueil
- `secondaires` : les deux partenaires Argent
- `bronze` : ceux qui défilent dans le bandeau animé
- `dons` : les entreprises qui offrent un lot

Dépose les logos dans **`public/`** et écris `logo: "/logo-entreprise.png"`. Un PNG à
fond transparent donne le plus beau résultat. Sans logo, le nom de l’entreprise
s’affiche joliment dans un cadre.

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
- **L’heure (18 h, accueil 17 h 30) et l’adresse de l’hôtel** sont des suppositions.
  Corrige-les dans `lib/donnees.ts`.
- **Les 20 lots** sont des exemples. Rien ne doit rester tel quel.

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
├── lib/donnees.ts           ← LE FICHIER À MODIFIER
└── public/                  Logos, photos et le PDF de commandite
```

Si l’écran devient rouge après une modification de `donnees.ts`, c’est presque
toujours une virgule manquante ou un guillemet oublié. Le message indique la ligne.
