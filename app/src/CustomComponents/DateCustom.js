import SelectCustom from "./SelectCustom";
import * as Constants from "../Constants.js";

let date = new Date();

class DateCustom extends HTMLElement {
  static #MONTHSELECT = ".month-select";
  static #DAYSELECT = ".day-select";
  static #YEARSELECT = ".year-select";
  #currDate;
  #monthSelector;
  #yearSelector;
  #daySelector;
  #maxDate;
  #minDate;

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
        <table>
          <tr>
            <td><custom-selector class='month-select' mode='top-down'></custom-selector></td>
            <td><custom-selector class='day-select' mode='top-down'></custom-selector></td>
            <td><custom-selector class='year-select' mode='top-down'></custom-selector></td>
          </tr>
        </table> 
        </div>
        `;

    this.#monthSelector = this.querySelector(DateCustom.#MONTHSELECT);
    this.#daySelector = this.querySelector(DateCustom.#DAYSELECT);
    this.#yearSelector = this.querySelector(DateCustom.#YEARSELECT);
    this.#currDate = new Date();
    this.#currDate.setDate(this.#currDate.getDate() - 1);
    this.#maxDate = new Date(
      this.#currDate.getFullYear(),
      this.#currDate.getMonth(),
      this.#currDate.getDate()
    );

    this.#minDate = new Date(Constants.MIN_YEAR_LOOKBACK, 0, 1);
    this.#initilizeOptions();
  }

  #initilizeOptions() {
    this.#monthSelector.addOptions(Constants.monthNames);
    this.#yearSelector.addOptions(Constants.VALID_YEARS_RANGE);
    this.#daySelector.addOptions(Constants.VALID_DAY_RANGE);
    this.#setDate(this.#currDate);
    this.#monthSelector.addEventListener(
      Constants.FORWARD,
      this.addMonth.bind(this)
    );
    this.#monthSelector.addEventListener(
      Constants.BACKWARD,
      this.subtractMonth.bind(this)
    );

    this.#yearSelector.addEventListener(
      Constants.FORWARD,
      this.addYear.bind(this)
    );
    this.#yearSelector.addEventListener(
      Constants.BACKWARD,
      this.subtractYear.bind(this)
    );

    this.#daySelector.addEventListener(
      Constants.FORWARD,
      this.addDay.bind(this)
    );
    this.#daySelector.addEventListener(
      Constants.BACKWARD,
      this.subtractDay.bind(this)
    );
  }

  #setDate(date) {
    this.#currDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    this.#monthSelector.setValue(Constants.monthNames[date.getMonth()]);
    this.#daySelector.setValue(date.getDate());
    this.#yearSelector.setValue(date.getFullYear());
    if (this.#assertDateBounds()) {
      this.#enableAndDisableSelectors();
      this.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }

  #assertDateBounds() {
    if (this.#isOverMaxDate()) {
      this.#setDate(this.#maxDate);
      return false;
    } else if (this.#isUnderMinDate()) {
      this.#setDate(this.#minDate);
      return false;
    }

    return true;
  }

  addMonth() {
    let currDay = this.#currDate.getDate();
    this.#currDate.setMonth(this.#currDate.getMonth() + 1);
    this.#currDate.setDate(
      currDay != this.#currDate.getDate()
        ? new Date(
            this.#currDate.getFullYear(),
            this.#currDate.getMonth(),
            0
          ).getDate()
        : currDay
    );
    console.log(this.#currDate);
    this.#setDate(this.#currDate);
  }

  subtractMonth() {
    let currDay = this.#currDate.getDate();
    this.#currDate.setMonth(this.#currDate.getMonth() - 1);
    this.#currDate.setDate(
      currDay != this.#currDate.getDate()
        ? new Date(
            this.#currDate.getFullYear(),
            this.#currDate.getMonth(),
            0
          ).getDate()
        : currDay
    );
    this.#setDate(this.#currDate);
  }

  addYear() {
    let currDay = this.#currDate.getDate();
    this.#currDate.setFullYear(this.#currDate.getFullYear() + 1);
    this.#currDate.setDate(
      currDay != this.#currDate.getDate()
        ? new Date(
            this.#currDate.getFullYear(),
            this.#currDate.getMonth(),
            0
          ).getDate()
        : currDay
    );
    this.#setDate(this.#currDate);
  }

  subtractYear() {
    let currDay = this.#currDate.getDate();
    this.#currDate.setFullYear(this.#currDate.getFullYear() - 1);
    this.#currDate.setDate(
      currDay != this.#currDate.getDate()
        ? new Date(
            this.#currDate.getFullYear(),
            this.#currDate.getMonth(),
            0
          ).getDate()
        : currDay
    );
    this.#setDate(this.#currDate);
  }

  addDay() {
    this.#currDate.setDate(this.#currDate.getDate() + 1);
    this.#setDate(this.#currDate);
  }

  subtractDay() {
    this.#currDate.setDate(this.#currDate.getDate() - 1);
    this.#setDate(this.#currDate);
  }

  //Check if we hit the rightmost month of the current year
  //Dont allow any further movement right
  #enableAndDisableSelectors() {
    this.#currDate.setHours(0, 0, 0, 0);
    this.#maxDate.setHours(0, 0, 0, 0);
    this.#minDate.setHours(0, 0, 0, 0);

    this.#enableDisableForwards();
    this.#enableDisableBackwards();
  }

  #enableDisableForwards() {
    let possibleDate = new Date(this.#currDate.getTime());
    possibleDate.setFullYear(this.#currDate.getFullYear() + 1);
    if (this.#isOverMaxDate(possibleDate)) {
      this.#yearSelector.disableForward();
    } else {
      this.#yearSelector.enableForward();
    }
    possibleDate = new Date(this.#currDate.getTime());
    possibleDate.setMonth(this.#currDate.getMonth() + 1);
    if (this.#isOverMaxDate(possibleDate)) {
      this.#monthSelector.disableForward();
    } else {
      this.#monthSelector.enableForward();
    }
    possibleDate = new Date(this.#currDate.getTime());
    possibleDate.setDate(this.#currDate.getDate() + 1);
    if (this.#isOverMaxDate(possibleDate)) {
      this.#daySelector.disableForward();
    } else {
      this.#daySelector.enableForward();
    }
  }

  #enableDisableBackwards() {
    let possibleDate = new Date(this.#currDate.getTime());
    possibleDate.setFullYear(this.#currDate.getFullYear() - 1);
    if (this.#isUnderMinDate(possibleDate)) {
      this.#yearSelector.disableBackward();
    } else {
      this.#yearSelector.enableBackward();
    }
    possibleDate = new Date(this.#currDate.getTime());
    possibleDate.setMonth(this.#currDate.getMonth() - 1);
    if (this.#isUnderMinDate(possibleDate)) {
      this.#monthSelector.disableBackward();
    } else {
      this.#monthSelector.enableBackward();
    }
    possibleDate = new Date(this.#currDate.getTime());
    possibleDate.setDate(this.#currDate.getDate() - 1);
    if (this.#isUnderMinDate(possibleDate)) {
      this.#daySelector.disableBackward();
    } else {
      this.#daySelector.enableBackward();
    }
  }

  setMaxDate(date) {
    this.#maxDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    this.#assertDateBounds();
    this.#enableAndDisableSelectors();
  }

  #isOverMaxDate(date = this.#currDate) {
    if (date > this.#maxDate) {
      return true;
    }

    return false;
  }

  setMinDate(date) {
    this.#minDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    this.#assertDateBounds();
    this.#enableAndDisableSelectors();
  }

  #isUnderMinDate(date = this.#currDate) {
    if (date < this.#minDate) {
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

  getDay() {
    return Number(this.#daySelector.getValue());
  }

  getDate() {
    return new Date(
      this.#currDate.getFullYear(),
      this.#currDate.getMonth(),
      this.#currDate.getDate()
    );
  }

  static convertToDayString(day) {
    if (day < 10) {
      return "0" + String(day);
    }

    return String(day);
  }
}

customElements.define("custom-date", DateCustom);
export default DateCustom;
