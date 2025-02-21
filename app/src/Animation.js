import * as Constants from "./Constants.js";
import { fillStringTemplate } from "./util";
import ImageLayer from "ol/layer/Image.js";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import Static from "ol/source/ImageStatic.js";
import { Fill, Stroke, Style } from "ol/style.js";
import { getLayersAtDate, registerLayerHandlers } from "./ProductLayers.js";
import { Control, defaults as defaultControls } from "ol/control.js";
import DateCustom from "./CustomComponents/DateCustom.js";

class AnimationService {
  static #ANIMATION_MAP_LAYER = 2;
  static #DATETEMPLATE =
    " <div class='ani-date-display'> Now Showing {date} </div>";
  #mapLayers;
  #dateIndex;
  #fromDate;
  #toDate;
  #enable;
  #animationSpeed;
  #animationLayer;
  #animationDateRange;
  #animationProductLayerSection;
  #allDates;
  #intervalID;
  #aniProdLayers;

  constructor(map) {
    this.#animationLayer = document.querySelector(
      Constants.SELECTORS.ANIMATION_LAYER
    );
    this.#fromDate = this.#animationLayer.querySelector(
      Constants.SELECTORS.ANIMATE_FROM
    );
    this.#toDate = this.#animationLayer.querySelector(
      Constants.SELECTORS.ANIMATE_TO
    );
    this.#enable = this.#animationLayer.querySelector(
      Constants.SELECTORS.ENABLE_ANIMATE
    );
    this.#animationDateRange = this.#animationLayer.querySelector(
      Constants.SELECTORS.ANIMATION_DATE_RANGE
    );
    this.#animationSpeed = this.#animationLayer.querySelector(
      Constants.SELECTORS.ANIMATE_SPEED
    );
    this.#animationProductLayerSection = this.#animationLayer.querySelector(
      Constants.SELECTORS.ANIMATION_PRODUCT_LAYER
    );
    this.#aniProdLayers = [];
    Constants.ANIMATE_PRODUCT_LAYER_ENABLE.forEach((id, index) => {
      this.#aniProdLayers.push(this.#animationLayer.querySelector(id));
      //init options to off, we don't want to cache anything
      this.#aniProdLayers[index].checked = false;
    });
    this.#allDates = [];
    this.#dateIndex = 0;
    this.#mapLayers = map.getLayers();

    this.#animationDateRange.addEventListener(
      "change",
      this.#updateDates.bind(this)
    );
    this.#animationProductLayerSection.addEventListener(
      "change",
      function () {
        this.#updateVisbility();
      }.bind(this)
    );
    this.#animationDateRange.dispatchEvent(new Event("change"));
    this.#updateProductAnimationLayer();
    registerLayerHandlers(
      this.#mapLayers.getArray(),
      AnimationService.#ANIMATION_MAP_LAYER,
      false
    );
    this.#registerAnimationHandler();

    //TODO - add event listener to enable and animation speed
    // enable turns on the current layer to show and starts incrementing index
    //Set create new url with the month and year showing
  }

  #updateVisbility() {
    this.#aniProdLayers.forEach((ele, index) => {
      this.#mapLayers
        .getArray()
        [AnimationService.#ANIMATION_MAP_LAYER + index].setVisible(
          this.#enable.checked && ele.checked
        );
    });
  }

  #registerAnimationHandler() {
    this.#enable.addEventListener(
      "change",
      function (event) {
        this.#clearAnimate();
        this.#updateProductAnimationLayer();
        if (event.target.checked) {
          this.#startAnimate(this.#animationSpeed.value);
        }
      }.bind(this)
    );
    this.#animationSpeed.addEventListener(
      "change",
      function (event) {
        this.#dateIndex = 0;
        this.#enable.dispatchEvent(new Event("change"));
      }.bind(this)
    );
  }

  #startAnimate(time) {
    this.#updateVisbility();
    this.#intervalID = setInterval(
      function () {
        console.log(this.#mapLayers.getArray()[4].getSource().url_);
        this.#dateIndex =
          this.#dateIndex + 1 == this.#allDates.length
            ? 0
            : this.#dateIndex + 1;
        this.#updateProductAnimationLayer();
      }.bind(this),
      time
    );
  }

  #clearAnimate() {
    this.#updateVisbility();
    this.#dateIndex = 0;
    clearInterval(this.#intervalID);
  }

  #updateDates(event) {
    event.stopPropagation();
    this.#fromDate.setMaxDate(this.#toDate.getDate());
    this.#toDate.setMinDate(this.#fromDate.getDate());
    this.#allDates = this.#constructDateArray();
    this.#updateProductAnimationLayer();
  }

  /**
   * Reset the date index to 0
   * @returns the new date array consisting of range from and to in yyyymm format
   */
  #constructDateArray() {
    this.#dateIndex = 0;
    let dates = [];
    let toDate = this.#toDate.getDate();
    let currDate = this.#fromDate.getDate();
    toDate.setHours(0, 0, 0, 0);
    currDate.setHours(0, 0, 0, 0);
    while (currDate <= toDate) {
      let monthString =
        Constants.MONTHMAP[Constants.monthNames[currDate.getMonth()]];
      let yearString = currDate.getFullYear();
      let dayString = DateCustom.convertToDayString(currDate.getDate());
      dates.push({
        monthString: monthString,
        yearString: yearString,
        dayString: dayString,
      });
      currDate.setDate(currDate.getDate() + 1);
    }
    console.log(dates);
    return dates;
  }

  #updateProductAnimationLayer() {
    let yyyymmdd = this.#allDates[this.#dateIndex];
    let layers = getLayersAtDate(yyyymmdd);
    layers.forEach((layer, index) => {
      this.#mapLayers.setAt(
        AnimationService.#ANIMATION_MAP_LAYER + index,
        layer
      );
    });
    let layerIndexToUpdate = this.#getTopLayerIndex();
    let date =
      this.#allDates[this.#dateIndex].monthString +
      "/" +
      this.#allDates[this.#dateIndex].dayString +
      "/" +
      this.#allDates[this.#dateIndex].yearString;
    let displayHTML = fillStringTemplate(AnimationService.#DATETEMPLATE, {
      date: date,
    });
    let currentAttrFunc = layers[layerIndexToUpdate]
      .getSource()
      .getAttributions();
    let attribution = "";
    if (currentAttrFunc != null) {
      attribution += currentAttrFunc() + displayHTML;
    } else {
      attribution += displayHTML;
    }
    layers[layerIndexToUpdate].getSource().setAttributions(attribution);
    this.#updateVisbility();
  }
  /**
   * We get the highest layer that is currently showing
   */
  #getTopLayerIndex() {
    let currIndex = 0;
    this.#aniProdLayers.forEach((enable, index) => {
      if (enable.checked) {
        currIndex = index;
      }
    });

    return currIndex;
  }
}

export function initAnimationService(currMap) {
  return new AnimationService(currMap);
}
