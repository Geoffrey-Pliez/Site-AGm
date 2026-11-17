# Audit de migration WordPress vers Astro

Date de verification : 2026-06-11

## Resultat initial

Le premier portage Astro n'etait pas complet.

WordPress expose via son API publique :

- 31 articles (`/wp-json/wp/v2/posts`)
- 28 pages (`/wp-json/wp/v2/pages`)
- 314 medias (`/wp-json/wp/v2/media`)

Le projet Astro initial contenait :

- 8 ressources dans `src/data/site.ts`
- 4 pages de presentation : accueil, prise en main, modules, sequences
- des liens vers les assets WordPress distants, mais pas de copie locale exhaustive des medias/documents

## Articles WordPress deja repris

- Prise en main d'Apprenti Geometre mobile des 5 ans
- Prise en main de la planche Geoplan
- Agrandissements
- Les tangrams de Julie et Tom
- Suites de carres
- Paver une figure - fiche 1
- Paver des figures (8-10 ans)
- Paver une figure - fiche 3

## Articles manquants

- Apprenti Geometre mobile et la planche Geoplan
- Geoplan physique et numerique a partir de 5 ans
- Recherche d'enseignant-e-s pour collaborer
- Decouper et assembler des carres
- Comparer les aires des carres d'une suite
- Manipulation de carres sur AGm
- Manipulation concrete de carres
- Construire des figures
- Des operations et des fractions
- Entrainement de la demarche geometrique
- Des polygones de meme forme
- La moitie
- Pavages, aire et fractions
- Titre du module
- Le plus grand
- Paver des figures (10-12 ans)
- Decouper et assembler des figures
- Puzzle Sam Loyd (3)
- Assembler des figures
- Comparer des figures
- Puzzle Sam Loyd
- Decouvrir l'interface Grandeurs
- Introduire les nombres decimaux

## Pages WordPress non portees en pages dediees

- Figures geometriques a partir de 5 ans
- Reproduction de figures planes
- Aire (`/aire-2/`)
- Sequence d'apprentissage (`/3624-2/`)
- Fractionner
- Paver
- Fractionner et assembler autrement
- Competences
- Les grandeurs
- Actions
- Themes
- Modules
- Interface Geometrie
- Interface Cubes
- Interface Tangram
- Fractions
- Interface Grandeurs
- Mode d'emploi
- Pavage/Fractions
- Prise en main du logiciel
- Nombres decimaux
- Aire (`/aire/`)
- Tutoriels videos Grandeurs
- Activites de decouverte de l'interface Grandeurs
- Fiches d'activites
- Sequences d'apprentissage
- Sample Page

La page d'accueil WordPress est partiellement reprise dans `src/pages/index.astro`, mais son contenu n'est pas migre bloc par bloc.

## Points de migration encore ouverts

- Les articles et pages sont maintenant migres dans `src/data/wp-content.json`.
- Les taxonomies WordPress principales sont conservees dans les donnees migrees : categories, tags, themes, actions, niveau, grandeurs, solides et figures, competences transversales.
- L'archive `/contenus/` permet de filtrer tous les contenus migres.
- Les anciennes URLs WordPress non reservees par des pages Astro dediees sont prerenderisees via `src/pages/[...path].astro`.
- Les URLs reservees par des pages Astro dediees sont conservees en copie sous `/wordpress/...` : par exemple `/wordpress/modules/`, `/wordpress/prise-en-main/` et `/wordpress/accueil/`.
- Les medias et documents sont maintenant copies localement dans `public/wp-content/uploads/`.
- Les URLs dans le code et les donnees migrees pointent vers ces assets locaux.
- Une verification des assets manquants a ete effectuee (22 corriges, 5 restant en 404 sur la source ou avec ancres).
- Les embeds YouTube et liens vers le logiciel AG sont repris dans le HTML WordPress migre.

## Addendum étapes 2+3+4 (2026-11-12)

Contrat lien appli : `getAppLink(slug)` (`src/lib/appLink.ts`) retourne
`https://ag.crem.be/open/<slug>` ; `APP_BASE_URL = https://ag.crem.be`,
`INSTALL_URL = https://ag.crem.be/` ; slug validé `lowercase alphanum + tirets`.

