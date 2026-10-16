/* =========================================================================
   POUR CLÉMENT : FICHIER DE DONNÉES
   -------------------------------------------------------------------------
   C’est le SEUL fichier à modifier pour faire vivre le site au quotidien :
   les liens de paiement, les lots de l’encan et les commanditaires.

   Règles de base :
   - Le texte va toujours entre guillemets droits : "comme ceci"
   - Les nombres n’ont pas de guillemets : 250
   - Chaque ligne se termine par une virgule
   - Ne supprimez pas les accolades { } ni les crochets [ ]

   Après une modification, la page se rafraîchit toute seule dans le
   navigateur. Si l’écran devient rouge, c’est une virgule ou un guillemet
   oublié : revenez à la dernière ligne modifiée.
   ========================================================================= */


/* -------------------------------------------------------------------------
   1. CONFIGURATION GÉNÉRALE
   ------------------------------------------------------------------------- */
export const CONFIG = {

  /* --- L’événement --- */
  evenement: {
    nom: "Pour Clément",
    date: "Vendredi 12 novembre 2027",
    dateISO: "2027-11-12T18:00:00",   // sert au compte à rebours (18 h)
    heure: "18 h, accueil dès 17 h 30",
    lieu: "Hôtel Plaza Québec",
    adresse: "3031, boulevard Laurier, Québec (Québec)",
    tenue: "Tenue de ville",
  },

  /* --- Vos coordonnées --- */
  contact: {
    nom: "Gabrielle Desgagné",
    courriel: "gabrielledesg@hotmail.com",
    telephone: "418 929-8579",
  },

  /* --- Le billet --- */
  billet: {
    prix: 150,
    placesParTable: 8,
  },

  /* ---------------------------------------------------------------------
     LIENS À REMPLACER  ← LE PLUS IMPORTANT
     Tant qu’un lien reste vide (""), le site affiche poliment
     « bientôt disponible » au lieu d’un bouton brisé.
     --------------------------------------------------------------------- */
  liens: {
    // Formulaire de billetterie Zeffy (collez l’adresse complète)
    billetterie: "",

    // Formulaire de don Zeffy, version « page »
    don: "",

    // Formulaire de don Zeffy, version « intégrée » (embed) pour l’afficher
    // directement dans la page Faire un don
    donIntegre: "",

    // Plateforme où les gens misent réellement. Si vous laissez ce champ
    // vide, chaque lot peut avoir son propre lien (voir « lienMise » plus bas).
    encan: "",

    // Le PDF du plan de commandite (déposé dans le dossier public)
    planCommandite: "/Plan de commandite - Pour Clement.pdf",
  },

  /* --- L’encan --- */
  encan: {
    ouvert: false,                    // true quand les mises sont ouvertes
    messageFerme: "L’encan en ligne ouvrira quelques jours avant la soirée. Les lots sont déjà confirmés, revenez bientôt pour déposer votre mise.",

    /* -------------------------------------------------------------------
       AFFICHAGE EN DIRECT (page /direct, celle du soir de la soirée)
       -------------------------------------------------------------------
       La page /direct classe les lots de la plus haute mise à la plus basse
       et se rafraîchit toute seule.

       Où prend-elle les montants ?

       - Si « sourceMises » reste vide, elle affiche les valeurs écrites plus
         bas dans ce fichier. Utile pour préparer et tester, mais ça ne bouge
         pas pendant la soirée.

       - Si vous y mettez l’adresse d’une feuille Google publiée en CSV, la
         page va la relire toutes les quelques secondes. Quelqu’un met la
         feuille à jour depuis un portable, et l’écran suit tout seul.

       Comment publier la feuille : dans Google Sheets, Fichier > Partager >
       Publier sur le Web, choisissez « Valeurs séparées par des virgules
       (.csv) », puis collez l’adresse obtenue ici.

       La feuille doit avoir une ligne d’en-tête avec au moins ces colonnes
       (l’ordre n’a pas d’importance, les accents et majuscules non plus) :

           Titre          | Mise    | Mises
           Escapade...    | 425     | 3
           Souper...      | 250     | 2

       « Titre » doit reprendre le titre du lot écrit dans ce fichier pour que
       la photo et la description suivent. Un titre inconnu s’affiche quand
       même, avec son montant.
       ------------------------------------------------------------------- */
    sourceMises: "",
    intervalleSecondes: 15,
  },
};


