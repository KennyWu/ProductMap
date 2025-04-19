import "./css/style.css";
import "@fortawesome/fontawesome-free/js/all.js";
import "@fontsource/source-sans-pro";
import Map from "ol/Map.js";
import View from "ol/View.js";
import Overlay from "ol/Overlay";
import { defaults as defaultControls } from "ol/control.js";
import Attribution from "ol/control/Attribution.js";
import MousePosition from "ol/control/MousePosition.js";
import FullScreen from "ol/control/FullScreen.js";
import Download from "./Download.js";
import * as Constants from "./Constants.js";
import * as ProductLayers from "./ProductLayers.js";
import { createXYDirString, fillStringTemplate } from "./util.js";
import { initAnimationService } from "./Animation.js";
import OLCesium from "olcs";
import { renderLegend } from "./Layers.js";
import "./Draggable.js";

const currProj = "ESPG:4326";
const extent = [-180, -125, 180, 125];
const container = document.getElementById("popup");
const content = document.getElementById("popup-content");
const closer = document.getElementById("popup-closer");
const view = new View({
  projection: "EPSG:4326",
  extent: extent,
  center: [0, 0],
  zoom: 2,
  maxZoom: 8,
});
const overlay = new Overlay({
  element: container,
  autoPan: {
    animation: {
      duration: 250,
    },
  },
});
let map = null;

let newAttribution = new Attribution({
  className: "ol-attribution",
  collapsible: false,
  collapsed: false,
});

function main() {
  map = new Map({
    overlays: [overlay],
    controls: init_controls(),
    target: "map",
    view: view,
  });
  map.setLayers(ProductLayers.initLayers());
  renderLegend(map.getLayers().getArray());
  const ol3d = new OLCesium({ map: map });
  ProductLayers.regLayerChanges(map);
  changeContinentSelectMode();
  registerMapHandlers();
  registerViewHandlers(map, ol3d);
  initAnimationService(map);
}

function init_controls() {
  let control = defaultControls({ attribution: false });
  control.push(
    new FullScreen({
      source: document.getElementById("screen"),
    })
  );
  control.push(new Download());
  control.push(
    new MousePosition({
      coordinateFormat: createXYDirString(4),
      projection: currProj,
    })
  );
  return control;
}

function registerMapHandlers() {
  map.on("singleclick", function (evt) {
    let feature = map.forEachFeatureAtPixel(
      evt.pixel,
      function (feature, layer) {
        return feature;
      }
    );

    if (feature) {
      //update for dynamic showing - use feature.getKeys() to get names
      // dynamically show the stuf next time
      let information = '<p class="pop-info">';
      Object.keys(feature.getProperties()).forEach((key, i) => {
        if (!Constants.NON_PROPERTIES.has(key)) {
          information += `<p class="pop-info"><strong>${key}</strong>: ${feature.get(
            key
          )}</p>`;
        }
      });
      information += "</p>";
      content.innerHTML = information;
      overlay.setPosition(evt.coordinate);
    } else {
      overlay.setPosition(undefined);
    }
  });

  closer.onclick = function () {
    overlay.setPosition(undefined);
    closer.blur();
    return false;
  };
}

function changeContinentSelectMode() {
  document.querySelector(Constants.SELECTORS.CONTINENTS).regularSelectMode();
}

function registerViewHandlers(map, ol3d) {
  document
    .querySelector(Constants.SELECTORS.CONTINENTS)
    .addEventListener("change", (event) => {
      let view = map.getView();
      let newCenter = Constants.CONTINENT_VIEWS[event.target.getValue()].center;
      let newZoom = Constants.CONTINENT_VIEWS[event.target.getValue()].zoom;
      view.setCenter(newCenter);
      view.setZoom(newZoom);
    });

  document
    .querySelector(Constants.SELECTORS.VIEW_3D)
    .addEventListener("change", (event) => {
      let view = map.getView();
      if (event.target.checked && view.getZoom() < 2.7) {
        view.setZoom(view.getZoom() * 1.6);
      } else if (!event.target.checked) {
        view.setZoom(view.getZoom() * (1 / 1.6));
      }
      ol3d.setEnabled(event.target.checked);
    });
  const e = new Event("change");
  document.querySelector(Constants.SELECTORS.VIEW_3D).dispatchEvent(e);
}

window.onload = main;
