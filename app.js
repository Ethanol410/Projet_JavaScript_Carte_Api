/* =================== */
/* GET DATA */
/* =================== */

// Reference : https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/JSON
// Request : https://datarmor.cotesdarmor.fr/datasets/arbres-remarquables-des-cotes-d'armor/api-doc

/*
Call The API an return the remarquable trees of Côtes-d'Armor

/* Diff var ou let : let permet de déclarer des variables dont la portée est limitée à celle du bloc dans lequel elles sont déclarées. Le mot-clé var , quant à lui, permet de définir une variable globale ou locale à une fonction (sans distinction des blocs utilisés dans la fonction).let permet de déclarer des variables dont la portée est limitée à celle du bloc dans lequel elles sont déclarées. Le mot-clé var , quant à lui, permet de définir une variable globale ou locale à une fonction (sans distinction des blocs utilisés dans la fonction). */

/* La programmation asynchrone est une technique qui permet à un programme de démarrer une tâche à l'exécution potentiellement longue et, au lieu d'avoir à attendre la fin de la tâche, de pouvoir continuer à réagir aux autres évènements pendant l'exécution de cette tâche. */
async function getTrees() {
    const requestURL =
        "https://datarmor.cotesdarmor.fr/data-fair/api/v1/datasets/arbres-remarquables-des-cotes-d'armor/lines?size=1000&q=typearbre=remarquable"; // Fournir l'url
    const request = new Request(requestURL)

    const response = await fetch(request)
    const respJSON = await response.json() // Fournir la fonction jusque-là ?

    const trees = respJSON.results

    return trees
}

/* The trees from the API */
const TREES = await getTrees()

console.log(TREES)

console.log("apagnan");



let map;
let treeMarker;
let greenIcon;

async function afficherCarteEtArbres() {
    const trees = await getTrees();

    /* map initialisé */
    map = L.map('map').setView([48.6, -2.8], 9);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    /* un marker pour tous les arbres */
    treeMarker = L.layerGroup().addTo(map);

    /* icone marker */
    greenIcon = L.icon({
        iconUrl: '/images/marker.png',
    });

    trees.forEach(tree => {
        if (tree["_geopoint"]) {
            /* constante geopoint */
            const geo = tree["_geopoint"].split(',');
            /* constante  latitude */
            const lat = parseFloat(geo[0]);
            /* constante longitude */
            const lng = parseFloat(geo[1]);

            /* constante du marjer avec la position et l'icone */
            const marker = L.marker([lat, lng], { icon: greenIcon });

            /* données de la pop-up */
            const popupContent =
                /* Si tree.Essence existe (c'est-à-dire si elle n'est pas null ou undefined), alors l'expression retourne tree.Essence. Sinon, elle retourne "Information non disponible" */
                "<h3>" + (tree.Essence ? tree.Essence : "Information non disponible") + "</h3>" +
                "<p>" + (tree.Lieudit ? "Lieu-dit: " + tree.Lieudit : "Lieu-dit: Information non disponible") + "</p>" +
                "<p>" + (tree.dimensionenvergure ? "Envergure: " + tree.dimensionenvergure + " m" : "Envergure: Information non disponible") + "</p>" +
                "<p>" + (tree.Dimensioncirconference ? "Circonférence: " + tree.Dimensioncirconference + " m" : "Circonférence: Information non disponible") + "</p>";

            /* permet de lier le pop-up au marker */
            marker.bindPopup(popupContent);

            /* ajoute un event au click pour utiliser la fonction */
            marker.addEventListener("click", (e) => {
                afficherDetailsArbre(tree);
            });

            treeMarker.addLayer(marker);
        } else {
            console.log("Pas de geopoint pour cet arbre");
        }
    });
}

