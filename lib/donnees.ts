/* =========================================================================
   POUR CLÉMENT : FICHIER DE DONNÉES

   ⚠ Les lots et les commanditaires se gèrent maintenant dans l’espace
   privé du site (/admin), et sont enregistrés dans Firestore.
   Ceux écrits plus bas servent seulement :
     - d’exemples, importables d’un clic depuis l’espace privé ;
     - de solution de repli si Firestore est vide ou injoignable.
   La configuration générale (liens, date, billet) reste ici.
   -------------------------------------------------------------------------

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

  /* --- Protection des renseignements personnels (Loi 25) ---
     La personne responsable doit être nommée publiquement. Par défaut, la
     loi désigne la personne qui a la plus haute autorité : l’organisatrice. */
  confidentialite: {
    responsable: "Gabrielle Desgagné",
    titre: "Organisatrice de la soirée et responsable de la protection des renseignements personnels",
    courriel: "gabrielledesg@hotmail.com",
    miseAJour: "18 octobre 2026",
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
    messageFerme: "L’encan en ligne ouvrira quelques jours avant la soirée. Revenez bientôt pour découvrir les lots et déposer votre mise.",

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
  id?: string;          // identifiant Firestore (rempli automatiquement)
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
   Les lots se gèrent dans l’espace privé (/admin). La liste plus bas est
   vide : tant qu’aucun lot n’est ajouté, le site annonce que les lots
   seront dévoilés bientôt.

   Les catégories ci-dessous alimentent la liste déroulante de l’espace
   privé et les filtres de la page des prix.
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
  id?: string;          // identifiant Firestore (rempli automatiquement)
  titre: string;
  categorie: string;
  donateur: string;
  description: string;
  valeur: number;
  miseDepart: number;
  miseActuelle: number;
  nbMises: number;
  image: string;
  // « entier » : l’image est toujours montrée au complet (logos, cartes-cadeaux)
  // « remplir » : l’image occupe tout le cadre, quitte à rogner les bords (photos)
  cadrage?: "entier" | "remplir";
  lienMise: string;
};

export const LOTS: Lot[] = [
  // Les vrais lots s’ajoutent dans l’espace privé (/admin > Lots de l’encan).
  // Cette liste sert seulement de solution de repli si Firestore est injoignable.
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