/* -------------------------------------------------------------------------
   2. LES COMMANDITAIRES
   -------------------------------------------------------------------------
   Pour chaque commanditaire :
     nom    le nom de l’entreprise
     logo   chemin du fichier image, ex. "/logo-abc.png"
            (déposez l’image dans le dossier « public », puis écrivez son nom
             précédé d’une barre oblique. Laissez "" si vous n’avez pas encore
             le logo : le site affichera élégamment le nom à la place)
     url    site web de l’entreprise (facultatif)
     mot    courte description (facultatif)
   ------------------------------------------------------------------------- */
export type Commanditaire = {
  nom: string;
  logo: string;
  url: string;
  mot?: string;
};

export const COMMANDITAIRES: {
  principal: Commanditaire;
  secondaires: Commanditaire[];
  bronze: Commanditaire[];
  dons: Commanditaire[];
} = {

  /* Le partenaire OR : la grande vitrine de la page d’accueil */
  principal: {
    nom: "Votre entreprise ici",
    logo: "",
    url: "",
    mot: "Partenaire présentateur de la soirée-bénéfice Pour Clément.",
  },

  /* Les deux partenaires ARGENT : les deux vitrines plus petites */
  secondaires: [
    { nom: "Partenaire Argent", logo: "", url: "", mot: "Une place vous attend." },
    { nom: "Partenaire Argent", logo: "", url: "", mot: "Une place vous attend." },
  ],

  /* Les partenaires BRONZE : ce sont eux qui défilent en bandeau */
  bronze: [
    { nom: "Partenaire Bronze", logo: "", url: "" },
    { nom: "Partenaire Bronze", logo: "", url: "" },
    { nom: "Partenaire Bronze", logo: "", url: "" },
    { nom: "Partenaire Bronze", logo: "", url: "" },
    { nom: "Partenaire Bronze", logo: "", url: "" },
    { nom: "Partenaire Bronze", logo: "", url: "" },
  ],

  /* Les entreprises qui offrent un lot ou le gros lot du tirage */
  dons: [
    { nom: "Donateur du gros lot", logo: "", url: "", mot: "Gros lot du tirage de la soirée" },
  ],
};


/* -------------------------------------------------------------------------
   3. LES LOTS DE L’ENCAN
   -------------------------------------------------------------------------
   Les 20 lots ci-dessous sont des EXEMPLES. Remplacez-les par les vôtres.

   Pour chaque lot :
     titre        le nom du lot
     categorie    doit correspondre à une des catégories listées plus bas
     donateur     l’entreprise qui offre le lot
     description  2 ou 3 phrases
     valeur       valeur au détail, en dollars (nombre)
     miseDepart   mise de départ, en dollars (nombre)
     miseActuelle mise la plus élevée reçue (mettez la même valeur que
                  miseDepart tant que personne n’a misé)
     nbMises      nombre de mises reçues
     image        photo déposée dans « public », ex. "/lot-01.jpg"
                  (laissez "" : le site affiche une vignette élégante)
     lienMise     lien pour miser sur CE lot en particulier (facultatif)
   ------------------------------------------------------------------------- */
export const CATEGORIES = [
  "Séjours et évasion",
  "Gastronomie",
  "Bien-être",
  "Art et décoration",
  "Sports et plein air",
  "Famille",
  "Services",
];

export type Lot = {
  titre: string;
  categorie: string;
  donateur: string;
  description: string;
  valeur: number;
  miseDepart: number;
  miseActuelle: number;
  nbMises: number;
  image: string;
  lienMise: string;
};

