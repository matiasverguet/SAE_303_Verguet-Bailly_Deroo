# Jalon d'intention — Prévention des risques à Bordeaux Métropole

> 5 minutes avec l'enseignant. À valider : **public, question, données, dénominateur**.
> Les deux membres du binôme doivent pouvoir répondre à toutes les questions de la partie 5.

---

## 1. Fiche d'intention (à recopier dans le notebook)

| | |
|---|---|
| **Public** | Un habitant de Bordeaux Métropole, sans connaissance technique, qui veut savoir si sa commune est concernée. |
| **Question principale** | Dans quelles communes de la métropole vit-on le plus dans des îlots de chaleur, et les habitants les plus fragiles y sont-ils sur-représentés ? |
| **Angle** | Chaleur × vulnérabilité. On croise un **aléa** (les îlots de chaleur mesurés en 2022), un **enjeu** (les habitants) et une **vulnérabilité** (les plus de 80 ans, les ménages pauvres). C'est la formule risque = aléa × enjeu × vulnérabilité proposée par le défi. |

---

## 2. Les données choisies (dans la liste du défi)

| Groupe du défi | Jeu de données | Rôle |
|---|---|---|
| **Chaleur** | Îlot de chaleur ou de fraîcheur urbain à Bordeaux Métropole | l'**aléa** |
| **Populations** | Revenus, pauvreté et niveau de vie — Données carroyées | l'**enjeu** et la **vulnérabilité** |
| **Données socles** | Délimitation de Bordeaux Métropole et des communes membres | le découpage par commune |
| *Equipements (bonus)* | *Base de données des équipements publics de Bordeaux Métropole* | *écoles, crèches et équipements seniors en îlot de chaleur, si on a le temps* |

Les autres groupes (inondations, industriel, argiles, PPRI…) ne servent pas pour cet angle. On ne les prend pas.

### ① Îlots de chaleur ou de fraîcheur urbains — l'aléa

