- URL site WEB : - URL site WEB : https://sae303-verguet-deroo.netlify.app/
- URL Notebook Observable : https://observablehq.com/@mmi-montbeliard/sae-303-gr-02
- Nom : Verguet--Bailly 
- Prénom :Matias
- Nom binome : Deroo
- Prénom binome :Valentin

# Remarques :

> Données : [src/assets/communes.json](src/assets/communes.json) est l'export du notebook Observable (partie 6, une ligne par commune), converti de CSV en JSON. Les contours viennent de Bordeaux Métropole (`fv_commu_s`), simplifiés avec mapshaper : [src/assets/communes-contours.json](src/assets/communes-contours.json).

## Structure

| Chemin | Rôle |
|---|---|
| [src/pages/index.astro](src/pages/index.astro) | Le récit en 4 temps : contexte → exploration → révélation → conclusion |
| [src/pages/communes/[code].astro](src/pages/communes/[code].astro) | Une fiche statique par commune (route C) |
| [src/pages/methode.astro](src/pages/methode.astro) | Sources, traitements, routes d'export, limites, téléchargements |
| [src/pages/donnees/[fichier].js](src/pages/donnees/[fichier].js) | Génère au build les CSV/JSON téléchargeables à partir des mêmes fichiers que les graphiques |
| [src/lib/charts.js](src/lib/charts.js) | Les visualisations, écrites comme au TP5 : fonctions qui reçoivent leurs données en paramètre |
| [src/lib/palette.js](src/lib/palette.js) | Palette de **données** (distincte de la palette de charte dans [global.css](src/styles/global.css)) |
| [src/assets/](src/assets/) | Données préfiltrées (export du notebook, contours simplifiés) |
| [src/data/sources.js](src/data/sources.js) | Les sources affichées sur la page Méthode |

## Routes d'export

- **A — au build** ([PlotFigure.astro](src/components/PlotFigure.astro)) : carte et comparaison, rendues en SVG par Plot + jsdom. Zéro JavaScript côté lecteur.
- **B — chez le lecteur** ([ExplorateurCommune.astro](src/components/ExplorateurCommune.astro)) : « Et dans ma commune ? » — sélecteur qui redessine le graphique et rédige une phrase de comparaison. Rendu initial au build (lisible sans JS), re-rendu à la largeur réelle de l'écran.
- **C — une page par valeur** : 28 fiches communes générées par `getStaticPaths`.

## Accessibilité

- `<figure>` / `<figcaption>` sur chaque visualisation, titre porteur + sous-titre + source, description textuelle reliée par `aria-describedby`.
- Lien d'évitement, `lang="fr"`, navigation avec `aria-current`, focus visible, phrase de l'explorateur en `aria-live`.
- Infobulles natives (`title`) sur les barres et les communes : fonctionnent aussi avec le rendu au build.
