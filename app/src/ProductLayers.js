import { Fill, Stroke, Style } from "ol/style.js";
import ImageLayer from "ol/layer/Image.js";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import Static from "ol/source/ImageStatic.js";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { fillStringTemplate } from "./util";
import * as Constants from "./Constants.js";
import DateCustom from "./CustomComponents/DateCustom.js";
import renderLayers from "./Layers.js";

const CURRPROJ = "ESPG:4326";
const EXTENT = [-180, -90, 180, 90];
const LST_BORDER_STYLE = function (feature) {
  return new Style({
    stroke: new Stroke({
      color: feature.get("border_color") == "red" ? "red" : "blue",
    }),
    fill: new Fill({
      color: "rgba(255,255, 255, 0.2)",
    }),
  });
};

const mapImage = new TileLayer({
  source: new OSM({
    attributions:
      "<div> &#169; " +
      '<a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> ' +
      "contributors. </div>",
  }),
  zIndex: 0,
});

export function getLayersAtDate(date) {
  let layers = [];
  Object.keys(Constants.PRODUCT_LAYERS_ID_MAPPING).forEach((id) => {
    let currLayer = loadLayers(id, date, false);
    layers.push(currLayer);
  });

  return layers;
}

export function initLayers(map) {
  let layers = [mapImage];
  Object.keys(Constants.PRODUCT_LAYERS_ID_MAPPING).forEach((id) => {
    let currLayer = loadLayers(id);
    layers.push(currLayer);
  });

  return layers;
}

export function registerLayerHandlers(layers, startIndex, enableVisible) {
  startIndex -= 1;
  Object.keys(Constants.PRODUCT_LAYERS_ID_MAPPING).forEach((pl) => {
    let visible = document.querySelector(
      pl + " " + Constants.SELECTORS.VISIBLE
    );
    let opacity = document.querySelector(
      pl + " " + Constants.SELECTORS.OPACITY
    );

    if (enableVisible) {
      visible.addEventListener("change", function (event) {
        event.stopPropagation();
        renderLayers(
          layers,
          startIndex + Constants.PRODUCT_LAYERS_ID_MAPPING[pl],
          event.target.checked
        );
      });
    }
    opacity.addEventListener("input", function (event) {
      event.stopPropagation();
      let currOpacity = Number(event.target.value) / Number(event.target.max);
      layers[startIndex + Constants.PRODUCT_LAYERS_ID_MAPPING[pl]].setOpacity(
        currOpacity
      );
    });
  });
}

export function regLayerChanges(map) {
  Object.keys(Constants.PRODUCT_LAYERS_ID_MAPPING).forEach((id, i) => {
    let productType = document.querySelector(
      id + " " + Constants.SELECTORS.PRODUCT_LAYER_TYPE
    );
    let dayNight = document.querySelector(
      id + " " + Constants.SELECTORS.DAY_NIGHT
    );

    let satellite = document.querySelector(
      id + " " + Constants.SELECTORS.SATELLITE
    );

    let changeLayers = function (event) {
      const show = document.querySelector(
        id + " " + Constants.SELECTORS.VISIBLE
      ).checked;
      let newLayer = loadLayers(id);
      map.getLayers().setAt(i + 1, newLayer);
      renderLayers(map.getLayers().getArray(), i + 1, show);
    };

    productType.addEventListener("change", changeLayers);
    dayNight.addEventListener("change", changeLayers);
    satellite.addEventListener("change", changeLayers);
  });

  let changeAllLayers = function (event) {
    let dateTime = document.querySelector(Constants.SELECTORS.DATE);
    let date = dateTime.getDate();
    let monthString = Constants.MONTHMAP[Constants.monthNames[date.getMonth()]];
    let yearString = String(date.getFullYear());
    let dayString = DateCustom.convertToDayString(date.getDate());
    let layers = getLayersAtDate({
      yearString: yearString,
      monthString: monthString,
      dayString: dayString,
    });
    layers.forEach((layer, i) => map.getLayers().setAt(i + 1, layer));
  };
  /*
  TODO fix the constants Selector - change the constants and replace 
  */
  let dateTime = document.querySelector(Constants.SELECTORS.DATE);
  dateTime.addEventListener("change", changeAllLayers);
  registerLayerHandlers(
    map.getLayers().getArray(),
    Constants.PRODUCT_LAYERS_ID_MAPPING[Constants.SELECTORS.PRODUCT_LAYER_ONE],
    true
  );
}

/**
 * Load and register event handlers to each layer of product layer 1, 2, and 3
 * @param {*} pl - the product layer id of the html element
 * @returns layer object
 */
