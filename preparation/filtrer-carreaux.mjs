// Préparation des carreaux Filosofi 2019 (Insee, 200 m) pour le notebook Observable.
//
// Pourquoi ce script : le fichier source (carreaux_200m_met.csv, ~450 Mo, toute la France)
// est trop lourd pour Observable (50 Mo max). On ne garde que ce qui sert :
//   1. les lignes des 28 communes de Bordeaux Métropole (colonne lcog_geo) ;
//   2. les colonnes utiles à l'analyse ;
//   3. on ajoute la position du centre de chaque carreau (lon/lat), déduite de son identifiant,
//      pour pouvoir le croiser avec les îlots de chaleur sans logiciel SIG.
//
// Usage :
//   node preparation/filtrer-carreaux.mjs "<chemin>/carreaux_200m_met.csv" "<chemin>/carreaux_bordeaux.csv"
//
// Source : Insee, Revenus, pauvreté et niveau de vie en 2019 — Données carroyées,
// carreau 200 m (y compris données imputées) — https://www.insee.fr/fr/statistiques/7655475
// Licence Ouverte 2.0.

import fs from "node:fs";
import readline from "node:readline";

const [, , entree, sortie] = process.argv;
if (!entree || !sortie) {
  console.error('Usage : node filtrer-carreaux.mjs "carreaux_200m_met.csv" "carreaux_bordeaux.csv"');
  process.exit(1);
}

// Les 28 communes de Bordeaux Métropole (code EPCI 243300316), codes INSEE.
const COMMUNES = new Set([
  "33003", "33004", "33013", "33032", "33039", "33056", "33063", "33065", "33069", "33075",
  "33096", "33119", "33162", "33167", "33192", "33200", "33249", "33273", "33281", "33312",
  "33318", "33376", "33434", "33449", "33487", "33519", "33522", "33550",
]);

// Colonnes conservées (voir la documentation Insee des données carroyées)
const COLONNES = [
  "idcar_200m", // identifiant du carreau (contient sa position)
  "i_est_200",  // 1 = valeurs estimées (carreau de moins de 11 ménages, secret statistique)
  "lcog_geo",   // code(s) de la ou des communes du carreau
  "ind",        // nombre d'individus
  "ind_65_79",  // individus de 65 à 79 ans
  "ind_80p",    // individus de 80 ans ou plus
  "men",        // nombre de ménages
  "men_pauv",   // ménages pauvres
];

// --- Position du carreau ------------------------------------------------------------------
// L'identifiant « CRS3035RES200mN2029800E4252400 » donne le coin bas-gauche du carreau
// en projection ETRS89-LAEA (EPSG:3035). On prend le centre (+100 m) et on le convertit
// en longitude/latitude (WGS84) avec les formules de Snyder (Map Projections, 1987, p. 189).
const a = 6378137, e2 = 0.0066943800229, e = Math.sqrt(e2);
const lat0 = (52 * Math.PI) / 180, lon0 = (10 * Math.PI) / 180, FE = 4321000, FN = 3210000;
const q = (phi) => {
  const s = Math.sin(phi);
  return (1 - e2) * (s / (1 - e2 * s * s) - (1 / (2 * e)) * Math.log((1 - e * s) / (1 + e * s)));
};
const qp = q(Math.PI / 2);
const Rq = a * Math.sqrt(qp / 2);
const beta1 = Math.asin(q(lat0) / qp);
const D = (a * (Math.cos(lat0) / Math.sqrt(1 - e2 * Math.sin(lat0) ** 2))) / (Rq * Math.cos(beta1));

function versLonLat(E, N) {
  const x = E - FE, y = N - FN;
  const rho = Math.hypot(x / D, D * y);
  const C = 2 * Math.asin(rho / (2 * Rq));
  const beta = Math.asin(Math.cos(C) * Math.sin(beta1) + (D * y * Math.sin(C) * Math.cos(beta1)) / rho);
  const lon = lon0 + Math.atan2(x * Math.sin(C), D * rho * Math.cos(beta1) * Math.cos(C) - D * D * y * Math.sin(beta1) * Math.sin(C));
  const lat = beta
    + (e2 / 3 + (31 * e2 ** 2) / 180 + (517 * e2 ** 3) / 5040) * Math.sin(2 * beta)
    + ((23 * e2 ** 2) / 360 + (251 * e2 ** 3) / 3780) * Math.sin(4 * beta)
    + ((761 * e2 ** 3) / 45360) * Math.sin(6 * beta);
  return [(lon * 180) / Math.PI, (lat * 180) / Math.PI];
}

function centre(idcar) {
  const m = idcar.match(/N(\d+)E(\d+)/);
  return versLonLat(+m[2] + 100, +m[1] + 100);
}

// --- Lecture ligne par ligne (le fichier est trop gros pour être chargé d'un coup) --------
const flux = readline.createInterface({ input: fs.createReadStream(entree, "utf8"), crlfDelay: Infinity });
const out = fs.createWriteStream(sortie, "utf8");
out.write([...COLONNES, "lon", "lat", "nb_communes"].join(",") + "\n");

let entete, index, lues = 0, gardees = 0, aCheval = 0, estimees = 0;
for await (const ligne of flux) {
  if (!entete) {
    entete = ligne.split(",");
    index = COLONNES.map((c) => entete.indexOf(c));
    if (index.includes(-1)) throw new Error("Colonne manquante dans le fichier source");
    continue;
  }
  lues++;
  const v = ligne.split(",");
  const lcog = v[entete.indexOf("lcog_geo")];
  // lcog_geo peut contenir plusieurs codes collés (carreau à cheval sur des communes)
  const codes = lcog.match(/.{5}/g) ?? [];
  if (!codes.some((c) => COMMUNES.has(c))) continue;

  const [lon, lat] = centre(v[index[0]]);
  out.write([...index.map((i) => v[i]), lon.toFixed(5), lat.toFixed(5), codes.length].join(",") + "\n");
  gardees++;
  if (codes.length > 1) aCheval++;
  if (v[entete.indexOf("i_est_200")] === "1") estimees++;
}
out.end();

console.log(`Lignes lues : ${lues}`);
console.log(`Carreaux gardés (28 communes) : ${gardees}`);
console.log(`  dont à cheval sur plusieurs communes : ${aCheval}`);
console.log(`  dont valeurs estimées (i_est_200 = 1) : ${estimees}`);
console.log(`Fichier écrit : ${sortie}`);