Mapping fiche -> module (`src/lib/contentMap.ts`, dérivation kind depuis
catégories : `Actions` = fiche, `Modules` = module, catégorie contenant
"séquence" normalisé = séquence) :
- `paver-une-figure-1` -> `paver-des-figures`
- `paver-une-figure-3` -> `paver-des-figures`
- `puzzle-sam-loyd-3` -> `puzzle-sam-loyd`
Autres fiches éventuelles : meilleur recouvrement themes/actions/niveau,
`null` si aucun recouvrement (aucun lien cassé, `validateLinks()` vert).

CTA : composant `src/components/AppCta.astro` ("Tester dans l'appli" ->
`getAppLink(slug)` `target="_blank"` + fallback "Installer AGm" vers
`INSTALL_URL` + QR code `api.qrserver.com` encodant l'URL appli). Câblé dans
`[...path].astro` (avec fiches liées si module), `modules/[slug].astro`,
`sequences/index.astro` (CTA par séquence) et nouveau `sequences/[slug].astro`.

Décision jpg : `boy-2782731_1920-1024x1024.jpg` (featured + ref de `notions`,
404 source) substitué par `boy-2841686_1920-2-1024x1024.jpg` existant en local
(2 refs remplacées dans `wp-content.json`, slugs inchangés, 59 contenus).

## Etat final de cette passe

- 31 articles WordPress migres.
- 28 pages WordPress migrees.
- 272 medias publics references par l'API au moment de la migration.
- Build Astro verifie avec `pnpm run build`.
- Routes controlees en HTTP : `/contenus/`, `/fractionner/`, `/2025/12/09/geoplan-physique-et-numerique-a-partir-de-5-ans/`.

## Addendum glossaire site <-> app (etape 1 : lien Fiche -> Module)

Objectif etape 1 : relier chaque Fiche site a son Module parent sans deep-link
complet vers l'app, sans rename, sans refonte Firestore, sans changer les slugs.

| Niveau site | Exemple site | Niveau app vise | Exemple app | Lien etape 1 |
| --- | --- | --- | --- | --- |
| Theme | Aire, Fractions | Theme | Aire, Fractions | Filtres partages, pas de mapping dur |
| Module / Sequence | `paver-des-figures` | Module | Module pavage | Page `/modules/[slug]/` affiche ses fiches |
| Sequence | `agrandissements` | Parcours enseignant | Assemblage de modules | Liste curatee + archive migree |
| Fiche | `paver-une-figure-1`, `paver-une-figure-3` | Fichier / activite | Fiche exacte a ouvrir en 1 clic | `contentMap` -> `paver-des-figures` |

Details techniques :

- `src/lib/contentMap.ts` : source unique du mapping Fiche -> Module
  (`FICHE_TO_MODULE`, `getModuleForFiche`, `getFichesForModule`, `validateLinks`).
- `src/data/site.ts` : `getLinkedFiches()` et `getParentModule()` derivent de
  `contentMap` (aucun champ `moduleSlug`/`ficheIds` duplique dans les donnees).
- `src/pages/modules/[slug].astro` : section "Fiches liees" sur le Module,
  bandeau "Module parent" sur la Fiche.
- `src/pages/sequences/index.astro` : bloc "Modules cures" avec fiches liees,
  archive WordPress migree inchangee en dessous.
- Slugs existants inchanges : les 8 entrees `src/data/site.ts` et les 59
  contenus migres gardent leurs URLs.

Note collision `cachedSequences` : le nom peut designer a la fois le cache local
de l'app mobile (sequences mises en cache pour usage hors-ligne) et les
sequences du site. Etape 1 ne touche pas au cache app : cote site, "Sequence"
reste un assemblage editorial de Modules/Fiches, sans cle partagde avec le
cache mobile. Le futur deep-link utilisera l'identifiant Fiche exact, pas le
nom du cache.

## Addendum mkv hors git (2026-11-17)

10 mkv (~353Mo) sous `public/wp-content/uploads/2021/07/` retires du suivi git
(`git rm --cached`, fichiers gardes sur disque, refs dans `wp-content.json`
inchangees). Ignore via `public/wp-content/uploads/**/*.mkv`.
Proposition : heberger ces videos sur CDN/stockage externe (URLs mises a jour
dans `wp-content.json`), ou activer Git LFS pour `*.mkv` si depot local requis.
