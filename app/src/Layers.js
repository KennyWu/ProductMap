import { SELECTORS } from "./Constants";
import VectorSource from "ol/source/Vector.js";

export function renderLegend(layers) {
  let legend = document.querySelector(SELECTORS.LEGEND);
  let html = "<ul>";
  for (const layer of layers) {
    if (layer.getVisible()) {
      if (layer.getSource() instanceof VectorSource) {
        continue;
      }
      let attribution = layer.getSource().getAttributions()();
      html += `<li>${attribution}</li>`;
    }
  }
  html += "</ul>";
  legend.innerHTML = html;
}

function renderLayers(layers, index, show) {
  layers[index].setVisible(show);
  renderLegend(layers);
}

export default renderLayers;
