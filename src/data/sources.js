// Sources affichées sur la page Méthode. Une entrée par jeu de données réellement utilisé.
// Ne rien publier qui n'a pas été vérifié dans la source (date, licence, millésime).
export const sources = [
  {
    nom: "Îlot de chaleur ou de fraîcheur urbain basé sur l'analyse des températures de surface de 2022",
    producteur: "Bordeaux Métropole (datahub, jeu ri_icu_ifu_s)",
    url: "https://datahub.bordeaux-metropole.fr/explore/dataset/ri_icu_ifu_s/information/",
    millesime: "Relevé satellite du 11 juillet 2022",
    consulte: "19 octobre 2026",
    licence: "Licence Ouverte",
    usage: "L'aléa. Téléchargé déjà filtré : écart à la moyenne de toute la métropole (BM), relevé du 11 juillet 2022, zones à +3 °C ou plus (9 697 zones).",
  },
  {
    nom: "Revenus, pauvreté et niveau de vie — Données carroyées (carreaux de 200 m)",
    producteur: "Insee, dispositif Filosofi",
    url: "https://www.insee.fr/fr/statistiques/7655475?sommaire=7655515",
    millesime: "2019",
    consulte: "19 octobre 2026",
    licence: "Licence Ouverte 2.0",
    usage: "L'enjeu et la vulnérabilité : habitants, 80 ans et plus, ménages et ménages pauvres par carreau. Réduit des 2 287 884 carreaux de France aux 6 751 des 28 communes.",
  },
  {
    nom: "Délimitation de Bordeaux Métropole et des communes membres",
    producteur: "Bordeaux Métropole (datahub, jeu fv_commu_s)",
    url: "https://datahub.bordeaux-metropole.fr/explore/dataset/fv_commu_s/",
    millesime: "Contours en vigueur au téléchargement",
    consulte: "19 octobre 2026",
    licence: "Licence Ouverte",
    usage: "Le découpage : rattacher chaque carreau à sa commune et dessiner les cartes (contours simplifiés à 3 % des points, 25 Ko).",
  },
];
