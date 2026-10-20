// Génère au build les fichiers téléchargeables (CSV + JSON) à partir de l'export du notebook.
// Une seule source de vérité : ce que le site affiche est exactement ce qu'on télécharge.
import communes from "../../assets/communes.json";

const ID = "communes-ilots-de-chaleur";

export function getStaticPaths() {
  return [
    { params: { fichier: `${ID}.csv` }, props: { format: "csv" } },
    { params: { fichier: `${ID}.json` }, props: { format: "json" } },
  ];
}

const cellule = (v) => {
  const s = String(v ?? "");
  return /[",;\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
};

export function GET({ props }) {
  if (props.format === "json") {
    return new Response(JSON.stringify(communes, null, 1), {
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }
  const colonnes = Object.keys(communes[0]);
  const lignes = [colonnes.join(","), ...communes.map((d) => colonnes.map((c) => cellule(d[c])).join(","))];
  return new Response(lignes.join("\n"), { headers: { "Content-Type": "text/csv; charset=utf-8" } });
}
