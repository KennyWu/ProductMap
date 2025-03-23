import * as Constants from "./Constants.js";
import SelectCustom from "./CustomComponents/SelectCustom.js";
import DateCustom from "./CustomComponents/DateCustom.js";
//TODO intialize current date with months lookbook for current year
let date = new Date();
let currMonth = date.getMonth();
let currYear = date.getFullYear();

function main() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  let continents = document.querySelector("#continents");
  continents.addOptions(Constants.CONTINENTS);

  //Add day and night selectors
  document.querySelectorAll(Constants.SELECTORS.DAY_NIGHT).forEach((x) => {
    let optionday = document.createElement("option");
    optionday.innerHTML = "day";
    x.appendChild(optionday);
    let optionnight = document.createElement("option");
    optionnight.innerHTML = "night";
    x.appendChild(optionnight);
  });
  //Add anomaly options
  document
    .querySelectorAll(Constants.SELECTORS.PRODUCT_LAYER_TYPE)
    .forEach((x) => {
      Object.values(Constants.MAPPING).forEach(({ name, satellites }) => {
        if (
          (urlParams.has(Constants.URLPARAMETER) &&
            name === urlParams.get(Constants.URLPARAMETER)) ||
          !urlParams.has(Constants.URLPARAMETER)
        ) {
          let option = document.createElement("option");
          option.innerHTML = name;
          x.appendChild(option);
        }
      });
      x.addEventListener("change", displayDayNight);
      x.addEventListener("change", displaySat);
      let event = new Event("change");
      x.dispatchEvent(event);
    });
  document.querySelector(Constants.SELECTORS.ENABLE_ANIMATE).checked = false;
  document.querySelectorAll(Constants.SELECTORS.PRODUCT_LAYER).forEach((x) => {
    const visible = x.querySelector(Constants.SELECTORS.VISIBLE);
    const selectedEle = x.querySelector(Constants.SELECTORS.PRODUCT_LAYER_TYPE);
    Constants.DEFAULT_OPTION_PRODUCT.forEach(({ id, layer, show }) => {
      if (id.slice(1) === x.id) {
        visible.checked = show;
        selectedEle.value = layer;
        let event = new Event("change");
        selectedEle.dispatchEvent(event);
      }
    });
  });
}

function displaySat(event) {
  let anomalyObj = event.target;
  let parentNode = anomalyObj.parentNode;
  let satelliteObj = parentNode.querySelector(Constants.SELECTORS.SATELLITE);
  let { satellites } = Object.values(Constants.MAPPING).find(({ name }) => {
    return name === anomalyObj.value;
  });
  satelliteObj.innerHTML = "";
  satellites.forEach(({ display_name, var_name }) => {
    let element = document.createElement("option");
    element.innerHTML = display_name;
    satelliteObj.appendChild(element);
  });
  if (satellites.length === 1) {
    satelliteObj.style.display = "none";
  } else {
    satelliteObj.style.display = "block";
  }
}

function displayDayNight(event) {
  let anomalyObj = event.target;
  let parentNode = anomalyObj.parentNode;
  let daynightObj = parentNode.querySelector(Constants.SELECTORS.DAY_NIGHT);
  if (hasDayNightFeature(anomalyObj.value)) {
    daynightObj.style.display = "block";
  } else {
    daynightObj.style.display = "none";
  }
}

function hasDayNightFeature(value) {
  let { hasDayNight } = Object.values(Constants.MAPPING).find(({ name }) => {
    return name === value;
  });
  if (hasDayNight) {
    return true;
  }

  return false;
}

main();