export const LOTS: Lot[] = [
  {
    titre: "Escapade de deux nuits en Charlevoix",
    categorie: "Séjours et évasion",
    donateur: "Nom du commanditaire",
    description: "Deux nuitées pour deux personnes dans une auberge avec vue sur le fleuve, petits-déjeuners inclus. Valable en toute saison.",
    valeur: 800, miseDepart: 350, miseActuelle: 350, nbMises: 0, image: "", lienMise: "",
  },
  {
    titre: "Souper gastronomique pour deux",
    categorie: "Gastronomie",
    donateur: "Nom du commanditaire",
    description: "Menu dégustation en sept services avec accords vins, dans une des belles tables de la région.",
    valeur: 400, miseDepart: 175, miseActuelle: 175, nbMises: 0, image: "", lienMise: "",
  },
  {
    titre: "Journée aux bains nordiques pour deux",
    categorie: "Bien-être",
    donateur: "Nom du commanditaire",
    description: "Accès aux bains, saunas et aires de détente, plus un massage suédois de soixante minutes chacun.",
    valeur: 320, miseDepart: 140, miseActuelle: 140, nbMises: 0, image: "", lienMise: "",
  },
  {
    titre: "Œuvre originale d’une artiste d’ici",
    categorie: "Art et décoration",
    donateur: "Nom du commanditaire",
    description: "Acrylique sur toile signée, 36 x 48 pouces, encadrée. Une pièce unique offerte par l’artiste pour la soirée.",
    valeur: 1200, miseDepart: 500, miseActuelle: 500, nbMises: 0, image: "", lienMise: "",
  },
  {
    titre: "Deux billets de hockey, section rouge",
    categorie: "Sports et plein air",
    donateur: "Nom du commanditaire",
    description: "Deux places côte à côte pour un match de la saison régulière, stationnement inclus.",
    valeur: 600, miseDepart: 275, miseActuelle: 275, nbMises: 0, image: "", lienMise: "",
  },
  {
    titre: "Panier gourmand de producteurs locaux",
    categorie: "Gastronomie",
    donateur: "Nom du commanditaire",
    description: "Fromages fins, charcuteries artisanales, confitures, pain frais et une bouteille de cidre de glace.",
    valeur: 250, miseDepart: 100, miseActuelle: 100, nbMises: 0, image: "", lienMise: "",
  },
  {
    titre: "Cours de cuisine privé à la maison",
    categorie: "Gastronomie",
    donateur: "Nom du commanditaire",
    description: "Un chef se déplace chez vous pour un atelier de trois heures avec six convives, repas et vins compris.",
    valeur: 700, miseDepart: 300, miseActuelle: 300, nbMises: 0, image: "", lienMise: "",
  },
  {
    titre: "Vélo hybride tout équipé",
    categorie: "Sports et plein air",
    donateur: "Nom du commanditaire",
    description: "Vélo neuf de taille au choix, avec casque, cadenas et mise au point gratuite la première année.",
    valeur: 900, miseDepart: 400, miseActuelle: 400, nbMises: 0, image: "", lienMise: "",
  },
  {
    titre: "Séance photo familiale en studio",
    categorie: "Famille",
    donateur: "Nom du commanditaire",
    description: "Une heure de séance, quinze photos retouchées en haute résolution et un album imprimé.",
    valeur: 450, miseDepart: 175, miseActuelle: 175, nbMises: 0, image: "", lienMise: "",
  },
  {
    titre: "Caisse de douze bouteilles sélectionnées",
    categorie: "Gastronomie",
    donateur: "Nom du commanditaire",
    description: "Une sélection de rouges et de blancs choisie par un sommelier, livrée dans une caisse de bois gravée.",
    valeur: 600, miseDepart: 250, miseActuelle: 250, nbMises: 0, image: "", lienMise: "",
  },
  {
    titre: "Ronde de golf pour quatre",
    categorie: "Sports et plein air",
    donateur: "Nom du commanditaire",
    description: "Dix-huit trous avec deux voiturettes et un repas au chalet, sur un parcours réputé de la région.",
    valeur: 550, miseDepart: 225, miseActuelle: 225, nbMises: 0, image: "", lienMise: "",
  },
  {
    titre: "Abonnement annuel d’entraînement",
    categorie: "Bien-être",
    donateur: "Nom du commanditaire",
    description: "Douze mois d’accès illimité, incluant trois rencontres avec un entraîneur personnel.",
    valeur: 750, miseDepart: 300, miseActuelle: 300, nbMises: 0, image: "", lienMise: "",
  },
  {
    titre: "Croisière d’observation des baleines",
    categorie: "Séjours et évasion",
    donateur: "Nom du commanditaire",
    description: "Excursion de trois heures pour quatre personnes, avec guide naturaliste, sur le Saint-Laurent.",
    valeur: 500, miseDepart: 200, miseActuelle: 200, nbMises: 0, image: "", lienMise: "",
  },
  {
    titre: "Bijou d’une créatrice québécoise",
    categorie: "Art et décoration",
    donateur: "Nom du commanditaire",
    description: "Collier en argent sterling fait à la main, pièce unique présentée dans son écrin.",
    valeur: 380, miseDepart: 150, miseActuelle: 150, nbMises: 0, image: "", lienMise: "",
  },
  {
    titre: "Ensemble de literie haut de gamme",
    categorie: "Art et décoration",
    donateur: "Nom du commanditaire",
    description: "Douillette, housse en coton égyptien et deux oreillers de duvet, format très grand lit.",
    valeur: 450, miseDepart: 175, miseActuelle: 175, nbMises: 0, image: "", lienMise: "",
  },
  {
    titre: "Quatre visites d’entretien ménager",
    categorie: "Services",
    donateur: "Nom du commanditaire",
    description: "Quatre séances de trois heures, à l’horaire qui vous convient, produits écologiques fournis.",
    valeur: 480, miseDepart: 200, miseActuelle: 200, nbMises: 0, image: "", lienMise: "",
  },
  {
    titre: "Journée guidée en plein air pour deux",
    categorie: "Sports et plein air",
    donateur: "Nom du commanditaire",
    description: "Une journée complète d’aventure encadrée par un guide, équipement et dîner en forêt inclus.",
    valeur: 550, miseDepart: 225, miseActuelle: 225, nbMises: 0, image: "", lienMise: "",
  },
  {
    titre: "Table d’hôte pour quatre au Vieux-Québec",
    categorie: "Gastronomie",
    donateur: "Nom du commanditaire",
    description: "Quatre menus complets, entrée, plat et dessert, dans une salle à manger historique.",
    valeur: 700, miseDepart: 300, miseActuelle: 300, nbMises: 0, image: "", lienMise: "",
  },
  {
    titre: "Nuitée en prêt-à-camper",
    categorie: "Famille",
    donateur: "Nom du commanditaire",
    description: "Une nuit en hébergement tout équipé dans un parc national, pour une famille de quatre.",
    valeur: 400, miseDepart: 160, miseActuelle: 160, nbMises: 0, image: "", lienMise: "",
  },
  {
    titre: "Grand format d’un photographe animalier",
    categorie: "Art et décoration",
    donateur: "Nom du commanditaire",
    description: "Tirage numéroté de 40 x 60 pouces sur papier d’archive, monté sur aluminium et signé.",
    valeur: 850, miseDepart: 350, miseActuelle: 350, nbMises: 0, image: "", lienMise: "",
  },
];


/* -------------------------------------------------------------------------
   Petit utilitaire : affiche un montant en dollars canadiens
   ------------------------------------------------------------------------- */
export function argent(n: number): string {
  return new Intl.NumberFormat("fr-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}
