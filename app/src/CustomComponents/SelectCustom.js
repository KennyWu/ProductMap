import { none } from "ol/centerconstraint";
import { get } from "ol/proj";

class SelectCustom extends HTMLElement {
  #select;
  #left;
  #right;
  #size;

  constructor() {
    super();
    this.innerHTML = `
        <style>
            btn-select {
                font-size: 14px;
            }
            .btn-month {
                background-color: whitesmoke;
            }

            td {
              padding: 0px 0px 0px 0px;
            }
        </style>
        <table>
            <tr>
              <td><button type="button" class="btn btn-month btn-outline-secondary btn-sm btn-left">&lt;</button></td>
              <td><select disabled class="form-control form-control-sm btn-select"></select></td>
              <td><button type="button" class="btn btn-month btn-outline-secondary btn-sm btn-right">&gt;</button></td>
            </tr>
        </table>`;

    this.#select = this.querySelector("select");
    this.#left = this.querySelector(".btn-left");
    this.#right = this.querySelector(".btn-right");

    this.#select.addEventListener("change", (event) => {
      event.stopPropagation();
      this.dispatchEvent(new Event("change"));
    });
    this.#left.addEventListener("click", this.changeOption.bind(this));
    this.#right.addEventListener("click", this.changeOption.bind(this));
    this.#size = 0;
    // this.#select.value = currentOptions[0]
  }

  addOptions(currentOptions) {
    this.#size = 0;
    this.#select.innerHTML = "";
    currentOptions.forEach((x) => {
      let option = document.createElement("option");
      option.innerHTML = x;
      this.#select.appendChild(option);
      this.#size += 1;
    });
  }

  changeOption(event) {
    let target = event.target;
    let eventLoop = null;
    let step = 0;
    if (this.#left.className === target.className) {
      step = -1;
    } else if (this.#right.className === target.className) {
      step = 1;
    }

    let currIndex = this.#select.selectedIndex;
    currIndex += step;
    if (currIndex < 0) {
      currIndex = this.#select.options.length - 1;
      //Dispatch event that tells us loop occurs in what direction
      eventLoop = new CustomEvent("Loop-begin-end");
    } else if (currIndex >= this.#select.options.length) {
      currIndex = 0;
      //Dispatch event that tells us loop occurs in what direction
      eventLoop = new CustomEvent("Loop-end-begin");
    }

    this.#select.selectedIndex = currIndex;
    if (eventLoop != null) {
      this.dispatchEvent(eventLoop);
    }

    this.dispatchEvent(new Event("change", { bubbles: true }));
  }

  get size() {
    return this.#size;
  }

  getIndex() {
    return this.#select.selectedIndex;
  }

  setValue(value) {
    this.#select.value = value;
  }

  getValue() {
    return this.#select.value;
  }

  disableRight() {
    this.#right.disabled = true;
  }

  enableRight() {
    this.#right.disabled = false;
  }

  disableLeft() {
    this.#left.disabled = true;
  }

  enableLeft() {
    this.#left.disabled = false;
  }

  regularSelectMode() {
    this.#left.style.display = "none";
    this.#right.style.display = "none";
    this.#select.disabled = false;
  }

  buttonSelectMode() {
    this.#left.style.display = "block";
    this.#right.style.display = "block";
    this.#select.disabled = true;
  }
}

customElements.define("custom-selector", SelectCustom);
export default SelectCustom;
