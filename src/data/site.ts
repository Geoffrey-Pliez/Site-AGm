export const assetBase = "https://agmobile.crem.be/wp-content/uploads";

export const filters = {
  themes: [
    "Activite d'initiation",
    "Aire",
    "Figures geometriques",
    "Fractions",
    "Geometrie",
    "Initiation",
    "Mesure",
    "Nombres decimaux",
    "Prise en main",
    "Reactivation",
    "Reperage spatial",
    "Reproduction de figures planes",
  ],
  actions: [
    "Agrandir/Retrecir",
    "Assembler",
    "Comparer",
    "Construire",
    "Deplacer/Retourner",
    "Fractionner",
    "Manipuler",
    "Paver",
    "Superposer",
  ],
  levels: ["M3", "P1", "P3-P4", "P5-P6", "S1 a S3"],
};

export const modules = [
  {
    title: "Prise en main d'Apprenti Geometre mobile des 5 ans",
    slug: "prise-en-main-agm-5-ans",
    type: "Module",
    date: "2025-12-09",
    excerpt:
      "Decouverte des outils creer un polygone irregulier, glisser et modifier dans Apprenti Geometre mobile.",
    objective:
      "Les eleves apprennent a utiliser les outils de base du logiciel en dessinant puis en modifiant des figures.",
    summary:
      "Un temps collectif permet de decouvrir les fonctionnalites, suivi d'un temps individuel pour les manipuler et dessiner des figures a relier.",
    image: `${assetBase}/2021/07/boy-2841686_1920-2-1024x1024.jpg`,
    sourceUrl:
      "https://agmobile.crem.be/2025/12/09/prise-en-main-dapprenti-geometre-mobile-des-5-ans/",
    documents: [
      {
        label: "Fichiers AGm",
        url: `${assetBase}/2025/12/Fichiers_AGm_Geoplan-et-Apprenti-Geometre-mobile-1.zip`,
      },
      {
        label: "Fiches enseignant",
        url: `${assetBase}/2025/12/Fiches_pour_lenseignant_prise-en-main-de-AGm.pdf`,
      },
    ],
    themes: ["Activite d'initiation", "Initiation", "Prise en main"],
    actions: ["Manipuler", "Construire"],
    levels: ["M3", "P1"],
  },
  {
    title: "Prise en main de la planche Geoplan",
    slug: "prise-en-main-planche-geoplan",
    type: "Module",
    date: "2025-12-09",
    excerpt:
      "Reproduire des modeles sur une planche Geoplan physique et retrouver les modeles utilises.",
    objective:
      "Les eleves explorent le materiel, reproduisent des figures et identifient les modeles associes.",
    summary:
      "Les activites progressent de la construction libre vers la reproduction de modeles de difficulte croissante.",
    image: `${assetBase}/2021/07/boy-2841686_1920-2-1024x1024.jpg`,
    sourceUrl:
      "https://agmobile.crem.be/2025/12/09/prise-en-main-de-la-planche-geoplan/",
    documents: [
      {
        label: "Modeles Geoplan",
        url: `${assetBase}/2025/11/Modeles-Geoplan.zip`,
      },
      {
        label: "Fiche enseignant",
        url: `${assetBase}/2025/12/Fiches_pour_lenseignant_prise-en-main-de-la-planche-Geoplan.pdf`,
      },
    ],
    themes: ["Figures geometriques", "Reperage spatial", "Prise en main"],
    actions: ["Construire", "Manipuler"],
    levels: ["M3", "P1"],
  },
  {
    title: "Paver des figures (8-10 ans)",
    slug: "paver-des-figures",
    type: "Sequence",
    date: "2020-09-25",
    excerpt:
      "Renforcer la notion de fraction a l'aide d'exercices de comparaison d'aire par pavage.",
    objective:
      "Comparer des aires de figures planes et exprimer les comparaisons sous forme de rapport.",
    summary:
      "Les eleves pavent des figures a l'aide de pieces plus petites pour raisonner sur les aires et les fractions.",
    image: `${assetBase}/2021/07/boy-2841686_1920-2-1024x1024.jpg`,
    sourceUrl: "https://agmobile.crem.be/2020/09/25/paver-des-figures/",
    documents: [
      {
        label: "Fiches eleves PDF",
        url: `${assetBase}/2023/02/Paver-figures-8-10_fiches.pdf`,
      },
      {
        label: "Fichiers AGG",
        url: `${assetBase}/2023/02/PaverFigures8-10_fichiers.zip`,
      },
    ],
    themes: ["Aire", "Fractions"],
    actions: ["Paver", "Comparer"],
    levels: ["P3-P4"],
  },
  {
    title: "Paver une figure - fiche 1",
    slug: "paver-une-figure-1",
    type: "Fiche",
    date: "2020-09-29",
    excerpt:
      "Paver des figures a l'aide de figures plus petites pour comparer leurs aires.",
    objective:
      "Les eleves pavent des figures plus grandes et comparent les aires obtenues.",
    summary:
      "Une fiche d'activite avec lien direct vers le logiciel et une video d'aide.",
    image: `${assetBase}/2021/08/Paver-une-figure-1-773x1024.png`,
    sourceUrl: "https://agmobile.crem.be/2020/09/29/paver-une-figure-1/",
    activityUrl: "http://ag.crem.be/?activityId=uXq6Ko8QIue0QUZj26fS",
    videoUrl: "https://www.youtube.com/embed/VZSCDi28quk",
    documents: [],
    themes: ["Aire", "Fractions"],
    actions: ["Paver", "Comparer"],
    levels: ["P3-P4"],
  },
  {
    title: "Paver une figure - fiche 3",
    slug: "paver-une-figure-3",
    type: "Fiche",
    date: "2020-09-23",
    excerpt:
      "Comparer des aires de figures pavees et exprimer ces comparaisons sous forme de rapport.",
    objective:
      "Faire emerger les rapports d'aires a partir d'une manipulation visuelle.",
    summary:
      "La fiche prolonge le module de pavage avec une activite testable dans le logiciel.",
    image: `${assetBase}/2021/08/Paver-une-figure-3-777x1024.png`,
    sourceUrl: "https://agmobile.crem.be/2020/09/23/paver-une-figure-3/",
    activityUrl: "http://ag-beta.crem.be/?activityId=IFUNceDr2Q2tQYaImtYn",
    videoUrl: "https://www.youtube.com/embed/VZSCDi28quk",
    documents: [],
    themes: ["Aire", "Fractions"],
    actions: ["Paver", "Comparer"],
    levels: ["P3-P4"],
  },
  {
    title: "Agrandissements",
    slug: "agrandissements",
    type: "Sequence",
    date: "2023-07-05",
    excerpt:
      "Construire des agrandissements de polygones, avec ou sans grille, pour en decouvrir les caracteristiques.",
    objective:
      "Comparer l'aire d'un polygone avec celle de son agrandissement.",
    summary:
      "Une sequence pour faire apparaitre les liens entre longueurs multipliees et aires transformees.",
    image: `${assetBase}/2021/07/kids-2782658_1920-1024x1024.jpg`,
    sourceUrl: "https://agmobile.crem.be/2023/07/05/agrandissements/",
    documents: [],
    themes: ["Aire", "Reproduction de figures planes", "Geometrie"],
    actions: ["Agrandir/Retrecir", "Construire", "Comparer"],
    levels: ["P5-P6", "S1 a S3"],
  },
  {
    title: "Suites de carres",
    slug: "suites-de-carres",
    type: "Sequence",
    date: "2022-12-15",
    excerpt:
      "Reproduire un dessin geometrique, decouvrir des proprietes du carre et aborder l'aire sans mesure.",
    objective:
      "Analyser et reproduire une suite de carres avec plusieurs materiaux.",
    summary:
      "La sequence articule reproduction precise, vocabulaire geometrique et comparaison d'aires.",
    image: `${assetBase}/2021/07/kids-2782658_1920-1024x1024.jpg`,
    sourceUrl: "https://agmobile.crem.be/2022/12/15/suites-de-carres/",
    documents: [],
    themes: ["Aire", "Figures geometriques", "Reproduction de figures planes"],
    actions: ["Construire", "Comparer"],
    levels: ["P3-P4", "P5-P6"],
  },
  {
    title: "Les tangrams de Julie et Tom",
    slug: "tangrams-julie-tom",
    type: "Sequence",
    date: "2023-02-08",
    excerpt:
      "Renforcer la distinction entre forme et grandeur, la conservation de l'aire et la commune mesure.",
    objective:
      "Comparer des aires par superposition et aborder les grandeurs fractionnees.",
    summary:
      "Une sequence autour du tangram pour composer, decomposer et argumenter sur les aires.",
    image: `${assetBase}/2021/07/prisemain2.png`,
    sourceUrl: "https://agmobile.crem.be/2023/02/08/les-tangrams-de-julie-et-tom/",
    documents: [],
    themes: ["Aire", "Fractions", "Figures geometriques"],
    actions: ["Assembler", "Fractionner", "Superposer"],
    levels: ["P3-P4", "P5-P6"],
  },
];

export const sequences = modules.filter((item) => item.type === "Sequence");
