import SelectCustom from "./SelectCustom";
import * as Constants from "../Constants.js";

let date = new Date();

class DateCustom extends HTMLElement {
  #monthSelector;
  #yearSelector;
  #maxMonth;
  #maxYear;
  #minMonth;
  #minYear;

  constructor() {
    super();
    this.innerHTML = `
        <style>
            .date-custom {
                display: flex;
                justify-content: center;
            }

            .date-custom select,
            .date-custom input {
                font-size: 12px;
            }

            
            .year-custom {
                min-width: 2rem;
                max-width: 3.1rem;
                min-height: 0.5rem;
            }
            
        </style>
        <div class='date-custom'> 
        <custom-selector></custom-selector>
        <input class='year-custom' type="number" step="1"/>
        </div>
        `;

    this.#monthSelector = this.querySelector("custom-selector");
    this.#yearSelector = this.querySelector("input");
    this.#maxMonth = new Date().getMonth();
    this.#maxYear = new Date().getFullYear();
    this.#maxMonth = this.#maxMonth == 0 ? 11 : this.#maxMonth - 1;
    if (
      this.#maxMonth == 11 &&
      this.#yearSelector.value == this.#yearSelector.max
    ) {
      this.#maxYear = this.#maxYear - 1;
    }
    this.#minYear = Constants.MIN_YEAR_LOOKBACK;
    this.#minMonth = 0;
    this.#initilizeOptions();
  }

  #initilizeOptions() {
    let minYear = Constants.MIN_YEAR_LOOKBACK;
    this.#yearSelector.min = minYear;
    this.#yearSelector.max = this.#maxYear;
    this.#yearSelector.value = this.#maxYear;
    this.#yearSelector.addEventListener("change", this.#refillMonth.bind(this));
    this.#yearSelector.dispatchEvent(new Event("change"));
    //allows months to loop, say January 2024 we hit left and go to Decemeber 2023
    this.#monthSelector.addEventListener(
      "change",
      function (event) {
        this.#enableAndDisableSelectors();
      }.bind(this)
    );
    this.#monthSelector.addEventListener(
      Constants.LOOP_BEGIN_END_EVENT,
      this.#subtractYear.bind(this)
    );
    this.#monthSelector.addEventListener(
      Constants.LOOP_END_BEGIN_EVENT,
      this.#addYear.bind(this)
    );
  }

  #subtractYear(event) {
    this.#yearSelector.value = Number(this.#yearSelector.value) - 1;
    this.#refillMonth(event);
  }

  #addYear(event) {
    this.#yearSelector.value = Number(this.#yearSelector.value) + 1;
    this.#refillMonth(event);
  }

  #refillMonth(event) {
    let monthIndex = this.#maxMonth;
    let prevVal = this.#monthSelector.getValue();

    if (this.#yearSelector.value == this.#yearSelector.max) {
      let months = Constants.monthNames.filter((value, i) => i <= monthIndex);
      this.#monthSelector.addOptions(months);
    } else {
      this.#monthSelector.addOptions(Constants.monthNames);
    }
    //Hard code for now, i dont have data for april
    //Move to somewhere in the if blocks

    if (
      prevVal == "" ||
      (Number(Constants.MONTHMAP[prevVal]) - 1 > monthIndex &&
        this.#yearSelector.value == this.#yearSelector.max)
    ) {
      this.#monthSelector.setValue(Constants.monthNames[monthIndex]);
    } else if (event.type == Constants.LOOP_BEGIN_END_EVENT) {
      this.#monthSelector.setValue(
        Constants.monthNames[Constants.monthNames.length - 1]
      );
    } else {
      this.#monthSelector.setValue(prevVal);
    }

    //Check if we hit the rightmost month of the current year
    //Dont allow any further movement right
    //Same idea with left
    this.#enableAndDisableSelectors();
  }

  //Check if we hit the rightmost month of the current year
  //Dont allow any further movement right
  #enableAndDisableSelectors() {
    if (
      this.#monthSelector.size - 1 == this.#monthSelector.getIndex() &&
      this.#yearSelector.value == this.#maxYear
    ) {
      this.#monthSelector.disableRight();
    } else {
      this.#monthSelector.enableRight();
    }

    if (
      this.#monthSelector.getIndex() == this.#minMonth &&
      this.#yearSelector.value == this.#yearSelector.min
    ) {
      this.#monthSelector.disableLeft();
    } else {
      this.#monthSelector.enableLeft();
    }
  }

  setMaxDate(month, year) {
    this.#maxMonth = month;
    this.#maxYear = year;
    this.#yearSelector.max = year;
    if (this.#isOverMaxDate()) {
      this.#monthSelector.setValue(Constants.monthNames[month]);
      this.#yearSelector.value = this.#yearSelector.max;
    }
    this.#yearSelector.dispatchEvent(new Event("change"));
  }

  #isOverMaxDate() {
    if (
      (this.#monthSelector.getIndex() > this.#maxMonth &&
        this.#yearSelector.value == this.#maxYear) ||
      this.#yearSelector.value > this.#maxYear
    ) {
      return true;
    }

    return false;
  }

  setMinDate(month, year) {
    this.#minMonth = month;
    this.#minYear = year;
    this.#yearSelector.min = year;
    if (this.#isUnderMinDate()) {
      this.#monthSelector.setValue(Constants.monthNames[month]);
      this.#yearSelector.value = this.#yearSelector.min;
    }
    this.#yearSelector.dispatchEvent(new Event("change"));
  }

  #isUnderMinDate() {
    if (
      (this.#monthSelector.getIndex() < this.#minMonth &&
        this.#yearSelector.value == this.#minYear) ||
      this.#yearSelector.value < this.#minYear
    ) {
      return true;
    }

    return false;
  }

  getYear() {
    return Number(this.#yearSelector.value);
  }

  getMonth() {
    return this.#monthSelector.getValue();
  }

  getMonthIndex() {
    return this.#monthSelector.getIndex();
  }
}

customElements.define("custom-date", DateCustom);
export default DateCustom;