- **Producteur :** Bordeaux Métropole, c'est-à-dire le porteur du défi.
- **Lien :** [datahub.bordeaux-metropole.fr — ri_icu_ifu_s](https://datahub.bordeaux-metropole.fr/explore/dataset/ri_icu_ifu_s/information/)
- **Licence :** Licence Ouverte
- **Ce que c'est :** environ 97 000 polygones construits à partir des **températures de surface** relevées par satellite le **17 juin 2022** et le **11 juillet 2022**.
- **Colonnes utiles (vérifiées via l'API) :**
  - `delta` : écart à la température moyenne, en °C, en nombres entiers ;
  - `dimension` : la moyenne de référence. `BM` = toute la métropole, `COM` = la commune, `PT` = le pôle territorial ;
  - `date_releve` : la date du relevé ;
  - `insee` : le code commune ;
  - `geo_shape` : le polygone.
- **Point clé :** le fichier ne contient que des zones à **±3 °C ou plus** de la moyenne. Aucun polygone n'a un `delta` entre −2 et +2. Le producteur considère donc qu'il y a un îlot de chaleur à partir de **+3 °C au-dessus de la moyenne**. On reprend son seuil au lieu d'en inventer un. *(À confirmer dans le « Dictionnaire public » du jeu.)*
- **Filtrage à faire avant de télécharger :** l'API permet de filtrer à la source, et il n'y a pas besoin de télécharger les 97 000 polygones :
  - `dimension = "BM"` : écart à la moyenne de **toute la métropole**, seul choix qui rend les communes comparables entre elles. Avec `COM`, chaque commune est comparée à elle-même ;
  - **une seule date** : par exemple le 11 juillet 2022 (17 901 polygones pour `BM`). La date choisie est à dire dans la page Méthode.

### ② Revenus, pauvreté et niveau de vie, données carroyées 200 m (Filosofi) — l'enjeu et la vulnérabilité

- **Producteur :** Insee
- **Lien :** [data.gouv.fr](https://www.data.gouv.fr/datasets/revenus-pauvrete-et-niveau-de-vie-donnees-carroyees), millésime **2019**, le dernier publié par l'Insee sur [insee.fr](https://www.insee.fr/fr/statistiques/7655515)
- **Licence :** Licence Ouverte 2.0
- **Colonnes utiles (vérifiées dans le fichier) :**
  - `idcar_200m` : identifiant du carreau
  - `lcog_geo` : code(s) commune
  - `ind` : nombre d'individus
  - `ind_80p` : individus de 80 ans ou plus
  - `ind_65_79` : individus de 65 à 79 ans
  - `men` : nombre de ménages
  - `men_pauv` : ménages pauvres
  - `geometry` : le carreau, en projection EPSG:3035
- Il existe un fichier 2021 sur data.gouv.fr, mais il est déposé par un compte personnel et non par l'organisation Insee. On garde le millésime officiel 2019.

### ③ Délimitation des communes — le découpage

- **Producteur :** Bordeaux Métropole ([fv_commu_s](https://datahub.bordeaux-metropole.fr/explore/dataset/fv_commu_s/)). Le site utilise aujourd'hui les contours IGN de geo.api.gouv.fr : c'est équivalent, mais prendre celui du défi est plus cohérent.

---

## 3. Le dénominateur (le point qui sera le plus discuté)

**Indicateur principal, par commune :**

```
part des habitants en îlot de chaleur = habitants des carreaux situés en îlot de chaleur  /  habitants de tous les carreaux de la commune
                                         (Σ ind, carreaux en ICU)                            (Σ ind, tous les carreaux)
```

Un carreau est « en îlot de chaleur » s'il est majoritairement couvert par une zone à `delta ≥ +3`. C'est la règle à préciser dans le notebook, avec le plan B « centre du carreau » de la partie 7.

**Pourquoi une part et pas un nombre :** Bordeaux (~260 000 habitants) aura toujours plus de personnes concernées que Saint-Vincent-de-Paul (~1 000). Un nombre brut ne montrerait que la taille des communes.

**Pourquoi la population Filosofi (`ind`) et pas la population légale :** numérateur et dénominateur viennent **de la même source et de la même année** (Filosofi 2019). Si on mélangeait avec la population légale (autre année, autre méthode), la part pourrait être faussée.

**Pourquoi l'écart à la moyenne et pas la température brute :** une température de surface dépend du jour et de l'heure du relevé. L'écart à la moyenne de la métropole, le même jour, permet de comparer les quartiers entre eux. C'est le geste « absolu ou relatif ».

**Pour la révélation (vulnérabilité) :** on compare deux parts.

```
part des 80 ans et plus en îlot de chaleur = Σ ind_80p (carreaux en ICU) / Σ ind_80p (tous les carreaux)
part des ménages pauvres en îlot de chaleur = Σ men_pauv (carreaux en ICU) / Σ men_pauv (tous les carreaux)
```

Si ces parts sont plus élevées que celle de l'ensemble des habitants, ces publics sont sur-exposés. Sinon, on le dit aussi : un résultat négatif reste un résultat.

**Taux de la métropole :** total des habitants en îlot de chaleur / total des habitants. On ne fait **pas** la moyenne des 28 taux, qui donnerait le même poids à toutes les communes.

---

## 4. Le traitement prévu (en une phrase par étape)

1. **Télécharger les îlots de chaleur déjà filtrés** (`dimension = BM`, une date, `delta ≥ 3`) depuis l'API du datahub.
2. **Filtrer les carreaux Filosofi** sur les 28 communes, avec `lcog_geo` ou par intersection avec les contours.
3. **Croiser carreaux et îlots de chaleur** : c'est l'étape la plus lourde. La faire en amont (QGIS ou mapshaper), puis n'importer dans Observable qu'un CSV `idcar_200m → en ICU oui/non`.
4. **Agréger par commune** : les sommes de `ind`, `ind_80p`, `men_pauv`, au total et en îlot de chaleur.
5. **Exporter** une ligne par commune, au format déjà prévu par le site ([src/data/README.md](../src/data/README.md)).

---

## 5. Antisèche : les questions probables de l'enseignant

**« D'où vient la donnée ? »**
L'aléa vient de Bordeaux Métropole : des températures de surface relevées par satellite en juin et juillet 2022, exprimées en écart à la moyenne. Les habitants viennent de l'Insee, Filosofi 2019, en carreaux de 200 m, construits à partir des déclarations fiscales.

**« C'est la température qu'on ressent ? »**
**Non, et il faut le dire sur le site.** C'est la température **de surface** (toits, routes, sols) vue par satellite, pas la température de l'air. Elle est très liée à la chaleur ressentie, mais ce n'est pas la même chose. Elle est aussi mesurée **deux jours seulement**. C'est la première limite à mettre dans la page Méthode.

**« Pourquoi ce seuil de +3 °C ? »**
Parce que c'est celui du producteur : le jeu ne contient que des zones à ±3 °C ou plus de la moyenne. On ne l'a pas choisi nous-mêmes.

**« Pourquoi ce dénominateur ? »**
On veut comparer des communes de tailles très différentes, donc une part. On prend la population Filosofi pour que le numérateur et le dénominateur soient comptés de la même façon, la même année.

**« Pourquoi par commune et pas par carreau ? »**
Le lecteur pense « ma commune ». Le carreau sert au calcul, la commune à la lecture. Une carte par carreaux pourrait servir en exploration, mais elle est plus lourde et plus délicate à lire. Le niveau de détail change ce que montre la carte : c'est à dire dans la page Méthode.

**« Qu'est-ce qui manque ou fausse les chiffres ? »**
- **Années différentes :** températures 2022, population 2019. La ville bouge peu en 3 ans, mais il faut le dire.
- **Secret statistique :** l'Insee ne diffuse pas tel quel un carreau de moins de 11 ménages. Les valeurs sont alors estimées (variable `i_est_200`). Il faut compter combien de carreaux sont concernés.
- **Carreaux à cheval sur deux communes :** ils peuvent porter plusieurs codes dans `lcog_geo`. Il faut décider à quelle commune les rattacher et compter combien sont concernés (c'est le contrôle de jointure demandé).
- **Une date donne une photo, pas une moyenne d'été.** Calculer aussi l'indicateur avec l'autre date (17 juin) permet de vérifier que le classement tient.

**« Où est la carte, et pourquoi une carte ? »**
La question est bien un « où ? » : où vit-on dans des îlots de chaleur. La carte montre une **part** (valeur rapportée), jamais un nombre brut.

**« Et l'interaction ? »**
Question du lecteur : « Ma commune est-elle plus exposée que le reste de la métropole ? » Il choisit sa commune et le graphique la situe par rapport aux 27 autres. C'est déjà en place dans le site.

---

## 6. Les 4 visualisations prévues

| | Question | Forme |
|---|---|---|
| **V1** distribution | Comment se répartissent les écarts de température ? Et les 28 parts communales ? | Histogramme des `delta`, strip plot des 28 parts (notebook) |
| **V2** carte | Où vit-on le plus en îlot de chaleur ? | Choroplèthe de la **part** par commune, en 5 classes |
| **V3** comparaison | Les plus de 80 ans sont-ils plus exposés que l'ensemble des habitants ? | Points appariés par commune : part de l'ensemble face à la part des 80 ans et plus |
| **V4** interaction | Et ma commune ? | Sélecteur de commune, classement mis en évidence (route B) |

---

## 7. Plan B si un blocage arrive

- **Le croisement surfacique carreaux × polygones est trop lourd :** prendre le **centre** de chaque carreau. Le carreau est en îlot de chaleur si son centre tombe dans une zone à `delta ≥ 3`. C'est plus simple et à mentionner comme simplification.
- **`ind_80p` donne trop de valeurs estimées :** passer à `ind_65_79 + ind_80p` (65 ans et plus), plus robuste.
- **Pas le temps pour la vulnérabilité :** garder l'aléa × enjeu seul (part des habitants en îlot de chaleur). Le récit tient quand même.
- **Plan C pour l'aléa :** la cartographie LCZ du Cerema (groupe Chaleur, 28 communes couvertes à 100 %). Mais elle décrit la forme de la ville, pas une température mesurée : c'est moins direct.

---

*Préparé avec l'aide d'une IA (Claude) : recherche des jeux de données et rédaction de cette fiche. Les colonnes, les valeurs de `delta`, les dates et la couverture ont été vérifiées directement via les API et fichiers sources. À déclarer dans le journal IA.*
