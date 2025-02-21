import { none } from "ol/centerconstraint";
import { get } from "ol/proj";
import * as Constants from "../Constants";

class SelectCustom extends HTMLElement {
  #select;
  #back;
  #forward;
  #size;

  static get observedAttributes() {
    return [`mode`];
  }

  constructor() {
    super();
    let mode = this.getAttribute("mode") || "left-right";
    if (mode === "left-right") {
      this.innerHTML = `
        <style>
             @media (min-width: 320px) {
              .btn-select {
                font-size: 0.6rem;
              }
            }

            @media (min-width: 768px) {
              .btn-select {
                font-size: 0.6rem;
              }
            }

            @media (min-width: 992px) {
              .btn-select {
                font-size: 0.8rem;
              }
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
              <td><button type="button" class="btn btn-month btn-outline-secondary btn-sm btn-back">&lt;</button></td>
              <td><select disabled class="form-control form-control-sm btn-select"></select></td>
              <td><button type="button" class="btn btn-month btn-outline-secondary btn-sm btn-forward">&gt;</button></td>
            </tr>
        </table>`;
    }

    if (mode === "top-down") {
      this.innerHTML = `
        <style>
            @media (min-width: 320px) {
              .btn-select {
                font-size: 0.6rem;
              }
      
            }

            @media (min-width: 768px) {
              .btn-select {
                font-size: 0.6rem;
              }
             
            }

            @media (min-width: 992px) {
              .btn-select {
                font-size: 0.8rem;
              }
        
            }

          
            custom-selector button {
              all: initial;
              transition: border-color 0.3s ease;
            }


            custom-selector button:disabled {
              border-top-color: gray;
              border-bottom-color: gray;
            }

            custom-selector .btn-back {
                width: 0; 
                height: 0; 
                border-left: 1rem solid transparent;
                border-right: 1rem solid transparent; 
                border-top: 1rem solid rgb(54, 69, 79);  
            }

            custom-selector .btn-forward {
                width: 0; 
                height: 0; 
                border-left: 1rem solid transparent;
                border-right: 1rem solid transparent; 
                border-bottom: 1rem solid rgb(54, 69, 79);  
            }

            custom-selector td {
              display: flex;
              justify-content: center;
              padding: 0px 0px 0px 0px;
              margin: 1px;
            }
        </style>
        <table>
            <tr>
              <td><button type="button" class="btn-forward"></button></td>
            </tr>
            <tr>
              <td><select disabled class="form-control form-control-sm btn-select"></select></td>
            </tr>
            <tr>
              <td><button class="btn-back"></button></td>
            </tr>
        </table>`;
    }
    this.#select = this.querySelector("select");
    this.#back = this.querySelector(".btn-back");
    this.#forward = this.querySelector(".btn-forward");

    this.#select.addEventListener("change", (event) => {
      event.stopPropagation();
      this.dispatchEvent(new Event("change"));
    });
    this.#back.addEventListener("click", this.changeOption.bind(this));
    this.#forward.addEventListener("click", this.changeOption.bind(this));
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
    if (this.#back.className === target.className) {
      step = -1;
    } else if (this.#forward.className === target.className) {
      step = 1;
    }

    let currIndex = this.#select.selectedIndex;
    currIndex += step;
    if (currIndex < 0) {
      currIndex = this.#select.options.length - 1;
    } else if (currIndex >= this.#select.options.length) {
      currIndex = 0;
    }

    this.#select.selectedIndex = currIndex;
    if (step == 1) {
      this.dispatchEvent(new CustomEvent(Constants.FORWARD));
    } else {
      this.dispatchEvent(new CustomEvent(Constants.BACKWARD));
    }
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

  disableForward() {
    this.#forward.disabled = true;
  }

  enableForward() {
    this.#forward.disabled = false;
  }

  disableBackward() {
    this.#back.disabled = true;
  }

  enableBackward() {
    this.#back.disabled = false;
  }

  regularSelectMode() {
    this.#back.style.display = "none";
    this.#forward.style.display = "none";
    this.#select.disabled = false;
  }

  buttonSelectMode() {
    this.#back.style.display = "block";
    this.#forward.style.display = "block";
    this.#select.disabled = true;
  }
}

customElements.define("custom-selector", SelectCustom);
export default SelectCustom;
