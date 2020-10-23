import "../styles/main.sass";
import "./favicons";

import json from "../assets/atomevolution.json";

import ChemTAS from "./ChemTAS";

// onload
document.addEventListener("DOMContentLoaded", function (event) {
    var chemTAS = new ChemTAS("none", "atom-evolution", json);
    chemTAS.init();
});
