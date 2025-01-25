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

const currProj = "ESPG:4326";
const extent = [-180, -110, 180, 110];
const containerInfo = document.getElementById("popup");
const contentInfo = document.getElementById("popup-content");
const closerInfo = document.getElementById("popup-closer");
const containerPlt = document.getElementById("popup-barplt");
const contentPlt = document.getElementById("popup-content-barplt");
const closerPlt = document.getElementById("popup-closer-barplt");
closerPlt.onclick = () => {
  containerPlt.style.display = "none";
};

const view = new View({
  projection: "EPSG:4326",
  extent: extent,
  center: [0, 0],
  zoom: 2,
  maxZoom: 8,
});

const overlayInfo = new Overlay({
  element: containerInfo,
  autoPan: {
    animation: {
      duration: 250,
    },
  },
});
let map = null;

let newAttribution = new Attribution({
  collapsible: false,
  collapsed: false,
});

function main() {
  map = new Map({
    overlays: [overlayInfo],
    controls: init_controls(),
    target: "map",
    view: view,
  });
  map.setLayers(ProductLayers.initLayers());
  ProductLayers.regLayerChanges(map);
  changeContinentSelectMode();
  registerMapHandlers();
  ProductLayers.registerOverlayHandlers(onDisplayPlt);
  registerViewHandlers(map);
  initAnimationService(map);
}

function init_controls() {
  let control = defaultControls();
  control.pop();
  control.push(newAttribution);
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

function onDisplayPlt(posUrl, negUrl) {
  contentPlt.innerHTML = `<img class="plt-img" src="${posUrl}"></img> <img class="plt-img" src="${negUrl}"></img>`;
  containerPlt.style.display = "block";
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
      let information = '<p class="pop-info">';
      Object.keys(feature.getProperties()).forEach((key, i) => {
        if (!Constants.NON_PROPERTIES.has(key)) {
          information += `<p class="pop-info"><strong>${key}</strong>: ${feature.get(
            key
          )}</p>`;
        }
      });
      information += "</p>";
      contentInfo.innerHTML = information;
      overlayInfo.setPosition(evt.coordinate);
    } else {
      overlayInfo.setPosition(undefined);
    }
  });

  closerInfo.onclick = function () {
    overlayInfo.setPosition(undefined);
    closerInfo.blur();
    return false;
  };
}

function changeContinentSelectMode() {
  document.querySelector(Constants.SELECTORS.CONTINENTS).regularSelectMode();
}

function registerViewHandlers() {
  document
    .querySelector(Constants.SELECTORS.CONTINENTS)
    .addEventListener("change", (event) => {
      let view = map.getView();
      let newCenter = Constants.CONTINENT_VIEWS[event.target.getValue()].center;
      let newZoom = Constants.CONTINENT_VIEWS[event.target.getValue()].zoom;
      view.setCenter(newCenter);
      view.setZoom(newZoom);
    });
}

window.onload = main;