export function loadLayers(pl, date = null, regEnable = true) {
  let plElements = {};
  Object.values(Constants.SELECTORS).forEach((selector) => {
    if (
      selector === Constants.SELECTORS.OPACITY ||
      selector === Constants.SELECTORS.PRODUCT_LAYER_TYPE ||
      selector === Constants.SELECTORS.VISIBLE ||
      selector === Constants.SELECTORS.DAY_NIGHT ||
      selector === Constants.SELECTORS.SATELLITE
    ) {
      plElements[selector] = document.querySelector(pl + " " + selector);
    } else {
      plElements[selector] = document.querySelector(selector);
    }
  });

  const [templateVars, layerVars] = getElementValues(plElements);
  if (date != null) {
    templateVars.yyyymmdd = date.yearString + date.monthString + date.dayString;
    templateVars.dd = date.dayString;
    templateVars.mm = date.monthString;
    templateVars.yyyy = date.yearString;
  }
  layerVars.zIndex = Constants.PRODUCT_LAYERS_ID_MAPPING[pl];
  let dataURL = fillStringTemplate(Constants.IMAGE_TEMPLATE_URL, templateVars);
  let legendURL = fillStringTemplate(
    Constants.LEGEND_TEMPLATE_URL,
    templateVars
  );
  console.log(dataURL);
  console.log(legendURL);
  let layer = loadLayer(templateVars.datatype, layerVars, dataURL, legendURL);
  return layer;
}

function loadLayer(dataType, layerVars, dataURL, legendURL) {
  let layer;
  if (dataType === Constants.DATATYPE.BORDERS) {
    layer = new VectorLayer({
      source: new VectorSource({
        url: dataURL,
        format: new GeoJSON(),
      }),
      style: LST_BORDER_STYLE,
      zIndex: layerVars.zIndex,
      visible: layerVars.visible,
      opacity: layerVars.opacity,
    });
  } else {
    layer = new ImageLayer({
      source: new Static({
        url: dataURL,
        projection: CURRPROJ,
        imageExtent: EXTENT,
        attributions: `<div> <img class='legend' src=${legendURL}> </div>`,
      }),
      zIndex: layerVars.zIndex,
      visible: layerVars.visible,
      opacity: layerVars.opacity,
    });
  }

  return layer;
}

function getElementValues(plElements) {
  let date = plElements[Constants.SELECTORS.DATE].getDate();
  let mm = Constants.MONTHMAP[Constants.monthNames[date.getMonth()]];
  let yyyy = String(date.getFullYear());
  let dd = DateCustom.convertToDayString(date.getDate());
  let day =
    plElements[Constants.SELECTORS.DAY_NIGHT].style.display !==
    Constants.DAYNIGHT.NONE
      ? plElements[Constants.SELECTORS.DAY_NIGHT].value
      : Constants.DAYNIGHT.NONE;
  let opacity =
    Number(plElements[Constants.SELECTORS.OPACITY].value) /
    Number(plElements[Constants.SELECTORS.OPACITY].max);
  let visible = plElements[Constants.SELECTORS.VISIBLE].checked;
  let dataType = plElements[
    Constants.SELECTORS.PRODUCT_LAYER_TYPE
  ].value.includes("Borders")
    ? Constants.DATATYPE.BORDERS
    : Constants.DATATYPE.IMAGE;
  let { variable } = Object.values(Constants.MAPPING).find(({ name }) => {
    return plElements[Constants.SELECTORS.PRODUCT_LAYER_TYPE].value === name;
  });
  let yyyymmdd = yyyy + mm + dd;
  let fileformat =
    dataType === Constants.DATATYPE.BORDERS
      ? Constants.FILEFORMAT.JSON
      : Constants.FILEFORMAT.PNG;
  let satellite = Object.values(Constants.SATELLITE).find((sat) => {
    return sat.display_name === plElements[Constants.SELECTORS.SATELLITE].value;
  });

  return [
    {
      dd: dd,
      mm: mm,
      yyyy: yyyy,
      yyyymmdd: yyyymmdd,
      "day[night]": day,
      satellite: satellite.var_name,
      datatype: dataType,
      variable: variable,
      fileformat: fileformat,
    },
    { opacity: opacity, visible: visible },
  ];
}

export function setAllVisibility(status) {
  let sources = document.querySelectorAll(Constants.SELECTORS.VISIBLE);
  console.log(sources);
  sources.forEach((x) => {
    x.checked = status;
    x.dispatchEvent(new Event("change"));
  });
}