function afficherDetailsArbre(tree) {
    const focus = document.querySelector(".tree-focus");

    const treeEssence = document.createElement("h3");
    treeEssence.innerText = tree.Essence;

    const treeCommune = document.createElement("h4");
    treeCommune.innerText = "à " + tree.Commune;

    const treeEnvergure = document.createElement("p");

    if (tree.dimensionenvergure) {
        treeEnvergure.innerText = "Envergure: " + tree.dimensionenvergure + " m";
    } else {
        console.log("Pas de dimension envergure pour cet arbre");
        treeEnvergure.remove();
        /* si tree.dimensionenvergure ne dispose pas d'envergure alors cela n'affiche pas cette donnée */
    }

    const treeCirconference = document.createElement("p");

    if (tree.Dimensioncirconference
    ) {
        treeCirconference.innerText = "Circonférence: " + tree.Dimensioncirconference + " m";
    } else {
        console.log("Pas de dimension pour la circonférence de cet arbre");
        treeCirconference.remove();
        /* si tree.Dimensioncirconferece ne dispose pas de circonférence alors cela n'affiche pas cette donnée */
    }

    const treeLieudit = document.createElement("p");
    /* trim -> permet de supprimer les blancs unitiles */
    if (tree.Lieudit && tree.Lieudit.trim() !== "") {
        treeLieudit.innerText = "Dans le lieu-dit : " + tree.Lieudit;
    } else {
        console.log("Pas de lieu-dit pour cet arbre");
        treeLieudit.remove();
        /* si tree.Lieudit ne dispose pas de LieuDit alors cela n'affiche pas cette donnée */
    }

    const treeCodeCommune = document.createElement("p");

    if (tree.codeinseecommune
        && tree.codeinseecommune
            .trim() !== "") {
        treeCodeCommune.innerText = "Code Commune: " + tree.codeinseecommune
            ;
    } else {
        console.log("Le code commune est  manquant pour l'arbre.");
        treeCodeCommune.remove();
        /* si tree.codeinseecomune ne dispose pas de code de commune alors cela n'affiche pas cette donnée */
    }

    focus.innerHTML = "";
    focus.append(treeEssence, treeCommune, treeEnvergure, treeCirconference, treeLieudit, treeCodeCommune);
}

afficherCarteEtArbres();

/* fonction permettant de récupérer les essences pour effectuer le tri après */
function getAllUniqueEssences(trees) {
    const uniqueEssences = new Set();

    trees.forEach(tree => {
        uniqueEssences.add(tree.Essence);
    });

    return Array.from(uniqueEssences);
}
/* Fonction pour créer les types d'essence en HTML */
function createEssenceOptions(Essence) {
    const selectElement = document.getElementById('filtre_essence');

    Essence.forEach(Essence => {
        const optionElement = document.createElement('option');

        optionElement.value = Essence;
        optionElement.textContent = Essence;

        selectElement.appendChild(optionElement);
    });
}



const allEssences = getAllUniqueEssences(TREES);
createEssenceOptions(allEssences);

/* event lorsque je selectionne un filtre à essence */
document.getElementById('filtre_essence').addEventListener('change', (event) => {
    const selectedEssence = event.target.value;

    /* filtre l'array TREES  sur la propriété Essence */
    const filteredTrees = TREES.filter(tree => {
        if (!selectedEssence) {
            return true;
        }
        return tree.Essence.toLowerCase() === selectedEssence.toLowerCase();
    });

    /* enlève tous les markers */
    treeMarker.clearLayers();

    /* ajoute un marker selon les filtres */
    filteredTrees.forEach(tree => {
        if (tree["_geopoint"]) {
            const geo = tree["_geopoint"].split(',');
            const lat = parseFloat(geo[0]);
            const lng = parseFloat(geo[1]);

            const marker = L.marker([lat, lng], { icon: greenIcon });

            const popupContent =
                "<h3>" + (tree.Essence ? tree.Essence : "Information non disponible") + "</h3>" +
                "<p>" + (tree.Lieudit ? "Lieu-dit: " + tree.Lieudit : "Lieu-dit: Information non disponible") + "</p>" +
                "<p>" + (tree.dimensionenvergure ? "Envergure: " + tree.dimensionenvergure + " m" : "Envergure: Information non disponible") + "</p>" +
                "<p>" + (tree.Dimensioncirconference ? "Circonférence: " + tree.Dimensioncirconference + " m" : "Circonférence: Information non disponible") + "</p>";

            marker.bindPopup(popupContent);

            marker.addEventListener("click", (e) => {
                afficherDetailsArbre(tree);
            });

            treeMarker.addLayer(marker);
        } else {
            console.log("Pas de geopoint pour cet arbre");
        }
    });
});

/* fleche navigation */

const flecheGauche = document.querySelector(".fleche_left")
const flecheDroite = document.querySelector(".fleche_right")

/* index pour se retrouver (dsl j'explique sûrement mal) */
let currentIndex = 0;

/* ajoute un event lorsque je clique sur la flèche gauche */
flecheGauche.addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + TREES.length) % TREES.length;
    afficherArbre(currentIndex);
    /* appel de la fonction afficherArbre avec donc l'index permettant de se retrouver */
});

/* ajoute un event lorsque je clique sur la flèche droite */
flecheDroite.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % TREES.length;
    afficherArbre(currentIndex);
    /* appel de la fonction afficherArbre avec donc l'index permettant de se retrouver */
});

function afficherArbre(index) {
    const tree = TREES[index];
    /* fonction afficherDetailAbre */
    afficherDetailsArbre(tree);
    /* constante du marker  contenant les markers des arbres */
    const marker = treeMarker.getLayers()[index];
    /* ouvre la pop-up du marker */
    marker.openPopup();
}

afficherDetailsArbre(TREES[1])
marker.openPopup(TREES[1]);