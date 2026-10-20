// Visualisations « prêtes pour le site » (méthode TP5) :
// chaque fonction reçoit ses données en paramètre et ne lit rien d'autre.
// Le même code tourne au build (Astro + jsdom, on passe `document`)
// et dans le navigateur (document global).
//
// Données attendues : src/assets/communes.json, l'export du notebook (une ligne par commune) :
// insee, commune, ind (habitants), ind_icu (habitants en îlot de chaleur), part_ind (%), …

import * as Plot from "@observablehq/plot";
import { sequentielle, barre, surligne, neutre, texteSecondaire, fond, tous } from "./palette.js";

const nombre = new Intl.NumberFormat("fr-FR");
export const pct = (v) =>
  `${v.toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %`;
export const nb = (v) => nombre.format(Math.round(v));
export const rangTexte = (r) => (r === 1 ? "1<sup>re</sup>" : `${r}<sup>e</sup>`);

const style = { fontSize: "15px", fontFamily: "inherit", background: "transparent" };

/** Taux de la métropole entière : total des habitants en îlot de chaleur / total des habitants
 *  (et non moyenne des 28 taux, qui donnerait le même poids à Saint-Vincent-de-Paul et à Bordeaux). */
export function tauxMetropole(data) {
  const icu = data.reduce((s, d) => s + d.ind_icu, 0);
  const ind = data.reduce((s, d) => s + d.ind, 0);
  return (icu / ind) * 100;
}

/** V2 — Carte : part des habitants en îlot de chaleur par commune (valeur rapportée, jamais brute).
 *  5 classes aux seuils ronds (20, 40, 60, 80 %), comme dans le notebook.
 *  `lien` (facultatif) : fonction code INSEE → URL ; chaque commune devient un lien vers sa fiche. */
export function carteTaux(contours, data, { document, selection, lien, width = 640, ariaLabel, ariaDescription } = {}) {
  const parCode = new Map(data.map((d) => [d.insee, d]));
  return Plot.plot({
    document, width, style,
    ariaLabel: ariaLabel ?? "Carte des 28 communes de Bordeaux Métropole selon la part de leurs habitants vivant en îlot de chaleur",
    ariaDescription,
    projection: { type: "mercator", domain: contours },
    color: {
      ...sequentielle,
      domain: [0, 100],
      legend: true,
      label: "Part des habitants en îlot de chaleur",
      tickFormat: (d) => `${d} %`,
    },
    marks: [
      // Fond gris : une commune sans donnée reste visible au lieu de disparaître
      Plot.geo(contours, { fill: neutre, stroke: fond, ariaHidden: true }),
      Plot.geo(contours.features, {
        filter: (f) => parCode.has(f.properties.insee),
        fill: (f) => parCode.get(f.properties.insee).part_ind,
        href: lien && ((f) => lien(f.properties.insee)),
        stroke: fond,
        strokeWidth: 0.8,
        title: (f) => {
          const d = parCode.get(f.properties.insee);
          return `${d.commune}\n${pct(d.part_ind)} des habitants en îlot de chaleur\n(${nb(d.ind_icu)} sur ${nb(d.ind)})`;
        },
      }),
      selection &&
        Plot.geo(contours.features, {
          filter: (f) => f.properties.insee === selection,
          stroke: surligne,
          strokeWidth: 2.5,
          ariaHidden: true,
        }),
      Plot.text(
        contours.features,
        Plot.centroid({
          filter: (f) => f.properties.insee === (selection ?? "33063"),
          text: (f) => f.properties.nom,
          fill: surligne,
          stroke: fond,
          strokeWidth: 4,
          fontSize: 15,
          fontWeight: "bold",
        }),
      ),
    ],
  });
}

