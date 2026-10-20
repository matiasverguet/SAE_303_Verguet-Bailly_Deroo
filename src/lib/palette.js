// Palette de DONNÉES — distincte de la palette de charte (global.css : nuit + bleu glacier).
// Échelle jaune → rouge (ColorBrewer YlOrRd, la même que la carte V2 du notebook) :
// jaune clair = peu d'habitants en îlot de chaleur, rouge foncé = beaucoup.
// La luminosité baisse régulièrement d'une classe à l'autre : l'ordre se lit aussi sans voir les teintes.

// Séquentielle en 5 classes. Des classes plutôt qu'un dégradé continu :
// plus facile de lire « dans quelle tranche est ma commune ».
export const classes = ["#ffffb2", "#fecc5c", "#fd8d3c", "#f03b20", "#bd0026"];
export const sequentielle = { type: "quantize", range: classes };
export const barre = classes[2];

// Catégorielle (Okabe-Ito) : un aléa = une couleur, constante sur tout le site.
export const aleas = {
  chaleur: "#e69f00",
  feux: "#d55e00",
  inondation: "#56b4e9",
  industriel: "#cc79a7",
  argiles: "#009e73",
};

// Mise en évidence (interaction) : élément sélectionné vs le reste.
export const surligne = "#edf0f3";
export const neutre = "#39414c";
export const texteSecondaire = "#9aa4b0";
export const fond = "#0e1116"; // fond de page : traits de séparation entre communes, halos de texte
export const tous = "#7d8794"; // « tous les habitants » dans la comparaison V3 (gris moyen, lisible sur fond sombre)