/** Classement des 28 communes, la métropole en pointillés. `selection` (code INSEE) : la commune choisie en orange. */
export function barresCommunes(data, { document, selection, width = 640, ariaLabel, ariaDescription } = {}) {
  const ref = tauxMetropole(data);
  return Plot.plot({
    document, width, style,
    ariaLabel: ariaLabel ?? "Classement des 28 communes selon la part de leurs habitants vivant en îlot de chaleur",
    ariaDescription,
    height: data.length * 26 + 70,
    marginLeft: 200,
    marginRight: 60,
    marginTop: 40,
    x: { label: "Part des habitants en îlot de chaleur →", domain: [0, 100], tickFormat: (d) => `${d} %`, grid: true },
    y: { label: null },
    marks: [
      // Annotation : la référence métropolitaine (dessinée sous les barres et les étiquettes)
      Plot.ruleX([ref], { stroke: surligne, strokeDasharray: "4 3", ariaHidden: true }),
      Plot.barX(data, {
        x: "part_ind",
        y: "commune",
        sort: { y: "-x" },
        fill: (d) => (selection && d.insee !== selection ? neutre : barre), // choisie : orange ; les autres : gris
        title: (d) => `${d.commune} : ${pct(d.part_ind)} des habitants en îlot de chaleur (${nb(d.ind_icu)} sur ${nb(d.ind)})`,
      }),
      Plot.text(data, {
        x: "part_ind",
        y: "commune",
        text: (d) => `${Math.round(d.part_ind)} %`,
        textAnchor: "start",
        dx: 4,
        fontSize: 14,
        fill: (d) => (selection && d.insee !== selection ? texteSecondaire : surligne),
        fontWeight: (d) => (d.insee === selection ? "bold" : "normal"),
        stroke: fond,
        strokeWidth: 3,
      }),
      Plot.ruleX([0], { ariaHidden: true }),
      Plot.text([ref], {
        x: (d) => d,
        frameAnchor: "top",
        dy: -22,
        textAnchor: "end",
        dx: -4,
        text: (d) => `Métropole : ${Math.round(d)} %`,
        fontSize: 15,
        fontWeight: "bold",
      }),
    ],
  });
}

/** V3 — Les 80 ans et plus face à l'ensemble des habitants : deux barres par commune (comme dans le notebook).
 *  Communes classées de la plus exposée à la moins exposée chez les 80 ans et plus.
 *  Infobulle native (title) : fiable sur des barres fines, et fonctionne aussi avec le rendu au build. */
export function comparaison80(data, { document, width = 760, ariaLabel, ariaDescription } = {}) {
  const groupes = ["Tous les habitants", "80 ans et plus"];
  const lignes = data.flatMap((d) => [
    { commune: d.commune, groupe: groupes[0], part: d.part_ind, effectif: d.ind },
    { commune: d.commune, groupe: groupes[1], part: d.part_80p, effectif: d.ind_80p },
  ]);
  const ordre = [...data].sort((a, b) => b.part_80p - a.part_80p).map((d) => d.commune);
  return Plot.plot({
    document, width, style,
    ariaLabel: ariaLabel ?? "Pour chaque commune, la part de tous les habitants et celle des 80 ans et plus vivant en îlot de chaleur",
    ariaDescription,
    height: data.length * 44 + 70,
    marginLeft: 200,
    marginRight: 56,
    fy: { label: null, domain: ordre, padding: 0.25 },
    y: { axis: null, domain: groupes },
    x: { label: "Part vivant en îlot de chaleur →", domain: [0, 100], tickFormat: (d) => `${d} %`, grid: true },
    color: { domain: groupes, range: [tous, barre], legend: true },
    marks: [
      Plot.barX(lignes, {
        fy: "commune",
        y: "groupe",
        x: "part",
        fill: "groupe",
        title: (d) => `${d.commune}
${d.groupe} : ${pct(d.part)}
(${nb(d.effectif)} personnes)`,
      }),
      Plot.text(lignes, {
        fy: "commune",
        y: "groupe",
        x: "part",
        text: (d) => `${Math.round(d.part)} %`,
        textAnchor: "start",
        dx: 4,
        fontSize: 13,
        fill: (d) => (d.groupe === groupes[1] ? barre : texteSecondaire),
      }),
      Plot.ruleX([0], { ariaHidden: true }),
    ],
  });
}
